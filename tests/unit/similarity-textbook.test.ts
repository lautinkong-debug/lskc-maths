import { describe, expect, it } from "vitest";
import katex from "katex";
import { questions } from "../../src/apps/similarity/data";
import { textbookAB } from "../../src/apps/similarity/textbook-ab";
import { textbookC } from "../../src/apps/similarity/textbook-c";
import { textbookQuickAndD } from "../../src/apps/similarity/textbook-qp-d";
import { textbookRevision } from "../../src/apps/similarity/textbook-revision";
import {
  printedLines,
  textbookSolutions,
} from "../../src/apps/similarity/textbook";
import {
  stepGeometry,
  vertexNames,
} from "../../src/apps/similarity/stepGeometry";
import type {
  TextbookSolution,
  TextbookStep,
} from "../../src/apps/similarity/textbook-types";
import type { Point } from "../../src/apps/similarity/types";

const tex = String.raw;
const collections = [
  textbookAB,
  textbookC,
  textbookQuickAndD,
  textbookRevision,
];
const rawSolutions: Record<string, TextbookSolution> = Object.assign(
  {},
  ...collections,
);
const ids = (prefix: string, first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => `${prefix}${first + i}`);
const canonicalIds = [
  ...ids("qp8-", 1, 14),
  ...ids("ex8a-", 12, 22),
  ...ids("ex8b-", 16, 26),
  ...ids("ex8c-", 10, 19),
  ...ids("ex8d-", 11, 20),
  ...ids("rev8-", 23, 38),
];
const mathLines = (solution: TextbookSolution) =>
  solution.steps.flatMap((step) => step.math ?? []);
// Ignore spacing commands only; names, operators, fraction direction and line
// boundaries remain significant in the source-order regressions below.
const compact = (line: string) =>
  line.replace(/\\(?:quad|qquad|,|;| )/g, "").replace(/\s+/g, "");

