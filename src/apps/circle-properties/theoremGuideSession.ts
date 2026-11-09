import { circleTheoremLessonCopy } from "@/lib/copy";
import {
  initialReasonParameters,
  normaliseReasonParameters,
  reasonControls,
  type ReasonParameters,
} from "./reasonExploration";
import { parseReasonParameters } from "./reasonExperimentSession";
import { theoremLessons, type GuidedReasonId } from "./theoremLessonData";
import {
  getCaseFamily,
  getGuideCase,
  type GuideCaseKey,
} from "./theoremCaseBank";

export const guideSteps = circleTheoremLessonCopy.steps;
export type CaseAttempt = {
  id: GuideCaseKey;
  variant: number;
  selected: number | null;
  firstError: number | null;
};

const newAttempt = (id: GuideCaseKey, variant = 0): CaseAttempt => ({
  id,
  variant,
  selected: null,
  firstError: null,
});

export type GuideProgress = {
  stage: number;
  term: number;
  shape: ReasonParameters;
  firstLine?: ReasonParameters;
  secondChordShown?: boolean;
  intersectionPrediction?: number | null;
  exploredChords?: { first: ReasonParameters; second: ReasonParameters };
  prediction: number | null;
  history: CaseAttempt[];
  cursor: number;
  written: number | null;
  writtenReason: number | null;
  note: string;
};

export function startGuide(id: GuidedReasonId): GuideProgress {
  const shape = initialReasonParameters(id);
  if (id === "r4" || id === "r5" || /^r1[0-7]$/.test(id)) shape.rotation2 = 33;
  const family = getCaseFamily(id);
  return {
    stage: 0,
    term: 0,
    shape,
    ...(id === "r3" && {
      secondChordShown: false,
      intersectionPrediction: null,
    }),
    prediction: null,
    history: [newAttempt(family[Math.floor(Math.random() * family.length)])],
    cursor: 0,
    written: null,
    writtenReason: null,
    note: "",
  };
}

const indexIn = (value: unknown, count: number) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value < count;
const choice = (value: unknown) =>
  indexIn(value, 3) ? (value as number) : null;

function restoreAttempts(
  id: GuidedReasonId,
  saved: Partial<GuideProgress> & {
    caseId?: GuideCaseKey;
    answers?: Partial<Record<GuideCaseKey, unknown>>;
  },
  fresh: GuideProgress,
) {
  const family = getCaseFamily(id);
  if (Array.isArray(saved.history)) {
    const history: CaseAttempt[] = [];
    let cursor = 0;
    for (const [index, row] of saved.history.entries()) {
      if (
        !row ||
        !family.includes(row.id) ||
        !Number.isSafeInteger(row.variant) ||
        row.variant < 0
      )
        continue;
      const item = getGuideCase(row.id, row.variant);
      const selected = indexIn(row.selected, item.options.length)
        ? row.selected
        : null;
      const firstError =
        indexIn(row.firstError, item.options.length) &&
        row.firstError !== item.answer
          ? row.firstError
          : selected !== item.answer
            ? selected
            : null;
      if (index <= (saved.cursor ?? 0)) cursor = history.length;
      history.push({ id: row.id, variant: row.variant, selected, firstError });
    }
    if (history.length) return { history, cursor };
  }
  // Older previews saved one answer per theorem rather than individual attempts.
  const current =
    family.find((key) => key === saved.caseId) ?? fresh.history[0].id;
  const history: CaseAttempt[] = [];
  for (const key of [...family.filter((key) => key !== current), current]) {
    const selected = choice(saved.answers?.[key]);
    if (selected === null && key !== current) continue;
    history.push({
      ...newAttempt(key),
      selected,
      firstError: selected !== getGuideCase(key, 0).answer ? selected : null,
    });
  }
  return { history, cursor: history.length - 1 };
}

export function answerGuideCase(
  progress: GuideProgress,
  selected: number,
): GuideProgress {
  const attempt = progress.history[progress.cursor];
  const item = getGuideCase(attempt.id, attempt.variant);
  if (
    attempt.selected === item.answer ||
    !indexIn(selected, item.options.length)
  )
    return progress;
  const next = {
    ...attempt,
    selected,
    firstError:
      attempt.firstError ?? (selected === item.answer ? null : selected),
  };
  return {
    ...progress,
    history: progress.history.map((entry, index) =>
      index === progress.cursor ? next : entry,
    ),
  };
}

export function advanceGuideCase(
  id: GuidedReasonId,
  progress: GuideProgress,
  similar = false,
): GuideProgress {
  const { history, cursor } = progress;
  if (!similar && cursor < history.length - 1)
    return { ...progress, cursor: cursor + 1 };
  const family = getCaseFamily(id);
  const current = history[cursor];
  const key = similar
    ? current.id
    : family[(family.indexOf(current.id) + 1) % family.length];
  const variant = history.reduce(
    (next, row) => (row.id === key ? Math.max(next, row.variant + 1) : next),
    0,
  );
  return {
    ...progress,
    cursor: cursor + 1,
    history: [
      ...history.slice(0, cursor + 1),
      newAttempt(key, variant),
      ...history.slice(cursor + 1),
    ],
  };
}

export function restoreGuide(
  id: GuidedReasonId,
  raw: unknown,
): GuideProgress | undefined {
  if (!raw || typeof raw !== "object") return;
  const saved = raw as Partial<GuideProgress>;
  const fresh = startGuide(id);
  const first =
    id === "r3" && parseReasonParameters(id, saved.exploredChords?.first);
  const second =
    id === "r3" && parseReasonParameters(id, saved.exploredChords?.second);
  return {
    stage: indexIn(saved.stage, guideSteps.length) ? saved.stage! : 0,
    term: indexIn(saved.term, theoremLessons[id].terms.length)
      ? saved.term!
      : 0,
    shape: parseReasonParameters(id, saved.shape) ?? fresh.shape,
    firstLine:
      id === "r3" ? parseReasonParameters(id, saved.firstLine) : undefined,
    ...(id === "r3" && {
      secondChordShown: saved.secondChordShown === true,
      intersectionPrediction: choice(saved.intersectionPrediction),
      ...(first && second && { exploredChords: { first, second } }),
    }),
    prediction: choice(saved.prediction),
    written: choice(saved.written),
    ...restoreAttempts(id, saved, fresh),
    writtenReason: choice(saved.writtenReason),
    note: typeof saved.note === "string" ? saved.note.slice(0, 1200) : "",
  };
}

/** A tap changes the shape for pupils who cannot drag a small point reliably. */
export function anotherGuideShape(
  id: GuidedReasonId,
  current: ReasonParameters,
) {
  const next = { ...current, rotation: ((current.rotation ?? 0) + 37) % 360 };
  const control = reasonControls(id).find(
    ({ key }) => key === "primary" || key === "secondary",
  )!;
  const width = control.max - control.min;
  const fraction =
    (current[control.key]! - control.min) / width >= 0.6 ? 0.33 : 0.74;
  next[control.key] =
    Math.round((control.min + width * fraction) / control.step) * control.step;
  if (id === "r6") {
    // AB bounds a small arc of 120°. Putting P on it exposes the reflex 240° turn.
    const currentSweep = current.alternate
      ? 360 - current.primary
      : current.primary;
    next.primary = 120;
    next.alternate = currentSweep <= 180;
  }
  return normaliseReasonParameters(id, next);
}
