import { evaluatedReveal, type Step } from "./steps";

/** Combine an optional sign-and-magnitude line with its evaluated result.
 * The first click still highlights the source signs; the second calculates.
 */
export function compactWorking(steps: Step[]) {
  const result: { step: Step; start: number; end: number }[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const next = steps[i + 1];
    if (
      (step.signReveal || step.batchReveal) &&
      next &&
      !next.signReveal &&
      !next.batchReveal
    ) {
      const reveal = evaluatedReveal(step.before, next.ast, next.numberStyle);
      result.push({
        start: i,
        end: i + 1,
        step: {
          ...next,
          tex: reveal.tex,
          compactReveal: reveal,
          before: step.before,
          highlight: step.highlight,
          highlights: step.highlights,
          sourceHighlight: step.sourceHighlight,
          signArrows: step.signArrows,
        },
      });
      i++;
    } else {
      result.push({ step, start: i, end: i });
    }
  }
  return result;
}

/** Preserve the revealed mathematical result when changing the written view. */
export function compactPosition(
  position: number,
  compact: ReturnType<typeof compactWorking>,
) {
  const completed = Math.floor(position / 2);
  const done = compact.filter((entry) => entry.end < completed).length;
  const active = compact[done];
  return done * 2 + (active && position > active.start * 2 ? 1 : 0);
}

export function expandedPosition(
  position: number,
  compact: ReturnType<typeof compactWorking>,
) {
  const completed = Math.floor(position / 2);
  if (position % 2 && compact[completed])
    return compact[completed].start * 2 + 1;
  return completed ? (compact[completed - 1].end + 1) * 2 : 0;
}
