import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ChordSketch from "./ChordSketch";
import {
  chordLessonDisplay,
  chordLessonStarts,
  initialChordLesson,
  nAtMidpoint,
  parseChordLesson,
  solutionBlanks,
  sortCards,
  writeItems,
} from "./chordLessonData";
import { reasonParts, reasons } from "./content";
import { defaults } from "./geometry";
import { transferQuestion } from "./transfer";

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

  it("lets the Show and Hide buttons override either reading", () => {
    const lesson = initialChordLesson();
    expect(chordLessonDisplay(lesson, { lengths: true })).toEqual({
      lengths: true,
      angles: true,
    });
    expect(chordLessonDisplay(lesson, { angles: false })).toEqual({
      lengths: false,
      angles: false,
    });
  });

  it("mixes 16.1 and 16.2 questions and uses both in the full solutions", () => {
    const blanks = writeItems.flatMap(solutionBlanks);
    for (const answers of [
      sortCards.map((card) => card.answer),
      blanks.map((blank) => blank.answer),
    ]) {
      expect(answers).toContain("r1");
      expect(answers).toContain("r2");
    }
    expect(new Set(sortCards.map((card) => card.id)).size).toBe(
      sortCards.length,
    );
  });

  it("hides at least one reason per solution, each with its answer among the choices", () => {
    const blanks = writeItems.flatMap(solutionBlanks);
    for (const item of writeItems)
      expect(solutionBlanks(item).length).toBeGreaterThan(0);
    for (const blank of blanks) expect(blank.choices).toContain(blank.answer);
    expect(new Set(blanks.map((blank) => blank.id)).size).toBe(blanks.length);
    expect(blanks.map((blank) => blank.answer)).toEqual(
      expect.arrayContaining(["angleSum", "pyth"]),
    );
  });

  it("restores saved progress and drops anything unknown", () => {
    const saved = {
      open: false,
      step: 3,
      found: [true, true],
      sort: { s1: "r1", s2: "r9", fake: "r1" },
      write: { w1a: "r2", w2b: "pyth", w3b: "r1", w1: "r1" },
    };
    expect(parseChordLesson(JSON.parse(JSON.stringify(saved)))).toEqual({
      open: false,
      step: 3,
      found: [true, true],
      sort: { s1: "r1" },
      write: { w1a: "r2", w2b: "pyth" },
    });
    expect(parseChordLesson({ step: 9, found: "yes" })).toEqual(
      initialChordLesson(),
    );
    expect(parseChordLesson(null)).toBeUndefined();
  });

  it("draws only the given fact, so a diagram never answers the question", () => {
    for (const { sketch } of [...sortCards, ...writeItems]) {
      const html = renderToStaticMarkup(
        createElement(ChordSketch, { sketch, label: "Diagram" }),
      );
      const rightAngles = html.match(/data-given-mark="right-angle"/g) ?? [];
      const ticks = html.match(/data-given-mark="equal-tick"/g) ?? [];
      expect(html).not.toContain("NaN");
      if (sketch.given === "perpendicular") {
        expect(rightAngles).toHaveLength(1);
        expect(ticks).toHaveLength(0);
      } else {
        expect(rightAngles).toHaveLength(0);
        expect(ticks).toHaveLength(2);
      }
    }
  });
});

describe("highlighted reasons", () => {
  it("splits the two theorems into condition and result", () => {
    const parts = (id: string) =>
      reasonParts(reasons.find((reason) => reason.id === id)!);
    expect(parts("r1")).toEqual({
      condition: "line from centre ⊥ chord",
      result: "bisects chord",
    });
    expect(parts("r2")).toEqual({
      condition: "line from centre to mid-pt. of chord",
      result: "⊥ chord",
    });
    expect(parts("r7")).toBeNull();
  });

  it("keeps every word of a split reason, in order", () => {
    for (const reason of reasons) {
      const parts = reasonParts(reason);
      if (parts)
        expect(`${parts.condition} ${parts.result}`).toBe(reason.label);
    }
  });
});

describe("Reasons Relay wording", () => {
  it("names x with its degree sign or unit, then asks for x", () => {
    for (const reason of reasons) {
      if (reason.id === "r3") continue;
      for (const variant of [0, 5]) {
        const { ask, unit } = transferQuestion(reason.id, variant);
        expect(ask).toMatch(
          unit === "°" ? /= x°\. Find x\.$/ : /= x cm\. Find x\.$/,
        );
      }
    }
  });
});
