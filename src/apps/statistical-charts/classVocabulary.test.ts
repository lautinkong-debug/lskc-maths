import { expect, it } from "vitest";
import {
  boundaryMembership,
  boundarySteps,
  classVocabulary,
  matchesVocabularyAnswer,
  vocabularyExamples,
  vocabularyRecallOrders,
} from "./vocabularyModel";
it("adds four varied sets with independently checked boundaries, midpoints and widths", () => {
  expect(vocabularyExamples).toHaveLength(8);
  const answers = [
    [20.5, 30.5, 25.5, 10],
    [50.5, 70.5, 60.5, 20],
    [2.35, 2.95, 2.65, 0.6],
    [0.415, 0.495, 0.455, 0.08],
  ];
  vocabularyExamples.slice(4).forEach((e, i) => {
    const v = classVocabulary(e.lower, e.upper, e.precision);
    expect([v.low, v.high, v.mark, v.width]).toEqual(answers[i]);
  });
  for (const order of vocabularyRecallOrders)
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
  expect(
    new Set(vocabularyRecallOrders.map((order) => order.join())).size,
  ).toBe(8);
});
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
it("counts an exact shared boundary in the class to its right", () => {
  expect(boundaryMembership(35.4, 36, 40, 1)).toMatchObject({
    index: -1,
    recorded: 35,
    lower: 31,
    upper: 35,
  });
  expect(boundaryMembership(35.5, 36, 40, 1)).toMatchObject({
    index: 0,
    recorded: 36,
    lower: 36,
    upper: 40,
  });
  expect(boundaryMembership(40.4, 36, 40, 1)).toMatchObject({
    index: 0,
    recorded: 40,
  });
  expect(boundaryMembership(40.5, 36, 40, 1)).toMatchObject({
    index: 1,
    recorded: 41,
    lower: 41,
    upper: 45,
  });
});
it("keeps rounding, half-open membership and both midpoint formulas consistent at every teaching precision", () => {
  for (const e of vocabularyExamples) {
    const v = classVocabulary(e.lower, e.upper, e.precision);
    expect((v.low + v.high) / 2).toBeCloseTo(v.mark, 8);
    const sequence = boundarySteps(e.lower, e.upper, e.precision);
    expect(
      sequence.map(
        (value) =>
          boundaryMembership(value, e.lower, e.upper, e.precision).index,
      ),
    ).toEqual([-1, -1, 0, 0, 0, 1]);
    for (const value of sequence) {
      const m = boundaryMembership(value, e.lower, e.upper, e.precision);
      expect(m.recorded).toBeGreaterThanOrEqual(m.lower);
      expect(m.recorded).toBeLessThanOrEqual(m.upper);
    }
  }
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
