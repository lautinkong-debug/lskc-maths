import { describe, expect, it } from "vitest";
import type { LabId } from "./content";
import {
  angleAt,
  defaults,
  distance,
  dragParameter,
  getModel,
  getScene,
  normalise,
  UNIT,
  type DragKey,
  type Parameters,
} from "./geometry";
import { evaluateMission, missions } from "./missions";
import { snapParameters } from "./snapping";

const shape = (lab: LabId, changes: Partial<Parameters>) =>
  normalise(lab, { ...defaults[lab], ...changes });
const angleP = (lab: LabId, parameters: Parameters) => {
  const s = getScene(lab, parameters).points;
  return angleAt(s.A, s.P, s.B);
};
const samePoint = (
  lab: LabId,
  before: Parameters,
  after: Parameters,
  key: string,
) =>
  expect(
    distance(
      getScene(lab, before).points[key],
      getScene(lab, after).points[key],
    ),
  ).toBeLessThan(1e-9);

describe("magnetic precision assistance", () => {
  it.each([0.2, 4, 9.7, -0.2, -4, -9.7])(
    "constructs an exact perpendicular and equal halves for signed chord offset %s",
    (primary) => {
      const before = shape("bisector", { primary, secondary: 2, rotation: 57 });
      const result = snapParameters("bisector", before, "N", 2);
      expect(result.label).toContain("90°");
      const s = getScene("bisector", result.parameters).points;
      expect(angleAt(s.O, s.N, s.B)).toBeCloseTo(90, 10);
      expect(distance(s.A, s.N)).toBeCloseTo(distance(s.N, s.B), 10);
      samePoint("bisector", before, result.parameters, "A");
      samePoint("bisector", before, result.parameters, "B");
    },
  );

  it("can enter and leave the midpoint magnet using pointer-derived candidates", () => {
    const before = shape("bisector", { rotation: 43, secondary: 25 });
    const midpointScene = getScene("bisector", {
      ...before,
      secondary: 0,
    }).points;
    const nearby = { x: midpointScene.N.x + 2, y: midpointScene.N.y + 2 };
    const entered = snapParameters(
      "bisector",
      dragParameter("bisector", before, "N", nearby),
      "N",
    );
    expect(entered.parameters.secondary).toBe(0);
    const away = getScene("bisector", { ...before, secondary: 25 }).points.N;
    const released = snapParameters(
      "bisector",
      dragParameter("bisector", entered.parameters, "N", away),
      "N",
    );
    expect(released.label).toBeNull();
    expect(released.parameters.secondary).toBeCloseTo(25, 10);
  });

  it("supports the midpoint slider but does not solve length or slant requirements", () => {
    const p = shape("bisector", { primary: 8, secondary: 1, rotation: 0 });
    const result = snapParameters("bisector", p, "secondary", 2);
    expect(result.parameters.secondary).toBe(0);
    expect(result.parameters.primary).toBe(8);
    expect(
      evaluateMission(missions.bisector[2], result.parameters).complete,
    ).toBe(false);
    expect(snapParameters("bisector", p, "A").label).toBeNull();
  });

  it.each([
    ["M", 4.2, -4],
    ["primary", -4.2, 4],
    ["N", 4, -4.2],
    ["secondary", -4, 4.2],
  ] as [DragKey, number, number][])(
    "matches exact chord lengths and absolute distances through %s",
    (key, primary, secondary) => {
      const p = shape("chords", {
        primary,
        secondary,
        rotation: 25,
        rotation2: 112,
      });
      const result = snapParameters("chords", p, key);
      const s = getScene("chords", result.parameters).points;
      expect(result.label).toContain("AB = CD");
      expect(distance(s.A, s.B)).toBeCloseTo(distance(s.C, s.D), 10);
      expect(distance(s.O, s.M)).toBeCloseTo(distance(s.O, s.N), 10);
      expect(result.parameters.rotation).toBe(p.rotation);
      expect(result.parameters.rotation2).toBe(p.rotation2);
      expect(Math.sign(result.parameters.primary)).toBe(Math.sign(primary));
      expect(Math.sign(result.parameters.secondary)).toBe(Math.sign(secondary));
    },
  );

  it.each(["A", "B", "C", "D"] as DragKey[])(
    "matches chords while preserving the opposite endpoint when dragging %s",
    (key) => {
      const second = key === "C" || key === "D";
      const p = shape("chords", {
        primary: second ? 4 : 4.2,
        secondary: second ? -4.2 : -4,
        rotation: 359,
        rotation2: 178,
      });
      const result = snapParameters("chords", p, key);
      const opposite = { A: "B", B: "A", C: "D", D: "C" }[
        key as "A" | "B" | "C" | "D"
      ];
      expect(result.label).not.toBeNull();
      samePoint("chords", p, result.parameters, opposite);
      for (const other of second ? ["A", "B"] : ["C", "D"])
        samePoint("chords", p, result.parameters, other);
      const s = getScene("chords", result.parameters).points;
      expect(distance(s.A, s.B)).toBeCloseTo(distance(s.C, s.D), 10);
    },
  );

  it("avoids a large endpoint jump near a tangent despite close offset values", () => {
    const p = shape("chords", { primary: 9.8, secondary: 9.46 });
    expect(snapParameters("chords", p, "A").label).toBeNull();
    expect(snapParameters("chords", p, "M").parameters.primary).toBe(9.46);
  });

  it.each([
    ["centre", 0, 40],
    ["centre", 1, 120],
    ["centre", 2, 65],
    ["segment", 0, 60],
    ["segment", 1, 60],
    ["segment", 2, 45],
    ["semicircle", 0, 90],
    ["semicircle", 1, 90],
    ["semicircle", 2, 60],
  ] as [LabId, number, number][])(
    "reaches the exact angle for %s mission %s without changing side choices",
    (lab, mission, target) => {
      for (const alternate of [false, true]) {
        const sweep =
          lab !== "segment" && alternate ? 360 - target * 2 : target * 2;
        const p = shape(lab, {
          primary: sweep + 2.8,
          alternate,
          rotation: 33,
          secondary: 45,
        });
        const result = snapParameters(lab, p, "primary", mission);
        expect(result.label).toContain(`${target}°`);
        expect(angleP(lab, result.parameters)).toBeCloseTo(target, 9);
        expect(result.parameters.alternate).toBe(alternate);
        expect(result.parameters.rotation).toBe(p.rotation);
      }
    },
  );

  it.each([
    "centre",
    "segment",
    "semicircle",
    "equal-arcs",
    "ratios",
  ] as LabId[])(
    "keeps the other endpoint stationary across the angle wrap in %s",
    (lab) => {
      for (const key of ["A", "B"] as DragKey[]) {
        const p = shape(lab, { primary: 178, secondary: 60, rotation: 359 });
        const result = snapParameters(lab, p, key);
        expect(result.label).not.toBeNull();
        expect(result.parameters.primary).toBe(180);
        samePoint(lab, p, result.parameters, key === "A" ? "B" : "A");
      }
    },
  );

  it.each(["C", "D"] as DragKey[])(
    "preserves the other arc and stationary second-pair endpoint for %s",
    (key) => {
      const p = shape("equal-arcs", {
        primary: 65,
        secondary: 238,
        rotation2: 359,
      });
      const result = snapParameters("equal-arcs", p, key, 2);
      expect(result.parameters.secondary).toBe(240);
      for (const fixed of ["A", "B", key === "C" ? "D" : "C"])
        samePoint("equal-arcs", p, result.parameters, fixed);
    },
  );

  it.each([0, 1, 2])("constructs the exact equal-arc mission %s", (mission) => {
    const target = [90, 60, 240][mission];
    let p: Parameters = shape("equal-arcs", {
      primary: target + 2,
      secondary: target - 3,
    });
    p = snapParameters("equal-arcs", p, "primary", mission).parameters;
    p = snapParameters("equal-arcs", p, "secondary", mission).parameters;
    expect(p.primary).toBe(target);
    expect(p.secondary).toBe(target);
    expect(evaluateMission(missions["equal-arcs"][mission], p).complete).toBe(
      true,
    );
    if (mission === 1) {
      const s = getScene("equal-arcs", p).points;
      expect(distance(s.A, s.B) / UNIT).toBeCloseTo(10, 10);
      expect(distance(s.C, s.D) / UNIT).toBeCloseTo(10, 10);
    }
  });

  it("prioritises the stated target over a nearby matching arc", () => {
    const p = shape("equal-arcs", { primary: 88, secondary: 87 });
    const result = snapParameters("equal-arcs", p, "primary", 0);
    expect(result.parameters.primary).toBe(90);
    expect(result.parameters.secondary).toBe(87);
  });

  it("distinguishes equal selected arcs from complementary sweeps with equal chords", () => {
    const p = shape("equal-arcs", { primary: 101.5, secondary: 257 });
    const result = snapParameters("equal-arcs", p, "primary");
    expect(result.parameters.primary).toBe(103);
    expect(result.label).toContain("different selected arcs");
    const s = getScene("equal-arcs", result.parameters).points;
    expect(distance(s.A, s.B)).toBeCloseTo(distance(s.C, s.D), 10);
    expect(result.parameters.primary).not.toBe(result.parameters.secondary);
  });

  it.each([0, 1, 2])("constructs an exact ratio in mission %s", (mission) => {
    const ratio = mission === 2 ? 3 : 2;
    for (const key of ["primary", "secondary"] as const) {
      const p = shape("ratios", {
        primary: ratio * 61 + (key === "primary" ? 2 : 0),
        secondary: 61 + (key === "secondary" ? 1 : 0),
        alternate: mission === 1,
      });
      const result = snapParameters("ratios", p, key, mission);
      expect(
        result.parameters.primary / result.parameters.secondary,
      ).toBeCloseTo(ratio, 12);
      const m = getModel("ratios", result.parameters).measurements;
      expect(m.find((v) => v.label === "Angle ratio")!.value).toBeCloseTo(
        ratio,
        10,
      );
      expect(
        evaluateMission(missions.ratios[mission], result.parameters).complete,
      ).toBe(true);
    }
  });

  it("does not claim an impossible ratio or alter a far-away geometry", () => {
    const p = shape("ratios", { primary: 336, secondary: 120 });
    const result = snapParameters("ratios", p, "primary", 2);
    expect(result.label).toBeNull();
    expect(result.parameters).toEqual(p);
    const unequal = shape("chords", { primary: 2, secondary: 7 });
    expect(snapParameters("chords", unequal, "M").parameters).toEqual(unequal);
    expect(
      snapParameters("centre", shape("centre", { primary: 101 }), "primary", 0)
        .label,
    ).toBeNull();
  });

  it("never changes a shape in response to rotation or circumference-viewpoint controls", () => {
    const p = shape("centre", { primary: 82 });
    for (const key of [
      "P",
      "Q",
      "secondary",
      "tertiary",
      "rotation",
      "rotation2",
    ] as DragKey[]) {
      const result = snapParameters("centre", p, key, 0);
      expect(result.label).toBeNull();
      expect(result.parameters).toEqual(p);
    }
  });
});
