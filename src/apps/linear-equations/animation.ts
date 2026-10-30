import { preparation, type Scene } from "./transformations";
import { parse, linear, sides, solve, rationalText, type Node } from "./engine";
import {
  rational,
  add,
  mul,
  neg,
  div,
  toTex,
  type Rational,
} from "../directed-numbers/lib/rational";
export type Term = {
  id: string;
  coefficient: Rational;
  variable: boolean;
  tex?: string;
  decimal?: boolean;
};
export type Frame = {
  equation: string;
  left: Term[];
  right: Term[];
  kind:
    | "original"
    | "expand"
    | "distribute"
    | "cancel"
    | "denominators"
    | "move"
    | "combine"
    | "divide"
    | "finish";
  scene?: Scene;
  moved?: string;
  operation?: string;
  factor?: string;
  from?: "left" | "right";
};
const one = rational(1);
function divide(a: Rational, b: Rational) {
  const result = div(a, b);
  if (!result.ok) throw Error(result.code);
  return result.value;
}
function expand(n: Node, v: string, scale = one): Omit<Term, "id">[] {
  if (n.kind === "group") return expand(n.child, v, scale);
  if (n.kind === "negative") return expand(n.child, v, neg(scale));
  if (n.kind === "binary") {
    if (n.op === "+" || n.op === "-")
      return [
        ...expand(n.left, v, scale),
        ...expand(n.right, v, n.op === "-" ? neg(scale) : scale),
      ];
    const l = linear(n.left, v),
      r = linear(n.right, v);
    if (n.op === "/") return expand(n.left, v, divide(scale, r.b));
    if (!l.a.n) return expand(n.right, v, mul(scale, l.b));
    if (!r.a.n) return expand(n.left, v, mul(scale, r.b));
  }
  const t = linear(n, v);
  return t.a.n
    ? [{ coefficient: mul(t.a, scale), variable: true }]
    : [{ coefficient: mul(t.b, scale), variable: false }];
}
function rawTerm(t: Term, v: string) {
  return t.variable
    ? t.coefficient.n === t.coefficient.d
      ? v
      : t.coefficient.n === -t.coefficient.d
        ? "-" + v
        : rationalText(t.coefficient, t.decimal) + "*" + v
    : rationalText(t.coefficient, t.decimal);
}
function side(ts: Term[], v: string) {
  return ts.length
    ? ts
        .map((t, i) => (i && t.coefficient.n >= 0 ? "+" : "") + rawTerm(t, v))
        .join("")
    : "0";
}
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
export function termTex(t: Term, v: string, first: boolean): string {
  if (t.tex) return t.tex;
  const n = t.coefficient.n,
    positive = n >= 0,
    magnitude = positive ? t.coefficient : neg(t.coefficient);
  const number = (v: Rational) =>
    t.decimal && !rationalText(v, true).includes("/")
      ? rationalText(v, true)
      : toTex(v);
  const body = t.variable
    ? (magnitude.n === magnitude.d ? "" : number(magnitude)) + v
    : number(magnitude);
  return (positive ? (first ? "" : "+") : "-") + body;
}
export function frames(equation: string, variable: string): Frame[] {
  let uid = 0;
  const decimal = equation.includes(".") && !equation.includes("/");
  const text = (v: Rational) => rationalText(v, decimal);
  const tex = (v: Rational) =>
    decimal && !text(v).includes("/") ? text(v) : toTex(v);
  const preparationSteps = preparation(equation, variable);
  const parts = sides(preparationSteps.at(-1)?.equation ?? equation);
  let [left, right] = parts.map((p) =>
    expand(parse(p), variable).map((t) => ({ ...t, decimal, id: "t" + uid++ })),
  );
  const out: Frame[] = [
    { equation, left: [], right: [], kind: "original" },
    ...preparationSteps.map((f) => ({ ...f, left: [], right: [] })),
  ];
  const push = (kind: Frame["kind"], extra: Partial<Frame> = {}) =>
    out.push({
      equation: side(left, variable) + "=" + side(right, variable),
      left: [...left],
      right: [...right],
      kind,
      ...extra,
    });
  const readyEquation = side(left, variable) + "=" + side(right, variable);
  if (
    out.at(-1)!.equation.replaceAll("−", "-") ===
    readyEquation.replaceAll("−", "-")
  ) {
    out.at(-1)!.left = [...left];
    out.at(-1)!.right = [...right];
  } else push("expand");
  const denominator = [...left, ...right].reduce(
    (d, t) => (d / gcd(d, t.coefficient.d)) * t.coefficient.d,
    1,
  );
  if (equation.includes("/") && denominator !== 1) {
    const factor = rational(denominator);
    left = left.map((t) => ({ ...t, coefficient: mul(t.coefficient, factor) }));
    right = right.map((t) => ({
      ...t,
      coefficient: mul(t.coefficient, factor),
    }));
    push("denominators", { factor: String(denominator) });
  }
  for (const t of [...right].filter((t) => t.variable && t.coefficient.n)) {
    right = right.filter((s) => s.id !== t.id);
    left = [...left, { ...t, coefficient: neg(t.coefficient) }];
    push("move", {
      moved: t.id,
      from: "right",
      operation: termTex(
        { ...t, coefficient: neg(t.coefficient) },
        variable,
        false,
      ),
    });
  }
  for (const t of [...left].filter((t) => !t.variable && t.coefficient.n)) {
    left = left.filter((s) => s.id !== t.id);
    right = [...right, { ...t, coefficient: neg(t.coefficient) }];
    push("move", {
      moved: t.id,
      from: "left",
      operation: termTex(
        { ...t, coefficient: neg(t.coefficient) },
        variable,
        false,
      ),
    });
  }
  const a = left.reduce((s, t) => add(s, t.coefficient), rational(0));
  const b = right.reduce((s, t) => add(s, t.coefficient), rational(0));
  left = [{ id: "coefficient", coefficient: a, variable: true, decimal }];
  right = [{ id: "constant", coefficient: b, variable: false, decimal }];
  push("combine");
  if (a.n !== a.d) {
    out.push({
      equation: variable + "=(" + text(b) + ")/(" + text(a) + ")",
      left: [{ id: "unknown", coefficient: one, variable: true, decimal }],
      right: [
        {
          id: "quotient",
          coefficient: divide(b, a),
          variable: false,
          tex: "\\frac{" + tex(b) + "}{" + tex(a) + "}",
        },
      ],
      kind: "divide",
      factor: text(a),
    });
  }
  const answer = solve(equation, variable);
  out.push({
    equation: variable + "=" + text(answer),
    left: [{ id: "unknown", coefficient: one, variable: true, decimal }],
    right: [{ id: "answer", coefficient: answer, variable: false, decimal }],
    kind: "finish",
  });
  return out;
}
