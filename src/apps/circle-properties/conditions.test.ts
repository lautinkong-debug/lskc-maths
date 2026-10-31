import { describe, expect, it } from "vitest";
import {
  radiusComparison,
  perpendicularComparison,
  chordWithBisector,
  locatedCentre,
  parseConditions,
  initialConditions,
} from "./conditions";

describe("condition experiments", () => {
  it("equal angles only give equal arc and chord lengths when radii match", () => {
    for (const angle of [30, 70, 90, 150])
      for (const radius of [3, 4.5, 6, 8, 9]) {
        const model = radiusComparison(radius, angle);
        expect(model.second.arc / model.first.arc).toBeCloseTo(radius / 6, 12);
        expect(model.second.chord / model.first.chord).toBeCloseTo(
          radius / 6,
          12,
        );
        expect(model.equal).toBe(radius === 6);
      }
    expect(radiusComparison(6, 60).first.chord).toBeCloseTo(6, 12);
    expect(radiusComparison(9, 60).second.chord).toBeCloseTo(9, 12);
  });
  it("a perpendicular that misses the centre is a real counterexample to bisection", () => {
    const off = perpendicularComparison(3),
      middle = perpendicularComparison(0);
    expect(off.an - off.nb).toBeCloseTo(6, 12);
    expect(off.centreAngle).not.toBeCloseTo(90);
    expect(off.throughCentre).toBe(false);
    expect(middle.an).toBeCloseTo(middle.nb, 12);
    expect(middle.centreAngle).toBe(90);
    for (const x of [-8, -2, 0, 2, 8]) {
      const m = perpendicularComparison(x);
      expect(m.an).toBeGreaterThan(0);
      expect(m.nb).toBeGreaterThan(0);
      expect(m.an + m.nb).toBeCloseTo(Math.sqrt(300), 12);
    }
  });
  it("both displayed chords lie on the circle and their bisectors intersect at the true centre", () => {
    const constructions = [
      chordWithBisector(18, 4),
      chordWithBisector(107, 5.5),
    ];
    for (const c of constructions) {
      expect(Math.hypot(c.a.x, c.a.y)).toBeCloseTo(10, 12);
      expect(Math.hypot(c.b.x, c.b.y)).toBeCloseTo(10, 12);
      expect((c.a.x + c.b.x) / 2).toBeCloseTo(c.midpoint.x, 12);
      expect((c.a.y + c.b.y) / 2).toBeCloseTo(c.midpoint.y, 12);
      expect(
        (c.b.x - c.a.x) * c.normal.x + (c.b.y - c.a.y) * c.normal.y,
      ).toBeCloseTo(0, 12);
      expect(c.midpoint.x * c.normal.y - c.midpoint.y * c.normal.x).toBeCloseTo(
        0,
        12,
      );
    }
    expect(
      Math.abs(
        constructions[0].normal.x * constructions[1].normal.y -
          constructions[0].normal.y * constructions[1].normal.x,
      ),
    ).toBeGreaterThan(0.9);
    expect(locatedCentre({ x: 0, y: 0 })).toBe(true);
    expect(locatedCentre({ x: 0.4, y: 0 })).toBe(false);
    expect(locatedCentre(null)).toBe(false);
  });
  it("bounds saved parameters and rejects an unknown experiment", () => {
    expect(parseConditions({ experiment: "bad" })).toBeUndefined();
    const value = parseConditions({
      ...initialConditions("bisector"),
      radius: 1e10,
      angle: Infinity,
      offset: -100,
      guess: { x: NaN, y: 0 },
    })!;
    expect(value.radius).toBe(9);
    expect(value.angle).toBe(70);
    expect(value.offset).toBe(-8);
    expect(value.guess).toBeNull();
  });
});