describe("Literal similarity textbook solutions", () => {
  it("covers the canonical 72 questions once, without silently overwritten records", () => {
    expect(canonicalIds).toHaveLength(72);
    const unmergedIds = collections.flatMap((collection) =>
      Object.keys(collection),
    );
    expect(new Set(unmergedIds).size).toBe(unmergedIds.length);
    for (const actual of [
      unmergedIds,
      Object.keys(textbookSolutions),
      questions.map((question) => question.id),
    ]) {
      expect([...actual].sort()).toEqual([...canonicalIds].sort());
    }
  });

  it("records ordered PDF solution pages within the correct source sections", () => {
    const pageRanges: Record<string, [number, number]> = {
      qp8: [2, 4],
      ex8a: [6, 7],
      ex8b: [9, 10],
      ex8c: [11, 13],
      ex8d: [14, 15],
      rev8: [19, 22],
    };
    for (const [id, solution] of Object.entries(textbookSolutions)) {
      const [first, last] = pageRanges[id.split("-")[0]];
      expect(solution.pages.length, id).toBeGreaterThan(0);
      expect(solution.pages, id).toEqual(
        [...new Set(solution.pages)].sort((a, b) => a - b),
      );
      for (const page of solution.pages) {
        expect(Number.isInteger(page), id).toBe(true);
        expect(page, id).toBeGreaterThanOrEqual(first);
        expect(page, id).toBeLessThanOrEqual(last);
      }
    }
    // These answers cross PDF pages; dropping the continuation loses work.
    expect(textbookSolutions["qp8-14"].pages).toEqual([3, 4]);
    expect(textbookSolutions["ex8c-12"].pages).toEqual([11, 12]);
    expect(textbookSolutions["ex8c-18"].pages).toEqual([12, 13]);
    expect(textbookSolutions["ex8d-15"].pages).toEqual([14, 15]);
    expect(textbookSolutions["rev8-28"].pages).toEqual([19, 20]);
    expect(textbookSolutions["rev8-33"].pages).toEqual([20, 21]);
  });

  it("renders every printed mathematical line as valid KaTeX", () => {
    for (const [id, solution] of Object.entries(textbookSolutions)) {
      expect(solution.steps.length, id).toBeGreaterThan(0);
      for (const [index, step] of solution.steps.entries()) {
        const context = `${id}, printed step ${index + 1}`;
        expect(
          Boolean(step.heading || step.text || step.math?.length),
          context,
        ).toBe(true);
        expect(step.math?.length ?? 0, context).toBeLessThanOrEqual(1);
        for (const line of step.math ?? []) {
          expect(line.trim().length, context).toBeGreaterThan(0);
          expect(
            () =>
              katex.renderToString(line, {
                throwOnError: true,
                strict: "error",
              }),
            `${context}: ${line}`,
          ).not.toThrow();
        }
      }
    }
  });

  it("maps every step to valid source vertices and resolves every full-diagram highlight", () => {
    for (const question of questions) {
      const labels = new Set(question.points.map((point) => point.label));
      for (const [index, step] of textbookSolutions[
        question.id
      ].steps.entries()) {
        const context = `${question.id}, printed step ${index + 1}`;
        expect(
          Object.values(step.highlights).some((names) => names.length > 0),
          context,
        ).toBe(true);
        for (const [kind, names] of Object.entries(step.highlights)) {
          for (const name of names) {
            const vertices = kind === "points" ? [name] : vertexNames(name);
            expect(vertices.length, `${context}: ${name}`).toBeGreaterThan(0);
            if (kind === "angles")
              expect(vertices, `${context}: ${name}`).toHaveLength(3);
            if (kind === "sides")
              expect(vertices, `${context}: ${name}`).toHaveLength(2);
            if (kind === "figures")
              expect(
                vertices.length,
                `${context}: ${name}`,
              ).toBeGreaterThanOrEqual(3);
            for (const vertex of vertices)
              expect(
                labels.has(vertex),
                `${context}: ${name} uses ${vertex}`,
              ).toBe(true);
          }
        }
        const resolved = stepGeometry(step.highlights, question.points);
        for (const kind of ["angles", "sides", "figures", "points"] as const) {
          expect(resolved[kind], `${context}: ${kind}`).toHaveLength(
            step.highlights[kind]?.length ?? 0,
          );
        }
      }
    }
  });

  it("expands every printed line without changing order, source metadata or reveal boundaries", () => {
    for (const [id, raw] of Object.entries(rawSolutions)) {
      const expanded = textbookSolutions[id];
      const lineCount = (steps: TextbookStep[]) =>
        steps.reduce(
          (sum, step) => sum + Math.max(1, step.math?.length ?? 0),
          0,
        );
      expect(expanded.steps, id).toHaveLength(lineCount(raw.steps));
      expect(mathLines(expanded), id).toEqual(mathLines(raw));
      expect(expanded.initialVisible, id).toBe(
        lineCount(raw.steps.slice(0, raw.initialVisible)),
      );
      expect(expanded.initialVisible, id).toBeGreaterThan(0);
      expect(expanded.initialVisible, id).toBeLessThanOrEqual(
        expanded.steps.length,
      );
      expect(expanded.pages, id).toEqual(raw.pages);
      expect(expanded.sourceNote, id).toBe(raw.sourceNote);
      expect(printedLines(expanded), id).toEqual(expanded);
      for (const field of ["heading", "reason", "text"] as const) {
        expect(
          expanded.steps.map((step) => step[field]).filter(Boolean),
          `${id}: ${field}`,
        ).toEqual(raw.steps.map((step) => step[field]).filter(Boolean));
      }
    }
  });

  it("keeps a calculation reason on its first line and reveals its lines separately", () => {
    const source: TextbookSolution = {
      pages: [6],
      sourceNote: "A source note remains separate from the printed work.",
      initialVisible: 2,
      steps: [
        { heading: "(a)", highlights: { figures: ["ABC"] } },
        {
          heading: "In △ABC,",
          text: "Printed introduction.",
          math: [tex`x+40^\circ+63^\circ=180^\circ`, tex`x=77^\circ`],
          reason: "∠ sum of △",
          highlights: { angles: ["BAC"] },
        },
        { math: [tex`y=23^\circ`], highlights: { angles: ["CBD"] } },
      ],
    };
    const before = structuredClone(source);
    const expanded = printedLines(source);
    expect(expanded.initialVisible).toBe(3);
    expect(expanded.steps).toHaveLength(4);
    expect(expanded.steps[1]).toMatchObject({
      heading: "In △ABC,",
      text: "Printed introduction.",
      reason: "∠ sum of △",
      math: [tex`x+40^\circ+63^\circ=180^\circ`],
    });
    expect(expanded.steps[2]).toMatchObject({
      math: [tex`x=77^\circ`],
      highlights: { angles: ["BAC"] },
    });
    expect(expanded.steps[2].heading).toBeUndefined();
    expect(expanded.steps[2].text).toBeUndefined();
    expect(expanded.steps[2].reason).toBeUndefined();
    expect(expanded.steps[3].math).toEqual([tex`y=23^\circ`]);
    expect(source).toEqual(before);
  });

  it("retains Quick Practice 8.8's printed larger-to-smaller ratios and proof order", () => {
    // Independently checked against Full Solutions PDF page 3.
    const solution = textbookSolutions["qp8-8"];
    expect(solution.steps[0].heading).toBe("In △ABC and △RQP,");
    expect(mathLines(solution).map(compact)).toEqual(
      [
        tex`\because \frac{RQ}{AB}=\frac{5.6\text{ cm}}{4.2\text{ cm}}=\frac43`,
        tex`\frac{RP}{AC}=\frac{3.6\text{ cm}}{2.7\text{ cm}}=\frac43`,
        tex`\therefore \frac{RQ}{AB}=\frac{RP}{AC}`,
        tex`\angle A=\angle R`,
        tex`\therefore \triangle ABC\sim\triangle RQP`,
      ].map(compact),
    );
    expect(solution.steps.map((step) => step.reason)).toEqual([
      undefined,
      undefined,
      undefined,
      "given",
      "ratio of 2 sides, inc. ∠",
    ]);
    expect(solution.steps[3].highlights.angles).toEqual(["BAC", "QRP"]);
    expect(solution.initialVisible).toBe(solution.steps.length);
  });

  it("retains Q19's full angle proof before the printed AC/AE = BC/FE calculation", () => {
    // Independently checked against Full Solutions PDF page 13.
    const solution = textbookSolutions["ex8c-19"];
    const partB = solution.steps.findIndex((step) => step.heading === "(b)");
    expect(solution.initialVisible).toBe(partB);
    expect(solution.steps[partB - 1].conclusion).toBe(true);
    expect(
      mathLines({ ...solution, steps: solution.steps.slice(0, partB) }).map(
        compact,
      ),
    ).toEqual(
      [
        tex`\angle ABC+\angle BAF=180^\circ`,
        tex`\angle ABC+90^\circ=180^\circ`,
        tex`\angle ABC=90^\circ`,
        tex`\therefore \angle AFE=\angle ABC`,
        tex`\therefore \angle CAE=90^\circ`,
        tex`\therefore \angle EAF+\angle CAF=90^\circ`,
        tex`\angle EAF=90^\circ-\angle CAF`,
        tex`\angle BAC+\angle CAF=90^\circ`,
        tex`\angle BAC=90^\circ-\angle CAF`,
        tex`\therefore \angle EAF=\angle BAC`,
        tex`\because \angle AEF=180^\circ-\angle AFE`,
        tex`\phantom{\because\quad\angle AEF=180^\circ}\ -\angle EAF`,
        tex`\angle ACB=180^\circ-\angle ABC`,
        tex`\phantom{\angle ACB=180^\circ}\ -\angle BAC`,
        tex`\therefore \angle AEF=\angle ACB`,
        tex`\therefore \triangle AFE\sim\triangle ABC`,
      ].map(compact),
    );
    const calculation = solution.steps.findIndex((step) =>
      step.math?.some(
        (line) =>
          compact(line) ===
          compact(tex`\therefore \frac{AC}{AE}=\frac{BC}{FE}`),
      ),
    );
    expect(calculation).toBeGreaterThan(partB);
    expect(solution.steps[calculation].highlights.sides).toEqual([
      "AC",
      "AE",
      "BC",
      "FE",
    ]);
    expect(
      solution.steps
        .slice(calculation + 1, calculation + 3)
        .flatMap((step) => step.math ?? [])
        .map(compact),
    ).toEqual(
      [
        tex`\frac{AC}{3\text{ cm}}=\frac{3\text{ cm}}{2\text{ cm}}`,
        tex`AC=\frac92\text{ cm}`,
      ].map(compact),
    );
  });
});

