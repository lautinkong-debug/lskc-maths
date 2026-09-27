import { describe, expect, it } from "vitest";
import { evaluate, parse } from "./parse";
import { expressionTex, workOut } from "./steps";
import { equals, readNumber } from "./rational";

const examples = [
  ["(−5) × (−4)", "20"],
  ["(+6)(−2)", "-12"],
  ["6(−2)", "-12"],
  ["(+2) × (−4) × (−7)", "56"],
  ["(−4)(−5)(−0.5)", "-10"],
  ["(−35) ÷ (+7)", "-5"],
  ["(−81) ÷ (−9)", "9"],
  ["(−72) ÷ (−6) ÷ (−2)", "-6"],
  ["(−72) ÷ [(−6) ÷ (−2)]", "-24"],
  ["(+6) ÷ (−3/5) × (+5)", "-50"],
  ["(−1 1/4) ÷ [(−2) × (+5)]", "1/8"],
  ["(+7) × (−1/14) × (+3)", "-3/2"],
  ["(+18) ÷ (−4.5) ÷ (−0.5)", "8"],
  ["(−9)(+4)(−5)", "180"],
  ["−5(+6)(+4)", "-120"],
  ["(−7) − (−6) × (−5)", "-37"],
  ["[(+2) + (−8)] ÷ (−3)", "2"],
  ["(−8) ÷ (−2) − (−4) × (+1 1/2)", "10"],
  ["−1 − 9/(7 + (−10))", "2"],
  ["−(−4)(−12)", "-48"],
  ["(+9) × (−2) ÷ (−3)", "6"],
  ["(+60) ÷ (−20) × (+3)", "-9"],
  ["(+4) − [(+4) + (+2)]", "-2"],
  ["3(−5)/(3 + (−5))", "15/2"],
  ["[(−20) − (−13) + (−1)] / [(−3)(+2) − 4]", "4/5"],
] as const;

describe("complete arithmetic working", () => {
  it.each(examples)("keeps each line of %s equal to %s", (source, result) => {
    const parsed = parse(source);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const expected = readNumber(result);
    for (const signWorking of [false, true]) {
      const steps = workOut(parsed.value, { signWorking });
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps)
        expect(equals(evaluate(step.ast), expected), step.tex).toBe(true);
      expect(steps.at(-1)?.ast.kind).toBe("number");
      expect(equals(evaluate(steps.at(-1)!.ast), expected)).toBe(true);
    }
  });
  it("uses left-to-right division and reciprocal working", () => {
    const parsed = parse("(+6) ÷ (−3/5) × (+5)");
    if (!parsed.ok) throw new Error(parsed.message);
    const steps = workOut(parsed.value, { signWorking: true });
    expect(steps.some((step) => step.ruleId === "reciprocal")).toBe(true);
    expect(steps.some((step) => step.ruleId === "diff-sign-product")).toBe(
      true,
    );
    expect(steps.at(-1)?.tex).toBe("-50");
  });
  it("changes mixed numbers before calculating and multiplies before adding", () => {
    const parsed = parse("(−1 1/4) × (+8) + (+3)");
    if (!parsed.ok) throw new Error(parsed.message);
    const steps = workOut(parsed.value);
    expect(steps[0].ruleId).toBe("mixed-to-improper");
    expect(
      steps.find((step) => step.ruleId === "mult-div-first"),
    ).toBeDefined();
    expect(steps.at(-1)?.tex).toBe("-7");
  });
  it("rejects division by zero before showing any working", () => {
    const parsed = parse("0 ÷ (−0)");
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.code).toBe("divisionByZero");
  });
  it("accepts keyboard hyphens as well as printed minus signs", () => {
    for (const [source, answer] of examples) {
      const parsed = parse(source.replaceAll("−", "-"));
      expect(parsed.ok, source).toBe(true);
      if (parsed.ok)
        expect(equals(evaluate(parsed.value), readNumber(answer)), source).toBe(
          true,
        );
    }
  });
  it("converts a standalone mixed number to an improper fraction", () => {
    const parsed = parse("−2 1/4");
    if (!parsed.ok) throw new Error(parsed.message);
    expect(workOut(parsed.value)[0]?.ruleId).toBe("mixed-to-improper");
    expect(workOut(parsed.value)[0]?.tex).toBe("-\\frac{9}{4}");
  });
  it("keeps a written decimal visible until its exact calculation", () => {
    const parsed = parse("(−1.5) × (+4) + (+7)");
    if (!parsed.ok) throw new Error(parsed.message);
    expect(expressionTex(parsed.value)).toContain("-1.5");
    expect(workOut(parsed.value).at(-1)?.tex).toBe("1");
  });
});
