import { parse, type Ast } from "./parse";
import {
  abs,
  add,
  compare,
  neg,
  rational,
  readNumber,
  toText,
  toTex,
  type Rational,
} from "./rational";

export type SimpleMove = {
  start: number;
  op: "+" | "-";
  b: number;
  exact?: { start: Rational; b: Rational; style: "decimal" | "improper" };
};
/** Read each operand as one number; fractions never pass through floating point. */
export function readMagnitudeMove(
  a: string,
  op: SimpleMove["op"],
  b: string,
): SimpleMove | null {
  try {
    const start = readNumber(a),
      operand = readNumber(b);
    if ([start, operand].some((v) => compare(abs(v), rational(100)) > 0))
      return null;
    // Check that the exact result is representable before accepting the inputs.
    add(start, op === "+" ? operand : neg(operand));
    return {
      start: start.n / start.d,
      op,
      b: operand.n / operand.d,
      exact: {
        start,
        b: operand,
        style: a.includes("/") || b.includes("/") ? "improper" : "decimal",
      },
    };
  } catch {
    return null;
  }
}
export function magnitudeExpression(move: SimpleMove) {
  const m = magnitudeModel(move);
  return `(${m.labels.start})${move.op}(${m.labels.b})`;
}
export function simpleMove(
  expression: string,
  allowFractions = false,
): SimpleMove | null {
  const parsed = parse(expression);
  if (!parsed.ok) return null;
  const ast = parsed.value;
  if (
    allowFractions &&
    ast.kind === "binary" &&
    (ast.op === "+" || ast.op === "-")
  ) {
    const literal = (node: Ast): string | null =>
      node.kind === "group"
        ? literal(node.child)
        : node.kind === "number"
          ? toText(node.value, {
              style: expression.includes("/") ? "improper" : "decimal",
            })
          : null;
    const left = literal(ast.left),
      right = literal(ast.right);
    return left !== null && right !== null
      ? readMagnitudeMove(left, ast.op, right)
      : null;
  }
  function value(node: Ast): number | null {
    if (node.kind === "group") return value(node.child);
    if (node.kind !== "number") return null;
    return node.value.n / node.value.d;
  }
  if (ast.kind !== "binary" || (ast.op !== "+" && ast.op !== "-")) return null;
  const start = value(ast.left),
    b = value(ast.right);
  return start === null ||
    b === null ||
    !Number.isInteger(start) ||
    !Number.isInteger(b)
    ? null
    : { start, op: ast.op, b };
}

