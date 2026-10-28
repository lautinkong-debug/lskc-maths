import { copy } from "@/lib/copy";
import {
  signSlot,
  signSlotAbove,
  type InsetSignLayout,
} from "./signArrowLayout";
import {
  evaluate,
  parse,
  type Ast,
  type Span,
  type ParseResult,
} from "./parse";
import {
  abs,
  add,
  compare,
  div,
  mul,
  neg,
  rational,
  RationalError,
  toTex,
  type Rational,
} from "./rational";

export type AdditiveRuleId =
  | "++"
  | "+-"
  | "-+"
  | "--"
  | "unwrap"
  | "same"
  | "different"
  | "cancel"
  | "zero"
  | "removeAll";
export type RuleId =
  | AdditiveRuleId
  | "inner-brackets-first"
  | "mult-div-first"
  | "powers-first"
  | "even-power"
  | "odd-power"
  | "left-to-right"
  | "same-sign-product"
  | "diff-sign-product"
  | "same-sign-quotient"
  | "diff-sign-quotient"
  | "count-negatives"
  | "reciprocal"
  | "mixed-to-improper";
export type Step = {
  compactReveal?: { signTex: string; animatedTex: string };
  signArrows?: {
    tex: string;
    pair: string;
    groups?: { signs: string; result: string }[];
    /** KaTeX places a fraction's denominator before its numerator in the DOM. */
    anchorOrder?: number[];
    inset?: InsetSignLayout;
    highlighted?: string;
  };
  batchReveal?: { signTex: string; animatedTex: string };
  highlights?: Span[];
  signReveal?: {
    prefix: string;
    sign: string;
    magnitude: string;
    suffix: string;
  };
  numberStyle?: NumberStyle;
  tex: string;
  highlight?: Span;
  sourceHighlight: Span;
  ruleId: RuleId;
  noteKey: RuleId;
  ast: Ast;
  before: Ast;
  pair?: [Rational, Rational];
  kind:
    | "bracket"
    | "sum"
    | "product"
    | "quotient"
    | "reciprocal"
    | "sign"
    | "power"
    | "mixed";
};
export type AdditiveStep = Step & {
  ruleId: AdditiveRuleId;
  noteKey: AdditiveRuleId;
  kind: "bracket" | "sum";
};
const c = copy.apps.directedNumbers.bracketLesson;
const number = (value: Rational, span: Span): Ast => ({
  kind: "number",
  value,
  span,
  explicitSign: false,
  bracketed: false,
});

