import { describe, expect, it } from "vitest";
import {
  DEFAULT_VIEW,
  limitView,
  projectView,
  rotatePoint,
  unfoldingView,
} from "../../src/apps/surface-area/view";

describe("solid camera", () => {
  it("retains the textbook parallel projection when reset", () => {
    expect(projectView({ x: 8, y: 4 }, 13)).toMatchObject({ x: 5.8, y: -14.8 });
    expect(projectView({ x: 8, y: 4 }, 13).depth).toBeCloseTo(-2.55);
    expect(projectView({ x: 8, y: 4 }, 13, DEFAULT_VIEW, true).y).toBeCloseTo(
      -16.36,
    );
  });
  it("rotates rigidly without changing edge lengths or volume", () => {
    for (const yaw of [-180, -90, 0, 90, 180])
      for (const tilt of [-10, 0, 30, 55]) {
        const a = rotatePoint({ x: 2, y: 3 }, 4, { yaw, tilt });
        const b = rotatePoint({ x: 7, y: -1 }, 17, { yaw, tilt });
        expect(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z)).toBeCloseTo(
          Math.sqrt(210),
          10,
        );
        expect(Math.hypot(a.x, a.y, a.z)).toBeCloseTo(Math.sqrt(29), 10);
      }
  });
  it("keeps height edges vertical and above-zero on-screen at every allowed tilt", () => {
    for (const cubes of [false, true])
      for (const tilt of [-10, 0, 55])
        for (const yaw of [-180, -90, 0, 90]) {
          const a = projectView({ x: 5, y: 3 }, 0, { yaw, tilt }, cubes);
          const b = projectView({ x: 5, y: 3 }, 10, { yaw, tilt }, cubes);
          expect(b.x).toBeCloseTo(a.x, 10);
          expect(b.y).toBeLessThan(a.y - 1);
        }
  });
  it("wraps full turns and clamps tilt before the height becomes edge-on", () => {
    expect(limitView({ yaw: 450, tilt: 90 })).toEqual({ yaw: 90, tilt: 55 });
    expect(limitView({ yaw: -450, tilt: -90 })).toEqual({
      yaw: -90,
      tilt: -10,
    });
  });
  it("returns continuously to the original flat-strip projection", () => {
    expect(unfoldingView({ yaw: 90, tilt: 40 }, 0.5)).toEqual({
      yaw: 45,
      tilt: 20,
    });
    expect(unfoldingView({ yaw: 90, tilt: 40 }, 1)).toEqual(DEFAULT_VIEW);
  });
});
