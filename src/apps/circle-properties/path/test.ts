import type { LabId } from "../content";
import type { Marked } from "./Quiz";
import type { TestAttempt } from "./pathSession";
import { rng, whole } from "./random";
import { families, stations } from "./stations";
import type { Question, SkillId } from "./types";

/** Questions taken from each station. Twelve in all. */
export const paperPlan: Record<LabId, number> = {
  bisector: 2,
  chords: 2,
  centre: 2,
  segment: 1,
  semicircle: 2,
  "equal-arcs": 2,
  ratios: 1,
};

export type PaperItem = { station: LabId; question: Question };

/**
 * A paper mixes "find x" with "which reason". From each station it takes the
 * hardest number question first, then a reason question, then whatever is left.
 */
export function buildPaper(seed: number): PaperItem[] {
  const r = rng(seed);
  return stations.flatMap((station) => {
    const pool = station.check(whole(r, 1, 2 ** 30));
    const numbers = pool.filter((question) => question.kind === "number"),
      choices = pool.filter((question) => question.kind === "choice");
    const order = [
      numbers.at(-1),
      choices[0],
      ...choices.slice(1),
      ...numbers.slice(0, -1),
    ].filter((question): question is Question => Boolean(question));
    return order.slice(0, paperPlan[station.id]).map((question) => ({
      station: station.id,
      question: { ...question, id: `${station.id}.${question.id}` },
    }));
  });
}

export type TestSummary = TestAttempt & {
  /** Stations with at least one wrong answer, weakest first. */
  revise: LabId[];
};

export function summarise(
  paper: PaperItem[],
  marked: Marked[],
  seed: number,
  at: number,
): TestSummary {
  const familyOf = (id: LabId) =>
    stations.find((station) => station.id === id)!.family;
  const tally = families.map((family): [number, number] => {
    const mine = paper
      .map((item, i) => ({ item, result: marked[i] }))
      .filter(({ item }) => familyOf(item.station) === family.id);
    return [mine.filter(({ result }) => result.right).length, mine.length];
  });
  const wrong = paper
    .map((item, i) => ({ item, result: marked[i] }))
    .filter(({ result }) => !result.right);
  const lost = new Map<LabId, number>();
  for (const { item } of wrong)
    lost.set(item.station, (lost.get(item.station) ?? 0) + 1);
  return {
    at,
    seed,
    total: paper.length,
    mark: marked.filter((result) => result.right).length,
    families: tally,
    missed: [...new Set(wrong.flatMap(({ item }) => item.question.reasonIds))],
    slips: [
      ...new Set(wrong.map(({ item }) => item.question.skill)),
    ] as SkillId[],
    revise: [...lost.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id),
  };
}

/** A grade word for the mark, so the report opens with something human. */
export function band(
  mark: number,
  total: number,
): "top" | "pass" | "close" | "start" {
  const share = total ? mark / total : 0;
  return share >= 0.9
    ? "top"
    : share >= 0.7
      ? "pass"
      : share >= 0.5
        ? "close"
        : "start";
}
