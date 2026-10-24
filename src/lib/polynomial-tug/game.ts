import { createHmac, randomBytes } from "node:crypto";
import {
  generateQuestion,
  type Stage,
} from "@/apps/polynomials/quest/questions";
import { answerChoices } from "@/apps/polynomials/quest/choices";
import { polynomialSource, sameAnswer } from "@/apps/polynomials/quest/algebra";
import type {
  Match,
  MatchSummary,
  Move,
  Pair,
  PlayerView,
  Pupil,
} from "./types";

export const GOAL = 24;
const pupil = (): Pupil => ({
  attempt: 0,
  phase: "answering",
  choice: null,
  previousSource: null,
});
export const pairLevel = (pair: Pair) =>
  Math.min(4, 1 + Math.floor(pair.pulls / 3));
export function newMatch(
  seed: number,
  secret = randomBytes(32).toString("hex"),
): Match {
  return {
    seed,
    secret,
    revision: 0,
    members: [null, null, null, null],
    pairs: [0, 1].map(() => ({
      round: 0,
      pulls: 0,
      resolved: false,
      next: [false, false],
      lastPower: 0,
    })),
    pupils: [0, 1, 2, 3].map(pupil),
    position: 0,
    winner: null,
  };
}
function assertSeat(seat: number) {
  if (!Number.isInteger(seat) || seat < 0 || seat > 3)
    throw new Error("invalid-seat");
}
export function questionFor(match: Match, seat: number) {
  assertSeat(seat);
  const pair = match.pairs[Math.floor(seat / 2)],
    player = match.pupils[seat];
  const stage = Math.min(3, Math.floor(pair.round / 3)) as Stage;
  // Each tier spans its six templates across the two partners' three pulls.
  const template = (pair.round % 3) * 2 + (seat % 2);
  const seed =
    (match.seed +
      pair.round * 65537 +
      (seat % 2) * 7919 +
      player.attempt * 104729) >>>
    0;
  const q = generateQuestion(
    stage,
    template,
    seed,
    player.previousSource ?? undefined,
  );
  // Opposing pairs get matched difficulty with independently ordered options.
  return {
    ...q,
    id: createHmac("sha256", match.secret)
      .update(
        `public:${q.id}:seat${seat}:round${pair.round}:try${player.attempt}`,
      )
      .digest("hex")
      .slice(0, 32),
  };
}
/** The public question ID must never determine the correct answer's position. */
export function optionsFor(match: Match, seat: number) {
  const q = questionFor(match, seat);
  return answerChoices({
    ...q,
    id: createHmac("sha256", match.secret)
      .update(`options:${q.id}`)
      .digest("hex"),
  });
}
export function applyMove(current: Match, seat: number, move: Move): Match {
  assertSeat(seat);
  if (current.winner !== null) throw new Error("finished");
  const question = questionFor(current, seat);
  if (move.questionId !== question.id) throw new Error("stale-question");
  const side = Math.floor(seat / 2),
    local = seat % 2;
  const match = structuredClone(current),
    pair = match.pairs[side],
    player = match.pupils[seat];
  if (move.action === "answer") {
    if (!Number.isInteger(move.option) || move.option! < 0 || move.option! > 3)
      throw new Error("invalid-option");
    if (player.phase !== "answering") return current;
    player.choice = move.option!;
    player.phase = sameAnswer(
      optionsFor(current, seat)[move.option!],
      question.answer,
    )
      ? "correct"
      : "wrong";
    if (
      !pair.resolved &&
      [side * 2, side * 2 + 1].every((i) => match.pupils[i].phase === "correct")
    ) {
      const power = pairLevel(pair);
      pair.lastPower = power;
      pair.pulls++;
      pair.resolved = true;
      match.position = Math.max(
        -GOAL,
        Math.min(GOAL, match.position + (side === 0 ? -power : power)),
      );
      if (Math.abs(match.position) === GOAL) match.winner = side;
    }
  } else if (move.action === "retry") {
    if (player.phase !== "wrong") throw new Error("not-ready");
    player.attempt++;
    player.previousSource = question.source;
    player.phase = "answering";
    player.choice = null;
  } else if (move.action === "next") {
    if (!pair.resolved) throw new Error("not-ready");
    if (pair.next[local]) return current;
    pair.next[local] = true;
    if (pair.next.every(Boolean)) {
      pair.round++;
      pair.resolved = false;
      pair.next = [false, false];
      match.pupils[side * 2] = pupil();
      match.pupils[side * 2 + 1] = pupil();
    }
  } else throw new Error("invalid-action");
  match.revision++;
  return match;
}
export function matchSummary(match: Match): MatchSummary {
  return {
    revision: match.revision,
    occupied: match.members.map(Boolean),
    position: match.position,
    winner: match.winner,
    pairs: match.pairs.map((pair, side) => ({
      level: pairLevel(pair),
      power: pairLevel(pair),
      pulls: pair.pulls,
      ready: [0, 1].map((i) => match.pupils[side * 2 + i].phase === "correct"),
      advancing: [...pair.next],
      resolved: pair.resolved,
      lastPower: pair.lastPower,
    })),
  };
}
export function playerView(match: Match, seat: number): PlayerView {
  const q = questionFor(match, seat),
    options = optionsFor(match, seat),
    player = match.pupils[seat];
  return {
    phase: player.phase,
    question: {
      id: q.id,
      source: q.source,
      choices: options.map(polynomialSource),
      hint: q.hint,
    },
    feedback:
      player.phase === "answering"
        ? null
        : {
            correct: player.phase === "correct",
            selected: player.choice!,
            correctOption: options.findIndex((a) => sameAnswer(a, q.answer)),
            question: q,
          },
  };
}
