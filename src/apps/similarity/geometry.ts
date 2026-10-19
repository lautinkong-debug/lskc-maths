import type { Point, Shape, SourceQuestion } from "./types";

export type Pose = {
  x: number;
  y: number;
  angle: number;
  flipX: number;
  flipY: number;
  scale: number;
};
export const identityPose: Pose = {
  x: 0,
  y: 0,
  angle: 0,
  flipX: 1,
  flipY: 1,
  scale: 1,
};
export type VertexDragMode = "both" | "rotate" | "resize";
type XY = { x: number; y: number };
export type SnapTarget = { points: Point[]; pose: Pose };

/** Merge names only for documented correspondences whose whole figures overlap.
 * Recompute from positions so moving apart, resetting or changing selection cannot
 * leave a stale paired label. Shared vertices alone do not establish a match. */
export function overlappingShapeGroups(
  shapes: { id: number; points: Point[] }[],
  pairs: { shapes: readonly [number, number]; criterion: string }[],
): number[][] {
  const groups = shapes.map((shape) => [shape.id]);
  for (const pair of pairs) {
    if (pair.criterion === "not-similar") continue;
    const a = shapes.find((shape) => shape.id === pair.shapes[0])?.points;
    const b = shapes.find((shape) => shape.id === pair.shapes[1])?.points;
    if (!a || !b || a.length < 3 || a.length !== b.length) continue;
    const ca = centre(a),
      cb = centre(b);
    const energy = b.reduce(
      (sum, p) => sum + (p.x - cb.x) ** 2 + (p.y - cb.y) ** 2,
      0,
    );
    if (energy < 0.0001) continue;
    const radius = Math.sqrt(energy / b.length);
    // Snapping sets the centres equal, including for slightly imperfect source tracings.
    if (Math.hypot(ca.x - cb.x, ca.y - cb.y) > radius * 0.000001) continue;
    const error = a.reduce((sum, p, i) => sum + distance(p, b[i]) ** 2, 0);
    if (Math.sqrt(error / energy) > 0.08) continue;
    const first = groups.find((group) => group.includes(pair.shapes[0]))!;
    const second = groups.find((group) => group.includes(pair.shapes[1]))!;
    if (first !== second) {
      first.push(...second);
      groups.splice(groups.indexOf(second), 1);
    }
  }
  return groups
    .filter((group) => group.length > 1)
    .map((group) => group.sort((a, b) => a - b));
}

/** Fit corresponding vertices by a uniform similarity transform, never by deformation.
 * The caller supplies only source-proved pairs. Reflections remain an explicit learner action. */
