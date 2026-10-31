import { describe, expect, it } from "vitest";
import {
  allMissions,
  evaluateMission,
  missions,
  type Mission,
} from "./missions";
import { defaults, type Parameters } from "./geometry";
import { labs } from "./content";

type Configuration = Partial<Parameters> & {
  rotation?: number;
  rotation2?: number;
  tertiary?: number;
};
const solutions: Record<string, Configuration> = {
  "bisector-1": { primary: 5, secondary: 0 },
  "bisector-2": { primary: 3, secondary: 0 },
  "bisector-3": { primary: 5, secondary: 0, rotation: 60 },
  "chords-1": { primary: 4, secondary: 4 },
  "chords-2": { primary: 3, secondary: 9 },
  "chords-3": { primary: 4, secondary: 4, rotation2: 60 },
  "centre-1": { primary: 80, secondary: 50 },
  "centre-2": { primary: 120, secondary: 50, alternate: true },
  "centre-3": { primary: 130, secondary: 25 },
  "segment-1": { primary: 120, secondary: 74, tertiary: 32, alternate: false },
  "segment-2": { primary: 120, secondary: 74, tertiary: 32, alternate: true },
  "segment-3": { primary: 90, secondary: 85, tertiary: 15, alternate: false },
  "semicircle-1": { primary: 180, secondary: 50 },
  "semicircle-2": { primary: 180, secondary: 50, rotation: 60 },
  "semicircle-3": { primary: 120, secondary: 50 },
  "equal-arcs-1": { primary: 90, secondary: 90 },
  "equal-arcs-2": { primary: 60, secondary: 60 },
  "equal-arcs-3": { primary: 240, secondary: 240 },
  "ratios-1": { primary: 120, secondary: 60, alternate: false },
  "ratios-2": { primary: 120, secondary: 60, alternate: true },
  "ratios-3": { primary: 180, secondary: 60 },
};
const mission = (id: string) => allMissions.find((item) => item.id === id)!;
const evaluate = (id: string, parameters: Configuration) =>
  evaluateMission(mission(id), { ...defaults[mission(id).lab], ...parameters });

