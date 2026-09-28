import { parseAnswer } from "./parse";
import { div, equals, mul, rational, type Rational } from "./rational";
import { moveFor } from "./moves";

export type SnapSign = "negative" | "positive" | "zero";
export type SignCard = {
  expression: string;
  factors: number[];
  operations: ("×" | "÷")[];
  sign: SnapSign;
  value: Rational;
  bonus: boolean;
};
const integer = (random: () => number, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));
const factor = (random: () => number) =>
  integer(random, 2, 5) * (random() < .5 ? -1 : 1);
const signed = (n: number) => n < 0 ? "−" + -n : n > 0 ? "+" + n : "0";

export function makeSignCard(random: () => number, level: 1 | 2 | 3, index: number): SignCard {
  const count = level === 1 ? 2 : level === 2 ? integer(random, 3, 4) : integer(random, 4, 6);
  const operations: ("×" | "÷")[] = Array.from({ length: count - 1 }, () => random() < .42 ? "÷" : "×");
  const factors = Array.from({ length: count }, () => factor(random));
  if (level === 1 && operations[0] === "÷") {
    const divisor = factors[1];
    factors[0] = divisor * integer(random, 1, 4) * (random() < .5 ? -1 : 1);
  }
  if (index % 9 === 7) factors[0] = 0;
  // A zero may be divided by a non-zero factor; no divisor is ever zero.
  let value = rational(factors[0]);
  for (let i = 1; i < count; i++) {
    const next = rational(factors[i]);
    if (operations[i - 1] === "×") value = mul(value, next);
    else {
      const quotient = div(value, next);
      if (!quotient.ok) throw new Error("Generated a zero divisor");
      value = quotient.value;
    }
  }
  const sign: SnapSign = value.n < 0 ? "negative" : value.n > 0 ? "positive" : "zero";
  const expression = factors.map((n, i) =>
    (i ? " " + operations[i - 1] + " " : "") + "(" + signed(n) + ")"
  ).join("");
  return { expression, factors, operations, sign, value, bonus: level === 3 && index % 5 === 4 };
}

export function gradeSignCard(card: SignCard, sign: SnapSign, answer = ""): boolean {
  if (sign !== card.sign) return false;
  if (!card.bonus) return true;
  const given = parseAnswer(answer);
  return given.ok && equals(given.value, card.value);
}

export function signDirection(sign: SnapSign): "left" | "right" | "none" {
  return sign === "negative" ? moveFor("+", -1).direction : sign === "positive" ? moveFor("+", 1).direction : "none";
}
