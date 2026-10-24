import { describe, expect, it } from "vitest";
import {
  boundaryEdges,
  geometryMetrics,
  unfoldBoundary,
} from "@/apps/surface-area/geometry";
import type { PrismGeometry } from "@/apps/surface-area/types";
import { questions, resolvePreset } from "@/apps/surface-area/bank";
import {
  boundaries,
  edgeScale,
  faces,
  hasUnknowns,
  teachingLines,
  givenFacts,
} from "@/apps/surface-area/geometry";

it("keeps givens available and does not build incomplete symbolic sums", () => {
  expect(givenFacts(resolvePreset("#ex9b-16").variant).join(" ")).toContain(
    "3.9 cm²",
  );
  expect(givenFacts(resolvePreset("#ex9b-31").variant).join(" ")).toContain(
    "15 cm by 8 cm by 3 cm",
  );
  for (const id of ["ex9b-17", "ex9b-18", "ex9b-26"]) {
    const lines = teachingLines(resolvePreset(`#${id}`).variant, 1).join(" ");
    expect(lines).not.toMatch(/\+\s*\+/);
  }
  expect(teachingLines(resolvePreset("#ex9b-27").variant, 1)).toEqual([
    "Retained widths = 50 cm",
  ]);
});

const square = (size: number, offset = 0) => ({
  points: [
    { x: offset, y: offset },
    { x: offset + size, y: offset },
    { x: offset + size, y: offset + size },
    { x: offset, y: offset + size },
  ],
});
describe("general surface geometry", () => {
  it("includes inner boundary walls and subtracts the hole from both bases", () => {
    const g: PrismGeometry = {
      kind: "prism",
      outer: square(10),
      holes: [square(6, 2)],
      height: 2,
      baseArea: 64,
      baseCount: 2,
    };
    expect(geometryMetrics(g)).toMatchObject({
      perimeter: 64,
      lateralArea: 128,
      totalArea: 256,
      geometricBaseArea: 64,
    });
  });
  it("omits the actual missing lateral face, not a base", () => {
    const g: PrismGeometry = {
      kind: "prism",
      outer: square(4),
      height: 8,
      baseArea: 16,
      baseCount: 2,
      omittedEdges: [1],
    };
    expect(geometryMetrics(g)).toMatchObject({
      perimeter: 16,
      includedPerimeter: 12,
      lateralArea: 96,
      totalArea: 128,
    });
  });
  it("counts the bottom and submerged walls without the free water surface", () => {
    const g: PrismGeometry = {
      kind: "prism",
      outer: {
        points: [
          { x: 0, y: 0 },
          { x: 25, y: 0 },
          { x: 25, y: 15 },
          { x: 0, y: 15 },
        ],
      },
      height: 7.8,
      baseArea: 375,
      baseCount: 1,
    };
    expect(geometryMetrics(g).totalArea).toBe(999);
  });
  it("keeps every concave boundary edge rigid throughout unfolding", () => {
    const b = {
      points: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
        { x: 7, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 5 },
        { x: 0, y: 5 },
      ],
    };
    const lengths = boundaryEdges(b);
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const points = unfoldBoundary(b, t);
      lengths.forEach((l, i) =>
        expect(
          Math.hypot(
            points[i + 1].x - points[i].x,
            points[i + 1].y - points[i].y,
          ),
        ).toBeCloseTo(l, 9),
      );
      if (t === 0)
        expect(Math.hypot(points.at(-1)!.x, points.at(-1)!.y)).toBeLessThan(
          1e-9,
        );
      if (t === 1) expect(points.at(-1)).toEqual({ x: 24, y: 0 });
    }
  });
  it("subtracts both copies of each cube contact patch", () => {
    expect(
      geometryMetrics({
        kind: "cubes",
        cubes: [
          { side: 5, origin: [0, 0, 0] },
          { side: 4, origin: [0, 0, 5] },
          { side: 3, origin: [0, 0, 9] },
        ],
        contacts: [
          { cubes: [0, 1], area: 16 },
          { cubes: [1, 2], area: 9 },
        ],
      }).totalArea,
    ).toBe(250);
  });
});

describe("chapter coverage and independently checked source metrics", () => {
  const required = [
    "activity-9-3",
    "example-9-11",
    "example-9-12",
    "example-9-13",
    "summary-2",
    "exam-sample",
    ...[11, 12, 13].map((n) => `qp-9-${n}`),
    ...[1, 2, 3].map((n) => `consolidation-${n}`),
    ...[
      1, 2, 3, 4, 5, 6, 8, 11, 12, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 31, 35,
    ].map((n) => `ex9b-${n}`),
    ...[5, 6, 8].map((n) => `check-${n}`),
    ...[10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 29, 30, 31, 33].map(
      (n) => `revision-${n}`,
    ),
    ...[7, 8, 11].map((n) => `mc-${n}`),
    ...[2, 3, 7].map((n) => `exam-${n}`),
    "public-2",
  ];
  it("contains every audited entry once, with stable direct links", () => {
    expect(questions.map((q) => q.id).sort()).toEqual(required.sort());
    expect(questions).toHaveLength(60);
    expect(questions.flatMap((q) => q.variants)).toHaveLength(69);
    for (const q of questions)
      for (const v of q.variants)
        expect(resolvePreset(`${q.id}/${v.id}`)).toEqual({
          question: q,
          variant: v,
        });
  });
  for (const q of questions)
    for (const v of q.variants) {
      it(`${q.id}/${v.id}: checked geometry and answer values`, () => {
        const m = geometryMetrics(v.geometry);
        expect(m.totalArea).toBeCloseTo(v.expected.surfaceArea, 7);
        if (v.expected.perimeter !== undefined)
          expect(m.perimeter).toBeCloseTo(v.expected.perimeter, 7);
        if (v.expected.lateralArea !== undefined)
          expect(m.lateralArea).toBeCloseTo(v.expected.lateralArea, 7);
        expect(v.working.length).toBeGreaterThan(0);
        expect(v.answer.length).toBeGreaterThan(0);
        expect(teachingLines(v, 0)).toEqual([]);
        const g = v.geometry;
        if (g.kind === "prism") {
          expect(g.height).toBeGreaterThan(0);
          if (!g.areaIsGiven && !g.schematic)
            expect(m.geometricBaseArea).toBeCloseTo(g.baseArea, 7);
          for (const b of boundaries(g))
            for (const t of [0, 0.25, 0.5, 0.75, 1]) {
              const unfolded = unfoldBoundary(b, t, edgeScale(g));
              boundaryEdges(b).forEach((edge, i) =>
                expect(
                  Math.hypot(
                    unfolded[i + 1].x - unfolded[i].x,
                    unfolded[i + 1].y - unfolded[i].y,
                  ),
                ).toBeCloseTo(edge * edgeScale(g), 7),
              );
            }
          if (hasUnknowns(v))
            expect(
              faces(v, false).some((f) =>
                /[a-z]/i.test(f.label.replace(/\b(cm|mm|m)\b/g, "")),
              ) || Boolean(g.heightLabel),
            ).toBe(true);
        }
      });
    }
  it("includes every positive integer cuboid solution in Q18", () => {
    const solutions: number[][] = [];
    for (let x = 1; x < 36; x++)
      for (let y = 1; y < 36; y++)
        for (let z = 1; z < 36; z++)
          if (x * y + x * z + y * z === 36) solutions.push([x, y, z]);
    expect(solutions).toHaveLength(
      questions.find((q) => q.id === "ex9b-18")!.variants.length,
    );
  });
});
