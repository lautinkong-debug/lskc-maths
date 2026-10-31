export type InkPoint = { x: number; y: number };
export type InkStroke = {
  id: string;
  colour: string;
  width: number;
  points: InkPoint[];
};
export type InkDocument = { strokes: InkStroke[] };
export type InkHistory = {
  past: InkStroke[][];
  present: InkStroke[];
  future: InkStroke[][];
};
export type InkAction =
  | { type: "add"; stroke: InkStroke }
  | { type: "erase"; ids: string[] }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" };

export const inkColours = [
  { name: "Red", value: "#b52a4d" },
  { name: "Blue", value: "#2454c8" },
  { name: "Green", value: "#18764b" },
  { name: "Black", value: "#202b39" },
] as const;
export const MAX_INK_STROKES = 250;
export const MAX_STROKE_POINTS = 2500;
export const MAX_INK_POINTS = 50000;
const HISTORY_LIMIT = 30;
const validPoint = (value: unknown): value is InkPoint => {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<InkPoint>;
  return (
    typeof p.x === "number" &&
    typeof p.y === "number" &&
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    Math.abs(p.x) <= 10000 &&
    Math.abs(p.y) <= 10000
  );
};
export const pointCount = (strokes: InkStroke[]) =>
  strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
export const inkAtLimit = (strokes: InkStroke[]) =>
  strokes.length >= MAX_INK_STROKES || pointCount(strokes) >= MAX_INK_POINTS;

export function parseInkDocument(raw: unknown): InkDocument | undefined {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray((raw as InkDocument).strokes)
  )
    return;
  const strokes: InkStroke[] = [];
  let count = 0;
  const ids = new Set<string>();
  for (const value of (raw as InkDocument).strokes.slice(-MAX_INK_STROKES)) {
    if (!value || typeof value !== "object") continue;
    if (
      typeof value.id !== "string" ||
      !value.id ||
      value.id.length > 80 ||
      ids.has(value.id)
    )
      continue;
    if (
      !inkColours.some((c) => c.value === value.colour) ||
      !Number.isFinite(value.width) ||
      value.width < 1 ||
      value.width > 8
    )
      continue;
    if (
      !Array.isArray(value.points) ||
      !value.points.length ||
      !value.points.every(validPoint)
    )
      continue;
    const points =
      value.points.length > MAX_STROKE_POINTS
        ? Array.from(
            { length: MAX_STROKE_POINTS },
            (_, i) =>
              value.points[
                Math.round(
                  (i * (value.points.length - 1)) / (MAX_STROKE_POINTS - 1),
                )
              ],
          )
        : value.points;
    if (count + points.length > MAX_INK_POINTS) continue;
    strokes.push({
      id: value.id,
      colour: value.colour,
      width: value.width,
      points: points.map(({ x, y }) => ({ x, y })),
    });
    count += points.length;
    ids.add(value.id);
  }
  return { strokes };
}

export function pointSegmentDistance(
  point: InkPoint,
  a: InkPoint,
  b: InkPoint,
) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared,
          ),
        );
  return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy);
}
export function strokeAtPoint(stroke: InkStroke, point: InkPoint, radius = 7) {
  const tolerance = radius + stroke.width / 2;
  if (stroke.points.length === 1)
    return (
      Math.hypot(point.x - stroke.points[0].x, point.y - stroke.points[0].y) <=
      tolerance
    );
  return stroke.points.some(
    (p, i) =>
      i > 0 &&
      pointSegmentDistance(point, stroke.points[i - 1], p) <= tolerance,
  );
}

/** Tests the whole eraser swipe, so a fast movement cannot skip thin strokes. */
export function strokeAlongSegment(
  stroke: InkStroke,
  start: InkPoint,
  end: InkPoint,
  radius = 7,
) {
  const tolerance = radius + stroke.width / 2;
  return stroke.points.some((point, index) => {
    if (index === 0)
      return pointSegmentDistance(point, start, end) <= tolerance;
    const previous = stroke.points[index - 1];
    const rx = end.x - start.x,
      ry = end.y - start.y;
    const sx = point.x - previous.x,
      sy = point.y - previous.y;
    const denominator = rx * sy - ry * sx;
    if (Math.abs(denominator) > 1e-10) {
      const dx = previous.x - start.x,
        dy = previous.y - start.y;
      const t = (dx * sy - dy * sx) / denominator;
      const u = (dx * ry - dy * rx) / denominator;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
    }
    return (
      Math.min(
        pointSegmentDistance(start, previous, point),
        pointSegmentDistance(end, previous, point),
        pointSegmentDistance(previous, start, end),
        pointSegmentDistance(point, start, end),
      ) <= tolerance
    );
  });
}

/** Each completed pen or eraser gesture is one reversible operation. */
export function inkReducer(state: InkHistory, action: InkAction): InkHistory {
  if (action.type === "undo") {
    if (!state.past.length) return state;
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
    };
  }
  if (action.type === "redo") {
    if (!state.future.length) return state;
    return {
      past: [...state.past, state.present].slice(-HISTORY_LIMIT),
      present: state.future[0],
      future: state.future.slice(1),
    };
  }
  let next: InkStroke[];
  if (action.type === "add") {
    const validated = parseInkDocument({ strokes: [action.stroke] })
      ?.strokes[0];
    if (
      !validated ||
      state.present.some((s) => s.id === validated.id) ||
      state.present.length >= MAX_INK_STROKES ||
      pointCount(state.present) + validated.points.length > MAX_INK_POINTS
    )
      return state;
    next = [...state.present, validated];
  } else if (action.type === "erase") {
    const ids = new Set(action.ids);
    next = state.present.filter((s) => !ids.has(s.id));
    if (next.length === state.present.length) return state;
  } else {
    if (!state.present.length) return state;
    next = [];
  }
  return {
    past: [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
  };
}

export function inkPath(points: InkPoint[]) {
  if (!points.length) return "";
  // A round-capped zero-length segment also renders a pen tap.
  return (
    `M ${points[0].x} ${points[0].y} ` +
    (points.length === 1
      ? `L ${points[0].x} ${points[0].y}`
      : points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" "))
  );
}
