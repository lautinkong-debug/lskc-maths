import { describe, expect, it } from "vitest";
import katex from "katex";
import { exerciseCRevisionQuestions } from "../../src/apps/congruence/data-c-revision";

describe("visually transcribed congruence Exercise 5C and revision sources", () => {
  it("includes the requested Level 2 triangle questions only", () => {
    expect(
      exerciseCRevisionQuestions
        .filter((question) => question.group === "Exercise 5C")
        .map((question) => Number(question.number)),
    ).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(
      exerciseCRevisionQuestions
        .filter((question) => question.group === "Revision Exercise 5")
        .map((question) => Number(question.number)),
    ).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 38]);
    expect(new Set(exerciseCRevisionQuestions.map(({ id }) => id)).size).toBe(
      24,
    );
  });

  for (const question of exerciseCRevisionQuestions) {
    it(`${question.id}: has complete source geometry and valid single-line mathematics`, () => {
      const labels = new Set(question.points.map(({ label }) => label));
      expect(labels.size).toBe(question.points.length);
      const [left, top, right, bottom] = question.crop;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(1225);
      expect(bottom).toBeLessThanOrEqual(1617);
      expect(right).toBeGreaterThan(left);
      expect(bottom).toBeGreaterThan(top);
      for (const { x, y } of question.points) {
        expect(x).toBeGreaterThanOrEqual(left);
        expect(x).toBeLessThanOrEqual(right);
        expect(y).toBeGreaterThanOrEqual(top);
        expect(y).toBeLessThanOrEqual(bottom);
      }
      for (const shape of question.shapes) {
        expect(shape.vertices).toHaveLength(3);
        expect(new Set(shape.vertices).size).toBe(3);
        for (const label of shape.vertices)
          expect(labels.has(label)).toBe(true);
        const [a, b, c] = shape.vertices.map((label) =>
          question.points.find((point) => point.label === label)!,
        );
        const twiceArea = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        expect(Math.abs(twiceArea)).toBeGreaterThan(1);
      }
      for (const angle of question.rightAngles ?? []) {
        expect(angle).toHaveLength(3);
        for (const label of angle) expect(labels.has(label)).toBe(true);
      }
      for (const sourceStep of question.steps) {
        if (sourceStep.math) {
          expect(sourceStep.math).toHaveLength(1);
          for (const math of sourceStep.math) {
            expect(() =>
              katex.renderToString(math, {
                throwOnError: true,
                strict: "error",
              }),
            ).not.toThrow();
          }
        }
        for (const [kind, references] of Object.entries(
          sourceStep.highlights,
        )) {
          for (const reference of references) {
            if (kind === "angles") expect(reference).toHaveLength(3);
            if (kind === "sides") expect(reference).toHaveLength(2);
            for (const label of reference) expect(labels.has(label)).toBe(true);
          }
        }
        if (sourceStep.conclusion) {
          expect(sourceStep.math?.[0]).toContain("\\cong");
          expect(sourceStep.reason).toMatch(/^(SSS|SAS|ASA|AAS|RHS)$/);
        }
      }
    });
  }

  it("retains the printed alternatives and the three separate comparisons in Revision 35", () => {
    const revision24 = exerciseCRevisionQuestions.find(
      ({ id }) => id === "rev5-24",
    )!;
    expect(
      revision24.steps
        .filter(({ conclusion }) => conclusion)
        .map(({ reason }) => reason),
    ).toEqual(["AAS", "ASA"]);
    const revision35 = exerciseCRevisionQuestions.find(
      ({ id }) => id === "rev5-35",
    )!;
    expect(revision35.solutionPages).toEqual([17, 18]);
    expect(revision35.shapes.map(({ vertices }) => vertices.join(""))).toEqual([
      "BEF",
      "CEG",
      "BEA",
      "CED",
      "ABF",
      "DCG",
    ]);
    expect(
      revision35.steps
        .filter(({ conclusion }) => conclusion)
        .map(({ reason }) => reason),
    ).toEqual(["SAS", "SAS", "SSS", "SAS"]);
    expect(
      revision35.steps.find(
        ({ math }) => math?.[0] === String.raw`\therefore\ AE=DE`,
      )?.reason,
    ).toBeUndefined();
  });

  it("keeps numerical angle substitutions attached to the actual source angles", () => {
    const revision22 = exerciseCRevisionQuestions.find(
      ({ id }) => id === "rev5-22",
    )!;
    const finalY = revision22.steps.find(
      ({ math }) => math?.[0] === String.raw`y=130^\circ`,
    )!;
    expect(finalY.highlights.angles).toEqual(["ADC"]);
    const revision30 = exerciseCRevisionQuestions.find(
      ({ id }) => id === "rev5-30",
    )!;
    expect(
      revision30.steps.find(
        ({ math }) => math?.[0] === String.raw`\angle ABQ=\angle APQ=90^\circ`,
      )?.reason,
    ).toBeUndefined();
    expect(revision30.steps.at(-1)?.math).toEqual([
      String.raw`\angle BAQ=26^\circ`,
    ]);
  });
});
