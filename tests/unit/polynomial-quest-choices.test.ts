import { describe, expect, it } from "vitest";
import { equivalent } from "../../src/apps/polynomials/algebra";
import { polynomialSource } from "../../src/apps/polynomials/quest/algebra";
import { answerChoices } from "../../src/apps/polynomials/quest/choices";
import {
  generateQuestion,
  type Stage,
} from "../../src/apps/polynomials/quest/questions";

describe("Polynomial Quest multiple choices", () => {
  it.each([0, 1, 2, 3] as Stage[])(
    "has four distinct expressions and exactly one correct answer in stage %i",
    (stage) => {
      const positions = [0, 0, 0, 0];
      for (let seed = 1; seed <= 100; seed++)
        for (let round = 0; round < 6; round++) {
          const q = generateQuestion(stage, round, seed);
          const original = structuredClone(q);
          const options = answerChoices(q);
          expect(options).toHaveLength(4);
          expect(new Set(options.map(polynomialSource)).size).toBe(4);
          const correct = options.map((a) =>
            equivalent(q.source, polynomialSource(a)),
          );
          expect(correct.filter(Boolean)).toHaveLength(1);
          positions[correct.indexOf(true)]++;
          expect(
            options.every((a) =>
              a.every((n) => Number.isSafeInteger(n) && Math.abs(n) <= 999),
            ),
          ).toBe(true);
          expect(answerChoices(q)).toEqual(options);
          expect(q).toEqual(original);
          for (const mistake of q.mistakes)
            expect(options).toContainEqual(mistake.answer);
          if (
            ["collect-linear", "subtract-linear", "distribute-number"].includes(
              q.template,
            )
          ) {
            expect(options.every((a) => a[0] === 0)).toBe(true);
          }
        }
      // The correct letter must move, without depending on React rerenders.
      expect(positions.every((n) => n > 90 && n < 210)).toBe(true);
    },
    30000,
  );

  it("handles complete cancellation and colliding distractors without duplicate choices", () => {
    const q = generateQuestion(0, 0, 1);
    q.answer = [0, 0, 0];
    q.source = "0";
    q.mistakes = [
      { answer: [0, 0, 0], kind: "partial-sign" },
      { answer: [0, 1, 0], kind: "partial-sign" },
      { answer: [0, 1, 0], kind: "partial-sign" },
    ];
    const options = answerChoices(q);
    expect(options).toHaveLength(4);
    expect(new Set(options.map(polynomialSource)).size).toBe(4);
    expect(
      options.filter((a) => equivalent("0", polynomialSource(a))),
    ).toHaveLength(1);
  });
});
