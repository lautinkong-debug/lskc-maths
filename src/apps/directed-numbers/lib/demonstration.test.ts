import { describe, expect, it } from "vitest";
import katex from "katex";
import { evaluate, parse, parseAnswer } from "./parse";
import { equals } from "./rational";
import { textbookQuestions } from "./textbook";
import {
  demonstrationSteps,
  highlightedTex,
  signArrowTex,
} from "./demonstration";

describe("teacher demonstration frames", () => {
  it.each([
    ["(+6)×(+2)", "+", "\\times"],
    ["(+6)×(-2)", "-", "\\times"],
    ["(-6)×(+2)", "-", "\\times"],
    ["(-6)×(-2)", "+", "\\times"],
    ["(+6)÷(+2)", "+", "\\div"],
    ["(+6)÷(-2)", "-", "\\div"],
    ["(-6)÷(+2)", "-", "\\div"],
    ["(-6)÷(-2)", "+", "\\div"],
  ])("%s separates sign and magnitude", (expression, sign, operation) => {
    const parsed = parse(expression);
    if (!parsed.ok) throw new Error(expression);
    const first = demonstrationSteps(parsed.value)[0];
    expect(first.signReveal).toEqual({
      prefix: "",
      sign,
      magnitude: `\\left(6 ${operation} 2\\right)`,
      suffix: "",
    });
  });
  it.each(["0×(-6)", "0÷(-2)"])(
    "%s never invents a sign for zero",
    (expression) => {
      const parsed = parse(expression);
      if (!parsed.ok) throw new Error(expression);
      expect(
        demonstrationSteps(parsed.value).some((step) => step.signReveal),
      ).toBe(false);
    },
  );
  it("keeps fractional division as division during its sign and magnitude reveal", () => {
    const parsed = parse("(-14)÷(-7/5)");
    if (!parsed.ok) throw new Error("example");
    expect(demonstrationSteps(parsed.value)[0].signReveal?.magnitude).toBe(
      "\\left(14 \\div \\frac{7}{5}\\right)",
    );
  });
  it.each(["(+3.1)-(+4.9)", "(-5)×(-1.5)÷(-3)", "2.1+(-6.3)-(-0.2)"])(
    "%s keeps decimals in every intermediate line and highlight",
    (expression) => {
      const parsed = parse(expression);
      if (!parsed.ok) throw new Error(expression);
      const steps = demonstrationSteps(parsed.value);
      for (const step of steps) {
        expect(step.tex).not.toContain("\\frac");
        expect(highlightedTex(step)).not.toContain("\\frac");
        expect(signArrowTex(step) ?? "").not.toContain("\\frac");
      }
      if (expression === "(+3.1)-(+4.9)") {
        expect(steps.map((step) => step.tex)).toEqual([
          "3.1 - \\left(+4.9\\right)",
          "3.1 - 4.9",
          "-1.8",
        ]);
        expect(signArrowTex(steps[1])).toBe(
          "3.1 \\textcolor{#DA2127}{-} \\left(\\textcolor{#DA2127}{+}4.9\\right)",
        );
      }
    },
  );
  it("keeps fractions through bracket removal and calculation", () => {
    const parsed = parse("(+1/2)-(+3/4)");
    if (!parsed.ok) throw new Error("example");
    const steps = demonstrationSteps(parsed.value);
    expect(steps.map((step) => step.tex)).toEqual([
      "\\frac{1}{2} - \\left(+\\frac{3}{4}\\right)",
      "\\frac{1}{2} - \\frac{3}{4}",
      "-\\frac{1}{4}",
    ]);
  });
  it("keeps a fractional quotient exact when the source has only integers", () => {
    const parsed = parse("[(-2)+(-8)]÷[12-4]+(-1)");
    if (!parsed.ok) throw new Error("example");
    expect(demonstrationSteps(parsed.value).at(-1)?.tex).toBe("-\\frac{9}{4}");
  });
  for (const q of textbookQuestions)
    it(`${q.id}: all animated steps retain the printed answer`, () => {
      const input = parse(q.expression),
        answer = parseAnswer(q.answer);
      if (!input.ok || !answer.ok) throw new Error(q.id);
      const steps = demonstrationSteps(input.value);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        if (step.signReveal) {
          const { prefix, sign, magnitude, suffix } = step.signReveal;
          const shown = parse(
            step.tex
              .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "($1/$2)")
              .replace(/\\left|\\right/g, "")
              .replace(/\\times/g, "×")
              .replace(/\\div/g, "÷"),
          );
          expect(shown.ok).toBe(true);
          if (shown.ok)
            expect(equals(evaluate(shown.value), answer.value)).toBe(true);
          expect(() =>
            katex.renderToString(
              `${prefix}${sign}\\textcolor{#13579B}{${magnitude}}${suffix}`,
              { throwOnError: true, trust: false },
            ),
          ).not.toThrow();
        }
        if (q.expression.includes(".") && !q.expression.includes("/"))
          expect(step.tex).not.toContain("\\frac");
        if (step.signReveal || ["++", "+-", "-+", "--"].includes(step.ruleId)) {
          const arrows = signArrowTex(step);
          expect(arrows).not.toBeNull();
          expect(arrows!.match(/textcolor/g)).toHaveLength(2);
          if (step.signReveal) {
            const shown = parse(
              arrows!
                .replace(/\\textcolor\{#DA2127\}\{([+-])\}/g, "$1")
                .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "($1/$2)")
                .replace(/\\left|\\right/g, "")
                .replace(/\\times/g, "×")
                .replace(/\\div/g, "÷"),
            );
            expect(shown.ok, arrows!).toBe(true);
            if (shown.ok)
              expect(equals(evaluate(shown.value), answer.value)).toBe(true);
          }
          expect(() =>
            katex.renderToString(arrows!, { throwOnError: true, trust: false }),
          ).not.toThrow();
        }
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
