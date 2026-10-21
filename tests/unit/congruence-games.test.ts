import { describe, expect, it } from "vitest";
import {
  conditions,
  gradeEvidence,
  lessonRound,
  lessonSetup,
  mixedRounds,
  supports,
  sharedDrawingPoints,
} from "@/apps/congruence/games/model";
import { rigidTransform } from "@/apps/congruence/geometry";

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

describe("congruence game mathematics", () => {
  it("uses precisely the five textbook conditions", () => {
    expect(conditions).toEqual(["SSS", "SAS", "ASA", "AAS", "RHS"]);
  });
  for (const condition of ["SSS", "SAS", "ASA", "AAS", "RHS"] as const) {
    for (let level = 0; level < 3; level++) {
      it(`${condition} ${level + 1} requires a repair and accepts exact matching evidence`, () => {
        const setup = lessonSetup(condition, level);
        const start = lessonRound(condition, level);
        const goal = lessonRound(condition, level, setup.goal);
        expect(gradeEvidence(start, condition, start.required).code).toBe(
          "repair",
        );
        expect(gradeEvidence(goal, condition, goal.required).correct).toBe(
          true,
        );
        expect(goal.triangles[0].sides).not.toEqual(start.triangles[1].sides);
        goal.triangles[0].sides.forEach((side, i) =>
          expect(goal.triangles[1].sides[i]).toBeCloseTo(side, 9),
        );
        expect(
          gradeEvidence(goal, condition, goal.required.slice(1)).correct,
        ).toBe(false);
        expect(
          gradeEvidence(goal, condition, [...goal.required, goal.required[0]])
            .correct,
        ).toBe(false);
        expect(
          gradeEvidence(goal, condition, [...goal.required.slice(1), "unknown"])
            .correct,
        ).toBe(false);
      });
      it(`${condition} ${level + 1} remains valid over its entire control range`, () => {
        const setup = lessonSetup(condition, level);
        for (
          let value = setup.min;
          value <= setup.max + 1e-8;
          value += setup.step
        ) {
          const round = lessonRound(condition, level, value);
          for (const triangle of round.triangles) {
            triangle.sides.forEach((side, i) =>
              expect(
                distance(triangle.points[i], triangle.points[(i + 1) % 3]),
              ).toBeCloseTo(side, 8),
            );
            expect(
              triangle.angles.reduce((sum, angle) => sum + angle, 0),
            ).toBeCloseTo(180, 9);
            expect(
              triangle.angles.every((angle) => angle > 0 && angle < 180),
            ).toBe(true);
            triangle.angles.forEach((angle, i) => {
              const p = triangle.points[i],
                a = triangle.points[(i + 1) % 3],
                b = triangle.points[(i + 2) % 3];
              const actual =
                (Math.acos(
                  Math.max(
                    -1,
                    Math.min(
                      1,
                      ((a.x - p.x) * (b.x - p.x) + (a.y - p.y) * (b.y - p.y)) /
                        (distance(p, a) * distance(p, b)),
                    ),
                  ),
                ) *
                  180) /
                Math.PI;
              expect(actual).toBeCloseTo(angle, 7);
            });
          }
        }
      });
    }
  }
  it("distinguishes ASA from AAS using the endpoints of the given side", () => {
    const asa = lessonRound("ASA", 0, lessonSetup("ASA", 0).goal);
    const aas = lessonRound("AAS", 0, lessonSetup("AAS", 0).goal);
    expect(supports("ASA", asa.evidence)).toBe(true);
    expect(supports("AAS", asa.evidence)).toBe(false);
    expect(supports("AAS", aas.evidence)).toBe(true);
    expect(supports("ASA", aas.evidence)).toBe(false);
  });
  it("covers every condition and checks mixed questions from the marked facts", () => {
    expect(mixedRounds).toHaveLength(12);
    expect(new Set(mixedRounds.map((round) => round.id)).size).toBe(12);
    conditions.forEach((condition) =>
      expect(mixedRounds.some((round) => round.criterion === condition)).toBe(
        true,
      ),
    );
    for (const round of mixedRounds) {
      expect(
        gradeEvidence(round, round.criterion, round.required).correct,
      ).toBe(true);
      const valid = conditions.filter((condition) =>
        supports(condition, round.evidence),
      );
      expect(valid).toEqual(
        round.criterion === "insufficient" ? [] : [round.criterion],
      );
    }
  });
  it("AAA preserves shape but has genuinely different corresponding lengths", () => {
    const round = mixedRounds.find((round) => round.explanationKey === "aaa")!;
    round.triangles[0].angles.forEach((value, index) =>
      expect(round.triangles[1].angles[index]).toBeCloseTo(value, 10),
    );
    round.triangles[0].sides.forEach((value, index) =>
      expect(round.triangles[1].sides[index] / value).toBeCloseTo(1.5, 10),
    );
    expect(gradeEvidence(round, "SSS", round.required).code).toBe("aaa");
  });
  it("SSA counterexample has equal marked facts but unequal third sides", () => {
    const round = mixedRounds.find((round) => round.explanationKey === "ssa")!;
    round.evidence.forEach((evidence) =>
      expect(evidence.values[0]).toBeCloseTo(evidence.values[1], 10),
    );
    expect(round.triangles[0].sides[2]).not.toBeCloseTo(
      round.triangles[1].sides[2],
      4,
    );
    expect(gradeEvidence(round, "SAS", round.required).code).toBe(
      "includedAngle",
    );
  });
  it("RHS needs a right angle and the opposite hypotenuse, not merely any two sides", () => {
    const round = lessonRound("RHS", 0, lessonSetup("RHS", 0).goal);
    expect(supports("RHS", round.evidence)).toBe(true);
    const nonRight = round.evidence.map((e) =>
      e.kind === "angle" ? { ...e, values: [80, 80] as [number, number] } : e,
    );
    expect(supports("RHS", nonRight)).toBe(false);
    const twoLegs = mixedRounds.find((round) => round.id === "mixed-11")!;
    expect(supports("RHS", twoLegs.evidence)).toBe(false);
    expect(supports("SAS", twoLegs.evidence)).toBe(true);
  });
  it("uses a shared camera scale and rigid moves preserve distances", () => {
    for (const round of mixedRounds) {
      const drawing = sharedDrawingPoints(round, 250);
      const scale =
        distance(drawing[0][0], drawing[0][1]) / round.triangles[0].sides[0];
      drawing.forEach((points, member) => {
        const moved = rigidTransform(points, {
          x: 200,
          y: 100,
          angle: 133,
          reflected: true,
        });
        points.forEach((point, i) => {
          expect(distance(point, points[(i + 1) % 3])).toBeCloseTo(
            round.triangles[member].sides[i] * scale,
            9,
          );
          expect(distance(moved[i], moved[(i + 1) % 3])).toBeCloseTo(
            distance(point, points[(i + 1) % 3]),
            9,
          );
        });
      });
    }
  });
  it("rejects invalid rounds and nonfinite/out-of-range inputs", () => {
    expect(() => lessonSetup("SSS", -1)).toThrow();
    expect(() => lessonSetup("SSS", 3)).toThrow();
    expect(() => lessonRound("RHS", 0, NaN)).toThrow();
    expect(() => lessonRound("ASA", 0, Infinity)).toThrow();
    expect(() => lessonRound("SSS", 0, 100)).toThrow();
  });
  it("does not let rounded labels turn near equality into exact proof", () => {
    const round = lessonRound("SSS", 0, lessonSetup("SSS", 0).goal + 0.000001);
    expect(gradeEvidence(round, "SSS", round.required).correct).toBe(false);
  });
});
