/**
 * Lesson Worksheet 16.1 v4, Part A Steps 1 – 3: concrete, then picture, then proof.
 * Paper circle 1 has radius 5 cm, chord 8 cm and ON = 3 cm. Each demonstration
 * moves one stage per press, so the teacher can ask before showing.
 */
import { circleLessonCopy } from "@/lib/copy";

const c = circleLessonCopy.paper;

export const PAPER_RADIUS = 5;
export type PaperChord = { half: number; distance: number; tilt: number };
/** The first is paper circle 1. The others lean, so a crease never looks special. */
export const paperChords: PaperChord[] = [
  { half: 4, distance: 3, tilt: 0 },
  { half: 3, distance: 4, tilt: -24 },
  { half: 4.8, distance: 1.4, tilt: 32 },
];

export type PaperStep = 0 | 1 | 2;
export const isPaperStep = (step: number): step is PaperStep => step <= 2;

export const foldStage = {
  start: 0,
  folded: 1,
  opened: 2,
  throughCentre: 3,
  halves: 4,
  rightAngle: 5,
  pythagoras: 6,
  seen: 7,
} as const;

export const mirrorStage = {
  picture: 0,
  flipped: 1,
  rightAngles: 2,
  radii: 3,
  radiiReason: 4,
  common: 5,
  congruent: 6,
  congruentReason: 7,
  halves: 8,
  halvesValue: 9,
} as const;

export const paperLastStage: Record<PaperStep, number> = {
  0: 9,
  1: foldStage.seen,
  2: mirrorStage.halvesValue,
};

/** Each tag appears first and its word one press later, so the class can say it. */
export function wordProgress(stage: number) {
  return {
    tags: Math.min(4, Math.ceil(stage / 2)),
    words: Math.min(4, Math.floor(stage / 2)),
    link: stage >= paperLastStage[0],
  };
}

const square = (value: number) => Number((value * value).toFixed(2));
/** "9 + 16 = 25": the numbers in step 2(d), for whichever chord is on the board. */
export const pythagorasSum = (chord: PaperChord) =>
  `${square(chord.distance)} + ${square(chord.half)} = ${square(PAPER_RADIUS)}`;

/** The line above the circle at this stage. */
export function paperTask(step: PaperStep, stage: number) {
  if (step === 0) return c.words.task;
  if (step === 1) return c.fold.tasks[stage];
  return stage < mirrorStage.rightAngles
    ? c.mirror.tasks[stage]
    : stage === mirrorStage.halvesValue
      ? c.mirror.proved
      : c.mirror.proving;
}

/** What the next press does. The last stage of a step leads to the next step. */
export function paperAction(step: PaperStep, stage: number) {
  if (stage >= paperLastStage[step]) return circleLessonCopy.next;
  if (step === 1) return c.fold.actions[stage];
  if (step === 2) return c.mirror.actions[stage];
  if (stage === paperLastStage[0] - 1) return c.words.showLink;
  return stage % 2 === 0 ? c.words.showTag : c.words.showWord;
}
