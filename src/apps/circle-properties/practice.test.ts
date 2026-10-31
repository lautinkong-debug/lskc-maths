import { describe, expect, it } from "vitest";
import { labs, reasons, reasonQuestions } from "./content";
import {
  answerCard,
  blankHistory,
  DAY,
  feedbackFor,
  focusPractice,
  initialPractice,
  nextCard,
  nextRound,
  parsePractice,
  practiceSummary,
  questionFor,
} from "./practice";
import { pairedDiagramGeometry } from "./ReasonDiagram";

describe("reason practice content and diagnostics", () => {
  it("has two authored changed examples for all 23 questions and keeps all 17 reasons", () => {
    expect(new Set(reasonQuestions.map((q) => q.reasonId)).size).toBe(17);
    for (const base of reasonQuestions) {
      const variants = [0, 1, 2].map((variant) =>
        questionFor({ questionId: base.id, variant }),
      );
      expect(new Set(variants.map((q) => q.given)).size, base.id).toBe(3);
      for (const q of variants) {
        expect(q.reasonId).toBe(base.reasonId);
        expect(q.given).not.toMatch(/undefined|NaN/);
        expect(q.statement).not.toMatch(/undefined|NaN/);
        const responses = q.distractorIds.map((id) => feedbackFor(q, id));
        expect(new Set(responses).size, base.id).toBe(3);
        for (const response of responses)
          expect(response.length).toBeGreaterThan(80);
      }
    }
  });
  it("keeps major-arc explanations and circle-centre conditions in changed examples", () => {
    expect(
      questionFor({ questionId: "q13", variant: 2 }).explanation,
    ).toContain("reflex with reflex");
    expect(
      questionFor({ questionId: "q14", variant: 2 }).explanation,
    ).toContain("major with major");
    for (const id of ["q4", "q5", "q10", "q11", "q12", "q13"])
      for (const variant of [1, 2])
        expect(questionFor({ questionId: id, variant }).given).toContain(
          "centred at O",
        );
    expect(questionFor({ questionId: "q8", variant: 1 }).given).toContain(
      "A and B are on a circle",
    );
  });
  it.each([
    ["q1", 1, "7 cm"],
    ["q1", 2, "12 cm"],
    ["q6", 1, "106°"],
    ["q6", 2, "62°"],
    ["q18", 1, "250°"],
    ["q18", 2, "115°"],
    ["q16", 1, "1 : 3"],
    ["q16", 2, "2 : 1"],
    ["q17", 1, "2 : 5"],
    ["q17", 2, "3 : 2"],
  ])(
    "keeps the computed conclusion in %s variant %s",
    (id, variant, answer) => {
      expect(
        questionFor({ questionId: String(id), variant: Number(variant) })
          .statement,
      ).toContain(String(answer));
    },
  );
  it("distinguishes converse mistakes from wrong-output mistakes", () => {
    const q8 = questionFor({ questionId: "q8", variant: 0 });
    expect(feedbackFor(q8, "r9")).toContain("reverses this step");
    const q10 = questionFor({ questionId: "q10", variant: 0 });
    expect(feedbackFor(q10, "r12")).toContain(
      "starts with the right information",
    );
    expect(
      feedbackFor(questionFor({ questionId: "q17", variant: 0 }), "r16"),
    ).toContain("marked vertices P and Q");
  });
});

describe("reason diagram geometry", () => {
  for (const base of reasonQuestions.filter(
    (q) => Number(q.id.slice(1)) >= 10 && q.id !== "q19",
  ))
    for (const variant of [0, 1, 2]) {
      it(`${base.id} variant ${variant}: distinct endpoints and matching circumference angles`, () => {
        const q = questionFor({ questionId: base.id, variant }),
          scene = pairedDiagramGeometry(q);
        const circumference = q.id === "q17" || Number(q.id.slice(1)) >= 20;
        const pts = Object.entries(scene.points).filter(
          ([name]) => circumference || !["P", "Q"].includes(name),
        );
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 1; j < pts.length; j++)
            expect(
              Math.hypot(pts[i][1].x - pts[j][1].x, pts[i][1].y - pts[j][1].y),
              `${pts[i][0]} and ${pts[j][0]}`,
            ).toBeGreaterThan(10);
        if (circumference) {
          const inArc = (angle: number, start: number, sweep: number) =>
            (angle - start + 720) % 360 < sweep;
          expect(inArc(scene.pBearing, scene.startA, scene.thetaA)).toBe(false);
          expect(inArc(scene.qBearing, scene.startB, scene.thetaB)).toBe(false);
          const angle = (
            a: { x: number; y: number },
            p: { x: number; y: number },
            b: { x: number; y: number },
          ) =>
            (Math.acos(
              ((a.x - p.x) * (b.x - p.x) + (a.y - p.y) * (b.y - p.y)) /
                (Math.hypot(a.x - p.x, a.y - p.y) *
                  Math.hypot(b.x - p.x, b.y - p.y)),
            ) *
              180) /
            Math.PI;
          expect(
            angle(scene.points.A, scene.points.P, scene.points.B),
          ).toBeCloseTo(scene.thetaA / 2, 8);
          expect(
            angle(scene.points.C, scene.points.Q, scene.points.D),
          ).toBeCloseTo(scene.thetaB / 2, 8);
        }
        if (q.given.includes("major arc") && !circumference)
          expect(scene.thetaA).toBeGreaterThan(180);
      });
    }
});

