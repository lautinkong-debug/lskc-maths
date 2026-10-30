import {
  add,
  sub,
  mul,
  neg,
  div,
  rational,
  readNumber,
  equals,
  toTex,
  toText,
  type Rational,
} from "../directed-numbers/lib/rational";

/** Keep terminating decimals in decimal questions; rational arithmetic stays exact. */
export function rationalText(value: Rational, decimal = false): string {
  if (decimal) {
    let denominator = value.d,
      twos = 0,
      fives = 0;
    while (denominator % 2 === 0) {
      denominator /= 2;
      twos++;
    }
    while (denominator % 5 === 0) {
      denominator /= 5;
      fives++;
    }
    if (denominator === 1 && Math.max(twos, fives) <= 12)
      return (value.n / value.d)
        .toFixed(Math.max(twos, fives))
        .replace(/(\.\d*?)0+$/, "$1")
        .replace(/\.$/, "");
  }
  return toText(value);
}
// A deliberately small grammar for authored linear equations. Never evaluates code.
export type Node =
  | { kind: "number" | "variable"; value: string }
  | { kind: "negative" | "group"; child: Node }
  | { kind: "binary"; op: string; left: Node; right: Node };
function quotient(a: Rational, b: Rational) {
  const result = div(a, b);
  if (!result.ok) throw new Error(result.code);
  return result.value;
}
export function parse(raw: string): Node {
  if (raw.length > 200) throw new Error("Expression too long");
  const source = raw.replace(/[−–]/g, "-").replace(/\s/g, "");
  const tokens = source.match(/\d+(?:\.\d+)?|[a-zA-Z]|[()+*/-]/g) ?? [];
  if (tokens.join("") !== source) throw new Error("Unsupported expression");
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  function atom(): Node {
    if (peek() === "-") {
      take();
      return { kind: "negative", child: atom() };
    }
    if (peek() === "+") {
      take();
      return atom();
    }
    const token = take();
    if (token === "(") {
      const child = sum();
      if (take() !== ")") throw new Error("Unclosed bracket");
      return { kind: "group", child };
    }
    if (/^\d+(?:\.\d+)?$/.test(token ?? ""))
      return { kind: "number", value: token };
    if (/^[a-zA-Z]$/.test(token ?? ""))
      return { kind: "variable", value: token };
    throw new Error("Missing operand");
  }
  function product(): Node {
    let left = atom();
    while (peek() === "*" || peek() === "/")
      left = { kind: "binary", op: take(), left, right: atom() };
    return left;
  }
  function sum(): Node {
    let left = product();
    while (peek() === "+" || peek() === "-")
      left = { kind: "binary", op: take(), left, right: product() };
    return left;
  }
  const result = sum();
  if (position !== tokens.length) throw new Error("Unexpected token");
  return result;
}

function ungroupForFraction(node: Node): Node {
  return node.kind === "group" ? ungroupForFraction(node.child) : node;
}
export function bracketDepth(node: Node): number {
  if (node.kind === "group") return 1 + bracketDepth(node.child);
  if (node.kind === "negative") return bracketDepth(node.child);
  if (node.kind === "binary")
    return Math.max(
      bracketDepth(node.op === "/" ? ungroupForFraction(node.left) : node.left),
      bracketDepth(
        node.op === "/" ? ungroupForFraction(node.right) : node.right,
      ),
    );
  return 0;
}
export function bracketTex(group: Node, content: string): string {
  const pairs = [
    ["(", ")"],
    ["[", "]"],
    ["\\{", "\\}"],
  ];
  const pair = pairs[Math.max(0, bracketDepth(group) - 1) % 3];
  return "\\left" + pair[0] + content + "\\right" + pair[1];
}

