import { describe, expect, it } from "vitest";
import {
  q19Points,
  shapePoints,
  distance,
  transform,
  identityPose,
  comparisonPoses,
  boardShapes,
  signedArea,
  snapPose,
  modelPoints,
  overlappingShapeGroups,
} from "../../src/apps/similarity/geometry";
import { questions } from "../../src/apps/similarity/data";
import { poseFromVertex, fitPose } from "../../src/apps/similarity/geometry";
import { conditions, reasonPairs } from "../../src/apps/similarity/reasons";
import { pairedSideLabels } from "../../src/apps/similarity/pairedSides";

describe("Similarity studio", () => {
  const q19 = questions.find((q) => q.id === "ex8c-19")!;
  it("uses only establishing conditions for AAA, SSS and SAS, and both requirements for squares", () => {
    for (const [id, angles, sides] of [
      ["ex8c-19", 3, 0],
      ["qp8-6", 0, 3],
      ["qp8-8", 1, 2],
      ["ex8d-17", 4, 4],
      ["ex8d-20", 0, 2],
    ] as const) {
      const question = questions.find((q) => q.id === id)!;
      const pair = reasonPairs(question)[0];
      const rows = conditions(question, pair, "proof");
      expect(
        rows.filter((r) => r.kind === "angle"),
        id,
      ).toHaveLength(angles);
      expect(
        rows.filter((r) => r.kind === "side"),
        id,
      ).toHaveLength(sides);
      expect(
        rows.some((r) => r.consequence),
        id,
      ).toBe(false);
      if (pair.criterion === "SAS") {
        const angle = rows.find((r) => r.kind === "angle")!;
        for (const side of rows.filter((r) => r.kind === "side"))
          expect(side.edge, id).toContain(angle.index);
      }
    }
  });
  it("keeps paired side values and ratios tied to the source when the drawing is enlarged", () => {
    const sets = boardShapes(q19.shapes, q19Points());
    const poses = comparisonPoses(sets, true),
      pair = reasonPairs(q19)[0];
    const rows = conditions(q19, pair, "both");
    for (const magnification of [1, 2.5]) {
      const shapes = sets.map((ps, id) => ({
        id,
        colour: "navy",
        points: transform(ps, {
          ...poses[id],
          scale: poses[id].scale * magnification,
        }),
      }));
      const labels = pairedSideLabels(shapes, [[0, 1]], pair, rows);
      expect(labels.map((l) => l.text)).toEqual([
        "AF ↔ AB",
        "FE = 2 ↔ BC = 3",
        "EA = 3 ↔ CA = 4.5",
      ]);
      expect(labels.map((l) => l.ratio)).toEqual(["2:3", "2:3", "2:3"]);
      expect(pairedSideLabels(shapes, [], pair, rows)).toEqual([]);
      expect(
        pairedSideLabels(
          shapes,
          [[0, 1]],
          pair,
          rows.filter((r) => r.id !== "side-1"),
        ),
      ).toHaveLength(2);
      expect(
        pairedSideLabels(
          shapes,
          [[0, 1]],
          { ...pair, ratio: undefined },
          rows,
        )[0].ratio,
      ).toBe("k:1");
      expect(
        pairedSideLabels(shapes, [[0, 1]], { ...pair, ratio: "4" }, rows)[0]
          .ratio,
      ).toBe("4:1");
      const partial = {
        ...pair,
        lengths: [
          ["", "2", "3"],
          ["", "", "4.5"],
        ] as [string[], string[]],
      };
      expect(
        pairedSideLabels(
          shapes,
          [[0, 1]],
          partial,
          conditions(q19, partial, "both"),
        )[1].text,
      ).toBe("FE = 2 ↔ BC");
    }
  });
  it("pairs only fully overlapping documented correspondences and restores individual names after separation", () => {
    const pairs = reasonPairs(q19);
    const sets = boardShapes(q19.shapes, q19Points());
    const poses = comparisonPoses(sets, true);
    const placed = sets.map((points, id) => ({
      id,
      points: transform(points, poses[id]),
    }));
    expect(overlappingShapeGroups(placed, pairs)).toEqual([[0, 1]]);
    expect(overlappingShapeGroups([...placed].reverse(), pairs)).toEqual([
      [0, 1],
    ]);
    expect(
      placed[0].points.map(
        (p, i) => `${p.label} ↔ ${placed[1].points[i].label}`,
      ),
    ).toEqual(["A ↔ A", "F ↔ B", "E ↔ C"]);
    expect(overlappingShapeGroups(placed, [])).toEqual([]);
    expect(
      overlappingShapeGroups(placed, [
        { ...pairs[0], criterion: "not-similar" },
      ]),
    ).toEqual([]);
    expect(overlappingShapeGroups(placed.slice(0, 1), pairs)).toEqual([]);
    for (const patch of [
      { x: poses[0].x + 1 },
      { angle: poses[0].angle + 30 },
      { scale: poses[0].scale * 1.5 },
      { flipX: -poses[0].flipX },
    ]) {
      expect(
        overlappingShapeGroups(
          [
            { id: 0, points: transform(sets[0], { ...poses[0], ...patch }) },
            placed[1],
          ],
          pairs,
        ),
      ).toEqual([]);
    }
    // The original triangles share A but their other vertices do not coincide.
    expect(
      overlappingShapeGroups(
        q19.shapes.map((s, id) => ({
          id,
          points: shapePoints(s, q19Points()),
        })),
        pairs,
      ),
    ).toEqual([]);
    // Three aligned copies use one label per vertex, never duplicate paired overlays.
    const third = { ...placed[1], id: 2 };
    expect(
      overlappingShapeGroups(
        [...placed, third],
        [...pairs, { shapes: [1, 2], criterion: "AAA" }],
      ),
    ).toEqual([[0, 1, 2]]);
  });
  it("vertex dragging rotates and uniformly scales reflected shapes about a fixed centre", () => {
    const ps = shapePoints(q19.shapes[0], q19Points());
    for (const flipX of [-1, 1])
      for (const flipY of [-1, 1]) {
        const startPose = {
          ...identityPose,
          x: 300,
          y: 240,
          angle: 170,
          scale: 0.8,
          flipX,
          flipY,
        };
        const start = transform(ps, startPose)[0];
        const angle = (35 * Math.PI) / 180;
        const x = start.x - startPose.x,
          y = start.y - startPose.y;
        const end = {
          x: startPose.x + 1.4 * (x * Math.cos(angle) - y * Math.sin(angle)),
          y: startPose.y + 1.4 * (x * Math.sin(angle) + y * Math.cos(angle)),
        };
        const next = poseFromVertex(startPose, start, end);
        expect(next.x).toBe(startPose.x);
        expect(next.y).toBe(startPose.y);
        expect(next.angle).toBeCloseTo(205);
        expect(next.scale).toBeCloseTo(1.12);
        expect(
          distance(transform(ps, next)[0], { ...end, label: "" }),
        ).toBeCloseTo(0);
        const moved = transform(ps, next);
        ps.forEach((p, i) =>
          expect(
            distance(moved[i], moved[(i + 1) % 3]) /
              distance(p, ps[(i + 1) % 3]),
          ).toBeCloseTo(next.scale),
        );
        expect(poseFromVertex(startPose, start, end, "rotate").scale).toBe(
          startPose.scale,
        );
        expect(poseFromVertex(startPose, start, end, "resize").angle).toBe(
          startPose.angle,
        );
        expect(poseFromVertex(startPose, start, startPose)).toEqual(startPose);
        const fitted = fitPose(
          ps,
          { ...next, scale: 10 },
          { x: 0, y: 0, width: 840, height: 470 },
        );
        transform(ps, fitted).forEach((p) => {
          expect(p.x).toBeGreaterThanOrEqual(17.999);
          expect(p.x).toBeLessThanOrEqual(822.001);
          expect(p.y).toBeGreaterThanOrEqual(17.999);
          expect(p.y).toBeLessThanOrEqual(452.001);
        });
      }
  });
  it("uses the source proof and correct side ratios, including the SAS included angle", () => {
    for (const q of questions)
      for (const pair of reasonPairs(q)) {
        const [a, b] = pair.shapes.map((i) => q.shapes[i]);
        expect(a.vertices.length, q.id).toBe(b.vertices.length);
        const rows = conditions(q, pair, "proof");
        if (pair.criterion === "AAA")
          expect(
            rows.map((r) => r.kind),
            q.id,
          ).toEqual(["angle", "angle", "angle"]);
        if (pair.criterion === "SSS" || pair.criterion === "SAS") {
          const numericRatio = pair
            .ratio!.split("/")
            .map(Number)
            .reduce((a, b) => a / b);
          const sides = rows.filter((r) => r.kind === "side");
          expect(sides.length, q.id).toBe(pair.criterion === "SSS" ? 3 : 2);
          for (const row of sides) {
            expect(
              Number(row.values![0]) / Number(row.values![1]),
              q.id,
            ).toBeCloseTo(numericRatio);
            if (pair.criterion === "SAS")
              expect(row.edge, q.id).toContain(pair.included);
          }
          if (pair.criterion === "SAS")
            expect(
              rows.filter((r) => r.kind === "angle").map((r) => r.index),
              q.id,
            ).toEqual([pair.included]);
        }
        if (q.similar === false)
          expect(pair.criterion, q.id).toBe("not-similar");
      }
    expect(
      reasonPairs(questions.find((q) => q.id === "qp8-3")!)[0].criterion,
    ).toBe("given");
    expect(reasonPairs(q19)[0].criterion).toBe("AAA");
    expect(
      reasonPairs(questions.find((q) => q.id === "qp8-6")!)[0].shapes,
    ).toEqual([0, 1]);
  });
  it("uses exact Q19 lengths and a perpendicular rectangle with area 13.5 cm²", () => {
    const ps = q19Points();
    const p = (name: string) => ps.find((p) => p.label === name)!;
    expect(distance(p("A"), p("E")) / 60).toBeCloseTo(3);
    expect(distance(p("E"), p("F")) / 60).toBeCloseTo(2);
    expect(distance(p("B"), p("C")) / 60).toBeCloseTo(3);
    expect(distance(p("C"), p("D")) / 60).toBeCloseTo(3);
    expect(distance(p("A"), p("C")) / 60).toBeCloseTo(4.5);
    expect(
      (p("C").x - p("A").x) * (p("E").x - p("A").x) +
        (p("C").y - p("A").y) * (p("E").y - p("A").y),
    ).toBeCloseTo(0);
    expect(
      Math.abs(
        signedArea(
          shapePoints(
            { name: "rectangle", vertices: ["A", "C", "D", "E"] },
            ps,
          ),
        ),
      ) / 3600,
    ).toBeCloseTo(13.5);
  });
  it("matches all Q19 angles and sides while distinguishing proof from consequences", () => {
    const pair = reasonPairs(q19)[0];
    const rows = conditions(q19, pair, "both");
    expect(rows).toHaveLength(6);
    expect(rows.filter((r) => r.degrees === 90).map((r) => r.index)).toEqual([
      1,
    ]);
    expect(
      rows.find((r) => r.index === 0 && r.kind === "angle")?.degrees,
    ).toBeUndefined();
    expect(rows.filter((r) => r.kind === "side").map((r) => r.text)).toEqual([
      "AF/AB = 2/3",
      "FE/BC = 2/3",
      "EA/CA = 3/4.5 = 2/3",
    ]);
    expect(conditions(q19, pair, "sides").every((r) => r.consequence)).toBe(
      true,
    );
    expect(
      conditions(q19, pair, "proof").every(
        (r) => r.kind === "angle" && !r.consequence,
      ),
    ).toBe(true);
  });
  it("provides matching marks only for documented pairs and keeps counterexamples unequal", () => {
    for (const q of questions)
      for (const pair of reasonPairs(q)) {
        const rows = conditions(q, pair, "both"),
          n = q.shapes[pair.shapes[0]].vertices.length;
        if (pair.criterion === "not-similar") {
          expect(rows.filter((r) => r.kind === "angle")).toHaveLength(n);
          const ratios = rows
            .filter((r) => r.kind === "side")
            .map((r) => Number(r.values![0]) / Number(r.values![1]));
          expect(ratios[0]).not.toBeCloseTo(ratios[1]);
        } else {
          expect(
            rows.filter((r) => r.kind === "angle"),
            q.id,
          ).toHaveLength(n);
          expect(
            rows.filter((r) => r.kind === "side"),
            q.id,
          ).toHaveLength(n);
        }
        for (const row of rows) {
          expect(row.index, q.id).toBeLessThan(n);
          if (row.degrees !== undefined)
            expect(row.degrees, q.id).toBeGreaterThan(0);
        }
      }
  });
  it("preserves every length and label under rotations/reflections and changes lengths only by uniform scale", () => {
    const ps = shapePoints(q19.shapes[0], q19Points());
    for (const angle of [-270, -15, 0, 90, 157])
      for (const flipX of [-1, 1])
        for (const flipY of [-1, 1])
          for (const scale of [0.5, 1, 1.5]) {
            const next = transform(ps, {
              ...identityPose,
              angle,
              flipX,
              flipY,
              scale,
              x: 123,
              y: 98,
            });
            expect(next.map((p) => p.label)).toEqual(ps.map((p) => p.label));
            ps.forEach((p, i) =>
              expect(distance(next[i], next[(i + 1) % 3])).toBeCloseTo(
                distance(p, ps[(i + 1) % 3]) * scale,
              ),
            );
          }
  });
  it("aligns Q19 by 90 degrees and an explicit 1.5 enlargement", () => {
    const sets = boardShapes(q19.shapes, q19Points());
    const oriented = comparisonPoses(sets);
    expect(oriented[0].angle).toBeCloseTo(90);
    expect(oriented[0].scale).toBe(1);
    const poses = comparisonPoses(sets, true);
    expect(poses[0].scale).toBeCloseTo(1.5);
    const a = transform(sets[0], poses[0]),
      b = transform(sets[1], poses[1]);
    a.forEach((p, i) => expect(distance(p, b[i])).toBeCloseTo(0));
  });
  it("contains valid question identities, crops and shape references", () => {
    expect(questions).toHaveLength(72);
    expect(
      Object.fromEntries(
        [
          "Quick Practice",
          "Exercise 8A",
          "Exercise 8B",
          "Exercise 8C",
          "Exercise 8D",
          "Revision Exercise 8",
        ].map((g) => [g, questions.filter((q) => q.group === g).length]),
      ),
    ).toEqual({
      "Quick Practice": 14,
      "Exercise 8A": 11,
      "Exercise 8B": 11,
      "Exercise 8C": 10,
      "Exercise 8D": 10,
      "Revision Exercise 8": 16,
    });
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.shapes.length, q.id).toBeGreaterThanOrEqual(2);
      expect(reasonPairs(q).length, q.id).toBeGreaterThan(0);
      expect(q.proof.length, q.id).toBeGreaterThan(0);
      expect(q.crop[2], q.id).toBeGreaterThan(q.crop[0]);
      expect(q.crop[3], q.id).toBeGreaterThan(q.crop[1]);
      q.crop.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
      expect(new Set(q.points.map((p) => p.label)).size, q.id).toBe(
        q.points.length,
      );
      q.shapes.forEach((s) => {
        expect(s.vertices.length, q.id).toBeGreaterThanOrEqual(3);
        expect(
          Math.abs(signedArea(shapePoints(s, q.points))),
          q.id + s.name,
        ).toBeGreaterThan(0.000001);
      });
    }
  });
  it("snaps nearby matching triangles without deforming or unexpectedly reflecting them", () => {
    const sets = boardShapes(q19.shapes, q19Points());
    const target = {
      points: sets[1],
      pose: { ...identityPose, x: 430, y: 230 },
    };
    const near = { ...identityPose, x: 437, y: 235, angle: 86, scale: 1.45 };
    const snapped = snapPose(sets[0], near, [target], { pixelsPerUnit: 1 })!;
    expect(snapped).not.toBeNull();
    expect(snapped.angle).toBeCloseTo(90);
    expect(snapped.scale).toBeCloseTo(1.5);
    transform(sets[0], snapped).forEach((p, i) =>
      expect(distance(p, transform(target.points, target.pose)[i])).toBeCloseTo(
        0,
      ),
    );
    for (const changes of [
      { x: 550 },
      { scale: 1 },
      { angle: 60 },
      { flipX: -1 },
    ]) {
      expect(
        snapPose(sets[0], { ...near, ...changes }, [target], {
          pixelsPerUnit: 1,
        }),
      ).toBeNull();
    }
    const reflected = { points: sets[1], pose: { ...target.pose, flipX: -1 } };
    expect(
      snapPose(sets[0], { ...near, angle: -86, flipX: -1 }, [reflected], {
        pixelsPerUnit: 1,
      }),
    ).not.toBeNull();
    expect(snapPose(sets[0], near, [], { pixelsPerUnit: 1 })).toBeNull();
    expect(
      snapPose(sets[0], near, [target], { pixelsPerUnit: 1, mode: "rotate" })
        ?.scale,
    ).toBe(near.scale);
    expect(
      snapPose(sets[0], near, [target], { pixelsPerUnit: 1, mode: "resize" })
        ?.angle,
    ).toBe(near.angle);
    // A screen-sized threshold works identically when SVG coordinate units change.
    expect(snapPose(sets[0], near, [target], { pixelsPerUnit: 4 })).toBeNull();
  });
  it("checks supplied side values and ratios and constructs the two missing textbook diagrams", () => {
    const value = (s: string): number =>
      s
        .split("/")
        .map((part) => {
          const root = part.match(/^(\d*)√(\d+)$/);
          return root
            ? Number(root[1] || 1) * Math.sqrt(Number(root[2]))
            : Number(part);
        })
        .reduce((a, b) => a / b);
    for (const q of questions)
      for (const pair of reasonPairs(q)) {
        if (!pair.lengths || !pair.ratio) continue;
        pair.lengths[0].forEach((a, i) => {
          const b = pair.lengths![1][i];
          if (a && b && Number.isFinite(value(a)) && Number.isFinite(value(b)))
            expect(value(a) / value(b), `${q.id} side ${i}`).toBeCloseTo(
              value(pair.ratio!),
            );
        });
        if (q.shapes[pair.shapes[0]].vertices.length === 3)
          for (const [i, degrees] of Object.entries(pair.angleValues ?? {})) {
            const lengths = pair.lengths[0].map(value);
            if (
              degrees === 90 &&
              lengths.every((n) => n > 0 && Number.isFinite(n))
            ) {
              expect(lengths[(Number(i) + 1) % 3] ** 2, q.id).toBeCloseTo(
                lengths[Number(i)] ** 2 + lengths[(Number(i) + 2) % 3] ** 2,
              );
            }
          }
      }
    const constructed = questions.filter((q) => q.constructed);
    expect(constructed.map((q) => q.id)).toEqual(["ex8a-12", "ex8a-13"]);
    for (const q of constructed) {
      const sets = q.shapes.map((s) => shapePoints(s, modelPoints(q)));
      const ratios = sets[0].map(
        (p, i) =>
          distance(p, sets[0][(i + 1) % 3]) /
          distance(sets[1][i], sets[1][(i + 1) % 3]),
      );
      expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(0.00001);
    }
  });
});
