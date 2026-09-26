import { describe, expect, it } from "vitest";
import { solveInequality } from "./solve";

describe("inequality solver", () => {
  it("solves a linear inequality and marks an open endpoint", () => {
    expect(solveInequality("2x - 3 > 5")).toMatchObject({
      tex: "x>4",
      lower: { value: 4, included: false },
      upper: null,
    });
  });

  it("reverses the sign when dividing by a negative coefficient", () => {
    expect(solveInequality("-2x + 1 ≤ 5")).toMatchObject({
      tex: "x\\geq -2",
      lower: { value: -2, included: true },
      reversed: true,
    });
  });

  it("keeps each compound endpoint's inclusion", () => {
    expect(solveInequality("-1 ≤ x < 4")).toMatchObject({
      tex: "-1\\leq x<4",
      lower: { value: -1, included: true },
      upper: { value: 4, included: false },
      kind: "interval",
    });
  });

  it("identifies empty and single-point intervals", () => {
    expect(solveInequality("4 < x < 1")?.kind).toBe("empty");
    expect(solveInequality("2 ≤ x ≤ 2")?.kind).toBe("point");
  });

  it("rejects expressions outside the supported grammar", () => {
    expect(solveInequality("x^2 > 4")).toBeNull();
    expect(solveInequality("alert(1)")).toBeNull();
    expect(solveInequality("0x < 3")).toBeNull();
  });
});
