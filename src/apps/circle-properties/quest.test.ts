import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { questLevels, shuffledQuestChoices } from "./quest";
import { reasonWorking } from "./reasonWorkingData";

describe("Circle Quest curriculum coverage", () => {
  it("provides all 17 reasons in textbook order, with one unambiguous answer per round", () => {
    expect(questLevels.map((level) => level.reasonId)).toEqual(
      reasons.map((reason) => reason.id),
    );
    expect(new Set(questLevels.map((level) => level.id)).size).toBe(17);
    for (const [index, level] of questLevels.entries()) {
      expect(level.level).toBe(index + 1);
      for (const options of [level.conclusionChoices, level.conditionChoices]) {
        expect(options).toHaveLength(3);
        expect(options.filter((choice) => choice.correct)).toHaveLength(1);
        expect(new Set(options.map((choice) => choice.text)).size).toBe(
          options.length,
        );
      }
      expect(
        level.conclusionChoices.find((choice) => choice.correct)?.text,
      ).toBe(reasonWorking[level.reasonId].conclusion);
      expect(level.reasonLabel).toBe(reasons[index].label);
      expect(level.proofSteps.map((step) => step.kind)).toEqual([
        "given",
        "condition",
        "conclusion",
      ]);
      expect(level.proofSteps[2].text).toContain(`(${level.reasonLabel})`);
      expect(level.given).toContain(reasonWorking[level.reasonId].givens[0]);
    }
  });

  it("gives every incorrect reason a targeted explanation and a repair that exists", () => {
    const ids = new Set(reasons.map((reason) => reason.id));
    for (const level of questLevels) {
      expect(new Set(level.distractorReasonIds).size).toBe(2);
      for (const id of level.distractorReasonIds) {
        expect(ids.has(id)).toBe(true);
        expect(id).not.toBe(level.reasonId);
        expect(level.feedbackByReasonId[id].length).toBeGreaterThan(35);
      }
      expect(level.distractorReasonIds).toContain(
        level.detective.erroneousReasonId,
      );
      expect(level.detective.feedback).toBe(
        level.feedbackByReasonId[level.detective.erroneousReasonId],
      );
    }
  });

  it("keeps converse and centre-versus-circumference missions distinct", () => {
    const byId = Object.fromEntries(
      questLevels.map((level) => [level.id, level]),
    );
    expect(byId.r1.given).toContain("ON ⊥ AB.");
    expect(byId.r1.given).not.toContain("AN = NB");
    expect(byId.r1.conclusion).toBe("AN = NB");
    expect(byId.r2.given).toContain("AN = NB");
    expect(byId.r2.given).not.toContain("ON ⊥ AB");
    expect(byId.r2.conclusion).toBe("ON ⊥ AB");
    for (const id of ["r1", "r2"])
      expect(byId[id].given).toContain("AB is not a diameter.");
    expect(byId.r3.given).not.toContain("O is the centre");
    expect(byId.r3.conclusion).toBe("The centre O lies on line ℓ.");
    expect(byId.r8.given).toContain("AB is a diameter");
    expect(byId.r9.given).not.toContain("AB is a diameter");
    expect(byId.r9.given).toContain("∠ACB = 90°");
    expect(byId.r16.given).toContain("centre angles");
    expect(byId.r17.given).toContain("circumference angles");
    for (const id of ["r16", "r17"]) {
      expect(byId[id].conclusion).toBe("\\frac{arc AB}{arc CD} = \\frac{θ}{φ}");
      expect(
        byId[id].conclusionChoices.find((choice) =>
          choice.text.startsWith("\\frac{AB}{CD}"),
        )?.correct,
      ).toBe(false);
    }
  });
});

describe("stable answer ordering", () => {
  it("preserves each option exactly once without mutating input", () => {
    const input = Object.freeze(["a", "b", "c", "d"]);
    expect(shuffledQuestChoices(input, 77)).toEqual(
      shuffledQuestChoices(input, 77),
    );
    expect(shuffledQuestChoices(input, 77).sort()).toEqual([...input]);
    expect(input).toEqual(["a", "b", "c", "d"]);
    expect(shuffledQuestChoices([], 1)).toEqual([]);
  });
  it("does not always place the answer in the same slot across the levels", () => {
    const positions = questLevels.map((level) =>
      shuffledQuestChoices(level.conclusionChoices, level.level).findIndex(
        (choice) => choice.correct,
      ),
    );
    expect(new Set(positions).size).toBe(3);
  });
});
