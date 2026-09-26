import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getBlob,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import {
  ACTIVE_LEVELS,
  ALLOWED_UPLOAD_TYPES,
  EDITIONS,
  MAX_UPLOAD_BYTES,
  type Edition,
  type FileKind,
  type Level,
} from "@/lib/constants";
import { db, storage } from "@/lib/firebase";
import type { Topic } from "@/lib/db/topics";

export interface MistakeBook {
  id: string;
  title: string;
  description: string;
  level: Level;
  topicId: string;
  topicName: string;
  edition: Edition;
  fileType: FileKind;
  fileName: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: { uid: string; email: string; name: string };
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface BookDetails {
  title: string;
  description: string;
  level: Level;
  topic: Topic;
}

export interface BookUploader {
  uid: string;
  email: string;
  name: string;
}

export class BookInputError extends Error {
  constructor(
    public readonly reason:
      | "invalidDetails"
      | "invalidFile"
      | "emptyFile"
      | "tooLarge"
      | "differentType",
  ) {
    super(reason);
  }
}

const bookConverter: FirestoreDataConverter<MistakeBook> = {
  toFirestore(book) {
    return {
      title: book.title,
      description: book.description,
      level: book.level,
      topicId: book.topicId,
      topicName: book.topicName,
      edition: book.edition,
      fileType: book.fileType,
      fileName: book.fileName,
      fileSize: book.fileSize,
      storagePath: book.storagePath,
      uploadedBy: book.uploadedBy,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title as string,
      description: data.description as string,
      level: data.level as Level,
      topicId: data.topicId as string,
      topicName: data.topicName as string,
      edition: data.edition as Edition,
      fileType: data.fileType as FileKind,
      fileName: data.fileName as string,
      fileSize: data.fileSize as number,
      storagePath: data.storagePath as string,
      uploadedBy: data.uploadedBy as MistakeBook["uploadedBy"],
      createdAt: data.createdAt?.toDate() ?? null,
      updatedAt: data.updatedAt?.toDate() ?? null,
    };
  },
};

const books = collection(db, "mistakeBooks").withConverter(bookConverter);
const bookRef = (id: string) => doc(books, id);

export function sortBooksByNewest(rows: MistakeBook[]): MistakeBook[] {
  return [...rows].sort(
    (a, b) =>
      (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0) ||
      a.title.localeCompare(b.title),
  );
}

/** Non-teacher queries always include the edition filter required by rules. */
export function watchVisibleBooks(
  isTeacher: boolean,
  onChange: (rows: MistakeBook[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const visibleQuery = isTeacher
    ? query(books)
    : query(books, where("edition", "==", "student"));
  return onSnapshot(
    visibleQuery,
    (snapshot) =>
      onChange(sortBooksByNewest(snapshot.docs.map((item) => item.data()))),
    onError,
  );
}

export function watchLatestStudentBooks(
  onChange: (rows: MistakeBook[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      books,
      where("edition", "==", "student"),
      orderBy("createdAt", "desc"),
      limit(5),
    ),
    (snapshot) => onChange(snapshot.docs.map((item) => item.data())),
    onError,
  );
}

export async function getVisibleBook(id: string): Promise<MistakeBook | null> {
  const snapshot = await getDoc(bookRef(id));
  return snapshot.exists() ? snapshot.data() : null;
}

const TYPE_BY_EXTENSION: Record<string, keyof typeof ALLOWED_UPLOAD_TYPES> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  html: "text/html",
};

export function checkBookFile(file: File): {
  type: FileKind;
  contentType: keyof typeof ALLOWED_UPLOAD_TYPES;
} {
  if (file.size === 0) throw new BookInputError("emptyFile");
  if (file.size > MAX_UPLOAD_BYTES) throw new BookInputError("tooLarge");
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? "";
  const contentType = TYPE_BY_EXTENSION[extension];
  if (
    !contentType ||
    (file.type &&
      file.type !== "application/octet-stream" &&
      file.type !== contentType)
  ) {
    throw new BookInputError("invalidFile");
  }
  return { type: ALLOWED_UPLOAD_TYPES[contentType], contentType };
}

function checkDetails(details: BookDetails) {
  const title = details.title.trim();
  const description = details.description.trim();
  if (
    !title ||
    title.length > 160 ||
    description.length > 1000 ||
    !ACTIVE_LEVELS.includes(details.level) ||
    !details.topic.levels.includes(details.level)
  ) {
    throw new BookInputError("invalidDetails");
  }
  return {
    title,
    description,
    level: details.level,
    topicId: details.topic.id,
    topicName: details.topic.name,
  };
}

function filePath(
  edition: Edition,
  bookId: string,
  fileType: FileKind,
): string {
  return `mistake-books/${edition}/${bookId}/${bookId}.${fileType}`;
}

function uploadFile(
  path: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), file, {
      contentType,
    });
    task.on(
      "state_changed",
      (snapshot) =>
        onProgress(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        ),
      reject,
      () => resolve(),
    );
  });
}

function isObjectMissing(error: unknown): boolean {
  return (error as { code?: string })?.code === "storage/object-not-found";
}

export async function createBook(
  details: BookDetails & { edition: Edition; file: File },
  uploader: BookUploader,
  onProgress: (percent: number) => void,
): Promise<string> {
  const clean = checkDetails(details);
  if (!EDITIONS.includes(details.edition))
    throw new BookInputError("invalidDetails");
  const checked = checkBookFile(details.file);
  const newBook = doc(books);
  const storagePath = filePath(details.edition, newBook.id, checked.type);
  try {
    await uploadFile(
      storagePath,
      details.file,
      checked.contentType,
      onProgress,
    );
    await setDoc(doc(db, "mistakeBooks", newBook.id), {
      ...clean,
      edition: details.edition,
      fileType: checked.type,
      fileName: details.file.name,
      fileSize: details.file.size,
      storagePath,
      uploadedBy: uploader,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newBook.id;
  } catch (error) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch (cleanupError) {
      if (!isObjectMissing(cleanupError)) {
        throw new AggregateError(
          [error, cleanupError],
          "Upload failed and file cleanup also failed.",
        );
      }
    }
    throw error;
  }
}

/** Edition and file kind stay fixed, so replacement uses the same Storage path. */
export async function editBook(
  book: MistakeBook,
  details: BookDetails,
  replacement: File | null,
  onProgress: (percent: number) => void,
): Promise<void> {
  const clean = checkDetails(details);
  if (!replacement) {
    await updateDoc(bookRef(book.id), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  const checked = checkBookFile(replacement);
  if (checked.type !== book.fileType) throw new BookInputError("differentType");
  const fileRef = ref(storage, book.storagePath);
  const oldBlob = await getBlob(fileRef);
  await uploadFile(
    book.storagePath,
    replacement,
    checked.contentType,
    onProgress,
  );
  try {
    await updateDoc(bookRef(book.id), {
      ...clean,
      fileName: replacement.name,
      fileSize: replacement.size,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      await uploadBytes(fileRef, oldBlob, { contentType: checked.contentType });
    } catch (restoreError) {
      throw new AggregateError(
        [error, restoreError],
        "Book update failed and the original file could not be restored.",
      );
    }
    throw error;
  }
}

/** Delete the file first: an orphaned public file must never remain after deletion. */
export async function deleteBook(book: MistakeBook): Promise<void> {
  try {
    await deleteObject(ref(storage, book.storagePath));
  } catch (error) {
    if (!isObjectMissing(error)) throw error;
  }
  await deleteDoc(bookRef(book.id));
}

export async function readBookFile(book: MistakeBook): Promise<Blob> {
  return getBlob(ref(storage, book.storagePath));
}
