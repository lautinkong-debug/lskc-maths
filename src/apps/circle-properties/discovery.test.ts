import { describe, expect, it } from "vitest";
import { labs } from "./content";
import { allMissions, evaluateMission } from "./missions";
import { angleAt, defaults, distance, getScene, UNIT } from "./geometry";
import {
  checkDiscovery,
  discoveryChallenge,
  emptyDiscoverySession,
  missionHints,
  missionPrompt,
  parseDiscoverySession,
  type ChallengeLevel,
} from "./discovery";

const levels: ChallengeLevel[] = ["support", "core", "stretch"];
const cases = labs.flatMap((lab) =>
  levels.flatMap((level) =>
    [0, 1, 2].map((i) => discoveryChallenge(lab.id, level, i)),
  ),
);

describe("new-case discovery challenges", () => {
  it("offers support, core and stretch in every playground with bounded variants", () => {
    expect(cases).toHaveLength(63);
    expect(new Set(cases.map((card) => card.id)).size).toBe(63);
    expect(new Set(cases.map((card) => card.kind))).toEqual(
      new Set(["Predict", "Keep it unchanged", "Test a condition"]),
    );
    for (const card of cases) {
      expect(card.prompt.length).toBeGreaterThan(40);
      expect(card.explanation.length).toBeGreaterThan(30);
      expect(card.hint.length).toBeGreaterThan(15);
      expect(card.wrongFeedback.length).toBeGreaterThan(20);
    }
  });

  it.each(cases)(
    "$id accepts its correct response and rejects a plausible alternative",
    (card) => {
      expect(checkDiscovery(card, String(card.answer)).correct).toBe(true);
      if (typeof card.answer === "number") {
        expect(checkDiscovery(card, String(card.answer + 1)).correct).toBe(
          false,
        );
        expect(checkDiscovery(card, "").correct).toBe(false);
        expect(checkDiscovery(card, "Infinity").correct).toBe(false);
        expect(checkDiscovery(card, `${card.answer} cm`).correct).toBe(false);
      } else {
        for (const option of card.choices ?? []) {
          const result = checkDiscovery(card, option.id);
          expect(result.correct).toBe(option.id === card.answer);
          if (!result.correct) expect(result.feedback).toBe(option.feedback);
        }
        expect(checkDiscovery(card, "unsupported").correct).toBe(false);
      }
    },
  );

  it("checks numerical predictions against independently measured demonstration coordinates", () => {
    for (const card of cases) {
      if (!card.experiment || typeof card.answer !== "number") continue;
      const scene = getScene(card.lab, card.experiment);
      const p = scene.points;
      const cm = (a: string, b: string) => distance(p[a], p[b]) / UNIT;
      let measured: number;
      switch (card.lab) {
        case "bisector":
          measured =
            card.level === "support" ? cm("A", "N") : angleAt(p.O, p.N, p.B);
          break;
        case "chords":
          measured = cm("O", "N");
          break;
        case "centre":
          measured =
            card.level === "support"
              ? Math.abs(scene.arcs[0].sweep)
              : angleAt(p.A, p.P, p.B);
          break;
        case "segment":
          measured = angleAt(p.A, p.Q, p.B);
          break;
        case "semicircle":
          measured = angleAt(p.A, p.P, p.B);
          break;
        case "equal-arcs":
          measured =
            card.level === "support"
              ? cm("C", "D")
              : card.level === "core"
                ? angleAt(p.C, p.O, p.D)
                : Math.abs(scene.arcs[1].sweep / scene.arcs[0].sweep);
          break;
        case "ratios":
          measured =
            card.level === "stretch"
              ? cm("A", "B") / cm("C", "D")
              : card.level === "core"
                ? angleAt(p.A, p.P, p.B) / angleAt(p.C, p.Q, p.D)
                : Math.abs(scene.arcs[0].sweep / scene.arcs[1].sweep);
          break;
      }
      expect(measured, card.id).toBeCloseTo(card.answer, 6);
    }
  });

  it("maintains circumference angles under a fixed-arc viewpoint change", () => {
    const card = discoveryChallenge("centre", "stretch");
    const first = getScene(card.lab, card.experiment!);
    const second = getScene(card.lab, { ...card.experiment!, secondary: 75 });
    const angle = (scene: typeof first) =>
      angleAt(scene.points.A, scene.points.P, scene.points.B);
    expect(angle(first)).toBeCloseTo(angle(second), 8);
    expect(checkDiscovery(card, "larger").correct).toBe(false);
  });

  it("uses genuinely different radii to refute the equidistant chord inference", () => {
    const chordSmall = 2 * Math.sqrt(5 ** 2 - 3 ** 2);
    const chordLarge = 2 * Math.sqrt(10 ** 2 - 3 ** 2);
    expect(chordSmall).toBe(8);
    expect(chordLarge).not.toBeCloseTo(chordSmall);
    expect(
      checkDiscovery(discoveryChallenge("chords", "stretch"), "no").correct,
    ).toBe(true);
  });

  it("keeps the new-case circle radius explicit for the converse question", () => {
    const card = discoveryChallenge("semicircle", "core");
    expect(card.prompt).toContain("radius 7 cm");
    expect(card.answer).toBe(14);
    expect(card.experiment).toBeUndefined(); // Main explorer has radius 10 cm.
  });

  it("does not reveal the paired theorem result in initial operation targets", () => {
    const target = (id: string) =>
      missionPrompt(allMissions.find((m) => m.id === id)!);
    expect(target("bisector-1")).not.toContain("AN = NB");
    expect(target("centre-1")).not.toContain("80");
    expect(target("centre-2")).not.toContain("240");
    expect(target("segment-2")).not.toContain("120");
    expect(target("semicircle-1")).not.toContain("20 cm");
    expect(target("ratios-1")).not.toContain("different");
    for (const mission of allMissions)
      expect(missionHints(mission)).toHaveLength(3);
  });

  it("does not hide a minimum chord-ratio difference inside an arc-ratio goal", () => {
    const mission = allMissions.find((item) => item.id === "ratios-1")!;
    const parameters = { ...defaults.ratios, primary: 40, secondary: 20 };
    const scene = getScene("ratios", parameters);
    const p = scene.points;
    const chordRatio = distance(p.A, p.B) / distance(p.C, p.D);
    expect(Math.abs(chordRatio - 2)).toBeLessThan(0.08);
    expect(evaluateMission(mission, parameters).complete).toBe(true);
  });
});

