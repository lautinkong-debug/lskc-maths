/** Pure numerical model. UI and all five charts consume the same validated rows. */
export type ChartType =
  "histogram" | "polygon" | "curve" | "cumulativePolygon" | "cumulativeCurve";
export type Shape =
  "uniform" | "symmetric" | "positive" | "negative" | "bimodal";
export type Group = { lower: number; upper: number; frequency: number };
export type Row = Group & {
  low: number;
  high: number;
  mark: number;
  width: number;
  cumulative: number;
};
export type Point = { x: number; y: number };
export type Grouping = {
  start: number;
  width: number;
  count: number;
  precision: number;
};
export type Result = { rows: Row[]; total: number; error?: string };
export const MAX_DATA = 10000;
export const MAX_CLASSES = 24;
export const tidy = (n: number) => Number(n.toFixed(8));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-7;
const finite = (n: number) => Number.isFinite(n) && Math.abs(n) <= 1e6;
export const validPrecision = (p: number) => [0, 0.01, 0.1, 1].includes(p);
const aligned = (n: number, p: number) =>
  p === 0 || near(n / p, Math.round(n / p));
export const format = (n: number) => String(tidy(n));

export function parseData(text: string): number[] {
  if (!text.trim()) return [];
  const parts = text.trim().split(/[\s,;]+/);
  if (parts.length > MAX_DATA) throw new Error("tooMany");
  return parts.map((part) => {
    if (
      !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(part) ||
      !finite(Number(part))
    )
      throw new Error("numbers");
    return Number(part);
  });
}

export function groupedTable(groups: Group[], precision: number): Result {
  const fail = (error: string): Result => ({ rows: [], total: 0, error });
  if (!validPrecision(precision)) return fail("precision");
  if (!groups.length) return fail("emptyGroups");
  if (groups.length > MAX_CLASSES) return fail("classes");
  let cumulative = 0;
  const rows: Row[] = [];
  for (const g of groups) {
    if (![g.lower, g.upper, g.frequency].every(finite)) return fail("numbers");
    if (!Number.isInteger(g.frequency) || g.frequency < 0)
      return fail("frequency");
    if (g.upper < g.lower || (precision === 0 && g.upper === g.lower))
      return fail("order");
    if (!aligned(g.lower, precision) || !aligned(g.upper, precision))
      return fail("alignment");
    const low = tidy(g.lower - precision / 2);
    const high = tidy(g.upper + precision / 2);
    const width = tidy(high - low);
    const prev = rows.at(-1);
    if (prev && low < prev.high - 1e-7) return fail("overlap");
    if (prev && !near(low, prev.high)) return fail("gap");
    if (prev && !near(width, prev.width)) return fail("unequal");
    cumulative += g.frequency;
    if (cumulative > 1e6) return fail("total");
    rows.push({
      ...g,
      low,
      high,
      width,
      mark: tidy((g.lower + g.upper) / 2),
      cumulative,
    });
  }
  return { rows, total: cumulative };
}

export function rawTable(data: number[], settings: Grouping): Result {
  const fail = (error: string): Result => ({ rows: [], total: 0, error });
  const { start, width, count, precision } = settings;
  if (!validPrecision(precision)) return fail("precision");
  if (
    !finite(start) ||
    !finite(width) ||
    width <= 0 ||
    width < precision ||
    !aligned(width, precision) ||
    !aligned(start, precision)
  )
    return fail("grouping");
  if (!Number.isInteger(count) || count < 1 || count > MAX_CLASSES)
    return fail("classes");
  if (data.length > MAX_DATA) return fail("tooMany");
  const groups = Array.from({ length: count }, (_, i) => ({
    lower: tidy(start + i * width),
    upper: tidy(start + (i + 1) * width - precision),
    frequency: 0,
  }));
  const base = groupedTable(groups, precision);
  if (base.error) return base;
  for (const value of data) {
    if (!finite(value)) return fail("numbers");
    if (!aligned(value, precision)) return fail("alignment");
    // Every class is [low, high), consistent with less-than cumulative counts.
    const index = base.rows.findIndex((r) => value >= r.low && value < r.high);
    if (index < 0) return fail("uncovered");
    groups[index].frequency++;
  }
  return groupedTable(groups, precision);
}

