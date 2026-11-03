import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { parseNotation } from "./mathNotation";
import { allowsNegativeAnswer } from "./transfer";
import {
  blankReasonChallengeResponse,
  challengeGroups,
  createChallengeQueue,
  getReasonChallenge,
  gradeReasonChallenge,
  shuffleChallengeChoices,
} from "./reasonChallenge";

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

describe("numerical circle reason challenge", () => {
  for (const reason of reasons) {
    for (let variant = 0; variant < 3; variant++) {
      it(`links all four response fields for ${reason.number} case ${variant + 1}`, () => {
        const c = getReasonChallenge(reason.id, variant);
        expect(c.q.answer).toBe(expected[reason.id][variant]);
        const response = {
          value: String(expected[reason.id][variant]),
          condition: c.q.condition,
          target: c.target,
          reason: c.q.reasonId,
        };
        const grade = gradeReasonChallenge(c, response);
        expect(grade).toMatchObject({
          value: true,
          condition: true,
          target: true,
          reason: true,
          correct: true,
          score: 100,
        });
        expect(new Set([c.target, ...c.wrongTargets]).size).toBe(3);
        expect(c.reasonChoices).toHaveLength(3);
        expect(new Set(c.reasonChoices).size).toBe(3);
        expect(c.reasonChoices).toContain(c.q.reasonId);
        for (const wrongReason of c.reasonChoices.filter(
          (id) => id !== c.q.reasonId,
        )) {
          expect(c.feedbackByReasonId[wrongReason]).toContain(c.target);
          expect(c.feedbackByReasonId[wrongReason]).toContain(
            "A different route may need extra steps.",
          );
        }
      });
    }
  }

  it("awards more weight to the target and reason than to the number", () => {
    const c = getReasonChallenge("r1");
    const correct = {
      value: "7",
      condition: c.q.condition,
      target: c.target,
      reason: "r1",
    };
    expect(gradeReasonChallenge(c, { ...correct, value: "14" })).toMatchObject({
      value: false,
      correct: false,
      score: 80,
    });
    expect(
      gradeReasonChallenge(c, {
        ...correct,
        condition: c.q.wrongConditions[0],
      }),
    ).toMatchObject({ condition: false, correct: false, score: 80 });
    expect(
      gradeReasonChallenge(c, { ...correct, target: c.wrongTargets[0] }),
    ).toMatchObject({ target: false, correct: false, score: 70 });
    expect(gradeReasonChallenge(c, { ...correct, reason: "r2" })).toMatchObject(
      { reason: false, correct: false, score: 70 },
    );
    expect(
      gradeReasonChallenge(c, {
        ...blankReasonChallengeResponse(),
        value: "7",
      }),
    ).toMatchObject({ correct: false, score: 20 });
    expect(gradeReasonChallenge(c, blankReasonChallengeResponse()).score).toBe(
      0,
    );
  });

  it("keeps repair feedback in separate sentences without a false x ratio", () => {
    for (const reason of reasons) {
      for (let variant = 0; variant < 6; variant++) {
        const c = getReasonChallenge(reason.id, variant);
        const wrongReasons = c.reasonChoices.filter(
          (id) => id !== c.q.reasonId,
        );
        const messages = wrongReasons.flatMap(
          (wrongReason) =>
            gradeReasonChallenge(c, {
              value: "",
              condition: "",
              target: c.wrongTargets[0],
              reason: wrongReason,
            }).messages,
        );
        for (const message of messages) {
          // Each embedded given, conclusion or target ends before the next sentence.
          expect(message).not.toMatch(
            /[^.!?]\s+(?:It directly establishes|For this question|A different route|A given fact)/,
          );
          for (const part of parseNotation(message))
            if (part.kind === "fraction") {
              expect(part.numerator).not.toBe("x");
              expect(part.denominator).not.toBe("x");
            }
        }
      }
    }
  });

  it("offers a keyboard with a minus sign for every generated negative answer", () => {
    let negatives = 0;
    for (const reason of reasons)
      for (let variant = 0; variant < 200; variant++) {
        const { q } = getReasonChallenge(reason.id, variant);
        if (q.answer < 0) {
          negatives++;
          expect(allowsNegativeAnswer(q)).toBe(true);
        }
      }
    expect(negatives).toBeGreaterThan(0);
    expect(allowsNegativeAnswer(getReasonChallenge("r1").q)).toBe(false);
  });

  it("distinguishes a given fact from the direct relation being established", () => {
    expect(getReasonChallenge("r1").target).toBe("AN = NB");
    expect(getReasonChallenge("r2").target).toBe("ON ⊥ AB");
    expect(getReasonChallenge("r3").target).toBe(
      "The centre O lies on the perpendicular bisector of AB.",
    );
    expect(getReasonChallenge("r4").target).toBe("OM = ON");
    expect(getReasonChallenge("r5").target).toBe("AB = CD");
    const c = getReasonChallenge("r10");
    const grade = gradeReasonChallenge(c, {
      value: String(c.q.answer),
      condition: c.q.condition,
      target: "AB = CD",
      reason: "r10",
    });
    expect(grade.target).toBe(false);
    expect(grade.messages.join(" ")).toContain("different consequence");
  });

  it("uses the numerical diagram's P and Q labels instead of unrelated exploration labels", () => {
    expect(getReasonChallenge("r6").target).toBe("∠AOB = 2 × ∠APB");
    expect(getReasonChallenge("r8").target).toBe("∠APB = 90°");
    expect(getReasonChallenge("r9").target).toBe("AB is a diameter.");
    expect(getReasonChallenge("r16").target).toBe(
      "\\frac{arc AB}{arc CD} = \\frac{∠AOB}{∠COD}",
    );
    expect(getReasonChallenge("r17").target).toBe(
      "\\frac{arc AB}{arc CD} = \\frac{∠APB}{∠CQD}",
    );
    for (const id of ["r16", "r17"]) {
      for (let variant = 0; variant < 3; variant++) {
        const { q } = getReasonChallenge(id, variant);
        expect(q.answer / q.diagram.other).toBeCloseTo(
          q.diagram.angle / q.diagram.value,
          10,
        );
      }
    }
  });

  it("does not accept blank or malformed numbers even with correct reasoning", () => {
    const c = getReasonChallenge("r1");
    for (const value of ["", " ", "Infinity", "NaN", "0x7"]) {
      expect(
        gradeReasonChallenge(c, {
          value,
          condition: c.q.condition,
          target: c.target,
          reason: c.q.reasonId,
        }).value,
      ).toBe(false);
    }
  });
});

