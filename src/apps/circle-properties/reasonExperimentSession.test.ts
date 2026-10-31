import { describe, expect, it } from "vitest";
import { labs } from "./content";
import { angleAt, distance } from "./geometry";
import { getReasonScene, initialReasonParameters } from "./reasonExploration";
import {
  initialReasonExperiment,
  parseReasonExperiment,
} from "./reasonExperimentSession";

describe("reason experiment persistence", () => {
  it.each(labs)("restores the related reasons for $id", (lab) => {
    const initial = initialReasonExperiment(lab.id);
    expect(Object.keys(initial.shapes)).toEqual(lab.reasonIds);
    expect(initial.selectedId).toBe(lab.reasonIds[0]);
    expect(
      parseReasonExperiment(lab.id, JSON.parse(JSON.stringify(initial))),
    ).toEqual(initial);
  });

  it("rejects malformed outer data and safely defaults missing shape records", () => {
    for (const raw of [null, undefined, [], "bad", 42])
      expect(parseReasonExperiment("bisector", raw)).toBeUndefined();
    expect(parseReasonExperiment("bisector", {})).toEqual(
      initialReasonExperiment("bisector"),
    );
    const parsed = parseReasonExperiment("bisector", {
      selectedId: "r17",
      shapes: { r1: { parameters: { primary: "5", secondary: 0 } } },
    })!;
    expect(parsed).toEqual(initialReasonExperiment("bisector"));
  });

  it("rejects non-finite required controls and does not carry unsupported state", () => {
    const parsed = parseReasonExperiment("centre", {
      selectedId: "r6",
      revealed: true,
      shapes: {
        r6: { parameters: { primary: Infinity, secondary: 40 }, samples: [] },
        r1: { parameters: initialReasonParameters("r1"), samples: [] },
      },
    })!;
    expect(parsed.shapes.r6.parameters).toEqual(initialReasonParameters("r6"));
    expect(Object.keys(parsed.shapes)).toEqual(["r6"]);
    expect(parsed).not.toHaveProperty("revealed");
  });

  it("restores exact givens even when saved controls contradict them", () => {
    const bisector = parseReasonExperiment("bisector", {
      selectedId: "r2",
      shapes: {
        r2: { parameters: { primary: 6, secondary: 80, rotation: 53 } },
      },
    })!;
    const p = getReasonScene("r2", bisector.shapes.r2.parameters).points;
    expect(distance(p.A, p.N)).toBeCloseTo(distance(p.N, p.B), 10);
    expect(angleAt(p.O, p.N, p.B)).toBeCloseTo(90, 10);

    const semicircle = parseReasonExperiment("semicircle", {
      shapes: {
        r9: { parameters: { primary: 75, secondary: 60, rotation: 41 } },
      },
    })!;
    const s = getReasonScene("r9", semicircle.shapes.r9.parameters).points;
    expect(angleAt(s.A, s.P, s.B)).toBeCloseTo(90, 10);
    expect(distance(s.A, s.B)).toBeCloseTo(320, 10);
  });

  it("keeps the latest three valid samples after dropping corrupt entries", () => {
    const sample = (rotation: number) => ({
      ...initialReasonParameters("r3"),
      rotation,
    });
    const parsed = parseReasonExperiment("bisector", {
      selectedId: "r3",
      shapes: {
        r3: {
          parameters: sample(15),
          samples: [
            sample(5),
            null,
            sample(25),
            sample(45),
            { primary: NaN, secondary: 0 },
            sample(65),
            [],
          ],
        },
      },
    })!;
    expect(parsed.shapes.r3.samples.map((p) => p.rotation)).toEqual([
      25, 45, 65,
    ]);
    expect(parsed.selectedId).toBe("r3");
  });

  it("preserves the independent r17 Q position in current and saved cases", () => {
    const p = {
      ...initialReasonParameters("r17"),
      qPosition: 43,
      tertiary: 65,
    };
    const parsed = parseReasonExperiment("ratios", {
      selectedId: "r17",
      shapes: { r17: { parameters: p, samples: [{ ...p, qPosition: 72 }] } },
    })!;
    expect(parsed.shapes.r17.parameters.qPosition).toBe(43);
    expect(parsed.shapes.r17.parameters.tertiary).toBe(65);
    expect(parsed.shapes.r17.samples[0].qPosition).toBe(72);
  });

  it("does not share mutable geometry or samples between reasons or calls", () => {
    const first = initialReasonExperiment("bisector");
    const second = initialReasonExperiment("bisector");
    first.shapes.r1.parameters.rotation = 88;
    first.shapes.r1.samples.push(initialReasonParameters("r1"));
    expect(first.shapes.r2.parameters.rotation).toBe(0);
    expect(first.shapes.r2.samples).toEqual([]);
    expect(second.shapes.r1.parameters.rotation).toBe(0);
    expect(second.shapes.r1.samples).toEqual([]);
    const parsed = parseReasonExperiment("bisector", first)!;
    parsed.shapes.r1.parameters.rotation = 15;
    parsed.shapes.r1.samples[0].rotation = 45;
    expect(first.shapes.r1.parameters.rotation).toBe(88);
    expect(first.shapes.r1.samples[0].rotation).toBe(0);
  });
});