export function snapPose(
  points: Point[],
  pose: Pose,
  targets: SnapTarget[],
  options: { pixelsPerUnit: number; mode?: VertexDragMode; tolerance?: number },
): Pose | null {
  const pixels = options.pixelsPerUnit;
  if (!(pixels > 0) || points.length < 3) return null;
  const sourceCentre = centre(points);
  let best: Pose | null = null,
    bestScore = Infinity;
  for (const target of targets) {
    if (target.points.length !== points.length) continue;
    const destination = transform(target.points, target.pose),
      targetCentre = centre(destination);
    let dot = 0,
      cross = 0,
      denominator = 0,
      targetEnergy = 0;
    points.forEach((p, i) => {
      const x = (p.x - sourceCentre.x) * pose.flipX,
        y = (p.y - sourceCentre.y) * pose.flipY;
      const u = destination[i].x - targetCentre.x,
        v = destination[i].y - targetCentre.y;
      dot += x * u + y * v;
      cross += x * v - y * u;
      denominator += x * x + y * y;
      targetEnergy += u * u + v * v;
    });
    if (denominator < 0.0001 || targetEnergy < 0.0001) continue;
    const angle = (Math.atan2(cross, dot) * 180) / Math.PI;
    const angleDelta = ((((angle - pose.angle + 540) % 360) + 360) % 360) - 180;
    const scale = Math.hypot(dot, cross) / denominator;
    if (
      scale < 0.25 ||
      scale > 3 ||
      Math.abs(angleDelta) > 10 ||
      Math.abs(scale / pose.scale - 1) > 0.13
    )
      continue;
    const candidate = {
      ...pose,
      ...targetCentre,
      angle: options.mode === "resize" ? pose.angle : pose.angle + angleDelta,
      scale: options.mode === "rotate" ? pose.scale : scale,
    };
    const fitted = transform(points, candidate),
      current = transform(points, pose);
    const fitError = fitted.reduce(
      (sum, p, i) => sum + distance(p, destination[i]) ** 2,
      0,
    );
    // Tracings can differ slightly; reject a wrong correspondence or reflected orientation.
    if (Math.sqrt(fitError / targetEnergy) > 0.08) continue;
    const movement =
      Math.sqrt(
        current.reduce((sum, p, i) => sum + distance(p, fitted[i]) ** 2, 0) /
          points.length,
      ) * pixels;
    if (movement > (options.tolerance ?? 22) || movement >= bestScore) continue;
    best = candidate;
    bestScore = movement;
  }
  return best;
}
/** A vertex controls one similarity transform about the fixed centroid, never a shear. */
export function poseFromVertex(
  pose: Pose,
  start: XY,
  end: XY,
  mode: VertexDragMode = "both",
): Pose {
  const ax = start.x - pose.x,
    ay = start.y - pose.y;
  const bx = end.x - pose.x,
    by = end.y - pose.y;
  const radius = Math.hypot(ax, ay);
  if (radius < 0.0001 || Math.hypot(bx, by) < 0.0001) return pose;
  const turn =
    (Math.atan2(ax * by - ay * bx, ax * bx + ay * by) * 180) / Math.PI;
  return {
    ...pose,
    angle: mode === "resize" ? pose.angle : pose.angle + turn,
    scale:
      mode === "rotate"
        ? pose.scale
        : Math.min(
            3,
            Math.max(0.25, (pose.scale * Math.hypot(bx, by)) / radius),
          ),
  };
}
/** Keep transformed copies inside their board so handles remain reachable. */
export function fitPose(
  points: Point[],
  pose: Pose,
  frame: { x: number; y: number; width: number; height: number },
  margin = 18,
  preserveScale = false,
): Pose {
  const next = { ...pose };
  let b = bounds(transform(points, next));
  const shrink = Math.min(
    1,
    (frame.width - margin * 2) / b.width,
    (frame.height - margin * 2) / b.height,
  );
  if (!preserveScale) next.scale *= shrink;
  b = bounds(transform(points, next));
  next.x += Math.max(
    frame.x + margin - b.x,
    Math.min(0, frame.x + frame.width - margin - b.x - b.width),
  );
  next.y += Math.max(
    frame.y + margin - b.y,
    Math.min(0, frame.y + frame.height - margin - b.y - b.height),
  );
  return next;
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function centre(points: Point[]) {
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}
export function bounds(points: Point[], padding = 0) {
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  return {
    x: Math.min(...xs) - padding,
    y: Math.min(...ys) - padding,
    width: Math.max(...xs) - Math.min(...xs) + 2 * padding,
    height: Math.max(...ys) - Math.min(...ys) + 2 * padding,
  };
}
export function transform(points: Point[], pose: Pose): Point[] {
  const c = centre(points),
    r = (pose.angle * Math.PI) / 180;
  return points.map((p) => {
    const x = (p.x - c.x) * pose.flipX * pose.scale,
      y = (p.y - c.y) * pose.flipY * pose.scale;
    return {
      label: p.label,
      x: pose.x + x * Math.cos(r) - y * Math.sin(r),
      y: pose.y + x * Math.sin(r) + y * Math.cos(r),
    };
  });
}
/** The pilot satisfies all givens exactly; screen coordinates have y downwards. */
export function q19Points(): Point[] {
  const s = Math.sqrt(5);
  return [
    { label: "A", x: 0, y: 0 },
    { label: "B", x: 0, y: 1.5 * s },
    { label: "C", x: 3, y: 1.5 * s },
    { label: "D", x: 3 + s, y: 1.5 * s - 2 },
    { label: "E", x: s, y: -2 },
    { label: "F", x: s, y: 0 },
  ].map((p) => ({ ...p, x: 140 + 60 * p.x, y: 180 + 60 * p.y }));
}
export function modelPoints(question: SourceQuestion) {
  return question.id === "ex8c-19"
    ? q19Points()
    : question.points.map((p) => ({ ...p, x: p.x * 1000, y: p.y * 1320 }));
}
export function shapePoints(shape: Shape, points: Point[]) {
  return shape.vertices.map((label) => {
    const point = points.find((p) => p.label === label);
    if (!point) throw new Error(`Missing vertex ${label} in ${shape.name}`);
    return point;
  });
}
export function boardShapes(shapes: Shape[], points: Point[]) {
  const sets = shapes.map((s) => shapePoints(s, points));
  const span = Math.max(
    1,
    ...sets.map((p) => Math.max(bounds(p).width, bounds(p).height)),
  );
  const factor = 225 / span;
  return sets.map((ps) =>
    ps.map((p) => ({ ...p, x: p.x * factor, y: p.y * factor })),
  );
}
export function separatePoses(count: number): Pose[] {
  return Array.from({ length: count }, (_, i) => ({
    ...identityPose,
    x: ((i + 1) * 840) / (count + 1),
    y: 235,
  }));
}
export function signedArea(ps: Point[]) {
  return (
    ps.reduce((sum, p, i) => {
      const q = ps[(i + 1) % ps.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0) / 2
  );
}
/** Orient the supplied vertex orders; never deform a source tracing to force a fit. */
export function comparisonPoses(sets: Point[][], enlarge = false): Pose[] {
  if (sets.length < 2) return separatePoses(sets.length);
  const target = sets[1];
  const direction = Math.atan2(
    target[1].y - target[0].y,
    target[1].x - target[0].x,
  );
  return sets.map((ps, i) => {
    const flipY =
      Math.sign(signedArea(ps)) === Math.sign(signedArea(target)) ? 1 : -1;
    const angle =
      ((direction -
        Math.atan2((ps[1].y - ps[0].y) * flipY, ps[1].x - ps[0].x)) *
        180) /
      Math.PI;
    return {
      ...identityPose,
      x: enlarge ? 420 : ((i + 1) * 840) / (sets.length + 1),
      y: 235,
      flipY,
      angle,
      scale: enlarge
        ? distance(target[0], target[1]) / distance(ps[0], ps[1])
        : 1,
    };
  });
}
