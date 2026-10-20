import { quickQuestions } from "./data-quick";
import { exerciseABQuestions } from "./data-ab";
import { exerciseCRevisionQuestions } from "./data-c-revision";
import type { CongruenceGroup, CongruenceQuestion } from "./types";

export const groups: CongruenceGroup[] = [
  "Quick Practice",
  "Exercise 5A",
  "Exercise 5B",
  "Exercise 5C",
  "Revision Exercise 5",
];
export const questions: CongruenceQuestion[] = [
  ...quickQuestions,
  ...exerciseABQuestions,
  ...exerciseCRevisionQuestions,
].sort(
  (a, b) =>
    groups.indexOf(a.group) - groups.indexOf(b.group) ||
    Number(a.number.replace("5.", "")) - Number(b.number.replace("5.", "")),
);

export function questionName(q: CongruenceQuestion) {
  return q.group === "Quick Practice"
    ? `${q.group} ${q.number.includes(".") ? q.number : `5.${q.number}`}`
    : `${q.group} · Q${q.number}`;
}

export function filterQuestions(group: string, query: string) {
  const search = query.trim().toLowerCase();
  return questions.filter(
    (q) =>
      (!group || q.group === group) &&
      `${questionName(q)} 5.${q.page} ${q.prompt}`
        .toLowerCase()
        .includes(search),
  );
}
