import { expect, it } from "vitest";
import { classVocabulary } from "./vocabularyModel";
import { vocabularyCalculation } from "./vocabularyCalculationModel";
it("shows the same midpoint through both stacked-fraction calculations", () => {
  const v = classVocabulary(36, 40, 1);
  expect(vocabularyCalculation(v, 1, "markLimits", 3).latex).toBe(
    "\\dfrac{36+40}{2}=\\dfrac{76}{2}=38",
  );
  expect(vocabularyCalculation(v, 1, "markBoundaries", 3).latex).toBe(
    "\\dfrac{35.5+40.5}{2}=\\dfrac{76}{2}=38",
  );
  expect(vocabularyCalculation(v, 1, "markBoundaries", 0).fields).toEqual([
    2, 3,
  ]);
  expect(vocabularyCalculation(v, 1, "markLimits", 3).fields).toEqual([4]);
});
it("uses recording precision and full boundary width for decimal upper boundaries", () => {
  const v = classVocabulary(0.42, 0.49, 0.01);
  expect(vocabularyCalculation(v, 0.01, "upperLimit", 1).latex).toBe(
    "\\dfrac{0.01}{2}=0.005",
  );
  expect(vocabularyCalculation(v, 0.01, "upperLimit", 3).latex).toBe(
    "0.49+0.005=0.495",
  );
  expect(vocabularyCalculation(v, 0.01, "upperBoundary", 3).latex).toBe(
    "0.415+0.08=0.495",
  );
  expect(vocabularyCalculation(v, 0.01, "markLimits", 3).latex).toBe(
    "\\dfrac{0.42+0.49}{2}=\\dfrac{0.91}{2}=0.455",
  );
});
it.each([
  [36, 40, 1, "36-0.5=35.5", "40.5-5=35.5"],
  [0.42, 0.49, 0.01, "0.42-0.005=0.415", "0.495-0.08=0.415"],
] as const)(
  "animates both lower-boundary methods for %s–%s",
  (lower, upper, precision, fromLimit, fromBoundary) => {
    const v = classVocabulary(lower, upper, precision);
    expect(vocabularyCalculation(v, precision, "lowerLimit", 3).latex).toBe(
      fromLimit,
    );
    expect(vocabularyCalculation(v, precision, "lowerBoundary", 3).latex).toBe(
      fromBoundary,
    );
    expect(
      [0, 1, 2, 3].map(
        (step) =>
          vocabularyCalculation(v, precision, "lowerBoundary", step).fields,
      ),
    ).toEqual([[3], [5], [3, 5], [2]]);
    expect(
      [0, 1, 2, 3].map(
        (step) =>
          vocabularyCalculation(v, precision, "lowerLimit", step).fields,
      ),
    ).toEqual([[0], [0], [0], [2]]);
  },
);
