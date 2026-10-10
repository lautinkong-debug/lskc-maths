import {
  cumulativePoints,
  frequencyPoints,
  tidy,
  type ChartType,
  type Point,
  type Row,
} from "./statistics";

export type Connection = "none" | "straight" | "smooth";
export type ConstructionItem = Point & { end?: number };
export type DraftItem = {
  id: number;
  x: string;
  y: string;
  end: string;
  given?: boolean;
  classIndex?: number;
};
export type QuestionKind = "mark" | "low" | "width" | "cumulative";
export type FeedbackCode =
  | "correct"
  | "number"
  | "midpoint"
  | "halfUnit"
  | "boundaryWidth"
  | "runningSum"
  | "retry"
  | "missing"
  | "extra"
  | "zeroEnds"
  | "classMarks"
  | "startZero"
  | "neverDecrease"
  | "endTotal"
  | "touching"
  | "barBoundaries"
  | "heights"
  | "coordinates"
  | "straight"
  | "smooth"
  | "negative"
  | "duplicate";
export type Grade = {
  correct: boolean;
  code: FeedbackCode;
  matched: number;
  total: number;
};
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-7;
export function numberAnswer(value: string): number | null {
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))
    return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= 2e6 ? n : null;
}
export function targets(rows: Row[], type: ChartType): ConstructionItem[] {
  if (type === "histogram")
    return rows.map((r) => ({ x: r.low, end: r.high, y: r.frequency }));
  return type.startsWith("cumulative")
    ? cumulativePoints(rows)
    : frequencyPoints(rows);
}
export function expectedConnection(type: ChartType): Connection {
  return type === "histogram"
    ? "none"
    : type === "curve" || type === "cumulativeCurve"
      ? "smooth"
      : "straight";
}
export function draftItems(
  items: ConstructionItem[],
  given = false,
): DraftItem[] {
  return items.map((p, id) => ({
    id,
    x: String(p.x),
    y: String(p.y),
    end: p.end === undefined ? "" : String(p.end),
    given,
  }));
}
export function parsedItems(
  draft: DraftItem[],
  histogram: boolean,
): ConstructionItem[] | null {
  const result: ConstructionItem[] = [];
  for (const p of draft) {
    const x = numberAnswer(p.x),
      y = numberAnswer(p.y),
      end = numberAnswer(p.end);
    if (x === null || y === null || (histogram && end === null)) return null;
    result.push({ x, y, ...(histogram ? { end: end! } : {}) });
  }
  return result;
}
export function gradeConstruction(
  rows: Row[],
  type: ChartType,
  draft: DraftItem[],
  connection: Connection,
): Grade {
  const expected = targets(rows, type),
    items = parsedItems(draft, type === "histogram");
  const result = (code: FeedbackCode, matched = 0): Grade => ({
    correct: code === "correct",
    code,
    matched,
    total: expected.length,
  });
  if (!items) return result("number");
  if (items.some((p) => p.y < 0)) return result("negative");
  const sorted = [...items].sort((a, b) => a.x - b.x);
  if (sorted.some((p, i) => i > 0 && close(p.x, sorted[i - 1].x)))
    return result("duplicate");
  const matched = expected.filter((e) =>
    items.some(
      (p) =>
        close(p.x, e.x) &&
        close(p.y, e.y) &&
        (e.end === undefined || (p.end !== undefined && close(p.end, e.end))),
    ),
  ).length;
  if (items.length > expected.length) return result("extra", matched);
  if (!items.length) return result("missing");
  if (type === "histogram") {
    if (
      sorted.some(
        (p, i) => p.end! <= p.x || (i > 0 && !close(sorted[i - 1].end!, p.x)),
      )
    )
      return result("touching", matched);
    if (
      items.some(
        (p) => !expected.some((e) => close(p.x, e.x) && close(p.end!, e.end!)),
      )
    )
      return result("barBoundaries", matched);
  } else if (type.startsWith("cumulative")) {
    if (sorted.some((p, i) => i > 0 && p.y < sorted[i - 1].y))
      return result("neverDecrease", matched);
    if (!items.some((p) => close(p.x, expected[0].x) && close(p.y, 0)))
      return result("startZero", matched);
    const last = items.find((p) => close(p.x, expected.at(-1)!.x));
    if (last && !close(last.y, expected.at(-1)!.y))
      return result("endTotal", matched);
  } else {
    if (
      items.some((p) =>
        rows.some(
          (r) =>
            (close(p.x, r.lower) || close(p.x, r.upper)) && !close(p.x, r.mark),
        ),
      )
    )
      return result("classMarks", matched);
    if (
      ![expected[0], expected.at(-1)!].every((e) =>
        items.some((p) => close(p.x, e.x) && close(p.y, 0)),
      )
    )
      return result("zeroEnds", matched);
  }
  if (items.length < expected.length) return result("missing", matched);
  if (matched !== expected.length)
    return result(type === "histogram" ? "heights" : "coordinates", matched);
  const join = expectedConnection(type);
  if (connection !== join)
    return result(join === "smooth" ? "smooth" : "straight", matched);
  return result("correct", matched);
}
export function questionAnswer(row: Row, kind: QuestionKind): number {
  return row[kind];
}
export function gradeAnswer(
  value: string,
  row: Row,
  kind: QuestionKind,
): FeedbackCode {
  const n = numberAnswer(value);
  if (n === null) return "number";
  if (close(n, questionAnswer(row, kind))) return "correct";
  return (
    {
      mark: "midpoint",
      low: "halfUnit",
      width: "boundaryWidth",
      cumulative: "runningSum",
    } as const
  )[kind];
}
export function questionFormula(
  rows: Row[],
  index: number,
  kind: QuestionKind,
): string {
  const r = rows[index];
  if (kind === "mark") return `\\frac{${r.lower}+(${r.upper})}{2}=${r.mark}`;
  if (kind === "low") return `${r.lower}-(${tidy(r.lower - r.low)})=${r.low}`;
  if (kind === "width") return `${r.high}-(${r.low})=${r.width}`;
  return `${rows
    .slice(0, index + 1)
    .map((r) => r.frequency)
    .join("+")}=${r.cumulative}`;
}
export type LessonStage =
  | "prepare"
  | "calculate"
  | "ends"
  | "axes"
  | "plot"
  | "join"
  | "smooth"
  | "finish";
export function lessonStages(type: ChartType): LessonStage[] {
  if (type === "histogram")
    return ["prepare", "calculate", "axes", "plot", "finish"];
  return [
    "prepare",
    "calculate",
    ...(!type.startsWith("cumulative") ? (["ends"] as const) : []),
    "axes",
    "plot",
    "join",
    ...(expectedConnection(type) === "smooth" ? (["smooth"] as const) : []),
    "finish",
  ];
}
export function snapCoordinate(value: number, step: number): number {
  return tidy(Math.round(value / step) * step);
}
export function practiceScaffold(
  rows: Row[],
  type: ChartType,
  level: number,
): DraftItem[] {
  if (level !== 2) return [];
  const all = targets(rows, type);
  // Only a subset is given; at least one item is always left for the learner.
  return draftItems(
    all.filter((_, i) => i % 2 === 0 && i < all.length - 1),
    true,
  );
}
