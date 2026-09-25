import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Teacher {
  email: string;
  name: string;
  isAdmin: boolean;
  addedBy: string;
  addedAt: Date | null;
}

const teacherConverter: FirestoreDataConverter<Teacher> = {
  toFirestore(teacher) {
    return {
      name: teacher.name,
      isAdmin: teacher.isAdmin,
      addedBy: teacher.addedBy,
      addedAt: teacher.addedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      email: snapshot.id,
      name: data.name as string,
      isAdmin: data.isAdmin as boolean,
      addedBy: data.addedBy as string,
      addedAt: data.addedAt?.toDate() ?? null,
    };
  },
};

const teachers = collection(db, "teachers").withConverter(teacherConverter);
const teacherRef = (email: string) => doc(teachers, email.trim().toLowerCase());

export function watchOwnTeacher(
  email: string,
  onChange: (teacher: Teacher | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    teacherRef(email),
    (snapshot) => onChange(snapshot.exists() ? snapshot.data() : null),
    onError,
  );
}

export async function listTeachers(): Promise<Teacher[]> {
  const snapshot = await getDocs(teachers);
  return snapshot.docs
    .map((item) => item.data())
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function addTeacher(input: {
  email: string;
  name: string;
  isAdmin: boolean;
  addedBy: string;
}): Promise<void> {
  await setDoc(doc(db, "teachers", input.email.trim().toLowerCase()), {
    name: input.name.trim(),
    isAdmin: input.isAdmin,
    addedBy: input.addedBy.toLowerCase(),
    addedAt: serverTimestamp(),
  });
}

export async function setTeacherAdmin(
  email: string,
  isAdmin: boolean,
): Promise<void> {
  await updateDoc(doc(db, "teachers", email.trim().toLowerCase()), { isAdmin });
}

export async function removeTeacher(email: string): Promise<void> {
  await deleteDoc(teacherRef(email));
}
