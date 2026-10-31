import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { angleAt } from "./geometry";
import {
  transferQuestion,
  transferRoutes,
  gradeTransfer,
  initialTransfer,
  parseTransfer,
  transferSummary,
  transferReport,
  transferArcConstruction,
} from "./transfer";

describe("new-diagram transfer check", () => {
  const expected: Record<string, number[]> = {
    r1: [7, 11, 9],
    r2: [90, 90, 90],
    r3: [6, 1, 7],
    r4: [3, 5, 4],
    r5: [12, 16, 14],
    r6: [43, 59, 71],
    r7: [47, 62, 38],
    r8: [90, 90, 90],
    r9: [14, 18, 12],
    r10: [9, 12, 7],
    r11: [72, 104, 126],
    r12: [8, 11, 9],
    r13: [72, 104, 126],
    r14: [8, 10, 13],
    r15: [8, 10, 13],
    r16: [12, 12, 20],
    r17: [12, 12, 20],
  };
  it("the three short routes collectively assess all 17 directions", () => {
    const set = new Set(Object.values(transferRoutes).flat());
    expect([...set].sort()).toEqual(reasons.map((r) => r.id).sort());
    for (const route of Object.values(transferRoutes))
      expect(route).toHaveLength(7);
    const families = new Set(
      transferRoutes["Seven-topic check"].map((id) => transferQuestion(id).lab),
    );
    expect(families.size).toBe(7);
  });
  for (const reason of reasons)
    for (let v = 0; v < 3; v++) {
      it(`checks independently calculated answer for ${reason.id} case ${v + 1}`, () => {
        const q = transferQuestion(reason.id, v);
        expect(q.answer).toBe(expected[reason.id][v]);
        expect(new Set(q.reasonChoices).size).toBe(3);
        expect(q.reasonChoices).toContain(reason.id);
        expect(q.title).not.toContain(reason.number);
        expect(new Set([q.condition, ...q.wrongConditions]).size).toBe(3);
        const result = gradeTransfer(q, {
          value: String(expected[reason.id][v]),
          reason: reason.id,
          condition: q.condition,
        });
        expect(result.correct).toBe(true);
      });
    }
  it("distinguishes value, direction and condition errors", () => {
    const q = transferQuestion("r1");
    const correct = { value: "7", reason: "r1", condition: q.condition };
    const wrongValue = gradeTransfer(q, { ...correct, value: "14" });
    expect([wrongValue.value, wrongValue.reason, wrongValue.condition]).toEqual(
      [false, true, true],
    );
    const reversed = gradeTransfer(q, { ...correct, reason: "r2" });
    expect([reversed.value, reversed.reason, reversed.condition]).toEqual([
      true,
      false,
      true,
    ]);
    expect(reversed.messages.join(" ")).toContain("mid-point");
    const wrongCondition = gradeTransfer(q, {
      ...correct,
      condition: q.wrongConditions[0],
    });
    expect([
      wrongCondition.value,
      wrongCondition.reason,
      wrongCondition.condition,
    ]).toEqual([true, true, false]);
    for (const value of ["", " ", "NaN", "Infinity", "0x7"])
      expect(gradeTransfer(q, { ...correct, value }).value).toBe(false);
  });
  it("states the circle-centre and chord conditions needed for the perpendicular reasons", () => {
    for (const variant of [0, 1, 2]) {
      expect(transferQuestion("r3", variant).given).toContain(
        "A and B lie on the circle",
      );
      for (const id of ["r4", "r5"]) {
        const q = transferQuestion(id, variant);
        expect(q.given).toContain("O is the centre");
        expect(q.given).toContain("chords of this circle");
      }
    }
  });
  it("circumference-angle ratio diagrams follow the selected arcs including the major arc", () => {
    const polar = (a: number) => ({
      x: Math.cos((a * Math.PI) / 180),
      y: Math.sin((a * Math.PI) / 180),
    });
    const relative = (angle: number, start: number) =>
      (angle - start + 720) % 360;
    for (let v = 0; v < 3; v++) {
      const q = transferQuestion("r17", v),
        c = transferArcConstruction(q);
      expect(c.firstSweep + c.secondSweep).toBeLessThan(360);
      expect(relative(c.pAngle, c.start)).toBeGreaterThan(c.firstSweep);
      expect(relative(c.qAngle, c.secondStart)).toBeGreaterThan(c.secondSweep);
      expect(
        angleAt(polar(c.start), polar(c.pAngle), polar(c.start + c.firstSweep)),
      ).toBeCloseTo(q.diagram.angle, 10);
      expect(
        angleAt(
          polar(c.secondStart),
          polar(c.qAngle),
          polar(c.secondStart + c.secondSweep),
        ),
      ).toBeCloseTo(q.diagram.value, 10);
      expect(q.answer / q.diagram.other).toBeCloseTo(
        c.firstSweep / c.secondSweep,
        10,
      );
    }
    expect(transferArcConstruction(transferQuestion("r17", 1)).firstSweep).toBe(
      210,
    );
  });
  it("restores the active question and recomputes saved grades rather than trusting completion flags", () => {
    const q = transferQuestion("r6", 1),
      response = { value: "59", reason: "r6", condition: q.condition };
    const saved = {
      ...initialTransfer(),
      route: "Reverse the reasoning",
      index: 3,
      variant: 1,
      response,
      submitted: true,
      attempts: [
        {
          questionId: "fake",
          reasonId: "r6",
          variant: 1,
          response,
          grade: { correct: false },
          at: "2026-10-30T12:00:00Z",
        },
      ],
    };
    const parsed = parseTransfer(saved)!;
    expect(parsed.index).toBe(3);
    expect(parsed.variant).toBe(1);
    expect(parsed.response).toEqual(response);
    expect(parsed.attempts[0].grade.correct).toBe(true);
    expect(parsed.attempts[0].questionId).toBe("r6-1");
    expect(parseTransfer({ route: "missing" })).toBeUndefined();
    expect(parseTransfer({ route: "constructor" })).toBeUndefined();
    expect(parseTransfer({ route: "__proto__" })).toBeUndefined();
  });
  it("summarises sampled evidence and exports only the local responses", () => {
    const q = transferQuestion("r1"),
      response = { value: "14", reason: "r2", condition: q.condition };
    const state = {
      ...initialTransfer(),
      attempts: [
        {
          questionId: q.id,
          reasonId: q.reasonId,
          variant: 0,
          response,
          grade: gradeTransfer(q, response),
          at: "2026-10-30T12:00:00Z",
        },
      ],
    };
    expect(transferSummary(state.attempts)).toEqual({
      attempts: 1,
      sampled: 1,
      correct: 0,
      valueErrors: 1,
      reasonErrors: 1,
      conditionErrors: 0,
    });
    expect(transferReport(state)).toContain("1/17 reasons sampled");
    expect(transferReport(state)).toContain("not a mastery judgement");
    expect(transferReport(state)).toContain("reason r2");
  });
});
