import { describe, expect, it } from "vitest";
import { questions, resolvePreset } from "../../src/apps/surface-area/bank";
import { baseCalculations } from "../../src/apps/surface-area/baseWorking";
import { boundaries } from "../../src/apps/surface-area/geometry";

describe("independent base calculations", () => {
  it("keeps every symbolic boundary symbolic without consulting the full answer", () => {
    let count = 0;
    for (const q of questions)
      for (const v of q.variants) {
        if (v.geometry.kind !== "prism") continue;
        const symbolic = boundaries(v.geometry).some((b) =>
          b.edgeLabels?.some(
            (s) => s && /[a-z]/i.test(s.replace(/\b(cm|mm|m)\b/g, "")),
          ),
        );
        if (symbolic) {
          expect(v.perimeterWorking, `${q.id}/${v.id}`).toBeDefined();
          count++;
        }
        const isolated = baseCalculations({
          ...v,
          working: ["FINAL ANSWER MUST STAY HIDDEN"],
          answer: "FINAL ANSWER MUST STAY HIDDEN",
        });
        expect(isolated.perimeter.length).toBeGreaterThan(0);
        expect(isolated.area.length).toBeGreaterThan(0);
        expect(JSON.stringify(isolated)).not.toMatch(
          /FINAL ANSWER|lateral area|surface area|PH\s*\+/i,
        );
      }
    expect(count).toBe(15);
  });
  it.each([
    ["example-9-12", "P = 2 × (8 + a) = 16 + 2a cm"],
    ["exam-sample", "P = 12 + 13 + 6 + y = 31 + y cm"],
    ["ex9b-11", "P = 2 × (5 + x) = 10 + 2x cm"],
    ["ex9b-18", "P = 2 × (x + y) cm"],
    ["ex9b-26", "P = 2x + 9 cm"],
    ["revision-15", "P = 24 + x + 25 = 49 + x cm"],
    ["revision-29", "P = 2 × (x + 2 + 7) + 4 × 2 = 2x + 26 cm"],
  ])("retains the source variable for %s", (id, formula) => {
    expect(baseCalculations(resolvePreset(id).variant).perimeter).toContain(
      formula,
    );
  });
  it("uses both hollow boundaries and one net base area", () => {
    const result = baseCalculations(resolvePreset("revision-27").variant);
    expect(result.perimeter).toEqual([
      "Outer perimeter = 10 + 10 + 10 + 10 = 40 cm",
      "Inner perimeter = 6 + 6 + 6 + 6 = 24 cm",
      "P = 40 + 24 = 64 cm",
    ]);
    expect(result.area).toEqual(["B = 10² − 6² = 64 cm²"]);
  });
  it("includes square units for algebraic base areas", () => {
    expect(baseCalculations(resolvePreset("ex9b-18").variant).area).toEqual([
      "B = xy cm²",
    ]);
    expect(baseCalculations(resolvePreset("ex9b-26").variant).area).toEqual([
      "B = 3x − 1.5(x − 2) = 1.5x + 3 cm²",
    ]);
  });
  it("does not invent a base area or edge lengths for a schematic prism", () => {
    const result = baseCalculations(resolvePreset("ex9b-8").variant);
    expect(result.perimeter).toEqual(["P = 24 cm (given)"]);
    expect(result.area).toEqual([
      "The base area cannot be determined from the supplied measurements.",
    ]);
  });
  it("retains supplied rounded areas instead of deriving an exact regular polygon area", () => {
    expect(
      baseCalculations(resolvePreset("consolidation-1").variant).area,
    ).toEqual(["B = 127 mm² (given)."]);
    expect(baseCalculations(resolvePreset("ex9b-16").variant).area).toEqual([
      "B = 3.9 cm² (given)",
    ]);
  });
  it("separates the open edge from retained widths", () => {
    expect(
      baseCalculations(resolvePreset("ex9b-27").variant).perimeter,
    ).toEqual([
      "Let s be the sloping opening length (cm).",
      "P = 18 + 24 + s + 8 = 50 + s cm",
      "Retained widths = 18 + 24 + 8 = 50 cm",
    ]);
  });
});
