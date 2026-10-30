import {
  parse,
  render,
  linear,
  bracketTex,
  rationalText,
  type Node,
} from "./engine";
import {
  mul,
  neg,
  rational,
  div,
  toText,
  toTex,
  type Rational,
} from "../directed-numbers/lib/rational";

export type Arrow = { from: string; to: string; product: string };
export type Scene = {
  tex: string;
  label: string;
  arrows: Arrow[];
  lcm?: number;
  denominators?: number[];
};
export type Rewrite = {
  equation: string;
  kind: "distribute" | "expand" | "denominators" | "cancel";
  scene?: Scene;
  factor?: string;
};

const bin = (op: string, left: Node, right: Node): Node => ({
  kind: "binary",
  op,
  left,
  right,
});
const group = (child: Node): Node =>
  child.kind === "group" ? child : { kind: "group", child };
const ungroup = (n: Node): Node => (n.kind === "group" ? ungroup(n.child) : n);
const numeric = (n: Node): boolean =>
  n.kind === "number" ||
  (n.kind === "group" || n.kind === "negative"
    ? numeric(n.child)
    : n.kind === "binary"
      ? numeric(n.left) && numeric(n.right)
      : false);
const value = (n: Node, v: string) => linear(n, v).b;
const qdiv = (a: Rational, b: Rational) => {
  const r = div(a, b);
  if (!r.ok) throw Error(r.code);
  return r.value;
};
const num = (r: Rational): Node => parse(toText(r));
const sum = (terms: Node[]): Node => terms.reduce((a, b) => bin("+", a, b));
function priority(n: Node): number {
  return n.kind === "binary"
    ? n.op === "+" || n.op === "-"
      ? 1
      : 2
    : n.kind === "negative"
      ? 3
      : 4;
}
export function raw(n: Node, parent = 0): string {
  let text: string;
  if (n.kind === "number" || n.kind === "variable") text = n.value;
  else if (n.kind === "group") text = "(" + raw(n.child) + ")";
  else if (n.kind === "negative") text = "-" + raw(n.child, 3);
  else if (n.kind === "binary") {
    const right = raw(
      n.right,
      priority(n) + (n.op === "-" || n.op === "/" ? 1 : 0),
    );
    text =
      raw(n.left, priority(n)) +
      (right.startsWith("-") && (n.op === "+" || n.op === "-")
        ? (n.op === "+" ? "-" : "+") + right.slice(1)
        : n.op + right);
  } else throw Error("Unsupported node");
  return priority(n) < parent ? "(" + text + ")" : text;
}
function scale(n: Node, v: string): { factor: Rational; core?: Node } {
  n = ungroup(n);
  if (numeric(n)) return { factor: value(n, v) };
  if (n.kind === "negative") {
    const p = scale(n.child, v);
    return { ...p, factor: neg(p.factor) };
  }
  if (n.kind === "binary" && n.op === "*") {
    const a = scale(n.left, v),
      b = scale(n.right, v);
    if (!a.core || !b.core)
      return { factor: mul(a.factor, b.factor), core: a.core ?? b.core };
  }
  if (n.kind === "binary" && n.op === "/" && numeric(n.right)) {
    const p = scale(n.left, v);
    return { ...p, factor: qdiv(p.factor, value(n.right, v)) };
  }
  return { factor: rational(1), core: n };
}
function scaled(f: Rational, core?: Node): Node {
  if (!core || !f.n) return num(f);
  if (f.n === f.d) return core;
  if (f.n === -f.d)
    return { kind: "negative", child: priority(core) < 3 ? group(core) : core };
  return bin("*", num(f), priority(core) < 2 ? group(core) : core);
}
function tidy(n: Node, v: string): Node {
  if (numeric(n)) return num(value(n, v));
  if (n.kind === "group") {
    const child = tidy(n.child, v);
    return priority(child) < 3 ? group(child) : child;
  }
  if (n.kind === "negative") {
    const child = tidy(n.child, v);
    if (child.kind === "negative") return child.child;
    return { kind: "negative", child };
  }
  if (n.kind !== "binary") return n;
  const l = tidy(n.left, v),
    r = tidy(n.right, v);
  if (n.op === "*") {
    const p = scale(bin("*", l, r), v);
    return scaled(p.factor, p.core);
  }
  if ((n.op === "+" || n.op === "-") && r.kind === "negative")
    return bin(n.op === "+" ? "-" : "+", l, r.child);
  return bin(n.op, l, r);
}
function mark(id: string, tex: string) {
  return "\\htmlData{eq-anchor=" + id + "}{" + tex + "}";
}
export function annotated(n: Node, path: string, fractionPart = false): string {
  let tex: string;
  if (n.kind === "number" || n.kind === "variable") tex = n.value;
  else if (n.kind === "group")
    tex = fractionPart
      ? annotated(n.child, path + "c", true)
      : bracketTex(n, annotated(n.child, path + "c"));
  else if (n.kind === "negative")
    tex = mark(path + "op", "-") + annotated(n.child, path + "c");
  else if (n.kind === "binary") {
    const l = annotated(n.left, path + "l", n.op === "/"),
      r = annotated(n.right, path + "r", n.op === "/");
    tex =
      n.op === "/"
        ? "\\frac{" + l + "}{" + r + "}"
        : n.op === "*"
          ? l +
            (n.right.kind === "variable" || n.right.kind === "group"
              ? "\\,"
              : "\\times ") +
            r
          : l + mark(path + "term", mark(path + "op", n.op) + r);
    if (
      n.op === "-" &&
      n.right.kind === "binary" &&
      n.right.op === "*" &&
      numeric(n.right.left) &&
      parts(n.right.right, path + "rr").length > 1
    ) {
      tex =
        l +
        mark(
          path + "term",
          mark(
            path + "sf",
            mark(path + "op", "-") + annotated(n.right.left, path + "rl"),
          ) +
            "\\," +
            annotated(n.right.right, path + "rr"),
        );
    }
  } else throw Error("Unsupported node");
  return mark(path, tex);
}
type Part = { node: Node; path: string; negative: boolean };
function parts(n: Node, path: string, negative = false): Part[] {
  if (n.kind === "group") return parts(n.child, path + "c", negative);
  if (n.kind === "binary" && (n.op === "+" || n.op === "-")) {
    const right = parts(
      n.right,
      path + "r",
      n.op === "-" ? !negative : negative,
    );
    return [
      ...parts(n.left, path + "l", negative),
      ...right.map((p) =>
        right.length === 1 ? { ...p, path: path + "term" } : p,
      ),
    ];
  }
  return [{ node: n, path, negative }];
}
type Distribution = {
  node: Node;
  factor: Node;
  from: string;
  parts: Part[];
  replace: (products: Node) => Node;
};
function candidate(n: Node, path: string, v: string): Distribution | null {
  if (
    n.kind === "binary" &&
    n.op === "-" &&
    n.right.kind === "binary" &&
    n.right.op === "*" &&
    numeric(n.right.left) &&
    parts(n.right.right, path + "rr").length > 1
  )
    return {
      node: n,
      factor: num(neg(value(n.right.left, v))),
      from: path + "sf",
      parts: parts(n.right.right, path + "rr"),
      replace: (x) => bin("+", n.left, group(x)),
    };
  if (n.kind === "binary" && n.op === "*") {
    for (const side of ["right", "left"] as const) {
      const bracket = n[side],
        factor = n[side === "right" ? "left" : "right"],
        p = parts(bracket, path + (side === "right" ? "r" : "l"));
      if (p.length > 1 && numeric(factor))
        return {
          node: n,
          factor,
          from: path + (side === "right" ? "l" : "r"),
          parts: p,
          replace: (x) => x,
        };
    }
  }
  if (n.kind === "negative" && parts(n.child, path + "c").length > 1)
    return {
      node: n,
      factor: num(rational(-1)),
      from: path + "op",
      parts: parts(n.child, path + "c"),
      replace: (x) => x,
    };
  if (
    n.kind === "binary" &&
    n.op === "-" &&
    n.right.kind === "group" &&
    parts(n.right, path + "r").length > 1
  )
    return {
      node: n,
      factor: num(rational(-1)),
      from: path + "op",
      parts: parts(n.right, path + "r"),
      replace: (x) => bin("+", n.left, group(x)),
    };
  if (n.kind === "group" || n.kind === "negative") {
    const found = candidate(n.child, path + "c", v);
    if (found)
      return { ...found, replace: (x) => ({ ...n, child: found.replace(x) }) };
  }
  if (n.kind === "binary") {
    const l = candidate(n.left, path + "l", v);
    if (l)
      return { ...l, replace: (x) => ({ ...n, left: group(l.replace(x)) }) };
    const r = candidate(n.right, path + "r", v);
    if (r)
      return { ...r, replace: (x) => ({ ...n, right: group(r.replace(x)) }) };
  }
  return null;
}
function eq(nodes: Node[]) {
  return nodes.map((n) => raw(n)).join("=");
}
function eqTex(nodes: Node[]) {
  return nodes.map((n, i) => annotated(n, i ? "r" : "l")).join("=");
}
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
function joinSigned(terms: Part[]): Node[] {
  return terms.map((p) =>
    p.negative ? ({ kind: "negative", child: group(p.node) } as Node) : p.node,
  );
}
function signedSum(nodes: Node[], signs: { negative: boolean }[]): Node {
  return nodes.reduce(
    (total, node, i) =>
      i === 0
        ? signs[i].negative
          ? ({ kind: "negative", child: group(node) } as Node)
          : node
        : bin(signs[i].negative ? "-" : "+", total, node),
    num(rational(0)),
  );
}
/** One bracket at a time; an explicit product row precedes its simplification. */
export function preparation(equation: string, variable: string): Rewrite[] {
  const clearFractions = equation.includes("/");
  const decimals = equation.includes(".") && !clearFractions;
  const decimalNodes = (n: Node): Node => {
    if (n.kind === "binary") {
      if (n.op === "/" && numeric(n))
        return parse(rationalText(value(n, variable), true));
      return { ...n, left: decimalNodes(n.left), right: decimalNodes(n.right) };
    }
    if (n.kind === "group" || n.kind === "negative")
      return { ...n, child: decimalNodes(n.child) };
    return n;
  };
  let nodes = equation.split("=").map(parse);
  const result: Rewrite[] = [];
  const emit = (kind: Rewrite["kind"], scene?: Scene, factor?: string) => {
    if (decimals) nodes = nodes.map(decimalNodes);
    const equation = eq(nodes);
    result.push({ equation, kind, scene, factor });
    nodes = equation.split("=").map(parse);
  };
  const distribute = () => {
    for (let guard = 0; guard < 80; guard++) {
      const which = nodes.findIndex(
        (n, i) => candidate(n, i ? "r" : "l", variable) !== null,
      );
      if (which < 0) return;
      const found = candidate(nodes[which], which ? "r" : "l", variable)!;
      const before = eq(nodes),
        tex = eqTex(nodes);
      const factor =
        value(found.factor, variable).n < 0
          ? group(found.factor)
          : found.factor;
      const products = found.parts.map((p) => bin("*", factor, group(p.node)));
      const distributed = signedSum(products, found.parts);
      nodes[which] = found.replace(distributed);
      emit(
        "distribute",
        {
          tex,
          label: before,
          arrows: found.parts.map((p, i) => ({
            from: found.from,
            to: p.path,
            product: (p.negative ? "-" : "") + render(products[i]),
          })),
        },
        toText(value(found.factor, variable)),
      );
      const previous = eq(nodes);
      nodes = nodes.map((n) => tidy(n, variable));
      if (eq(nodes) !== previous) emit("expand");
    }
    throw Error("Distribution did not terminate");
  };
  distribute();
  // Keep numerator brackets intact until the LCM has multiplied the whole term.
  const terms = nodes.map((n, i) => parts(n, i ? "r" : "l"));
  const signed = terms.map(joinSigned);
  const coefficients = signed.map((side) =>
    side.map((t) => scale(t, variable)),
  );
  const denominators = [
    ...new Set(
      coefficients
        .flat()
        .map((t) => t.factor.d)
        .filter((d) => d > 1),
    ),
  ].sort((a, b) => a - b);
  const lcm = denominators.reduce((a, b) => (a / gcd(a, b)) * b, 1);
  if (clearFractions && lcm > 1) {
    const previous = eq(nodes);
    const arrows: Arrow[] = [];
    const tex = terms
      .map((side, i) => {
        const prefix = i ? "r" : "l",
          factor = prefix + "factor";
        const groups = side.map((p) => group(p.node));
        const body = side
          .map((p, j) => {
            const id = prefix + "term" + j;
            const sign = p.negative ? "-" : j ? "+" : "";
            const termTex = render(groups[j]);
            arrows.push({
              from: factor,
              to: id,
              product: (p.negative ? "-" : "") + lcm + "\\times" + termTex,
            });
            return mark(
              id,
              sign + (side.length === 1 ? termTex : render(p.node)),
            );
          })
          .join("");
        return (
          mark(factor, String(lcm)) +
          (side.length === 1
            ? body
            : bracketTex(group(sum(side.map((p) => p.node))), body))
        );
      })
      .join("=");
    nodes = terms.map((side) =>
      signedSum(
        side.map((p) => bin("*", num(rational(lcm)), group(p.node))),
        side,
      ),
    );
    emit(
      "denominators",
      { tex, label: previous, arrows, lcm, denominators },
      String(lcm),
    );
    const cancellationTex = coefficients
      .map((side, sideIndex) =>
        side
          .map(({ factor, core }, j) => {
            const outsideMinus = terms[sideIndex][j].negative;
            const numerator = outsideMinus ? -factor.n : factor.n;
            const sign = outsideMinus ? "-" : j ? "+" : "";
            const body = core
              ? numerator === 1
                ? render(core)
                : toTex(rational(numerator)) + "\\," + render(group(core))
              : toTex(rational(numerator));
            if (factor.d === 1)
              return sign + lcm + "\\left(" + body + "\\right)";
            const multiplier =
              lcm === factor.d
                ? "\\cancel{" + lcm + "}"
                : "\\overset{" + lcm / factor.d + "}{\\cancel{" + lcm + "}}";
            return (
              sign +
              multiplier +
              "\\left(\\frac{" +
              body +
              "}{\\cancel{" +
              factor.d +
              "}}\\right)"
            );
          })
          .join(""),
      )
      .join("=");
    nodes = coefficients.map((side) =>
      sum(side.map((p) => scaled(mul(rational(lcm), p.factor), p.core))),
    );
    emit(
      "cancel",
      { tex: cancellationTex, label: previous, arrows: [], lcm, denominators },
      String(lcm),
    );
    distribute();
  }
  return result;
}
