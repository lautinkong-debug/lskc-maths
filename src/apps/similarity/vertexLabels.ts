import type { Point } from "./types";

export type LabelBox = { x: number; y: number; width: number; height: number };
export type VertexLabelRequest = {
  key: string;
  text: string;
  point: Point;
  fontSize: number;
  preferred?: { x: number; y: number };
  /** Composite figures can have interior vertices; keep their names nearby. */
  allowInterior?: boolean;
};
export type VertexLabel = LabelBox & {
  key: string;
  textX: number;
  textY: number;
};

const overlaps = (a: LabelBox, b: LabelBox) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/** Segment clipping also detects edges through a label whose endpoints lie outside it. */
export function edgeCrossesLabel(a: Point, b: Point, box: LabelBox): boolean {
  let lo = 0,
    hi = 1;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  for (const [p, q] of [
    [-dx, a.x - box.x],
    [dx, box.x + box.width - a.x],
    [-dy, a.y - box.y],
    [dy, box.y + box.height - a.y],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) lo = Math.max(lo, t);
      else hi = Math.min(hi, t);
      if (lo > hi) return false;
    }
  }
  return true;
}
function inside(p: { x: number; y: number }, polygon: Point[]) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    )
      result = !result;
  }
  return result;
}

/** Labels occupy clear space around the vertex; model geometry is never changed. */
export function placeVertexLabels(
  requests: VertexLabelRequest[],
  polygons: Point[][],
  reserved: LabelBox[] = [],
  frame?: LabelBox,
): Map<string, VertexLabel> {
  const occupied = [...reserved];
  const labels = new Map<string, VertexLabel>();
  const edges = polygons.flatMap((ps) =>
    ps.map((p, i) => [p, ps[(i + 1) % ps.length]]),
  );
  for (const request of requests) {
    const { point, fontSize: f, preferred } = request;
    const width = f * (request.text.length * 0.7 + 0.4),
      // The display font's italic ascenders extend beyond its nominal em box.
      height = f * 1.8;
    const ideal = preferred
      ? Math.atan2(preferred.y, preferred.x)
      : -Math.PI / 2;
    let best: VertexLabel | undefined,
      bestScore = Infinity;
    // Expand only when the nearest ring has no clear candidate.
    for (const gap of [0.35, 0.75, 1.3, 2, 3, 4]) {
      for (let k = 0; k < 32; k++) {
        const angle = ideal + (k * Math.PI) / 16,
          dx = Math.cos(angle),
          dy = Math.sin(angle);
        const radius =
          Math.min(
            Math.abs(dx) > 1e-6 ? width / 2 / Math.abs(dx) : Infinity,
            Math.abs(dy) > 1e-6 ? height / 2 / Math.abs(dy) : Infinity,
          ) +
          f * gap;
        const x = point.x + dx * radius - width / 2;
        const y = point.y + dy * radius - height / 2;
        const box = { x, y, width, height };
        const crosses = edges.filter(([a, b]) =>
          edgeCrossesLabel(a, b, box),
        ).length;
        const contained = polygons.some((ps) =>
          inside({ x: x + width / 2, y: y + height / 2 }, ps),
        );
        const collisions = occupied.filter((other) =>
          overlaps(box, other),
        ).length;
        const outside =
          frame &&
          (x < frame.x ||
            y < frame.y ||
            x + width > frame.x + frame.width ||
            y + height > frame.y + frame.height);
        const score =
          crosses * 1000 +
          Number(contained) * (request.allowInterior ? 20 : 1000) +
          collisions * 2000 +
          Number(!!outside) * 5000 +
          gap * 3 +
          (1 - Math.cos(angle - ideal));
        if (score < bestScore) {
          bestScore = score;
          best = {
            ...box,
            key: request.key,
            textX: x + width / 2,
            textY: y + height / 2 + f * 0.3,
          };
        }
      }
      if (bestScore < 1000) break;
    }
    if (best) {
      labels.set(request.key, best);
      occupied.push(best);
    }
  }
  return labels;
}

export function vertexLabelPoints(labels: Map<string, VertexLabel>): Point[] {
  return [...labels.values()].flatMap((b) => [
    { x: b.x, y: b.y, label: "" },
    { x: b.x + b.width, y: b.y + b.height, label: "" },
  ]);
}
