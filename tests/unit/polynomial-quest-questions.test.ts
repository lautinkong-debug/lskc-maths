import { describe, expect, it } from "vitest";
import katex from "katex";
import { equivalent, expressionTex } from "../../src/apps/polynomials/algebra";
import {
  parseAnswer,
  polynomialSource,
} from "../../src/apps/polynomials/quest/algebra";
import {
  generateQuestion,
  type Stage,
} from "../../src/apps/polynomials/quest/questions";

describe("Polynomial Quest question contracts", () => {
  it("keeps scalar distribution meaningful instead of multiplying by positive one", () => {
    for (let seed = 0; seed < 100; seed++) {
      expect(generateQuestion(2, 0, seed).grid?.left).not.toEqual(["1"]);
      expect(generateQuestion(3, 4, seed).grid?.left).not.toEqual(["1"]);
    }
  });
  it.each([0, 1, 2, 3] as Stage[])(
    "verifies every working line and answer for stage %i independently",
    (stage) => {
      for (let seed = 1; seed <= 100; seed++)
        for (let round = 0; round < 6; round++) {
          const q = generateQuestion(stage, round, seed);
          expect(
            equivalent(q.source, polynomialSource(q.answer)),
            q.source,
          ).toBe(true);
          expect(
            q.answer.every((n) => Number.isInteger(n) && Math.abs(n) <= 99),
          ).toBe(true);
          for (const step of q.steps) {
            expect(
              equivalent(q.source, step.source),
              `${q.source} -> ${step.source}`,
            ).toBe(true);
            expect(() =>
              katex.renderToString(expressionTex(step.source), {
                throwOnError: true,
              }),
            ).not.toThrow();
          }
          if (q.grid)
            q.grid.left.forEach((left, i) =>
              q.grid!.right.forEach((right, j) => {
                expect(
                  equivalent(`(${left})*(${right})`, q.grid!.products[i][j]),
                ).toBe(true);
              }),
            );
          const recovery = generateQuestion(stage, round, seed, q.source);
          expect(recovery.source).not.toBe(q.source);
          expect(recovery.template).toBe(q.template);
          expect(generateQuestion(stage, round, seed)).toEqual(q);
          for (const mistake of q.mistakes)
            expect(mistake.answer).not.toEqual(q.answer);
        }
    },
    30000,
  );
  it("covers all specified templates including deliberate cancellations", () => {
    expect(
      Array.from({ length: 6 }, (_, r) => generateQuestion(2, r, 7).template),
    ).toEqual([
      "distribute-number",
      "distribute-x",
      "product",
      "product",
      "square",
      "square",
    ]);
    for (let s = 0; s < 100; s++)
      expect(generateQuestion(0, 4, s).answer[0]).toBe(0);
  });
  it.each([
    [
      ["−01", " +002 ", "-0"],
      [-1, 2, 0],
    ],
    [
      ["0", "0", "0"],
      [0, 0, 0],
    ],
    [
      ["999", "-999", "1"],
      [999, -999, 1],
    ],
  ])("accepts complete signed integer answers", (input, answer) => {
    expect(parseAnswer(input as string[])).toEqual(answer);
  });
  it.each([
    "",
    " ",
    "1x",
    "1.0",
    "2/3",
    "1e2",
    "NaN",
    "Infinity",
    "1000",
    "--2",
    "1 2",
  ])("rejects %j without partial parsing", (value) => {
    expect(parseAnswer([value, "0", "0"])).toBeNull();
  });
  it("requires exactly three slots and formats coefficients canonically", () => {
    expect(parseAnswer(["1", "2"])).toBeNull();
    expect(polynomialSource([0, 0, 0])).toBe("0");
    expect(polynomialSource([-1, 1, -2])).toBe("-x^2+x-2");
  });
});
