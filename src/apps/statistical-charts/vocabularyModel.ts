import { tidy } from "./statistics";
export const vocabularyExamples = [
  { lower: 36, upper: 40, precision: 1 },
  { lower: 11, upper: 15, precision: 1 },
  { lower: 7.1, upper: 7.5, precision: 0.1 },
  { lower: 1.23, upper: 1.27, precision: 0.01 },
];
export function classVocabulary(
  lower: number,
  upper: number,
  precision: number,
) {
  const low = tidy(lower - precision / 2),
    high = tidy(upper + precision / 2);
  return {
    lower,
    upper,
    low,
    high,
    mark: tidy((lower + upper) / 2),
    width: tidy(high - low),
    halfStep: precision / 2,
  };
}
export const vocabularyFields = [
  "lower",
  "upper",
  "low",
  "high",
  "mark",
  "width",
] as const;
export function matchesVocabularyAnswer(text: string, expected: number) {
  return (
    text.trim() !== "" &&
    Number.isFinite(Number(text)) &&
    Math.abs(Number(text) - expected) < 1e-8
  );
}
