import { clamp, distance, wrapAngle, type Point } from "./geometry";
import {
  FLOW_CENTRE as O,
  FLOW_RADIUS,
  getReasonScene,
  normaliseReasonParameters,
  toFlowPoint,
  type ReasonParameters,
} from "./reasonExploration";

export type ChordId = "AB" | "CD";
export type ChordPair = Record<ChordId, ReasonParameters>;
export const otherChord = (id: ChordId) => (id === "AB" ? "CD" : "AB");
const minimumSeparation = 16;
export function distinctlyTurned(
  first: ReasonParameters,
  other: ReasonParameters,
) {
  const difference =
    wrapAngle((other.rotation ?? 0) - (first.rotation ?? 0)) % 180;
  return Math.min(difference, 180 - difference) >= minimumSeparation - 1e-7;
}

export function startingChords(
  first: ReasonParameters,
  other?: ReasonParameters,
): ChordPair {
  const AB = normaliseReasonParameters("r3", first);
  const saved = other && normaliseReasonParameters("r3", other);
  const offset = saved?.primary ?? 7.2;
  if (saved && distinctlyTurned(AB, saved)) return { AB, CD: saved };
  // Leave room between the four endpoints and either end of the opposite bisector.
  const firstHalf = (Math.acos(Math.abs(AB.primary) / 10) * 180) / Math.PI;
  const secondHalf = (Math.acos(Math.abs(offset) / 10) * 180) / Math.PI;
  const separation = (a: number, b: number) =>
    Math.abs(wrapAngle(a - b + 180) - 180);
  let turn = 120;
  let largest = -1;
  for (const candidate of [120, 105, 135, 95, 145, 65, 155]) {
    const ends = [candidate - secondHalf, candidate + secondHalf];
    const clearance = Math.min(
      ...ends.flatMap((end) =>
        [-firstHalf, firstHalf, 0, 180].map((mark) => separation(end, mark)),
      ),
      ...[-firstHalf, firstHalf].flatMap((end) =>
        [candidate, candidate + 180].map((mark) => separation(end, mark)),
      ),
    );
    if (clearance > largest) {
      turn = candidate;
      largest = clearance;
    }
    if (clearance >= 12) break;
  }
  const rotation = wrapAngle(
    (AB.rotation ?? 0) + (AB.primary * offset < 0 ? 180 : 0) + turn,
  );
  return { AB, CD: { ...AB, primary: offset, rotation } };
}

export function turnLimits(pair: ChordPair, id: ChordId) {
  const current = pair[id].rotation ?? 0;
  const relative =
    wrapAngle(current - (pair[otherChord(id)].rotation ?? 0)) % 180;
  return {
    min: current - relative + minimumSeparation,
    max: current - relative + 180 - minimumSeparation,
  };
}

export function turnChord(
  pair: ChordPair,
  id: ChordId,
  angle: number,
): ChordPair {
  const current = pair[id].rotation ?? 0;
  const nearest = current + wrapAngle(angle - current + 180) - 180;
  const { min, max } = turnLimits(pair, id);
  return {
    ...pair,
    [id]: { ...pair[id], rotation: wrapAngle(clamp(nearest, min, max)) },
  };
}

export function moveMidpoint(
  pair: ChordPair,
  id: ChordId,
  target: Point,
): ChordPair {
  const length = distance(target, O);
  // Leave a usable thumb near the centre and retain the original order of the endpoint names.
  const sign = Math.sign(pair[id].primary);
  const direction =
    length < 1e-6
      ? (pair[id].rotation ?? 0)
      : (Math.atan2(target.y - O.y, target.x - O.x) * 180) / Math.PI +
        90 +
        (sign < 0 ? 180 : 0);
  const next = turnChord(pair, id, direction);
  return {
    ...next,
    [id]: {
      ...next[id],
      primary: sign * clamp((10 * length) / FLOW_RADIUS, 0.5, 9.2),
    },
  };
}

export function shift(p: Point, direction: Point, amount: number): Point {
  return { x: p.x + amount * direction.x, y: p.y + amount * direction.y };
}

export function chordConstruction(shape: ReasonParameters) {
  const points = getReasonScene("r3", shape).points;
  const a = toFlowPoint(points.A),
    b = toFlowPoint(points.B),
    mid = toFlowPoint(points.N);
  const half = distance(mid, b),
    offset = distance(O, mid);
  const along = { x: (b.x - mid.x) / half, y: (b.y - mid.y) / half };
  const normal = { x: (mid.x - O.x) / offset, y: (mid.y - O.y) / offset };
  const squareDirection = offset < 28 ? 1 : -1;
  const squareStart = shift(mid, along, 17);
  const squareEnd = shift(mid, normal, squareDirection * 17);
  const corner = shift(squareEnd, along, 17);
  return {
    a,
    b,
    mid,
    along,
    normal,
    half,
    corner,
    line: [shift(O, normal, -145), shift(O, normal, 145)] as const,
    square: [squareStart, corner, squareEnd]
      .map((p) => p.x + "," + p.y)
      .join(" "),
  };
}
