import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { renderToString } from "katex";
import { questions, filterQuestions } from "../../src/apps/congruence/data";
import {
  stepGeometry,
  vertexNames,
} from "../../src/apps/similarity/stepGeometry";

describe("the triangle practice bank is complete and renderable", () => {
  it("covers the agreed Quick Practice and Level 2 triangle exercises without polygon-only questions", () => {
    const ids = questions.map((q) => q.id);
    const range = (prefix: string, first: number, last: number) =>
      Array.from(
        { length: last - first + 1 },
        (_, i) => `${prefix}${i + first}`,
      );
    expect(new Set(ids)).toEqual(
      new Set([
        ...range("qp5-", 1, 17),
        ...range("ex5a-", 15, 27),
        ...range("ex5b-", 19, 30),
        ...range("ex5c-", 12, 20),
        ...range("rev5-", 22, 35),
        "rev5-38",
      ]),
    );
    expect(ids.length).toBe(new Set(ids).size);
  });
  it("filters by section, question number and printed page", () => {
    expect(filterQuestions("Exercise 5B", "Q19").map((q) => q.id)).toEqual([
      "ex5b-19",
    ]);
    expect(filterQuestions("Quick Practice", "5.33").map((q) => q.id)).toEqual([
      "qp5-14",
    ]);
    expect(filterQuestions("", "a question that is not present")).toEqual([]);
  });
  for (const q of questions)
    it(`${q.id} has usable figures, maths and a source image`, () => {
      expect(existsSync(`public/congruence/questions/${q.id}.webp`)).toBe(true);
      expect(q.steps.length).toBeGreaterThan(0);
      const labels = new Set(q.points.map((p) => p.label));
      expect(labels.size).toBe(q.points.length);
      for (const shape of q.shapes) {
        expect(shape.vertices.length).toBe(3);
        expect(new Set(shape.vertices).size).toBe(3);
        for (const label of shape.vertices)
          expect(labels.has(label), `${q.id} ${label}`).toBe(true);
      }
      for (const step of q.steps) {
        for (const math of step.math ?? [])
          expect(() =>
            renderToString(math, { throwOnError: true, strict: "error" }),
          ).not.toThrow();
        for (const values of Object.values(step.highlights))
          for (const name of values ?? [])
            for (const label of vertexNames(name))
              expect(labels.has(label), `${q.id} ${name}`).toBe(true);
        expect(() => stepGeometry(step.highlights, q.points)).not.toThrow();
      }
    });
});
