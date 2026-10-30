/** Exact, renderer-independent algebra for the Equation Village prototype. */
export interface Rational {
  n: number;
  d: number;
}

export interface AffineExpression {
  x: Rational;
  unit: Rational;
}

export interface Equation {
  left: AffineExpression;
  right: AffineExpression;
}

export type OperationKind = "add" | "subtract" | "multiply" | "divide";
export interface Operation {
  kind: OperationKind;
  amount: Rational;
}

export type OperationResult =
  | { ok: true; equation: Equation; changed: boolean }
  | {
      ok: false;
      error: "invalid-number" | "zero-operation" | "out-of-range";
    };

export type Solution =
  { kind: "unique"; value: Rational } | { kind: "none" } | { kind: "infinite" };

/** Display limits, not algebraic rules. Larger equivalent steps remain valid maths. */
export const EQUATION_LIMITS = {
  magnitude: 1000,
  denominator: 1000,
  historyLength: 40,
} as const;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function rational(n: number, d = 1): Rational {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) {
    throw new RangeError(
      "A rational needs safe integer parts and a nonzero denominator.",
    );
  }
  if (n === 0) return { n: 0, d: 1 };
  const divisor = gcd(n, d);
  return { n: (n / divisor) * Math.sign(d), d: Math.abs(d / divisor) };
}

function isRational(value: unknown): value is Rational {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Rational>;
  return Number.isSafeInteger(q.n) && Number.isSafeInteger(q.d) && q.d !== 0;
}

function add(a: Rational, b: Rational): Rational {
  return rational(a.n * b.d + b.n * a.d, a.d * b.d);
}

function subtract(a: Rational, b: Rational): Rational {
  return rational(a.n * b.d - b.n * a.d, a.d * b.d);
}

function multiply(a: Rational, b: Rational): Rational {
  // Cross-cancellation reduces intermediate integers as well as the result.
  const first = gcd(a.n, b.d);
  const second = gcd(b.n, a.d);
  return rational(
    (a.n / first) * (b.n / second),
    (a.d / second) * (b.d / first),
  );
}

function divide(a: Rational, b: Rational): Rational {
  return multiply(a, rational(b.d, b.n));
}

function equal(a: Rational, b: Rational): boolean {
  const qa = rational(a.n, a.d);
  const qb = rational(b.n, b.d);
  return qa.n === qb.n && qa.d === qb.d;
}

function inDisplayRange(q: Rational): boolean {
  const value = rational(q.n, q.d);
  return (
    Math.abs(value.n) <= EQUATION_LIMITS.magnitude * value.d &&
    value.d <= EQUATION_LIMITS.denominator
  );
}

function normaliseEquation(value: unknown): Equation | null {
  if (!value || typeof value !== "object") return null;
  const eq = value as Partial<Equation>;
  if (
    !eq.left ||
    !eq.right ||
    !isRational(eq.left.x) ||
    !isRational(eq.left.unit) ||
    !isRational(eq.right.x) ||
    !isRational(eq.right.unit)
  )
    return null;
  return {
    left: {
      x: rational(eq.left.x.n, eq.left.x.d),
      unit: rational(eq.left.unit.n, eq.left.unit.d),
    },
    right: {
      x: rational(eq.right.x.n, eq.right.x.d),
      unit: rational(eq.right.unit.n, eq.right.unit.d),
    },
  };
}

export function rationalValue(value: Rational): number {
  return value.n / value.d;
}

/** Accept ordinary integer, decimal or fraction input, never JavaScript expressions. */
export function parseRational(input: string): Rational | null {
  if (typeof input !== "string" || input.length > 40) return null;
  const text = input.trim().replaceAll("−", "-");
  let result: Rational;
  try {
    const fraction = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(text);
    if (fraction) {
      result = rational(Number(fraction[1]), Number(fraction[2]));
    } else {
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
      const sign = text.startsWith("-") ? -1 : 1;
      const unsigned = text.replace(/^[+-]/, "");
      const [whole, decimals = ""] = unsigned.split(".");
      // Long decimals cannot preserve bounded exact integer arithmetic.
      if (decimals.length > 6) return null;
      const denominator = 10 ** decimals.length;
      result = rational(
        sign * (Number(whole || "0") * denominator + Number(decimals || "0")),
        denominator,
      );
    }
    return inDisplayRange(result) ? result : null;
  } catch {
    return null;
  }
}

export function sameEquation(a: Equation, b: Equation): boolean {
  return (
    equal(a.left.x, b.left.x) &&
    equal(a.left.unit, b.left.unit) &&
    equal(a.right.x, b.right.x) &&
    equal(a.right.unit, b.right.unit)
  );
}

