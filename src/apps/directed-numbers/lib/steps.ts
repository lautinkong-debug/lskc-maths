import { copy } from "@/lib/copy";
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
  | "left-to-right"
  | "same-sign-product"
  | "diff-sign-product"
  | "same-sign-quotient"
  | "diff-sign-quotient"
  | "count-negatives"
  | "reciprocal"
  | "mixed-to-improper";
export type Step = {
  signArrows?: { tex: string; pair: string };
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
function texPieces(
  ast: Ast,
  signed = false,
  style: NumberStyle = "improper",
): { text: string; span: Span }[] {
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
      ...texPieces(ast.child, false, style),
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
/** Map the original source positions onto the immediately preceding TeX line. */
function texHighlight(
  ast: Ast,
  source: Span,
  style: NumberStyle = "improper",
): Span {
  let offset = 0,
    start = Infinity,
    end = 0;
  for (const piece of texPieces(ast, false, style)) {
    if (piece.span.end > source.start && piece.span.start < source.end) {
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
    const change = hasGroup(ast) ? removeNext(ast) : reduceSum(ast);
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
  operation?: { op: "*" | "/"; a: Rational; b: Rational };
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
  multiply: boolean,
  insideGroup: boolean,
  hasAddition: boolean,
  reciprocalWorking: boolean,
): GeneralChange | null {
  if (ast.kind === "number") return null;
  if (ast.kind === "group" || ast.kind === "unary") {
    if (atomic(ast)) return null;
    const inner = reduceTier(
      ast.child,
      multiply,
      insideGroup,
      hasAddition,
      reciprocalWorking,
    );
    return inner ? { ...inner, ast: { ...ast, child: inner.ast } } : null;
  }
  const left = reduceTier(
    ast.left,
    multiply,
    insideGroup,
    hasAddition,
    reciprocalWorking,
  );
  if (left) return { ...left, ast: { ...ast, left: left.ast } };
  const right = reduceTier(
    ast.right,
    multiply,
    insideGroup,
    hasAddition,
    reciprocalWorking,
  );
  if (right) return { ...right, ast: { ...ast, right: right.ast } };
  if ((ast.op === "*" || ast.op === "/") !== multiply) return null;
  if (!atomic(ast.left) || !atomic(ast.right)) return null;
  const a = evaluate(ast.left),
    b = evaluate(ast.right);
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
      : multiply && hasAddition
        ? "mult-div-first"
        : "left-to-right",
    kind: ast.op === "*" ? "product" : ast.op === "/" ? "quotient" : "sum",
    operation:
      ast.op === "*" || ast.op === "/" ? { op: ast.op, a, b } : undefined,
  };
}
function reduceExpression(
  ast: Ast,
  insideGroup: boolean,
  reciprocalWorking: boolean,
): GeneralChange | null {
  const hasAddition = contains(ast, "+-");
  return (
    reduceTier(ast, true, insideGroup, hasAddition, reciprocalWorking) ??
    reduceTier(ast, false, insideGroup, hasAddition, reciprocalWorking)
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
    const change =
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
    if (!change) throw new Error("Could not finish the working");
    const highlight = texHighlight(ast, change.sourceHighlight, style);
    if (
      signWorking &&
      change.operation &&
      change.operation.a.n &&
      change.operation.b.n
    ) {
      const { a, b, op } = change.operation;
      const same = Math.sign(a.n) === Math.sign(b.n);
      const ruleId: RuleId = `${same ? "same" : "diff"}-sign-${op === "*" ? "product" : "quotient"}`;
      const previous = expressionTex(ast, style);
      const signs = [a, b].map((value) => (value.n < 0 ? "-" : "+"));
      const operands = previous
        .slice(highlight.start, highlight.end)
        .split(/\\times|\\div/);
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
      const signArrows = {
        pair: signs.join(""),
        tex:
          previous.slice(0, highlight.start) +
          markedOperands.join(op === "*" ? "\\times" : "\\div") +
          previous.slice(highlight.end),
      };
      // Keep a signed subexpression grouped when it sits inside a larger sum/product.
      const nested = highlight.start > 0 || highlight.end < previous.length;
      const signReveal = {
        prefix: previous.slice(0, highlight.start) + (nested ? "\\left(" : ""),
        sign: same ? "+" : "-",
        magnitude: `\\left(${toTex(abs(a), { style })} ${op === "*" ? "\\times" : "\\div"} ${toTex(abs(b), { style })}\\right)`,
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
  return contains(ast, "*/") || hasMixedNumber(ast)
    ? generalWorkOut(ast, signWorking, numberStyle, reciprocalWorking)
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
