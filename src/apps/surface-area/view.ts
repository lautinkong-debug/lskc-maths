import type { Point } from "./types";

export type SolidView = { yaw: number; tilt: number };
export const DEFAULT_VIEW: SolidView = { yaw: 0, tilt: 0 };
export const limitView = (view: SolidView): SolidView => ({
  yaw: ((((view.yaw + 180) % 360) + 360) % 360) - 180,
  // Keep the camera above the base and avoid an edge-on height dimension.
  tilt: Math.max(-10, Math.min(55, view.tilt)),
});
export const unfoldingView = (
  view: SolidView,
  progress: number,
): SolidView => ({
  yaw: view.yaw * (1 - progress),
  tilt: view.tilt * (1 - progress),
});

/** Rigid 3D rotation: turn about the prism axis, then tilt about screen-right. */
export function rotatePoint(p: Point, z: number, view: SolidView) {
  const yaw = (view.yaw * Math.PI) / 180,
    tilt = (view.tilt * Math.PI) / 180;
  const x = p.x * Math.cos(yaw) - p.y * Math.sin(yaw);
  const y = p.x * Math.sin(yaw) + p.y * Math.cos(yaw);
  const length = Math.hypot(1, 0.55),
    hx = 1 / length,
    hy = -0.55 / length;
  const cosine = Math.cos(tilt),
    sine = Math.sin(tilt),
    dot = hx * x + hy * y;
  return {
    x: x * cosine + hy * z * sine + hx * dot * (1 - cosine),
    y: y * cosine - hx * z * sine + hy * dot * (1 - cosine),
    z: z * cosine + (hx * y - hy * x) * sine,
  };
}

/** Retain the original parallel projection at the reset view. */
export function projectView(
  p: Point,
  z: number,
  view = DEFAULT_VIEW,
  cubes = false,
) {
  const q = rotatePoint(p, z, view);
  const a = cubes ? 0.28 : 0,
    b = cubes ? 0.28 : 0.45;
  return {
    x: q.x - 0.55 * q.y,
    y: -a * q.x - b * q.y - q.z,
    depth: -0.55 * q.x - q.y + (b + 0.55 * a) * q.z,
  };
}