export type NumberStyle = "improper" | "decimal";
type TexPiece = { text: string; span: Span; structural?: boolean };
/** The fraction line already groups a compound numerator or denominator. */
function fractionOperand(ast: Ast): Ast {
  return ast.kind === "group" && ast.child.kind !== "number" ? ast.child : ast;
}
function texPieces(
  ast: Ast,
  signed = false,
  style: NumberStyle = "improper",
): TexPiece[] {
  if (ast.kind === "number")
    return [
      {
        text: toTex(ast.value, {
          signed,
          style:
            ast.sourceForm === "mixed"
              ? "mixed"
              : ast.sourceForm === "decimal"
                ? "decimal"
                : style,
        }),
        span: ast.span,
      },
    ];
  if (
    ast.kind === "group" &&
    ast.bracket === "(" &&
    ast.child.kind === "binary" &&
    ast.child.fractionBar
  )
    return texPieces(ast.child, signed, style);
  if (ast.kind === "group")
    return [
      {
        text: ast.bracket === "[" ? "\\left[" : "\\left(",
        span: { start: ast.span.start, end: ast.span.start + 1 },
      },
      ...texPieces(ast.child, true, style),
      {
        text: ast.bracket === "[" ? "\\right]" : "\\right)",
        span: { start: ast.span.end - 1, end: ast.span.end },
      },
    ];
  if (ast.kind === "unary")
    return [
      {
        text: ast.op,
        span: { start: ast.span.start, end: ast.child.span.start },
      },
      ...(ast.child.kind === "number" && ast.child.value.n < 0
        ? [
            {
              text: `\\left(${toTex(ast.child.value, { style })}\\right)`,
              span: ast.child.span,
            },
          ]
        : texPieces(ast.child, false, style)),
    ];
  if (ast.op === "^") {
    // Keep a fractional or reduced negative base visibly inside the power.
    const base = texPieces(ast.left, false, style);
    const wrap =
      (ast.left.kind === "number" &&
        (ast.left.value.n < 0 || ast.left.value.d !== 1)) ||
      (ast.left.kind === "group" &&
        ast.left.child.kind === "binary" &&
        ast.left.child.fractionBar);
    return [
      ...(wrap
        ? [{ text: "\\left(", span: ast.left.span, structural: true }]
        : []),
      ...base,
      ...(wrap
        ? [{ text: "\\right)", span: ast.left.span, structural: true }]
        : []),
      { text: "^{", span: ast.span, structural: true },
      ...texPieces(ast.right, false, style),
      { text: "}", span: ast.span, structural: true },
    ];
  }
  if (ast.op === "/" && ast.fractionBar)
    return [
      { text: "\\dfrac{", span: ast.span, structural: true },
      ...texPieces(fractionOperand(ast.left), false, style),
      { text: "}{", span: ast.span, structural: true },
      ...texPieces(fractionOperand(ast.right), false, style),
      { text: "}", span: ast.span, structural: true },
    ];
  const right =
    ast.right.kind === "number" && ast.right.value.n < 0
      ? [
          {
            text: `\\left(${toTex(ast.right.value, { style: ast.right.sourceForm === "mixed" ? "mixed" : ast.right.sourceForm === "decimal" ? "decimal" : style })}\\right)`,
            span: ast.right.span,
          },
        ]
      : texPieces(ast.right, false, style);
  // A reduced negative factor must stay grouped, including to the right of
  // subtraction in a larger expression (2 - (-4) × (-2), never 2 - -4 × (-2)).
  const left =
    (ast.op === "*" || ast.op === "/") &&
    ast.left.kind === "number" &&
    ast.left.value.n < 0
      ? [
          {
            text: `\\left(${toTex(ast.left.value, { style: ast.left.sourceForm === "decimal" ? "decimal" : ast.left.sourceForm === "mixed" ? "mixed" : style })}\\right)`,
            span: ast.left.span,
          },
        ]
      : texPieces(ast.left, false, style);
  return [
    ...left,
    {
      text: ` ${ast.op === "*" ? "\\times" : ast.op === "/" ? "\\div" : ast.op} `,
      span: { start: ast.left.span.end, end: ast.right.span.start },
    },
    ...right,
  ];
}
export function expressionTex(
  ast: Ast,
  style: NumberStyle = "improper",
): string {
  return texPieces(ast, false, style)
    .map((piece) => piece.text)
    .join("");
}
/** Highlight evaluated signs and reveal their magnitudes separately in place. */
export function evaluatedReveal(
  before: Ast,
  after: Ast,
  style: NumberStyle = "improper",
) {
  const leaves = (node: Ast): Extract<Ast, { kind: "number" }>[] =>
    node.kind === "number"
      ? [node]
      : node.kind === "binary"
        ? [...leaves(node.left), ...leaves(node.right)]
        : leaves(node.child);
  const key = (span: Span) => `${span.start}:${span.end}`;
  const originals = new Set(leaves(before).map((node) => key(node.span)));
  const changed = new Map(
    leaves(after)
      .filter((node) => !originals.has(key(node.span)))
      .map((node) => [key(node.span), node]),
  );
  const pieces = texPieces(after, false, style).map((piece) => {
    const node = piece.structural ? undefined : changed.get(key(piece.span));
    if (!node || node.value.n === 0)
      return { full: piece.text, sign: piece.text, animated: piece.text };
    const magnitude = toTex(abs(node.value), {
      style: node.sourceForm === "decimal" ? "decimal" : style,
    });
    const at = piece.text.indexOf(magnitude);
    if (at < 0) throw new Error("Missing evaluated magnitude");
    let prefix = piece.text.slice(0, at);
    let suffix = piece.text.slice(at + magnitude.length);
    if (node.value.n > 0 && !prefix.includes("+")) {
      // An explicit positive operand inside an expression needs brackets.
      if (after.kind !== "number" && !prefix.includes("\\left")) {
        prefix = `\\left(${prefix}+`;
        suffix += "\\right)";
      } else prefix += "+";
    }
    return {
      full: prefix + magnitude + suffix,
      sign: prefix + suffix,
      animated: `${prefix.replace(/([+-])(?=[^+-]*$)/, "\\textcolor{#DA2127}{$1}")}\\textcolor{#13579B}{${magnitude}}${suffix}`,
    };
  });
  return {
    tex: pieces.map((p) => p.full).join(""),
    signTex: pieces.map((p) => p.sign).join(""),
    animatedTex: pieces.map((p) => p.animated).join(""),
  };
}
/** Map the original source positions onto the immediately preceding TeX line. */
export function texHighlight(
  ast: Ast,
  source: Span,
  style: NumberStyle = "improper",
): Span {
  let offset = 0,
    start = Infinity,
    end = 0;
  for (const piece of texPieces(ast, false, style)) {
    if (
      piece.structural
        ? source.start <= piece.span.start && source.end >= piece.span.end
        : piece.span.end > source.start && piece.span.start < source.end
    ) {
      start = Math.min(start, offset);
      end = offset + piece.text.length;
    }
    offset += piece.text.length;
  }
  return Number.isFinite(start) ? { start, end } : { start: 0, end: offset };
}
export function parseAdditive(source: string): ParseResult<Ast> {
  const parsed = parse(source);
  if (!parsed.ok) return parsed;
  let count = 0,
    valid = true;
  function visit(ast: Ast) {
    if (ast.kind === "number") count++;
    else if (ast.kind === "binary") {
      if (ast.op !== "+" && ast.op !== "-") valid = false;
      visit(ast.left);
      visit(ast.right);
    } else visit(ast.child);
  }
  visit(parsed.value);
  if (!valid || count > 5)
    return {
      ok: false,
      code: "additiveOnly",
      message: c.scope,
      span: { start: 0, end: source.length },
    };
  try {
    bracketSteps(parsed.value);
    totals(signedTerms(parsed.value));
  } catch (error) {
    const code = error instanceof RationalError ? error.code : "overflow";
    return {
      ok: false,
      code,
      message: copy.apps.directedNumbers.errors[code],
      span: { start: 0, end: source.length },
    };
  }
  return parsed;
}
export function signedTerms(ast: Ast): Rational[] {
  if (ast.kind === "number") return [ast.value];
  if (ast.kind === "group") return signedTerms(ast.child);
  if (ast.kind === "unary")
    return signedTerms(ast.child).map((v) => (ast.op === "-" ? neg(v) : v));
  if (ast.op !== "+" && ast.op !== "-")
    throw new Error("Additive expressions only");
  return [
    ...signedTerms(ast.left),
    ...signedTerms(ast.right).map((v) => (ast.op === "-" ? neg(v) : v)),
  ];
}
export function sumRule(a: Rational, b: Rational): AdditiveRuleId {
  if (a.n === 0 || b.n === 0) return "zero";
  if (Math.sign(a.n) === Math.sign(b.n)) return "same";
  return compare(abs(a), abs(b)) === 0 ? "cancel" : "different";
}
export function termsTex(terms: Rational[], style: NumberStyle = "improper") {
  return terms
    .map((v, i) =>
      i === 0
        ? toTex(v, { style })
        : `${v.n < 0 ? "-" : "+"} ${toTex(abs(v), { style })}`,
    )
    .join(" ");
}
type Change = {
  ast: Ast;
  ruleId: AdditiveRuleId;
  highlight: Span;
  kind: "bracket" | "sum";
  pair?: [Rational, Rational];
};
function hasGroup(ast: Ast): boolean {
  return (
    ast.kind === "group" ||
    (ast.kind === "unary"
      ? hasGroup(ast.child)
      : ast.kind === "binary" && (hasGroup(ast.left) || hasGroup(ast.right)))
  );
}
function reduceSum(ast: Ast): Change | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "unary" || ast.kind === "group") {
    const inner = reduceSum(ast.child);
    if (inner) return { ...inner, ast: { ...ast, child: inner.ast } };
    return {
      ast: number(evaluate(ast), ast.span),
      ruleId: "unwrap",
      highlight: ast.span,
      kind: "bracket",
    };
  }
  const left = reduceSum(ast.left);
  if (left) return { ...left, ast: { ...ast, left: left.ast } };
  const right = reduceSum(ast.right);
  if (right) return { ...right, ast: { ...ast, right: right.ast } };
  const a = evaluate(ast.left),
    b = ast.op === "-" ? neg(evaluate(ast.right)) : evaluate(ast.right);
  return {
    ast: number(add(a, b), ast.span),
    ruleId: sumRule(a, b),
    highlight: ast.span,
    kind: "sum",
    pair: [a, b],
  };
}
function removeNext(ast: Ast): Change | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "binary") {
    const left = removeNext(ast.left);
    if (left) return { ...left, ast: { ...ast, left: left.ast } };
    if (ast.right.kind === "group" && ast.right.child.kind === "number") {
      const value = ast.right.child.value;
      const ruleId: AdditiveRuleId =
        value.n === 0
          ? "zero"
          : (`${ast.op}${value.n < 0 ? "-" : "+"}` as AdditiveRuleId);
      return {
        ast: {
          ...ast,
          op: (ast.op === "-") !== value.n < 0 ? "-" : "+",
          right: number(abs(value), ast.right.span),
        },
        ruleId,
        highlight: { start: ast.left.span.end, end: ast.right.span.end },
        kind: "bracket",
      };
    }
    const right = removeNext(ast.right);
    return right ? { ...right, ast: { ...ast, right: right.ast } } : null;
  }
  if (ast.kind === "unary") {
    if (ast.child.kind === "group" && ast.child.child.kind === "number") {
      const value = ast.child.child.value;
      return {
        ast: number(ast.op === "-" ? neg(value) : value, ast.span),
        ruleId:
          value.n === 0
            ? "zero"
            : (`${ast.op}${value.n < 0 ? "-" : "+"}` as AdditiveRuleId),
        highlight: ast.span,
        kind: "bracket",
      };
    }
    const inner = removeNext(ast.child);
    return inner ? { ...inner, ast: { ...ast, child: inner.ast } } : null;
  }
  if (ast.child.kind === "number")
    return {
      ast: number(ast.child.value, ast.span),
      ruleId: "unwrap",
      highlight: ast.span,
      kind: "bracket",
    };
  const inner = hasGroup(ast.child)
    ? removeNext(ast.child)
    : reduceSum(ast.child);
  return inner ? { ...inner, ast: { ...ast, child: inner.ast } } : null;
}
/** Fine-grained demonstration; square-bracket contents are evaluated before the outer sign. */
export function bracketSteps(
  input: Ast,
  style: NumberStyle = "improper",
): AdditiveStep[] {
  const steps: AdditiveStep[] = [];
  let ast = input;
  for (let guard = 0; guard < 80; guard++) {
    const pending = hasGroup(ast) ? removeNext(ast) : reduceSum(ast);
    const operand =
      pending?.kind === "sum"
        ? removeAdditiveOperand(ast, pending.highlight)
        : null;
    // Reduced negative numbers acquire display brackets; teach their signs too.
    const change: Change | null = operand
      ? {
          ast: operand.ast,
          ruleId: operand.ruleId as AdditiveRuleId,
          highlight: operand.sourceHighlight,
          kind: "bracket",
        }
      : pending;
    if (!change) break;
    steps.push({
      ...change,
      numberStyle: style,
      sourceHighlight: change.highlight,
      highlight: texHighlight(ast, change.highlight, style),
      before: ast,
      noteKey: change.ruleId,
      tex: expressionTex(change.ast, style),
    });
    ast = change.ast;
  }
  return steps;
}
/** Textbook additive working: adjacent bracket removals share one line. */
function additiveWorkOut(ast: Ast, style: NumberStyle): AdditiveStep[] {
  const detailed = bracketSteps(ast, style),
    steps: AdditiveStep[] = [];
  for (const step of detailed) {
    const previous = steps.at(-1);
    if (step.kind === "bracket" && previous?.kind === "bracket") {
      steps[steps.length - 1] = {
        ...step,
        before: previous.before,
        ruleId: "removeAll",
        noteKey: "removeAll",
        sourceHighlight: {
          start: Math.min(
            previous.sourceHighlight.start,
            step.sourceHighlight.start,
          ),
          end: Math.max(previous.sourceHighlight.end, step.sourceHighlight.end),
        },
        highlight: texHighlight(
          previous.before,
          {
            start: Math.min(
              previous.sourceHighlight.start,
              step.sourceHighlight.start,
            ),
            end: Math.max(
              previous.sourceHighlight.end,
              step.sourceHighlight.end,
            ),
          },
          style,
        ),
      };
    } else steps.push(step);
  }
  return steps;
}

