import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { theoremLessons, type GuidedReasonId } from "./theoremLessonData";
import {
  getCaseFamily,
  getGuideCase,
  writtenReasonQuestion,
} from "./theoremCaseBank";

const reasonIds = reasons.map((reason) => reason.id);
const guidedIds = Object.keys(theoremLessons) as GuidedReasonId[];
const caseKeys = [...new Set(guidedIds.flatMap(getCaseFamily))];

describe("condition checks and fresh practice", () => {
  it("pairs each theorem family with a missing condition", () => {
    for (const id of guidedIds) {
      const family = getCaseFamily(id);
      expect(family).toContain(id);
      expect(family.filter((key) => key.startsWith("missing-"))).toHaveLength(
        1,
      );
    }
    expect(caseKeys.filter((key) => !key.startsWith("missing-"))).toHaveLength(
      17,
    );
  });

  it.each(caseKeys)(
    "%s has distinct replayable cases with a single defensible choice",
    (key) => {
      let previous = "";
      for (let variant = 0; variant < 10; variant++) {
        const question = getGuideCase(key, variant);
        expect(getGuideCase(key, variant)).toEqual(question);
        const wording = question.given + question.target;
        expect(wording).not.toBe(previous);
        previous = wording;
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain("insufficient");
        expect(question.options[question.answer]).toBe(
          key.startsWith("missing-") ? "insufficient" : key,
        );
        expect(question.feedback).toHaveLength(question.options.length);
        expect(
          question.feedback.every((message) => message.trim().length > 0),
        ).toBe(true);
        expect(
          question.options.every(
            (choice) => choice === "insufficient" || reasonIds.includes(choice),
          ),
        ).toBe(true);
      }
    },
  );

  it.each(guidedIds)(
    "%s requires a reason with its own feedback for the written case",
    (id) => {
      const proof = writtenReasonQuestion(id);
      expect(proof.options[proof.answer]).toBe(id);
      expect(new Set(proof.options).size).toBe(3);
      expect(new Set(proof.feedback).size).toBe(3);
      expect(proof.feedback[proof.answer]).not.toBe(
        theoremLessons[id].check.feedback[theoremLessons[id].check.answer],
      );
    },
  );
});
