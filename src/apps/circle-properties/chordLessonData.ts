/**
 * Guided lesson for Topic 1: when to use Theorem 16.1 and when to use 16.2.
 * Follows Lesson Worksheet 16.1 Part A and Book 5A pp. 16.1–16.4. The two
 * theorems describe the same diagram; only the GIVEN fact differs, so each
 * step hides the result until the student has made the given fact true.
 */
import { defaults, type Parameters } from "./geometry";
import { evaluateMission, missions } from "./missions";

export type ChordReason = "r1" | "r2";
/** Full solutions also hide the other reasons a line depends on. */
export type SolutionReason = ChordReason | "angleSum" | "pyth" | "extAngle";
export type ChordLessonStep = 0 | 1 | 2 | 3;
export type ChordLessonState = {
  /** Topic 1 opens on the guided lesson until the student picks Tasks or Free play. */
  open: boolean;
  step: ChordLessonStep;
  /**
   * Step 1 (16.1) and step 2 (16.2) have each been completed on the diagram.
   * This only colours the step buttons: every visit replays the demonstration.
   */
  found: [boolean, boolean];
  sort: Record<string, ChordReason>;
  /** Keyed by hidden-reason blank, not by question: a solution can hide several. */
  write: Record<string, SolutionReason>;
};

export const initialChordLesson = (): ChordLessonState => ({
  open: true,
  step: 0,
  found: [false, false],
  sort: {},
  write: {},
});

/** Step 2 starts on a different, slanting chord so N is clearly off the mid-point again. */
export const chordLessonStarts: Record<0 | 1, Required<Parameters>> = {
  0: { ...defaults.bisector },
  1: {
    ...defaults.bisector,
    primary: -3.5,
    secondary: -55,
    rotation: 32,
  },
};

/** ON ⊥ AB and AN = NB happen together; each step shows a different one first. */
export function nAtMidpoint(parameters: Parameters): boolean {
  return evaluateMission(missions.bisector[0], parameters).complete;
}

export type ChordLessonReadings = { lengths: boolean; angles: boolean };

/**
 * Step 1 shows the angle (the given) and reveals the lengths; step 2 is the reverse.
 * The Show/Hide buttons override either reading for the current step only.
 */
export function chordLessonDisplay(
  step: ChordLessonStep,
  revealed: boolean,
  override: Partial<ChordLessonReadings> = {},
): ChordLessonReadings {
  const lesson =
    step === 0
      ? { lengths: revealed, angles: true }
      : step === 1
        ? { lengths: true, angles: revealed }
        : { lengths: true, angles: true };
  return {
    lengths: override.lengths ?? lesson.lengths,
    angles: override.angles ?? lesson.angles,
  };
}

export type ChordSketchData = {
  /** The chord's ends, and where the line from O meets the chord. */
  ends: [string, string];
  foot: string;
  /** Only the GIVEN fact is marked, never the result the student must decide. */
  given: "perpendicular" | "midpoint";
  /** Chords lean different ways, so "horizontal" never looks like a condition. */
  tilt: number;
  /** The chord's distance from O as a fraction of the radius. */
  depth?: number;
  halfLabels?: [string, string?];
  /** A radius drawn to one end of the chord, with an optional length. */
  radius?: { to: 0 | 1; label?: string };
  /** A given angle at the first end, between the chord and the radius. */
  angle?: string;
  caption?: string;
  /** Where the "?" goes; "caption" means the caption already asks. */
  ask: "half" | "distance" | "footAngle" | "centreAngle" | "caption";
};

export type SortCard = {
  id: string;
  given: string;
  ask: string;
  answer: ChordReason;
  sketch: ChordSketchData;
};
const halfOfTen: ChordSketchData = {
  ends: ["A", "B"],
  foot: "N",
  given: "perpendicular",
  tilt: -8,
  caption: "AB = 10 cm",
  ask: "half",
};
const midpointAngle: ChordSketchData = {
  ends: ["A", "B"],
  foot: "N",
  given: "midpoint",
  tilt: 10,
  depth: 0.574,
  radius: { to: 0 },
  angle: "35°",
  ask: "centreAngle",
};
const equalHalves: ChordSketchData = {
  ends: ["A", "B"],
  foot: "M",
  given: "midpoint",
  tilt: -6,
  depth: 0.36,
  halfLabels: ["6 cm", "6 cm"],
  ask: "footAngle",
};
/** Different letters on purpose: students must read the given fact, not the names. */
export const sortCards: SortCard[] = [
  {
    id: "s1",
    given: "ON ⊥ AB. AB = 10 cm.",
    ask: "Find AN.",
    answer: "r1",
    sketch: halfOfTen,
  },
  {
    id: "s2",
    given: "N is the mid-point of AB. ∠OAN = 35°.",
    ask: "Find ∠AON.",
    answer: "r2",
    sketch: midpointAngle,
  },
  {
    id: "s3",
    given: "OM ⊥ CD. Radius = 13 cm, CD = 24 cm.",
    ask: "Find OM.",
    answer: "r1",
    sketch: {
      ends: ["C", "D"],
      foot: "M",
      given: "perpendicular",
      tilt: 6,
      depth: 5 / 13,
      radius: { to: 1, label: "13 cm" },
      caption: "CD = 24 cm",
      ask: "distance",
    },
  },
  {
    id: "s4",
    given: "M is the mid-point of chord PQ.",
    ask: "Find ∠OMP.",
    answer: "r2",
    sketch: {
      ends: ["P", "Q"],
      foot: "M",
      given: "midpoint",
      tilt: -14,
      ask: "footAngle",
    },
  },
  {
    id: "s5",
    given: "OT ⊥ PQ. PT = 7 cm.",
    ask: "Find PQ.",
    answer: "r1",
    sketch: {
      ends: ["P", "Q"],
      foot: "T",
      given: "perpendicular",
      tilt: 12,
      depth: 0.36,
      halfLabels: ["7 cm"],
      caption: "PQ = ?",
      ask: "caption",
    },
  },
  {
    id: "s6",
    given: "AM = MB = 6 cm.",
    ask: "Explain why OM ⊥ AB.",
    answer: "r2",
    sketch: equalHalves,
  },
];

