import { reasons, type LabId } from "./content";
import { reasonWorking } from "./reasonWorkingData";

export type QuestChoice = { id: string; text: string; correct: boolean };
export type QuestProofStep = {
  id: string;
  text: string;
  kind: "given" | "condition" | "conclusion";
};
export type QuestLevel = {
  id: string;
  reasonId: string;
  number: string;
  level: number;
  title: string;
  lab: LabId;
  given: string;
  givens: string[];
  conclusion: string;
  reasonLabel: string;
  condition: string;
  checks: string[];
  distractorReasonIds: string[];
  conclusionChoices: QuestChoice[];
  conditionChoices: QuestChoice[];
  proofSteps: QuestProofStep[];
  detective: { erroneousReasonId: string; feedback: string };
  feedbackByReasonId: Record<string, string>;
  hint: string;
};

type MissionDetails = {
  title: string;
  distractors: [string, string];
  feedback: [string, string];
  wrongConclusions: [string, string];
  wrongConditions: [string, string];
};

const details: Record<string, MissionDetails> = {
  r1: {
    title: "Balance the bridge",
    distractors: ["r2", "r3"],
    feedback: [
      "That reason needs equal chord halves as a given. Here the perpendicular is given; equal halves are what you must establish.",
      "That reason starts with a perpendicular bisector to locate the centre. Here O is already the centre; you need to establish the midpoint.",
    ],
    wrongConclusions: ["AN = 2 × NB", "ON = AB"],
    wrongConditions: [
      "Any line perpendicular to AB bisects it.",
      "N can be any point on AB, even if ON is not perpendicular to AB.",
    ],
  },
  r2: {
    title: "Square the support",
    distractors: ["r1", "r3"],
    feedback: [
      "That reason needs perpendicularity as a given. Here the midpoint is given; perpendicularity is the conclusion.",
      "That reason locates the centre from a perpendicular bisector. You already know the centre, and have not yet established perpendicularity.",
    ],
    wrongConclusions: ["ON is parallel to AB.", "AN = ON"],
    wrongConditions: [
      "Joining any point on AB to O gives a perpendicular.",
      "The midpoint must be joined to any point inside the circle.",
    ],
  },
  r3: {
    title: "Locate the hidden centre",
    distractors: ["r1", "r2"],
    feedback: [
      "That reason starts with a line from the known centre. This task starts with a perpendicular bisector and asks where the centre lies.",
      "That reason starts with the centre and a midpoint to obtain a perpendicular. Here the midpoint and perpendicular are given, so use them to locate the centre.",
    ],
    wrongConclusions: [
      "The centre O must be N.",
      "The centre O must lie on chord AB.",
    ],
    wrongConditions: [
      "Perpendicularity alone is sufficient; the line can miss the midpoint.",
      "Passing through the midpoint alone is sufficient; the line can be sloping.",
    ],
  },
  r4: {
    title: "Balance the landing pads",
    distractors: ["r5", "r13"],
    feedback: [
      "That reason starts with equal distances to establish equal chords. Here equal chords are given; the perpendicular distances are the target.",
      "That reason establishes equal angles from equal chords. This task asks about perpendicular distances from the centre.",
    ],
    wrongConclusions: ["OM = 2 × ON", "AB = OM"],
    wrongConditions: [
      "Distance from the centre can be measured along any sloping line.",
      "The circles may have different radii.",
    ],
  },
  r5: {
    title: "Match the platforms",
    distractors: ["r4", "r15"],
    feedback: [
      "That reason starts with equal chords. Here equal perpendicular distances are given and equal chords are the conclusion.",
      "That reason needs equal arcs as a given. This task gives equal perpendicular distances from the centre.",
    ],
    wrongConclusions: ["AB = 2 × CD", "AB = OM"],
    wrongConditions: [
      "Equal sloping lengths from O to the chords are sufficient.",
      "The circles may have different radii.",
    ],
  },
  r6: {
    title: "Power the centre beacon",
    distractors: ["r7", "r8"],
    feedback: [
      "Angles in the same segment compares two circumference angles. Here one angle is at the centre and the other is at the circumference.",
      "A right angle follows from a diameter. No diameter is given here; compare the centre and circumference angles standing on the same arc.",
    ],
    wrongConclusions: [
      "Matching centre angle ∠AOB = θ",
      "Matching centre angle ∠AOB = θ ÷ 2",
    ],
    wrongConditions: [
      "The two angles may stand on different arcs.",
      "Always use the minor centre angle, even when P lies on the minor arc AB.",
    ],
  },
  r7: {
    title: "Synchronise the signals",
    distractors: ["r6", "r8"],
    feedback: [
      "The double-angle reason compares a centre angle with a circumference angle. P and Q are both on the circumference here.",
      "A semicircle needs a given diameter. Here the two angles stand on the same chord in the same segment.",
    ],
    wrongConclusions: ["∠APB = 2 × ∠AQB", "∠APB + ∠AQB = 90°"],
    wrongConditions: [
      "P and Q can be on opposite sides of AB.",
      "P and Q can be anywhere inside the circle.",
    ],
  },
  r8: {
    title: "Open the right-angle gate",
    distractors: ["r9", "r7"],
    feedback: [
      "The converse starts with a right angle to establish a diameter. Here the diameter is given, and the angle is the target.",
      "Same-segment reasoning compares two circumference angles. Here one angle stands on a given diameter, so use the semicircle reason directly.",
    ],
    wrongConclusions: ["∠ACB = 45°", "∠ACB = 180°"],
    wrongConditions: [
      "AB only needs to look horizontal.",
      "C may be any point inside the circle.",
    ],
  },
  r9: {
    title: "Find the diameter route",
    distractors: ["r8", "r3"],
    feedback: [
      "That reason requires a diameter as a given. Here the right angle is given, so use the converse to establish the diameter.",
      "No perpendicular bisector is given. The useful fact is the right angle at C on the circumference.",
    ],
    wrongConclusions: ["AC is a diameter.", "C is the centre of the circle."],
    wrongConditions: [
      "The right angle can be at any point inside the circle.",
      "A, B and C need not lie on the same circle.",
    ],
  },
  r10: {
    title: "Light the twin arcs",
    distractors: ["r11", "r12"],
    feedback: [
      "That reason runs from equal arcs to equal angles. Here equal angles are given, and equal arcs are the target.",
      "That reason reaches equal straight chords. The target here is the corresponding curved arcs.",
    ],
    wrongConclusions: ["Minor arc AB = 2 × minor arc CD", "AB = 2 × CD"],
    wrongConditions: [
      "The circles may have different radii.",
      "Either arc AB may be matched with either centre angle.",
    ],
  },
  r11: {
    title: "Synchronise the centre scanners",
    distractors: ["r10", "r13"],
    feedback: [
      "That reason starts with equal angles to establish equal arcs. Here the equal arcs are given, so reverse that direction.",
      "That reason needs equal chords as a given. The starting information here is equal minor arcs.",
    ],
    wrongConclusions: ["∠AOB = 2 × ∠COD", "∠AOB + ∠COD = 90°"],
    wrongConditions: [
      "A minor arc should be matched to a reflex centre angle.",
      "The circles may have different radii.",
    ],
  },
  r12: {
    title: "Build matching chord bridges",
    distractors: ["r13", "r10"],
    feedback: [
      "That reason starts with equal chords to establish equal angles. Here equal angles are given and chords are the target.",
      "That reason concludes equal arcs. The target here is the straight chords AB and CD.",
    ],
    wrongConclusions: ["AB = 2 × CD", "AB = CD ÷ 2"],
    wrongConditions: [
      "The circles may have different radii.",
      "The angles need not correspond to the two chords.",
    ],
  },
  r13: {
    title: "Align the central scanners",
    distractors: ["r12", "r11"],
    feedback: [
      "That reason starts with equal angles. Here equal chords are given; equal corresponding angles are what you must establish.",
      "That reason needs equal arcs as a given. The given equality here is between straight chords.",
    ],
    wrongConclusions: ["∠AOB = 2 × ∠COD", "∠AOB + ∠COD = 90°"],
    wrongConditions: [
      "Compare one minor centre angle with the other reflex centre angle.",
      "The circles may have different radii.",
    ],
  },
  r14: {
    title: "Match the circular tracks",
    distractors: ["r15", "r13"],
    feedback: [
      "That reason starts with equal arcs. Here equal straight chords are given and their minor arcs are the target.",
      "That reason establishes equal angles. The target here is equality of the corresponding minor arcs.",
    ],
    wrongConclusions: [
      "Minor arc AB = 2 × minor arc CD",
      "Minor arc AB = major arc CD",
    ],
    wrongConditions: [
      "Compare a minor arc with a major arc.",
      "The circles may have different radii.",
    ],
  },
  r15: {
    title: "Match the shortcut bridges",
    distractors: ["r14", "r11"],
    feedback: [
      "That reason starts with equal chords. Here equal arcs are given; the straight chords are the target.",
      "That reason concludes equal angles. This task asks you to establish equality of the chords.",
    ],
    wrongConclusions: [
      "AB = 2 × CD",
      "Chord AB has the same length as minor arc AB.",
    ],
    wrongConditions: [
      "The circles may have different radii.",
      "The selected chords need not join the endpoints of the equal arcs.",
    ],
  },
  r16: {
    title: "Tune the centre-angle gears",
    distractors: ["r17", "r10"],
    feedback: [
      "That reason uses circumference angles. The angles θ and φ in this task are at the centre O.",
      "Equal angles give equal arcs, but θ and φ need not be equal here. Use the proportional relationship for their arc lengths.",
    ],
    wrongConclusions: [
      "\\frac{arc AB}{arc CD} = \\frac{φ}{θ}",
      "\\frac{AB}{CD} = \\frac{θ}{φ}",
    ],
    wrongConditions: [
      "The same ratio rule also holds for the straight chords.",
      "The circles may have different radii.",
    ],
  },
  r17: {
    title: "Tune the rim-angle gears",
    distractors: ["r16", "r11"],
    feedback: [
      "That reason uses centre angles. Here θ and φ are the angles at P and Q on the circumference.",
      "Equal arcs give equal corresponding angles, but no equal arcs are given here. Use the proportional relationship with the circumference angles.",
    ],
    wrongConclusions: [
      "\\frac{arc AB}{arc CD} = \\frac{φ}{θ}",
      "\\frac{AB}{CD} = \\frac{θ}{φ}",
    ],
    wrongConditions: [
      "The intercepted arc AB should pass through its angle vertex P.",
      "The circles may have different radii.",
    ],
  },
};

