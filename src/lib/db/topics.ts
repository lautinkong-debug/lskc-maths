import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  ACTIVE_LEVELS,
  COMPULSORY_STRANDS,
  type Level,
  type Strand,
} from "@/lib/constants";
import { db } from "@/lib/firebase";

export interface Topic {
  id: string;
  code: string;
  name: string;
  levels: Level[];
  strand: Strand;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TopicInput {
  code: string;
  name: string;
  level: Level;
  strand: Strand;
}

export class TopicInputError extends Error {
  constructor(public readonly reason: "invalid" | "duplicate") {
    super(reason);
  }
}

const topicConverter: FirestoreDataConverter<Topic> = {
  toFirestore(topic) {
    return {
      code: topic.code,
      name: topic.name,
      levels: topic.levels,
      strand: topic.strand,
      order: topic.order,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      code: data.code as string,
      name: data.name as string,
      levels: data.levels as Level[],
      strand: data.strand as Strand,
      order: data.order as number,
      createdAt: data.createdAt?.toDate() ?? null,
      updatedAt: data.updatedAt?.toDate() ?? null,
    };
  },
};

const topics = collection(db, "topics").withConverter(topicConverter);
const topicRef = (id: string) => doc(db, "topics", id);

export function sortTopicsForLevel(all: Topic[], level: Level): Topic[] {
  return all
    .filter((topic) => topic.levels.includes(level))
    .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
}

export function watchTopics(
  onChange: (topics: Topic[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    topics,
    (snapshot) => onChange(snapshot.docs.map((item) => item.data())),
    onError,
  );
}

export async function listTopics(): Promise<Topic[]> {
  const snapshot = await getDocs(topics);
  return snapshot.docs.map((item) => item.data());
}

function normalise(input: TopicInput): TopicInput {
  const code = input.code.trim();
  const name = input.name.trim();
  if (
    !code ||
    code.length > 30 ||
    !name ||
    name.length > 160 ||
    !ACTIVE_LEVELS.includes(input.level) ||
    !COMPULSORY_STRANDS.includes(input.strand)
  ) {
    throw new TopicInputError("invalid");
  }
  return { ...input, code, name };
}

function ensureUnique(all: Topic[], input: TopicInput, exceptId?: string) {
  if (
    all.some(
      (topic) =>
        topic.id !== exceptId &&
        topic.levels.includes(input.level) &&
        topic.code.toLowerCase() === input.code.toLowerCase(),
    )
  ) {
    throw new TopicInputError("duplicate");
  }
}

export async function addTopic(input: TopicInput): Promise<void> {
  const clean = normalise(input);
  const all = await listTopics();
  ensureUnique(all, clean);
  const order =
    Math.max(
      -1,
      ...sortTopicsForLevel(all, clean.level).map((item) => item.order),
    ) + 1;
  await addDoc(collection(db, "topics"), {
    code: clean.code,
    name: clean.name,
    levels: [clean.level],
    strand: clean.strand,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function editTopic(
  topic: Topic,
  input: TopicInput,
): Promise<void> {
  const clean = normalise(input);
  const all = await listTopics();
  ensureUnique(all, clean, topic.id);
  const order = topic.levels.includes(clean.level)
    ? topic.order
    : Math.max(
        -1,
        ...sortTopicsForLevel(all, clean.level).map((item) => item.order),
      ) + 1;
  await updateDoc(topicRef(topic.id), {
    code: clean.code,
    name: clean.name,
    levels: [clean.level],
    strand: clean.strand,
    order,
    updatedAt: serverTimestamp(),
  });
}

/** Returns false when a Mistakes Book still refers to this topic. */
export async function deleteTopicIfUnused(id: string): Promise<boolean> {
  const used = await getDocs(
    query(collection(db, "mistakeBooks"), where("topicId", "==", id), limit(1)),
  );
  if (!used.empty) return false;
  await deleteDoc(topicRef(id));
  return true;
}

export async function moveTopic(
  all: Topic[],
  level: Level,
  id: string,
  direction: -1 | 1,
): Promise<void> {
  const ordered = sortTopicsForLevel(all, level);
  const current = ordered.findIndex((topic) => topic.id === id);
  const target = current + direction;
  if (current < 0 || target < 0 || target >= ordered.length) return;
  [ordered[current], ordered[target]] = [ordered[target], ordered[current]];
  const batch = writeBatch(db);
  ordered.forEach((topic, index) => {
    batch.update(topicRef(topic.id), {
      order: index,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