export type SolutionBlank = {
  id: string;
  answer: SolutionReason;
  choices: SolutionReason[];
};
export type SolutionLine = {
  text: string;
  /** A reason that stays visible. */
  reason?: string;
  /** A reason hidden for the student to guess. */
  blank?: SolutionBlank;
  /** Continues the line above, so its = sign sits under the working. */
  indent?: boolean;
};
export type WriteItem = {
  id: string;
  question: string;
  sketch: ChordSketchData;
  lines: SolutionLine[];
};
const theorems: SolutionReason[] = ["r1", "r2"];
/** Full solutions, line for line as in Lesson Worksheet 16.1 Part A (version 3). */
export const writeItems: WriteItem[] = [
  {
    id: "w1",
    question: "ON ⊥ AB, AB = 10 cm. Find AN.",
    sketch: halfOfTen,
    lines: [
      { text: "∵ ON ⊥ AB", reason: "given" },
      {
        text: "∴ AN = ½AB",
        blank: { id: "w1a", answer: "r1", choices: theorems },
      },
      { text: "= ½ × 10 cm", indent: true },
      { text: "= 5 cm", indent: true },
    ],
  },
  {
    id: "w2",
    question: "N is the mid-point of AB. ∠OAN = 35°. Find ∠AON.",
    sketch: midpointAngle,
    lines: [
      { text: "∵ AN = NB", reason: "given" },
      {
        text: "∴ ∠ONA = 90°",
        blank: { id: "w2a", answer: "r2", choices: theorems },
      },
      {
        text: "∠AON = 180° − 90° − 35°",
        blank: {
          id: "w2b",
          answer: "angleSum",
          choices: ["extAngle", "angleSum", "pyth"],
        },
      },
      { text: "= 55°", indent: true },
    ],
  },
  {
    id: "w3",
    question: "Radius 10 cm, AB = 16 cm. Find the distance from O to AB.",
    sketch: {
      ends: ["A", "B"],
      foot: "N",
      given: "perpendicular",
      tilt: -10,
      depth: 0.6,
      radius: { to: 0, label: "10 cm" },
      caption: "AB = 16 cm",
      ask: "distance",
    },
    lines: [
      { text: "∵ ON ⊥ AB", reason: "given" },
      {
        text: "∴ AN = ½AB",
        blank: { id: "w3a", answer: "r1", choices: theorems },
      },
      { text: "= ½ × 16 cm", indent: true },
      { text: "= 8 cm", indent: true },
      { text: "In △OAN," },
      {
        text: "ON² + AN² = OA²",
        blank: {
          id: "w3b",
          answer: "pyth",
          choices: ["angleSum", "pyth", "extAngle"],
        },
      },
      { text: "ON = √(10² − 8²) cm" },
      { text: "= 6 cm", indent: true },
      { text: "∴ the distance from O to AB is 6 cm." },
    ],
  },
  {
    id: "w4",
    question: "AM = MB = 6 cm. Explain why OM ⊥ AB.",
    sketch: equalHalves,
    lines: [
      { text: "∵ AM = MB", reason: "given" },
      { text: "∴ M is the mid-point of AB." },
      {
        text: "∴ OM ⊥ AB",
        blank: { id: "w4a", answer: "r2", choices: theorems },
      },
    ],
  },
];

export const solutionBlanks = (item: WriteItem): SolutionBlank[] =>
  item.lines.flatMap((line) => (line.blank ? [line.blank] : []));

/** Keeps only known questions holding one of their own choices. */
function answers<T extends string>(
  raw: unknown,
  allowed: Record<string, readonly T[]>,
): Record<string, T> {
  const result: Record<string, T> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  for (const [id, choices] of Object.entries(allowed)) {
    const value = (raw as Record<string, unknown>)[id];
    if (choices.includes(value as T)) result[id] = value as T;
  }
  return result;
}

export function parseChordLesson(raw: unknown): ChordLessonState | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const value = raw as Partial<ChordLessonState>;
  const found = Array.isArray(value.found) ? value.found : [];
  return {
    open: value.open !== false,
    step: [0, 1, 2, 3].includes(value.step as number)
      ? (value.step as ChordLessonStep)
      : 0,
    found: [found[0] === true, found[1] === true],
    sort: answers<ChordReason>(
      value.sort,
      Object.fromEntries(sortCards.map((card) => [card.id, ["r1", "r2"]])),
    ),
    write: answers<SolutionReason>(
      value.write,
      Object.fromEntries(
        writeItems
          .flatMap(solutionBlanks)
          .map((blank) => [blank.id, blank.choices]),
      ),
    ),
  };
}