describe("progressive and mixed reason queues", () => {
  it("groups the confusing directions together and covers every reason", () => {
    expect(challengeGroups.map((group) => group.reasonIds.length)).toEqual([
      3, 2, 1, 1, 2, 6, 2, 17,
    ]);
    expect(challengeGroups[0].reasonIds).toEqual(["r1", "r2", "r3"]);
    expect(challengeGroups[6].reasonIds).toEqual(["r16", "r17"]);
    expect(
      new Set(challengeGroups.slice(0, 7).flatMap((group) => group.reasonIds)),
    ).toEqual(new Set(reasons.map((reason) => reason.id)));
  });

  it("uses each group reason exactly once and preserves the queue on replay of its seed", () => {
    for (const group of challengeGroups) {
      const queue = createChallengeQueue(group.id, 24680);
      expect(queue).toEqual(createChallengeQueue(group.id, 24680));
      expect(queue).toHaveLength(group.reasonIds.length);
      expect(new Set(queue)).toEqual(new Set(group.reasonIds));
    }
    expect(createChallengeQueue("mixed", 24680)).not.toEqual(
      createChallengeQueue("mixed", 13579),
    );
  });

  it("varies correct-answer positions without mutating choice data", () => {
    const source = Object.freeze(["correct", "other", "third"]);
    const positions = Array.from({ length: 17 }, (_, index) =>
      shuffleChallengeChoices(source, index + 1).indexOf("correct"),
    );
    expect(new Set(positions).size).toBe(3);
    expect(source).toEqual(["correct", "other", "third"]);
  });
});