describe("geometry target missions", () => {
  it("provides three distinct, actionable missions per investigation", () => {
    expect(allMissions).toHaveLength(21);
    expect(new Set(allMissions.map((item) => item.id)).size).toBe(21);
    expect(Object.keys(solutions).sort()).toEqual(
      allMissions.map((item) => item.id).sort(),
    );
    for (const lab of labs) {
      expect(missions[lab.id]).toHaveLength(3);
      for (const item of missions[lab.id]) {
        expect(item.lab).toBe(lab.id);
        expect(item.instruction.length).toBeGreaterThan(15);
        expect(item.hint.length).toBeGreaterThan(15);
        expect(item.target.length).toBeGreaterThan(10);
      }
    }
  });

  it.each(allMissions)(
    "$id can be achieved by an actual circle configuration",
    (item) => {
      expect(
        evaluateMission(item, { ...defaults[item.lab], ...solutions[item.id] }),
      ).toMatchObject({ complete: true });
    },
  );

  it.each(allMissions)(
    "$id does not award a task for the untouched starting diagram",
    (item) => {
      expect(evaluateMission(item, defaults[item.lab]).complete).toBe(false);
    },
  );

  it("requires the midpoint, not just an almost perpendicular-looking diagram", () => {
    expect(evaluate("bisector-1", { primary: 5, secondary: 8 }).complete).toBe(
      false,
    );
    expect(evaluate("bisector-2", { primary: 8, secondary: 0 }).complete).toBe(
      false,
    );
    expect(
      evaluate("bisector-3", { primary: 5, secondary: 0, rotation: 0 })
        .complete,
    ).toBe(false);
    expect(
      evaluate("bisector-1", { primary: -5, secondary: 0, rotation: 213 })
        .complete,
    ).toBe(true);
  });

  it("compares unsigned perpendicular distances and chord directions geometrically", () => {
    expect(
      evaluate("chords-1", {
        primary: 4,
        secondary: -4,
        rotation: 40,
        rotation2: 120,
      }).complete,
    ).toBe(true);
    expect(evaluate("chords-1", { primary: 4, secondary: 6 }).complete).toBe(
      false,
    );
    expect(
      evaluate("chords-3", {
        primary: 4,
        secondary: 4,
        rotation: 10,
        rotation2: 10,
      }).complete,
    ).toBe(false);
    expect(evaluate("chords-2", { primary: 9, secondary: 3 }).complete).toBe(
      false,
    );
  });

  it("selects the intercepted arc for a reflex centre target", () => {
    expect(
      evaluate("centre-2", { primary: 120, alternate: false }).complete,
    ).toBe(false);
    expect(
      evaluate("centre-2", { primary: 240, alternate: false, rotation: 110 })
        .complete,
    ).toBe(true);
    expect(
      evaluate("centre-3", { primary: 130, secondary: 50, rotation: 0 })
        .complete,
    ).toBe(false);
  });

  it("checks same-side conditions and vertex separation rather than a toggle alone", () => {
    expect(
      evaluate("segment-1", { primary: 120, alternate: true }).complete,
    ).toBe(false);
    expect(
      evaluate("segment-2", { primary: 120, alternate: false }).complete,
    ).toBe(false);
    expect(
      evaluate("segment-3", { primary: 90, secondary: 51, tertiary: 50 })
        .complete,
    ).toBe(false);
    expect(
      evaluate("segment-1", { ...solutions["segment-1"], rotation: 290 })
        .complete,
    ).toBe(true);
  });

  it("requires a real diameter and a steep orientation for the tilted task", () => {
    expect(evaluate("semicircle-1", { primary: 150 }).complete).toBe(false);
    expect(
      evaluate("semicircle-2", { primary: 180, rotation: 0 }).complete,
    ).toBe(false);
    expect(evaluate("semicircle-3", { primary: 180 }).complete).toBe(false);
    expect(
      evaluate("semicircle-1", { primary: 180, secondary: 25, rotation: 211 })
        .complete,
    ).toBe(true);
  });

  it("distinguishes major arcs from minor arcs even when their chords match", () => {
    expect(
      evaluate("equal-arcs-2", { primary: 300, secondary: 300 }).complete,
    ).toBe(false);
    expect(
      evaluate("equal-arcs-3", { primary: 120, secondary: 120 }).complete,
    ).toBe(false);
    expect(
      evaluate("equal-arcs-1", {
        primary: 90,
        secondary: 90,
        rotation: 65,
        rotation2: 140,
      }).complete,
    ).toBe(true);
  });

  it("requires the selected angle mode and does not confuse chord ratios with arc ratios", () => {
    expect(
      evaluate("ratios-1", { primary: 120, secondary: 60, alternate: true })
        .complete,
    ).toBe(false);
    expect(
      evaluate("ratios-2", { primary: 120, secondary: 60, alternate: false })
        .complete,
    ).toBe(false);
    expect(evaluate("ratios-3", { primary: 60, secondary: 20 }).complete).toBe(
      false,
    );
    expect(
      evaluate("ratios-3", {
        primary: 180,
        secondary: 60,
        alternate: true,
        rotation: 20,
        rotation2: 50,
      }).complete,
    ).toBe(true);
  });

  it("rejects an unsupported or mismatched mission and gives useful feedback", () => {
    expect(
      evaluateMission(
        { ...mission("centre-1"), id: "invented" },
        defaults.centre,
      ).complete,
    ).toBe(false);
    expect(
      evaluateMission(
        { ...mission("centre-1"), lab: "chords" } as Mission,
        defaults.chords,
      ).complete,
    ).toBe(false);
    expect(evaluate("centre-1", defaults.centre).feedback).toBe(
      mission("centre-1").hint,
    );
    expect(evaluate("centre-1", solutions["centre-1"]).feedback).toContain(
      "tolerance",
    );
  });
});
