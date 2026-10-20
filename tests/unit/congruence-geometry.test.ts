import { describe, expect, it } from "vitest";
import {
  comparisonShapes,
  rigidTransform,
  turnAtVertex,
  alignPose,
  usableTriangle,
} from "../../src/apps/congruence/geometry";
import type { Point } from "../../src/apps/similarity/types";

const triangle: Point[] = [
  { label: "A", x: 0, y: 0 },
  { label: "B", x: 30, y: 0 },
  { label: "C", x: 0, y: 40 },
];
const length = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

describe("congruence preserves the size of every triangle", () => {
  it("keeps 30, 40 and 50 sides through translation, rotation and reflection", () => {
    for (const reflected of [true, false])
      for (const angle of [-133, 0, 90, 263]) {
        const points = rigidTransform(triangle, {
          x: 220,
          y: 190,
          angle,
          reflected,
        });
        expect(length(points[0], points[1])).toBeCloseTo(30, 10);
        expect(length(points[0], points[2])).toBeCloseTo(40, 10);
        expect(length(points[1], points[2])).toBeCloseTo(50, 10);
      }
  });
  it("fits different-sized figures with one shared display factor", () => {
    const large = triangle.map((p) => ({
      ...p,
      label: p.label.toLowerCase(),
      x: 2 * p.x,
      y: 2 * p.y,
    }));
    const result = comparisonShapes(
      [...triangle, ...large],
      [
        ["A", "B", "C"],
        ["a", "b", "c"],
      ],
    );
    expect(
      length(result[1][0], result[1][1]) / length(result[0][0], result[0][1]),
    ).toBeCloseTo(2, 10);
  });
  it("a vertex gesture turns without resizing, even when the pointer moves outward", () => {
    const pose = { x: 200, y: 100, angle: 15, reflected: true };
    expect(turnAtVertex(pose, { x: 210, y: 100 }, { x: 200, y: 140 })).toEqual({
      ...pose,
      angle: 105,
    });
  });
  it("alignment moves and rotates a copy without making a larger triangle fit", () => {
    const pose = { x: 0, y: 0, angle: 0, reflected: false };
    const target = triangle.map((p) => ({
      ...p,
      x: p.x * 2 + 200,
      y: p.y * 2 + 100,
    }));
    const fitted = rigidTransform(triangle, alignPose(triangle, target, pose));
    expect(length(fitted[0], fitted[1])).toBeCloseTo(30, 10);
    expect(length(fitted[1], fitted[2])).toBeCloseTo(50, 10);
    expect(fitted.some((p, i) => length(p, target[i]) > 1)).toBe(true);
  });
  it("rejects straight-line traces despite pixel rounding while accepting a genuine triangle", () => {
    expect(
      usableTriangle([
        { label: "P", x: 0, y: 0 },
        { label: "R", x: 50, y: 50.2 },
        { label: "T", x: 100, y: 100 },
      ]),
    ).toBe(false);
    expect(usableTriangle(triangle)).toBe(true);
  });
});
