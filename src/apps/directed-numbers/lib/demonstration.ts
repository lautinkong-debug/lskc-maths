import { type Ast } from "./parse";
import { bracketSteps, expressionTex, workOut, type Step } from "./steps";

function additive(ast: Ast): boolean {
  if (ast.kind === "number") return true;
  if (ast.kind !== "binary") return additive(ast.child);
  return (
    (ast.op === "+" || ast.op === "-") &&
    additive(ast.left) &&
    additive(ast.right)
  );
}
/** Keep every bracket change separate for a teacher-controlled demonstration. */
export function demonstrationSteps(ast: Ast): Step[] {
  return additive(ast)
    ? bracketSteps(ast)
    : workOut(ast, { signWorking: true });
}
export function highlightedTex(step: Step): string {
  const tex = expressionTex(step.before),
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
  const tex = expressionTex(step.before);
  const { start, end } = step.highlight;
  let count = 0;
  const marked = tex
    .slice(start, end)
    .replace(/[+-]/g, (sign) =>
      count++ < 2 ? `\\textcolor{#DA2127}{${sign}}` : sign,
    );
  return count >= 2 ? tex.slice(0, start) + marked + tex.slice(end) : null;
}
