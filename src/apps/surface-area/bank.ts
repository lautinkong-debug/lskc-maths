import { lessonQuestions } from "./data-lessons";
import { exerciseQuestions } from "./data-exercises";
import { revisionQuestions } from "./data-revision";
import type { SurfaceQuestion } from "./types";

export const questions: SurfaceQuestion[] = [
  ...lessonQuestions,
  ...exerciseQuestions,
  ...revisionQuestions,
];
export const sections = [...new Set(questions.map((q) => q.section))];
export const defaultQuestion = questions.find((q) => q.id === "example-9-11")!;
export function questionName(q: SurfaceQuestion) {
  return /^Q\d/.test(q.label) ? `${q.section} · ${q.label}` : q.label;
}
export function resolvePreset(hash: string) {
  const [qid, vid] = hash.replace(/^#/, "").split("/");
  const question = questions.find((q) => q.id === qid) ?? defaultQuestion;
  const variant =
    question.variants.find((v) => v.id === vid) ?? question.variants[0];
  return { question, variant };
}
