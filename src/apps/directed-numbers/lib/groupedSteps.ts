import { evaluate, type Ast } from "./parse";
import { abs, toTex } from "./rational";
import { signSlot, signSlotAbove } from "./signArrowLayout";
import {
  expressionTex,
  texHighlight,
  workOut,
  type NumberStyle,
  type Step,
} from "./steps";

const atomic = (node: Ast): boolean =>
  node.kind === "number" ||
  ((node.kind === "group" || node.kind === "unary") && atomic(node.child));
function factors(node: Ast): Ast[] | null {
  if (atomic(node)) return [node];
  if (node.kind === "group") return factors(node.child);
  if (node.kind !== "binary" || !["*", "/"].includes(node.op)) return null;
  const left = factors(node.left),
    right = factors(node.right);
  return left && right ? [...left, ...right] : null;
}

/** Group only disjoint, ready products/quotients; never cross a sum or bracket dependency. */
export function groupedSteps(ast: Ast, style: NumberStyle): Step[] | null {
  const groups: Ast[] = [];
  function find(node: Ast) {
    if (node.kind === "binary" && factors(node) && evaluate(node).n !== 0) {
      groups.push(node);
      return;
    }
    if (node.kind === "binary") {
      find(node.left);
      find(node.right);
    } else if (node.kind !== "number") find(node.child);
  }
  find(ast);
  if (groups.length < 2) return null;
  const original = expressionTex(ast, style);
  const spans = groups.map((node) => texHighlight(ast, node.span, style));
  function replace(parts: string[]) {
    return spans.reduceRight(
      (text, span, i) =>
        text.slice(0, span.start) + parts[i] + text.slice(span.end),
      original,
    );
  }
  function chain(node: Ast, marked: boolean): string {
    if (atomic(node)) {
      const value = evaluate(node),
        magnitude = toTex(abs(value), { style });
      return marked
        ? `\\left(\\textcolor{#DA2127}{${value.n < 0 ? "-" : "+"}}${magnitude}\\right)`
        : magnitude;
    }
    if (node.kind === "group")
      return `\\left(${chain(node.child, marked)}\\right)`;
    if (node.kind !== "binary") throw new Error("Invalid independent product");
    if (node.op === "/" && node.fractionBar)
      return `\\dfrac{${chain(node.left, marked)}}{${chain(node.right, marked)}}`;
    return `${chain(node.left, marked)} ${node.op === "*" ? "\\times" : "\\div"} ${chain(node.right, marked)}`;
  }
  const signs = groups.map((node) => (evaluate(node).n < 0 ? "-" : "+"));
  const magnitudes = groups.map(
    (node) => `\\left(${chain(node, false)}\\right)`,
  );
  const marked = groups.map((node) => chain(node, true));
  const above = groups.map((node) => signSlotAbove(ast, node.span));
  // Map KaTeX's bottom-to-top fraction DOM back to the source factor order.
  let anchorIndex = 0;
  function factorOrder(node: Ast): number[] {
    if (atomic(node)) return [anchorIndex++];
    if (node.kind === "group") return factorOrder(node.child);
    if (node.kind !== "binary") return [];
    const left = factorOrder(node.left),
      right = factorOrder(node.right);
    return node.fractionBar ? [...right, ...left] : [...left, ...right];
  }
  const groupOrders = new Map(groups.map((node) => [node, factorOrder(node)]));
  function renderedOrder(node: Ast): number[] {
    const group = groupOrders.get(node);
    if (group) return group;
    if (node.kind === "binary") {
      const left = renderedOrder(node.left),
        right = renderedOrder(node.right);
      return node.fractionBar ? [...right, ...left] : [...left, ...right];
    }
    return node.kind === "number" ? [] : renderedOrder(node.child);
  }
  const result = new Map(groups.map((node) => [node, evaluate(node)]));
  function reduce(node: Ast): Ast {
    const value = result.get(node);
    if (value)
      return {
        kind: "number",
        value,
        span: node.span,
        explicitSign: false,
        bracketed: false,
      };
    if (node.kind === "binary")
      return { ...node, left: reduce(node.left), right: reduce(node.right) };
    if (node.kind !== "number") return { ...node, child: reduce(node.child) };
    return node;
  }
  const simplified = reduce(ast);
  const common = {
    before: ast,
    numberStyle: style,
    sourceHighlight: ast.span,
    highlight: spans[0],
    highlights: spans,
    ruleId: "mult-div-first",
    noteKey: "mult-div-first",
  } as const;
  return [
    {
      ...common,
      ast,
      kind: "sign",
      tex: replace(
        signs.map((sign, i) => `\\left(${sign}${magnitudes[i]}\\right)`),
      ),
      batchReveal: {
        signTex: replace(signs.map((sign) => `\\left(${sign}\\right)`)),
        animatedTex: replace(
          signs.map(
            (sign, i) =>
              `\\left(${sign}\\textcolor{#13579B}{${magnitudes[i]}}\\right)`,
          ),
        ),
      },
      signArrows: {
        pair: signs.join(""),
        anchorOrder: renderedOrder(ast),
        ...(original.includes("\\dfrac{")
          ? {
              inset: {
                above,
                plain: replace(
                  spans.map((span, i) =>
                    signSlot(original.slice(span.start, span.end), i, above[i]),
                  ),
                ),
                marked: replace(
                  marked.map((part, i) => signSlot(part, i, above[i])),
                ),
                highlighted: replace(
                  marked.map((part, i) =>
                    signSlot(`\\colorbox{#fff1ad}{$${part}$}`, i, above[i]),
                  ),
                ),
              },
            }
          : {}),
        tex: replace(marked),
        highlighted: replace(
          marked.map((part) => `\\colorbox{#fff1ad}{$${part}$}`),
        ),
        groups: groups.map((node, i) => ({
          signs: factors(node)!
            .map((factor) => (evaluate(factor).n < 0 ? "-" : "+"))
            .join(""),
          result: signs[i] === "-" ? "−" : "+",
        })),
      },
    },
    {
      ...common,
      ast: simplified,
      kind: "product",
      tex: expressionTex(simplified, style),
    },
    ...workOut(simplified, {
      signWorking: true,
      numberStyle: style,
      reciprocalWorking: false,
    }),
  ];
}
