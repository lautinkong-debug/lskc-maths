import { textbookAB } from "./textbook-ab";
import { textbookC } from "./textbook-c";
import { textbookQuickAndD } from "./textbook-qp-d";
import { textbookRevision } from "./textbook-revision";
import type { TextbookSolution, TextbookStep } from "./textbook-types";

/** A printed multi-line calculation becomes individually selectable lines.
 * The reason remains beside its first printed line, never duplicated or invented. */
export function printedLines(solution: TextbookSolution): TextbookSolution {
  const expand = (step: TextbookStep): TextbookStep[] =>
    (step.math?.length ?? 0) > 1
      ? step.math!.map((line, i) => ({
          ...step,
          math: [line],
          heading: i === 0 ? step.heading : undefined,
          text: i === 0 ? step.text : undefined,
          reason: i === 0 ? step.reason : undefined,
        }))
      : [step];
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
