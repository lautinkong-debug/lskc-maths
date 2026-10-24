import ab from "./data/ab.json";
import c from "./data/c.json";
import d from "./data/d.json";
import rev from "./data/rev.json";
import type { Lesson } from "./lesson-types";

export const lessons: readonly Lesson[] = [
  ...ab,
  ...c,
  ...d,
  ...rev,
] as Lesson[];
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
