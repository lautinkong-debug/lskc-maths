import { describe, expect, it } from "vitest";
import {
  abs,
  add,
  compare,
  div,
  equals,
  mul,
  neg,
  rational,
  readNumber,
  sign,
  sub,
  terminates,
  toSpeech,
  toTex,
  toText,
} from "./rational";
import { evaluate, parse, parseAnswer } from "./parse";
import {
  autoRange,
  birdFor,
  hops,
  journeyHops,
  moveFor,
  parseJourney,
} from "./moves";

describe("bird number-line method", () => {
  it.each([
    ["+", 7, false, false, "right", "right", 0, "right"],
    ["+", -7, false, true, "right", "left", 1, "left"],
    ["-", 4, true, false, "left", "left", 1, "left"],
    ["-", -4, true, true, "left", "right", 2, "right"],
    ["+", 0, false, false, "right", "right", 0, "none"],
    ["-", 0, true, false, "left", "left", 1, "none"],
  ] as const)(
    "turns once per minus sign for %s (%s)",
    (
      op,
      b,
      operationTurn,
      numberTurn,
      afterOperation,
      facing,
      turns,
      travel,
    ) => {
      expect(birdFor(op, b)).toEqual({
        operationTurn,
        numberTurn,
        afterOperation,
        facing,
        turns,
        distance: Math.abs(b),
        travel,
      });
      expect(moveFor(op, b).direction).toBe(travel);
      for (const start of [-20, -2, 0, 3, 20]) {
        const last = hops(start, op, b).at(-1)!;
        expect(last.to).toBe(
          start +
            (travel === "left"
              ? -Math.abs(b)
              : travel === "right"
                ? Math.abs(b)
                : 0),
        );
      }
    },
  );
  it("reaches the video positions and the teacher's double-minus example", () => {
    expect(hops(3, "+", -7).at(-1)?.to).toBe(-4);
    expect(hops(-2, "-", -4).at(-1)?.to).toBe(2);
    expect(hops(3, "-", -5).at(-1)?.to).toBe(8);
  });
  it("walks one unit at a time for every allowed magnitude and sign combination", () => {
    for (const op of ["+", "-"] as const) {
      for (let b = -20; b <= 20; b++) {
        const frames = hops(-2, op, b, true);
        expect(frames).toHaveLength(Math.max(1, Math.abs(b)));
        expect(frames.at(-1)?.to).toBe(-2 + (op === "+" ? b : -b));
        for (const frame of frames) {
          expect(Math.abs(frame.to - frame.from)).toBe(b === 0 ? 0 : 1);
        }
      }
    }
    const chain = journeyHops(
      {
        start: 3,
        moves: [
          { op: "+", b: -14 },
          { op: "-", b: -20 },
        ],
      },
      true,
    );
    expect(chain).toHaveLength(34);
    expect(chain[14].from).toBe(-11);
    expect(chain.at(-1)?.to).toBe(9);
  });
});
describe("exact directed numbers", () => {
  it("normalises fractions and negative zero", () => {
    expect(rational(6, -8)).toEqual({ n: -3, d: 4 });
    for (const text of ["-0", "+0", "0.00", "−0/7"])
      expect(readNumber(text)).toEqual({ n: 0, d: 1 });
    expect(add(readNumber("0.1"), readNumber("0.2"))).toEqual(
      readNumber("0.3"),
    );
    expect(readNumber("-1 1/4")).toEqual(rational(-5, 4));
  });
  it("uses exact arithmetic and comparison, including large intermediate products", () => {
    expect(sub(rational(1, 3), rational(1, 2))).toEqual(rational(-1, 6));
    expect(
      mul(
        rational(Number.MAX_SAFE_INTEGER, 2),
        rational(2, Number.MAX_SAFE_INTEGER),
      ),
    ).toEqual(rational(1));
    expect(
      compare(
        rational(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER),
        rational(1),
      ),
    ).toBe(-1);
    expect(equals(readNumber("-2.5"), readNumber("-2 1/2"))).toBe(true);
    expect(abs(rational(-2))).toEqual(rational(2));
    expect(sign(neg(rational(2)))).toBe(-1);
    expect(div(rational(1), rational(0))).toEqual({
      ok: false,
      code: "divisionByZero",
    });
    expect(() => add(rational(Number.MAX_SAFE_INTEGER), rational(1))).toThrow(
      "overflow",
    );
    expect(() => readNumber("9007199254740992")).toThrow("overflow");
  });
  it("formats signed values without rounding or signed zero", () => {
    expect(toText(rational(0), { signed: true })).toBe("0");
    expect(toText(rational(3), { signed: true })).toBe("+3");
    expect(toText(rational(-5, 2), { style: "mixed" })).toBe("−2 1/2");
    expect(toText(rational(1, 8), { style: "decimal" })).toBe("0.125");
    expect(toTex(rational(-1, 3))).toBe("-\\frac{1}{3}");
    expect(toSpeech(rational(-5, 2))).toBe("minus 5 over 2");
    expect(terminates(rational(1, 3))).toBe(false);
    expect(toText(rational(1, 3), { style: "decimal" })).toBe("1/3");
  });
});
const fixtures = [
  ["(+2) + (+4)", "6"],
  ["(−7) + (+3)", "−4"],
  ["(+3) + (−3)", "0"],
  ["(−4) + (−2)", "−6"],
  ["(+3) − (+5)", "−2"],
  ["(−1) − (+3)", "−4"],
  ["(+3) − (−3)", "6"],
  ["(−1) − (−5)", "4"],
  ["(+2) + (−3) − (−8)", "7"],
  ["(−1) − (+3.8) − (−1.5)", "−3.3"],
  ["−3/2 + [4 + (−5)]", "−5/2"],
  ["(+4) + (−17) − (−26)", "13"],
  ["−5 − (−27) + (−15)", "7"],
  ["(−5) × (−4)", "20"],
  ["(+6)(−2)", "−12"],
  ["6(−2)", "−12"],
  ["(+2) × (−4) × (−7)", "56"],
  ["(−4)(−5)(−0.5)", "−10"],
  ["(−35) ÷ (+7)", "−5"],
  ["(−81) ÷ (−9)", "9"],
  ["(−72) ÷ (−6) ÷ (−2)", "−6"],
  ["(−72) ÷ [(−6) ÷ (−2)]", "−24"],
  ["(+6) ÷ (−3/5) × (+5)", "−50"],
  ["(−1 1/4) ÷ [(−2) × (+5)]", "1/8"],
  ["(+7) × (−1/14) × (+3)", "−3/2"],
  ["(+18) ÷ (−4.5) ÷ (−0.5)", "8"],
  ["(−9)(+4)(−5)", "180"],
  ["−5(+6)(+4)", "−120"],
  ["(−7) − (−6) × (−5)", "−37"],
  ["[(+2) + (−8)] ÷ (−3)", "2"],
  ["(−8) ÷ (−2) − (−4) × (+1 1/2)", "10"],
  ["−1 − 9/(7 + (−10))", "2"],
  ["−(−4)(−12)", "−48"],
  ["(+9) × (−2) ÷ (−3)", "6"],
  ["(+60) ÷ (−20) × (+3)", "−9"],
  ["(+4) − [(+4) + (+2)]", "−2"],
  ["3(−5)/(3 + (−5))", "15/2"],
  ["[(−20) − (−13) + (−1)] / [(−3)(+2) − 4]", "4/5"],
  ["6÷2÷3", "1"],
  ["6 ÷ 2/3", "9"],
  ["{2 + 3} × (−2)", "−10"],
  ["2x(−3)", "−6"],
  ["2X(−3)", "−6"],
  ["2·(−3)", "−6"],
] as const;
describe("expression parser", () => {
  it("treats spaces around fraction bars consistently", () => {
    const result = parse("6 ÷ 2 / 3");
    expect(result.ok).toBe(true);
    if (result.ok) expect(evaluate(result.value)).toEqual(rational(9));
    expect(parse("6 / 2 / 3")).toMatchObject({
      ok: false,
      code: "ambiguousFraction",
    });
    expect(parseAnswer("−2 1 / 2")).toMatchObject({
      ok: true,
      value: rational(-5, 2),
    });
  });
  it.each(fixtures)("evaluates %s exactly", (expression, expected) => {
    for (const input of [
      expression,
      expression.replaceAll("−", "-"),
      expression.replaceAll("−", "–"),
    ]) {
      const result = parse(input);
      expect(result.ok, JSON.stringify(result)).toBe(true);
      if (result.ok)
        expect(evaluate(result.value)).toEqual(readNumber(expected));
    }
  });
  it.each([
    ["3 × −2", "signedOperand"],
    ["(−3", "brackets"],
    ["4 +", "missingNumber"],
    ["5 ÷ 0", "divisionByZero"],
    ["0 × (2 ÷ 0)", "divisionByZero"],
    ["6/2/3", "ambiguousFraction"],
    ["()", "emptyBrackets"],
    ["2 ++ 3", "signedOperand"],
    ["2 + +3", "signedOperand"],
    ["[3)", "brackets"],
    ["2^6", "powerExponent"],
    ["alert(1)", "unknown"],
    ["1".repeat(81), "tooLong"],
    ["9007199254740992", "overflow"],
    ["", "missingNumber"],
  ])("rejects %s with a useful error", (input, code) => {
    const result = parse(input);
    expect(result).toMatchObject({ ok: false, code });
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(10);
      expect(result.span.start).toBeGreaterThanOrEqual(0);
    }
  });
  it("keeps source positions and sign/bracket information", () => {
    const result = parse("(+3) − (−5)");
    expect(result).toMatchObject({
      ok: true,
      value: {
        kind: "binary",
        span: { start: 0, end: 11 },
        right: {
          kind: "group",
          child: { explicitSign: true, bracketed: true },
        },
      },
    });
  });
  it("accepts equivalent answers, but not a calculation as an answer", () => {
    for (const input of ["-2.5", "−5/2", "-2 1/2"])
      expect(parseAnswer(input)).toEqual({ ok: true, value: rational(-5, 2) });
    expect(parseAnswer("+3")).toEqual(parseAnswer("3"));
    expect(parseAnswer("1+2").ok).toBe(false);
  });
});
describe("number-line journeys", () => {
  it("covers every start and signed move in the lesson range", () => {
    for (let a = -20; a <= 20; a++)
      for (let b = -20; b <= 20; b++)
        for (const op of ["+", "-"] as const) {
          const result = a + (op === "+" ? b : -b);
          const frames = hops(a, op, b);
          expect(frames[0].from).toBe(a);
          expect(frames.at(-1)!.to).toBe(result);
          expect(moveFor(op, b).direction).toBe(
            result === a ? "none" : result > a ? "right" : "left",
          );
          expect(frames.length).toBe(
            Math.abs(b) > 10 || b === 0 ? 1 : Math.abs(b),
          );
          const range = autoRange([a, result]);
          expect(range.min).toBeLessThan(Math.min(a, result, 0));
          expect(range.max).toBeGreaterThan(Math.max(a, result, 0));
        }
  });
  it("chains moves, preserving start and end", () => {
    const parsed = parseJourney("0 + (+9) + (−11) + (+6)");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const frames = journeyHops(parsed.value);
      expect(frames.at(-1)!.to).toBe(4);
      expect(frames.filter((frame) => frame.moveIndex === 1)).toHaveLength(1);
    }
  });
  it.each([
    "21 + 1",
    "0 + 21",
    "1 + 0.5",
    "2 × 3",
    "2 + (3 − 1)",
    "0+1+1+1+1+1",
    "2",
  ])("keeps %s outside this lesson's scope", (input) =>
    expect(parseJourney(input).ok).toBe(false),
  );
});