type GeneralChange = {
  ast: Ast;
  sourceHighlight: Span;
  ruleId: RuleId;
  kind: Step["kind"];
  operation?: {
    op: "*" | "/";
    a: Rational;
    b: Rational;
    fractionBar?: boolean;
    left: Ast;
    right: Ast;
  };
};
function atomic(ast: Ast): boolean {
  return (
    ast.kind === "number" ||
    ((ast.kind === "group" || ast.kind === "unary") && atomic(ast.child))
  );
}
function contains(ast: Ast, operations: string): boolean {
  return ast.kind === "binary"
    ? operations.includes(ast.op) ||
        contains(ast.left, operations) ||
        contains(ast.right, operations)
    : ast.kind === "group" || ast.kind === "unary"
      ? contains(ast.child, operations)
      : false;
}
function hasMixedNumber(ast: Ast): boolean {
  return ast.kind === "number"
    ? ast.sourceForm === "mixed"
    : ast.kind === "binary"
      ? hasMixedNumber(ast.left) || hasMixedNumber(ast.right)
      : hasMixedNumber(ast.child);
}
function convertMixed(ast: Ast): GeneralChange | null {
  if (ast.kind === "number")
    return ast.sourceForm === "mixed"
      ? {
          ast: { ...ast, sourceForm: "fraction" },
          sourceHighlight: ast.span,
          ruleId: "mixed-to-improper",
          kind: "mixed",
        }
      : null;
  if (ast.kind === "group" || ast.kind === "unary") {
    const change = convertMixed(ast.child);
    return change ? { ...change, ast: { ...ast, child: change.ast } } : null;
  }
  const left = convertMixed(ast.left);
  if (left) return { ...left, ast: { ...ast, left: left.ast } };
  const right = convertMixed(ast.right);
  return right ? { ...right, ast: { ...ast, right: right.ast } } : null;
}
function reduceTier(
  ast: Ast,
  tier: "power" | "multiply" | "add",
  insideGroup: boolean,
  hasAddition: boolean,
  reciprocalWorking: boolean,
): GeneralChange | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "group" || ast.kind === "unary") {
    if (atomic(ast)) return null;
    const inner = reduceTier(
      ast.child,
      tier,
      insideGroup,
      hasAddition,
      reciprocalWorking,
    );
    return inner ? { ...inner, ast: { ...ast, child: inner.ast } } : null;
  }
  const left = reduceTier(
    ast.left,
    tier,
    insideGroup,
    hasAddition,
    reciprocalWorking,
  );
  if (left) return { ...left, ast: { ...ast, left: left.ast } };
  const right = reduceTier(
    ast.right,
    tier,
    insideGroup,
    hasAddition,
    reciprocalWorking,
  );
  if (right) return { ...right, ast: { ...ast, right: right.ast } };
  const operationTier =
    ast.op === "^"
      ? "power"
      : ast.op === "*" || ast.op === "/"
        ? "multiply"
        : "add";
  if (operationTier !== tier) return null;
  if (!atomic(ast.left) || !atomic(ast.right)) return null;
  const a = evaluate(ast.left),
    b = evaluate(ast.right);
  if (ast.op === "^") {
    const ruleId =
      a.n < 0 ? (b.n % 2 === 0 ? "even-power" : "odd-power") : "powers-first";
    return {
      ast: number(evaluate(ast), ast.span),
      sourceHighlight: ast.span,
      ruleId,
      kind: "power",
    };
  }
  if (reciprocalWorking && ast.op === "/" && b.d !== 1) {
    const reciprocal = div(rational(1), b);
    if (!reciprocal.ok) throw new RationalError(reciprocal.code);
    return {
      ast: {
        ...ast,
        op: "*",
        right: number(reciprocal.value, ast.right.span),
        implicit: false,
      },
      sourceHighlight: ast.span,
      ruleId: "reciprocal",
      kind: "reciprocal",
    };
  }
  const result =
    ast.op === "+"
      ? add(a, b)
      : ast.op === "-"
        ? add(a, neg(b))
        : ast.op === "*"
          ? mul(a, b)
          : div(a, b);
  if ("ok" in result) {
    if (!result.ok) throw new RationalError(result.code);
  }
  return {
    ast: number("ok" in result ? result.value : result, ast.span),
    sourceHighlight: ast.span,
    ruleId: insideGroup
      ? "inner-brackets-first"
      : tier === "multiply" && hasAddition
        ? "mult-div-first"
        : "left-to-right",
    kind: ast.op === "*" ? "product" : ast.op === "/" ? "quotient" : "sum",
    operation:
      ast.op === "*" || ast.op === "/"
        ? {
            op: ast.op,
            a,
            b,
            fractionBar: ast.fractionBar,
            left: ast.left,
            right: ast.right,
          }
        : undefined,
  };
}
function reduceExpression(
  ast: Ast,
  insideGroup: boolean,
  reciprocalWorking: boolean,
): GeneralChange | null {
  const hasAddition = contains(ast, "+-");
  return (
    reduceTier(ast, "power", insideGroup, hasAddition, reciprocalWorking) ??
    reduceTier(ast, "multiply", insideGroup, hasAddition, reciprocalWorking) ??
    reduceTier(ast, "add", insideGroup, hasAddition, reciprocalWorking)
  );
}
function reduceInsideGroup(
  ast: Ast,
  reciprocalWorking: boolean,
): GeneralChange | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "group") {
    const nested = reduceInsideGroup(ast.child, reciprocalWorking);
    if (nested) return { ...nested, ast: { ...ast, child: nested.ast } };
    if (!atomic(ast.child)) {
      const change = reduceExpression(ast.child, true, reciprocalWorking);
      if (change) return { ...change, ast: { ...ast, child: change.ast } };
    }
    return null;
  }
  if (ast.kind === "unary") {
    const change = reduceInsideGroup(ast.child, reciprocalWorking);
    return change ? { ...change, ast: { ...ast, child: change.ast } } : null;
  }
  const left = reduceInsideGroup(ast.left, reciprocalWorking);
  if (left) return { ...left, ast: { ...ast, left: left.ast } };
  const right = reduceInsideGroup(ast.right, reciprocalWorking);
  return right ? { ...right, ast: { ...ast, right: right.ast } } : null;
}

