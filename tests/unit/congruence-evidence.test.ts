import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { quickQuestions } from "../../src/apps/congruence/data-quick";
import { exerciseABQuestions } from "../../src/apps/congruence/data-ab";
import {
  evidenceGeometry,
  extractEvidence,
} from "../../src/apps/congruence/evidence";
import { rigidTransform } from "../../src/apps/congruence/geometry";
import {
  EvidenceMarks,
  layoutEvidenceMarks,
} from "../../src/apps/congruence/EvidenceMarks";
import { questions } from "../../src/apps/congruence/data";
import type { CongruenceQuestion } from "../../src/apps/congruence/types";

const question = (id: string) =>
  [...quickQuestions, ...exerciseABQuestions].find((q) => q.id === id)!;
const fixture = (steps: CongruenceQuestion["steps"]): CongruenceQuestion => ({
  id: "fixture",
  group: "Quick Practice",
  number: "test",
  page: 1,
  crop: [0, 0, 200, 200],
  prompt: "",
  solutionPages: [1],
  points: [
    { label: "A", x: 0, y: 0 },
    { label: "B", x: 100, y: 0 },
    { label: "C", x: 0, y: 100 },
    { label: "D", x: 200, y: 1 },
    { label: "E", x: -100, y: 0 },
  ],
  shapes: [{ name: "△ABC", vertices: ["A", "B", "C"] }],
  steps,
});

