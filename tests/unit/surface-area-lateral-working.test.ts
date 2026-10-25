import { describe, expect, it } from "vitest";
import { questions, resolvePreset } from "../../src/apps/surface-area/bank";
import { lateralCalculation } from "../../src/apps/surface-area/lateralWorking";

const calculate = (id: string, reveals = {}) =>
  lateralCalculation(resolvePreset(id).variant, reveals);
describe("independent lateral working", () => {
  it.each([
    ["example-9-11", "= 22 × 13 = 286 cm²"],
    ["example-9-13", "= 22 × 6 = 132 cm²"],
    ["revision-27", "= 64 × 2 = 128 cm²"],
    ["ex9b-27", "= 50 × 8 = 400 cm²"],
    ["revision-26", "= 36 × 8 = 288 cm²"],
  ])("counts only the retained lateral faces for %s", (id, expected) => {
    expect(calculate(id).lines).toContain(expected);
    expect(JSON.stringify(calculate(id))).not.toMatch(
      /total surface|\+ 2B|\+ B/i,
    );
  });
  it.each([
    ["example-9-12", "= (16 + 2a) × 10 cm²", "= 28 × 10 = 280 cm²"],
    ["revision-29", "= (2x + 26) × 4 cm²", "= 31 × 4 = 124 cm²"],
    ["ex9b-26", "= (2x + 9) × 4 cm²", "= 19 × 4 = 76 cm²"],
    ["revision-15", "= (49 + x) × 10 cm²", "= 56 × 10 = 560 cm²"],
  ])(
    "keeps %s symbolic until its perimeter value is selected",
    (id, symbolic, numeric) => {
      expect(calculate(id).lines).toContain(symbolic);
      expect(calculate(id, { revealBasePerimeter: true }).lines).toContain(
        numeric,
      );
    },
  );
  it.each([
    ["ex9b-35", "d", "7.5", "56", "420"],
    ["revision-31", "d", "7.8", "80", "624"],
    ["mc-11", "Δd", "3", "64", "192"],
  ])("respects the water-depth reveal for %s", (id, symbol, depth, p, area) => {
    expect(calculate(id).lines).toContain(`= ${p} × ${symbol} cm²`);
    expect(calculate(id, { revealWaterDepth: true }).lines).toContain(
      `= ${p} × ${depth} = ${area} cm²`,
    );
  });
  it("retains unknown heights and cube arrangements without solving the full question", () => {
    expect(calculate("ex9b-18").lines).toContain("= (2 × (x + y)) × z cm²");
    expect(calculate("ex9b-18", { revealBasePerimeter: true }).lines).toContain(
      "= 8 × z cm²",
    );
    expect(calculate("qp-9-12").lines).toContain("= 24 × h cm²");
    expect(calculate("exam-3").lines).toContain("= 32 × AD cm²");
    expect(calculate("ex9b-31").lines).toEqual([
      "Lateral area = P × H",
      "= 12 × H cm²",
      "H = Height of each chip",
    ]);
  });
  it("never reads the full answer or base-area working for any preset", () => {
    for (const q of questions)
      for (const v of q.variants) {
        const modified = {
          ...v,
          working: ["HIDDEN FINAL ANSWER"],
          answer: "HIDDEN FINAL ANSWER",
          baseWorking: "HIDDEN BASE ANSWER",
        };
        const result = lateralCalculation(modified);
        expect(JSON.stringify(result)).not.toContain("HIDDEN");
        expect(result.lines.length > 0).toBe(v.geometry.kind === "prism");
      }
  });
});
