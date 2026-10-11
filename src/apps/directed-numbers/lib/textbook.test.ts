import { describe, expect, it } from "vitest";
import { evaluate, parse, parseAnswer } from "./parse";
import { equals } from "./rational";
import { workOut } from "./steps";
import { magnitudeModel, simpleMove, textbookQuestions } from "./textbook";

describe("textbook transcription and printed answer key", () => {
  it("contains 122 unique referenced questions", () => {
    expect(textbookQuestions).toHaveLength(122);
    expect(new Set(textbookQuestions.map((q) => q.id)).size).toBe(122);
    expect(textbookQuestions.filter((q) => q.exercise === "2B")).toHaveLength(
      62,
    );
  });
  for (const question of textbookQuestions) {
    it(`${question.id}: ${question.expression} = ${question.answer}`, () => {
      const parsed = parse(question.expression),
        expected = parseAnswer(question.answer);
      expect(parsed.ok).toBe(true);
      expect(expected.ok).toBe(true);
      if (!parsed.ok || !expected.ok) throw new Error(question.id);
      expect(equals(evaluate(parsed.value), expected.value)).toBe(true);
      const steps = workOut(parsed.value);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps)
        expect(equals(evaluate(step.ast), expected.value)).toBe(true);
      expect(steps.at(-1)?.ast.kind).toBe("number");
    });
  }
});

describe("final sign and magnitude", () => {
  it.each([
    ["50-60", -10, "opposite", "negative"],
    ["-50+30", -20, "opposite", "negative"],
    ["-50+60", 10, "opposite", "positive"],
    ["-50-30", -80, "same", "negative"],
    ["-50-(-60)", 10, "opposite", "positive"],
    ["50+(-50)", 0, "cancel", "zero"],
    ["50-30", 20, "opposite", "positive"],
    ["50+30", 80, "same", "positive"],
    ["0-(-30)", 30, "fromZero", "positive"],
    ["-50-0", -50, "noMove", "negative"],
    ["0+0", 0, "noMove", "zero"],
  ] as const)("%s", (expression, end, kind, sign) => {
    const move = simpleMove(expression);
    expect(move).not.toBeNull();
    expect(magnitudeModel(move!)).toMatchObject({
      end,
      magnitude: Math.abs(end),
      kind,
      sign,
    });
  });
  it("does not send fractions, products or compound operands to the integer visual", () => {
    for (const expression of [
      "(-2/3)-(-4)",
      "2.1+(-6.3)",
      "4×(-5)",
      "2-[(-6)+(-9)]",
      "1+2+3",
    ])
      expect(simpleMove(expression)).toBeNull();
  });
});

import { magnitudeExpression, readMagnitudeMove } from "./textbook";
import { readNumber } from "./rational";

describe("exact fraction and decimal number lines", () => {
  it.each([
    ["-21", "-", "-43", "+\\left(43 - 21\\right)", "+22"],
    ["-23", "+", "43", "+\\left(43 - 23\\right)", "+20"],
    ["3.1", "-", "4.9", "-\\left(4.9 - 3.1\\right)", "-1.8"],
    ["-50", "-", "30", "-\\left(50 + 30\\right)", "-80"],
    ["50", "+", "30", "+\\left(50 + 30\\right)", "+80"],
    [
      "1/2",
      "-",
      "3/4",
      "-\\left(\\frac{3}{4} - \\frac{1}{2}\\right)",
      "-\\frac{1}{4}",
    ],
    ["50", "+", "-50", "\\left(50 - 50\\right)", "0"],
    ["0", "-", "-30", "+\\left(0 + 30\\right)", "+30"],
    ["-0.01", "+", "0", "-\\left(0.01 + 0\\right)", "-0.01"],
  ] as const)(
    "%s %s %s shows the sign outside the unevaluated magnitude",
    (a, op, b, working, result) => {
      const model = magnitudeModel(readMagnitudeMove(a, op, b)!);
      expect(model.signedMagnitudeTex).toBe(working);
      expect(model.signedResultTex).toBe(result);
    },
  );
  it("reads fraction and decimal lesson links without changing the operands", () => {
    for (const expression of ["(-1/3)+(+1/6)", "(+3)-(+3.1)"]) {
      const move = simpleMove(expression, true)!;
      const parsed = parse(expression);
      expect(move).not.toBeNull();
      if (parsed.ok)
        expect(
          equals(magnitudeModel(move).exact.result, evaluate(parsed.value)),
        ).toBe(true);
    }
  });
  it.each([
    ["3", "-", "3.1", "-0.1", "3.1 − 3 = 0.1"],
    ["0.1", "+", "0.2", "0.3", "0.1 + 0.2 = 0.3"],
    ["1/3", "+", "1/6", "1/2", "1/3 + 1/6 = 1/2"],
    ["-1/2", "-", "-3/4", "1/4", "3/4 − 1/2 = 1/4"],
    ["-1 1/2", "+", "0.25", "-5/4", "3/2 − 1/4 = 5/4"],
    ["1/3", "-", "1/3", "0", "1/3 − 1/3 = 0"],
    ["0", "-", "-1/7", "1/7", "0 + 1/7 = 1/7"],
    ["-0.01", "+", "0", "-0.01", "0.01 + 0 = 0.01"],
    ["0.0001", "+", "0.0002", "0.0003", "0.0001 + 0.0002 = 0.0003"],
  ] as const)("%s %s %s", (a, op, b, result, calculation) => {
    const move = readMagnitudeMove(a, op, b)!;
    expect(move).not.toBeNull();
    const model = magnitudeModel(move);
    expect(equals(model.exact.result, readNumber(result))).toBe(true);
    expect(model.calculation).toBe(calculation);
    const expression = parse(magnitudeExpression(move));
    expect(expression.ok).toBe(true);
    if (expression.ok)
      expect(equals(evaluate(expression.value), readNumber(result))).toBe(true);
  });
  it.each([
    "",
    "1/0",
    "2+3",
    "NaN",
    "Infinity",
    "101",
    "-100.1",
    "9007199254740992",
    "1/99999999999999999",
  ])("rejects invalid operand %s", (raw) => {
    expect(readMagnitudeMove(raw, "+", "1")).toBeNull();
    expect(readMagnitudeMove("1", "-", raw)).toBeNull();
  });
});
