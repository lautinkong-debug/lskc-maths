import { describe, expect, it } from "vitest";
import katex from "katex";
import { challengeQuestions } from "./challengePractice";
import { evaluate, parse, type Ast } from "./parse";
import { equals, readNumber } from "./rational";
import { expressionTex, workOut } from "./steps";
import {
  demonstrationSteps,
  highlightedTex,
  insetSignLayout,
} from "./demonstration";
import { compactWorking } from "./compactWorking";
import { arithmeticTex } from "../../../../tests/helpers/arithmeticTex";

// Independent numeric reader for rendered working: no app parser/evaluator.
function printedValue(tex: string): number {
  const plain = arithmeticTex(tex)
    .replace(/\^\{(\d+)\}/g, "^$1")
    .replace(/\b(\d+)\s+(\d+)\/(\d+)/g, "($1+$2/$3)")
    .replace(/[\[\{]/g, "(")
    .replace(/[\]\}]/g, ")")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");
  const tokens = plain.match(/\d+\/\d+|\d+(?:\.\d+)?|[()+\-*/^]/g) ?? [];
  expect(tokens.join("")).toBe(plain.replace(/\s/g, ""));
  let at = 0;
  function primary(): number {
    if (tokens[at] === "(") {
      at++;
      const value = sum();
      expect(tokens[at++]).toBe(")");
      return value;
    }
    const token = tokens[at++];
    const [n, d] = token.split("/").map(Number);
    const value = d === undefined ? n : n / d;
    expect(Number.isFinite(value)).toBe(true);
    return value;
  }
  function power(): number {
    const base = primary();
    if (tokens[at] !== "^") return base;
    at++;
    return base ** unary();
  }
  function unary(): number {
    if (tokens[at] === "+") {
      at++;
      return unary();
    }
    if (tokens[at] === "-") {
      at++;
      return -unary();
    }
    return power();
  }
  function product(): number {
    let value = unary();
    while (tokens[at] === "*" || tokens[at] === "/") {
      const op = tokens[at++],
        right = unary();
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens[at] === "+" || tokens[at] === "-") {
      const op = tokens[at++],
        right = product();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }
  const result = sum();
  expect(at).toBe(tokens.length);
  return result;
}
function astFor(source: string): Ast {
  const parsed = parse(source);
  if (!parsed.ok) throw new Error(`${source}: ${parsed.message}`);
  return parsed.value;
}
const render = (tex: string) =>
  katex.renderToString(tex, { throwOnError: true });

describe("powers in handwritten practice", () => {
  it.each([
    ["-3^2", "-9"],
    ["(-3)^2", "9"],
    ["(-3)^3", "-27"],
    ["3^4", "81"],
    ["(-3)^4", "81"],
    ["(-3)^5", "-243"],
    ["(-2/3)^3", "-8/27"],
    ["-(2/3)^2", "-4/9"],
    ["-(-2)^3", "8"],
    ["2+3^2×4", "38"],
    ["(1-3)^4", "16"],
    ["((1+2)/(3-1))^2", "9/4"],
    ["(-1 1/2)^2", "9/4"],
    ["0^5", "0"],
    ["(2^2)^3", "64"],
    ["2^2/(1+1)", "2"],
  ])("%s = %s, including every displayed line", (source, answer) => {
    const ast = astFor(source),
      expected = readNumber(answer);
    expect(equals(evaluate(ast), expected)).toBe(true);
    const lines = [expressionTex(ast), ...workOut(ast).map((s) => s.tex)];
    for (const tex of lines) {
      expect(() => render(tex)).not.toThrow();
      expect(printedValue(tex), tex).toBeCloseTo(expected.n / expected.d, 10);
    }
  });
  it.each(["2^", "2^1", "2^6", "2^-3", "2^2.5", "2^3^2", "1/2^3", "2^(3+1)"])(
    "rejects unsupported or ambiguous input %s",
    (source) => expect(parse(source).ok).toBe(false),
  );
  it("calculates powers before multiplication and preserves the outside minus", () => {
    const steps = demonstrationSteps(astFor("-3^2×2+1/2"));
    expect(steps[0].kind).toBe("power");
    expect(steps[0].tex).toContain("-9");
    expect(steps.at(-1)?.tex).toBe("-\\frac{35}{2}");
  });
});

describe("20 original challenge questions", () => {
  it("offers two complete levels and every power from 2 to 5", () => {
    expect(challengeQuestions).toHaveLength(20);
    expect(new Set(challengeQuestions.map((q) => q.id)).size).toBe(20);
    expect(new Set(challengeQuestions.map((q) => q.expression)).size).toBe(20);
    for (const level of [1, 2])
      expect(challengeQuestions.filter((q) => q.level === level)).toHaveLength(
        10,
      );
    for (const exponent of [2, 3, 4, 5])
      expect(
        challengeQuestions.some((q) => q.expression.includes(`^${exponent}`)),
      ).toBe(true);
    for (const term of ["3^3", "3^4", "(-3)^3", "(-3)^4", "(-3)^5"])
      expect(challengeQuestions.some((q) => q.expression.includes(term))).toBe(
        true,
      );
  });
  for (const question of challengeQuestions) {
    it(`${question.id}: checks the handwritten key, every working line, and both reveal modes`, () => {
      const ast = astFor(question.expression),
        expected = readNumber(question.answer);
      expect(question.expression.length).toBeLessThanOrEqual(80);
      expect(question.expression).toMatch(/\//);
      expect(equals(evaluate(ast), expected)).toBe(true);
      expect(printedValue(expressionTex(ast))).toBeCloseTo(
        expected.n / expected.d,
        10,
      );
      const full = demonstrationSteps(ast);
      expect(full.length).toBeGreaterThan(0);
      expect(full.at(-1)?.ast.kind).toBe("number");
      for (const steps of [
        full,
        compactWorking(full).map((entry) => entry.step),
      ]) {
        for (const step of steps) {
          expect(equals(evaluate(step.ast), expected), step.tex).toBe(true);
          expect(printedValue(step.tex), step.tex).toBeCloseTo(
            expected.n / expected.d,
            10,
          );
          for (const tex of [
            step.tex,
            highlightedTex(step),
            highlightedTex(step, true),
            ...Object.values(insetSignLayout(step) ?? {}).filter(
              (v): v is string => typeof v === "string",
            ),
            step.compactReveal?.signTex,
            step.compactReveal?.animatedTex,
          ]) {
            if (tex) expect(() => render(tex), tex).not.toThrow();
          }
        }
      }
    });
  }
});
