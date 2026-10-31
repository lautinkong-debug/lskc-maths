import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { reasonWorking } from "./reasonWorkingData";

describe("written applications of the circle reasons", () => {
  it("covers all seventeen textbook reasons and keeps their canonical wording", () => {
    expect(Object.keys(reasonWorking)).toEqual(reasons.map((r) => r.id));
    for (const reason of reasons) {
      const working = reasonWorking[reason.id];
      expect(working.reason).toBe(reason.label);
      expect(working.condition).toBe(reason.condition);
      expect(working.number).toBe(reason.number);
      expect(working.givens.length).toBeGreaterThan(0);
      expect(working.checks.length).toBeGreaterThan(0);
      expect(working.conclusion.trim()).not.toBe("");
    }
  });

  it("separates centre/perpendicular, centre/midpoint and perpendicular-bisector directions", () => {
    const r1 = reasonWorking.r1,
      r2 = reasonWorking.r2,
      r3 = reasonWorking.r3;
    expect(r1.givens.join(" ")).toContain("ON ⊥ AB");
    expect(r1.givens.join(" ")).not.toContain("AN = NB");
    expect(r1.conclusion).toBe("AN = NB");
    expect(r2.givens.join(" ")).toContain("AN = NB");
    expect(r2.givens.join(" ")).not.toContain("ON ⊥ AB");
    expect(r2.conclusion).toBe("ON ⊥ AB");
    expect(r3.givens.join(" ")).toContain("AN = NB");
    expect(r3.givens.join(" ")).toContain("perpendicular to AB");
    expect(r3.givens.join(" ")).not.toContain("centre");
    expect(r3.conclusion).toContain("centre O lies on line ℓ");
    expect(r1.checks.join(" ")).toContain("not a diameter");
    expect(r2.checks.join(" ")).toContain("not a diameter");
  });

  it("uses perpendicular distances in both equal-chord directions", () => {
    expect(reasonWorking.r4.givens.join(" ")).toContain("AB = CD");
    expect(reasonWorking.r4.conclusion).toBe("OM = ON");
    expect(reasonWorking.r5.givens.join(" ")).toContain("OM = ON");
    expect(reasonWorking.r5.conclusion).toBe("AB = CD");
    for (const id of ["r4", "r5"]) {
      expect(reasonWorking[id].givens.join(" ")).toContain(
        "OM ⊥ AB and ON ⊥ CD",
      );
      expect(reasonWorking[id].checks.join(" ")).toContain(
        "M lies on AB and N lies on CD",
      );
    }
  });

  it("matches the centre angle to the intercepted arc, including the reflex case", () => {
    expect(reasonWorking.r6.givens.join(" ")).toContain("does not contain P");
    expect(reasonWorking.r6.checks.join(" ")).toContain("same selected arc AB");
    expect(reasonWorking.r6.checks.join(" ")).toContain("reflex centre angle");
    expect(reasonWorking.r6.conclusion).toBe("Matching centre angle ∠AOB = 2θ");
  });

  it("requires circumference vertices on the same side for the same-segment result", () => {
    expect(reasonWorking.r7.givens.join(" ")).toContain("on the same circle");
    expect(reasonWorking.r7.givens.join(" ")).toContain(
      "same side of chord AB",
    );
    expect(reasonWorking.r7.conclusion).toBe("∠APB = ∠AQB");
  });

  it("does not reverse the semicircle theorem and its converse", () => {
    expect(reasonWorking.r8.givens.join(" ")).toContain("AB is a diameter");
    expect(reasonWorking.r8.givens.join(" ")).not.toContain("90°");
    expect(reasonWorking.r8.conclusion).toBe("∠ACB = 90°");
    expect(reasonWorking.r8.reason).not.toContain("converse");
    expect(reasonWorking.r9.givens.join(" ")).toContain("∠ACB = 90°");
    expect(reasonWorking.r9.givens.join(" ")).not.toContain("diameter");
    expect(reasonWorking.r9.conclusion).toBe("AB is a diameter.");
    expect(reasonWorking.r9.reason).toContain("converse");
  });

  it.each([
    ["r10", "∠AOB = ∠COD", "Minor arc AB = minor arc CD"],
    [
      "r11",
      "Minor arc AB = minor arc CD",
      "Minor centre angle ∠AOB = minor centre angle ∠COD",
    ],
    ["r12", "∠AOB = ∠COD", "AB = CD"],
    ["r13", "AB = CD", "Minor centre angle ∠AOB = minor centre angle ∠COD"],
    ["r14", "AB = CD", "Minor arc AB = minor arc CD"],
    ["r15", "Minor arc AB = minor arc CD", "AB = CD"],
  ])(
    "%s applies the right direction among angles, arcs and chords",
    (id, given, conclusion) => {
      expect(reasonWorking[id].givens.join(" ")).toContain(given);
      expect(reasonWorking[id].conclusion).toBe(conclusion);
      expect(reasonWorking[id].givens.join(" ")).toContain("same circle");
    },
  );

  it("writes arc-length fractions and distinguishes centre and circumference angles", () => {
    for (const id of ["r16", "r17"]) {
      expect(reasonWorking[id].conclusion).toBe(
        "\\frac{arc AB}{arc CD} = \\frac{θ}{φ}",
      );
      expect(reasonWorking[id].givens.join(" ")).toContain("same circle");
    }
    expect(reasonWorking.r16.givens.join(" ")).toContain(
      "∠AOB = θ and ∠COD = φ",
    );
    expect(reasonWorking.r17.givens.join(" ")).toContain(
      "∠APB = θ and ∠CQD = φ",
    );
    expect(reasonWorking.r17.checks.join(" ")).toContain(
      "arc AB excludes P and arc CD excludes Q",
    );
  });
});
