import source from "./textbook.json";
import {
  questions as pilot,
  similarQuestion as similar,
  type Question as PilotQuestion,
} from "./data";
import { solve, expressionValue } from "./engine";
import { toText } from "../directed-numbers/lib/rational";
export type Response = {
  label: string;
  kind?: "equation" | "expression" | "choice";
  answer: string;
  expression?: string;
  unit?: string;
  options?: string[];
};
export type Question = PilotQuestion & {
  collection: string;
  reference: string;
  prompt?: string;
  setup?: string;
  responses?: Response[];
  diagram?: string;
  conclusion?: string;
};
type Word = {
  id?: string;
  number?: number;
  reference?: string;
  page?: string;
  prompt: string;
  equation: string;
  variable?: string;
  setup: string;
  diagram?: string;
  conclusion?: string;
  responses: (Omit<Response, "answer"> & { answer?: string })[];
};
function base(
  id: string,
  collection: string,
  reference: string,
  page: string,
  equation: string,
  variable = equation.match(/[a-zA-Z]/)![0],
): Question {
  return {
    id,
    collection,
    reference,
    page,
    equation,
    variable,
    exercise: "4B",
    number: 0,
    steps: [],
    skill: equation.includes("/")
      ? "fractions"
      : equation.includes("(")
        ? "brackets"
        : "both",
    answer: toText(solve(equation, variable)).replace("−", "-"),
  };
}
const quick = source.quickRows.map((row) =>
  base(String(row[0]), "quick", String(row[1]), String(row[4]), String(row[2])),
);
const revision = source.revisionRows.map((row) => {
  const n = Number(row[0]);
  return {
    ...base(
      "revision-" + n,
      "revision",
      String(n),
      n <= 25 ? "4.33" : n <= 46 ? "4.34" : "4.35",
      String(row[1]),
    ),
    number: n,
  };
});
function word(w: Word, collection: string): Question {
  const q = base(
    w.id ?? "revision-" + w.number,
    collection,
    w.reference ?? String(w.number),
    w.page ??
      (w.number! <= 25
        ? "4.33"
        : w.number! <= 30
          ? "4.34"
          : w.number! <= 60
            ? "4.35"
            : "4.36"),
    w.equation,
    w.variable,
  );
  return {
    ...q,
    ...w,
    number: w.number ?? 0,
    id: q.id,
    reference: q.reference,
    page: q.page,
    responses: w.responses.map((r) => ({
      ...r,
      answer:
        r.answer ??
        toText(
          expressionValue(
            r.expression!,
            q.variable,
            solve(q.equation, q.variable),
          ),
        ),
    })),
  };
}
const all: Question[] = [
  ...quick,
  ...source.quickWords.map((w) => word(w as Word, "quick")),
  ...revision,
  ...source.revisionWords.map((w) => word(w as Word, "revision")),
  ...pilot.map((q) => ({
    ...q,
    collection: q.exercise,
    reference: q.exercise + " Q" + q.number,
  })),
];
export const questions: Question[] = ["quick", "revision", "4A", "4B"].flatMap(
  (c) =>
    all
      .filter((q) => q.collection === c)
      .sort((a, b) => (c === "revision" ? a.number - b.number : 0)),
);
export const defaultId = "qp-4.5b";
export function responses(q: Question): Response[] {
  return q.responses ?? [{ label: q.variable + " =", answer: q.answer }];
}
export function similarQuestion(original: Question, variant: number): Question {
  const q = similar(original, variant);
  return {
    ...q,
    collection: "generated",
    reference: "",
    prompt: undefined,
    setup: undefined,
    responses: undefined,
    diagram: undefined,
    conclusion: undefined,
  };
}
