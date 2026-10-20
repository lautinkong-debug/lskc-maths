import { describe, expect, it } from "vitest";
import {
  placeAngleLabels,
  type AngleLabelPlacement,
  type AngleLabelRequest,
} from "../../src/apps/similarity/angleLabels";
import { questions } from "../../src/apps/similarity/data";
import { modelPoints, shapePoints } from "../../src/apps/similarity/geometry";
import {
  edgeCrossesLabel,
  placeVertexLabels,
  type LabelBox,
} from "../../src/apps/similarity/vertexLabels";
import type { Point } from "../../src/apps/similarity/types";

const overlaps = (a: LabelBox, b: LabelBox) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

function requests(points: Point[], rightIndex = -1): AngleLabelRequest[] {
  return points.map((vertex, index) => ({
    key: `angle-${index}`,
    text: index === rightIndex ? "90°" : ["α", "β", "γ", "δ"][index],
    vertex,
    first: points[(index + points.length - 1) % points.length],
    last: points[(index + 1) % points.length],
    arcCount: (index % 3) + 1,
    right: index === rightIndex,
  }));
}

function checkClear(
  placements: Map<string, AngleLabelPlacement>,
  points: Point[],
  size = 1,
  reserved: LabelBox[] = [],
) {
  const labels = [...placements.values()];
  for (const [index, label] of labels.entries()) {
    expect(label.width).toBeGreaterThan(0);
    expect(label.height).toBeGreaterThan(0);
    expect(label.fontSize).toBe(17 * size);
    expect(label.radius).toBeGreaterThan(0);
    expect(label.arcGap).toBeGreaterThan(0);
    for (const value of [
      label.x,
      label.y,
      label.textX,
      label.textY,
      label.radius,
      label.arcGap,
    ])
      expect(Number.isFinite(value)).toBe(true);
    for (const other of labels.slice(index + 1))
      expect(overlaps(label, other), `${label.key} overlaps ${other.key}`).toBe(
        false,
      );
    for (const point of points) {
      expect(
        overlaps(label, {
          x: point.x - 9 * size,
          y: point.y - 9 * size,
          width: 18 * size,
          height: 18 * size,
        }),
        `${label.key} covers vertex ${point.label}`,
      ).toBe(false);
    }
    for (const box of reserved)
      expect(
        overlaps(label, box),
        `${label.key} covers a reserved vertex label`,
      ).toBe(false);
    for (let i = 0; i < points.length; i++)
      expect(
        edgeCrossesLabel(points[i], points[(i + 1) % points.length], label),
        `${label.key} crosses edge ${i}`,
      ).toBe(false);
    if (label.leader) {
      expect(
        Math.hypot(
          label.leader.from.x - label.leader.to.x,
          label.leader.from.y - label.leader.to.y,
        ),
      ).toBeGreaterThan(0);
      const end = label.leader.to;
      expect(end.x).toBeGreaterThanOrEqual(label.x - 1e-7);
      expect(end.x).toBeLessThanOrEqual(label.x + label.width + 1e-7);
      expect(end.y).toBeGreaterThanOrEqual(label.y - 1e-7);
      expect(end.y).toBeLessThanOrEqual(label.y + label.height + 1e-7);
    }
  }
}

function moved(points: Point[], angle: number, scale: number, flip: number) {
  const radians = (angle * Math.PI) / 180;
  return points.map((point) => ({
    label: point.label,
    x:
      270 +
      scale *
        (point.x * flip * Math.cos(radians) - point.y * Math.sin(radians)),
    y:
      190 +
      scale *
        (point.x * flip * Math.sin(radians) + point.y * Math.cos(radians)),
  }));
}

