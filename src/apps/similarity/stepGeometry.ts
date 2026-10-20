import type { Point, SourceQuestion } from "./types";
import type { TextbookStep } from "./textbook-types";
import { reasonPairs, conditions } from "./reasons";

export const vertexNames = (name: string) =>
  name.includes(",") ? name.split(",") : (name.match(/[A-Z]\d*/g) ?? []);

function sameRay(vertex: Point, a: Point, b: Point) {
  const u = { x: a.x - vertex.x, y: a.y - vertex.y };
  const v = { x: b.x - vertex.x, y: b.y - vertex.y };
  const lengths = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  return lengths > 0 && (u.x * v.x + u.y * v.y) / lengths > 0.995;
}

export function equalAngleReference(
  first: string,
  second: string,
  source: Point[],
) {
  const get = (name: string) =>
    vertexNames(name).map((n) => source.find((p) => p.label === n));
  const [a, v, b] = get(first),
    [c, w, d] = get(second);
  return !!(
    a &&
    v &&
    b &&
    c &&
    w &&
    d &&
    v.label === w.label &&
    ((sameRay(v, a, c) && sameRay(v, b, d)) ||
      (sameRay(v, a, d) && sameRay(v, b, c)))
  );
}

/** Only textbook values establish right angles; never measure a traced drawing. */
export function knownRightAngles(question: SourceQuestion) {
  return reasonPairs(question).flatMap((pair) =>
    conditions(question, pair, "both")
      .filter((row) => row.kind === "angle" && row.degrees === 90)
      .flatMap((row) =>
        pair.shapes.map((id) => {
          const vertices = question.shapes[id].vertices,
            n = vertices.length,
            i = row.index;
          return [
            vertices[(i + n - 1) % n],
            vertices[i],
            vertices[(i + 1) % n],
          ].join(",");
        }),
      ),
  );
}

export type StepGeometry = {
  angles: { name: string; points: Point[] }[];
  sides: { name: string; points: Point[] }[];
  figures: { name: string; points: Point[] }[];
  points: Point[];
};

/** Resolve source references onto a rigid copy. Alternate names on the same
 * ray (e.g. CA/CG) identify the same angle without relying on measured angles. */
export function stepGeometry(
  highlights: TextbookStep["highlights"],
  source: Point[],
  placed: Point[] = source,
): StepGeometry {
  const original = new Map(source.map((p) => [p.label, p]));
  const actual = new Map(placed.map((p) => [p.label, p]));
  const sourceShape = placed.map((p) => original.get(p.label)!);
  const direct = (name: string) =>
    vertexNames(name)
      .map((n) => actual.get(n))
      .filter((p): p is Point => !!p);
  return {
    angles: (highlights.angles ?? []).flatMap((name) => {
      const names = vertexNames(name);
      const [a, v, b] = names.map((n) => original.get(n));
      if (!a || !v || !b || !actual.has(v.label)) return [];
      const first =
        actual.get(a.label) ??
        actual.get(sourceShape.find((p) => sameRay(v, a, p))?.label ?? "");
      const last =
        actual.get(b.label) ??
        actual.get(sourceShape.find((p) => sameRay(v, b, p))?.label ?? "");
      return first && last
        ? [{ name, points: [first, actual.get(v.label)!, last] }]
        : [];
    }),
    sides: (highlights.sides ?? []).flatMap((name) => {
      const ps = direct(name);
      return ps.length === 2 ? [{ name, points: ps }] : [];
    }),
    figures: (highlights.figures ?? []).flatMap((name) => {
      const ps = direct(name);
      return ps.length === vertexNames(name).length && ps.length >= 3
        ? [{ name, points: ps }]
        : [];
    }),
    points: (highlights.points ?? []).flatMap((name) =>
      actual.get(name) ? [actual.get(name)!] : [],
    ),
  };
}
