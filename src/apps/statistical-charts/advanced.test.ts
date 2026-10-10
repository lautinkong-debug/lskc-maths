import { describe, it, expect } from "vitest";
import {
  defaultAdvanced,
  defaultSecond,
  matchingClasses,
  percentageRows,
  percentileEstimate,
  rawMedian,
  validateAdvanced,
  validateTask,
} from "./advanced";
import { cumulativePoints, curveValue, groupedTable } from "./statistics";
import { defaultDisplay } from "./Chart";
import { decodeActivity, encodeActivity, type Activity } from "./classroom";
import { readLibrary, readSession } from "./storage";
import { ProgressStore } from "./progress";
const groups = [3, 7, 5, 5].map((frequency, i) => ({
  lower: 10 + i * 10,
  upper: 19 + i * 10,
  frequency,
}));
const rows = groupedTable(groups, 1).rows;
const activity: Activity = {
  version: 1,
  source: "grouped",
  data: groups,
  grouping: { start: 10, width: 10, count: 4, precision: 1 },
  type: "histogram",
  display: defaultDisplay,
  title: "Measurements",
  variable: "Score",
  unit: "marks",
  mode: "advanced",
  comparison: "all",
  fixed: false,
  answers: true,
  advanced: defaultAdvanced,
  task: {
    name: "Read the median",
    instructions: "Explain the graph reading.",
    level: 3,
  },
};
describe("percentile graph readings", () => {
  it("uses pN/100 and linear interpolation between real boundaries", () => {
    expect(percentileEstimate(rows, 25, "polygon")!.low).toBeCloseTo(
      22.357142857,
    );
    expect(percentileEstimate(rows, 50, "polygon")).toEqual({
      low: 29.5,
      high: 29.5,
      target: 10,
    });
    expect(percentileEstimate(rows, 75, "polygon")!.low).toBe(39.5);
  });
  it.each([1, 10, 25, 40, 50, 60, 75, 90, 99])(
    "inverts the actual smooth curve at P%s",
    (p) => {
      const e = percentileEstimate(rows, p, "curve")!;
      expect(curveValue(cumulativePoints(rows), e.low)).toBeCloseTo(
        e.target,
        7,
      );
      expect(e.low).toBeGreaterThanOrEqual(rows[0].low);
      expect(e.high).toBeLessThanOrEqual(rows.at(-1)!.high);
    },
  );
  it("identifies every value along a horizontal plateau", () => {
    const r = groupedTable(
      groups.map((g, i) => ({ ...g, frequency: i === 0 || i === 3 ? 3 : 0 })),
      1,
    ).rows;
    for (const method of ["polygon", "curve"] as const)
      expect(percentileEstimate(r, 50, method)).toEqual({
        low: 19.5,
        high: 39.5,
        target: 3,
      });
  });
  it("returns boundary ranges for leading and trailing zero classes", () => {
    const r = groupedTable(
      groups.map((g, i) => ({ ...g, frequency: i === 1 ? 4 : 0 })),
      1,
    ).rows;
    expect(percentileEstimate(r, 0, "curve")).toEqual({
      low: 9.5,
      high: 19.5,
      target: 0,
    });
    expect(percentileEstimate(r, 100, "polygon")).toEqual({
      low: 29.5,
      high: 49.5,
      target: 4,
    });
  });
  it.each([-1, 101, NaN, Infinity])("rejects invalid percentile %s", (p) =>
    expect(percentileEstimate(rows, p, "polygon")).toBeNull(),
  );
  it("has no percentile for empty or zero-total distributions", () => {
    expect(percentileEstimate([], 50, "curve")).toBeNull();
    expect(
      percentileEstimate(
        groupedTable(
          groups.map((g) => ({ ...g, frequency: 0 })),
          1,
        ).rows,
        50,
        "polygon",
      ),
    ).toBeNull();
  });
  it("handles a single continuous class including negative readings", () => {
    const r = groupedTable([{ lower: -10, upper: 10, frequency: 5 }], 0).rows;
    expect(percentileEstimate(r, 25, "polygon")!.low).toBe(-5);
  });
  it("calculates exact raw medians without mutating observations", () => {
    const v = [10, 0, 0, 10];
    expect(rawMedian(v)).toBe(5);
    expect(v).toEqual([10, 0, 0, 10]);
    expect(rawMedian([4, 1, 2])).toBe(2);
    expect(rawMedian([])).toBeNull();
    expect(rawMedian([NaN])).toBeNull();
  });
});
describe("two distributions and portable authored activities", () => {
  it("normalises proportions so different sample sizes can be compared", () => {
    const doubled = groupedTable(
      groups.map((g) => ({ ...g, frequency: g.frequency * 2 })),
      1,
    ).rows;
    expect(percentageRows(rows).map((r) => r.frequency)).toEqual(
      percentageRows(doubled).map((r) => r.frequency),
    );
    expect(percentageRows(rows).at(-1)!.cumulative).toBe(100);
    expect(rows.at(-1)!.cumulative).toBe(20);
  });
  it("does not divide zero totals", () =>
    expect(
      percentageRows(
        groupedTable(
          groups.map((g) => ({ ...g, frequency: 0 })),
          1,
        ).rows,
      ).every((r) => r.frequency === 0 && r.cumulative === 0),
    ).toBe(true));
  it("checks boundaries, not just the number of classes", () => {
    expect(
      matchingClasses(rows, groupedTable(defaultSecond(rows), 1).rows),
    ).toBe(true);
    expect(
      matchingClasses(
        rows,
        groupedTable(
          groups.map((g) => ({ ...g, lower: g.lower + 1, upper: g.upper + 1 })),
          1,
        ).rows,
      ),
    ).toBe(false);
  });
  it("round-trips advanced settings and teacher instructions", () =>
    expect(
      decodeActivity(
        encodeActivity({
          ...activity,
          advanced: { ...defaultAdvanced, second: defaultSecond(rows) },
        }),
      ),
    ).toEqual({
      ...activity,
      advanced: { ...defaultAdvanced, second: defaultSecond(rows) },
    }));
  it.each([
    { percentile: 0 },
    { percentile: 100 },
    { measure: "density" },
    { graph: "unknown" },
    { method: "unknown" },
    { second: [null] },
    { second: [{ lower: 0, upper: 9, frequency: -1 }] },
  ])("rejects malformed advanced settings %j", (v) =>
    expect(() => validateAdvanced({ ...defaultAdvanced, ...v }, 1)).toThrow(),
  );
  it.each([
    { name: "a".repeat(81) },
    { instructions: "x".repeat(801) },
    { level: 4 },
    { instructions: { html: "<script>" } },
  ])("rejects malformed teacher tasks", (v) =>
    expect(() => validateTask({ ...activity.task, ...v })).toThrow(),
  );
});
describe("bounded local progress and activity library", () => {
  const session = {
    version: 1,
    activity,
    lesson: null,
    progress: { "practice/answer": "12.5" },
    updated: 1,
    origin: "",
  };
  it("restores an independently validated activity and progress record", () =>
    expect(readSession(JSON.stringify(session))).toEqual(session));
  it.each([
    "broken",
    JSON.stringify({ ...session, version: 2 }),
    JSON.stringify({ ...session, activity: {} }),
    JSON.stringify({ ...session, progress: Array(4) }),
  ])("rejects invalid stored sessions", (text) =>
    expect(() => readSession(text)).toThrow(),
  );
  it("retains a fixed lesson separately from the current view", () =>
    expect(
      readSession(
        JSON.stringify({ ...session, lesson: { ...activity, fixed: true } }),
      ).lesson?.fixed,
    ).toBe(true));
  it("validates every saved lesson and limits library size", () => {
    const lesson = { id: "1", name: "Example", updated: 1, activity };
    expect(readLibrary(JSON.stringify([lesson]))).toEqual([lesson]);
    expect(() => readLibrary(JSON.stringify(Array(13).fill(lesson)))).toThrow();
    expect(() =>
      readLibrary(JSON.stringify([{ ...lesson, activity: {} }])),
    ).toThrow();
  });
  it("clears attempts and bounds old keys without notifying on unchanged values", () => {
    const p = new ProgressStore();
    let calls = 0;
    const unsub = p.subscribe(() => calls++);
    p.write("a", "1");
    p.write("a", "1");
    expect(calls).toBe(1);
    for (let i = 0; i < 200; i++) p.write(`key-${i}`, i);
    expect(Object.keys(p.data)).toHaveLength(160);
    p.replace();
    expect(p.data).toEqual({});
    unsub();
  });
});