describe("Textbook step geometry on manipulated copies", () => {
  const source: Point[] = [
    { label: "A", x: 0, y: 0 },
    { label: "B", x: 2, y: 0 },
    { label: "C", x: 0, y: 3 },
    { label: "D", x: 4, y: 0 },
    { label: "E", x: 0, y: 6 },
    { label: "X", x: -2, y: 0 },
    { label: "Y", x: 3, y: 3 },
  ];
  // A 90-degree turn, enlargement and translation independent of production
  // geometry helpers, so stale original coordinates cannot satisfy these checks.
  const placed = source.slice(0, 3).map((point) => ({
    label: point.label,
    x: 100 - 2 * point.y,
    y: 200 + 2 * point.x,
  }));
  const point = (label: string) => placed.find((p) => p.label === label)!;

  it("parses numbered and comma-separated names without splitting vertex numbers", () => {
    expect(vertexNames("A1B12C3")).toEqual(["A1", "B12", "C3"]);
    expect(vertexNames("A1,B12,C3")).toEqual(["A1", "B12", "C3"]);
    expect(vertexNames("CAB")).toEqual(["C", "A", "B"]);
  });

  it("uses the transformed coordinates for exact angles, sides, figures and points", () => {
    const geometry = stepGeometry(
      { angles: ["BAC"], sides: ["AB"], figures: ["CAB"], points: ["B"] },
      source,
      placed,
    );
    expect(geometry.angles).toEqual([
      { name: "BAC", points: [point("B"), point("A"), point("C")] },
    ]);
    expect(geometry.sides).toEqual([
      { name: "AB", points: [point("A"), point("B")] },
    ]);
    expect(geometry.figures).toEqual([
      { name: "CAB", points: [point("C"), point("A"), point("B")] },
    ]);
    expect(geometry.points).toEqual([point("B")]);
    expect(geometry.angles[0].points[1]).toEqual({
      label: "A",
      x: 100,
      y: 200,
    });
  });

  it("resolves alternative collinear angle names on a copy using the source rays", () => {
    const geometry = stepGeometry({ angles: ["DAE", "EAD"] }, source, placed);
    expect(geometry.angles).toEqual([
      { name: "DAE", points: [point("B"), point("A"), point("C")] },
      { name: "EAD", points: [point("C"), point("A"), point("B")] },
    ]);
    const reflected = placed.map((p) => ({ ...p, x: -p.x + 17 }));
    expect(
      stepGeometry({ angles: ["DAE"] }, source, reflected).angles[0].points,
    ).toEqual([reflected[1], reflected[0], reflected[2]]);
  });

  it("rejects opposite or different rays and absent vertices instead of inventing marks", () => {
    const geometry = stepGeometry(
      {
        angles: ["XAC", "YAC", "ADB", "ZAC"],
        sides: ["AD", "ZX"],
        figures: ["ADE", "ABZ"],
        points: ["D", "Z"],
      },
      source,
      placed,
    );
    expect(geometry).toEqual({
      angles: [],
      sides: [],
      figures: [],
      points: [],
    });
  });

  it("keeps an explicitly present endpoint even when another vertex is on the same ray", () => {
    const extendedCopy = [...placed, { label: "D", x: 100, y: 208 }];
    const geometry = stepGeometry(
      { angles: ["DAC"], sides: ["AD"] },
      source,
      extendedCopy,
    );
    expect(geometry.angles[0].points[0]).toBe(extendedCopy[3]);
    expect(geometry.sides[0].points[1]).toBe(extendedCopy[3]);
  });
});
