import {
  challengeGroups,
  getReasonChallenge,
  gradeReasonChallenge,
  type ChallengeGroupId,
} from "./reasonChallenge";

export type ChallengeResponse = {
  value: string;
  condition: string;
  target: string;
  reason: string;
};
export type ChallengeDraft = {
  response: ChallengeResponse;
  deadline: number | null;
  expired: boolean;
  checked: boolean;
  complete: boolean;
  tries: number;
  helped: boolean;
  bestScore: number;
};
export type ChallengeSession = {
  group: ChallengeGroupId;
  seconds: 0 | 60 | 90 | 120;
  seed: number;
  queue: string[];
  index: number;
  started: boolean;
  drafts: Record<string, ChallengeDraft>;
  best: Record<string, { score: number; solved: number }>;
  streak: number;
  bestStreak: number;
};
export const emptyChallengeResponse = (): ChallengeResponse => ({
  value: "",
  condition: "",
  target: "",
  reason: "",
});
export const newChallengeDraft = (
  seconds: number,
  time: number,
): ChallengeDraft => ({
  response: emptyChallengeResponse(),
  deadline: seconds ? time + seconds * 1000 : null,
  expired: false,
  checked: false,
  complete: false,
  tries: 0,
  helped: false,
  bestScore: 0,
});
export const initialChallengeSession: ChallengeSession = {
  group: "chords",
  seconds: 0,
  seed: 0,
  queue: [],
  index: 0,
  started: false,
  drafts: {},
  best: {},
  streak: 0,
  bestStreak: 0,
};
const count = (v: unknown, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;
const maximumStreak = Math.max(
  ...challengeGroups.map((g) => g.reasonIds.length),
);

/** Compute a chain once, from the unchecked draft that is about to be graded. */
export function updateChallengeChain(
  state: ChallengeSession,
  reasonId: string,
  time: number,
): Pick<ChallengeSession, "streak" | "bestStreak"> {
  const unchanged = { streak: state.streak, bestStreak: state.bestStreak };
  const draft = state.drafts[reasonId];
  if (
    !state.started ||
    state.queue[state.index] !== reasonId ||
    !draft ||
    draft.checked ||
    draft.complete ||
    !Number.isFinite(time)
  )
    return unchanged;
  if (draft.expired || (draft.deadline !== null && time >= draft.deadline))
    return { streak: 0, bestStreak: state.bestStreak };
  if (!Object.values(draft.response).every((value) => value.trim()))
    return unchanged;

  const challenge = getReasonChallenge(
    reasonId,
    (state.seed + state.index) % 3,
  );
  const independent =
    gradeReasonChallenge(challenge, draft.response).correct &&
    draft.tries === 0 &&
    !draft.helped;
  const streak = independent
    ? Math.min(state.queue.length, state.streak + 1)
    : 0;
  return { streak, bestStreak: Math.max(state.bestStreak, streak) };
}

/** A pace-neutral bonus; reasoning remains worth 100 points in every mode. */
export function challengeSpeedBonus(
  draft: ChallengeDraft,
  seconds: ChallengeSession["seconds"],
  correct: boolean,
  time: number,
): number {
  if (
    !correct ||
    !seconds ||
    draft.tries !== 0 ||
    draft.helped ||
    draft.checked ||
    draft.complete ||
    draft.expired ||
    draft.deadline === null ||
    !Number.isFinite(draft.deadline) ||
    !Number.isFinite(time) ||
    time >= draft.deadline
  )
    return 0;
  return Math.min(
    20,
    Math.max(0, Math.ceil((20 * (draft.deadline - time)) / (seconds * 1000))),
  );
}

export function parseChallengeSession(
  raw: unknown,
): ChallengeSession | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const value = raw as Partial<ChallengeSession>;
  const group =
    challengeGroups.find((g) => g.id === value.group) ?? challengeGroups[0];
  const seconds = [0, 60, 90, 120].includes(value.seconds!)
    ? value.seconds!
    : 0;
  const seed = count(value.seed, 2147483647) ? value.seed : 0;
  const best: ChallengeSession["best"] = {};
  if (value.best && typeof value.best === "object") {
    for (const g of challengeGroups) {
      const r = value.best[g.id];
      if (
        r &&
        count(r.score, g.reasonIds.length * 120) &&
        count(r.solved, g.reasonIds.length)
      )
        best[g.id] = { score: r.score, solved: r.solved };
    }
  }
  const queue =
    Array.isArray(value.queue) &&
    value.queue.length === group.reasonIds.length &&
    new Set(value.queue).size === value.queue.length &&
    value.queue.every(
      (id) => typeof id === "string" && group.reasonIds.includes(id),
    )
      ? value.queue
      : [];
  const drafts: ChallengeSession["drafts"] = {};
  queue.forEach((id, index) => {
    const draft = value.drafts?.[id];
    if (!draft || typeof draft !== "object") return;
    const response = draft.response;
    const challenge = getReasonChallenge(id, (seed + index) % 3);
    if (
      !response ||
      typeof response.value !== "string" ||
      response.value.length > 40 ||
      !["", challenge.q.condition, ...challenge.q.wrongConditions].includes(
        response.condition,
      ) ||
      !["", challenge.target, ...challenge.wrongTargets].includes(
        response.target,
      ) ||
      !["", ...challenge.reasonChoices].includes(response.reason) ||
      (seconds === 0
        ? draft.deadline !== null
        : draft.deadline === null
          ? draft.helped !== true
          : typeof draft.deadline !== "number" ||
            !Number.isFinite(draft.deadline) ||
            draft.deadline <= 0) ||
      !count(draft.tries, 999) ||
      !count(draft.bestScore, 120)
    )
      return;
    drafts[id] = {
      response: {
        value: response.value,
        condition: response.condition,
        target: response.target,
        reason: response.reason,
      },
      deadline: draft.deadline,
      expired: draft.expired === true,
      checked: draft.checked === true,
      complete:
        draft.checked === true &&
        gradeReasonChallenge(challenge, response).correct,
      tries: draft.tries,
      helped: draft.helped === true,
      bestScore: draft.bestScore,
    };
  });
  const index = count(value.index, queue.length - 1) ? value.index : 0;
  const independentSolves = Object.values(drafts).filter(
    (draft) => draft.complete && draft.tries === 1 && !draft.helped,
  ).length;
  const streak = count(value.streak, queue.length)
    ? Math.min(value.streak, independentSolves)
    : 0;
  const bestStreak = Math.max(
    streak,
    count(value.bestStreak, maximumStreak) ? value.bestStreak : 0,
  );
  return {
    group: group.id,
    seconds,
    seed,
    queue,
    index,
    started:
      value.started === true && queue.length > 0 && !!drafts[queue[index]],
    drafts,
    best,
    streak,
    bestStreak,
  };
}