export function magnitudeModel(move: SimpleMove) {
  const start = move.exact?.start ?? readNumber(String(move.start));
  const operand = move.exact?.b ?? readNumber(String(move.b));
  const delta = move.op === "+" ? operand : neg(operand);
  const result = add(start, delta);
  const a = abs(start),
    distance = abs(operand),
    magnitude = abs(result);
  const same =
    start.n !== 0 && delta.n !== 0 && Math.sign(start.n) === Math.sign(delta.n);
  const kind =
    distance.n === 0
      ? "noMove"
      : start.n === 0
        ? "fromZero"
        : same
          ? "same"
          : result.n === 0
            ? "cancel"
            : "opposite";
  const sign = result.n > 0 ? "positive" : result.n < 0 ? "negative" : "zero";
  const style = move.exact?.style ?? "decimal";
  const text = (v: Rational, signed = false) => toText(v, { style, signed });
  const labels = {
    start: text(start, true),
    b: text(operand, true),
    delta: text(delta, true),
    end: text(result, true),
    a: text(a),
    distance: text(distance),
    magnitude: text(magnitude),
  };
  const larger = compare(a, distance) >= 0 ? a : distance;
  const smaller = compare(a, distance) >= 0 ? distance : a;
  const magnitudeTerms =
    kind === "opposite" || kind === "cancel"
      ? { left: larger, op: "-", right: smaller }
      : { left: a, op: "+", right: distance };
  const magnitudeTex = `${toTex(magnitudeTerms.left, { style })} ${magnitudeTerms.op} ${toTex(magnitudeTerms.right, { style })}`;
  const signTex = result.n > 0 ? "+" : result.n < 0 ? "-" : "";
  const magnitudeExpressionTex = `\\left(${magnitudeTex}\\right)`;
  const signedMagnitudeTex = `${signTex}${magnitudeExpressionTex}`;
  const calculation =
    kind === "same"
      ? `${text(a)} + ${text(distance)} = ${text(magnitude)}`
      : kind === "opposite" || kind === "cancel"
        ? `${text(larger)} − ${text(smaller)} = ${text(magnitude)}`
        : kind === "noMove"
          ? `${text(a)} + 0 = ${text(magnitude)}`
          : `0 + ${text(distance)} = ${text(magnitude)}`;
  const value = (v: Rational) => v.n / v.d;
  return {
    delta: value(delta),
    end: value(result),
    a: value(a),
    distance: value(distance),
    magnitude: value(magnitude),
    kind,
    sign,
    labels,
    calculation,
    signTex,
    magnitudeExpressionTex,
    signedMagnitudeTex,
    signedResultTex: toTex(result, { style, signed: true }),
    resultTex: toTex(result, { style }),
    exact: { start, operand, delta, result, a, distance, magnitude },
  } as const;
}
export type TextbookQuestion = {
  id: string;
  exercise: "2B" | "2C" | "R2";
  question: number;
  part: string;
  page: number;
  level: 1 | 2;
  expression: string;
  answer: string;
};
type Row = [number, string[], string[]];
// Transcribed from the supplied 1A02 scan, pp. 2.32–2.34 and 2.46–2.48.
// Expected answers are independently transcribed from pp. 2.68–2.69.
// A slash between expressions preserves a printed fraction line; ÷ stays ÷.
const exerciseB: Row[] = [
  [1, ["(+1)+(+3)", "0+(+2)", "(-8)+(+2)"], ["4", "2", "-6"]],
  [2, ["(-5)+(-2)", "(+6)+(-8)", "(-3)+(-5)"], ["-7", "-2", "-8"]],
  [3, ["(+4)-(+2)", "(-5)-(+5)", "(-4)-(+7)"], ["2", "-10", "-11"]],
  [4, ["(+3)-(-8)", "(+8)-(-3)", "(-3)-(-8)"], ["11", "11", "5"]],
  [5, ["16-8", "6-12", "-12+15"], ["8", "-6", "3"]],
  [6, ["-14+8", "-17-6", "-18-13"], ["-6", "-23", "-31"]],
  [7, ["(+2)+(+6)", "(+8)-(-4)", "(+8)-(-12)"], ["8", "12", "20"]],
  [8, ["(+4)+(-4)", "(+11)+(-3)", "(+8)-(+6)"], ["0", "8", "2"]],
  [9, ["(+4)-(+9)", "(+7)-(+8)", "(+8)+(-14)"], ["-5", "-1", "-6"]],
  [10, ["(-5)+(+6)", "(-1)-(-6)", "(-3)-(-12)"], ["1", "5", "9"]],
  [11, ["(-10)+(+7)", "(-12)+(+5)", "(-11)-(-5)"], ["-3", "-7", "-6"]],
  [12, ["(-6)+(-9)", "(-9)+(-8)", "(-4)+(-10)"], ["-15", "-17", "-14"]],
  [13, ["(-32)+(+17)", "(-16)+(-25)"], ["-15", "-41"]],
  [14, ["(+42)-(+16)", "(-27)-(+49)"], ["26", "-76"]],
  [15, ["(-21)-(-43)", "(-38)-(-20)"], ["22", "-18"]],
  [21, ["(+3)+(+1)+(-4)", "(+7)-(+2)-(-9)"], ["0", "14"]],
  [22, ["(-10)-(+12)+(+6)", "(-23)-(-25)+(-29)"], ["-16", "-27"]],
  [
    23,
    ["(+2)-(-1.2)", "(-3)-(+1.4)", "(-9.2)+(+4.7)", "(+2.1)+(-6.3)"],
    ["3.2", "-4.4", "-4.5", "-4.2"],
  ],
  [
    24,
    ["(-2/3)-(-4)", "(-1)-(+3/5)", "(-1/4)+(-3/2)", "(-1 1/3)-(-1/6)"],
    ["10/3", "-8/5", "-7/4", "-7/6"],
  ],
  [25, ["(-3)+(+4)+(-5.3)", "2.2-(+1.7)-(-2.5)"], ["-4.3", "3"]],
  [26, ["(+1)+(+2/3)-(-5/6)", "2/5-(+1/2)+(-1/10)"], ["5/2", "-1/5"]],
  [27, ["-6-[5-(-4)]", "2-[(-6)+(-9)]"], ["-15", "17"]],
  [28, ["-10/3+[(+5)-(+3)]", "-4+[(-3 1/2)+(+1/2)]"], ["-4/3", "-7"]],
];
const exerciseC: Row[] = [
  [1, ["(+7)×(+1)", "(-8)×(-5)"], ["7", "40"]],
  [2, ["(+3)×(-2)", "(-4)×(-9)"], ["-6", "36"]],
  [3, ["0×(-6)", "(-15)×(+2)"], ["0", "-30"]],
  [4, ["(+5)×(-0.3)", "(-1.8)×(-2)"], ["-1.5", "3.6"]],
  [5, ["(+12)/(+4)", "(-6)/(+2)"], ["3", "-3"]],
  [6, ["(+24)/(-3)", "(+70)÷(-7)"], ["-8", "-10"]],
  [7, ["(-64)÷(-8)", "(-48)÷(+6)"], ["8", "-8"]],
  [8, ["(-14)÷(-7/5)", "(+40)÷(-2 2/3)"], ["10", "-15"]],
  [9, ["(-3)×(-3)×(-3)", "(-2)×(+5)×(+8)"], ["-27", "-80"]],
  [10, ["(+18)÷(-3)÷(-2)", "(+24)÷(-6)÷(+2)"], ["3", "-2"]],
  [11, ["(+3)×(-4)÷(-6)", "(-40)÷(-10)×(-7)"], ["2", "-28"]],
  [12, ["[(+3)×(-6)]/(-9)", "(-32)/[(-2)×(-4)]"], ["2", "-4"]],
  [13, ["(+4)×(-5)-(+12)", "(+48)÷(-6)-(-4)"], ["-32", "-4"]],
  [14, ["(+8)+(-7)×(-4)", "(-12)+(+9)÷(-3)"], ["36", "-15"]],
  [15, ["(+6)-(-2)×(+4)", "(-6)-(-18)÷(+3)"], ["14", "0"]],
  [16, ["-2(-8)+5", "-15-16/(-4)"], ["21", "-11"]],
  [20, ["(-9)(+4)(-5)", "-5(+6)(+4)"], ["180", "-120"]],
  [21, ["(-2)(-0.5)(-4)", "(+7)×(-1/14)×(+3)"], ["-4", "-3/2"]],
  [22, ["(-39)÷(+6.5)÷(+2)", "(+18)÷(-4.5)÷(-0.5)"], ["-3", "8"]],
  [23, ["(-5)×(-1.5)÷(-3)", "(-10)÷(-2 1/2)×(+6)"], ["-2.5", "24"]],
  [24, ["(-32)÷[(+14)÷(-7)]", "(+18)÷[(-12)÷(-4)]"], ["16", "6"]],
  [25, ["(-6)×[(-7.5)÷(+5)]", "(-7/4)×[(-5)÷(-1/16)]"], ["9", "-140"]],
  [26, ["[(-2)-(+3)]×(+6)", "[(-4)+(-6)]÷(-5)"], ["-30", "2"]],
  [27, ["(-12)/[-3+(+6)]", "(-6)×[1/2-(-2)]"], ["-4", "-15"]],
  [28, ["(+2)×(-3)+(-7)×(+4)", "16(-2)-(-2)(-3.5)"], ["-34", "-39"]],
  [29, ["(-24)÷(+6)-(+80)÷(-10)", "[18+(-78)]÷[(+12)-(+8)]"], ["4", "-15"]],
  [30, ["18-(-6)×2+(-5)", "[18-(-6)]×2+(-5)"], ["25", "43"]],
  [31, ["(-4)[8(-2)-(-17)]", "[(-10)+7(-2)]/(-6)"], ["-4", "4"]],
  [
    32,
    ["[(-20)+(-12)]/[(-12)-(-20)]", "[(-2.7)+5.4]/[(+0.3)(-1)]"],
    ["-4", "-9"],
  ],
  [33, ["5-(-15)/[-6-(-11)]", "[(-2)+(-8)]/[12-4]+(-1)"], ["8", "-9/4"]],
];
// Revision Exercise 2, pp. 2.56–2.58; answers read separately from p. 2.69.
const revision: Row[] = [
  [7, ["(-13)+(+5)", "(-4)-(-12)"], ["-8", "8"]],
  [8, ["(+15)+(-30)", "(-24)-(+84)"], ["-15", "-108"]],
  [9, ["-2+(-143)", "-14-(-132)"], ["-145", "118"]],
  [10, ["(-3.2)+(-4.6)", "(+1.9)-(+12.5)"], ["-7.8", "-10.6"]],
  [11, ["7×(-4)", "50÷(-10)"], ["-28", "-5"]],
  [12, ["(+5)×(-9)", "(-56)÷(+8)"], ["-45", "-7"]],
  [13, ["(-3)(-18)", "(-140)/(+20)"], ["54", "-7"]],
  [14, ["-4(+180)", "-(244/(-4))"], ["-720", "61"]],
  [15, ["(-2)×(+6.5)", "(-12)÷(-0.25)"], ["-13", "48"]],
  [16, ["-11+4+3", "-23-9-6"], ["-4", "-38"]],
  [17, ["(+16)-(+30)+(-12)", "(+15)+(-43)-(-26)"], ["-26", "-2"]],
  [18, ["(-3)×(+5)×(-4)", "(-96)÷(-12)÷(-4)"], ["60", "-2"]],
  [19, ["(+4)×(-9)÷(+6)", "-24/[(+3)(-16)]"], ["-6", "1/2"]],
  [20, ["6-6×6", "-7-6÷(-5)"], ["-30", "-5.8"]],
  [21, ["-85+(-5)×(-5)", "84-(+48)÷(-8)"], ["-60", "90"]],
  [25, ["1-(+8.5)+(-3)", "(-1)-(-2 5/12)+(-1)"], ["-10.5", "5/12"]],
  [26, ["(+5 1/2)(-4)(+1.5)", "[-3(-10 1/2)]/(-3 1/2)"], ["-33", "-9"]],
  [27, ["[(+34)-(-18)]/(-4)", "-42/[(-18)+(+3)]"], ["-13", "14/5"]],
  [28, ["(-14)-[(-4)-(-25)]", "-[(-0.7)-(+0.8)]+(-1.4)"], ["-35", "0.1"]],
  [29, ["(-3)×[(-5)-(+9)]", "[(-16)-(-4)]÷(-1/2)"], ["42", "24"]],
  [30, ["6-(10-12)-7", "6-(10-12-7)"], ["1", "15"]],
  [31, ["1-[2-(-3)]-4", "9-[-4-(13+8)]"], ["-8", "34"]],
  [32, ["(-3)(+4)(-0.5)(+5)", "[(-0.3)(0.2)]/[(0.8)(-1.5)]"], ["30", "1/20"]],
  [33, ["[5(-9)]/[-6+(-3)]", "[(-8)(-2)]/[12-(-4)]"], ["5", "1"]],
  [34, ["(+6)+(+20)÷(+4)×(-2)", "(-2)(3)-(-3)(-11)"], ["-4", "-39"]],
  [35, ["(-5)×(+2)-[(+16)+(-28)]", "[(-16)-(-8)(4)]÷(-1/2)"], ["2", "-32"]],
  [36, ["(-12)/(-4)+(+10)(-2/5)", "[30+(-3)]/[-6.5-(+2.5)]"], ["-1", "-3"]],
  [
    37,
    [
      "-12-[(-4)+(-6)(-2)]/[(-10)-(-8)]",
      "[(-1)(+1)+(-5)(-5)]/[(+2)-(-2)(+2)(-2)]",
    ],
    ["-8", "-4"],
  ],
  [
    38,
    ["[(-8)÷(+0.5)-(-8)]÷[(-0.2)×(-5)]", "[(-12)×3/8-(1-2/3)]÷(1/6)"],
    ["-8", "-29"],
  ],
];
function expand(
  exercise: TextbookQuestion["exercise"],
  rows: Row[],
): TextbookQuestion[] {
  return rows.flatMap(([question, expressions, answers]) =>
    expressions.map((expression, index) => ({
      id: `${exercise}-${question}${"abcd"[index]}`,
      exercise,
      question,
      part: "abcd"[index],
      expression,
      answer: answers[index],
      level: (
        exercise === "R2"
          ? question >= 25
          : exercise === "2B"
            ? question >= 21
            : question >= 20
      )
        ? 2
        : 1,
      page:
        exercise === "R2"
          ? question <= 21
            ? 56
            : question <= 32
              ? 57
              : 58
          : exercise === "2B"
            ? question <= 10
              ? 32
              : question <= 26
                ? 33
                : 34
            : question <= 4
              ? 46
              : question <= 16
                ? 47
                : 48,
    })),
  );
}
export const textbookQuestions = [
  ...expand("2B", exerciseB),
  ...expand("2C", exerciseC),
  ...expand("R2", revision),
];