describe("discovery workspace restoration", () => {
  it("preserves answers, reveal state, support level and progressive hints", () => {
    const raw = {
      level: "stretch",
      hints: { "centre-1": 2 },
      open: { "centre-1": true },
      checks: {
        "centre-stretch-0": {
          draft: "same",
          checked: true,
          revealed: false,
          tried: true,
        },
      },
    };
    expect(parseDiscoverySession(raw)).toEqual(raw);
  });
  it("ignores unknown identifiers and bounds data from browser storage", () => {
    expect(parseDiscoverySession(null)).toBeUndefined();
    const restored = parseDiscoverySession({
      level: "impossible",
      hints: { "centre-1": 900, fake: 1 },
      open: { fake: true },
      checks: {
        "centre-core-0": {
          draft: "9".repeat(1000),
          checked: true,
          revealed: "yes",
        },
        fake: { draft: "yes" },
      },
    })!;
    expect(restored.level).toBe("core");
    expect(restored.hints).toEqual({ "centre-1": 3 });
    expect(restored.open).toEqual({});
    expect(Object.keys(restored.checks)).toEqual(["centre-core-0"]);
    expect(restored.checks["centre-core-0"].draft).toHaveLength(48);
    expect(restored.checks["centre-core-0"].revealed).toBe(false);
    expect(emptyDiscoverySession().checks).toEqual({});
  });
});
