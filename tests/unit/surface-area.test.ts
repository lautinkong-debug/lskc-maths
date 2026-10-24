import { describe, expect, it } from "vitest";
import {
  PILOT,
  surfaceMetrics,
  unfoldChain,
  workingLines,
} from "../../src/apps/surface-area/model";

describe("Example 9.11 surface area", () => {
  it("recalculates the printed dimensions independently", () => {
    expect(surfaceMetrics()).toEqual({
      perimeter: 22,
      height: 13,
      baseArea: 26,
      lateralArea: 286,
      totalArea: 338,
    });
  });
  it("opens rigid faces without stretching the base edges", () => {
    for (const progress of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const points = unfoldChain(progress);
      expect(points).toHaveLength(5);
      for (let i = 0; i < 4; i++) {
        expect(
          Math.hypot(
            points[i + 1].x - points[i].x,
            points[i + 1].y - points[i].y,
          ),
        ).toBeCloseTo([5, 4, 8, 5][i], 10);
      }
    }
  });
  it("starts closed and ends as a perimeter-length line", () => {
    const closed = unfoldChain(0);
    expect(closed[4].x).toBeCloseTo(closed[0].x);
    expect(closed[4].y).toBeCloseTo(closed[0].y);
    expect(unfoldChain(1).map((p) => p.x)).toEqual([0, 5, 9, 17, 22]);
    expect(unfoldChain(1).every((p) => p.y === 0)).toBe(true);
    expect(PILOT.height).toBe(13);
  });
  it("clamps the unfolding to its physical endpoints", () => {
    expect(unfoldChain(-1)).toEqual(unfoldChain(0));
    expect(unfoldChain(2)).toEqual(unfoldChain(1));
  });
  it("keeps total area out of earlier steps", () => {
    expect(workingLines(0)).toEqual([]);
    expect(workingLines(1).join(" ")).not.toContain("286");
    expect(workingLines(3).join(" ")).toContain("286");
    expect(workingLines(3).join(" ")).not.toContain("338");
    expect(workingLines(4).join(" ")).toContain("338");
  });
});