const choices = (correct: string, wrong: [string, string]): QuestChoice[] => [
  { id: "correct", text: correct, correct: true },
  ...wrong.map((text, index) => ({
    id: `wrong-${index + 1}`,
    text,
    correct: false,
  })),
];

/** Each game uses the same fully specified circle construction and a distinct application direction. */
export const questLevels: QuestLevel[] = reasons.map((reason, index) => {
  const working = reasonWorking[reason.id];
  const mission = details[reason.id];
  const givens = [...working.givens];
  if (reason.id === "r1" || reason.id === "r2")
    givens.push("AB is not a diameter.");
  const given = givens.join(" ");
  const condition = working.checks.join(" ");
  return {
    id: reason.id,
    reasonId: reason.id,
    number: reason.number,
    level: index + 1,
    title: mission.title,
    lab: reason.lab,
    given,
    givens,
    conclusion: working.conclusion,
    reasonLabel: reason.label,
    condition,
    checks: [...working.checks],
    distractorReasonIds: [...mission.distractors],
    conclusionChoices: choices(working.conclusion, mission.wrongConclusions),
    conditionChoices: choices(condition, mission.wrongConditions),
    proofSteps: [
      { id: "given", kind: "given", text: `∵ ${given}` },
      { id: "condition", kind: "condition", text: condition },
      {
        id: "conclusion",
        kind: "conclusion",
        text: `∴ ${working.conclusion} (${reason.label})`,
      },
    ],
    detective: {
      erroneousReasonId: mission.distractors[0],
      feedback: mission.feedback[0],
    },
    feedbackByReasonId: Object.fromEntries(
      mission.distractors.map((id, i) => [id, mission.feedback[i]]),
    ),
    hint: reason.memory,
  };
});

/** Reproducible shuffling keeps answers out of a fixed position, without changing a question mid-render. */
export function shuffledQuestChoices<T>(
  values: readonly T[],
  seed: number,
): T[] {
  const result = [...values];
  let state = (Math.imul(Math.floor(seed), 0x9e3779b1) >>> 0) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const target = (state >>> 0) % (i + 1);
    [result[i], result[target]] = [result[target], result[i]];
  }
  return result;
}
