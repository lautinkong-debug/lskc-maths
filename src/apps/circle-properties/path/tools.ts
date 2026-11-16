import type { ToolId } from "./types";

/**
 * Junior-form facts that the proofs lean on. A weak student has often forgotten
 * them, so each one is a tap away from the line that uses it.
 */
export const tools: Record<ToolId, { name: string; means: string }> = {
  given: {
    name: "given",
    means: "The question tells you this fact. You do not have to prove it.",
  },
  radii: {
    name: "radii",
    means:
      "Every radius of a circle has the same length. So two lines from the centre O to the circle are equal.",
  },
  common: {
    name: "common side",
    means: "One side belongs to both triangles. It is equal to itself.",
  },
  rhs: {
    name: "RHS",
    means:
      "Right angle, Hypotenuse, Side. Two right-angled triangles are congruent if their longest sides are equal and one other pair of sides is equal.",
  },
  sss: {
    name: "SSS",
    means:
      "Side, Side, Side. Two triangles are congruent if all three pairs of sides are equal.",
  },
  sas: {
    name: "SAS",
    means:
      "Side, Angle, Side. Two triangles are congruent if two pairs of sides are equal and the angles between those sides are equal.",
  },
  corrSides: {
    name: "corr. sides, ≅ △s",
    means:
      "Congruent triangles are the same shape and size. So their matching sides are equal.",
  },
  corrAngles: {
    name: "corr. ∠s, ≅ △s",
    means:
      "Congruent triangles are the same shape and size. So their matching angles are equal.",
  },
  isos: {
    name: "base ∠s, isos. △",
    means:
      "A triangle with two equal sides is isosceles. The two angles opposite the equal sides are equal.",
  },
  ext: {
    name: "ext. ∠ of △",
    means:
      "Extend one side of a triangle. The outside angle equals the sum of the two inside angles far from it.",
  },
  adj: {
    name: "adj. ∠s on st. line",
    means: "Angles side by side on a straight line add up to 180°.",
  },
  pyth: {
    name: "Pyth. theorem",
    means:
      "In a right-angled triangle, a² + b² = c², where c is the longest side.",
  },
  sum: {
    name: "∠ sum of △",
    means: "The three angles of a triangle add up to 180°.",
  },
  bisector: {
    name: "⊥ bisector",
    means:
      "The perpendicular bisector of AB crosses AB at its mid-point at 90°. A point that is equally far from A and B must lie on it.",
  },
};
