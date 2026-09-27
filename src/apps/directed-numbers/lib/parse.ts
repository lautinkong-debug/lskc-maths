import { copy } from "@/lib/copy";
import {
  add,
  sub,
  mul,
  div,
  neg,
  readNumber,
  RationalError,
  type Rational,
} from "./rational";
export type Span = { start: number; end: number };
export type Ast =
  | {
      kind: "number";
      value: Rational;
      span: Span;
      explicitSign: boolean;
      bracketed: boolean;
    }
  | { kind: "unary"; op: "+" | "-"; child: Ast; span: Span }
  | { kind: "group"; child: Ast; bracket: string; span: Span }
  | {
      kind: "binary";
      op: "+" | "-" | "*" | "/";
      left: Ast;
      right: Ast;
      implicit: boolean;
      span: Span;
    };
type ErrorKey = keyof typeof copy.apps.directedNumbers.errors;
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; code: ErrorKey; span: Span };
class ParseError extends Error {
  constructor(
    public code: ErrorKey,
    public span: Span,
  ) {
    super(code);
  }
}
export function parse(source: string): ParseResult<Ast> {
  let i = 0;
  const text = source
    .replace(/[−–]/g, "-")
    .replace(/[×xX·]/g, "*")
    .replace(/÷/g, "/");
  const fail = (code: ErrorKey, start = i, end = i + 1): never => {
    throw new ParseError(code, { start, end });
  };
  const space = () => {
    while (/\s/.test(text[i] ?? "") && i < text.length) i++;
  };
  function primary(allowSign: boolean): Ast {
    space();
    const start = i;
    if (text[i] === "+" || text[i] === "-") {
      if (!allowSign) fail("signedOperand");
      const op = text[i++] as "+" | "-";
      const child = primary(false);
      if (child.kind === "number")
        return {
          ...child,
          value: op === "-" ? neg(child.value) : child.value,
          explicitSign: true,
          span: { start, end: i },
        };
      return { kind: "unary", op, child, span: { start, end: i } };
    }
    if (["(", "[", "{"].includes(text[i])) {
      const bracket = text[i++];
      const close = { "(": ")", "[": "]", "{": "}" }[bracket]!;
      space();
      if (text[i] === close) fail("emptyBrackets", start, i + 1);
      let child = expr();
      space();
      if (text[i] !== close) fail("brackets", start, i);
      i++;
      if (child.kind === "number") child = { ...child, bracketed: true };
      return { kind: "group", child, bracket, span: { start, end: i } };
    }
    const number =
      /^(?:\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?|\.\d+)/.exec(
        text.slice(i),
      );
    if (!number) fail(i >= text.length ? "missingNumber" : "unknown");
    // Only the literal slash forms a fraction. A typographic divide remains an operation.
    let raw = number![0];
    const slash = raw.indexOf("/");
    if (slash >= 0 && source[i + slash] === "÷") raw = /^\d+/.exec(raw)![0];
    i += raw.length;
    if (
      raw.includes("/") &&
      /^\s*\//.test(text.slice(i)) &&
      source[
        text.slice(0, i).length + (text.slice(i).match(/^\s*/)?.[0].length ?? 0)
      ] === "/"
    )
      fail("ambiguousFraction", start, i + 1);
    return {
      kind: "number",
      value: readNumber(raw),
      explicitSign: false,
      bracketed: false,
      span: { start, end: i },
    };
  }
  function term(allowSign: boolean): Ast {
    let left = primary(allowSign);
    for (;;) {
      space();
      const token = text[i];
      const implicit = token === "(" || token === "[";
      if (token !== "*" && token !== "/" && !implicit) break;
      if (!implicit) i++;
      const right = primary(false);
      left = {
        kind: "binary",
        op: implicit ? "*" : (token as "*" | "/"),
        left,
        right,
        implicit,
        span: { start: left.span.start, end: right.span.end },
      };
    }
    return left;
  }
  function expr(): Ast {
    let left = term(true);
    for (;;) {
      space();
      const token = text[i];
      if (token !== "+" && token !== "-") break;
      i++;
      const right = term(false);
      left = {
        kind: "binary",
        op: token,
        left,
        right,
        implicit: false,
        span: { start: left.span.start, end: right.span.end },
      };
    }
    return left;
  }
  try {
    if (source.length > 80) fail("tooLong", 80, source.length);
    if (!source.trim()) fail("missingNumber", 0, 0);
    const value = expr();
    space();
    if (i !== text.length)
      fail([")", "]", "}"].includes(text[i]) ? "brackets" : "unknown");
    evaluate(value); // Also reject division by zero and unsafe values before rendering.
    return { ok: true, value };
  } catch (error) {
    const code =
      error instanceof ParseError
        ? error.code
        : error instanceof RationalError
          ? error.code
          : "invalidNumber";
    return {
      ok: false,
      code,
      message: copy.apps.directedNumbers.errors[code],
      span:
        error instanceof ParseError
          ? error.span
          : { start: 0, end: source.length },
    };
  }
}
export function evaluate(ast: Ast): Rational {
  if (ast.kind === "number") return ast.value;
  if (ast.kind === "group") return evaluate(ast.child);
  if (ast.kind === "unary")
    return ast.op === "-" ? neg(evaluate(ast.child)) : evaluate(ast.child);
  const a = evaluate(ast.left),
    b = evaluate(ast.right);
  if (ast.op === "+") return add(a, b);
  if (ast.op === "-") return sub(a, b);
  if (ast.op === "*") return mul(a, b);
  const result = div(a, b);
  if (!result.ok) throw new RationalError(result.code);
  return result.value;
}
export function parseAnswer(source: string): ParseResult<Rational> {
  try {
    return { ok: true, value: readNumber(source) };
  } catch (error) {
    const code = error instanceof RationalError ? error.code : "invalidNumber";
    return {
      ok: false,
      code,
      message: copy.apps.directedNumbers.errors[code],
      span: { start: 0, end: source.length },
    };
  }
}
