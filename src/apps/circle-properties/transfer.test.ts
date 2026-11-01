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
  navigateTransfer,
  blankTransferResponse,
} from "./transfer";

describe("new-diagram transfer check", () => {
  it.each(reasons)(
    "generates reproducible additional cases with valid measures for $id",
    (reason) => {
      const samples = new Set<string>();
      for (let variant = 3; variant < 80; variant++) {
        const q = transferQuestion(reason.id, variant);
        expect(q).toEqual(transferQuestion(reason.id, variant));
        expect(Number.isFinite(q.answer)).toBe(true);
        expect(
          gradeTransfer(q, {
            value: String(q.answer),
            reason: reason.id,
            condition: q.condition,
          }).correct,
        ).toBe(true);
        samples.add(JSON.stringify([q.given, q.diagram]));
        if (q.lab === "ratios") {
          const arcs = transferArcConstruction(q);
          expect(arcs.firstSweep + arcs.secondSweep).toBeLessThan(360);
          expect(q.answer / q.diagram.other).toBeCloseTo(
            arcs.firstSweep / arcs.secondSweep,
            10,
          );
        }
        if (reason.id === "r1") expect(q.answer * 2).toBe(q.diagram.value);
        if (reason.id === "r3")
          expect(q.answer * 2).toBe(q.diagram.value + q.diagram.other);
        if (reason.id === "r6") expect(q.answer * 2).toBe(q.diagram.angle);
        if (reason.id === "r9") expect(q.answer).toBe(2 * q.diagram.value);
        if (reason.id === "r2" || reason.id === "r8") expect(q.answer).toBe(90);
      }
      expect(samples.size).toBeGreaterThan(60);
    },
  );
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

describe("transfer question navigation", () => {
  const first = transferQuestion("r1");
  const answered = {
    value: "7",
    reason: "r1",
    condition: first.condition,
  };
  const attempt = {
    questionId: first.id,
    reasonId: first.reasonId,
    variant: 0,
    response: answered,
    grade: gradeTransfer(first, answered),
    at: "2026-10-31T18:00:00Z",
  };

  it("returns from Q2 to submitted Q1 with the same feedback and no extra grade", () => {
    const initial = {
      ...initialTransfer(),
      response: answered,
      submitted: true,
      attempts: [attempt],
    };
    const second = navigateTransfer(initial, 1);
    expect(second.index).toBe(1);
    expect(second.response).toEqual(blankTransferResponse());
    expect(second.submitted).toBe(false);
    const returned = navigateTransfer(second, 0);
    expect(returned.response).toEqual(answered);
    expect(returned.submitted).toBe(true);
    expect(gradeTransfer(first, returned.response)).toEqual(attempt.grade);
    expect(returned.attempts).toBe(initial.attempts);
    expect(initial.drafts).toEqual({});
  });

  it("keeps unfinished edits to Q2 through back, refresh and forward", () => {
    const second = navigateTransfer(initialTransfer(), 1);
    second.response = { value: "2.", reason: "r5", condition: "" };
    const firstAgain = navigateTransfer(second, 0);
    const refreshed = parseTransfer(JSON.parse(JSON.stringify(firstAgain)))!;
    const returned = navigateTransfer(refreshed, 1);
    expect(returned.response).toEqual(second.response);
    expect(returned.submitted).toBe(false);
    expect(returned.attempts).toEqual([]);
  });

  it("prefers the latest unsubmitted edit over an earlier submitted attempt", () => {
    const edited = {
      ...initialTransfer(),
      response: { ...answered, value: "8" },
      submitted: false,
      attempts: [attempt],
    };
    const returned = navigateTransfer(navigateTransfer(edited, 1), 0);
    expect(returned.response.value).toBe("8");
    expect(returned.submitted).toBe(false);
    expect(returned.attempts).toHaveLength(1);
  });

  it("migrates legacy submitted answers once, preserving the most recent attempt", () => {
    const state = {
      ...initialTransfer(),
      index: 1,
      drafts: undefined,
      attempts: [
        attempt,
        { ...attempt, response: { ...answered, value: "14" } },
      ],
    };
    const parsed = parseTransfer(state)!;
    expect(parsed.drafts?.[first.id]?.response.value).toBe("14");
    const returned = navigateTransfer(parsed, 0);
    expect(returned.response.value).toBe("14");
    expect(returned.submitted).toBe(true);
    expect(returned.attempts).toHaveLength(2);
  });

  it("does not revive old answers after an explicit new-round draft reset", () => {
    const fresh = parseTransfer({
      ...initialTransfer(),
      index: 1,
      drafts: {},
      attempts: [attempt],
    })!;
    const returned = navigateTransfer(fresh, 0);
    expect(returned.response).toEqual(blankTransferResponse());
    expect(returned.submitted).toBe(false);
    expect(returned.attempts).toHaveLength(1);
  });

  it("keeps the three question variants separate", () => {
    const firstVariant = navigateTransfer(
      { ...initialTransfer(), response: answered, submitted: true },
      1,
    );
    const otherVariant = navigateTransfer({ ...firstVariant, variant: 1 }, 0);
    expect(otherVariant.response).toEqual(blankTransferResponse());
    expect(otherVariant.submitted).toBe(false);
    expect(otherVariant.drafts?.[first.id]?.response).toEqual(answered);
  });

  it("can review a question from the round-complete screen", () => {
    const filled = {
      ...initialTransfer(),
      response: answered,
      submitted: true,
    };
    const complete = navigateTransfer(filled, 7);
    expect(complete.index).toBe(7);
    expect(navigateTransfer(complete, 0).response).toEqual(answered);
    for (const index of [-1, 8, NaN, 0.5])
      expect(navigateTransfer(filled, index)).toBe(filled);
  });

  it("sanitises malformed drafts, accepts only known questions and caps response sizes", () => {
    const parsed = parseTransfer({
      ...initialTransfer(),
      drafts: {
        "r1-0": {
          response: {
            value: "x".repeat(100),
            reason: "missing",
            condition: "x".repeat(500),
          },
          submitted: true,
        },
        "r1-1": { response: null, submitted: true },
        "r1-2": { response: answered, submitted: "true" },
        "r2-0": [],
        "r99-0": { response: answered, submitted: true },
        "r1-3": { response: answered, submitted: true },
      },
    })!;
    expect(Object.keys(parsed.drafts!)).toEqual(["r1-0"]);
    expect(parsed.drafts?.["r1-0"].response).toEqual({
      value: "x".repeat(30),
      reason: "",
      condition: "x".repeat(250),
    });
    expect(parseTransfer({ ...initialTransfer(), drafts: [] })?.drafts).toEqual(
      {},
    );
  });
});
