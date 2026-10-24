/** A closed expression format for checked textbook records, not a user-input solver. */
type Node =
  | { kind: "number" | "symbol"; value: string }
  | { kind: "group" | "negative"; value: Node }
  | { kind: "binary"; op: string; left: Node; right: Node };

export function parseExpression(source: string): Node {
  const tokens = source.match(/[a-zA-Z]|\d+|[()+\-*/^]/g) ?? [];
  if (tokens.join("") !== source.replace(/\s/g, ""))
    throw new Error(`Unsupported expression: ${source}`);
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  function atom(): Node {
    const token = take();
    if (token === "(") {
      const value = sum();
      if (take() !== ")") throw new Error(`Unclosed group: ${source}`);
      return { kind: "group", value };
    }
    if (/^\d+$/.test(token ?? "")) return { kind: "number", value: token };
    if (/^[a-zA-Z]$/.test(token ?? "")) return { kind: "symbol", value: token };
    throw new Error(`Missing operand in ${source}`);
  }
  function power(): Node {
    const left = atom();
    return peek() === "^"
      ? (take(), { kind: "binary", op: "^", left, right: unary() })
      : left;
  }
  function unary(): Node {
    if (peek() === "+") {
      take();
      return unary();
    }
    if (peek() === "-") {
      take();
      return { kind: "negative", value: unary() };
    }
    return power();
  }
  function product(): Node {
    let left = unary();
    while (peek() === "*" || peek() === "/")
      left = { kind: "binary", op: take(), left, right: unary() };
    return left;
  }
  function sum(): Node {
    let left = product();
    while (peek() === "+" || peek() === "-")
      left = { kind: "binary", op: take(), left, right: product() };
    return left;
  }
  const result = sum();
  if (position !== tokens.length)
    throw new Error(`Unexpected token in ${source}`);
  return result;
}

function render(node: Node): string {
  switch (node.kind) {
    case "number":
    case "symbol":
      return node.value;
    case "group":
      return `\\left(${render(node.value)}\\right)`;
    case "negative":
      return `-${render(node.value)}`;
    case "binary": {
      const a = render(node.left),
        b = render(node.right);
      if (node.op === "/") return `\\frac{${a}}{${b}}`;
      if (node.op === "^")
        return `${a}^{${node.right.kind === "group" ? render(node.right.value) : b}}`;
      if (node.op === "*") {
        // Explicit times avoids ambiguity for numeric substitutions and negative factors.
        const times =
          node.right.kind === "number" ||
          node.right.kind === "negative" ||
          (node.right.kind === "group" && node.right.value.kind === "negative");
        return `${a}${times ? "\\times " : "\\,"}${b}`;
      }
      return `${a}${node.op}${b}`;
    }
  }
}
export function expressionTex(source: string): string {
  return render(parseExpression(source));
}

// Exact rational functions with integer multivariable polynomials. No floating point.
type Poly = Map<string, bigint>;
type Fraction = { n: Poly; d: Poly };
const constant = (n: bigint): Poly => new Map(n === BigInt(0) ? [] : [["", n]]);
function add(a: Poly, b: Poly, sign = BigInt(1)): Poly {
  const result = new Map(a);
  for (const [k, v] of b) {
    const next = (result.get(k) ?? BigInt(0)) + sign * v;
    if (next === BigInt(0)) result.delete(k);
    else result.set(k, next);
  }
  return result;
}
function multiply(a: Poly, b: Poly): Poly {
  let result: Poly = new Map();
  for (const [ka, va] of a)
    for (const [kb, vb] of b) {
      const key = (ka + kb).split("").sort().join("");
      result = add(result, new Map([[key, va * vb]]));
    }
  return result;
}
function multiplyFraction(a: Fraction, b: Fraction): Fraction {
  return { n: multiply(a.n, b.n), d: multiply(a.d, b.d) };
}
function evaluate(node: Node): Fraction {
  switch (node.kind) {
    case "number":
      return { n: constant(BigInt(node.value)), d: constant(BigInt(1)) };
    case "symbol":
      return { n: new Map([[node.value, BigInt(1)]]), d: constant(BigInt(1)) };
    case "group":
      return evaluate(node.value);
    case "negative": {
      const v = evaluate(node.value);
      return { n: multiply(v.n, constant(-BigInt(1))), d: v.d };
    }
    case "binary": {
      const a = evaluate(node.left),
        b = evaluate(node.right);
      if (node.op === "^") {
        if ([...b.n.keys(), ...b.d.keys()].some((k) => k !== ""))
          throw new Error("Nonconstant exponent");
        const numerator = b.n.get("") ?? BigInt(0),
          denominator = b.d.get("") ?? BigInt(0);
        if (denominator === BigInt(0) || numerator % denominator !== BigInt(0))
          throw new Error("Noninteger exponent");
        const exponent = Number(numerator / denominator);
        if (Math.abs(exponent) > 30)
          throw new Error("Exponent exceeds textbook format");
        let r = { n: constant(BigInt(1)), d: constant(BigInt(1)) };
        for (let i = 0; i < Math.abs(exponent); i++) r = multiplyFraction(r, a);
        if (exponent < 0) r = { n: r.d, d: r.n };
        if (r.d.size === 0) throw new Error("Division by zero");
        return r;
      }
      if (node.op === "*") return multiplyFraction(a, b);
      if (node.op === "/") {
        if (b.n.size === 0) throw new Error("Division by zero");
        return { n: multiply(a.n, b.d), d: multiply(a.d, b.n) };
      }
      return {
        n: add(
          multiply(a.n, b.d),
          multiply(b.n, a.d),
          node.op === "-" ? -BigInt(1) : BigInt(1),
        ),
        d: multiply(a.d, b.d),
      };
    }
  }
}
export function equivalent(a: string, b: string): boolean {
  const left = evaluate(parseExpression(a)),
    right = evaluate(parseExpression(b));
  return (
    add(multiply(left.n, right.d), multiply(right.n, left.d), -BigInt(1))
      .size === 0
  );
}
