import { describe, expect, it } from "vitest";
import { renderToString } from "katex";
import {
  gradeEvidence,
  lessonRound,
  lessonSetup,
  lessonSolved,
  mixedRounds,
  triangleFromAngles,
  triangleFromSides,
  type Criterion,
  type Mission,
  type Round,
  type Triangle,
} from "../../src/apps/similarity/games/model";

const names: [string, string, string] = ["A", "B", "C"];
const missions: Mission[] = ["aaa", "sides", "included"];

function verifyGeometry(triangle: Triangle) {
  expect(triangle.points).toHaveLength(3);
  expect(triangle.angles.reduce((sum, angle) => sum + angle, 0)).toBeCloseTo(
    180,
    10,
  );
  triangle.points.forEach((point, index) => {
    const previous = triangle.points[(index + 2) % 3];
    const next = triangle.points[(index + 1) % 3];
    const u = [previous.x - point.x, previous.y - point.y];
    const v = [next.x - point.x, next.y - point.y];
    const angle =
      (Math.atan2(
        Math.abs(u[0] * v[1] - u[1] * v[0]),
        u[0] * v[0] + u[1] * v[1],
      ) *
        180) /
      Math.PI;
    expect(point.label).toBe(triangle.names[index]);
    expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
    expect(Math.hypot(v[0], v[1])).toBeCloseTo(triangle.sides[index], 10);
    expect(angle).toBeCloseTo(triangle.angles[index], 10);
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThan(180);
  });
}

function selected(round: Round) {
  return round.evidence.map((clue) => clue.id);
}

describe("similarity game geometry", () => {
  it("places AB, BC and CA in their named order for a 3-4-5 triangle", () => {
    const triangle = triangleFromSides([3, 4, 5], names);
    expect(triangle.sides).toEqual([3, 4, 5]);
    expect(triangle.angles[0]).toBeCloseTo(53.13010235415598, 10);
    expect(triangle.angles[1]).toBeCloseTo(90, 10);
    expect(triangle.angles[2]).toBeCloseTo(36.86989764584402, 10);
    verifyGeometry(triangle);
  });

  it("constructs a 30-60-90 triangle from angles with AB as the supplied base", () => {
    const triangle = triangleFromAngles([30, 60, 90], names, 6);
    expect(triangle.angles).toEqual([30, 60, 90]);
    expect(triangle.sides[0]).toBe(6);
    expect(triangle.sides[1]).toBeCloseTo(3, 12);
    expect(triangle.sides[2]).toBeCloseTo(3 * Math.sqrt(3), 12);
    verifyGeometry(triangle);
  });

  it.each([
    [0, 2, 2],
    [-1, 2, 2],
    [1, 2, 3],
    [1, 2, 4],
    [NaN, 3, 4],
    [Infinity, 3, 4],
  ])("rejects invalid side lengths %s, %s, %s", (a, b, c) => {
    expect(() => triangleFromSides([a, b, c], names)).toThrow(RangeError);
  });

  it.each([
    [0, 90, 90],
    [60, 60, 61],
    [-10, 90, 100],
    [NaN, 90, 90],
    [Infinity, 45, 45],
  ])("rejects invalid angles %s, %s, %s", (a, b, c) => {
    expect(() => triangleFromAngles([a, b, c], names)).toThrow(RangeError);
  });

  it.each([0, -1, NaN, Infinity])("rejects invalid base %s", (base) => {
    expect(() => triangleFromAngles([60, 60, 60], names, base)).toThrow(
      RangeError,
    );
  });
});

