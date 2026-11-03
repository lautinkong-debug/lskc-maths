/**
 * Guided lesson for Topic 1: when to use Theorem 16.1 and when to use 16.2.
 * Follows Lesson Worksheet 16.1 Part A and Book 5A pp. 16.1–16.4. The two
 * theorems describe the same diagram; only the GIVEN fact differs, so each
 * step hides the result until the student has made the given fact true.
 */
import { defaults, type Parameters } from "./geometry";
import { evaluateMission, missions } from "./missions";

export type ChordReason = "r1" | "r2";
export type ChordLessonStep = 0 | 1 | 2 | 3;
export type ChordLessonState = {
  /** Topic 1 opens on the guided lesson until the student picks Tasks or Free play. */
  open: boolean;
  step: ChordLessonStep;
  /** Step 1 (16.1) and step 2 (16.2) have each been completed on the diagram. */
  found: [boolean, boolean];
  sort: Record<string, ChordReason>;
  write: Record<string, ChordReason>;
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

/** Step 1 shows the angle (the given) and reveals the lengths; step 2 is the reverse. */
export function chordLessonDisplay(state: ChordLessonState): {
  lengths: boolean;
  angles: boolean;
} {
  if (state.step === 0) return { lengths: state.found[0], angles: true };
  if (state.step === 1) return { lengths: true, angles: state.found[1] };
  return { lengths: true, angles: true };
}

export type SortCard = {
  id: string;
  given: string;
  ask: string;
  answer: ChordReason;
};
/** Different letters on purpose: students must read the given fact, not the names. */
export const sortCards: SortCard[] = [
  { id: "s1", given: "ON ⊥ AB. AB = 10 cm.", ask: "Find AN.", answer: "r1" },
  {
    id: "s2",
    given: "N is the mid-point of AB. ∠OAN = 35°.",
    ask: "Find ∠AON.",
    answer: "r2",
  },
  {
    id: "s3",
    given: "OM ⊥ CD. Radius = 13 cm, CD = 24 cm.",
    ask: "Find OM.",
    answer: "r1",
  },
  {
    id: "s4",
    given: "M is the mid-point of chord PQ.",
    ask: "Find ∠OMP.",
    answer: "r2",
  },
  { id: "s5", given: "OT ⊥ PQ. PT = 7 cm.", ask: "Find PQ.", answer: "r1" },
  {
    id: "s6",
    given: "AM = MB = 6 cm.",
    ask: "Explain why OM ⊥ AB.",
    answer: "r2",
  },
];

export type WriteItem = {
  id: string;
  question: string;
  /** The first line ends with the missing reason, shown as ( ? ). */
  lines: string[];
  answer: ChordReason;
};
/** "Write it like this" lines from the worksheet and Example 16.1. */
export const writeItems: WriteItem[] = [
  {
    id: "w1",
    question: "ON ⊥ AB, AB = 10 cm. Find AN.",
    lines: ["AN = ½ × 10 cm", "= 5 cm"],
    answer: "r1",
  },
  {
    id: "w2",
    question: "N is the mid-point of AB. ∠OAN = 35°. Find ∠AON.",
    lines: ["∠ONA = 90°", "∠AON = 180° − 90° − 35°   (∠ sum of △)", "= 55°"],
    answer: "r2",
  },
  {
    id: "w3",
    question: "Radius 10 cm, AB = 16 cm. N is on AB and ON ⊥ AB. Find ON.",
    lines: ["AN = 8 cm", "ON = √(10² − 8²) cm   (Pyth. theorem)", "= 6 cm"],
    answer: "r1",
  },
];

const reasonIds: ChordReason[] = ["r1", "r2"];
const isReason = (value: unknown): value is ChordReason =>
  reasonIds.includes(value as ChordReason);
function answers(raw: unknown, ids: string[]): Record<string, ChordReason> {
  const result: Record<string, ChordReason> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
  for (const id of ids) {
    const value = (raw as Record<string, unknown>)[id];
    if (isReason(value)) result[id] = value;
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
    sort: answers(
      value.sort,
      sortCards.map((card) => card.id),
    ),
    write: answers(
      value.write,
      writeItems.map((item) => item.id),
    ),
  };
}
