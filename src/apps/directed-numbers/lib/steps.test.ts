import { describe, it, expect } from "vitest";
import { evaluate } from "./parse";
import {
  bracketSteps,
  parseAdditive,
  workOut,
  expressionTex,
  signedTerms,
  totals,
  sumRule,
} from "./steps";
import { equals, readNumber, sub, rational } from "./rational";
function read(text: string) {
  const parsed = parseAdditive(text);
  if (!parsed.ok) throw new Error(parsed.message);
  return parsed.value;
}
const cases = [
  ["(+2) + (−3) − (−8)", "7"],
  ["(−1) − (+3.8) − (−1.5)", "-3.3"],
  ["−3/2 + [4 + (−5)]", "-5/2"],
  ["(+4) − [(+4) + (+2)]", "-2"],
  ["-[-3-(-2)]", "1"],
  ["-(-4)", "4"],
  ["+(-4)", "-4"],
  ["-(0)", "0"],
  ["(0) − (0)", "0"],
  ["-1 1/4 + (3/4)", "-1/2"],
  ["0.1 + (0.2) − (0.3)", "0"],
  ["(-5)-[(-27)+(-15)]", "37"],
  ["1-(2-(3-(4-5)))", "3"],
  ["(-2)+(-3)", "-5"],
  ["(-7)+(+3)", "-4"],
  ["3-(+5)", "-2"],
  ["3-(-5)", "8"],
  ["3+(+5)", "8"],
  ["3+(-5)", "-2"],
  ["-5-(-27)+(-15)", "7"],
] as const;
describe("additive working", () => {
  it("keeps decimal display exact without changing fraction defaults", () => {
    const ast = read("0.1 + (0.2)"),
      final = bracketSteps(ast).at(-1)!.ast;
    expect(expressionTex(final, "decimal")).toBe("0.3");
    expect(expressionTex(final)).toBe("\\frac{3}{10}");
    expect(expressionTex(read("1/3"), "decimal")).toBe("\\frac{1}{3}");
  });
  it("returns highlight positions in the preceding rendered line", () => {
    const steps = bracketSteps(read("(+2) + (−3) − (−8)"));
    const step = steps[2],
      previous = expressionTex(step.before);
    expect(previous.slice(step.highlight!.start, step.highlight!.end)).toBe(
      " - \\left(-8\\right)",
    );
  });
  it("rejects a value whose gain/loss explanation would overflow", () => {
    const parsed = parseAdditive(
      "9007199254740991 - [9007199254740991 - 9007199254740991]",
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.code).toBe("overflow");
  });
  it.each(cases)("keeps every step in %s equal to %s", (source, expected) => {
    const ast = read(source),
      answer = readNumber(expected);
    for (const step of [...bracketSteps(ast), ...workOut(ast)])
      expect(equals(evaluate(step.ast), answer), step.tex).toBe(true);
    expect(equals(evaluate(bracketSteps(ast).at(-1)?.ast ?? ast), answer)).toBe(
      true,
    );
    const total = totals(signedTerms(ast));
    expect(equals(sub(total.positive, total.negative), answer)).toBe(true);
  });
  it("removes simple brackets on one line, then calculates left to right", () => {
    const steps = workOut(read("(+2) + (−3) − (−8)"));
    expect(steps.map((s) => s.tex)).toEqual(["2 - 3 + 8", "-1 + 8", "7"]);
    expect(steps.map((s) => s.ruleId)).toEqual([
      "removeAll",
      "different",
      "different",
    ]);
  });
  it("finishes square brackets before subtracting their value", () => {
    const steps = bracketSteps(read("4 - [4 + (-2)]"));
    expect(steps.map((s) => s.tex)).toEqual([
      "4 - \\left[4 - 2\\right]",
      "4 - \\left[+2\\right]",
      "4 - 2",
      "2",
    ]);
    expect(steps[2].ruleId).toBe("-+");
  });
  it("handles all four sign rules, including a leading unary sign", () => {
    for (const op of ["+", "-"])
      for (const sign of ["+", "-"]) {
        const step = bracketSteps(read(`3 ${op} (${sign}2)`))[0];
        expect(step.ruleId).toBe(op + sign);
      }
    expect(bracketSteps(read("-(-4)"))[0].ruleId).toBe("--");
  });
  it("does not invent a sign for zero", () => {
    for (const source of ["0 + (0)", "0 - (-0)", "(-3)+(+3)"]) {
      const steps = bracketSteps(read(source));
      expect(steps.at(-1)?.tex).toBe("0");
      expect(steps.some((s) => /[+-]0(?:\D|$)/.test(s.tex))).toBe(false);
    }
    expect(sumRule(rational(-3), rational(3))).toBe("cancel");
  });
  it("preserves the value for all small pairs and outer subtraction", () => {
    for (let a = -9; a <= 9; a++)
      for (let b = -9; b <= 9; b++)
        for (const op of ["+", "-"]) {
          const ast = read(`5 - [(${a}) ${op} (${b})]`),
            expected = evaluate(ast);
          for (const step of bracketSteps(ast))
            expect(equals(evaluate(step.ast), expected)).toBe(true);
          expect(bracketSteps(ast).at(-1)?.ast.kind).toBe("number");
        }
  });
  it.each(["1+2+3+4+5+6", "3 * 2", "3 / (2)", "5 ÷ 0", "()", "(3", "3 + -2"])(
    "rejects unsupported or malformed lesson input %s",
    (source) => expect(parseAdditive(source).ok).toBe(false),
  );
  it("accepts five terms and exact fractions", () =>
    expect(parseAdditive("1/3 + (2/3) - (4/5) + (1.2) - (2)").ok).toBe(true));
});