describe("repair lessons", () => {
  it.each(missions)(
    "requires repair before accepting the %s evidence",
    (mission) => {
      for (let level = 0; level < 3; level++) {
        const setup = lessonSetup(mission, level);
        const start = lessonRound(mission, level);
        const solved = lessonRound(mission, level, setup.goal);
        start.triangles.forEach(verifyGeometry);
        solved.triangles.forEach(verifyGeometry);
        expect(start.triangles.map((triangle) => triangle.names)).toEqual([
          ["A", "B", "C"],
          ["D", "E", "F"],
        ]);
        expect(lessonSolved(start)).toBe(false);
        expect(start.proof).toEqual([]);
        expect(gradeEvidence(start, mission, start.required)).toEqual({
          correct: false,
          code: "repair",
        });
        expect(lessonSolved(solved)).toBe(true);
        expect(gradeEvidence(solved, mission, solved.required)).toEqual({
          correct: true,
          code: "correct",
        });
        expect(solved.proof.length).toBeGreaterThan(0);
      }
    },
  );

  it("gives the first side repair the exact target FD = 14", () => {
    const initial = lessonRound("sides", 0);
    const repaired = lessonRound("sides", 0, { thirdSide: 14 });
    expect(initial.triangles[0].sides).toEqual([6, 5, 7]);
    expect(initial.triangles[1].sides).toEqual([12, 10, 13]);
    expect(repaired.triangles[1].sides).toEqual([12, 10, 14]);
    expect(lessonSolved(repaired)).toBe(true);
    expect(
      lessonSolved(lessonRound("sides", 0, { thirdSide: 14.000001 })),
    ).toBe(false);
  });

  it("keeps the hinge at the common vertex of AB/BC and DE/EF", () => {
    const initial = lessonRound("included", 0);
    expect(initial.triangles[0].sides.slice(0, 2)).toEqual([6, 4]);
    expect(initial.triangles[1].sides.slice(0, 2)).toEqual([12, 8]);
    expect(initial.triangles[0].angles[1]).toBeCloseTo(60, 12);
    expect(initial.triangles[1].angles[1]).toBeCloseTo(65, 12);
    expect(initial.required).toEqual(["side-0", "side-1", "angle-1"]);
    expect(lessonSolved(lessonRound("included", 0, { hinge: 60 }))).toBe(true);
    expect(lessonSolved(lessonRound("included", 0, { hinge: 60.000001 }))).toBe(
      false,
    );
  });

  it("requires all three AAA angle clues and preserves their exact assigned values", () => {
    const round = lessonRound("aaa", 0, { angleA: 60, angleB: 50 });
    expect(round.triangles[1].angles).toEqual([60, 50, 70]);
    expect(round.required).toEqual(["angle-0", "angle-1", "angle-2"]);
    expect(gradeEvidence(round, "aaa", ["angle-0", "angle-1"])).toEqual({
      correct: false,
      code: "evidence",
    });
  });

  it("derives the lesson's third angles from 180 degrees before using AAA", () => {
    const round = lessonRound("aaa", 0, { angleA: 60, angleB: 50 });
    const derived = round.proof.filter((line) => line.reasonKey === "angleSum");
    expect(derived.map((line) => line.tex)).toEqual([
      "\\angle BCA = 180^{\\circ} - 60^{\\circ} - 50^{\\circ} = 70^{\\circ}",
      "\\angle EFD = 180^{\\circ} - 60^{\\circ} - 50^{\\circ} = 70^{\\circ}",
      "\\angle BCA = \\angle EFD = 70^{\\circ}",
    ]);
    expect(derived[0]).toMatchObject({
      evidence: ["angle-0", "angle-1", "angle-2"],
      members: [0],
    });
    expect(derived[1]).toMatchObject({
      evidence: ["angle-0", "angle-1", "angle-2"],
      members: [1],
    });
    expect(derived[2].evidence).toEqual(["angle-2"]);
    for (const line of derived) {
      expect(() =>
        renderToString(line.tex, { throwOnError: true, strict: "error" }),
      ).not.toThrow();
    }
  });

  it.each(missions)(
    "keeps every combination of %s slider bounds a valid triangle",
    (mission) => {
      for (let level = 0; level < 3; level++) {
        const { start, limits } = lessonSetup(mission, level);
        const controls = Object.entries(limits);
        for (let mask = 0; mask < 2 ** controls.length; mask++) {
          const values = { ...start };
          controls.forEach(([key, limit], index) => {
            values[key as keyof typeof values] =
              mask & (1 << index) ? limit.max : limit.min;
          });
          lessonRound(mission, level, values).triangles.forEach(verifyGeometry);
        }
      }
    },
  );

  it("rejects out-of-range lesson indices and invalid geometry changes", () => {
    expect(() => lessonSetup("aaa", 3)).toThrow(RangeError);
    expect(() => lessonRound("sides", -1)).toThrow(RangeError);
    expect(() => lessonRound("aaa", 0, { angleA: 120, angleB: 100 })).toThrow(
      RangeError,
    );
    expect(() => lessonRound("sides", 0, { thirdSide: 50 })).toThrow(
      RangeError,
    );
    expect(() => lessonRound("included", 0, { hinge: 180 })).toThrow(
      RangeError,
    );
  });
});

