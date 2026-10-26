/** Invisible zero-width rules reserve a local sign-diagram slot inside KaTeX. */
export const signSlotColour = (index: number) =>
  `#0B01${index.toString(16).padStart(2, "0")}`;

export function signSlot(tex: string, index: number, above = false): string {
  // A quotient's two signs are on different rows. Leave a gutter for the
  // numerator connector to travel around, rather than through, the fraction.
  const body = tex.includes("\\dfrac{")
    ? `\\kern{0.8em}${tex}\\kern{0.2em}`
    : tex;
  return `\\${above ? "overset" : "underset"}{\\textcolor{${signSlotColour(index)}}{\\rule{0pt}{2.2em}}}{${body}}`;
}

export type InsetSignLayout = {
  above: boolean[];
  plain: string;
  marked: string;
  highlighted: string;
};
import type { Ast, Span } from "./parse";

/** Place a numerator's diagram above it; a denominator's diagram stays below. */
export function signSlotAbove(ast: Ast, selected: Span): boolean {
  const contains = (node: Ast) =>
    node.span.start <= selected.start && node.span.end >= selected.end;
  let above = false;
  function visit(node: Ast) {
    if (node.kind === "binary") {
      const child = contains(node.left)
        ? node.left
        : contains(node.right)
          ? node.right
          : null;
      if (!child) return;
      if (node.fractionBar) above = child === node.left;
      visit(child);
    } else if (node.kind !== "number") visit(node.child);
  }
  visit(ast);
  return above;
}
