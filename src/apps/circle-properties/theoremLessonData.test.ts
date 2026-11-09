import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { buildReasonFlow, vocabularyView } from "./reasonFlow";
import {
  chordComparisonChecks,
  theoremLessons,
  type GuidedReasonId,
} from "./theoremLessonData";

const ids = reasons.slice(2).map((reason) => reason.id as GuidedReasonId);

describe("guided circle lessons", () => {
  it("covers every remaining textbook reason once", () => {
    expect(Object.keys(theoremLessons)).toEqual(ids);
  });

  it.each(ids)(
    "%s illustrates every selected term without showing conclusion markings and uses a fresh written case",
    (id) => {
      const lesson = theoremLessons[id];
      const diagram = buildReasonFlow(id);
      for (const term of lesson.terms) {
        const view = vocabularyView(diagram, term.marks);
        expect(view.selected.size, term.term).toBeGreaterThan(0);
        const visibleIds = new Set(view.marks.map((mark) => mark.id));
        for (const id of view.selected)
          expect(visibleIds.has(id), id).toBe(true);
        expect(visibleIds.size).toBe(view.marks.length);
        expect(view.marks.some((mark) => mark.stage === "result")).toBe(false);
      }
      expect(diagram.marks.some((mark) => mark.stage === "result")).toBe(true);
      expect(lesson.write.given).not.toBe(lesson.check.given);
      for (const task of [lesson.prediction, lesson.check, lesson.write]) {
        expect(new Set(task.options).size).toBe(3);
        expect(task.options[task.answer]).toBeTruthy();
        expect(new Set(task.feedback).size).toBe(3);
        expect(
          task.feedback.every((message) => message.trim().length > 0),
        ).toBe(true);
      }
    },
  );

  it("matches each Given-to-target case to its canonical reason, including all three chord directions", () => {
    const knownReasons = reasons.map(({ id }) => id);
    for (const reason of reasons) {
      const id = reason.id;
      const question =
        id === "r1" || id === "r2"
          ? chordComparisonChecks[id]
          : theoremLessons[id as GuidedReasonId].check;
      expect(question.options[question.answer]).toBe(id);
      for (const option of question.options)
        expect(knownReasons).toContain(option);
    }
  });
});