describe("mixed evidence rounds", () => {
  it("contains twelve valid rounds with three examples of each evidence decision", () => {
    expect(mixedRounds).toHaveLength(12);
    expect(new Set(mixedRounds.map((round) => round.id)).size).toBe(12);
    for (const criterion of [
      "aaa",
      "sides",
      "included",
      "insufficient",
    ] as const) {
      expect(
        mixedRounds.filter((round) => round.criterion === criterion),
      ).toHaveLength(3);
    }
    for (const round of mixedRounds) {
      round.triangles.forEach(verifyGeometry);
      expect(new Set(selected(round)).size).toBe(round.evidence.length);
      for (const clue of round.evidence) {
        expect(clue.index).toBeGreaterThanOrEqual(0);
        expect(clue.index).toBeLessThan(3);
        const field = clue.kind === "angle" ? "angles" : "sides";
        clue.values.forEach((value, index) => {
          expect(value).toBeCloseTo(
            round.triangles[index][field][clue.index],
            10,
          );
        });
      }
      expect(
        gradeEvidence(round, round.criterion, round.required).correct,
      ).toBe(true);
    }
  });

  it("checks the actual three equal angles or proportional sides in sufficient givens", () => {
    for (const round of mixedRounds.filter(
      (round) => round.criterion !== "insufficient",
    )) {
      const sides = round.evidence.filter((clue) => clue.kind === "side");
      const angles = round.evidence.filter((clue) => clue.kind === "angle");
      expect(sides).toHaveLength(
        round.criterion === "aaa" ? 0 : round.criterion === "sides" ? 3 : 2,
      );
      expect(angles).toHaveLength(
        round.criterion === "aaa" ? 3 : round.criterion === "sides" ? 0 : 1,
      );
      angles.forEach((clue) =>
        expect(clue.values[0]).toBeCloseTo(clue.values[1], 11),
      );
      sides.forEach((clue) => {
        expect(clue.values[0] * sides[0].values[1]).toBeCloseTo(
          sides[0].values[0] * clue.values[1],
          10,
        );
        if (round.criterion === "included") {
          expect([clue.index, (clue.index + 1) % 3]).toContain(angles[0].index);
        }
      });
    }
  });

  it("does not infer missing givens from an actually similar drawing", () => {
    const twoSides = mixedRounds.find(
      (round) => round.explanationKey === "twoSides",
    )!;
    const [a, b] = twoSides.triangles;
    expect(a.sides[0] / b.sides[0]).toBeCloseTo(a.sides[2] / b.sides[2], 12);
    expect(gradeEvidence(twoSides, "sides", selected(twoSides))).toEqual({
      correct: false,
      code: "condition",
    });
    expect(
      gradeEvidence(twoSides, "insufficient", selected(twoSides)).correct,
    ).toBe(true);
  });

  it("uses a real ambiguous SSA counterexample with an equal non-included angle", () => {
    const round = mixedRounds.find(
      (round) => round.explanationKey === "nonIncluded",
    )!;
    const angle = round.evidence.find((clue) => clue.kind === "angle")!;
    const sides = round.evidence.filter((clue) => clue.kind === "side");
    expect(angle.values[0]).toBeCloseTo(30, 10);
    expect(angle.values[1]).toBeCloseTo(30, 10);
    expect(sides.map((clue) => clue.index)).toEqual([0, 1]);
    expect(angle.index).toBe(0);
    expect(round.triangles[0].angles[1]).not.toBeCloseTo(
      round.triangles[1].angles[1],
      3,
    );
    expect(gradeEvidence(round, "included", selected(round))).toEqual({
      correct: false,
      code: "included",
    });
    expect(gradeEvidence(round, "insufficient", selected(round)).correct).toBe(
      true,
    );
    // Relabelling this round cannot turn a non-included angle into the included angle.
    expect(
      gradeEvidence(
        { ...round, criterion: "included" },
        "included",
        selected(round),
      ),
    ).toEqual({ correct: false, code: "included" });
  });

  it("rejects missing, duplicate, unknown and wrong-condition evidence choices", () => {
    for (const round of mixedRounds) {
      for (const ids of [
        [],
        round.required.slice(1),
        [...round.required, round.required[0]],
        [...round.required, "unknown"],
      ]) {
        expect(
          gradeEvidence(round, round.criterion, ids).correct,
          round.id,
        ).toBe(false);
      }
      const wrong: Criterion = round.criterion === "aaa" ? "sides" : "aaa";
      expect(
        gradeEvidence(round, wrong, round.required).correct,
        round.id,
      ).toBe(false);
    }
  });

  it("renders proof expressions with named correspondence and stacked side fractions", () => {
    for (const round of mixedRounds) {
      for (const line of round.proof) {
        expect(() =>
          renderToString(line.tex, { throwOnError: true, strict: "error" }),
        ).not.toThrow();
        expect(line.evidence.every((id) => selected(round).includes(id))).toBe(
          true,
        );
        expect(line.tex).not.toContain("/");
      }
      if (round.criterion !== "insufficient") {
        const result = round.proof.at(-1)!;
        expect(result.tex).toBe(
          `\\triangle ${round.triangles[0].names.join("")} \\sim \\triangle ${round.triangles[1].names.join("")}`,
        );
      }
      if (round.criterion === "sides" || round.criterion === "included") {
        expect(round.proof.some((line) => line.tex.includes("\\frac{"))).toBe(
          true,
        );
      }
    }
  });

  it("never mutates source triangles, setup objects or the shared authored rounds", () => {
    const sideInput: [number, number, number] = [3, 4, 5];
    const nameInput: [string, string, string] = ["A", "B", "C"];
    const triangle = triangleFromSides(sideInput, nameInput);
    triangle.sides[0] = 200;
    triangle.names[0] = "X";
    expect(sideInput).toEqual([3, 4, 5]);
    expect(nameInput).toEqual(["A", "B", "C"]);
    const setup = lessonSetup("sides", 0);
    setup.goal.thirdSide = 99;
    expect(lessonSetup("sides", 0).goal.thirdSide).toBe(14);
    const before = JSON.stringify(mixedRounds);
    for (const round of mixedRounds) {
      const evidence = [...round.required].reverse();
      const saved = [...evidence];
      gradeEvidence(round, round.criterion, evidence);
      expect(evidence).toEqual(saved);
    }
    expect(JSON.stringify(mixedRounds)).toBe(before);
  });
});
