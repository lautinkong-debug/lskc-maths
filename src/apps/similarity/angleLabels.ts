import type { Point } from "./types";
import { edgeCrossesLabel, type LabelBox } from "./vertexLabels";

type XY = { x: number; y: number };

export type AngleLabelRequest = {
  key: string;
  text: string;
  vertex: Point;
  first: Point;
  last: Point;
  arcCount?: number;
  right?: boolean;
  /** Directed interior turn when a polygon needs a reflex angle. */
  turn?: number;
};

export type AngleLabelPlacement = LabelBox & {
  key: string;
  textX: number;
  textY: number;
  fontSize: number;
  start: number;
  turn: number;
  radius: number;
  arcGap: number;
  leader?: { from: XY; to: XY };
};

export type AngleLabelOptions = {
  size?: number;
  fontSize?: number;
  vertexFontSize?: number;
  vertices?: Point[];
  polygons?: Point[][];
  /** Actual vertex/side-label boxes can replace the conservative default. */
  reserved?: LabelBox[];
};

const overlap = (a: LabelBox, b: LabelBox) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

function inside(point: XY, polygon: Point[]) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      result = !result;
  }
  return result;
}

const corners = (box: LabelBox) => [
  { x: box.x, y: box.y },
  { x: box.x + box.width, y: box.y },
  { x: box.x, y: box.y + box.height },
  { x: box.x + box.width, y: box.y + box.height },
];
const at = (vertex: XY, angle: number, radius: number): XY => ({
  x: vertex.x + Math.cos(angle) * radius,
  y: vertex.y + Math.sin(angle) * radius,
});
const boxAt = (point: XY, width: number, height: number): LabelBox => ({
  x: point.x - width / 2,
  y: point.y - height / 2,
  width,
  height,
});

/** Allocate upright labels together, without moving or measuring the triangles.
 * Text never shrinks to fit. Short sides reduce the arc radii and arc spacing;
 * labels that cannot fit safely inside receive external leader lines instead.
 * All distances use the caller's SVG coordinates, including its mark `size`. */