export function frequencyPoints(rows: Row[]): Point[] {
  if (!rows.length) return [];
  return [
    { x: tidy(rows[0].mark - rows[0].width), y: 0 },
    ...rows.map((r) => ({ x: r.mark, y: r.frequency })),
    { x: tidy(rows.at(-1)!.mark + rows.at(-1)!.width), y: 0 },
  ];
}
export function cumulativePoints(rows: Row[]): Point[] {
  return rows.length
    ? [
        { x: rows[0].low, y: 0 },
        ...rows.map((r) => ({ x: r.high, y: r.cumulative })),
      ]
    : [];
}

/** Shape-preserving Hermite interpolation. Zero slopes at extrema and endpoints;
 * harmonic-mean interior slopes on same-sign secants prevent overshoot. */
export function tangents(points: Point[]): number[] {
  const d = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  return points.map((_, i) => {
    if (i === 0 || i === points.length - 1 || d[i - 1] * d[i] <= 0) return 0;
    const before = points[i].x - points[i - 1].x;
    const after = points[i + 1].x - points[i].x;
    const w1 = 2 * after + before,
      w2 = after + 2 * before;
    return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
}
export function curveValue(points: Point[], x: number): number {
  if (!points.length) return 0;
  if (x <= points[0].x) return points[0].y;
  if (x >= points.at(-1)!.x) return points.at(-1)!.y;
  const i = points.findIndex(
    (p, j) => j < points.length - 1 && x >= p.x && x <= points[j + 1].x,
  );
  const a = points[i],
    b = points[i + 1],
    h = b.x - a.x,
    t = (x - a.x) / h;
  const m = tangents(points);
  return (
    (2 * t ** 3 - 3 * t ** 2 + 1) * a.y +
    (t ** 3 - 2 * t ** 2 + t) * h * m[i] +
    (-2 * t ** 3 + 3 * t ** 2) * b.y +
    (t ** 3 - t ** 2) * h * m[i + 1]
  );
}
export function curvePath(
  points: Point[],
  x: (n: number) => number,
  y: (n: number) => number,
): string {
  if (!points.length) return "";
  const m = tangents(points);
  return (
    `M ${x(points[0].x)} ${y(points[0].y)}` +
    points
      .slice(1)
      .map((b, j) => {
        const a = points[j],
          h = (b.x - a.x) / 3;
        return ` C ${x(a.x + h)} ${y(a.y + h * m[j])} ${x(b.x - h)} ${y(b.y - h * m[j + 1])} ${x(b.x)} ${y(b.y)}`;
      })
      .join("")
  );
}

export function generateData(options: {
  min: number;
  max: number;
  size: number;
  precision: number;
  seed: string;
  shape: Shape;
}): number[] {
  const { min, max, size, precision, seed, shape } = options;
  if (
    ![min, max].every(finite) ||
    max <= min ||
    !validPrecision(precision) ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > MAX_DATA ||
    !["uniform", "symmetric", "positive", "negative", "bimodal"].includes(shape)
  )
    throw new Error("generator");
  const low = precision ? Math.ceil(tidy(min / precision)) : 0;
  const high = precision ? Math.floor(tidy(max / precision)) : 0;
  if (precision && high < low) throw new Error("generator");
  let state = 2166136261;
  for (const ch of seed)
    state = Math.imul(state ^ ch.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const bell = () =>
    (random() + random() + random() + random() + random() + random()) / 6;
  return Array.from({ length: size }, () => {
    const u =
      shape === "uniform"
        ? random()
        : shape === "symmetric"
          ? bell()
          : shape === "positive"
            ? random() ** 2.6
            : shape === "negative"
              ? 1 - random() ** 2.6
              : (random() < 0.5 ? 0.05 : 0.6) + 0.35 * bell();
    return precision
      ? tidy(Math.min(high, low + Math.floor(u * (high - low + 1))) * precision)
      : min + u * (max - min);
  });
}

export function autoGrouping(
  min: number,
  max: number,
  precision: number,
  count = 6,
): Grouping {
  const unit = precision || 0.01;
  const start = tidy(Math.floor(min / unit) * unit);
  const width = tidy(
    Math.max(unit, Math.ceil(tidy((max - start + unit) / count / unit)) * unit),
  );
  return { start, width, count, precision };
}
export function axisStep(max: number): number {
  const raw = Math.max(1, max) / 5;
  const power = 10 ** Math.floor(Math.log10(raw));
  return Math.max(1, [1, 2, 5, 10].find((n) => n * power >= raw)! * power);
}
