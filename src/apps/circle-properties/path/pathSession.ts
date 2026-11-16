import { labs, reasons, type LabId } from "../content";
import { stepIds, type SkillId, type Station, type StepId } from "./types";

export type CheckRecord = {
  /** Best mark out of the number of questions. */
  best: number;
  tries: number;
  /** The seed of the current paper, so a reload shows the same questions. */
  seed: number;
};
export type ReasonRecord = {
  right: number;
  wrong: number;
  /** How often each other reason was chosen in place of this one. */
  mixed: Record<string, number>;
};
export type TestAttempt = {
  at: number;
  seed: number;
  total: number;
  mark: number;
  /** Marks and totals for each family, in the order fold, double, spin. */
  families: [number, number][];
  /** Reason ids answered wrongly at least once in this attempt. */
  missed: string[];
  slips: SkillId[];
};
export type PathView = "home" | "station" | "map" | "test";
export type PathState = {
  v: 1;
  view: PathView;
  station: LabId;
  step: StepId;
  /** Position inside each step, keyed `station.step`. */
  index: Record<string, number>;
  /** Finished activities, keyed `station.step.activity`. */
  done: Record<string, true>;
  /** Predictions, keyed like `done`, so a later screen can show them again. */
  guesses: Record<string, number>;
  checks: Partial<Record<LabId, CheckRecord>>;
  reasons: Record<string, ReasonRecord>;
  slips: Partial<Record<SkillId, number>>;
  tests: TestAttempt[];
};

const labIds = labs.map((lab) => lab.id);
const reasonIds = reasons.map((reason) => reason.id);

export const initialPath = (): PathState => ({
  v: 1,
  view: "home",
  station: "bisector",
  step: "wonder",
  index: {},
  done: {},
  guesses: {},
  checks: {},
  reasons: {},
  slips: {},
  tests: [],
});

export const activityKey = (station: LabId, step: StepId, id: string) =>
  `${station}.${step}.${id}`;

const count = (value: unknown, max = 100000) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(0, Math.floor(value)))
    : 0;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Keep only what this version understands; a damaged save never blocks a lesson. */
export function parsePath(raw: unknown): PathState | undefined {
  if (!isRecord(raw) || raw.v !== 1) return;
  const state = initialPath();
  if (["home", "station", "map", "test"].includes(raw.view as string))
    state.view = raw.view as PathView;
  if (labIds.includes(raw.station as LabId))
    state.station = raw.station as LabId;
  if (stepIds.includes(raw.step as StepId)) state.step = raw.step as StepId;
  if (isRecord(raw.index))
    for (const [key, value] of Object.entries(raw.index).slice(0, 200))
      state.index[key] = count(value, 99);
  if (isRecord(raw.done))
    for (const [key, value] of Object.entries(raw.done).slice(0, 2000))
      if (value === true) state.done[key] = true;
  if (isRecord(raw.guesses))
    for (const [key, value] of Object.entries(raw.guesses).slice(0, 200))
      state.guesses[key] = count(value, 9);
  if (isRecord(raw.checks))
    for (const id of labIds) {
      const record = raw.checks[id];
      if (isRecord(record))
        state.checks[id] = {
          best: count(record.best, 20),
          tries: count(record.tries),
          seed: count(record.seed, 2 ** 31),
        };
    }
  if (isRecord(raw.reasons))
    for (const id of reasonIds) {
      const record = raw.reasons[id];
      if (!isRecord(record)) continue;
      const mixed: Record<string, number> = {};
      if (isRecord(record.mixed))
        for (const other of reasonIds)
          if (record.mixed[other]) mixed[other] = count(record.mixed[other]);
      state.reasons[id] = {
        right: count(record.right),
        wrong: count(record.wrong),
        mixed,
      };
    }
  if (isRecord(raw.slips))
    for (const [key, value] of Object.entries(raw.slips).slice(0, 40))
      state.slips[key as SkillId] = count(value);
  if (Array.isArray(raw.tests))
    state.tests = raw.tests
      .filter(isRecord)
      .slice(-5)
      .map((test) => ({
        at: count(test.at, 8.64e15),
        seed: count(test.seed, 2 ** 31),
        total: count(test.total, 100),
        mark: count(test.mark, 100),
        families: (Array.isArray(test.families) ? test.families : [])
          .slice(0, 3)
          .map((pair): [number, number] =>
            Array.isArray(pair)
              ? [count(pair[0], 100), count(pair[1], 100)]
              : [0, 0],
          ),
        missed: (Array.isArray(test.missed) ? test.missed : []).filter(
          (id): id is string => reasonIds.includes(id as string),
        ),
        slips: (Array.isArray(test.slips) ? test.slips : []).filter(
          (id): id is SkillId => typeof id === "string",
        ),
      }));
  return state;
}

/** How many activities of a lesson step are finished. */
export function stepProgress(state: PathState, station: Station, step: StepId) {
  if (step === "check") {
    const best = state.checks[station.id]?.best ?? 0;
    return { done: best >= CHECK_PASS ? 1 : 0, total: 1 };
  }
  const activities = station.steps[step];
  return {
    done: activities.filter(
      (activity) => state.done[activityKey(station.id, step, activity.id)],
    ).length,
    total: activities.length,
  };
}
export const stepDone = (state: PathState, station: Station, step: StepId) => {
  const progress = stepProgress(state, station, step);
  return progress.done >= progress.total;
};

export const CHECK_SIZE = 5;
export const CHECK_PASS = 4;

/** One star for the lesson, one for passing Check, one for a perfect Check. */
export function stationStars(
  state: PathState,
  station: Station,
): 0 | 1 | 2 | 3 {
  const learnt = stepIds
    .filter((step) => step !== "check")
    .every((step) => stepDone(state, station, step));
  const best = state.checks[station.id]?.best ?? 0;
  return ((learnt ? 1 : 0) +
    (best >= CHECK_PASS ? 1 : 0) +
    (best >= CHECK_SIZE ? 1 : 0)) as 0 | 1 | 2 | 3;
}

/** The first unfinished step, or Check when everything is done. */
export function nextStep(state: PathState, station: Station): StepId {
  return stepIds.find((step) => !stepDone(state, station, step)) ?? "check";
}

export type Mastery = "new" | "revise" | "nearly" | "secure";
/** Secure needs three right answers and at least four in five right. */
export function reasonMastery(record: ReasonRecord | undefined): Mastery {
  if (!record || record.right + record.wrong === 0) return "new";
  const total = record.right + record.wrong;
  if (record.right >= 3 && record.right / total >= 0.8) return "secure";
  if (record.right / total >= 0.5) return "nearly";
  return "revise";
}

/** Record one marked answer about a reason, and what it was confused with. */
export function recordAnswer(
  state: PathState,
  ids: readonly string[],
  right: boolean,
  chosenReason?: string,
  slip?: SkillId,
): PathState {
  const next = { ...state, reasons: { ...state.reasons } };
  for (const id of ids) {
    const record = next.reasons[id] ?? { right: 0, wrong: 0, mixed: {} };
    next.reasons[id] = {
      right: record.right + (right ? 1 : 0),
      wrong: record.wrong + (right ? 0 : 1),
      mixed:
        !right && chosenReason && chosenReason !== id
          ? {
              ...record.mixed,
              [chosenReason]: (record.mixed[chosenReason] ?? 0) + 1,
            }
          : record.mixed,
    };
  }
  if (!right && slip)
    next.slips = { ...state.slips, [slip]: (state.slips[slip] ?? 0) + 1 };
  return next;
}
