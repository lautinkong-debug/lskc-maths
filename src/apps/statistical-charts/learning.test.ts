import { describe, expect, it } from "vitest";
import { groupedTable, type ChartType } from "./statistics";
import {
  draftItems,
  expectedConnection,
  gradeAnswer,
  gradeConstruction,
  lessonStages,
  numberAnswer,
  parsedItems,
  practiceScaffold,
  questionAnswer,
  questionFormula,
  snapCoordinate,
  targets,
  type ConstructionItem,
  type QuestionKind,
} from "./learning";
const rows = groupedTable(
  [
    { lower: 10, upper: 19, frequency: 3 },
    { lower: 20, upper: 29, frequency: 7 },
    { lower: 30, upper: 39, frequency: 5 },
    { lower: 40, upper: 49, frequency: 5 },
  ],
  1,
).rows;
const types: ChartType[] = [
  "histogram",
  "polygon",
  "curve",
  "cumulativePolygon",
  "cumulativeCurve",
];
const mark = (
  type: ChartType,
  p: ConstructionItem[],
  connection = expectedConnection(type),
) => gradeConstruction(rows, type, draftItems(p), connection);
describe("exact construction grading", () => {
  it.each(types)(
    "accepts complete %s constructions in any entry order",
    (type) => {
      const answer = targets(rows, type);
      expect(mark(type, answer).correct).toBe(true);
      expect(mark(type, [...answer].reverse()).correct).toBe(true);
    },
  );
  it.each(types)("rejects one wrong vertical value for %s", (type) => {
    const answer = targets(rows, type).map((p) => ({ ...p }));
    answer[1].y++;
    expect(mark(type, answer).correct).toBe(false);
  });
  it.each(types)("gives only a partial scaffold for %s", (type) => {
    const partial = practiceScaffold(rows, type, 2);
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.length).toBeLessThan(targets(rows, type).length);
    expect(partial.every((p) => p.given)).toBe(true);
    expect(
      gradeConstruction(rows, type, partial, expectedConnection(type)).correct,
    ).toBe(false);
    expect(practiceScaffold(rows, type, 3)).toEqual([]);
  });
  it("uses exact histogram boundary coordinates", () => {
    expect(targets(rows, "histogram")).toEqual([
      { x: 9.5, end: 19.5, y: 3 },
      { x: 19.5, end: 29.5, y: 7 },
      { x: 29.5, end: 39.5, y: 5 },
      { x: 39.5, end: 49.5, y: 5 },
    ]);
  });
  it("rejects gaps, limits, wrong heights and invalid widths", () => {
    const bars = targets(rows, "histogram");
    expect(
      mark(
        "histogram",
        bars.map((p) => ({ ...p, end: p.end! - 0.5 })),
      ).code,
    ).toBe("touching");
    expect(
      mark(
        "histogram",
        bars.map((p) => ({ ...p, x: p.x + 0.5, end: p.end! + 0.5 })),
      ).code,
    ).toBe("barBoundaries");
    expect(
      mark(
        "histogram",
        bars.map((p) => ({ ...p, y: 1 })),
      ).code,
    ).toBe("heights");
    expect(mark("histogram", [{ x: 10, end: 10, y: 3 }]).correct).toBe(false);
  });
  it("distinguishes class limits and omitted zero ends", () => {
    const p = targets(rows, "polygon");
    expect(mark("polygon", p.slice(1, -1)).code).toBe("zeroEnds");
    expect(
      mark(
        "polygon",
        p.map((v, i) => (i === 1 ? { ...v, x: 10 } : v)),
      ).code,
    ).toBe("classMarks");
  });
  it("checks initial zero, cumulative direction and final total", () => {
    const p = targets(rows, "cumulativePolygon");
    expect(mark("cumulativePolygon", p.slice(1)).code).toBe("startZero");
    expect(
      mark(
        "cumulativePolygon",
        p.map((v, i) => (i === 2 ? { ...v, y: 1 } : v)),
      ).code,
    ).toBe("neverDecrease");
    expect(
      mark(
        "cumulativePolygon",
        p.map((v, i) => (i === 4 ? { ...v, y: 21 } : v)),
      ).code,
    ).toBe("endTotal");
  });
  it("checks join style, not just coordinates", () => {
    expect(mark("polygon", targets(rows, "polygon"), "smooth").code).toBe(
      "straight",
    );
    expect(mark("curve", targets(rows, "curve"), "straight").code).toBe(
      "smooth",
    );
    expect(
      mark("cumulativePolygon", targets(rows, "cumulativePolygon"), "none")
        .correct,
    ).toBe(false);
  });
  it("does not mistake blank or invalid text for zero", () => {
    const p = draftItems(targets(rows, "polygon"));
    p[0].y = "";
    expect(gradeConstruction(rows, "polygon", p, "straight").code).toBe(
      "number",
    );
    for (const v of ["", " ", "Infinity", "NaN", "0x10", "1+2", "<script>"])
      expect(numberAnswer(v)).toBeNull();
    expect(numberAnswer("0")).toBe(0);
    expect(numberAnswer(" 1.5e1 ")).toBe(15);
  });
  it("rejects duplicate, extra, negative and missing items", () => {
    const p = targets(rows, "polygon");
    expect(mark("polygon", [...p, p[0]]).code).toBe("duplicate");
    expect(mark("polygon", [...p, { x: 8, y: 2 }]).code).toBe("extra");
    expect(
      mark(
        "polygon",
        p.map((v, i) => (i === 1 ? { ...v, y: -1 } : v)),
      ).code,
    ).toBe("negative");
    expect(mark("polygon", []).code).toBe("missing");
  });
  it("supports negative and decimal values", () => {
    const r = groupedTable(
      [
        { lower: -1, upper: -0.1, frequency: 0 },
        { lower: 0, upper: 0.9, frequency: 5 },
      ],
      0.1,
    ).rows;
    for (const type of types)
      expect(
        gradeConstruction(
          r,
          type,
          draftItems(targets(r, type)),
          expectedConnection(type),
        ).correct,
      ).toBe(true);
  });
  it("supports zero-total and single-class exercises", () => {
    const r = groupedTable([{ lower: 0, upper: 0, frequency: 0 }], 1).rows;
    for (const type of types) {
      expect(
        gradeConstruction(
          r,
          type,
          draftItems(targets(r, type)),
          expectedConnection(type),
        ).correct,
      ).toBe(true);
      expect(practiceScaffold(r, type, 2).length).toBeLessThan(
        targets(r, type).length,
      );
    }
  });
});
describe("guided calculations and lesson sequence", () => {
  it.each(["mark", "low", "width", "cumulative"] as QuestionKind[])(
    "checks %s and provides a worked calculation",
    (kind) => {
      const n = questionAnswer(rows[1], kind);
      expect(gradeAnswer(String(n), rows[1], kind)).toBe("correct");
      expect(gradeAnswer(String(n + 1), rows[1], kind)).not.toBe("correct");
      expect(gradeAnswer("", rows[1], kind)).toBe("number");
      expect(questionFormula(rows, 1, kind)).toContain(`=${n}`);
    },
  );
  it("catches misconception answers", () => {
    expect(gradeAnswer("20", rows[1], "mark")).toBe("midpoint");
    expect(gradeAnswer("20", rows[1], "low")).toBe("halfUnit");
    expect(gradeAnswer("9", rows[1], "width")).toBe("boundaryWidth");
    expect(gradeAnswer("7", rows[1], "cumulative")).toBe("runningSum");
  });
  it.each(types)("walks %s from preparation to completion", (type) => {
    const a = lessonStages(type);
    expect(a[0]).toBe("prepare");
    expect(a.at(-1)).toBe("finish");
    expect(a.indexOf("calculate")).toBeLessThan(a.indexOf("plot"));
    if (type === "polygon" || type === "curve") expect(a).toContain("ends");
    if (type.includes("Curve") || type === "curve")
      expect(a.indexOf("smooth")).toBeGreaterThan(a.indexOf("join"));
  });
  it("snaps coordinates without using target answers", () => {
    expect(snapCoordinate(14.3, 0.5)).toBe(14.5);
    expect(snapCoordinate(-1.24, 0.05)).toBe(-1.25);
    expect(snapCoordinate(19.953, 0.005)).toBe(19.955);
    expect(
      parsedItems([{ id: 1, x: "10", end: "19.5", y: "3" }], true),
    ).toEqual([{ x: 10, end: 19.5, y: 3 }]);
  });
});
