import { describe, expect, it } from "vitest";
import {
  advanceGuideCase,
  answerGuideCase,
  anotherGuideShape,
  restoreGuide,
  startGuide,
} from "./theoremGuideSession";
import { getGuideCase } from "./theoremCaseBank";
import { reasonMeasurements } from "./reasonExploration";

describe("theorem practice history", () => {
  it("keeps the single-chord and intersection predictions independent across visits", () => {
    const oldGuide = restoreGuide("r3", { stage: 2, prediction: 1 })!;
    expect(oldGuide.secondChordShown).toBe(false);
    expect(oldGuide.intersectionPrediction).toBeNull();
    const twoChords = restoreGuide("r3", {
      ...oldGuide,
      secondChordShown: true,
      intersectionPrediction: 0,
    })!;
    expect(twoChords).toMatchObject({
      stage: 2,
      prediction: 1,
      intersectionPrediction: 0,
      secondChordShown: true,
    });
    expect(
      restoreGuide("r3", { ...twoChords, intersectionPrediction: 7 })
        ?.intersectionPrediction,
    ).toBeNull();
    expect(startGuide("r3").intersectionPrediction).toBeNull();
    expect(restoreGuide("r4", twoChords)).not.toHaveProperty(
      "secondChordShown",
    );
  });
  it("restores an earlier student's active card, answers and writing without inferring a written reason", () => {
    const restored = restoreGuide("r4", {
      stage: 4,
      caseId: "r5",
      answers: { r4: 2, r5: 1, r8: 1 },
      written: 1,
      note: "My working",
    })!;
    expect(restored.history.map((r) => r.id)).toEqual(["r4", "r5"]);
    expect(restored.cursor).toBe(1);
    expect(restored.history[1].firstError).toBe(1);
    expect(restored.written).toBe(1);
    expect(restored.writtenReason).toBeNull();
    expect(restored.note).toBe("My working");
  });
  it("keeps first-error evidence after correction and inserts an unanswered similar card without deleting future answers", () => {
    let state = restoreGuide("r4", { caseId: "r4" })!;
    const item = getGuideCase("r4", 0);
    const wrong = (item.answer + 1) % item.options.length;
    state = answerGuideCase(answerGuideCase(state, wrong), item.answer);
    state = advanceGuideCase("r4", state);
    const later = state.history[1];
    state = advanceGuideCase("r4", { ...state, cursor: 0 }, true);
    expect(state.history[0]).toMatchObject({
      selected: item.answer,
      firstError: wrong,
    });
    expect(state.history[1]).toEqual({
      id: "r4",
      variant: 1,
      selected: null,
      firstError: null,
    });
    expect(getGuideCase("r4", 1).given).not.toEqual(item.given);
    expect(state.history[2]).toEqual(later);
    expect(advanceGuideCase("r4", state).cursor).toBe(2);
    expect(restoreGuide("r4", JSON.parse(JSON.stringify(state)))).toEqual(
      state,
    );
  });
  it("saves the fourth choice and can review a missing-condition case", () => {
    const initial = restoreGuide("r10", {
      history: [
        { id: "missing-arc", variant: 0, selected: null, firstError: null },
      ],
      cursor: 0,
    })!;
    const answered = answerGuideCase(initial, 3);
    expect(restoreGuide("r10", answered)?.history[0]).toEqual({
      id: "missing-arc",
      variant: 0,
      selected: 3,
      firstError: null,
    });
  });
  it("alternates minor and reflex centre turns with the tap control", () => {
    const minor = startGuide("r6").shape;
    const reflex = anotherGuideShape("r6", minor);
    expect(reasonMeasurements("r6", minor)[1].value).toBeCloseTo(120);
    expect(reasonMeasurements("r6", reflex)[1].value).toBeCloseTo(240);
    expect(
      reasonMeasurements("r6", anotherGuideShape("r6", reflex))[1].value,
    ).toBeCloseTo(120);
  });
});
