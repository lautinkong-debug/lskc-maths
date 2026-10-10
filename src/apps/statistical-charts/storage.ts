import { validateActivity, type Activity } from "./classroom";
export const SESSION_KEY = "lskc-statistical-session-v1",
  LIBRARY_KEY = "lskc-statistical-lessons-v1";
export type SavedSession = {
  version: 1;
  activity: Activity;
  lesson: Activity | null;
  progress: Record<string, unknown>;
  updated: number;
  origin: string;
};
export type SavedLesson = {
  id: string;
  name: string;
  activity: Activity;
  updated: number;
};
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function readSession(text: string): SavedSession {
  if (text.length > 1500000) throw new Error("storage");
  const v = JSON.parse(text);
  if (
    !object(v) ||
    v.version !== 1 ||
    !object(v.progress) ||
    Object.keys(v.progress).length > 160 ||
    typeof v.updated !== "number"
  )
    throw new Error("storage");
  const progress: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(v.progress))
    if (
      key.length <= 4000 &&
      key !== "__proto__" &&
      JSON.stringify(value).length <= 25000
    )
      progress[key] = value;
  if (typeof v.origin !== "string" || v.origin.length > 350000)
    throw new Error("storage");
  return {
    version: 1,
    activity: validateActivity(v.activity),
    lesson: v.lesson ? validateActivity(v.lesson) : null,
    progress,
    updated: v.updated,
    origin: v.origin,
  };
}
export function readLibrary(text: string): SavedLesson[] {
  if (text.length > 4000000) throw new Error("storage");
  const v = JSON.parse(text);
  if (!Array.isArray(v) || v.length > 12) throw new Error("storage");
  return v.map((entry) => {
    if (
      !object(entry) ||
      typeof entry.id !== "string" ||
      entry.id.length > 80 ||
      typeof entry.name !== "string" ||
      entry.name.length > 80 ||
      typeof entry.updated !== "number"
    )
      throw new Error("storage");
    return {
      id: entry.id,
      name: entry.name,
      updated: entry.updated,
      activity: validateActivity(entry.activity),
    };
  });
}
