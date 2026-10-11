import { type Ast } from "./parse";
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
    : workOut(ast, {
        signWorking: true,
        numberStyle,
        reciprocalWorking: false,
      });
}
export function highlightedTex(step: Step): string {
  const tex = expressionTex(step.before, step.numberStyle),
    span = step.highlight;
  if (!span) return tex;
  let start = span.start,
    end = span.end;
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
