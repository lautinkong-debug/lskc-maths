import { describe, expect, it } from "vitest";
import {
  activityLink,
  decodeActivity,
  encodeActivity,
  readActivity,
  tableCSV,
  rawCSV,
  validateActivity,
  type Activity,
} from "./classroom";
import { defaultDisplay } from "./Chart";
import { groupedTable } from "./statistics";
const activity: Activity = {
  version: 1,
  source: "grouped",
  data: [
    { lower: 10, upper: 19, frequency: 3 },
    { lower: 20, upper: 29, frequency: 7 },
  ],
  grouping: { start: 10, width: 10, count: 2, precision: 1 },
  type: "cumulativeCurve",
  display: defaultDisplay,
  title: "Class measurements · 數據",
  variable: "Score",
  unit: "marks",
  mode: "compare",
  comparison: "all",
  answers: false,
  fixed: true,
};
describe("reproducible activity transport", () => {
  it("round trips Unicode and all teaching/display settings", () =>
    expect(decodeActivity(encodeActivity(activity))).toEqual(activity));
  it("round trips raw observations without inventing grouped observations", () => {
    const raw = { ...activity, source: "raw" as const, data: [10, 15, 20, 29] };
    expect(readActivity(JSON.stringify(raw))).toEqual(raw);
  });
  it("removes fields outside the schema", () =>
    expect(
      validateActivity({ ...activity, studentName: "not part of activity" }),
    ).toEqual(activity));
  it("keeps hosting path and replaces old fragments", () => {
    const link = activityLink(
      "https://school.example/apps/statistical-charts#old",
      activity,
    )!;
    expect(link).toMatch(
      /^https:\/\/school.example\/apps\/statistical-charts#activity=/,
    );
    expect(decodeActivity(new URL(link).hash.slice(10))).toEqual(activity);
  });
  it("offers a file fallback when a link is too large", () => {
    const large = {
      ...activity,
      source: "raw" as const,
      data: Array(10000).fill(10),
    };
    expect(activityLink("https://school.example/", large)).toBeNull();
    expect(readActivity(JSON.stringify(large)).data).toHaveLength(10000);
  });
  it.each([
    { version: 2 },
    { data: [{ lower: 10, upper: 19, frequency: -1 }] },
    { data: [{ lower: 10, upper: 19, frequency: 0.5 }] },
    {
      data: [
        { lower: 10, upper: 19, frequency: 3 },
        { lower: 18, upper: 29, frequency: 2 },
      ],
    },
    { source: "raw", data: [999] },
    { source: "raw", data: [null] },
    { source: "raw", data: ["10"] },
    { data: Array(25).fill({ lower: 10, upper: 19, frequency: 1 }) },
    { source: "raw", data: Array(10001).fill(10) },
    { display: { ...defaultDisplay, grid: "true" } },
    { type: "unknown" },
    { mode: "unknown" },
    { comparison: "__proto__" },
    { grouping: { ...activity.grouping, precision: 0.25 } },
    { grouping: { ...activity.grouping, width: 0 } },
    { title: "x".repeat(101) },
    { answers: "false" },
    { fixed: null },
  ])("rejects malformed or mathematically invalid input %j", (patch) =>
    expect(() => validateActivity({ ...activity, ...patch })).toThrow(),
  );
  it.each(["not json", "{}", "x".repeat(250001)])(
    "rejects invalid files",
    (text) => expect(() => readActivity(text)).toThrow(),
  );
  it.each(["%bad", "", "a".repeat(350001)])(
    "rejects invalid encoded payloads",
    (text) => expect(() => decodeActivity(text)).toThrow(),
  );
});
describe("CSV exports", () => {
  it("preserves raw observations, order and decimals", () =>
    expect(rawCSV([-0.5, 12, 12])).toBe("-0.5\r\n12\r\n12\r\n"));
  it("exports boundaries, marks and cumulative counts with quoted headings", () => {
    const rows = groupedTable(
      activity.data as { lower: number; upper: number; frequency: number }[],
      1,
    ).rows;
    expect(tableCSV(rows, ["A, B", 'A "B"'])).toBe(
      '"A, B","A ""B"""\r\n10,19,9.5,19.5,14.5,10,3,3\r\n20,29,19.5,29.5,24.5,10,7,10\r\n',
    );
  });
});
