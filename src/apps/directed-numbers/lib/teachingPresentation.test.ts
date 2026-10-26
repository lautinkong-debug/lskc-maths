import { expect, it } from "vitest";
import { arithmeticTex } from "../../../../tests/helpers/arithmeticTex";
import { teachingCaseGroups } from "./teachingCases";
import {
  compactWorking,
  compactPosition,
  expandedPosition,
} from "./compactWorking";
import { demonstrationSteps } from "./demonstration";
import { parse, evaluate, parseAnswer } from "./parse";
import { equals } from "./rational";
import { textbookQuestions, magnitudeModel } from "./textbook";

it("covers the four ordinary and eight signed cases with consistent exact magnitudes", () => {
  expect(
    teachingCaseGroups.map((g) => g.plain.length + g.signed.length),
  ).toEqual([4, 8, 12, 12]);
  for (const group of teachingCaseGroups) {
    const cases = [...group.plain, ...group.signed];
    expect(new Set(cases.map((c) => c.expression)).size).toBe(cases.length);
    for (const entry of cases) {
      const parsed = parse(entry.expression);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) throw new Error(entry.expression);
      expect(
        equals(evaluate(parsed.value), magnitudeModel(entry.move).exact.result),
      ).toBe(true);
    }
    const models = cases.map((c) => magnitudeModel(c.move));
    expect(new Set(models.map((m) => m.labels.a)).size).toBe(1);
    expect(new Set(models.map((m) => m.labels.distance)).size).toBe(1);
    expect(models.some((m) => m.sign === "positive")).toBe(true);
    expect(models.some((m) => m.sign === "negative")).toBe(true);
  }
});

it("optional-step hiding preserves every textbook answer, sign arrows and progress", () => {
  for (const question of textbookQuestions) {
    const parsed = parse(question.expression),
      answer = parseAnswer(question.answer);
    if (!parsed.ok || !answer.ok) throw new Error(question.id);
    const steps = demonstrationSteps(parsed.value);
    const compact = compactWorking(steps);
    for (const { step, start, end } of compact) {
      expect(equals(evaluate(step.ast), answer.value), question.id).toBe(true);
      expect(equals(evaluate(step.before), answer.value), question.id).toBe(
        true,
      );
      if (end > start) {
        const displayed = parse(arithmeticTex(step.tex));
        expect(displayed.ok, `${question.id}: ${step.tex}`).toBe(true);
        if (displayed.ok)
          expect(
            equals(evaluate(displayed.value), answer.value),
            question.id,
          ).toBe(true);
        expect(step.signReveal).toBeUndefined();
        expect(step.batchReveal).toBeUndefined();
        expect(step.signArrows).toEqual(steps[start].signArrows);
      }
    }
    expect(compact.at(-1)?.step.ast).toEqual(steps.at(-1)?.ast);
    expect(compactPosition(steps.length * 2, compact)).toBe(compact.length * 2);
    for (let pos = 0; pos <= compact.length * 2; pos++) {
      expect(compactPosition(expandedPosition(pos, compact), compact)).toBe(
        pos,
      );
    }
  }
});

it("compact working shows evaluated signs before their magnitudes, including independent results", () => {
  const question = textbookQuestions.find((q) => q.id === "R2-38a")!;
  const parsed = parse(question.expression);
  if (!parsed.ok) throw new Error(question.id);
  const first = compactWorking(demonstrationSteps(parsed.value))[0].step;
  expect(first.compactReveal?.signTex).toBe(
    "\\left[- - \\left(-8\\right)\\right] \\div \\left[+\\right]",
  );
  expect(first.compactReveal?.animatedTex).toContain(
    "\\textcolor{#13579B}{16}",
  );
  expect(first.compactReveal?.animatedTex).toContain("\\textcolor{#13579B}{1}");
  expect(first.compactReveal?.animatedTex).toContain("\\textcolor{#DA2127}{-}");
  expect(first.compactReveal?.animatedTex).toContain("\\textcolor{#DA2127}{+}");
  expect(first.tex).toBe(
    "\\left[-16 - \\left(-8\\right)\\right] \\div \\left[+1\\right]",
  );
});
