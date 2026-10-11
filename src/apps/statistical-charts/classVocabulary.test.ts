import { expect, it } from "vitest";
import { classVocabulary, matchesVocabularyAnswer } from "./vocabularyModel";
it("distinguishes the four concepts in the teacher's whole-number example", () => {
  expect(classVocabulary(36, 40, 1)).toEqual({
    lower: 36,
    upper: 40,
    low: 35.5,
    high: 40.5,
    mark: 38,
    width: 5,
    halfStep: 0.5,
  });
  expect(matchesVocabularyAnswer("4", 5)).toBe(false);
  expect(matchesVocabularyAnswer("", 0)).toBe(false);
});
it("uses half the recording step for decimal boundaries and boundary-to-boundary width", () => {
  expect(classVocabulary(7.1, 7.5, 0.1)).toEqual({
    lower: 7.1,
    upper: 7.5,
    low: 7.05,
    high: 7.55,
    mark: 7.3,
    width: 0.5,
    halfStep: 0.05,
  });
  const hundredths = classVocabulary(1.23, 1.27, 0.01);
  expect([
    hundredths.low,
    hundredths.high,
    hundredths.mark,
    hundredths.width,
  ]).toEqual([1.225, 1.275, 1.25, 0.05]);
  expect(matchesVocabularyAnswer("0.50", 0.5)).toBe(true);
  expect(matchesVocabularyAnswer("7.6", 7.55)).toBe(false);
});
