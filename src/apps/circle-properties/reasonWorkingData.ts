import { reasons } from "./content";

type WorkingDefinition = {
  givens: string[];
  checks: string[];
  conclusion: string;
};

/** Written applications of the reasons to the labelled exploration diagrams. */
const definitions: Record<string, WorkingDefinition> = {
  r1: {
    givens: ["O is the centre; AB is a chord and N lies on AB.", "ON ⊥ AB."],
    checks: [
      "ON starts at the centre O and meets AB at N.",
      "AB is not a diameter.",
    ],
    conclusion: "AN = NB",
  },
  r2: {
    givens: [
      "O is the centre; AB is a chord and N lies on AB.",
      "AN = NB, so N is the mid-point of AB.",
    ],
    checks: [
      "ON joins the centre O to the given mid-point N.",
      "AB is not a diameter.",
    ],
    conclusion: "ON ⊥ AB",
  },
  r3: {
    givens: [
      "N lies on chord AB and AN = NB.",
      "Line ℓ passes through N and is perpendicular to AB.",
    ],
    checks: [
      "The same line is both perpendicular to AB and through its mid-point N.",
    ],
    conclusion: "The centre O lies on line ℓ.",
  },
  r4: {
    givens: [
      "AB and CD are chords of the same circle with centre O.",
      "AB = CD; OM ⊥ AB and ON ⊥ CD.",
    ],
    checks: [
      "M lies on AB and N lies on CD, so OM and ON are the perpendicular distances.",
      "Both chords belong to the same circle.",
    ],
    conclusion: "OM = ON",
  },
  r5: {
    givens: [
      "AB and CD are chords of the same circle with centre O.",
      "OM = ON; OM ⊥ AB and ON ⊥ CD.",
    ],
    checks: [
      "M lies on AB and N lies on CD, so the equal lengths are perpendicular distances.",
      "Both chords belong to the same circle.",
    ],
    conclusion: "AB = CD",
  },
  r6: {
    givens: [
      "O is the centre; A, B and P are distinct points on the circle.",
      "∠APB = θ. The selected arc AB does not contain P.",
    ],
    checks: [
      "The centre angle ∠AOB and ∠APB stand on the same selected arc AB.",
      "If the selected arc is major, use the reflex centre angle ∠AOB.",
    ],
    conclusion: "Matching centre angle ∠AOB = 2θ",
  },
  r7: {
    givens: [
      "A, B, P and Q are distinct points on the same circle.",
      "P and Q lie on the same side of chord AB.",
    ],
    checks: ["∠APB and ∠AQB stand on the same chord AB in the same segment."],
    conclusion: "∠APB = ∠AQB",
  },
  r8: {
    givens: [
      "AB is a diameter of the circle.",
      "C lies on the circumference and is distinct from A and B.",
    ],
    checks: ["∠ACB stands on the given diameter AB."],
    conclusion: "∠ACB = 90°",
  },
  r9: {
    givens: [
      "A, B and C are distinct points on the same circle.",
      "∠ACB = 90°.",
    ],
    checks: [
      "The given right angle is at C on the circumference; its opposite chord is AB.",
    ],
    conclusion: "AB is a diameter.",
  },
  r10: {
    givens: [
      "O is the centre; A, B, C and D lie on the same circle.",
      "The minor centre angles ∠AOB = ∠COD.",
    ],
    checks: [
      "Compare the minor arc AB and minor arc CD intercepted by these equal centre angles.",
    ],
    conclusion: "Minor arc AB = minor arc CD",
  },
  r11: {
    givens: [
      "O is the centre; A, B, C and D lie on the same circle.",
      "Minor arc AB = minor arc CD.",
    ],
    checks: ["Each minor arc is matched to its own minor centre angle."],
    conclusion: "Minor centre angle ∠AOB = minor centre angle ∠COD",
  },
  r12: {
    givens: [
      "O is the centre; A, B, C and D lie on the same circle.",
      "The minor centre angles ∠AOB = ∠COD.",
    ],
    checks: ["AB and CD are the chords opposite the two equal centre angles."],
    conclusion: "AB = CD",
  },
  r13: {
    givens: [
      "O is the centre; AB and CD are chords of the same circle.",
      "AB = CD.",
    ],
    checks: [
      "Compare the minor centre angle ∠AOB with the minor centre angle ∠COD.",
    ],
    conclusion: "Minor centre angle ∠AOB = minor centre angle ∠COD",
  },
  r14: {
    givens: ["AB and CD are chords of the same circle.", "AB = CD."],
    checks: [
      "Compare minor arc AB with minor arc CD, each cut off by its own chord.",
    ],
    conclusion: "Minor arc AB = minor arc CD",
  },
  r15: {
    givens: [
      "A, B, C and D lie on the same circle.",
      "Minor arc AB = minor arc CD.",
    ],
    checks: [
      "AB and CD are the straight chords joining the endpoints of the equal arcs.",
    ],
    conclusion: "AB = CD",
  },
  r16: {
    givens: [
      "O is the centre; the selected arcs AB and CD belong to the same circle.",
      "Their corresponding centre angles are ∠AOB = θ and ∠COD = φ.",
    ],
    checks: [
      "Match arc AB to θ and arc CD to φ, using the selected arc in each case.",
      "The required ratio compares arc lengths.",
    ],
    conclusion: "\\frac{arc AB}{arc CD} = \\frac{θ}{φ}",
  },
  r17: {
    givens: [
      "The selected arcs AB and CD belong to the same circle.",
      "Their circumference angles are ∠APB = θ and ∠CQD = φ.",
    ],
    checks: [
      "P and Q lie on the circumference: arc AB excludes P and arc CD excludes Q.",
      "Match each arc to its own circumference angle.",
    ],
    conclusion: "\\frac{arc AB}{arc CD} = \\frac{θ}{φ}",
  },
};

export type ReasonWorkingModel = WorkingDefinition & {
  id: string;
  number: string;
  reason: string;
  condition: string;
};

/** Keep textbook wording/conditions in one source; the steps specialise its diagram. */
export const reasonWorking: Record<string, ReasonWorkingModel> =
  Object.fromEntries(
    reasons.map((reason) => [
      reason.id,
      {
        ...definitions[reason.id],
        id: reason.id,
        number: reason.number,
        reason: reason.label,
        condition: reason.condition,
      },
    ]),
  );
