import { reasons } from "../../content";
import { dist, mid, type El, type Pt } from "../figureModel";
import { shuffle, type Rng } from "../random";
import type {
  Blank,
  NumberQuestion,
  Option,
  Question,
  SkillId,
} from "../types";

export const reasonOf = (id: string) => reasons.find((r) => r.id === id)!;
export const label = (id: string) => reasonOf(id).label;

/** A value written beside a segment. A positive `off` puts it on the left of a→b. */
export function segLabel(
  id: string,
  a: Pt,
  b: Pt,
  text: string,
  off = 17,
  size = 18,
): El {
  const length = dist(a, b) || 1;
  return {
    id,
    t: "txt",
    p: mid(a, b),
    text,
    dx: (-(b.y - a.y) / length) * off,
    dy: ((b.x - a.x) / length) * off + 6,
    size,
  };
}

/**
 * "Which reason?" options. Each wrong reason says what it would need to be
 * given, because the usual mistake is to pick the right picture in the wrong
 * direction.
 */
export function reasonOptions(
  r: Rng,
  correct: string,
  others: string[],
  rightWhy: string,
): Option[] {
  return shuffle(r, [
    { text: label(correct), good: true, why: rightWhy, reasonId: correct },
    ...others.map((id) => ({
      text: label(id),
      why: `That reason starts from something else. It needs: ${reasonOf(id).given}`,
      reasonId: id,
    })),
  ]);
}

/** Whole-number right-angled triangles: half chord, distance, radius. */
export const triples: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
  [15, 8, 17],
  [9, 12, 15],
  [12, 9, 15],
  [7, 24, 25],
  [24, 7, 25],
  [12, 16, 20],
  [16, 12, 20],
];

/** Rounds away floating-point dust without changing a one-decimal answer. */
export const tidy = (value: number) => Math.round(value * 100) / 100;

/**
 * A blank with its right answer and its tempting wrong ones. The position of
 * the right answer is fixed by the words themselves, so it varies from line to
 * line but never changes between visits.
 */
export function fill(
  answer: string,
  others: string[],
  why: Record<string, string> = {},
): Blank {
  const at = (answer.length * 7 + others.join("").length) % (others.length + 1);
  const options = [...others];
  options.splice(at, 0, answer);
  return { options, answer: at, why: options.map((option) => why[option]) };
}

/** A Use question reused in a Check or in the Chapter test. */
export const asQuestion = (
  id: string,
  reasonIds: string[],
  skill: SkillId,
  q: NumberQuestion,
): Question => ({
  id,
  kind: "number",
  reasonIds,
  skill,
  given: q.given,
  prompt: q.prompt,
  figure: q.figure,
  answer: q.answer,
  unit: q.unit,
  solution: q.solution,
  slips: q.slips,
});

/** A small text label at a fixed place on a figure. */
export const note = (
  id: string,
  x: number,
  y: number,
  text: string,
  size = 18,
): El => ({
  id,
  t: "txt",
  p: { x, y },
  text,
  size,
});

/**
 * With some numbers a typical wrong answer happens to equal the right one
 * (45° is both x and 90° − x). Drop those, so a right answer is never scolded.
 */
export const sound = (q: NumberQuestion): NumberQuestion => ({
  ...q,
  slips: q.slips?.filter(
    (slip) =>
      Number.isFinite(slip.value) &&
      slip.value > 0 &&
      Math.abs(slip.value - q.answer) >
        Math.max(0.06, Math.abs(q.answer) * 0.006),
  ),
});
