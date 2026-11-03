import {
  challengeGroups,
  challengeGroup,
  savedChallengeGroups,
  createChallengeQueue,
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
export type ChallengeRun = {
  group: ChallengeGroupId;
  seconds: 0 | 60 | 90 | 120;
  seed: number;
  queue: string[];
  index: number;
  drafts: Record<string, ChallengeDraft>;
  variants: Record<string, number>;
  setNumber: number;
  streak: number;
};
export type ChallengeSession = ChallengeRun & {
  started: boolean;
  best: Record<string, { score: number; solved: number }>;
  bestStreak: number;
  archive: ChallengeRun[];
  reviewSet: number | null;
  reviewIndex: number;
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
  group: "topic-bisector",
  seconds: 0,
  seed: 0,
  queue: [],
  index: 0,
  started: false,
  drafts: {},
  variants: {},
  setNumber: 1,
  best: {},
  streak: 0,
  bestStreak: 0,
  archive: [],
  reviewSet: null,
  reviewIndex: 0,
};
const archiveLimit = 10;

export function challengeVariant(run: ChallengeRun, index = run.index): number {
  return run.variants[run.queue[index]] ?? (run.seed + index) % 3;
}

/** Keep the question parameters with the answers so later sets cannot alter them. */
export function archiveChallengeRun(state: ChallengeSession): ChallengeSession {
  if (!state.queue.length) return state;
  const {
    group,
    seconds,
    seed,
    queue,
    index,
    drafts,
    variants,
    setNumber,
    streak,
  } = state;
  return {
    ...state,
    archive: [
      ...state.archive,
      {
        group,
        seconds,
        seed,
        queue,
        index,
        drafts,
        variants,
        setNumber,
        streak,
      },
    ].slice(-archiveLimit),
    queue: [],
    drafts: {},
    variants: {},
    index: 0,
    streak: 0,
    started: false,
    setNumber: setNumber + 1,
    reviewSet: null,
    reviewIndex: 0,
  };
}

export function startChallengeSet(
  state: ChallengeSession,
  time: number,
  group = state.group,
  seconds = state.seconds,
): ChallengeSession {
  const saved = archiveChallengeRun(state);
  const seed = Math.floor(time) % 2147483647;
  const queue = createChallengeQueue(group, seed);
  const previous = [...saved.archive]
    .reverse()
    .find((run) => run.group === group);
  const variants = Object.fromEntries(
    queue.map((id, index) => [
      id,
      previous
        ? (challengeVariant(previous, previous.queue.indexOf(id)) + 1) %
          2147483647
        : (seed + index) % 3,
    ]),
  );
  return {
    ...saved,
    group,
    seconds,
    seed,
    queue,
    variants,
    index: 0,
    started: true,
    reviewSet: null,
    reviewIndex: 0,
    drafts: { [queue[0]]: newChallengeDraft(seconds, time) },
  };
}

/**
 * Move to another question in the current set. Practice questions open at once;
 * a timed question stays unopened until openChallengeQuestion, so looking ahead
 * never starts a clock.
 */
export function navigateChallengeSet(
  state: ChallengeSession,
  index: number,
  time: number,
): ChallengeSession {
  if (state.reviewSet !== null) {
    return viewChallengeSet(state).queue[index]
      ? { ...state, reviewIndex: index }
      : state;
  }
  const id = state.queue[index];
  if (!id) return state;
  const next = { ...state, index };
  return state.seconds ? next : openChallengeQuestion(next, time);
}

/** Start the current question's timer the first time it is opened. */
export function openChallengeQuestion(
  state: ChallengeSession,
  time: number,
): ChallengeSession {
  const id = state.queue[state.index];
  if (state.reviewSet !== null || !id || state.drafts[id]) return state;
  return {
    ...state,
    drafts: { ...state.drafts, [id]: newChallengeDraft(state.seconds, time) },
  };
}

/** A set with unsolved questions that the student has started. */
export function unfinishedChallengeSet(state: ChallengeRun): boolean {
  return (
    state.queue.length > 0 &&
    Object.keys(state.drafts).length > 0 &&
    state.queue.some((id) => !state.drafts[id]?.complete)
  );
}

/**
 * Open a topic from an Explore practice link. The same topic resumes, or starts
 * afresh once solved. An unfinished set from another level is never replaced
 * silently: `waiting` asks the student to start the topic or resume that set.
 */
export function routeChallengePractice(
  state: ChallengeSession,
  group: ChallengeGroupId,
  time: number,
): { state: ChallengeSession; waiting: boolean } {
  const reviewing = { ...state, reviewSet: null, reviewIndex: 0 };
  if (state.group === group && unfinishedChallengeSet(state))
    return { state: { ...reviewing, started: true }, waiting: false };
  if (state.group !== group && unfinishedChallengeSet(state))
    return { state: { ...reviewing, started: false }, waiting: true };
  return { state: startChallengeSet(state, time, group), waiting: false };
}

export function viewChallengeSet(state: ChallengeSession): ChallengeRun {
  const archived = state.archive.find(
    (run) => run.setNumber === state.reviewSet,
  );
  return archived ? { ...archived, index: state.reviewIndex } : state;
}

/** A set's earlier attempts share its seed, level and question order. */
function sameSet(a: ChallengeRun, b: ChallengeRun): boolean {
  return (
    a.group === b.group &&
    a.seed === b.seed &&
    a.seconds === b.seconds &&
    a.queue.length === b.queue.length &&
    a.queue.every((id, index) => b.queue[index] === id)
  );
}

/** Keep each question's latest replaced attempt; a changed variant marks an earlier retry. */
function mergeEarlierAttempt(
  earlier: ChallengeRun,
  state: ChallengeSession,
  retried: string,
): ChallengeRun {
  const variants: Record<string, number> = {};
  const drafts: Record<string, ChallengeDraft> = {};
  state.queue.forEach((id, index) => {
    const source =
      id !== retried &&
      challengeVariant(earlier, index) !== challengeVariant(state, index)
        ? earlier
        : state;
    variants[id] = challengeVariant(source, index);
    if (source.drafts[id]) drafts[id] = source.drafts[id];
  });
  return {
    ...earlier,
    index: state.index,
    drafts,
    variants,
    streak: state.streak,
  };
}

/**
 * Save the checked attempt, then practise the same reason with a new case.
 * Repeated retries in one set update a single saved entry, so they never push
 * genuine earlier sets out of the ten-set archive. That entry keeps the latest
 * replaced attempt for each retried question and the current state of the rest.
 */
export function similarChallengeQuestion(
  state: ChallengeSession,
  time: number,
): ChallengeSession {
  const id = state.queue[state.index];
  const draft = state.drafts[id];
  if (
    state.reviewSet !== null ||
    !state.started ||
    !draft?.checked ||
    draft.complete ||
    !Number.isFinite(time)
  )
    return state;
  const earlier = state.archive.at(-1);
  const { archive, setNumber } =
    earlier && sameSet(earlier, state)
      ? {
          archive: [
            ...state.archive.slice(0, -1),
            mergeEarlierAttempt(earlier, state, id),
          ],
          setNumber: state.setNumber,
        }
      : archiveChallengeRun(state);
  return {
    ...state,
    archive,
    setNumber,
    variants: {
      ...state.variants,
      [id]: (challengeVariant(state) + 1) % 2147483647,
    },
    drafts: {
      ...state.drafts,
      [id]: {
        ...newChallengeDraft(state.seconds, time),
        helped: true,
        bestScore: draft.bestScore,
      },
    },
    streak: 0,
  };
}

/** Time out the current question at its deadline; a checked answer keeps its feedback and retry choices. */
export function expireChallengeDraft(
  state: ChallengeSession,
  time: number,
): ChallengeSession {
  const id = state.queue[state.index],
    current = state.drafts[id];
  if (
    !current ||
    current.complete ||
    current.expired ||
    current.checked ||
    !current.deadline ||
    time < current.deadline
  )
    return state;
  return {
    ...state,
    streak: 0,
    drafts: { ...state.drafts, [id]: { ...current, expired: true } },
  };
}

/** Reopen the current question. A passed deadline gives a fresh timer and counts as helped. */
export function retryChallengeQuestion(
  state: ChallengeSession,
  reasonId: string,
  time: number,
  practice = false,
): ChallengeSession {
  if (state.reviewSet !== null || state.queue[state.index] !== reasonId)
    return state;
  const current = state.drafts[reasonId];
  if (!current || current.complete) return state;
  const timedOut =
    current.expired || (current.deadline !== null && time >= current.deadline);
  return {
    ...state,
    drafts: {
      ...state.drafts,
      [reasonId]: {
        ...current,
        checked: false,
        expired: false,
        helped: current.helped || practice || timedOut,
        deadline: practice
          ? null
          : timedOut && state.seconds
            ? time + state.seconds * 1000
            : current.deadline,
      },
    },
  };
}
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
    state.reviewSet !== null ||
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

  const challenge = getReasonChallenge(reasonId, challengeVariant(state));
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

function parseChallengeRun(raw: unknown): ChallengeSession | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const value = raw as Partial<ChallengeSession>;
  const group = challengeGroup(value.group);
  const seconds = [0, 60, 90, 120].includes(value.seconds!)
    ? value.seconds!
    : 0;
  const seed = count(value.seed, 2147483647) ? value.seed : 0;
  const best: ChallengeSession["best"] = {};
  if (value.best && typeof value.best === "object") {
    for (const g of savedChallengeGroups) {
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
  const variants: Record<string, number> = {};
  for (const id of queue) {
    if (count(value.variants?.[id], 2147483646))
      variants[id] = value.variants![id];
  }
  queue.forEach((id, index) => {
    const draft = value.drafts?.[id];
    if (!draft || typeof draft !== "object") return;
    const response = draft.response;
    const challenge = getReasonChallenge(
      id,
      variants[id] ?? (seed + index) % 3,
    );
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
    // A timed question waits unopened (no draft) until the student starts its timer.
    started:
      value.started === true &&
      queue.length > 0 &&
      (!!drafts[queue[index]] ||
        (seconds > 0 && Object.keys(drafts).length > 0)),
    drafts,
    variants,
    setNumber:
      count(value.setNumber, Number.MAX_SAFE_INTEGER) && value.setNumber > 0
        ? value.setNumber
        : 1,
    best,
    streak,
    bestStreak,
    archive: [],
    reviewSet: null,
    reviewIndex: 0,
  };
}

export function parseChallengeSession(
  raw: unknown,
): ChallengeSession | undefined {
  const state = parseChallengeRun(raw);
  if (!state) return;
  const value = raw as Partial<ChallengeSession>;
  if (Array.isArray(value.archive))
    for (const entry of value.archive.slice(-archiveLimit)) {
      const parsed = parseChallengeRun(entry);
      if (
        !parsed?.queue.length ||
        !Object.keys(parsed.drafts).length ||
        parsed.setNumber >= state.setNumber ||
        parsed.setNumber <= (state.archive.at(-1)?.setNumber ?? 0)
      )
        continue;
      const {
        group,
        seconds,
        seed,
        queue,
        index,
        drafts,
        variants,
        setNumber,
        streak,
      } = parsed;
      state.archive.push({
        group,
        seconds,
        seed,
        queue,
        index,
        drafts,
        variants,
        setNumber,
        streak,
      });
    }
  const reviewing = state.archive.find(
    (run) => run.setNumber === value.reviewSet,
  );
  if (reviewing) {
    state.reviewSet = reviewing.setNumber;
    state.reviewIndex = count(value.reviewIndex, reviewing.queue.length - 1)
      ? value.reviewIndex
      : 0;
  }
  return state;
}
