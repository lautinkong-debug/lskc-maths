import type { Point } from "../similarity/types";
import { centre } from "../similarity/geometry";

/** A rigid pose deliberately has no scale field. Zoom belongs to the camera. */
export type RigidPose = {
  x: number;
  y: number;
  angle: number;
  reflected: boolean;
};

export function rigidTransform(points: Point[], pose: RigidPose): Point[] {
  const origin = centre(points);
  const radians = (pose.angle * Math.PI) / 180;
  return points.map((p) => {
    const x = (p.x - origin.x) * (pose.reflected ? -1 : 1);
    const y = p.y - origin.y;
    return {
      label: p.label,
      x: pose.x + x * Math.cos(radians) - y * Math.sin(radians),
      y: pose.y + x * Math.sin(radians) + y * Math.cos(radians),
    };
  });
}

/** One shared display factor preserves size differences, including distractors. */
export function comparisonShapes(
  points: Point[],
  names: string[][],
  referenceNames = names,
): Point[][] {
  const sets = names.map((vertices) =>
    vertices.map((label) => points.find((p) => p.label === label)!),
  );
  const diameter = Math.max(
    1,
    ...referenceNames
      .map((names) =>
        names.map((label) => points.find((p) => p.label === label)!),
      )
      .flatMap((set) =>
        set.flatMap((a) => set.map((b) => Math.hypot(a.x - b.x, a.y - b.y))),
      ),
  );
  const factor = 280 / diameter;
  return sets.map((set) => {
    const origin = centre(set);
    return set.map((p) => ({
      label: p.label,
      x: (p.x - origin.x) * factor,
      y: (p.y - origin.y) * factor,
    }));
  });
}

/** Pixel tracings cannot distinguish a nearly straight line from rounding noise. */
export function usableTriangle(points: Point[]): boolean {
  if (points.length !== 3 || new Set(points.map((p) => p.label)).size !== 3)
    return false;
  const [a, b, c] = points;
  const twiceArea = Math.abs(
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x),
  );
  const longestSquared = Math.max(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2,
    (a.x - c.x) ** 2 + (a.y - c.y) ** 2,
    (b.x - c.x) ** 2 + (b.y - c.y) ** 2,
  );
  return longestSquared > 0 && twiceArea / longestSquared > 0.01;
}

export function separatePoses(count: number): RigidPose[] {
  return Array.from({ length: count }, (_, i) => ({
    x: ((i + 0.5) * 840) / count,
    y: 230,
    angle: 0,
    reflected: false,
  }));
}

export function turnAtVertex(
  pose: RigidPose,
  start: { x: number; y: number },
  end: { x: number; y: number },
): RigidPose {
  const a = { x: start.x - pose.x, y: start.y - pose.y };
  const b = { x: end.x - pose.x, y: end.y - pose.y };
  if (Math.hypot(a.x, a.y) < 0.01 || Math.hypot(b.x, b.y) < 0.01) return pose;
  const turn = Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
  return { ...pose, angle: pose.angle + (turn * 180) / Math.PI };
}

/** Align corresponding vertices by rotation/translation only, retaining reflection.
 * Different sizes remain different. A visual overlap does not establish a proof.
 */
export function alignPose(
  source: Point[],
  target: Point[],
  pose: RigidPose,
): RigidPose {
  if (source.length !== target.length || source.length < 3) return pose;
  const a = centre(source),
    b = centre(target);
  let dot = 0,
    cross = 0;
  source.forEach((p, i) => {
    const x = (p.x - a.x) * (pose.reflected ? -1 : 1),
      y = p.y - a.y;
    const u = target[i].x - b.x,
      v = target[i].y - b.y;
    dot += x * u + y * v;
    cross += x * v - y * u;
  });
  return {
    ...pose,
    x: b.x,
    y: b.y,
    angle: (Math.atan2(cross, dot) * 180) / Math.PI,
  };
}
