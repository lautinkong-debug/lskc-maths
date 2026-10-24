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

import { ENERGY_CAP, SKILLS } from "./skills";
import { speedBonus } from "./timing";

export const GOAL = 48;
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
    goal: GOAL,
    revision: 0,
    members: [null, null, null, null],
    pairs: [0, 1].map(() => ({
      round: 0,
      pulls: 0,
      resolved: false,
      next: [false, false],
      lastPower: 0,
      energy: 0,
      armed: null,
      shield: false,
      usedSkillRound: -1,
      lastSkill: null,
      lastBlocked: 0,
      startedAt: null,
      lastElapsedMs: null,
      lastBasePower: 0,
      lastSpeedBonus: 0,
      lastSkillBonus: 0,
    })),
    pupils: [0, 1, 2, 3].map(pupil),
    position: 0,
    winner: null,
  };
}
function activeSeats(match: Match, side: number) {
  return [side * 2, side * 2 + 1].filter(
    (seat) =>
      match.members[seat] !== null && match.pupils[seat].phase !== "waiting",
  );
}
/** Arm only occupied teams. Empty teams start when their first pupil joins. */
export function startMatchClocks(current: Match, now: number): Match {
  const match = structuredClone(current);
  let changed = false;
  for (let side = 0; side < 2; side++) {
    if (
      activeSeats(match, side).length &&
      Object.hasOwn(match.pairs[side], "startedAt") &&
      match.pairs[side].startedAt == null
    ) {
      match.pairs[side].startedAt = now;
      changed = true;
    }
  }
  if (!changed) return current;
  match.revision++;
  return match;
}
/** Late arrivals join the next round once this pair has begun solving. */
export function joinMatch(
  current: Match,
  uid: string,
  side: number,
  now?: number,
): Match {
  if (side !== 0 && side !== 1) throw new Error("invalid-seat");
  if (current.winner !== null) throw new Error("finished");
  if (current.members.includes(uid)) return current;
  const seat = [side * 2, side * 2 + 1].find(
    (i) => current.members[i] === null,
  );
  if (seat === undefined) throw new Error("full");
  const match = structuredClone(current),
    pair = match.pairs[side];
  const wasEmpty = activeSeats(current, side).length === 0;
  const started =
    pair.startedAt != null ||
    pair.resolved ||
    pair.usedSkillRound === pair.round ||
    activeSeats(current, side).some(
      (i) =>
        current.pupils[i].phase !== "answering" ||
        current.pupils[i].attempt > 0,
    );
  match.members[seat] = uid;
  if (wasEmpty && Object.hasOwn(pair, "startedAt") && typeof now === "number")
    pair.startedAt = now;
  match.pupils[seat] = { ...pupil(), phase: started ? "waiting" : "answering" };
  match.revision++;
  return match;
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
export function applyMove(
  current: Match,
  seat: number,
  move: Move,
  now = Date.now(),
): Match {
  assertSeat(seat);
  if (current.winner !== null) throw new Error("finished");
  if (current.members[seat] === null) throw new Error("empty-seat");
  if (current.pupils[seat].phase === "waiting") throw new Error("waiting");
  const question = questionFor(current, seat);
  if (move.questionId !== question.id) throw new Error("stale-question");
  const side = Math.floor(seat / 2),
    local = seat % 2;
  const match = structuredClone(current),
    pair = match.pairs[side],
    player = match.pupils[seat];
  if (move.action === "skill") {
    const spec = SKILLS.find((s) => s.id === move.skill);
    if (!spec) throw new Error("invalid-skill");
    if (pair.usedSkillRound === pair.round) {
      if (pair.lastSkill === spec.id) return current;
      throw new Error("skill-used");
    }
    if (pair.resolved) throw new Error("not-ready");
    if (pairLevel(pair) < spec.level) throw new Error("locked");
    if ((pair.energy ?? 0) < spec.cost) throw new Error("energy");
    if (spec.id === "shield" && pair.shield) throw new Error("shield-active");
    pair.energy = (pair.energy ?? 0) - spec.cost;
    pair.usedSkillRound = pair.round;
    pair.lastSkill = spec.id;
    if (spec.id === "shield") pair.shield = true;
    else pair.armed = spec.id;
  } else if (move.action === "answer") {
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
      activeSeats(match, side).every((i) => match.pupils[i].phase === "correct")
    ) {
      const base = pairLevel(pair);
      const elapsed =
        pair.startedAt == null ? null : Math.max(0, now - pair.startedAt);
      const clean = activeSeats(match, side).every(
        (i) => match.pupils[i].attempt === 0,
      );
      const timed = speedBonus(base, elapsed, clean);
      const skill =
        pair.armed === "surge" ? base + timed : pair.armed === "boost" ? 2 : 0;
      const charged = base + timed + skill;
      pair.lastBasePower = base;
      pair.lastElapsedMs = elapsed;
      pair.lastSpeedBonus = timed;
      pair.lastSkillBonus = skill;
      const opponent = match.pairs[1 - side];
      const blocked = opponent.shield ? Math.min(2, charged) : 0;
      const power = charged - blocked;
      opponent.shield = false;
      pair.armed = null;
      pair.lastBlocked = blocked;
      pair.energy = Math.min(ENERGY_CAP, (pair.energy ?? 0) + 1);
      pair.lastPower = power;
      pair.pulls++;
      pair.resolved = true;
      const goal = match.goal ?? 24;
      match.position = Math.max(
        -goal,
        Math.min(goal, match.position + (side === 0 ? -power : power)),
      );
      if (Math.abs(match.position) === goal) match.winner = side;
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
    if (activeSeats(match, side).every((i) => pair.next[i % 2])) {
      pair.round++;
      if (pair.startedAt != null) pair.startedAt = now;
      pair.lastBlocked = 0;
      pair.resolved = false;
      pair.next = [false, false];
      match.pupils[side * 2] = pupil();
      match.pupils[side * 2 + 1] = pupil();
    }
  } else throw new Error("invalid-action");
  match.revision++;
  return match;
}
// Historical results predate component fields, but the completed-pull count
// still identifies the difficulty before levelling up. Net power plus blocked
// power recovers the gross pull, including any old offensive skill.
function completedBase(pair: Pair) {
  return (
    pair.lastBasePower ??
    (pair.pulls === 0 ? 0 : Math.min(4, 1 + Math.floor((pair.pulls - 1) / 3)))
  );
}
export function matchSummary(match: Match, now = Date.now()): MatchSummary {
  return {
    goal: match.goal ?? 24,
    revision: match.revision,
    occupied: match.members.map(Boolean),
    waiting: match.pupils.map((p) => p.phase === "waiting"),
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
      energy: pair.energy ?? 0,
      armed: pair.armed ?? null,
      shield: pair.shield ?? false,
      skillUsed: pair.usedSkillRound === pair.round,
      lastSkill: pair.lastSkill ?? null,
      lastBlocked: pair.lastBlocked ?? 0,
      elapsedMs: pair.resolved
        ? (pair.lastElapsedMs ?? null)
        : pair.startedAt == null
          ? null
          : Math.max(0, now - pair.startedAt),
      speedEligible: activeSeats(match, side).every(
        (i) =>
          match.pupils[i].attempt === 0 && match.pupils[i].phase !== "wrong",
      ),
      lastElapsedMs: pair.lastElapsedMs ?? null,
      lastBasePower: completedBase(pair),
      lastSpeedBonus: pair.lastSpeedBonus ?? 0,
      lastSkillBonus:
        pair.lastSkillBonus ??
        Math.max(
          0,
          pair.lastPower + (pair.lastBlocked ?? 0) - completedBase(pair),
        ),
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
      player.phase === "answering" || player.phase === "waiting"
        ? null
        : {
            correct: player.phase === "correct",
            selected: player.choice!,
            correctOption: options.findIndex((a) => sameAnswer(a, q.answer)),
            question: q,
          },
  };
}