describe("literal congruence evidence", () => {
  it("reveals only the current stated condition, or all conditions so far", () => {
    const q = question("qp5-14");
    expect(extractEvidence(q, 0)).toEqual([]);
    const first = extractEvidence(q, 1);
    expect(first).toHaveLength(1);
    expect(first[0].members.map((m) => m.name)).toEqual(["QPR", "TSR"]);
    expect(extractEvidence(q, 2).map((r) => r.kind)).toEqual(["angle"]);
    const all = extractEvidence(q, 3, "all");
    expect(all.map((r) => r.kind)).toEqual(["angle", "angle", "side"]);
    expect(all[0].key).toBe(first[0].key);
    expect(extractEvidence(q, 4)).toEqual([]);
  });

  it("keeps the two vertically opposite angles at shared R on their own triangles", () => {
    const q = question("qp5-14"),
      rows = extractEvidence(q, 2);
    for (const [index, name] of ["PRQ", "SRT"].entries()) {
      const shape = q.shapes[index].vertices.map((v) =>
        q.points.find((p) => p.label === v)!,
      );
      const placed = rigidTransform(shape, {
        x: 300,
        y: 200,
        angle: 35,
        reflected: true,
      });
      const marks = evidenceGeometry(rows, q.points, placed);
      expect(marks).toHaveLength(1);
      expect(marks[0].name).toBe(name);
      expect(marks[0].points[1]).toEqual(placed.find((p) => p.label === "R"));
    }
  });

  it("maps a rounded collinear ray but refuses its opposite extension", () => {
    const q = fixture([
      {
        math: [String.raw`\angle DAC=\angle EAC`],
        highlights: { angles: ["DAC", "EAC"] },
      },
    ]);
    const placed = rigidTransform(q.points.slice(0, 3), {
      x: 90,
      y: 70,
      angle: 25,
      reflected: true,
    });
    const marks = evidenceGeometry(extractEvidence(q, 0), q.points, placed);
    expect(marks.map((m) => m.name)).toEqual(["DAC"]);
    expect(marks[0].points[0]).toEqual(placed.find((p) => p.label === "B"));
  });

  it("uses stated 90 degrees, never the apparent angle of a traced drawing", () => {
    const q = fixture([
      {
        math: [String.raw`\angle BAC=90^\circ`],
        highlights: { angles: ["BAC"] },
      },
    ]);
    expect(extractEvidence(q, 0)[0].members[0].degrees).toBe(90);
    q.steps[0].math = [String.raw`\angle BAC=\angle ABC`];
    q.steps[0].highlights.angles = ["BAC", "ABC"];
    expect(
      extractEvidence(q, 0)[0].members.every((m) => m.degrees === undefined),
    ).toBe(true);
  });

  it("takes exact final lengths from calculations without equating their operands", () => {
    const q = fixture([
      {
        math: [String.raw`AB=(4+4)\text{ cm}=8\text{ cm}`],
        highlights: { sides: ["AB", "AC", "BC"] },
      },
    ]);
    const rows = extractEvidence(q, 0);
    expect(rows).toHaveLength(1);
    expect(rows[0].members).toEqual([{ name: "AB", value: "8 cm" }]);
    expect(
      evidenceGeometry(rows, q.points, q.points.slice(0, 3))[0].points.map(
        (p) => p.label,
      ),
    ).toEqual(["A", "B"]);
  });

  it("does not create equal marks from angle sums, side differences, or prose", () => {
    const q = fixture([
      {
        math: [String.raw`\angle BAC+\angle ABC+\angle ACB=180^\circ`],
        highlights: { angles: ["BAC", "ABC", "ACB"] },
      },
      { math: ["AB-AC=BC"], highlights: { sides: ["AB", "AC", "BC"] } },
      { text: "Suggest an extra length.", highlights: { sides: ["AB", "AC"] } },
    ]);
    for (let i = 0; i < 3; i++) expect(extractEvidence(q, i)).toEqual([]);
  });

  it("accepts a named exact length in a variable equality chain", () => {
    const q = fixture([{ math: ["a=AB=4"], highlights: { sides: ["AB"] } }]);
    expect(extractEvidence(q, 0)[0].members).toEqual([
      { name: "AB", value: "4" },
    ]);
  });

  it("uses the explicit angle targets of symbolic and continuation proof lines", () => {
    const q = fixture([
      {
        math: [String.raw`\angle BAC=x`],
        highlights: { angles: ["BAC", "ABC"] },
      },
      { math: ["=y"], highlights: { angles: ["ABC", "ACB"] } },
      { math: ["=BC"], highlights: { sides: ["AB", "BC"] } },
    ]);
    expect(extractEvidence(q, 0)[0].members.map((m) => m.name)).toEqual([
      "BAC",
      "ABC",
    ]);
    expect(extractEvidence(q, 1)[0].members.map((m) => m.name)).toEqual([
      "ABC",
      "ACB",
    ]);
    expect(extractEvidence(q, 2)[0].members.map((m) => m.name)).toEqual([
      "AB",
      "BC",
    ]);
  });

  it("enriches only revealed equalities with explicitly named prompt values", () => {
    const q = question("ex5b-19");
    expect(extractEvidence(q, 0)).toEqual([]);
    expect(extractEvidence(q, 1)[0].members.map((m) => m.value)).toEqual([
      "3 cm",
      "3 cm",
    ]);
    expect(extractEvidence(q, 2)[0].members.map((m) => m.degrees)).toEqual([
      23, 23,
    ]);
  });

  it("does not reveal a later answer, and propagates a revealed value through its established equality", () => {
    const q = question("qp5-1");
    const before = extractEvidence(q, 3, "all").find((r) => r.kind === "side")!;
    expect(before.members.every((m) => m.value === undefined)).toBe(true);
    const after = extractEvidence(q, 4, "all").find(
      (r) => r.key === before.key,
    )!;
    expect(after.members.map((m) => m.value)).toEqual(["6", "6"]);
    expect(extractEvidence(q, 4)[0].key).toBe(before.key);
  });

  it("combines overlaid equal side names while retaining separate opposite angles", () => {
    const q = question("qp5-14");
    const rows = extractEvidence(q, 3);
    const left = q.shapes[0].vertices.map((v) =>
      q.points.find((p) => p.label === v)!,
    );
    const right = [
      { ...left[0], label: "S" },
      { ...left[1], label: "T" },
      { ...left[2], label: "R" },
    ];
    const layout = layoutEvidenceMarks(rows, q.points, [
      { id: 0, points: left },
      { id: 1, points: right },
    ]);
    expect(layout.marks).toHaveLength(1);
    expect(layout.marks[0].text).toBe("QR = TR");
    const angles = layoutEvidenceMarks(
      extractEvidence(q, 2),
      q.points,
      q.shapes.map((s, id) => ({
        id,
        points: s.vertices.map((v) => q.points.find((p) => p.label === v)!),
      })),
    );
    expect(angles.marks).toHaveLength(2);
    expect(angles.boxes).toHaveLength(2);
  });

  it("keeps every catalogue condition source-grounded and every layout finite", () => {
    expect(questions).toHaveLength(66);
    for (const q of questions) {
      const rows = extractEvidence(q, q.steps.length - 1, "all");
      expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length);
      const layout = layoutEvidenceMarks(
        rows,
        q.points,
        q.shapes.map((s, id) => ({
          id,
          points: s.vertices.map((v) => q.points.find((p) => p.label === v)!),
        })),
      );
      expect(
        layout.boxes.every((box) =>
          [box.x, box.y, box.width, box.height].every(Number.isFinite),
        ),
      ).toBe(true);
      for (const row of rows)
        expect(
          row.stepIndices.every((index) => q.steps[index].math?.length),
        ).toBe(true);
    }
  });

  it("renders one real square with 90 degrees after source/copy deduplication", () => {
    const q = fixture([
      {
        math: [String.raw`\angle BAC=90^\circ`],
        highlights: { angles: ["BAC"] },
      },
    ]);
    q.points[2].x = 30; // The tracing itself is not precisely perpendicular.
    const rows = extractEvidence(q, 0);
    const markup = renderToStaticMarkup(
      createElement(
        "svg",
        null,
        createElement(EvidenceMarks, {
          rows,
          source: q.points,
          placements: [
            { id: -1, points: q.points, sourceOnly: true },
            { id: 0, points: q.points.slice(0, 3) },
          ],
          currentKeys: new Set([rows[0].key]),
        }),
      ),
    );
    expect(markup.match(/data-testid="right-angle-mark"/g)).toHaveLength(1);
    expect(markup).toContain(">90°</text>");
    expect(markup).toContain('data-highlight-angle="BAC"');
    const path = markup.match(/data-testid="right-angle-mark" d="([^"]+)"/)![1];
    const coords = path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!.map(Number);
    const a = { x: coords[2] - coords[0], y: coords[3] - coords[1] },
      b = { x: coords[4] - coords[2], y: coords[5] - coords[3] };
    expect(a.x * b.x + a.y * b.y).toBeCloseTo(0);
    expect(Math.hypot(a.x, a.y)).toBeCloseTo(Math.hypot(b.x, b.y));
  });
});