describe("practice queue and evidence", () => {
  it("preserves a current question, revealed choices and error record on restoration", () => {
    let s = initialPractice();
    s = { ...s, revealed: true };
    s = answerCard(s, "r2", 1000);
    const restored = parsePractice(JSON.parse(JSON.stringify(s)));
    expect(restored).toEqual(s);
    expect(restored?.history.r1.mistakes).toBe(1);
    expect(answerCard(s, "r1", 1100)).toBe(s);
  });
  it("starts every contextual practice with a related reason", () => {
    for (const lab of labs) {
      const s = focusPractice(initialPractice(), lab.id, 3);
      expect(lab.reasonIds).toContain(questionFor(s.queue[0]).reasonId);
      expect(s.lastFocusToken).toBe(3);
      expect(s.focusLab).toBe(lab.id);
    }
  });
  it("visits all 23 original questions across short rounds", () => {
    let s = initialPractice();
    const seen = new Set<string>();
    for (let round = 0; round < 5; round++) {
      while (s.index < s.queue.length) {
        seen.add(s.queue[s.index].questionId);
        s = nextCard(
          answerCard(s, questionFor(s.queue[s.index]).reasonId, 1000),
        );
      }
      if (round < 4) s = nextRound(s, 1000);
    }
    expect(seen.size).toBe(23);
    expect(practiceSummary(s.history, 1000).correctOnce).toBe(17);
    expect(practiceSummary(s.history, 1000).reviewedLater).toBe(0);
  });
  it("retries an error in a different example after intervening answers", () => {
    let s = initialPractice();
    s = nextCard(answerCard(s, "r2", 1000));
    for (let i = 0; i < 4; i++)
      s = nextCard(answerCard(s, questionFor(s.queue[s.index]).reasonId, 1000));
    s = nextRound(s, 1000);
    expect(s.queue[0]).toEqual({ questionId: "q1", variant: 1 });
    expect(questionFor(s.queue[0]).given).not.toBe(reasonQuestions[0].given);
  });
  it("does not immediately retry the last error in a round", () => {
    let s = initialPractice();
    for (let i = 0; i < 4; i++)
      s = nextCard(answerCard(s, questionFor(s.queue[s.index]).reasonId, 1000));
    s = nextCard(answerCard(s, "r4", 1000));
    s = nextRound(s, 1000);
    expect(s.queue.some((c) => c.questionId === "q5")).toBe(false);
  });
  it("keeps practice moving when every remaining example is waiting for intervening answers", () => {
    const state = {
      ...initialPractice(),
      queue: [
        { questionId: "q13", variant: 0 },
        { questionId: "q14", variant: 0 },
        { questionId: "q23", variant: 1 },
      ],
      index: 3,
      answeredCount: 440,
      remaining: [{ questionId: "q23", variant: 2 }],
      missed: [
        { questionId: "q13", variant: 1, after: 441 },
        { questionId: "q14", variant: 1, after: 442 },
        { questionId: "q23", variant: 2, after: 443 },
      ],
      history: { r1: { ...blankHistory(), seen: 8, correct: 5, mistakes: 3 } },
    };
    let next = nextRound(state, 1000);
    expect(next.queue).toHaveLength(5);
    expect(
      next.queue.every((c) => !["q13", "q14", "q23"].includes(c.questionId)),
    ).toBe(true);
    expect(next.missed).toEqual(state.missed);
    expect(parsePractice(JSON.parse(JSON.stringify(next)))?.history).toEqual(
      state.history,
    );
    while (next.index < next.queue.length)
      next = nextCard(
        answerCard(next, questionFor(next.queue[next.index]).reasonId, 1000),
      );
    const resumed = nextRound(next, 1000);
    expect(resumed.queue.slice(0, 3).map((c) => c.questionId)).toEqual([
      "q13",
      "q14",
      "q23",
    ]);
  });
  it("requires a changed example on a later day for later-review evidence", () => {
    const today = 1000;
    let s = answerCard(initialPractice(), "r1", today);
    s = nextRound(s, today + DAY, true);
    expect(s.queue[0]).toEqual({ questionId: "q1", variant: 1 });
    s = answerCard(s, "r1", today + DAY);
    expect(s.history.r1.reviewedLater).toBe(1);
    expect(s.history.r1.dueAt).toBe(today + 4 * DAY);
    let same = answerCard(initialPractice(), "r1", today);
    same = { ...same, answer: null };
    same = answerCard(same, "r1", today + DAY);
    expect(same.history.r1.reviewedLater).toBe(0);
  });
  it("keeps legacy recognition without inventing dates or later-review success", () => {
    const s = initialPractice(["r1", "r7", "fake"]);
    expect(practiceSummary(s.history, 1000).correctOnce).toBe(2);
    expect(s.history.r1.firstCorrectAt).toBeNull();
    expect(s.history.r1.lastCorrectAt).toBeNull();
    expect(practiceSummary(s.history, 1000).reviewedLater).toBe(0);
  });
  it("rejects corrupt schemas and bounds untrusted saved arrays", () => {
    expect(parsePractice(null)).toBeUndefined();
    expect(parsePractice({ version: 1 })).toBeUndefined();
    const saved = {
      ...initialPractice(),
      queue: [
        { questionId: "bogus", variant: 0 },
        { questionId: "q1", variant: 99 },
      ],
    };
    expect(parsePractice(saved)).toBeUndefined();
    const s = parsePractice({
      ...initialPractice(),
      index: 999,
      roundCorrect: 999,
      history: {
        r1: { ...blankHistory(), mistakes: Infinity },
        r99: blankHistory(),
      },
    })!;
    expect(s.index).toBe(5);
    expect(s.roundCorrect).toBe(5);
    expect(s.history.r1.mistakes).toBe(0);
    expect(s.history.r99).toBeUndefined();
    expect(
      Object.keys(s.history).every((id) => reasons.some((r) => r.id === id)),
    ).toBe(true);
  });
});
