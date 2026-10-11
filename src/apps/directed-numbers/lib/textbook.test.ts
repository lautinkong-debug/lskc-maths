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
