import { describe, expect, it } from "vitest";
import {
  angleAt,
  circlePoint,
  CENTRE,
  defaults,
  distance,
  dragParameter,
  getModel,
  getScene,
  RADIUS,
} from "./geometry";
import type { LabId } from "./content";

describe("circle constructions", () => {
  it("measures midpoint and perpendicular conditions independently", () => {
    for (const primary of [1, 3, 5, 8]) {
      const midpoint = getScene("bisector", {
        primary,
        secondary: 0,
        alternate: false,
      }).points;
      expect(distance(midpoint.A, midpoint.N)).toBeCloseTo(
        distance(midpoint.N, midpoint.B),
        10,
      );
      expect(angleAt(midpoint.O, midpoint.N, midpoint.B)).toBeCloseTo(90, 10);
      const moved = getScene("bisector", {
        primary,
        secondary: 50,
        alternate: false,
      }).points;
      expect(distance(moved.A, moved.N)).not.toBeCloseTo(
        distance(moved.N, moved.B),
        5,
      );
      expect(angleAt(moved.O, moved.N, moved.B)).toBeGreaterThan(90);
    }
  });
  it("equal perpendicular distances give equal chords and increasing distance shortens the chord", () => {
    for (const primary of [1, 4, 8]) {
      const equal = getScene("chords", {
        primary,
        secondary: primary,
        alternate: false,
      }).points;
      expect(distance(equal.A, equal.B)).toBeCloseTo(
        distance(equal.C, equal.D),
        10,
      );
      expect(angleAt(equal.O, equal.M, equal.B)).toBeCloseTo(90, 10);
      const unequal = getScene("chords", {
        primary,
        secondary: primary + 1,
        alternate: false,
      }).points;
      expect(distance(unequal.A, unequal.B)).toBeGreaterThan(
        distance(unequal.C, unequal.D),
      );
    }
  });
  it("selects the intercepted central angle including reflex cases", () => {
    for (const primary of [50, 95, 150])
      for (const secondary of [15, 47, 85])
        for (const alternate of [false, true]) {
          const points = getScene("centre", {
            primary,
            secondary,
            alternate,
          }).points;
          const central = angleAt(points.A, points.O, points.B);
          expect(2 * angleAt(points.A, points.P, points.B)).toBeCloseTo(
            alternate ? 360 - central : central,
            8,
          );
          expect(
            getModel("centre", { primary, secondary, alternate })
              .measurements[0].value,
          ).toBeCloseTo(2 * angleAt(points.A, points.P, points.B), 8);
        }
  });
  it("distinguishes same-segment equality from opposite-segment supplementary angles", () => {
    for (const primary of [60, 110, 150])
      for (const secondary of [60, 74, 88])
        for (const alternate of [false, true]) {
          const s = getScene("segment", {
            primary,
            secondary,
            alternate,
          }).points;
          const a = angleAt(s.A, s.P, s.B),
            b = angleAt(s.A, s.Q, s.B);
          if (alternate) {
            expect(a + b).toBeCloseTo(180, 9);
            expect(a).not.toBeCloseTo(b, 4);
          } else expect(a).toBeCloseTo(b, 9);
        }
  });
  it("has a right angle exactly when the chord is a diameter", () => {
    for (const primary of [120, 150, 180, 210, 240])
      for (const secondary of [20, 50, 80]) {
        const s = getScene("semicircle", {
          primary,
          secondary,
          alternate: false,
        }).points;
        if (primary === 180) {
          expect(angleAt(s.A, s.P, s.B)).toBeCloseTo(90, 9);
          expect(distance(s.A, s.B)).toBeCloseTo(2 * RADIUS, 9);
        } else {
          expect(angleAt(s.A, s.P, s.B)).not.toBeCloseTo(90, 4);
          expect(distance(s.A, s.B)).toBeLessThan(2 * RADIUS);
        }
      }
  });
  it("preserves arc-angle ratio at both centre and circumference, but not chord ratio", () => {
    for (const alternate of [false, true]) {
      const p = { primary: 60, secondary: 120, alternate };
      const m = getModel("ratios", p).measurements;
      expect(m.find((m) => m.label === "Arc AB ÷ arc CD")!.value).toBeCloseTo(
        0.5,
        10,
      );
      expect(m.find((m) => m.label === "Angle ratio")!.value).toBeCloseTo(
        0.5,
        10,
      );
      expect(m.find((m) => m.label === "Chord AB ÷ CD")!.value).toBeCloseTo(
        1 / Math.sqrt(3),
        10,
      );
      const s = getScene("ratios", p).points;
      if (alternate) {
        expect(angleAt(s.A, s.P, s.B)).toBeCloseTo(30, 9);
        expect(angleAt(s.C, s.Q, s.D)).toBeCloseTo(60, 9);
      }
    }
  });
  it("keeps all circumference points on the circle and every measurement finite", () => {
    for (const lab of Object.keys(defaults) as LabId[]) {
      const model = getModel(lab, defaults[lab]);
      for (const c of model.controls)
        for (const edge of [c.min, c.max]) {
          const p = { ...defaults[lab], [c.key]: edge };
          const scene = getScene(lab, p);
          for (const [name, point] of Object.entries(scene.points))
            if (["A", "B", "C", "D", "P", "Q"].includes(name))
              expect(distance(point, CENTRE)).toBeCloseTo(RADIUS, 8);
          for (const measurement of getModel(lab, p).measurements)
            expect(Number.isFinite(measurement.value)).toBe(true);
        }
    }
  });
  it("projects N onto a rotated chord, with midpoint perpendicular at every orientation", () => {
    for (const rotation of [0, 32, 90, 177, 270, 359]) {
      const p = { ...defaults.bisector, rotation };
      const before = getScene("bisector", p).points;
      const target = {
        x: (before.A.x + before.B.x) / 2,
        y: (before.A.y + before.B.y) / 2,
      };
      const after = dragParameter("bisector", p, "N", target);
      expect(after.secondary).toBeCloseTo(0, 9);
      const s = getScene("bisector", after).points;
      expect(angleAt(s.O, s.N, s.B)).toBeCloseTo(90, 8);
      expect(distance(s.A, s.N)).toBeCloseTo(distance(s.B, s.N), 8);
    }
  });
  it("moves each chord endpoint independently while its partner stays fixed", () => {
    for (const lab of ["bisector", "chords"] as const) {
      for (const [key, partner] of [
        ["A", "B"],
        ["B", "A"],
        ...(lab === "chords"
          ? [
              ["C", "D"],
              ["D", "C"],
            ]
          : []),
      ]) {
        const before = getScene(lab, defaults[lab]).points;
        const oldBearing =
          (Math.atan2(before[key].y - CENTRE.y, before[key].x - CENTRE.x) *
            180) /
          Math.PI;
        const target = circlePoint(oldBearing + 12.37);
        const afterParameters = dragParameter(
          lab,
          defaults[lab],
          key as "A" | "B" | "C" | "D",
          target,
        );
        const after = getScene(lab, afterParameters).points;
        expect(distance(after[partner], before[partner])).toBeLessThan(1e-7);
        expect(distance(after[key], target)).toBeLessThan(1e-7);
        expect(distance(after[key], before[key])).toBeGreaterThan(20);
      }
    }
  });
  it("moves arc endpoints independently without snapping to 5 degree steps", () => {
    for (const lab of [
      "centre",
      "segment",
      "semicircle",
      "equal-arcs",
      "ratios",
    ] as const) {
      const pairs = [
        ["A", "B"],
        ["B", "A"],
        ...(lab === "equal-arcs" || lab === "ratios"
          ? [
              ["C", "D"],
              ["D", "C"],
            ]
          : []),
      ];
      for (const [key, partner] of pairs) {
        const before = getScene(lab, defaults[lab]).points;
        const oldBearing =
          (Math.atan2(before[key].y - CENTRE.y, before[key].x - CENTRE.x) *
            180) /
          Math.PI;
        const target = circlePoint(oldBearing + 7.123);
        const after = getScene(
          lab,
          dragParameter(
            lab,
            defaults[lab],
            key as "A" | "B" | "C" | "D",
            target,
          ),
        ).points;
        expect(distance(after[partner], before[partner])).toBeLessThan(1e-7);
        expect(distance(after[key], target)).toBeLessThan(1e-7);
      }
    }
  });
  it("allows P to move across either arc and automatically matches the reflex angle", () => {
    for (const primary of [40, 100, 220, 310]) {
      const parameters = { ...defaults.centre, primary, rotation: 53 };
      const start = 90 - primary / 2 + parameters.rotation;
      for (const target of [
        circlePoint(start + primary / 2),
        circlePoint(start + primary + (360 - primary) / 2),
      ]) {
        const moved = dragParameter("centre", parameters, "P", target);
        const s = getScene("centre", moved).points;
        expect(distance(s.P, target)).toBeLessThan(1e-7);
        expect(getModel("centre", moved).measurements[0].value).toBeCloseTo(
          2 * angleAt(s.A, s.P, s.B),
          8,
        );
      }
    }
  });
  it("lets both segment vertices move and allows Q to change sides", () => {
    const original = defaults.segment;
    const start = 90 - original.primary / 2,
      end = start + original.primary;
    const movedP = dragParameter(
      "segment",
      original,
      "P",
      circlePoint(end + 0.53 * (360 - original.primary)),
    );
    expect(movedP.tertiary).toBeCloseTo(53, 8);
    const oppositeQ = dragParameter(
      "segment",
      movedP,
      "Q",
      circlePoint(start + original.primary / 2),
    );
    expect(oppositeQ.alternate).toBe(true);
    const s = getScene("segment", oppositeQ).points;
    expect(angleAt(s.A, s.P, s.B) + angleAt(s.A, s.Q, s.B)).toBeCloseTo(180, 8);
  });
  it("preserves major-arc ratios under independent rotations", () => {
    for (const alternate of [false, true]) {
      const parameters = {
        ...defaults.ratios,
        primary: 240,
        secondary: 300,
        rotation: 51,
        rotation2: 213,
        alternate,
      };
      const measurements = getModel("ratios", parameters).measurements;
      expect(
        measurements.find((m) => m.label === "Arc AB ÷ arc CD")!.value,
      ).toBeCloseTo(0.8, 9);
      expect(
        measurements.find((m) => m.label === "Angle ratio")!.value,
      ).toBeCloseTo(0.8, 9);
    }
  });
  it("reports every length in centimetres and keeps ratios dimensionless", () => {
    for (const lab of Object.keys(defaults) as LabId[]) {
      const m = getModel(lab, defaults[lab]);
      expect(
        m.measurements.every((item) => ["cm", "°", ""].includes(item.unit)),
      ).toBe(true);
      expect(m.description).toContain("10 cm");
    }
  });
});
