import { describe, expect, it } from "vitest";
import {
  chordLessonDisplay,
  chordLessonStarts,
  initialChordLesson,
  nAtMidpoint,
  parseChordLesson,
  sortCards,
  writeItems,
} from "./chordLessonData";
import { defaults } from "./geometry";

describe("Topic 1 guided lesson: 16.1 or 16.2", () => {
  it("starts both diagram steps with N away from the mid-point", () => {
    for (const start of Object.values(chordLessonStarts))
      expect(nAtMidpoint(start)).toBe(false);
    expect(nAtMidpoint({ ...defaults.bisector, secondary: 0 })).toBe(true);
    expect(nAtMidpoint({ ...chordLessonStarts[1], secondary: 0 })).toBe(true);
  });

  it("shows the given reading first and the result only once it is found", () => {
    const lesson = initialChordLesson();
    expect(chordLessonDisplay(lesson)).toEqual({
      lengths: false,
      angles: true,
    });
    expect(chordLessonDisplay({ ...lesson, found: [true, false] })).toEqual({
      lengths: true,
      angles: true,
    });
    expect(chordLessonDisplay({ ...lesson, step: 1 })).toEqual({
      lengths: true,
      angles: false,
    });
    expect(
      chordLessonDisplay({ ...lesson, step: 1, found: [true, true] }),
    ).toEqual({ lengths: true, angles: true });
    expect(chordLessonDisplay({ ...lesson, step: 2 })).toEqual({
      lengths: true,
      angles: true,
    });
  });

  it("mixes 16.1 and 16.2 questions and uses both in the written lines", () => {
    for (const set of [sortCards, writeItems]) {
      const answers = set.map((item) => item.answer);
      expect(answers).toContain("r1");
      expect(answers).toContain("r2");
    }
    expect(new Set(sortCards.map((card) => card.id)).size).toBe(
      sortCards.length,
    );
  });

  it("restores saved progress and drops anything unknown", () => {
    const saved = {
      open: false,
      step: 3,
      found: [true, true],
      sort: { s1: "r1", s2: "r9", fake: "r1" },
      write: { w1: "r2" },
    };
    expect(parseChordLesson(JSON.parse(JSON.stringify(saved)))).toEqual({
      open: false,
      step: 3,
      found: [true, true],
      sort: { s1: "r1" },
      write: { w1: "r2" },
    });
    expect(parseChordLesson({ step: 9, found: "yes" })).toEqual(
      initialChordLesson(),
    );
    expect(parseChordLesson(null)).toBeUndefined();
  });
});
