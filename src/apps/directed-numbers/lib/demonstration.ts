import { type Ast } from "./parse";
import { groupedSteps } from "./groupedSteps";
import {
  signSlot,
  signSlotAbove,
  type InsetSignLayout,
} from "./signArrowLayout";
import {
  bracketSteps,
  expressionTex,
  workOut,
  type Step,
  type NumberStyle,
} from "./steps";

function additive(ast: Ast): boolean {
  if (ast.kind === "number") return true;
  if (ast.kind !== "binary") return additive(ast.child);
  return (
    (ast.op === "+" || ast.op === "-") &&
    additive(ast.left) &&
    additive(ast.right)
  );
}
/** Keep the source number format throughout each generated line. */
export function demonstrationStyle(ast: Ast): NumberStyle {
  function hasForm(node: Ast, forms: string[]): boolean {
    return node.kind === "number"
      ? forms.includes(node.sourceForm ?? "")
      : node.kind === "binary"
        ? hasForm(node.left, forms) || hasForm(node.right, forms)
        : hasForm(node.child, forms);
  }
  return !hasForm(ast, ["fraction", "mixed"]) && hasForm(ast, ["decimal"])
    ? "decimal"
    : "improper";
}
/** Keep every bracket change separate for a teacher-controlled demonstration. */
export function demonstrationSteps(ast: Ast): Step[] {
  const numberStyle = demonstrationStyle(ast);
  return additive(ast)
    ? bracketSteps(ast, numberStyle)
    : (groupedSteps(ast, numberStyle) ??
        workOut(ast, {
          signWorking: true,
          numberStyle,
          reciprocalWorking: false,
        }));
}
export function highlightedTex(step: Step, showSigns = false): string {
  if (showSigns && step.signArrows?.highlighted)
    return step.signArrows.highlighted;
  if (step.highlights && (!showSigns || !step.signArrows)) {
    return step.highlights.reduceRight(
      (text, span) =>
        `${text.slice(0, span.start)}\\colorbox{#fff1ad}{$${text.slice(span.start, span.end)}$}${text.slice(span.end)}`,
      expressionTex(step.before, step.numberStyle),
    );
  }
  const original = expressionTex(step.before, step.numberStyle);
  const tex = showSigns ? (signArrowTex(step) ?? original) : original,
    span = step.highlight;
  if (!span) return tex;
  let start = span.start,
    end = span.end + tex.length - original.length;
  const part = tex.slice(start, end);
  // A highlight must contain complete TeX delimiters, including nested fractions.
  if (
    (part.match(/\\left/g) ?? []).length !==
    (part.match(/\\right/g) ?? []).length
  ) {
    start = 0;
    end = tex.length;
  }
  return `${tex.slice(0, start)}\\colorbox{#fff1ad}{$${tex.slice(start, end)}$}${tex.slice(end)}`;
}

/** Mark the actual operation sign and operand sign for the two-arrow diagram. */
export function signArrowTex(step: Step): string | null {
  if (step.signArrows) return step.signArrows.tex;
  if (!["++", "+-", "-+", "--"].includes(step.ruleId) || !step.highlight)
    return null;
  const tex = expressionTex(step.before, step.numberStyle);
  const { start, end } = step.highlight;
  let count = 0;
  const marked = tex
    .slice(start, end)
    .replace(/[+-]/g, (sign) =>
      count++ < 2 ? `\\textcolor{#DA2127}{${sign}}` : sign,
    );
  return count >= 2 ? tex.slice(0, start) + marked + tex.slice(end) : null;
}

/** Reserve the sign diagram inside the affected fraction operand. */
export function insetSignLayout(step: Step): InsetSignLayout | null {
  if (step.signArrows?.inset) return step.signArrows.inset;
  const original = expressionTex(step.before, step.numberStyle);
  const marked = signArrowTex(step);
  if (!original.includes("\\dfrac{") || !marked || !step.highlight) return null;
  const { start, end } = step.highlight;
  const markedEnd = end + marked.length - original.length;
  const part = marked.slice(start, markedEnd);
  const prefix = marked.slice(0, start),
    suffix = marked.slice(markedEnd);
  const above = signSlotAbove(step.before, step.sourceHighlight);
  return {
    above: [above],
    plain:
      original.slice(0, start) +
      signSlot(original.slice(start, end), 0, above) +
      original.slice(end),
    marked: prefix + signSlot(part, 0, above) + suffix,
    highlighted:
      prefix + signSlot(`\\colorbox{#fff1ad}{$${part}$}`, 0, above) + suffix,
  };
}