describe("Readable similarity angle labels", () => {
  const triangle: Point[] = [
    { label: "A", x: 0, y: 0 },
    { label: "B", x: 140, y: 0 },
    { label: "C", x: 35, y: 100 },
  ];

  it("keeps labels apart through translation, rotation, reflection and resizing", () => {
    for (const scale of [0.12, 0.25, 0.5, 1, 2])
      for (const angle of [0, 27, 90, 173, 270])
        for (const flip of [-1, 1]) {
          const points = moved(triangle, angle, scale, flip);
          const before = structuredClone(points);
          const labels = placeAngleLabels(requests(points), {
            vertices: points,
            polygons: [points],
          });
          expect(labels.size).toBe(3);
          checkClear(labels, points);
          expect(points).toEqual(before);
        }
  });

  it("uses outside leader labels rather than shrinking text on a tiny triangle", () => {
    const points = moved(triangle, 0, 0.1, 1);
    const labels = placeAngleLabels(requests(points), {
      vertices: points,
      polygons: [points],
    });
    expect([...labels.values()].every((label) => label.leader)).toBe(true);
    checkClear(labels, points);
    for (const [index, label] of [...labels.values()].entries()) {
      const shortest = Math.min(
        Math.hypot(
          points[(index + 1) % 3].x - points[index].x,
          points[(index + 1) % 3].y - points[index].y,
        ),
        Math.hypot(
          points[(index + 2) % 3].x - points[index].x,
          points[(index + 2) % 3].y - points[index].y,
        ),
      );
      expect(label.radius + index * label.arcGap).toBeLessThanOrEqual(
        shortest * 0.23 + 1e-7,
      );
    }
  });

  it("keeps ordinary roomy triangles' labels inside without leader lines", () => {
    const points = moved(triangle, 0, 3, 1);
    const labels = placeAngleLabels(requests(points), {
      vertices: points,
      polygons: [points],
    });
    expect([...labels.values()].every((label) => !label.leader)).toBe(true);
    checkClear(labels, points);
  });

  it("reserves enough width for upright 90° text and actual vertex label boxes", () => {
    const source: Point[] = [
      { label: "A", x: 0, y: 0 },
      { label: "B", x: 60, y: 0 },
      { label: "C", x: 0, y: 42 },
    ];
    for (const angle of [0, 45, 90, 181])
      for (const scale of [0.3, 1, 2]) {
        const points = moved(source, angle, scale, -1);
        const reserved = [
          ...placeVertexLabels(
            points.map((point) => ({
              key: point.label,
              point,
              text: point.label,
              fontSize: 30,
            })),
            [points],
          ).values(),
        ];
        const labels = placeAngleLabels(requests(points, 0), {
          vertices: points,
          polygons: [points],
          reserved,
        });
        expect(labels.get("angle-0")!.width).toBeGreaterThan(
          labels.get("angle-1")!.width,
        );
        checkClear(labels, points, 1, reserved);
      }
  });

  it("clears all three labels in Q17's actual small CAB triangle at source and copy scales", () => {
    const question = questions.find((question) => question.id === "ex8c-17")!;
    const source = modelPoints(question);
    const span = Math.max(
      Math.max(...source.map((p) => p.x)) - Math.min(...source.map((p) => p.x)),
      Math.max(...source.map((p) => p.y)) - Math.min(...source.map((p) => p.y)),
    );
    const size = (span + 44) / 384;
    for (const shape of question.shapes) {
      const points = shapePoints(shape, source);
      for (const markSize of [size, 1])
        for (const scale of [0.5, 1, 1.5]) {
          const placed = moved(points, 37, scale, -1);
          const labels = placeAngleLabels(requests(placed), {
            size: markSize,
            vertices: placed,
            polygons: [placed],
          });
          expect(labels.size).toBe(3);
          checkClear(labels, placed, markSize);
        }
    }
  });

  it("clears Q17's actual composite vertex names, including B beside the tiny triangle", () => {
    const question = questions.find((question) => question.id === "ex8c-17")!;
    for (const angle of [0, 37, 90, 173])
      for (const flip of [-1, 1]) {
        const source = moved(modelPoints(question), angle, 1, flip);
        const polygons = question.shapes.map((shape) =>
          shapePoints(shape, source),
        );
        const reserved = [
          ...placeVertexLabels(
            source.map((point) => ({
              key: point.label,
              point,
              text: point.label,
              fontSize: 20,
            })),
            polygons,
          ).values(),
        ];
        for (const points of polygons) {
          const labels = placeAngleLabels(requests(points), {
            size: 0.715136,
            vertices: points,
            polygons: [points],
            reserved,
          });
          checkClear(labels, points, 0.715136, reserved);
          for (const label of labels.values())
            if (label.leader)
              for (const box of reserved)
                expect(
                  edgeCrossesLabel(
                    { ...label.leader.from, label: "" },
                    { ...label.leader.to, label: "" },
                    box,
                  ),
                  `${label.key}'s leader crosses a vertex name`,
                ).toBe(false);
        }
      }
  });

  it("preserves mark identity when an angle is hidden and is deterministic", () => {
    const all = requests(triangle);
    const labels = placeAngleLabels(all);
    expect([...labels.keys()]).toEqual(["angle-0", "angle-1", "angle-2"]);
    expect(placeAngleLabels(all)).toEqual(labels);
    const hidden = placeAngleLabels(
      all.filter((request) => request.key !== "angle-1"),
    );
    expect([...hidden.keys()]).toEqual(["angle-0", "angle-2"]);
    expect(hidden.get("angle-0")!.radius).toBe(labels.get("angle-0")!.radius);
    expect(hidden.get("angle-2")!.arcGap).toBe(labels.get("angle-2")!.arcGap);
    checkClear(hidden, triangle);
  });

  it("returns no mark for empty input or an angle with a zero-length ray", () => {
    expect(placeAngleLabels([]).size).toBe(0);
    expect(
      placeAngleLabels([
        {
          key: "degenerate",
          text: "α",
          vertex: triangle[0],
          first: triangle[0],
          last: triangle[2],
        },
      ]).size,
    ).toBe(0);
  });
});
