import { describe, expect, test } from "vitest";
import {
  applyOperation,
  BRIDGE_EQUATION,
  equationLatex,
  isolatedSolution,
  parseRational,
  rational,
  rationalLatex,
  rationalValue,
  replayOperations,
  sameEquation,
  solveEquation,
  TRANSFER_EQUATIONS,
  verifySolution,
  type Equation,
  type Operation,
} from "@/apps/equation-village/model";

const q = rational;
function apply(
  eq: Equation,
  kind: Operation["kind"],
  n: number,
  d = 1,
): Equation {
  const result = applyOperation(eq, { kind, amount: q(n, d) });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.equation;
}
function equation(a: number, b: number, c: number, d: number): Equation {
  return { left: { x: q(a), unit: q(b) }, right: { x: q(c), unit: q(d) } };
}

describe("exact number input", () => {
  test.each([
    ["4", 4, 1],
    [" -6/8 ", -3, 4],
    ["−0.125", -1, 8],
    [".5", 1, 2],
    ["3 / -2", -3, 2],
    ["+5.", 5, 1],
    ["-0", 0, 1],
    ["1000", 1000, 1],
  ])("parses %s exactly", (input, n, d) => {
    expect(parseRational(input as string)).toEqual(q(n as number, d as number));
  });
  test.each([
    "",
    " ",
    "2x",
    "1+2",
    "1e2",
    "Infinity",
    "NaN",
    "1/0",
    "0/0",
    "1/1001",
    "1001",
    "0.0001",
    "1.2.3",
    "1;alert(1)",
  ])("rejects %s", (input) => {
    expect(parseRational(input)).toBeNull();
  });
  test("normalises signs and rejects unsafe arithmetic", () => {
    expect(q(-8, -12)).toEqual({ n: 2, d: 3 });
    expect(q(0, -12)).toEqual({ n: 0, d: 1 });
    expect(() => q(1, 0)).toThrow(RangeError);
    expect(() => q(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });
});

describe("equivalence-preserving steps", () => {
  test("the complete bridge route keeps its original solution", () => {
    const initial = structuredClone(BRIDGE_EQUATION);
    const first = apply(initial, "subtract", 3);
    expect(equationLatex(first)).toBe("2x = 8");
    const last = apply(first, "divide", 2);
    expect(equationLatex(last)).toBe("x = 4");
    expect(isolatedSolution(last)).toEqual(q(4));
    expect(verifySolution(initial, q(4))).toBe(true);
    expect(verifySolution(initial, q(5))).toBe(false);
    expect(equationLatex(initial)).toBe("2x + 3 = 11");
  });
  test("division-first is accepted and divides every term", () => {
    const first = apply(BRIDGE_EQUATION, "divide", 2);
    expect(equationLatex(first)).toBe("x + \\frac{3}{2} = \\frac{11}{2}");
    const last = apply(first, "subtract", 3, 2);
    expect(isolatedSolution(last)).toEqual(q(4));
  });
  test("negative and fractional routes remain exact", () => {
    const initial = equation(3, -4, 0, -10);
    expect(
      isolatedSolution(apply(apply(initial, "add", 4), "divide", 3)),
    ).toEqual(q(-2));
    const halves = apply(equation(2, 0, 0, 3), "divide", 2);
    expect(isolatedSolution(halves)).toEqual(q(3, 2));
    expect(verifySolution(equation(2, 0, 0, 3), q(3, 2))).toBe(true);
  });
  test.each(["multiply", "divide"] as const)(
    "%s by zero is rejected without changing the equation",
    (kind) => {
      const original = structuredClone(BRIDGE_EQUATION);
      expect(applyOperation(original, { kind, amount: q(0) })).toEqual({
        ok: false,
        error: "zero-operation",
      });
      expect(sameEquation(original, BRIDGE_EQUATION)).toBe(true);
    },
  );
  test.each([
    { kind: "add", amount: q(0) },
    { kind: "subtract", amount: q(0) },
    { kind: "multiply", amount: q(1) },
    { kind: "divide", amount: q(1) },
  ] as Operation[])("identity operation $kind has no progress", (operation) => {
    expect(applyOperation(BRIDGE_EQUATION, operation)).toEqual({
      ok: true,
      equation: BRIDGE_EQUATION,
      changed: false,
    });
  });
  test("large equivalent steps report a display limit, not a wrong answer", () => {
    expect(
      applyOperation(BRIDGE_EQUATION, { kind: "multiply", amount: q(1000) }),
    ).toEqual({ ok: false, error: "out-of-range" });
  });
  test("malformed stored input is rejected", () => {
    expect(
      applyOperation(BRIDGE_EQUATION, {
        kind: "add",
        amount: { n: Infinity, d: 1 },
      }),
    ).toEqual({ ok: false, error: "invalid-number" });
    expect(
      applyOperation(BRIDGE_EQUATION, {
        kind: "power",
        amount: q(2),
      } as unknown as Operation),
    ).toEqual({ ok: false, error: "invalid-number" });
  });
  test("solution invariance across varied equations and nonzero operations", () => {
    let checked = 0;
    for (const a of [-3, -1, 1, 4]) {
      for (const c of [-2, 0, 2]) {
        if (a === c) continue;
        for (const solution of [-4, -1, 0, 3]) {
          const initial = equation(a, 5, c, (a - c) * solution + 5);
          for (const kind of [
            "add",
            "subtract",
            "multiply",
            "divide",
          ] as const) {
            for (const amount of [-3, -1, 2, 5]) {
              const transformed = apply(initial, kind, amount);
              const actual = solveEquation(transformed);
              expect(actual).toEqual({ kind: "unique", value: q(solution) });
              // Independent numeric substitution at the known solution and nearby non-solutions.
              for (const candidate of [solution - 1, solution, solution + 1]) {
                const left =
                  rationalValue(transformed.left.x) * candidate +
                  rationalValue(transformed.left.unit);
                const right =
                  rationalValue(transformed.right.x) * candidate +
                  rationalValue(transformed.right.unit);
                expect(Math.abs(left - right) < 1e-9).toBe(
                  candidate === solution,
                );
              }
              checked++;
            }
          }
        }
      }
    }
    expect(checked).toBe(768);
  });
});

describe("solution and presentation semantics", () => {
  test("recognises isolation on either side without claiming 2x is isolated", () => {
    expect(isolatedSolution(equation(0, 4, 1, 0))).toEqual(q(4));
    expect(isolatedSolution(equation(2, 0, 0, 8))).toBeNull();
    expect(isolatedSolution(equation(1, 2, 0, 6))).toBeNull();
    expect(solveEquation(equation(4, 2, 2, 10))).toEqual({
      kind: "unique",
      value: q(4),
    });
  });
  test("distinguishes no solution and infinitely many solutions", () => {
    expect(solveEquation(equation(2, 1, 2, 2))).toEqual({ kind: "none" });
    expect(solveEquation(equation(2, 1, 2, 1))).toEqual({ kind: "infinite" });
    expect(isolatedSolution(equation(0, 0, 0, 0))).toBeNull();
  });
  test("formats signs and fractions without misleading plus-minus strings", () => {
    expect(equationLatex(equation(-1, -3, 0, 0))).toBe("-x - 3 = 0");
    expect(rationalLatex(q(-2, 3))).toBe("-\\frac{2}{3}");
  });
  test("transfer and retry have different verified solutions", () => {
    expect(TRANSFER_EQUATIONS.map(solveEquation)).toEqual([
      { kind: "unique", value: q(5) },
      { kind: "unique", value: q(6) },
    ]);
    expect(verifySolution(TRANSFER_EQUATIONS[1], q(5))).toBe(false);
  });
});

describe("saved working validation", () => {
  test("replays canonical working and strips no-op inflation", () => {
    const restored = replayOperations(BRIDGE_EQUATION, [
      { kind: "add", amount: q(0) },
      { kind: "subtract", amount: { n: 6, d: 2 } },
      { kind: "divide", amount: q(2) },
    ]);
    expect(restored?.operations).toHaveLength(2);
    expect(restored?.operations[0].amount).toEqual(q(3));
    expect(restored && isolatedSolution(restored.equation)).toEqual(q(4));
  });
  test.each([
    { history: null },
    { history: {} },
    { history: [{ kind: "divide", amount: { n: 0, d: 1 } }] },
    { history: [{ kind: "add" }] },
    { history: Array(41).fill({ kind: "add", amount: { n: 0, d: 1 } }) },
  ])("rejects corrupt or excessive history %#", ({ history }) => {
    expect(replayOperations(BRIDGE_EQUATION, history)).toBeNull();
  });
});
