import type { LabId } from "./content";
import {
  angleAt,
  distance,
  getScene,
  normalise,
  wrapAngle,
  type DragKey,
  type Parameters,
} from "./geometry";

export type SnapResult = { parameters: Parameters; label: string | null };
type Target = { value: number; label: string; priority: number };
const arcTolerance = 4;
const offsetTolerance = 0.35;
const endpointTolerance = 11.5;
const endpoints = ["A", "B", "C", "D"];

/**
 * A local magnetic assist, not an answer generator: only the control being moved
 * changes. Pointer coordinates remain the source of the next candidate, so a
 * student can drag straight out of the attraction zone without unlocking it.
 */
export function snapParameters(
  lab: LabId,
  candidate: Parameters,
  key: DragKey,
  missionIndex?: number,
): SnapResult {
  const p = normalise(lab, candidate);
  const unchanged = { parameters: p, label: null };
  const mission =
    missionIndex !== undefined &&
    Number.isInteger(missionIndex) &&
    missionIndex >= 0 &&
    missionIndex <= 2
      ? missionIndex
      : undefined;

  if (lab === "bisector") {
    if (key !== "N" && key !== "secondary") return unchanged;
    const points = getScene(lab, p).points;
    const midpoint = {
      x: (points.A.x + points.B.x) / 2,
      y: (points.A.y + points.B.y) / 2,
    };
    if (
      distance(points.N, midpoint) > 8 &&
      Math.abs(angleAt(points.O, points.N, points.B) - 90) > 3
    )
      return unchanged;
    return {
      parameters: { ...p, secondary: 0 },
      label: "∠ONB = 90° · AN = NB",
    };
  }

  const second = ["C", "D", "N", "secondary"].includes(key);
  const first = ["A", "B", "M", "primary"].includes(key);
  if (!first && !second) return unchanged;
  if (
    lab !== "chords" &&
    lab !== "equal-arcs" &&
    lab !== "ratios" &&
    (!first || key === "M")
  )
    return unchanged;
  if (lab !== "chords" && (key === "M" || key === "N")) return unchanged;

  const valueKey = second ? "secondary" : "primary";
  const otherKey = second ? "primary" : "secondary";
  const rotationKey = second ? "rotation2" : "rotation";
  const targets: Target[] = [];
  const add = (value: number, label: string, priority = 1) => {
    if (Number.isFinite(value)) targets.push({ value, label, priority });
  };

  if (lab === "chords") {
    add(Math.abs(p[otherKey]), "AB = CD · OM = ON");
    add(-Math.abs(p[otherKey]), "AB = CD · OM = ON");
  } else if (lab === "equal-arcs" || lab === "ratios") {
    const angleName = second
      ? lab === "ratios" && p.alternate
        ? "∠CQD"
        : "∠COD"
      : lab === "ratios" && p.alternate
        ? "∠APB"
        : "∠AOB";
    const angleLabel = (sweep: number) =>
      `${angleName} = ${lab === "ratios" && p.alternate ? sweep / 2 : sweep}°`;
    if (lab === "equal-arcs" && mission !== undefined) {
      const target = [90, 60, 240][mission];
      add(
        target,
        mission === 1 ? `${second ? "CD" : "AB"} = 10 cm` : angleLabel(target),
        0,
      );
    }
    if (lab === "ratios") {
      const ratioTarget = (ratio: number, priority = 1) => {
        const target = second ? p.primary / ratio : p.secondary * ratio;
        add(target, `Arc AB : arc CD = ${ratio} : 1`, priority);
      };
      if (mission !== undefined) ratioTarget(mission === 2 ? 3 : 2, 0);
      for (const ratio of [1, 2, 3, 0.5, 1 / 3]) {
        const target = second ? p.primary / ratio : p.secondary * ratio;
        const label =
          ratio < 1
            ? `Arc AB : arc CD = 1 : ${Math.round(1 / ratio)}`
            : `Arc AB : arc CD = ${ratio} : 1`;
        add(target, label);
      }
    } else {
      add(p[otherKey], "Equal arcs · AB = CD");
      // Supplementary sweeps give equal chords, but their selected arcs differ.
      add(360 - p[otherKey], "AB = CD (different selected arcs)");
    }
    for (const value of [
      30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 315, 330,
    ])
      add(value, angleLabel(value), 2);
  } else {
    const targetAtP = (angle: number, priority: number) => {
      const sweep =
        lab !== "segment" && p.alternate ? 360 - 2 * angle : 2 * angle;
      add(sweep, `∠APB = ${angle}°`, priority);
    };
    if (mission !== undefined) {
      const angle =
        lab === "centre"
          ? [40, 120, 65][mission]
          : lab === "segment"
            ? [60, 60, 45][mission]
            : [90, 90, 60][mission];
      targetAtP(angle, 0);
    }
    for (const angle of [30, 45, 60, 90, 120, 135, 150]) targetAtP(angle, 2);
  }

  const tolerance = lab === "chords" ? offsetTolerance : arcTolerance;
  const min = lab === "chords" ? -9.8 : 20;
  const max = lab === "chords" ? 9.8 : 340;
  const nearby = targets
    .filter(
      (target) =>
        target.value >= min &&
        target.value <= max &&
        Math.abs(target.value - p[valueKey]) <= tolerance,
    )
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        Math.abs(a.value - p[valueKey]) - Math.abs(b.value - p[valueKey]),
    );
  for (const target of nearby) {
    const next = { ...p, [valueKey]: target.value };
    if (endpoints.includes(key)) {
      const movingFirst = key === "A" || key === "C";
      if (lab === "chords") {
        const half = (value: number) => (Math.acos(value / 10) * 180) / Math.PI;
        const direction = second ? -1 : 1;
        const delta = half(target.value) - half(p[valueKey]);
        next[rotationKey] = wrapAngle(
          p[rotationKey] + (movingFirst ? -direction : direction) * delta,
        );
      } else {
        const delta = target.value - p[valueKey];
        next[rotationKey] = wrapAngle(
          p[rotationKey] +
            (lab === "semicircle"
              ? movingFirst
                ? -delta
                : 0
              : (movingFirst ? -delta : delta) / 2),
        );
      }
      // Near the circumference, a tiny offset change can move a chord endpoint
      // a long way. Reject that jump even if the numeric distance is close.
      if (
        distance(
          getScene(lab, p).points[key],
          getScene(lab, next).points[key],
        ) > endpointTolerance
      )
        continue;
    }
    return { parameters: normalise(lab, next), label: target.label };
  }
  return unchanged;
}
