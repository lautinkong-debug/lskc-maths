import { describe, expect, it } from "vitest";
import type { LabId } from "./content";
import {
  CENTRE,
  defaults,
  distance,
  getScene,
  type Parameters,
} from "./geometry";
import {
  getAngleLayout,
  getDiagramBlockers,
  getMeasurementLayout,
  getPointLabelOffset,
  type LayoutBox,
} from "./diagramLayout";

function overlaps(a: LayoutBox, b: LayoutBox) {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2
  );
}

function angleCollisions(lab: LabId, parameters: Parameters, missionIndex = 2) {
  const scene = getScene(lab, parameters);
  const angles = scene.angles.map((angle) => ({
    ...getAngleLayout(scene, angle).label,
    width: 84,
    height: 30,
  }));
  return getMeasurementLayout(lab, parameters, missionIndex)
    .filter((measurement) =>
      angles.some((angle) => overlaps(measurement.box, angle)),
    )
    .map((measurement) => measurement.name);
}

describe("construction label layout", () => {
  it("connects displaced angle values to their own angle arc instead of an old text position", () => {
    const scene = getScene("ratios", {
      ...defaults.ratios,
      primary: 70,
      secondary: 70,
      rotation2: 180,
    });
    const first = getAngleLayout(scene, scene.angles[0]);
    const second = getAngleLayout(scene, scene.angles[1]);
    expect(second.leader).toBeDefined();
    expect(distance(second.leader!, scene.points.O)).toBeCloseTo(
      second.radius,
      10,
    );
    expect(second.leader!.x).toBeCloseTo(280, 10);
    expect(second.leader!.y).toBeCloseTo(178, 10);
    expect(
      overlaps(
        { ...first.label, width: 84, height: 30 },
        { ...second.label, width: 84, height: 30 },
      ),
    ).toBe(false);
    expect(first.value).toBeCloseTo(70, 10);
    expect(second.value).toBeCloseTo(70, 10);
  });

  it("keeps the 18.5 cm chord badge clear of its displaced 135 degree label", () => {
    const parameters = { ...defaults.ratios, primary: 135 };
    const scene = getScene("ratios", parameters);
    const angle = getAngleLayout(scene, scene.angles[0]);
    const chord = getMeasurementLayout("ratios", parameters).find(
      (measurement) => measurement.name === "AB",
    )!;
    expect(angle.value).toBeCloseTo(135, 10);
    expect(chord.label).toBe("AB = 18.5 cm");
    // The old blocker used radius 59 even though rendering moved the text past 86.
    expect(distance(CENTRE, angle.label)).toBeGreaterThan(86);
    expect(overlaps(chord.box, { ...angle.label, width: 84, height: 30 })).toBe(
      false,
    );
    expect(angleCollisions("ratios", parameters)).toEqual([]);
  });

  it("reserves the moved right-angle text and the M/N name locations", () => {
    for (const rotation of [0, 38, 91, 180, 279]) {
      const scene = getScene("bisector", {
        ...defaults.bisector,
        secondary: 0,
        rotation,
      });
      const layout = getAngleLayout(scene, scene.angles[0]);
      expect(layout.right).toBe(true);
      expect(distance(scene.points.N, layout.label)).toBeGreaterThan(63);
      const offset = getPointLabelOffset(scene, scene.points.N);
      expect(
        offset.x * (layout.label.x - scene.points.N.x) +
          offset.y * (layout.label.y - scene.points.N.y),
      ).toBeLessThan(0);
      expect(getDiagramBlockers(scene)).toContainEqual({
        x: scene.points.N.x + offset.x,
        y: scene.points.N.y + offset.y,
        width: 24,
        height: 26,
      });
      expect(getDiagramBlockers(scene)).toContainEqual({
        ...layout.label,
        width: 84,
        height: 30,
      });
    }
  });

  it("finds clear space when short rotated chords exhaust nearby label positions", () => {
    const parameters = {
      ...defaults.ratios,
      primary: 30,
      secondary: 40,
      rotation: 37,
      rotation2: 92,
    };
    const occupied = getDiagramBlockers(getScene("ratios", parameters));
    for (const { box, name } of getMeasurementLayout("ratios", parameters)) {
      expect(
        occupied.some((other) => overlaps(box, other)),
        name,
      ).toBe(false);
      if (name.startsWith("Arc "))
        expect(box.height).toBeGreaterThanOrEqual(30);
      occupied.push(box);
    }
  });

  it("keeps lengths clear of angle text in slanted, reflex and circumference ratio cases", () => {
    const failures: string[] = [];
    for (const primary of [30, 90, 135, 165, 225, 315])
      for (const secondary of [40, 90, 135, 220, 300])
        for (const rotation of [0, 37, 90, 173, 270])
          for (const alternate of [false, true]) {
            const parameters = {
              ...defaults.ratios,
              primary,
              secondary,
              rotation,
              rotation2: rotation + 55,
              alternate,
            };
            const collisions = angleCollisions("ratios", parameters);
            if (collisions.length)
              failures.push(
                `${primary}/${secondary}, ${rotation}°, ${alternate}: ${collisions}`,
              );
          }
    expect(failures).toEqual([]);
  });

  it("checks other construction layouts and keeps measurement cards within the SVG", () => {
    const failures: string[] = [];
    for (const lab of Object.keys(defaults) as LabId[])
      for (const rotation of [0, 35, 90, 145, 225, 315])
        for (const alternate of [false, true]) {
          const parameters = {
            ...defaults[lab],
            rotation,
            rotation2: rotation + 35,
            alternate,
          };
          const collisions = angleCollisions(lab, parameters);
          if (collisions.length)
            failures.push(`${lab}, ${rotation}°, ${alternate}: ${collisions}`);
          for (const { box } of getMeasurementLayout(lab, parameters, 2)) {
            expect(box.x - box.width / 2).toBeGreaterThanOrEqual(85.99);
            expect(box.x + box.width / 2).toBeLessThanOrEqual(474.01);
            expect(box.y - box.height / 2).toBeGreaterThan(0);
            expect(box.y + box.height / 2).toBeLessThan(440);
          }
        }
    expect(failures).toEqual([]);
  });

  it.each(Object.keys(defaults) as LabId[])(
    "%s separates names and angle values at short, major and coincident configurations",
    (lab) => {
      const failures: string[] = [];
      for (const fraction of [0, 0.1, 0.5, 0.9, 1])
        for (const rotation of [0, 37, 90, 180, 270])
          for (const alternate of [false, true]) {
            const parameters = {
              ...defaults[lab],
              primary: ["bisector", "chords"].includes(lab)
                ? -9.8 + 19.6 * fraction
                : 20 + 320 * fraction,
              secondary: lab === "chords" ? 5 : 5 + 90 * fraction,
              tertiary: 95 - 90 * fraction,
              rotation,
              rotation2: rotation + 180,
              alternate,
            };
            const scene = getScene(lab, parameters);
            const before = JSON.stringify(scene);
            const boxes = Object.values(scene.points).map((point) => {
              const offset = getPointLabelOffset(scene, point);
              return {
                x: point.x + offset.x,
                y: point.y + offset.y,
                width: 24,
                height: 26,
              };
            });
            boxes.push(
              ...scene.angles.map((angle) => ({
                ...getAngleLayout(scene, angle).label,
                width: 84,
                height: 30,
              })),
            );
            for (let i = 0; i < boxes.length; i++)
              for (let j = i + 1; j < boxes.length; j++)
                if (overlaps(boxes[i], boxes[j]))
                  failures.push(
                    `${fraction}/${rotation}/${alternate}: ${i}/${j}`,
                  );
            expect(JSON.stringify(scene)).toBe(before);
            for (const box of boxes) {
              expect(Number.isFinite(box.x) && Number.isFinite(box.y)).toBe(
                true,
              );
              expect(box.x - box.width / 2).toBeGreaterThanOrEqual(81.99);
              expect(box.x + box.width / 2).toBeLessThanOrEqual(478.01);
              expect(box.y - box.height / 2).toBeGreaterThanOrEqual(21.99);
              expect(box.y + box.height / 2).toBeLessThanOrEqual(418.01);
            }
          }
      expect(failures).toEqual([]);
    },
  );
});
