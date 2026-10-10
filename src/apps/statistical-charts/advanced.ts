import {
  cumulativePoints,
  curveValue,
  groupedTable,
  type Group,
  type Row,
} from "./statistics";
export type AdvancedSettings = {
  panel: "percentiles" | "twoData";
  percentile: number;
  method: "polygon" | "curve";
  measure: "count" | "percent";
  graph: "frequency" | "cumulative";
  second?: Group[];
};
export type LessonTask = {
  name: string;
  instructions: string;
  level: 1 | 2 | 3;
};
export const defaultAdvanced: AdvancedSettings = {
  panel: "percentiles",
  percentile: 50,
  method: "polygon",
  measure: "percent",
  graph: "cumulative",
};
export const defaultTask: LessonTask = { name: "", instructions: "", level: 1 };
export type Estimate = { low: number; high: number; target: number };
/** Invert the displayed cumulative graph. A horizontal section has a range of valid readings. */
export function percentileEstimate(
  rows: Row[],
  percentile: number,
  method: "polygon" | "curve",
): Estimate | null {
  const total = rows.at(-1)?.cumulative ?? 0;
  if (
    !rows.length ||
    total <= 0 ||
    !Number.isFinite(percentile) ||
    percentile < 0 ||
    percentile > 100
  )
    return null;
  const points = cumulativePoints(rows),
    target = (total * percentile) / 100;
  const equal = points.filter((p) => Math.abs(p.y - target) < 1e-8);
  if (equal.length) return { low: equal[0].x, high: equal.at(-1)!.x, target };
  const i = points.findIndex((p) => p.y > target),
    a = points[i - 1],
    b = points[i];
  if (!a || !b) return null;
  let value = a.x + ((b.x - a.x) * (target - a.y)) / (b.y - a.y);
  if (method === "curve") {
    let low = a.x,
      high = b.x;
    for (let j = 0; j < 60; j++) {
      const mid = (low + high) / 2;
      if (curveValue(points, mid) < target) low = mid;
      else high = mid;
    }
    value = (low + high) / 2;
  }
  return { low: value, high: value, target };
}
export function rawMedian(values: number[]): number | null {
  if (!values.length || values.some((v) => !Number.isFinite(v))) return null;
  const sorted = [...values].sort((a, b) => a - b),
    i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
}
export function percentageRows(rows: Row[]): Row[] {
  const total = rows.at(-1)?.cumulative ?? 0;
  return rows.map((r) => ({
    ...r,
    frequency: total ? (r.frequency / total) * 100 : 0,
    cumulative: total ? (r.cumulative / total) * 100 : 0,
  }));
}
export function matchingClasses(a: Row[], b: Row[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (r, i) =>
        Math.abs(r.low - b[i].low) < 1e-7 &&
        Math.abs(r.high - b[i].high) < 1e-7,
    )
  );
}
export function defaultSecond(rows: Row[]): Group[] {
  return rows.map((r, i) => ({
    lower: r.lower,
    upper: r.upper,
    frequency: rows[rows.length - 1 - i].frequency,
  }));
}
export function validateAdvanced(
  input: unknown,
  precision: number,
): AdvancedSettings {
  const v = input as AdvancedSettings;
  if (
    !v ||
    !["percentiles", "twoData"].includes(v.panel) ||
    !["polygon", "curve"].includes(v.method) ||
    !["count", "percent"].includes(v.measure) ||
    !["frequency", "cumulative"].includes(v.graph) ||
    !Number.isFinite(v.percentile) ||
    v.percentile < 1 ||
    v.percentile > 99
  )
    throw new Error("invalidActivity");
  const result: AdvancedSettings = {
    panel: v.panel,
    method: v.method,
    measure: v.measure,
    percentile: v.percentile,
    graph: v.graph,
  };
  if (v.second !== undefined) {
    if (
      !Array.isArray(v.second) ||
      v.second.length > 24 ||
      v.second.some((g) => !g || typeof g !== "object") ||
      groupedTable(v.second, precision).error
    )
      throw new Error("invalidActivity");
    result.second = v.second.map((g) => ({
      lower: g.lower,
      upper: g.upper,
      frequency: g.frequency,
    }));
  }
  return result;
}
export function validateTask(input: unknown): LessonTask {
  const v = input as LessonTask;
  if (
    !v ||
    typeof v.name !== "string" ||
    v.name.length > 80 ||
    typeof v.instructions !== "string" ||
    v.instructions.length > 800 ||
    ![1, 2, 3].includes(v.level)
  )
    throw new Error("invalidActivity");
  return { name: v.name, instructions: v.instructions, level: v.level };
}
