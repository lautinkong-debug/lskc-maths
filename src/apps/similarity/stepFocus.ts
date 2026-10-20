import type { TextbookStep } from "./textbook-types";
import { vertexNames } from "./stepGeometry";

/** A calculation group may have several printed lines. Limit explicit names to
 * this line, rather than carrying every angle from an earlier angle-sum line. */
export function focusPrintedLine(step: TextbookStep): TextbookStep {
  const text = [...(step.math ?? []), step.text ?? "", step.reason ?? ""].join(
    " ",
  );
  const angles = [...text.matchAll(/(?:\\angle\s*|∠\s*)([A-Z]{1,3})/g)].map(
    (m) => m[1],
  );
  const sides = [...text.matchAll(/(?<![A-Z])[A-Z]{2}(?![A-Z])/g)].map(
    (m) => m[0],
  );
  if (!angles.length && !sides.length) return step;
  // Numeric substitutions such as 108° + ∠ACB + 47° still use all three
  // angles, even though only one is named. A final ∠ACB = 25° uses just ACB.
  const usesNumericAngles = /[+\-]/.test(text) && /(?:\\circ|°)/.test(text);
  const sameAngle = (reference: string, printed: string) => {
    const vertices = vertexNames(reference);
    if (printed.length === 1) return vertices[1] === printed;
    return (
      reference === printed || [...reference].reverse().join("") === printed
    );
  };
  const highlights = {
    angles: usesNumericAngles
      ? step.highlights.angles
      : step.highlights.angles?.filter((a) =>
          angles.some((b) => sameAngle(a, b)),
        ),
    sides: step.highlights.sides?.filter((a) =>
      sides.some((b) => a === b || a === [...b].reverse().join("")),
    ),
    points: step.highlights.points,
  };
  return Object.values(highlights).some((names) => names?.length)
    ? { ...step, highlights }
    : step;
}