/** Show the operation sign combining with a signed operand before evaluating a sum. */
function removeAdditiveOperand(
  ast: Ast,
  target: Span,
): (GeneralChange & { operand: Rational }) | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "binary") {
    if (
      ast.span.start === target.start &&
      ast.span.end === target.end &&
      (ast.op === "+" || ast.op === "-") &&
      atomic(ast.right)
    ) {
      const operand = evaluate(ast.right);
      if (operand.n === 0 || (ast.right.kind === "number" && operand.n > 0))
        return null;
      const sign = operand.n < 0 ? "-" : "+";
      return {
        ast: {
          ...ast,
          op: ast.op === sign ? "+" : "-",
          right: number(abs(operand), ast.right.span),
        },
        sourceHighlight: { start: ast.left.span.end, end: ast.right.span.end },
        ruleId: `${ast.op}${sign}` as AdditiveRuleId,
        kind: "bracket",
        operand,
      };
    }
    const left = removeAdditiveOperand(ast.left, target);
    if (left) return { ...left, ast: { ...ast, left: left.ast } };
    const right = removeAdditiveOperand(ast.right, target);
    return right ? { ...right, ast: { ...ast, right: right.ast } } : null;
  }
  const inner = removeAdditiveOperand(ast.child, target);
  return inner ? { ...inner, ast: { ...ast, child: inner.ast } } : null;
}
function generalWorkOut(
  input: Ast,
  signWorking: boolean,
  style: NumberStyle,
  reciprocalWorking: boolean,
): Step[] {
  const steps: Step[] = [];
  let ast = input;
  for (
    let guard = 0;
    guard < 100 && (ast.kind !== "number" || ast.sourceForm === "mixed");
    guard++
  ) {
    const pending =
      convertMixed(ast) ??
      reduceInsideGroup(ast, reciprocalWorking) ??
      reduceExpression(ast, false, reciprocalWorking) ??
      (atomic(ast)
        ? {
            ast: number(evaluate(ast), ast.span),
            sourceHighlight: ast.span,
            ruleId: "inner-brackets-first" as RuleId,
            kind: "bracket" as Step["kind"],
          }
        : null);
    if (!pending) throw new Error("Could not finish the working");
    const additiveBracket =
      signWorking && pending.kind === "sum"
        ? removeAdditiveOperand(ast, pending.sourceHighlight)
        : null;
    const change = additiveBracket ?? pending;
    const highlight = texHighlight(ast, change.sourceHighlight, style);
    if (
      signWorking &&
      change.operation &&
      change.operation.a.n &&
      change.operation.b.n
    ) {
      const { a, b, op, fractionBar } = change.operation;
      const same = Math.sign(a.n) === Math.sign(b.n);
      const ruleId: RuleId = `${same ? "same" : "diff"}-sign-${op === "*" ? "product" : "quotient"}`;
      const previous = expressionTex(ast, style);
      const signs = [a, b].map((value) => (value.n < 0 ? "-" : "+"));
      const operands = fractionBar
        ? [change.operation.left, change.operation.right].map((node) =>
            expressionTex(fractionOperand(node), style),
          )
        : previous.slice(highlight.start, highlight.end).split(/\\times|\\div/);
      const markedOperands = operands.map((operand, index) => {
        const mark = `\\textcolor{#DA2127}{${signs[index]}}`;
        const existing = operand.match(/[+-]/g) ?? [];
        if (existing.length === 1 && existing[0] === signs[index])
          return operand.replace(/[+-]/, mark);
        // Make an implicit positive sign explicit so both arrows have an anchor.
        if (existing.length === 0 && operand.trimStart().startsWith("\\left"))
          return operand.replace(/^(\s*(?:\\left[([])*)/, `$1${mark}`);
        return `\\left(${mark}${toTex(abs(index === 0 ? a : b), { style })}\\right)`;
      });
      const markedOperation = fractionBar
        ? `\\dfrac{${markedOperands[0]}}{${markedOperands[1]}}`
        : markedOperands.join(op === "*" ? "\\times" : "\\div");
      const replaceOperation = (part: string) =>
        previous.slice(0, highlight.start) +
        part +
        previous.slice(highlight.end);
      const above = signSlotAbove(ast, change.sourceHighlight);
      const signArrows = {
        pair: signs.join(""),
        ...(fractionBar ? { anchorOrder: [1, 0] } : {}),
        tex: replaceOperation(markedOperation),
        ...(previous.includes("\\dfrac{")
          ? {
              inset: {
                above: [above],
                plain: replaceOperation(
                  signSlot(
                    previous.slice(highlight.start, highlight.end),
                    0,
                    above,
                  ),
                ),
                marked: replaceOperation(signSlot(markedOperation, 0, above)),
                highlighted: replaceOperation(
                  signSlot(
                    `\\colorbox{#fff1ad}{$${markedOperation}$}`,
                    0,
                    above,
                  ),
                ),
              },
            }
          : {}),
      };
      // Keep a signed subexpression grouped when it sits inside a larger sum/product.
      const nested = highlight.start > 0 || highlight.end < previous.length;
      const signReveal = {
        prefix: previous.slice(0, highlight.start) + (nested ? "\\left(" : ""),
        sign: same ? "+" : "-",
        magnitude: fractionBar
          ? `\\dfrac{${toTex(abs(a), { style })}}{${toTex(abs(b), { style })}}`
          : `\\left(${toTex(abs(a), { style })} ${op === "*" ? "\\times" : "\\div"} ${toTex(abs(b), { style })}\\right)`,
        suffix: (nested ? "\\right)" : "") + previous.slice(highlight.end),
      };
      steps.push({
        tex:
          signReveal.prefix +
          signReveal.sign +
          signReveal.magnitude +
          signReveal.suffix,
        signReveal,
        signArrows,
        numberStyle: style,
        highlight,
        sourceHighlight: change.sourceHighlight,
        ruleId,
        noteKey: ruleId,
        ast,
        before: ast,
        kind: "sign",
      });
    }
    steps.push({
      numberStyle: style,
      signArrows: additiveBracket
        ? {
            pair: change.ruleId,
            tex:
              expressionTex(ast, style).slice(0, highlight.start) +
              ` \\textcolor{#DA2127}{${change.ruleId[0]}} \\left(\\textcolor{#DA2127}{${change.ruleId[1]}}${toTex(abs(additiveBracket.operand), { style })}\\right)` +
              expressionTex(ast, style).slice(highlight.end),
          }
        : undefined,
      tex: expressionTex(change.ast, style),
      highlight,
      sourceHighlight: change.sourceHighlight,
      ruleId: change.ruleId,
      noteKey: change.ruleId,
      ast: change.ast,
      before: ast,
      kind: change.kind,
    });
    ast = change.ast;
  }
  return steps;
}
/** Full arithmetic working; additive-only examples keep the compact bracket lesson. */
export function workOut(
  ast: Ast,
  {
    signWorking = false,
    numberStyle = "improper",
    reciprocalWorking = true,
  }: {
    signWorking?: boolean;
    numberStyle?: NumberStyle;
    reciprocalWorking?: boolean;
  } = {},
): Step[] {
  return contains(ast, "*/^") || hasMixedNumber(ast)
    ? generalWorkOut(ast, signWorking, numberStyle, reciprocalWorking)
    : signWorking
      ? bracketSteps(ast, numberStyle)
      : additiveWorkOut(ast, numberStyle);
}
export function totals(terms: Rational[]) {
  return terms.reduce(
    (sum, v) => ({
      positive: v.n > 0 ? add(sum.positive, v) : sum.positive,
      negative: v.n < 0 ? add(sum.negative, abs(v)) : sum.negative,
    }),
    { positive: rational(0), negative: rational(0) },
  );
}
