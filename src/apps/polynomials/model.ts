/** Exact source expressions, kept as syntax trees so rendered working can be checked. */
export type Expression =
  | { kind: "term"; coefficient: number; power: number }
  | { kind: "sum"; terms: readonly Expression[] }
  | { kind: "product"; factors: readonly Expression[] }
  | { kind: "difference"; left: Expression; right: Expression }
  | { kind: "group"; value: Expression; square?: boolean }
  | { kind: "square"; value: Expression };

const term = (coefficient: number, power = 0): Expression => ({
  kind: "term",
  coefficient,
  power,
});
const sum = (...terms: Expression[]): Expression => ({ kind: "sum", terms });
const product = (...factors: Expression[]): Expression => ({
  kind: "product",
  factors,
});
const difference = (left: Expression, right: Expression): Expression => ({
  kind: "difference",
  left,
  right,
});
const group = (value: Expression, square = false): Expression => ({
  kind: "group",
  value,
  square,
});
const square = (value: Expression): Expression => ({ kind: "square", value });

export function toTex(expression: Expression): string {
  switch (expression.kind) {
    case "term": {
      const { coefficient: c, power: p } = expression;
      if (p === 0 || c === 0) return String(c);
      return `${c === 1 ? "" : c === -1 ? "-" : c}x${p === 1 ? "" : `^{${p}}`}`;
    }
    case "sum":
      return expression.terms
        .map((t, i) => {
          const text = toTex(t);
          return `${i && !text.startsWith("-") ? "+" : ""}${text}`;
        })
        .join("");
    case "product":
      return expression.factors.map(toTex).join("");
    case "difference":
      return `${toTex(expression.left)}-${toTex(expression.right)}`;
    case "group":
      return expression.square
        ? `\\left[${toTex(expression.value)}\\right]`
        : `(${toTex(expression.value)})`;
    case "square":
      return `(${toTex(expression.value)})^{2}`;
  }
}

const bracket = sum(term(3, 1), term(4));
const outside = term(2, 2);

export const question = {
  id: "10D-34b",
  page: "10.35",
  answerPage: "10.52",
  printedAnswer: "-7x^{2}-24x-16",
  sourceImage: "/polynomials/10D-34b.webp",
} as const;

export const equations = [
  { id: "original", expression: difference(outside, square(bracket)) },
  {
    id: "repeated",
    expression: difference(
      outside,
      group(product(group(bracket), group(bracket)), true),
    ),
  },
  {
    id: "distributed",
    expression: difference(
      outside,
      group(
        sum(
          product(term(3, 1), group(bracket)),
          product(term(4), group(bracket)),
        ),
        true,
      ),
    ),
  },
  {
    id: "expanded",
    expression: difference(
      outside,
      group(sum(term(9, 2), term(12, 1), term(12, 1), term(16)), true),
    ),
  },
  {
    id: "collected",
    expression: difference(
      outside,
      group(sum(term(9, 2), term(24, 1), term(16))),
    ),
  },
  {
    id: "removed",
    expression: sum(outside, term(-9, 2), term(-24, 1), term(-16)),
  },
  {
    id: "grouped",
    expression: sum(
      product(group(difference(term(2), term(9))), term(1, 2)),
      term(-24, 1),
      term(-16),
    ),
  },
  { id: "answer", expression: sum(term(-7, 2), term(-24, 1), term(-16)) },
] as const;

export const products = [
  {
    left: term(3, 1),
    right: term(3, 1),
    result: term(9, 2),
    row: 0,
    column: 0,
  },
  { left: term(3, 1), right: term(4), result: term(12, 1), row: 0, column: 1 },
  { left: term(4), right: term(3, 1), result: term(12, 1), row: 1, column: 0 },
  { left: term(4), right: term(4), result: term(16), row: 1, column: 1 },
] as const;

export type BoardMode =
  | "question"
  | "square"
  | "distribute"
  | "product"
  | "collect"
  | "minus-focus"
  | "minus"
  | "group"
  | "answer";
export type Frame = {
  id: string;
  mode: BoardMode;
  equation: number;
  activeProduct: number | null;
  revealedProducts: number;
};

const frame = (
  id: string,
  mode: BoardMode,
  equation: number,
  activeProduct: number | null = null,
  revealedProducts = 0,
): Frame => ({ id, mode, equation, activeProduct, revealedProducts });

export const frames: readonly Frame[] = [
  frame("read", "question", 0),
  frame("square", "square", 1),
  frame("distribute", "distribute", 2),
  ...products.flatMap((_, i) => [
    frame(`pair-${i}`, "product", 2, i, i),
    frame(`result-${i}`, "product", i === 3 ? 3 : 2, i, i + 1),
  ]),
  frame("collect", "collect", 4, null, 4),
  frame("minus-focus", "minus-focus", 4, null, 4),
  frame("minus", "minus", 5, null, 4),
  frame("group", "group", 6, null, 4),
  frame("answer", "answer", 7, null, 4),
];
