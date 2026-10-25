import { describe, expect, it } from "vitest";
import { questions, resolvePreset } from "../../src/apps/surface-area/bank";
import { totalCalculation } from "../../src/apps/surface-area/totalWorking";
const calc = (id: string, reveals = {}) =>
  totalCalculation(resolvePreset(id).variant, reveals);

describe("separate total-area working and result", () => {
  it.each([
    ["example-9-11", "= 22 × 13 + 2 × 26 cm²", "= 286 + 52 cm²", "A = 338 cm²"],
    ["example-9-13", "= 22 × 6 + 28 cm²", "= 132 + 28 cm²", "A = 160 cm²"],
    ["revision-27", "= 64 × 2 + 2 × 64 cm²", "= 128 + 128 cm²", "A = 256 cm²"],
    ["ex9b-27", "= 50 × 8 + 2 × 288 cm²", "= 400 + 576 cm²", "A = 976 cm²"],
  ])(
    "stops before the final sum for %s",
    (id, substitution, intermediate, answer) => {
      expect(calc(id).lines).toContain(substitution);
      expect(calc(id).lines).toContain(intermediate);
      expect(calc(id).answer).toBe(answer);
      expect(calc(id).lines.join(" ")).not.toContain(answer.slice(4));
    },
  );
  it("keeps symbolic base values independent of their value reveals", () => {
    expect(calc("revision-29").lines).toContain(
      "= (2x + 26) × 4 + 2 × (3x + 14) cm²",
    );
    expect(calc("revision-29", { revealBasePerimeter: true }).lines).toContain(
      "= 31 × 4 + 2 × (3x + 14) cm²",
    );
    expect(calc("revision-29", { revealBaseArea: true }).lines).toContain(
      "= (2x + 26) × 4 + 2 × 21.5 cm²",
    );
    expect(
      calc("revision-29", { revealBaseArea: true, revealBasePerimeter: true })
        .lines,
    ).toContain("= 124 + 43 cm²");
  });
  it("keeps unknown heights symbolic", () => {
    expect(calc("qp-9-12").lines).toContain("= 24 × h + 2 × 28 cm²");
    expect(calc("ex9b-18").lines).toContain(
      "= (2 × (x + y)) × z + 2 × (xy) cm²",
    );
  });
  it("shows only wet walls and the bottom and respects the depth reveal", () => {
    expect(calc("ex9b-35").lines).toContain("= 56 × d + 192 cm²");
    expect(calc("ex9b-35", { revealWaterDepth: true }).lines).toContain(
      "= 420 + 192 cm²",
    );
    expect(calc("ex9b-35").answer).toBe("A = 612 cm²");
    expect(calc("revision-31", { revealWaterDepth: true }).lines).toContain(
      "= 624 + 375 cm²",
    );
  });
  it("subtracts both contact faces for joined cubes without revealing the final subtraction", () => {
    expect(calc("revision-33").lines).toContain(
      "= 6 × (5² + 4² + 3²) − 2 × (16 + 9) cm²",
    );
    expect(calc("revision-33").lines).toContain("= 300 − 50 cm²");
    expect(calc("revision-33").answer).toBe("A = 250 cm²");
  });
  it("counts all 20 separate chocolate chips, not just the depicted chip", () => {
    expect(calc("ex9b-31").lines).toContain("= 20 × (12 × H + 2 × 6) cm²");
    expect(calc("ex9b-31").answer).toBe("A = 960 cm²");
  });
  it("never selects the answer or full solution as its calculation text", () => {
    let count = 0;
    for (const q of questions)
      for (const v of q.variants) {
        const result = totalCalculation({
          ...v,
          answer: "HIDDEN ANSWER",
          working: ["HIDDEN WORKING"],
        });
        expect(result.lines.join(" ")).not.toMatch(/HIDDEN|NaN|Infinity/);
        expect(result.lines.join(" ")).not.toContain(
          result.answer.replace(/^A [=≈] /, ""),
        );
        expect(result.answer).toContain(
          `${Number((v.expected.surfaceArea * (v.quantity ?? 1)).toFixed(5))} ${v.unit}²`,
        );
        count++;
      }
    expect(count).toBe(69);
  });
});
