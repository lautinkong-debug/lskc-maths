import { describe, it, expect } from "vitest";
import {
  comparisonRule,
  moveItem,
  orderMistake,
  pointRange,
  orderSets,
} from "./points";
describe("number-line activities", () => {
  it.each([
    [-2, -4, "negativeRule"],
    [2, 4, "positiveRule"],
    [-1, 3, "mixedRule"],
    [0, -3, "zeroRule"],
    [0, 0, "equal"],
    [-4, -4, "equal"],
  ])("selects the comparison rule for %s and %s", (a, b, rule) =>
    expect(comparisonRule(a as number, b as number)).toBe(rule),
  );
  it("fits points, zero and the opposite with space at both ends", () => {
    expect(pointRange([{ id: "A", value: -4 }])).toEqual([-10, 10]);
    expect(pointRange([{ id: "A", value: 100 }], -100)).toEqual([-102, 102]);
  });
  it("keeps each sign with its value when chips move", () => {
    const values = [3, -8, 0, -2];
    expect(moveItem(values, 1, 0)).toEqual([-8, 3, 0, -2]);
    expect(values).toEqual([3, -8, 0, -2]);
    expect(moveItem(values, 0, 3)).toEqual([-8, 0, -2, 3]);
    expect(moveItem(values, -1, 0)).toBe(values);
  });
  it("checks strict direction and points to the first broken pair", () => {
    expect(orderMistake([-8, -2, 0, 3], true)).toBe(-1);
    expect(orderMistake([3, 0, -2, -8], false)).toBe(-1);
    expect(orderMistake([-8, 0, -2, 3], true)).toBe(2);
    expect(orderMistake([-8, -2, 0, 3], false)).toBe(1);
  });
  it("has shuffled distinct sets at every offered length", () => {
    for (const set of orderSets)
      for (const count of [4, 5, 6]) {
        const values = set.slice(0, count);
        expect(new Set(values).size).toBe(count);
        expect(orderMistake(values, true)).toBeGreaterThan(0);
        expect(orderMistake(values, false)).toBeGreaterThan(0);
      }
  });
});
