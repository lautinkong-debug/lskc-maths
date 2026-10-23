import { textbookAB } from "./textbook-ab";
import { textbookC } from "./textbook-c";
import { textbookQuickAndD } from "./textbook-qp-d";
import { textbookRevision } from "./textbook-revision";
import type { TextbookSolution, TextbookStep } from "./textbook-types";

/** A typeset continuation belongs to the same equation, not a new reveal.
 * Discard only its invisible alignment box, retaining every visible symbol. */
function completeEquations(lines: string[]): string[] {
  const complete: string[] = [];
  for (const line of lines) {
    if (complete.length && line.startsWith("\\phantom{")) {
      let depth = 1;
      let end = "\\phantom{".length;
      for (; end < line.length && depth; end++) {
        if (line[end] === "{") depth++;
        if (line[end] === "}") depth--;
      }
      if (!depth) {
        const continuation = line
          .slice(end)
          .trim()
          .replace(/^\\\s+/, "");
        complete[complete.length - 1] += ` ${continuation}`;
        continue;
      }
    }
    complete.push(line);
  }
  return complete;
}

/** A printed multi-line calculation becomes individually selectable equations.
 * The reason remains beside its first printed line, never duplicated or invented. */
export function printedLines(solution: TextbookSolution): TextbookSolution {
  const expand = (step: TextbookStep): TextbookStep[] => {
    const equations = step.math ? completeEquations(step.math) : [];
    return equations.length
      ? equations.map((line, i) => ({
          ...step,
          math: [line],
          heading: i === 0 ? step.heading : undefined,
          text: i === 0 ? step.text : undefined,
          reason: i === 0 ? step.reason : undefined,
        }))
      : [step];
  };
  return {
    ...solution,
    initialVisible: solution.steps
      .slice(0, solution.initialVisible)
      .flatMap(expand).length,
    steps: solution.steps.flatMap(expand),
  };
}

export const textbookSolutions: Record<string, TextbookSolution> =
  Object.fromEntries(
    Object.entries({
      ...textbookAB,
      ...textbookC,
      ...textbookQuickAndD,
      ...textbookRevision,
    }).map(([id, solution]) => [id, printedLines(solution)]),
  );
