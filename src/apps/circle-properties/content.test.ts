import { describe, expect, it } from "vitest";
import { labs, reasonQuestions, reasons, traps, type LabId } from "./content";
import { defaults, getModel, type Parameters } from "./geometry";

const values = (lab: LabId, parameters: Partial<Parameters>) =>
  Object.fromEntries(getModel(lab, { ...defaults[lab], ...parameters }).measurements.map(m => [m.label, m.value]));

describe("Chapter 16 learning bank", () => {
  it("covers every source theorem once and makes every reason discoverable and testable", () => {
    expect(reasons.map(reason => reason.number)).toEqual(Array.from({ length: 17 }, (_, i) => `16.${i + 1}`));
    expect(new Set(reasons.map(reason => reason.id)).size).toBe(17);
    expect(labs).toHaveLength(7);
    expect(labs.flatMap(lab => lab.reasonIds).sort()).toEqual(reasons.map(reason => reason.id).sort());
    for (const reason of reasons) {
      expect(labs.find(lab => lab.id === reason.lab)?.reasonIds).toContain(reason.id);
      expect(reasonQuestions.some(question => question.reasonId === reason.id)).toBe(true);
      expect(reason.condition.trim().length).toBeGreaterThan(0);
    }
  });

  it("never offers a missing reason, duplicate answer label, or the correct reason as a distractor", () => {
    expect(new Set(reasonQuestions.map(question => question.id)).size).toBe(reasonQuestions.length);
    for (const question of reasonQuestions) {
      const ids = [question.reasonId, ...question.distractorIds];
      expect(ids).toHaveLength(4);
      expect(new Set(ids).size).toBe(4);
      const labels = ids.map(id => reasons.find(reason => reason.id === id)?.label);
      expect(labels.every(Boolean)).toBe(true);
      expect(new Set(labels).size).toBe(4);
    }
  });

  it("uses distinct, in-range prediction choices and a mixture of valid and invalid claims", () => {
    for (const lab of labs) {
      expect(new Set(lab.prediction).size).toBe(3);
      expect(lab.correctPrediction).toBeGreaterThanOrEqual(0);
      expect(lab.correctPrediction).toBeLessThan(3);
    }
    expect(traps.length).toBeGreaterThanOrEqual(10);
    expect(traps.some(trap => trap.valid)).toBe(true);
    expect(traps.some(trap => !trap.valid)).toBe(true);
    for (const trap of traps) expect(labs.some(lab => lab.id === trap.lab)).toBe(true);
  });

  it("keeps circumference-angle extensions in the relay with explicit matching arcs", () => {
    for (const id of ["r10", "r11", "r12", "r13"]) {
      expect(reasonQuestions.some(q => q.reasonId === id && /∠APB/.test(q.given + q.statement))).toBe(true);
    }
    const ratio = reasonQuestions.find(q => q.id === "q17")!;
    expect(ratio.given).toContain("not containing P");
    expect(ratio.given).toContain("not containing Q");
    expect(ratio.reasonId).toBe("r17");
    expect(24 / 60).toBeCloseTo(2 / 5);
    expect(reasonQuestions.find(q => q.id === "q23")?.given).toContain("major arc AB");
    expect(reasonQuestions.find(q => q.id === "q23")?.given).toContain("major arc CD");
  });
});

describe("discovery conclusions agree with the live construction", () => {
  it("lets students test the perpendicular condition instead of implying every centre line bisects", () => {
    const aligned = values("bisector", { primary: 6, secondary: 0 });
    expect(aligned["∠ONB"]).toBeCloseTo(90);
    expect(aligned.AN).toBeCloseTo(aligned.NB);
    const offCentre = values("bisector", { primary: 6, secondary: 40 });
    expect(offCentre.AN).not.toBeCloseTo(offCentre.NB);
    expect(offCentre["∠ONB"]).not.toBeCloseTo(90);
    const lab = labs.find(lab => lab.id === "bisector")!;
    expect(lab.prediction[lab.correctPrediction]).toBe("The two parts are equal.");
  });

  it("makes the doubling rule work for the reflex case too", () => {
    for (const alternate of [false, true]) {
      const model = getModel("centre", { primary: 120, secondary: 60, alternate });
      expect(model.measurements[0].value).toBeCloseTo(2 * model.measurements[1].value);
      if (alternate) expect(model.measurements[0].value).toBeCloseTo(240);
    }
    const lab = labs.find(lab => lab.id === "centre")!;
    expect(lab.prediction[lab.correctPrediction]).toBe("The centre angle is twice the circumference angle.");
  });

  it("provides a numerical counterexample to using a chord ratio as an arc ratio", () => {
    for (const alternate of [false, true]) {
      const ratio = values("ratios", { primary: 60, secondary: 120, alternate });
      expect(ratio["Arc AB ÷ arc CD"]).toBeCloseTo(0.5);
      expect(ratio["Angle ratio"]).toBeCloseTo(0.5);
      expect(ratio["Chord AB ÷ CD"]).not.toBeCloseTo(0.5, 3);
    }
    const lab = labs.find(lab => lab.id === "ratios")!;
    expect(lab.prediction[lab.correctPrediction]).toBe("Its corresponding arc length.");
  });
});
