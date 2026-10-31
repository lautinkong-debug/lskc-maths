import { describe, expect, it } from "vitest";
import { readExactNumber, stepExactNumber } from "./ExactNumberInput";

describe("exact numeric entry", () => {
  it("commits valid decimals and clamps only the completed value", () => {
    expect(readExactNumber("60", 20, 340)).toBe(60);
    expect(readExactNumber("19", 20, 340)).toBe(20);
    expect(readExactNumber("360", 20, 340)).toBe(340);
    expect(readExactNumber("-6.25", -9.8, 9.8)).toBe(-6.25);
    expect(readExactNumber("0", -9.8, 9.8)).toBe(0);
  });

  it("does not replace the current geometry with zero for empty or unfinished input", () => {
    for (const draft of ["", " ", "-", ".", "1e", "Infinity", "NaN"])
      expect(readExactNumber(draft, -9.8, 9.8), draft).toBeUndefined();
  });

  it("steps to the next valid tick from either side of a typed fractional value", () => {
    expect(stepExactNumber(60.5, 20, 340, 1, 1)).toBe(61);
    expect(stepExactNumber(60.5, 20, 340, 1, -1)).toBe(60);
    expect(stepExactNumber(60, 20, 340, 1, 1)).toBe(61);
    expect(stepExactNumber(60, 20, 340, 1, -1)).toBe(59);
  });

  it("keeps decimal steps stable, including negative offsets and both boundaries", () => {
    expect(stepExactNumber(-6.2, -9.8, 9.8, 0.1, 1)).toBe(-6.1);
    expect(stepExactNumber(-6.2, -9.8, 9.8, 0.1, -1)).toBe(-6.3);
    expect(stepExactNumber(9.8, -9.8, 9.8, 0.1, 1)).toBe(9.8);
    expect(stepExactNumber(-9.8, -9.8, 9.8, 0.1, -1)).toBe(-9.8);
  });
});
