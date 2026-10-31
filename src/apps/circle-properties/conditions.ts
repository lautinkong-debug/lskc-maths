import type { LabId } from "./content";

export type Experiment = "radii" | "perpendicular" | "centre";
export type ConditionState = {
  experiment: Experiment;
  radius: number;
  angle: number;
  offset: number;
  reveal: boolean;
  firstBisector: boolean;
  secondBisector: boolean;
  guess: { x: number; y: number } | null;
  check: boolean;
};
export const initialConditions = (lab: LabId): ConditionState => ({
  experiment: lab === "bisector" ? "perpendicular" : "radii",
  radius: 9,
  angle: 70,
  offset: 3,
  reveal: false,
  firstBisector: false,
  secondBisector: false,
  guess: null,
  check: false,
});
const bounded = (
  value: unknown,
  low: number,
  high: number,
  fallback: number,
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(high, Math.max(low, value))
    : fallback;
export function parseConditions(value: unknown): ConditionState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Partial<ConditionState>;
  if (!["radii", "perpendicular", "centre"].includes(v.experiment ?? ""))
    return undefined;
  const g = v.guess;
  return {
    experiment: v.experiment!,
    radius: bounded(v.radius, 3, 9, 9),
    angle: bounded(v.angle, 30, 150, 70),
    offset: bounded(v.offset, -8, 8, 3),
    reveal: v.reveal === true,
    firstBisector: v.firstBisector === true,
    secondBisector: v.secondBisector === true,
    guess:
      g &&
      typeof g.x === "number" &&
      typeof g.y === "number" &&
      Number.isFinite(g.x) &&
      Number.isFinite(g.y)
        ? { x: bounded(g.x, -10, 10, 0), y: bounded(g.y, -10, 10, 0) }
        : null,
    check: v.check === true,
  };
}
export function radiusComparison(radius: number, angle: number) {
  const theta = (angle * Math.PI) / 180;
  return {
    first: { radius: 6, chord: 12 * Math.sin(theta / 2), arc: 6 * theta },
    second: {
      radius,
      chord: 2 * radius * Math.sin(theta / 2),
      arc: radius * theta,
    },
    equal: Math.abs(radius - 6) < 1e-9,
  };
}
export function perpendicularComparison(offset: number) {
  const half = Math.sqrt(10 ** 2 - 5 ** 2);
  return {
    half,
    an: half + offset,
    nb: half - offset,
    centreAngle: (Math.atan2(5, -offset) * 180) / Math.PI,
    throughCentre: Math.abs(offset) < 1e-9,
  };
}
export function chordWithBisector(direction: number, distance: number) {
  const angle = (direction * Math.PI) / 180;
  const tangent = { x: Math.cos(angle), y: Math.sin(angle) };
  const normal = { x: -tangent.y, y: tangent.x };
  const midpoint = { x: normal.x * distance, y: normal.y * distance };
  const half = Math.sqrt(100 - distance ** 2);
  return {
    a: { x: midpoint.x - tangent.x * half, y: midpoint.y - tangent.y * half },
    b: { x: midpoint.x + tangent.x * half, y: midpoint.y + tangent.y * half },
    midpoint,
    normal,
  };
}
export const locatedCentre = (guess: ConditionState["guess"]) =>
  !!guess && Math.hypot(guess.x, guess.y) <= 0.35;
