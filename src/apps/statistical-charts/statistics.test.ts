import { describe, expect, it } from "vitest";
import {
  autoGrouping,
  axisStep,
  cumulativePoints,
  curvePath,
  curveValue,
  frequencyPoints,
  generateData,
  groupedTable,
  parseData,
  rawTable,
  tangents,
  type Group,
  type Shape,
} from "./statistics";
const groups: Group[] = [
  { lower: 10, upper: 19, frequency: 3 },
  { lower: 20, upper: 29, frequency: 7 },
  { lower: 30, upper: 39, frequency: 5 },
  { lower: 40, upper: 49, frequency: 5 },
];
describe("textbook-convention numerical acceptance case", () => {
  const result = groupedTable(groups, 1),
    rows = result.rows;
  it("computes total, marks, boundaries, widths and CF", () => {
    expect(result.error).toBeUndefined();
    expect(result.total).toBe(20);
    expect(rows.map((r) => r.mark)).toEqual([14.5, 24.5, 34.5, 44.5]);
    expect([rows[0].low, ...rows.map((r) => r.high)]).toEqual([
      9.5, 19.5, 29.5, 39.5, 49.5,
    ]);
    expect(rows.map((r) => r.width)).toEqual([10, 10, 10, 10]);
    expect(rows.map((r) => r.cumulative)).toEqual([3, 10, 15, 20]);
  });
  it("has touching bars with correct heights", () => {
    expect(rows.map((r) => r.frequency)).toEqual([3, 7, 5, 5]);
    rows.slice(1).forEach((r, i) => expect(r.low).toBe(rows[i].high));
  });
  it("adds the correct zero-frequency endpoints", () => {
    expect(frequencyPoints(rows)).toEqual([
      { x: 4.5, y: 0 },
      { x: 14.5, y: 3 },
      { x: 24.5, y: 7 },
      { x: 34.5, y: 5 },
      { x: 44.5, y: 5 },
      { x: 54.5, y: 0 },
    ]);
  });
  it("plots cumulative frequencies at boundaries, including initial zero", () => {
    expect(cumulativePoints(rows)).toEqual([
      { x: 9.5, y: 0 },
      { x: 19.5, y: 3 },
      { x: 29.5, y: 10 },
      { x: 39.5, y: 15 },
      { x: 49.5, y: 20 },
    ]);
  });
});
describe("validation and membership", () => {
  it.each([
    [[{ lower: 10, upper: 19, frequency: -1 }], "frequency"],
    [[{ lower: 10, upper: 19, frequency: 1.1 }], "frequency"],
    [[{ lower: 20, upper: 19, frequency: 1 }], "order"],
    [
      [...groups.slice(0, 1), { lower: 19, upper: 28, frequency: 2 }],
      "overlap",
    ],
    [[...groups.slice(0, 1), { lower: 21, upper: 30, frequency: 2 }], "gap"],
    [
      [...groups.slice(0, 1), { lower: 20, upper: 39, frequency: 2 }],
      "unequal",
    ],
    [[{ lower: NaN, upper: 19, frequency: 1 }], "numbers"],
    [[], "emptyGroups"],
  ] as [Group[], string][])(
    "rejects malformed grouped input %#",
    (input, error) => expect(groupedTable(input, 1).error).toBe(error),
  );
  it("handles zero frequencies and a single class", () => {
    const r = groupedTable([{ lower: 0, upper: 9, frequency: 0 }], 1);
    expect(r.total).toBe(0);
    expect(frequencyPoints(r.rows)).toEqual([
      { x: -5.5, y: 0 },
      { x: 4.5, y: 0 },
      { x: 14.5, y: 0 },
    ]);
  });
  it("handles decimal limits and half-precision corrections", () => {
    const r = rawTable([1, 1.9, 2, 2.9], {
      start: 1,
      width: 1,
      count: 2,
      precision: 0.1,
    });
    expect(r.rows.map((r) => [r.low, r.high, r.mark, r.frequency])).toEqual([
      [0.95, 1.95, 1.45, 2],
      [1.95, 2.95, 2.45, 2],
    ]);
  });
  it("handles hundredths and negative data", () => {
    const r = rawTable([-0.02, -0.01, 0, 0.01], {
      start: -0.02,
      width: 0.02,
      count: 2,
      precision: 0.01,
    });
    expect(r.rows.map((r) => [r.low, r.high, r.frequency])).toEqual([
      [-0.025, -0.005, 2],
      [-0.005, 0.015, 2],
    ]);
  });
  it("assigns continuous boundary values once using half-open classes", () => {
    const r = rawTable([0, 1, 2, 3, 4], {
      start: 0,
      width: 1,
      count: 5,
      precision: 0,
    });
    expect(r.rows.map((r) => r.frequency)).toEqual([1, 1, 1, 1, 1]);
    expect(r.total).toBe(5);
  });
  it("excludes the final upper boundary and fits classes beyond the maximum", () => {
    expect(
      rawTable([0, 4], { start: 0, width: 1, count: 4, precision: 0 }).error,
    ).toBe("uncovered");
    expect(rawTable([0, 4], autoGrouping(0, 4, 0, 4)).total).toBe(2);
  });
  it("rejects rounded data at unrecordable half-unit boundaries", () =>
    expect(
      rawTable([9.5], { start: 0, width: 10, count: 2, precision: 1 }).error,
    ).toBe("alignment"));
  it("never silently drops uncovered observations", () =>
    expect(
      rawTable([-1, 10], { start: 0, width: 10, count: 1, precision: 1 }).error,
    ).toBe("uncovered"));
  it("detects incompatible width and precision", () =>
    expect(
      rawTable([1], { start: 0, width: 1.5, count: 2, precision: 1 }).error,
    ).toBe("grouping"));
  it("regroups actual raw data after width/start changes", () => {
    const data = [-2, -1, 0, 1, 2];
    expect(
      rawTable(data, { start: -2, width: 1, count: 5, precision: 1 }).rows.map(
        (r) => r.frequency,
      ),
    ).toEqual([1, 1, 1, 1, 1]);
    expect(
      rawTable(data, { start: -3, width: 3, count: 2, precision: 1 }).rows.map(
        (r) => r.frequency,
      ),
    ).toEqual([2, 3]);
  });
  it("handles empty and very small raw samples", () => {
    expect(
      rawTable([], { start: 0, width: 1, count: 1, precision: 1 }).total,
    ).toBe(0);
    expect(rawTable([5], autoGrouping(5, 5, 1)).total).toBe(1);
  });
  it("validates parsing without dropping bad cells", () => {
    expect(parseData("1, -2\n3.5;4e1")).toEqual([1, -2, 3.5, 40]);
    for (const bad of ["1,abc,2", "NaN", "Infinity", "0x10", "1000001"])
      expect(() => parseData(bad)).toThrow();
    expect(parseData("")).toEqual([]);
  });
  it("supports grouped data without fabricating raw values", () => {
    expect(groupedTable(groups, 1).total).toBe(20);
    expect(groupedTable(groups, 1)).not.toHaveProperty("data");
  });
});
describe("seeded generation", () => {
  const base = {
    min: 0,
    max: 100,
    size: 10000,
    precision: 1,
    seed: "classroom",
    shape: "uniform" as Shape,
  };
  it.each([
    "uniform",
    "symmetric",
    "positive",
    "negative",
    "bimodal",
  ] as Shape[])("generates reproducible bounded %s samples", (shape) => {
    const data = generateData({ ...base, shape });
    expect(data).toHaveLength(10000);
    expect(generateData({ ...base, shape })).toEqual(data);
    expect(data.every((n) => n >= 0 && n <= 100 && Number.isInteger(n))).toBe(
      true,
    );
    const table = rawTable(data, autoGrouping(0, 100, 1));
    expect(table.error).toBeUndefined();
    expect(table.total).toBe(10000);
    expect(table.rows.at(-1)?.cumulative).toBe(data.length);
  });
  it.each([1, 0.1, 0.01, 0])(
    "respects precision %s and negative ranges",
    (precision) => {
      const data = generateData({
        ...base,
        min: -5,
        max: 5,
        precision,
        size: 40,
      });
      expect(data.every((n) => n >= -5 && n <= 5)).toBe(true);
      expect(rawTable(data, autoGrouping(-5, 5, precision)).total).toBe(40);
    },
  );
  it("changes sample size exactly", () => {
    for (const size of [1, 20, 30, 40, 50, 100])
      expect(generateData({ ...base, size })).toHaveLength(size);
  });
  it("rejects invalid generator settings", () => {
    for (const overrides of [
      { size: 0 },
      { size: 10001 },
      { size: 1.5 },
      { max: 0 },
      { min: NaN },
      { precision: 2 },
    ])
      expect(() => generateData({ ...base, ...overrides })).toThrow(
        "generator",
      );
  });
  it("has the requested broad distribution shapes", () => {
    const sample = (shape: Shape) => generateData({ ...base, shape });
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    expect(mean(sample("positive"))).toBeLessThan(35);
    expect(mean(sample("negative"))).toBeGreaterThan(65);
    expect(mean(sample("symmetric"))).toBeGreaterThan(48);
    expect(mean(sample("symmetric"))).toBeLessThan(52);
    const b = sample("bimodal");
    expect(b.filter((n) => n >= 40 && n <= 60).length).toBeLessThan(100);
  });
});
describe("curve safety", () => {
  it.each([
    [3, 7, 5, 5],
    [0, 10, 0, 20],
    [0, 0, 0, 0],
    [100, 1, 100, 1],
  ])(
    "never overshoots interval endpoints or decreases cumulative values for %s",
    (...freq) => {
      const rows = groupedTable(
        groups.map((g, i) => ({ ...g, frequency: freq[i] })),
        1,
      ).rows;
      for (const points of [frequencyPoints(rows), cumulativePoints(rows)]) {
        for (let i = 0; i < points.length - 1; i++)
          for (let k = 0; k <= 100; k++) {
            const a = points[i],
              b = points[i + 1],
              v = curveValue(points, a.x + ((b.x - a.x) * k) / 100);
            expect(v).toBeGreaterThanOrEqual(Math.min(a.y, b.y) - 1e-8);
            expect(v).toBeLessThanOrEqual(Math.max(a.y, b.y) + 1e-8);
          }
      }
      const cf = cumulativePoints(rows);
      let prev = -1;
      for (let x = cf[0].x; x <= cf.at(-1)!.x; x += 0.05) {
        const v = curveValue(cf, x);
        expect(v).toBeGreaterThanOrEqual(prev - 1e-8);
        prev = v;
      }
      expect(curveValue(cf, cf[0].x)).toBe(0);
      expect(curveValue(cf, cf.at(-1)!.x)).toBe(rows.at(-1)!.cumulative);
    },
  );
  it("uses cubic paths and safe endpoint derivatives", () => {
    const p = frequencyPoints(groupedTable(groups, 1).rows);
    expect(tangents(p)[0]).toBe(0);
    expect(tangents(p).at(-1)).toBe(0);
    expect(
      curvePath(
        p,
        (x) => x,
        (y) => y,
      ),
    ).toContain(" C ");
    expect(
      curvePath(
        [],
        (x) => x,
        (y) => y,
      ),
    ).toBe("");
  });
  it("uses readable positive integer frequency ticks including zero-only tables", () => {
    for (const n of [0, 1, 7, 20, 10000, 1e6]) {
      const step = axisStep(n);
      expect(step).toBeGreaterThan(0);
      expect(Number.isInteger(step)).toBe(true);
      expect(Math.ceil(n / step)).toBeLessThanOrEqual(5);
    }
  });
});
