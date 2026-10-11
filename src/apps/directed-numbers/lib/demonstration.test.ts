import { describe, expect, it } from "vitest";
import katex from "katex";
import { evaluate, parse, parseAnswer } from "./parse";
import { equals } from "./rational";
import { textbookQuestions } from "./textbook";
import { demonstrationSteps, highlightedTex } from "./demonstration";

describe("teacher demonstration frames", () => {
  for (const q of textbookQuestions)
    it(`${q.id}: all animated steps retain the printed answer`, () => {
      const input = parse(q.expression),
        answer = parseAnswer(q.answer);
      if (!input.ok || !answer.ok) throw new Error(q.id);
      const steps = demonstrationSteps(input.value);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(equals(evaluate(step.ast), answer.value)).toBe(true);
        expect(() =>
          katex.renderToString(highlightedTex(step), {
            throwOnError: true,
            strict: false,
            trust: false,
          }),
        ).not.toThrow();
        expect(() =>
          katex.renderToString(step.tex, { throwOnError: true }),
        ).not.toThrow();
      }
      expect(steps.at(-1)?.ast.kind).toBe("number");
    });
  it.each(["++", "+-", "-+", "--"])(
    "shows each bracket and %s before calculation",
    (pair) => {
      const parsed = parse(`(-50)${pair[0]}(${pair[1]}30)`);
      if (!parsed.ok) throw new Error("invalid example");
      const steps = demonstrationSteps(parsed.value);
      expect(steps.map((step) => step.ruleId)).toEqual([
        "unwrap",
        pair,
        pair === "++" || pair === "--" ? "different" : "same",
      ]);
      expect(steps.slice(0, 2).every((step) => step.kind === "bracket")).toBe(
        true,
      );
      expect(steps.at(-1)?.kind).toBe("sum");
    },
  );
});
