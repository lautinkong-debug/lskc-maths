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
  neg,
  rational,
  RationalError,
  toTex,
  type Rational,
} from "./rational";

export type RuleId =
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
export type Step = {
  tex: string;
  highlight?: Span;
  sourceHighlight: Span;
  ruleId: RuleId;
  noteKey: RuleId;
  ast: Ast;
  before: Ast;
  pair?: [Rational, Rational];
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
    return [{ text: toTex(ast.value, { signed, style }), span: ast.span }];
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
            text: `\\left(${toTex(ast.right.value, { style })}\\right)`,
            span: ast.right.span,
          },
        ]
      : texPieces(ast.right, false, style);
  return [
    ...texPieces(ast.left, false, style),
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
function texHighlight(ast: Ast, source: Span): Span {
  let offset = 0,
    start = Infinity,
    end = 0;
  for (const piece of texPieces(ast)) {
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
export function sumRule(a: Rational, b: Rational): RuleId {
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
  ruleId: RuleId;
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
      const ruleId: RuleId =
        value.n === 0
          ? "zero"
          : (`${ast.op}${value.n < 0 ? "-" : "+"}` as RuleId);
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
            : (`${ast.op}${value.n < 0 ? "-" : "+"}` as RuleId),
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
export function bracketSteps(input: Ast): Step[] {
  const steps: Step[] = [];
  let ast = input;
  for (let guard = 0; guard < 80; guard++) {
    const change = hasGroup(ast) ? removeNext(ast) : reduceSum(ast);
    if (!change) break;
    steps.push({
      ...change,
      sourceHighlight: change.highlight,
      highlight: texHighlight(ast, change.highlight),
      before: ast,
      noteKey: change.ruleId,
      tex: expressionTex(change.ast),
    });
    ast = change.ast;
  }
  return steps;
}
/** Textbook working: adjacent bracket removals share one line, sums remain left to right. */
export function workOut(
  ast: Ast,
  _options: { signWorking?: boolean } = {},
): Step[] {
  void _options;
  const detailed = bracketSteps(ast),
    steps: Step[] = [];
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
        highlight: texHighlight(previous.before, {
          start: Math.min(
            previous.sourceHighlight.start,
            step.sourceHighlight.start,
          ),
          end: Math.max(previous.sourceHighlight.end, step.sourceHighlight.end),
        }),
      };
    } else steps.push(step);
  }
  return steps;
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
