import type { TextbookStep } from "./textbook-types";

/** Keep history within the printed part/subpart or the current triangle proof.
 * A preliminary angle calculation is still part of its following proof. */
export function proofSection(steps: TextbookStep[], active: number) {
  const starts = [0];
  let completedProof = false;
  for (let i = 0; i < steps.length; i++) {
    const heading = steps[i].heading?.trim() ?? "";
    const part = /^\([a-z]+\)(?:\s|$)/i.test(heading);
    const alternative = /^Alternative Solution\b/i.test(heading);
    const nextComparison =
      completedProof && /^In △[A-Z]+ and △[A-Z]+/.test(heading);
    if (i > 0 && (part || alternative || nextComparison)) {
      starts.push(i);
      completedProof = false;
    }
    completedProof ||= !!steps[i].conclusion;
  }
  const index = Math.max(0, Math.min(active, steps.length - 1));
  const start = starts.findLast((n) => n <= index) ?? 0;
  const end = starts.find((n) => n > index) ?? steps.length;
  return { start, end };
}