/** Apply the same reversible constant operation to every term on both sides. */
export function applyOperation(
  equation: Equation,
  operation: Operation,
): OperationResult {
  const eq = normaliseEquation(equation);
  if (
    !eq ||
    !operation ||
    !["add", "subtract", "multiply", "divide"].includes(operation.kind) ||
    !isRational(operation.amount)
  )
    return { ok: false, error: "invalid-number" };

  const amount = rational(operation.amount.n, operation.amount.d);
  if (
    (operation.kind === "multiply" || operation.kind === "divide") &&
    amount.n === 0
  ) {
    return { ok: false, error: "zero-operation" };
  }
  if (!inDisplayRange(amount)) return { ok: false, error: "out-of-range" };

  try {
    function transform(side: AffineExpression): AffineExpression {
      if (operation.kind === "add")
        return { x: side.x, unit: add(side.unit, amount) };
      if (operation.kind === "subtract")
        return { x: side.x, unit: subtract(side.unit, amount) };
      const scale = operation.kind === "multiply" ? multiply : divide;
      return { x: scale(side.x, amount), unit: scale(side.unit, amount) };
    }
    const next = { left: transform(eq.left), right: transform(eq.right) };
    if (
      ![next.left.x, next.left.unit, next.right.x, next.right.unit].every(
        inDisplayRange,
      )
    ) {
      return { ok: false, error: "out-of-range" };
    }
    return { ok: true, equation: next, changed: !sameEquation(eq, next) };
  } catch {
    return { ok: false, error: "out-of-range" };
  }
}

/** This classifier is useful for validation, not an invitation to teach all cases in Stage B. */
export function solveEquation(equation: Equation): Solution {
  const coefficient = subtract(equation.left.x, equation.right.x);
  const constant = subtract(equation.right.unit, equation.left.unit);
  if (coefficient.n === 0)
    return { kind: constant.n === 0 ? "infinite" : "none" };
  return { kind: "unique", value: divide(constant, coefficient) };
}

export function isolatedSolution(equation: Equation): Rational | null {
  const one = rational(1);
  const { left, right } = equation;
  if (equal(left.x, one) && left.unit.n === 0 && right.x.n === 0) {
    return rational(right.unit.n, right.unit.d);
  }
  if (equal(right.x, one) && right.unit.n === 0 && left.x.n === 0) {
    return rational(left.unit.n, left.unit.d);
  }
  return null;
}

export function verifySolution(original: Equation, value: Rational): boolean {
  const equation = normaliseEquation(original);
  if (!equation || !isRational(value)) return false;
  try {
    const left = add(multiply(equation.left.x, value), equation.left.unit);
    const right = add(multiply(equation.right.x, value), equation.right.unit);
    return equal(left, right);
  } catch {
    return false;
  }
}

export function rationalLatex(value: Rational): string {
  const q = rational(value.n, value.d);
  if (q.d === 1) return String(q.n);
  return `${q.n < 0 ? "-" : ""}\\frac{${Math.abs(q.n)}}{${q.d}}`;
}

function expressionLatex(side: AffineExpression): string {
  const x = rational(side.x.n, side.x.d);
  const unit = rational(side.unit.n, side.unit.d);
  if (x.n === 0) return rationalLatex(unit);
  const coefficient = equal(x, rational(1))
    ? ""
    : equal(x, rational(-1))
      ? "-"
      : rationalLatex(x);
  const variableTerm = `${coefficient}x`;
  if (unit.n === 0) return variableTerm;
  return `${variableTerm} ${unit.n < 0 ? "-" : "+"} ${rationalLatex(rational(Math.abs(unit.n), unit.d))}`;
}

export function equationLatex(equation: Equation): string {
  return `${expressionLatex(equation.left)} = ${expressionLatex(equation.right)}`;
}

/** Rebuild saved working from its original equation; never trust a stored final answer. */
export function replayOperations(
  original: Equation,
  operations: unknown,
): {
  equation: Equation;
  operations: Operation[];
} | null {
  const initial = normaliseEquation(original);
  if (
    !initial ||
    !Array.isArray(operations) ||
    operations.length > EQUATION_LIMITS.historyLength
  )
    return null;
  let equation = initial;
  const accepted: Operation[] = [];
  for (const candidate of operations) {
    if (!candidate || typeof candidate !== "object") return null;
    const operation = candidate as Operation;
    const result = applyOperation(equation, operation);
    if (!result.ok) return null;
    // No-op steps are harmless, but must not inflate progress or working history.
    if (!result.changed) continue;
    equation = result.equation;
    accepted.push({
      kind: operation.kind,
      amount: rational(operation.amount.n, operation.amount.d),
    });
  }
  return { equation, operations: accepted };
}

function makeEquation(x: number, unit: number, right: number): Equation {
  return {
    left: { x: rational(x), unit: rational(unit) },
    right: { x: rational(0), unit: rational(right) },
  };
}

export const BRIDGE_EQUATION = makeEquation(2, 3, 11);
export const TRANSFER_EQUATIONS: readonly Equation[] = [
  makeEquation(3, 2, 17),
  makeEquation(2, 5, 17),
];
