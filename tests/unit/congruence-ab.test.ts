import { describe, expect, it } from "vitest";
import katex from "katex";
import { exerciseABQuestions } from "../../src/apps/congruence/data-ab";
import type { Point } from "../../src/apps/similarity/types";

const byId = (id: string) => exerciseABQuestions.find((q) => q.id === id)!;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const point = (id: string, label: string) =>
  byId(id).points.find((p) => p.label === label)!;
const angle = (id: string, labels: string) => {
  const [a, b, c] = [...labels].map((label) => point(id, label));
  const ba = [a.x - b.x, a.y - b.y];
  const bc = [c.x - b.x, c.y - b.y];
  return (
    (Math.acos(
      (ba[0] * bc[0] + ba[1] * bc[1]) / (Math.hypot(...ba) * Math.hypot(...bc)),
    ) *
      180) /
    Math.PI
  );
};
const allMath = (id: string) =>
  byId(id).steps.flatMap((step) => step.math ?? []);

describe("Congruence Exercise 5A and 5B source data", () => {
  it("covers the complete approved Level 2 ranges once each", () => {
    expect(exerciseABQuestions.map((q) => q.id)).toEqual([
      ...Array.from({ length: 13 }, (_, i) => `ex5a-${i + 15}`),
      ...Array.from({ length: 12 }, (_, i) => `ex5b-${i + 19}`),
    ]);
  });

  it("resolves every traced figure, highlight and source crop", () => {
    for (const question of exerciseABQuestions) {
      const labels = question.points.map((p) => p.label);
      expect(new Set(labels).size, question.id).toBe(labels.length);
      const [left, top, right, bottom] = question.crop;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(1225);
      expect(bottom).toBeLessThanOrEqual(1617);
      expect(right).toBeGreaterThan(left);
      expect(bottom).toBeGreaterThan(top);
      for (const shape of question.shapes) {
        expect(shape.vertices).toHaveLength(3);
        for (const label of shape.vertices)
          expect(labels, `${question.id}: ${shape.name}`).toContain(label);
      }
      for (const step of question.steps) {
        expect(step.math?.length ?? 0).toBeLessThanOrEqual(1);
        for (const math of step.math ?? [])
          expect(() =>
            katex.renderToString(math, { throwOnError: true, strict: "error" }),
          ).not.toThrow();
        for (const entity of Object.values(step.highlights).flat())
          for (const label of entity)
            expect(labels, `${question.id}: ${entity}`).toContain(label);
      }
      if (!question.constructed)
        for (const p of question.points) {
          expect(p.x, `${question.id}: ${p.label}`).toBeGreaterThanOrEqual(
            left,
          );
          expect(p.x, `${question.id}: ${p.label}`).toBeLessThanOrEqual(right);
          expect(p.y, `${question.id}: ${p.label}`).toBeGreaterThanOrEqual(top);
          expect(p.y, `${question.id}: ${p.label}`).toBeLessThanOrEqual(bottom);
        }
    }
  });

  it("constructs congruent examples that satisfy the unillustrated questions", () => {
    for (const id of ["ex5a-18", "ex5a-19", "ex5a-20"]) {
      const q = byId(id);
      const [first, second] = q.shapes.map((s) =>
        s.vertices.map((label) => point(id, label)),
      );
      for (let i = 0; i < 3; i++)
        expect(distance(first[i], first[(i + 1) % 3])).toBeCloseTo(
          distance(second[i], second[(i + 1) % 3]),
          9,
        );
    }
    const q18XY = distance(point("ex5a-18", "X"), point("ex5a-18", "Y"));
    const q18YZ = distance(point("ex5a-18", "Y"), point("ex5a-18", "Z"));
    const q18XZ = distance(point("ex5a-18", "X"), point("ex5a-18", "Z"));
    expect(q18XY / q18XZ).toBeCloseTo(7 / 10, 9);
    expect(q18YZ / q18XZ).toBeCloseTo(9 / 10, 9);
    expect(angle("ex5a-19", "YXZ")).toBeCloseTo(85, 9);
    expect(angle("ex5a-19", "XYZ")).toBeCloseTo(65, 9);
    expect(angle("ex5a-19", "XZY")).toBeCloseTo(30, 9);
    expect(angle("ex5a-20", "XYZ")).toBeCloseTo(52, 9);
    expect(
      distance(point("ex5a-20", "X"), point("ex5a-20", "Y")) /
        distance(point("ex5a-20", "X"), point("ex5a-20", "Z")),
    ).toBeCloseTo(7.5 / 8.4, 9);
  });

  it("keeps givens separate from proved congruence and includes continuation pages", () => {
    for (let n = 18; n <= 27; n++)
      expect(byId(`ex5a-${n}`).steps.some((step) => step.conclusion)).toBe(
        false,
      );
    expect(byId("ex5a-26").solutionPages).toEqual([6, 7]);
    expect(byId("ex5b-27").solutionPages).toEqual([8, 9]);
    expect(allMath("ex5a-26").at(-1)).toBe(String.raw`\angle ABE=20^\circ`);
    expect(allMath("ex5b-27").at(-1)).toBe(String.raw`\angle PQS=92^\circ`);
    expect(180 - 100 - 30 - 30).toBe(20);
    expect(180 - 23 - 42 - 23).toBe(92);
  });

  it("retains the included-angle and included-side requirements in the open construction", () => {
    const q = byId("ex5b-29");
    expect(q.constructed).toBe(true);
    expect(angle(q.id, "BAC")).toBeCloseTo(45, 9);
    expect(q.steps.some((step) => step.conclusion)).toBe(false);
    expect(q.steps.map((step) => step.text).join(" ")).toContain(
      "For the condition SAS, ∠A should be the included angle.",
    );
    expect(q.steps.map((step) => step.text).join(" ")).toContain(
      "For the condition ASA, AB should be the included side.",
    );
    // Independent ambiguous SSA example: AB = 4, A = 45°, BC = 3.
    // The two intersections of the A-ray with the B-centred radius-3 circle
    // have distinct positive distances AC = 2√2 ± 1.
    const solutions = [2 * Math.SQRT2 - 1, 2 * Math.SQRT2 + 1];
    expect(solutions[0]).toBeGreaterThan(0);
    expect(solutions[1]).toBeGreaterThan(solutions[0]);
    for (const ac of solutions)
      expect(4 ** 2 + ac ** 2 - 2 * 4 * ac * Math.cos(Math.PI / 4)).toBeCloseTo(
        3 ** 2,
        9,
      );
  });

  it("retains all three printed valid pairs for the final open question", () => {
    const q = byId("ex5b-30");
    expect(
      q.steps.filter((step) => step.conclusion).map((step) => step.math?.[0]),
    ).toEqual([
      String.raw`\therefore\triangle ADE\cong\triangle BCE`,
      String.raw`\therefore\triangle ADC\cong\triangle BCD`,
      String.raw`\therefore\triangle ADB\cong\triangle BCA`,
    ]);
    expect(
      q.steps
        .filter((step) => step.conclusion)
        .every((step) => step.reason === "SSS"),
    ).toBe(true);
  });
});
