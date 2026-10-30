import { describe, it, expect } from "vitest";
import katex from "katex";
import { questions, similarQuestion } from "@/apps/linear-equations/data";
import {
  solve,
  checkSubstitution,
  equationTex,
  gradeAnswer,
  parseAnswer,
} from "@/apps/linear-equations/engine";
import { equals, readNumber } from "@/apps/directed-numbers/lib/rational";

describe("verified textbook equations", () => {
  for (const question of questions) {
    it(question.id + " preserves its printed answer through every step", () => {
      const expected = readNumber(question.answer);
      for (const equation of [
        question.equation,
        ...question.steps.map((s) => s.equation),
      ]) {
        expect(
          equals(solve(equation, question.variable), expected),
          equation,
        ).toBe(true);
        expect(
          checkSubstitution(equation, question.variable, expected).valid,
          equation,
        ).toBe(true);
        expect(() =>
          katex.renderToString(equationTex(equation), { throwOnError: true }),
        ).not.toThrow();
      }
    });
  }
  it("has 16 distinct question references and no missing printed page", () => {
    expect(questions).toHaveLength(16);
    expect(new Set(questions.map((q) => q.id)).size).toBe(16);
    expect(questions.every((q) => ["4.11", "4.20"].includes(q.page))).toBe(
      true,
    );
  });
  it("checks Q18 against the original equation, both sides equal 7", () => {
    const result = checkSubstitution("-(2*q-5)=3*q+10", "q", readNumber("-1"));
    expect(result.leftValue).toEqual({ n: 7, d: 1 });
    expect(result.rightValue).toEqual({ n: 7, d: 1 });
  });
  it("uses exact decimal arithmetic", () => {
    expect(solve("0.8+3*x=1.4", "x")).toEqual({ n: 1, d: 5 });
  });
  it("rejects nonlinear, ambiguous and nonunique equations", () => {
    for (const equation of [
      "x*x=4",
      "1/x=2",
      "x=x",
      "x=2=3",
      "x+z=4",
      "x+1=2;alert(1)",
    ]) {
      expect(() => solve(equation, "x")).toThrow();
    }
  });
});
describe("answer marking", () => {
  for (const answer of ["-1/2", "-0.5", "−0.5", "m = -2/4", "1/-2", "-3/6"]) {
    it("accepts equivalent answer " + answer, () =>
      expect(gradeAnswer(answer, "m", "-1/2")).toBe("correct"),
    );
  }
  for (const answer of [
    "",
    "1/0",
    "NaN",
    "Infinity",
    "1e4",
    "1/2/3",
    "x=-1/2",
    "m=m=2",
    "alert(1)",
    "1+2",
  ]) {
    it("rejects " + JSON.stringify(answer), () =>
      expect(parseAnswer(answer, "m")).toBeNull(),
    );
  }
  it("distinguishes a sign mistake, wrong value and exact decimal", () => {
    expect(gradeAnswer("0.5", "m", "-1/2")).toBe("sign");
    expect(gradeAnswer("0.49", "m", "-1/2")).toBe("incorrect");
    expect(gradeAnswer("0.10000000001", "y", "1/10")).toBe("incorrect");
    expect(gradeAnswer("2/20", "y", "1/10")).toBe("correct");
  });
});
describe("generated practice", () => {
  for (const original of questions) {
    it(
      original.id + " retries always have the advertised unique solution",
      () => {
        for (let i = 1; i <= 100; i++) {
          const q = similarQuestion(original, i);
          expect(
            equals(solve(q.equation, q.variable), readNumber(q.answer)),
          ).toBe(true);
          expect(
            checkSubstitution(q.equation, q.variable, readNumber(q.answer))
              .valid,
          ).toBe(true);
          expect(() =>
            katex.renderToString(equationTex(q.equation), {
              throwOnError: true,
            }),
          ).not.toThrow();
        }
      },
    );
  }
});