export function placeAngleLabels(
  requests: AngleLabelRequest[],
  options: AngleLabelOptions = {},
): Map<string, AngleLabelPlacement> {
  const size = Math.max(0.001, options.size ?? 1);
  const fontSize = options.fontSize ?? 17 * size;
  const vertexFontSize = options.vertexFontSize ?? 30 * size;
  const padding = 4 * size;
  const unique = new Map<string, Point>();
  for (const point of options.vertices ??
    requests.flatMap((r) => [r.vertex, r.first, r.last]))
    unique.set(point.label, point);
  const vertices = [...unique.values()];
  const mid = {
    x: vertices.reduce((sum, p) => sum + p.x, 0) / Math.max(1, vertices.length),
    y: vertices.reduce((sum, p) => sum + p.y, 0) / Math.max(1, vertices.length),
  };
  const occupied: LabelBox[] = [
    ...vertices.map((p) => boxAt(p, 18 * size, 18 * size)),
    ...(options.reserved ??
      vertices.map((p) => {
        // Vertex names are placed outside the figure. Reserve a generous upright
        // box there, as well as the point handle itself, before placing angles.
        const angle = Math.atan2(p.y - mid.y, p.x - mid.x);
        return boxAt(
          at(p, angle, vertexFontSize * 1.1),
          vertexFontSize * (p.label.length * 0.7 + 0.5),
          vertexFontSize * 1.45,
        );
      })),
  ];
  const entries = requests.flatMap((request) => {
    const { vertex, first, last } = request;
    const shortest = Math.min(
      Math.hypot(first.x - vertex.x, first.y - vertex.y),
      Math.hypot(last.x - vertex.x, last.y - vertex.y),
    );
    if (!(shortest > 0)) return [];
    const start = Math.atan2(first.y - vertex.y, first.x - vertex.x);
    let turn =
      request.turn ?? Math.atan2(last.y - vertex.y, last.x - vertex.x) - start;
    if (request.turn === undefined) {
      while (turn > Math.PI) turn -= Math.PI * 2;
      while (turn < -Math.PI) turn += Math.PI * 2;
    }
    const count = request.right ? 1 : Math.max(1, request.arcCount ?? 1);
    const outer = Math.min(
      25 * size + (count - 1) * 3.5 * size,
      shortest * 0.23,
    );
    const arcGap = Math.min(3.5 * size, outer / (count + 2));
    const radius = outer - (count - 1) * arcGap;
    const bisector = start + turn / 2;
    const anchor = at(vertex, bisector, request.right ? radius * 0.92 : outer);
    const width = fontSize * (request.text.length * 0.66 + 0.28) + padding * 2;
    const height = fontSize * 1.2 + padding * 2;
    const support =
      (Math.abs(Math.cos(bisector)) * width) / 2 +
      (Math.abs(Math.sin(bisector)) * height) / 2;
    const minimum = outer + support + 5 * size;
    return [
      {
        request,
        start,
        turn,
        radius,
        arcGap,
        outer,
        anchor,
        bisector,
        width,
        height,
        minimum,
      },
    ];
  });
  // Labels must also clear every other vertex's visible arc band.
  const arcObstacles = entries.flatMap((entry) => {
    const count = Math.max(3, Math.ceil(Math.abs(entry.turn) / (Math.PI / 12)));
    return Array.from({ length: count + 1 }, (_, i) =>
      boxAt(
        at(
          entry.request.vertex,
          entry.start + (entry.turn * i) / count,
          entry.outer,
        ),
        4 * size,
        4 * size,
      ),
    );
  });
  const placements = new Map<string, AngleLabelPlacement>();
  for (const entry of entries) {
    const {
      request,
      start,
      turn,
      radius,
      arcGap,
      anchor,
      bisector,
      width,
      height,
      minimum,
    } = entry;
    const polygons = options.polygons ?? [
      [request.vertex, request.first, request.last],
    ];
    const edges = polygons.flatMap((polygon) =>
      polygon.map((p, i) => [p, polygon[(i + 1) % polygon.length]]),
    );
    const fits = (box: LabelBox) =>
      ![...occupied, ...arcObstacles].some((other) => overlap(box, other)) &&
      !edges.some(([a, b]) => edgeCrossesLabel(a, b, box));
    let chosen: { box: LabelBox; point: XY; external: boolean } | undefined;
    // Keep a label in its own angle when there is room; inspect the whole box.
    for (const offset of [0, 0.5, 1, 1.75, 2.5]) {
      for (const turnOffset of [0, -0.12, 0.12, -0.25, 0.25]) {
        const point = at(
          request.vertex,
          bisector + turnOffset,
          minimum + fontSize * offset,
        );
        const box = boxAt(point, width, height);
        if (
          fits(box) &&
          polygons.some((polygon) =>
            corners(box).every((p) => inside(p, polygon)),
          )
        ) {
          chosen = { box, point, external: false };
          break;
        }
      }
      if (chosen) break;
    }
    // A finite set of obstacles always leaves room on a sufficiently large ring.
    // Keep searching outward instead of accepting overlaps on tiny triangles.
    for (let ring = 0; !chosen; ring++) {
      const distance = minimum + fontSize * (0.75 + ring * 0.8);
      let bestScore = Infinity;
      for (let i = 0; i < 32; i++) {
        const direction = bisector + Math.PI + (i * Math.PI) / 16;
        const point = at(request.vertex, direction, distance);
        const box = boxAt(point, width, height);
        if (!fits(box) || polygons.some((polygon) => inside(point, polygon)))
          continue;
        const throughLabels = occupied.filter((other) =>
          edgeCrossesLabel(
            { ...anchor, label: "" },
            { ...point, label: "" },
            other,
          ),
        ).length;
        const score =
          throughLabels * 10 + 1 - Math.cos(direction - bisector - Math.PI);
        if (score < bestScore) {
          bestScore = score;
          chosen = { box, point, external: true };
        }
      }
    }
    const { box, point, external } = chosen;
    const dx = anchor.x - point.x,
      dy = anchor.y - point.y;
    const edgeScale = Math.min(
      Math.abs(dx) > 1e-9 ? width / 2 / Math.abs(dx) : Infinity,
      Math.abs(dy) > 1e-9 ? height / 2 / Math.abs(dy) : Infinity,
    );
    const placement: AngleLabelPlacement = {
      ...box,
      key: request.key,
      textX: point.x,
      textY: point.y,
      fontSize,
      start,
      turn,
      radius,
      arcGap,
      ...(external
        ? {
            leader: {
              from: anchor,
              to: { x: point.x + dx * edgeScale, y: point.y + dy * edgeScale },
            },
          }
        : {}),
    };
    placements.set(request.key, placement);
    occupied.push(box);
  }
  return placements;
}
