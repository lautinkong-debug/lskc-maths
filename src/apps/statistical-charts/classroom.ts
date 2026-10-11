import type { Display } from "./Chart";
import {
  validateAdvanced,
  validateTask,
  type AdvancedSettings,
  type LessonTask,
} from "./advanced";
import {
  groupedTable,
  rawTable,
  validPrecision,
  type ChartType,
  type Group,
  type Grouping,
  type Row,
} from "./statistics";

export type Comparison = "shape" | "smooth" | "cumulative" | "totals" | "all";
export type LabMode =
  | "lab"
  | "learn"
  | "practice"
  | "compare"
  | "advanced"
  | "concepts"
  | "animations";
export const comparisons: Record<Comparison, ChartType[]> = {
  shape: ["histogram", "polygon"],
  smooth: ["polygon", "curve"],
  cumulative: ["cumulativePolygon", "cumulativeCurve"],
  totals: ["polygon", "cumulativePolygon"],
  all: [
    "histogram",
    "polygon",
    "curve",
    "cumulativePolygon",
    "cumulativeCurve",
  ],
};
export type Activity = {
  version: 1;
  source: "raw" | "grouped";
  data: number[] | Group[];
  grouping: Grouping;
  type: ChartType;
  display: Display;
  title: string;
  variable: string;
  unit: string;
  mode: LabMode;
  comparison: Comparison;
  answers: boolean;
  fixed: boolean;
  advanced?: AdvancedSettings;
  task?: LessonTask;
};
export const MAX_ACTIVITY_BYTES = 250000;
export const MAX_LINK_LENGTH = 8000;
export function comparisonScale(rows: Row[], types: ChartType[]) {
  return {
    min: rows[0].mark - rows[0].width,
    max: rows.at(-1)!.mark + rows.at(-1)!.width,
    peak: types.some((type) => type.startsWith("cumulative"))
      ? rows.at(-1)!.cumulative
      : Math.max(...rows.map((row) => row.frequency)),
  };
}
const chartNames = comparisons.all;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e6;
/** Treat a shared file/fragment as untrusted input; only return whitelisted fields. */
export function validateActivity(input: unknown): Activity {
  const fail = (): never => {
    throw new Error("invalidActivity");
  };
  if (
    !object(input) ||
    input.version !== 1 ||
    !object(input.grouping) ||
    !object(input.display)
  )
    return fail();
  const g = input.grouping;
  if (
    ![g.start, g.width, g.count, g.precision].every(finite) ||
    !validPrecision(g.precision as number) ||
    (g.width as number) <= 0 ||
    !Number.isInteger(g.count) ||
    (g.count as number) < 1 ||
    (g.count as number) > 24
  )
    return fail();
  const grouping = {
    start: g.start,
    width: g.width,
    count: g.count,
    precision: g.precision,
  } as Grouping;
  if (
    !chartNames.includes(input.type as ChartType) ||
    ![
      "lab",
      "learn",
      "practice",
      "compare",
      "advanced",
      "concepts",
      "animations",
    ].includes(input.mode as string) ||
    !Object.hasOwn(comparisons, input.comparison as string) ||
    typeof input.answers !== "boolean" ||
    typeof input.fixed !== "boolean"
  )
    return fail();
  for (const [key, limit] of [
    ["title", 100],
    ["variable", 40],
    ["unit", 15],
  ] as const)
    if (typeof input[key] !== "string" || input[key].length > limit)
      return fail();
  const display = {} as Display;
  for (const key of [
    "grid",
    "points",
    "labels",
    "boundaries",
    "marks",
    "overlay",
    "both",
    "guides",
  ] as const) {
    if (typeof input.display[key] !== "boolean") return fail();
    display[key] = input.display[key];
  }
  if (!Array.isArray(input.data)) return fail();
  let data: number[] | Group[];
  if (input.source === "raw") {
    if (input.data.length > 10000 || !input.data.every(finite)) return fail();
    data = [...input.data] as number[];
    if (rawTable(data, grouping).error) return fail();
  } else if (input.source === "grouped") {
    if (
      input.data.length > 24 ||
      !input.data.every(
        (v) => object(v) && [v.lower, v.upper, v.frequency].every(finite),
      )
    )
      return fail();
    data = input.data.map((v) => ({
      lower: v.lower,
      upper: v.upper,
      frequency: v.frequency,
    })) as Group[];
    if (groupedTable(data, grouping.precision).error) return fail();
  } else return fail();
  return {
    version: 1,
    source: input.source,
    data,
    grouping,
    type: input.type as ChartType,
    display,
    title: input.title as string,
    variable: input.variable as string,
    unit: input.unit as string,
    mode: input.mode as LabMode,
    comparison: input.comparison as Comparison,
    answers: input.answers,
    fixed: input.fixed,
    ...(input.advanced !== undefined
      ? { advanced: validateAdvanced(input.advanced, grouping.precision) }
      : {}),
    ...(input.task !== undefined ? { task: validateTask(input.task) } : {}),
  };
}
export function readActivity(text: string): Activity {
  if (text.length > MAX_ACTIVITY_BYTES) throw new Error("invalidActivity");
  return validateActivity(JSON.parse(text));
}
export function encodeActivity(activity: Activity): string {
  const bytes = new TextEncoder().encode(
    JSON.stringify(validateActivity(activity)),
  );
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
export function decodeActivity(fragment: string): Activity {
  if (!/^[\w-]+$/.test(fragment) || fragment.length > MAX_ACTIVITY_BYTES * 1.4)
    throw new Error("invalidActivity");
  const bytes = Uint8Array.from(
    atob(fragment.replaceAll("-", "+").replaceAll("_", "/")),
    (c) => c.charCodeAt(0),
  );
  return readActivity(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
export function activityLink(base: string, activity: Activity): string | null {
  const url = new URL(base);
  url.hash = `activity=${encodeActivity(activity)}`;
  return url.href.length <= MAX_LINK_LENGTH ? url.href : null;
}
export function rawCSV(values: number[]) {
  return values.join("\r\n") + "\r\n";
}
export function tableCSV(rows: Row[], headers: readonly string[]) {
  const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
  return (
    [
      headers.map(quote).join(","),
      ...rows.map((r) =>
        [
          r.lower,
          r.upper,
          r.low,
          r.high,
          r.mark,
          r.width,
          r.frequency,
          r.cumulative,
        ].join(","),
      ),
    ].join("\r\n") + "\r\n"
  );
}