export function render(node: Node, value?: Rational): string {
  switch (node.kind) {
    case "number":
      return node.value;
    case "variable":
      return value ? `\\left(${toTex(value)}\\right)` : node.value;
    case "group":
      return bracketTex(node, render(node.child, value));
    case "negative":
      return `-${render(node.child, value)}`;
    case "binary": {
      const left = render(node.left, value),
        right = render(node.right, value);
      if (node.op === "/")
        return `\\frac{${render(ungroupForFraction(node.left), value)}}{${render(ungroupForFraction(node.right), value)}}`;
      if (node.op === "*")
        return `${left}${node.right.kind === "variable" || node.right.kind === "group" ? "\\," : "\\times "}${right}`;
      return `${left}${node.op}${right}`;
    }
  }
}
type Linear = { a: Rational; b: Rational };
export function linear(node: Node, variable: string): Linear {
  const zero = rational(0);
  switch (node.kind) {
    case "number":
      return { a: zero, b: readNumber(node.value) };
    case "variable":
      if (node.value !== variable) throw new Error("Unexpected variable");
      return { a: rational(1), b: zero };
    case "group":
      return linear(node.child, variable);
    case "negative": {
      const v = linear(node.child, variable);
      return { a: neg(v.a), b: neg(v.b) };
    }
    case "binary": {
      const l = linear(node.left, variable),
        r = linear(node.right, variable);
      if (node.op === "+" || node.op === "-") {
        const combine = node.op === "+" ? add : sub;
        return { a: combine(l.a, r.a), b: combine(l.b, r.b) };
      }
      if (node.op === "*") {
        if (l.a.n && r.a.n) throw new Error("Nonlinear product");
        return { a: add(mul(l.a, r.b), mul(r.a, l.b)), b: mul(l.b, r.b) };
      }
      if (r.a.n) throw new Error("Variable denominator");
      return { a: quotient(l.a, r.b), b: quotient(l.b, r.b) };
    }
  }
}
export function sides(equation: string) {
  const parts = equation.split("=");
  if (parts.length !== 2) throw new Error("Expected one equality");
  return parts as [string, string];
}
export function equationTex(equation: string) {
  return sides(equation)
    .map((s) => render(parse(s)))
    .join("=");
}
export function solve(equation: string, variable: string) {
  const [l, r] = sides(equation).map((s) => linear(parse(s), variable));
  return quotient(sub(r.b, l.b), sub(l.a, r.a));
}
export function checkSubstitution(
  equation: string,
  variable: string,
  answer: Rational,
) {
  const nodes = sides(equation).map(parse);
  const values = nodes.map((node) => {
    const v = linear(node, variable);
    return add(mul(v.a, answer), v.b);
  });
  return {
    left: render(nodes[0], answer),
    right: render(nodes[1], answer),
    leftValue: values[0],
    rightValue: values[1],
    valid: equals(values[0], values[1]),
  };
}
export function parseAnswer(raw: string, variable: string): Rational | null {
  if (raw.length > 80) return null;
  let text = raw.trim().replace(/[−–]/g, "-");
  if (text.includes("=")) {
    const parts = text.split("=");
    if (parts.length !== 2 || parts[0].trim() !== variable) return null;
    text = parts[1].trim();
  }
  const fraction = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(text);
  try {
    return fraction
      ? quotient(readNumber(fraction[1]), readNumber(fraction[2]))
      : readNumber(text);
  } catch {
    return null;
  }
}
export type Grade = "correct" | "sign" | "incorrect" | "invalid";
export function gradeAnswer(
  raw: string,
  variable: string,
  expected: string,
): Grade {
  const answer = parseAnswer(raw, variable);
  if (!answer) return "invalid";
  const correct = readNumber(expected);
  if (equals(answer, correct)) return "correct";
  if (correct.n && equals(answer, neg(correct))) return "sign";
  return "incorrect";
}

export function expressionValue(
  raw: string,
  variable: string,
  value: Rational,
) {
  const l = linear(parse(raw), variable);
  return add(mul(l.a, value), l.b);
}
export function expressionTex(raw: string) {
  return render(parse(raw));
}
function inputExpression(raw: string) {
  return raw
    .replace(/[−–]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s/g, "")
    .replace(/(\d|\))(?=[a-zA-Z(])/g, "$1*")
    .replace(/([a-zA-Z])(?=\()/g, "$1*");
}
export function gradeExpression(
  raw: string,
  variable: string,
  expected: string,
  equation = false,
): Grade {
  try {
    const value = inputExpression(raw);
    if (equation)
      return equals(solve(value, variable), solve(expected, variable))
        ? "correct"
        : "incorrect";
    const a = linear(parse(value), variable),
      b = linear(parse(expected), variable);
    return equals(a.a, b.a) && equals(a.b, b.b) ? "correct" : "incorrect";
  } catch {
    return "invalid";
  }
}
