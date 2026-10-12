import { expect, it } from "vitest";
import { moneyGuidance } from "./moneyGuidance";
import { magnitudeModel, simpleMove } from "./textbook";
import { compare } from "./rational";
import { teachingCaseGroups } from "./teachingCases";

it.each([
  ["(-2.6)+0.9", "lessDebt"],
  ["(-2.6)-(-0.9)", "lessDebt"],
  ["(-2.6)-0.9", "moreDebt"],
  ["(-2.6)+(-0.9)", "moreDebt"],
  ["2.6-0.9", "lessCredit"],
  ["2.6+(-0.9)", "lessCredit"],
  ["2.6+0.9", "moreCredit"],
  ["2.6-(-0.9)", "moreCredit"],
  ["(-20)+30", "debtToCredit"],
  ["(-20)+50", "debtToCredit"],
  ["20-30", "creditToDebt"],
  ["20-50", "creditToDebt"],
  ["(-2.6)+2.6", "settled"],
  ["2.6-2.6", "settled"],
  ["0+0", "unchanged"],
  ["(-2.6)-0", "unchanged"],
  ["0-(-0.9)", "startCredit"],
  ["0-0.9", "startDebt"],
  ["(-3/5)+2/5", "lessDebt"],
  ["(-2/5)+3/5", "debtToCredit"],
])("guides %s through its actual money outcome: %s", (expression, expected) => {
  const move = simpleMove(expression, true)!;
  expect(move).not.toBeNull();
  expect(moneyGuidance(move)).toBe(expected);
});

it("more/less magnitude prompts are true for all presets and never describe crossing zero as a decrease", () => {
  for (const group of teachingCaseGroups) {
    for (const { move } of [...group.plain, ...group.signed]) {
      const kind = moneyGuidance(move);
      const m = magnitudeModel(move);
      if (kind === "moreCredit" || kind === "moreDebt")
        expect(compare(m.exact.magnitude, m.exact.a)).toBe(1);
      if (kind === "lessCredit" || kind === "lessDebt")
        expect(compare(m.exact.magnitude, m.exact.a)).toBe(-1);
      if (kind === "debtToCredit" || kind === "creditToDebt")
        expect(Math.sign(m.exact.result.n)).toBe(-Math.sign(m.exact.start.n));
    }
  }
});
