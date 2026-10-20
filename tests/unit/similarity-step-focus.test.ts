import { describe, expect, it } from "vitest";
import { focusPrintedLine } from "../../src/apps/similarity/stepFocus";
import { textbookSolutions } from "../../src/apps/similarity/textbook";
import type { TextbookStep } from "../../src/apps/similarity/textbook-types";

const m = String.raw;
describe("current printed line geometry", () => {
  it("uses all angles in a numeric angle-sum substitution but only the answer angle on its final line", () => {
    const steps = textbookSolutions["qp8-2"].steps;
    const sum = steps.find((s) => s.math?.[0].startsWith("108^"))!;
    expect(focusPrintedLine(sum).highlights.angles).toEqual([
      "ABC",
      "ACB",
      "BAC",
    ]);
    const answer = steps.find((s) => s.math?.[0] === m`\angle ACB=25^\circ`)!;
    expect(focusPrintedLine(answer).highlights.angles).toEqual(["ACB"]);
    expect(answer.highlights.angles).toEqual(["ABC", "ACB", "BAC"]);
  });

  it("understands a single vertex and a reversed angle name", () => {
    const step: TextbookStep = {
      math: [m`\angle A=\angle RQP`],
      highlights: { angles: ["BAC", "PQR", "ABC"], sides: ["AB"] },
    };
    expect(focusPrintedLine(step).highlights.angles).toEqual(["BAC", "PQR"]);
    expect(focusPrintedLine(step).highlights.sides).toEqual([]);
  });

  it("limits a side ratio to its named segments, regardless of endpoint order", () => {
    const step: TextbookStep = {
      math: [m`\frac{FE}{CB}=\frac23`],
      highlights: { sides: ["EF", "BC", "AF", "AB"], angles: ["AFE"] },
    };
    expect(focusPrintedLine(step).highlights.sides).toEqual(["EF", "BC"]);
    expect(focusPrintedLine(step).highlights.angles).toEqual([]);
  });

  it("keeps the diagram context for algebra and area calculations", () => {
    for (const step of [
      { math: ["x=3"], highlights: { sides: ["AB", "CD"] } },
      { math: [m`\text{Area of }ABCD=12`], highlights: { figures: ["ABCD"] } },
    ])
      expect(focusPrintedLine(step)).toBe(step);
  });

  it("preserves every printed line and reason across all 72 solutions", () => {
    for (const solution of Object.values(textbookSolutions)) {
      for (const step of solution.steps) {
        const focused = focusPrintedLine(step);
        expect(focused.math).toEqual(step.math);
        expect(focused.reason).toBe(step.reason);
        expect(focused.heading).toBe(step.heading);
        for (const [kind, names] of Object.entries(focused.highlights)) {
          const original =
            step.highlights[kind as keyof typeof step.highlights] ?? [];
          for (const name of names ?? []) expect(original).toContain(name);
        }
      }
    }
  });
});
