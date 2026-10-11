import { expect, it } from "vitest";
import { weightRows, billRows } from "./walkthroughs";
import { percentileEstimate } from "./advanced";
it("solves the supplied weight table by sums and consecutive differences", () => {
  expect(weightRows.map((r) => r.frequency)).toEqual([5, 12, 11, 5, 3]);
  expect(weightRows.map((r) => r.cumulative)).toEqual([5, 17, 28, 33, 36]);
  expect(weightRows.map((r) => r.high)).toEqual([50.5, 60.5, 70.5, 80.5, 90.5]);
});
it("uses explicit reconstructed bill coordinates for interpolation and complements", () => {
  expect(billRows.at(-1)?.cumulative).toBe(80);
  expect(percentileEstimate(billRows, 50, "polygon")).toEqual({
    low: 560.5,
    high: 560.5,
    target: 40,
  });
  expect(percentileEstimate(billRows, 85, "polygon")).toEqual({
    low: 750.5,
    high: 750.5,
    target: 68,
  });
  expect(80 - billRows.find((r) => r.high === 500.5)!.cumulative).toBe(55);
});
