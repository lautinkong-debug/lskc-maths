import { tidy } from "./statistics";
export const vocabularyExamples = [
  { lower: 36, upper: 40, precision: 1 },
  { lower: 11, upper: 15, precision: 1 },
  { lower: 7.1, upper: 7.5, precision: 0.1 },
  { lower: 1.23, upper: 1.27, precision: 0.01 },
  { lower: 21, upper: 30, precision: 1 },
  { lower: 51, upper: 70, precision: 1 },
  { lower: 2.4, upper: 2.9, precision: 0.1 },
  { lower: 0.42, upper: 0.49, precision: 0.01 },
];
export const vocabularyRecallOrders = [
  [1, 3, 0, 2],
  [0, 2, 1, 3],
  [2, 0, 3, 1],
  [3, 1, 2, 0],
  [0, 3, 2, 1],
  [2, 1, 0, 3],
  [3, 0, 1, 2],
  [1, 2, 3, 0],
];
export const vocabularyFieldTerms = [0, 0, 1, 1, 2, 3];
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

// These positive recorded-measurement examples use round-half-up and [low, high).
export function boundaryMembership(
  value: number,
  lower: number,
  upper: number,
  precision: number,
) {
  const v = classVocabulary(lower, upper, precision);
  const index = value < v.low ? -1 : value >= v.high ? 1 : 0;
  return {
    index,
    recorded: tidy(Math.floor(tidy(value / precision + 0.5)) * precision),
    lower: tidy(lower + index * v.width),
    upper: tidy(upper + index * v.width),
  };
}

export function boundarySteps(lower: number, upper: number, precision: number) {
  const v = classVocabulary(lower, upper, precision);
  return [
    v.low - precision / 10,
    v.low - precision / 10,
    v.low,
    v.low + precision / 10,
    v.high - precision / 10,
    v.high,
  ].map(tidy);
}
