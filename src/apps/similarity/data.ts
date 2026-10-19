import { questionsC } from "./data-c";
import { questionsCRest } from "./data-c-rest";
import { questionsAB } from "./data-ab";
import { questionsQuickAndD } from "./data-qp-d";
import { questionsRevision } from "./data-revision";
import type { SourceQuestion } from "./types";
export const groups = [
  "Quick Practice",
  "Exercise 8A",
  "Exercise 8B",
  "Exercise 8C",
  "Exercise 8D",
  "Revision Exercise 8",
] as const;
export const questions: SourceQuestion[] = [
  ...questionsQuickAndD,
  ...questionsAB,
  ...questionsCRest,
  ...questionsC,
  ...questionsRevision,
]
  .sort(
    (a, b) =>
      groups.indexOf(a.group) - groups.indexOf(b.group) ||
      Number(a.number.replace("8.", "")) - Number(b.number.replace("8.", "")),
  )
  .map((q) => ({
    ...q,
    shapes: q.shapes.map((s) => ({
      ...s,
      name:
        s.vertices.length === 3 && !s.name.startsWith("△")
          ? `△${s.name}`
          : s.name,
    })),
  }));
