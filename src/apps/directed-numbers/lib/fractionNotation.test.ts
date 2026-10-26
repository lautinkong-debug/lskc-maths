import { expect, it } from "vitest";
import katex from "katex";
import { parse, evaluate, parseAnswer, type Ast } from "./parse";
import { expressionTex } from "./steps";
import { compactWorking } from "./compactWorking";
import {
  demonstrationSteps,
  highlightedTex,
  signArrowTex,
} from "./demonstration";
import { textbookQuestions } from "./textbook";
import { equals } from "./rational";

// Checked against the supplied scan, printed pp. 2.47–2.48 and 2.56–2.58.
const printedFractions = [
  "2C-5a",
  "2C-5b",
  "2C-6a",
  "2C-12a",
  "2C-12b",
  "2C-16b",
  "2C-27a",
  "2C-31b",
  "2C-32a",
  "2C-32b",
  "2C-33a",
  "2C-33b",
  "R2-13b",
  "R2-14b",
  "R2-19b",
  "R2-26b",
  "R2-27a",
  "R2-27b",
  "R2-32b",
  "R2-33a",
  "R2-33b",
  "R2-36a",
  "R2-36b",
  "R2-37a",
  "R2-37b",
];
function hasFractionBar(node: Ast): boolean {
  return node.kind === "binary"
    ? Boolean(node.fractionBar) ||
        hasFractionBar(node.left) ||
        hasFractionBar(node.right)
    : node.kind !== "number" && hasFractionBar(node.child);
}

it("matches every compound fraction line printed in the textbook", () => {
  const actual = textbookQuestions
    .filter((question) => {
      const result = parse(question.expression);
      return result.ok && hasFractionBar(result.value);
    })
    .map((question) => question.id);
  expect(actual).toEqual(printedFractions);
});

it.each(printedFractions)(
  "%s preserves fraction lines, valid highlights and the printed answer",
  (id) => {
    const question = textbookQuestions.find((question) => question.id === id)!;
    const parsed = parse(question.expression),
      answer = parseAnswer(question.answer);
    if (!parsed.ok || !answer.ok) throw new Error(id);
    expect(expressionTex(parsed.value)).toContain("\\dfrac{");
    const full = demonstrationSteps(parsed.value);
    for (const step of [
      ...full,
      ...compactWorking(full).map((entry) => entry.step),
    ]) {
      expect(equals(evaluate(step.ast), answer.value)).toBe(true);
      if (hasFractionBar(step.ast)) expect(step.tex).toContain("\\dfrac{");
      for (const tex of [
        step.tex,
        highlightedTex(step),
        highlightedTex(step, true),
        signArrowTex(step),
        step.compactReveal?.signTex,
        step.compactReveal?.animatedTex,
        step.batchReveal?.signTex,
        step.batchReveal?.animatedTex,
      ]) {
        if (tex)
          expect(() =>
            katex.renderToString(tex, { throwOnError: true }),
          ).not.toThrow();
      }
    }
  },
);

it("keeps printed divide signs and decimal operands in Revision Q38(a)", () => {
  const result = parse(
    textbookQuestions.find((question) => question.id === "R2-38a")!.expression,
  );
  if (!result.ok) throw new Error("R2-38a");
  const tex = expressionTex(result.value);
  expect(tex.match(/\\div/g)).toHaveLength(2);
  expect(tex).not.toContain("\\frac");
  expect(tex).toContain("0.5");
});

it("keeps the leading minus outside Revision Q14(b)'s fraction", () => {
  const result = parse(
    textbookQuestions.find((question) => question.id === "R2-14b")!.expression,
  );
  if (!result.ok) throw new Error("R2-14b");
  expect(expressionTex(result.value)).toBe("-\\dfrac{244}{\\left(-4\\right)}");
});

it.each([
  ["R2-37b", [4, 5, 6, 0, 1, 2, 3]],
  ["R2-36a", [1, 0, 2, 3]],
  ["2C-5a", [1, 0]],
] as const)(
  "%s connects arrows to the correct numerator and denominator signs",
  (id, expected) => {
    const result = parse(
      textbookQuestions.find((question) => question.id === id)!.expression,
    );
    if (!result.ok) throw new Error(id);
    expect(demonstrationSteps(result.value)[0].signArrows?.anchorOrder).toEqual(
      expected,
    );
  },
);
