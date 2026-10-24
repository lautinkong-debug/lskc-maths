import { describe, it, expect } from "vitest";
import katex from "katex";
import { lessons } from "../../src/apps/polynomials/bank";
import { equivalent, expressionTex } from "../../src/apps/polynomials/algebra";
import { lessonFrames } from "../../src/apps/polynomials/lesson-types";

describe("complete checked textbook bank", () => {
  it("contains every numbered question and all 158 unique parts", () => {
    expect(lessons).toHaveLength(158);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(158);
    const ranges = [
      ["10A", 21, 32, 24],
      ["10B", 19, 30, 27],
      ["10C", 20, 35, 32],
      ["10D", 26, 42, 32],
      ["REV", 33, 56, 43],
    ] as const;
    for (const [bank, first, last, count] of ranges) {
      const entries = lessons.filter((l) => l.bank === bank);
      expect(entries).toHaveLength(count);
      expect([...new Set(entries.map((l) => l.number))]).toEqual(
        Array.from({ length: last - first + 1 }, (_, i) => first + i),
      );
    }
  });
  for (const lesson of lessons)
    it(`${lesson.id}: valid exact mathematics, notation and reveal sequence`, () => {
      expect(lesson.steps.length).toBeGreaterThanOrEqual(3);
      expect(lesson.sourceRect).toHaveLength(4);
      expect(lesson.sourceRect.every((v) => v >= 0 && v <= 1)).toBe(true);
      if (lesson.expression)
        katex.renderToString(expressionTex(lesson.expression), {
          throwOnError: true,
        });
      if (lesson.givenTex)
        katex.renderToString(lesson.givenTex, { throwOnError: true });
      for (const [index, step] of lesson.steps.entries()) {
        expect(step.title, `${lesson.id} ${index}`).toBeTruthy();
        expect(step.reason).toBeTruthy();
        if (step.math) {
          const target = step.target ?? lesson.expression;
          expect(
            target,
            `${lesson.id} ${index} missing validation target`,
          ).toBeTruthy();
          expect(
            equivalent(step.math, target!),
            `${lesson.id} step${index}: ${step.math} != ${target}`,
          ).toBe(true);
          katex.renderToString(expressionTex(step.math), {
            throwOnError: true,
          });
        } else expect(step.tex).toBeTruthy();
        if (step.tex) katex.renderToString(step.tex, { throwOnError: true });
        if (step.distribution) {
          const { left, right, products } = step.distribution;
          expect(products).toHaveLength(left.length * right.length);
          products.forEach((p, i) =>
            expect(
              equivalent(
                p,
                `(${left[Math.floor(i / right.length)]})*(${right[i % right.length]})`,
              ),
            ).toBe(true),
          );
        }
      }
      const frames = lessonFrames(lesson);
      expect(frames[0]).toEqual({ step: -1, kind: "read" });
      for (const [i, f] of frames.entries())
        if (f.kind === "pair") {
          expect(frames[i + 1].kind).toBe("product");
          expect(frames[i + 1].revealedProducts).toBe(f.revealedProducts! + 1);
        }
    });
});
