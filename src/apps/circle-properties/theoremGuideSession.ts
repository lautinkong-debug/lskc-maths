import { circleTheoremLessonCopy } from "@/lib/copy";
import {
  initialReasonParameters,
  normaliseReasonParameters,
  reasonControls,
  type ReasonParameters,
} from "./reasonExploration";
import { parseReasonParameters } from "./reasonExperimentSession";
import { theoremLessons, type GuidedReasonId } from "./theoremLessonData";

export const guideSteps = circleTheoremLessonCopy.steps;
export type CaseId = GuidedReasonId | "r1" | "r2";
const families: CaseId[][] = [
  ["r1", "r2", "r3"],
  ["r4", "r5"],
  ["r6", "r7", "r8", "r9"],
  ["r10", "r11", "r12", "r13", "r14", "r15"],
  ["r16", "r17"],
];
export function relatedCases(id: GuidedReasonId) {
  return families.find((family) => family.includes(id))!;
}

export type GuideProgress = {
  stage: number;
  term: number;
  shape: ReasonParameters;
  firstLine?: ReasonParameters;
  prediction: number | null;
  caseId: CaseId;
  answers: Partial<Record<CaseId, number>>;
  written: number | null;
  note: string;
};

export function startGuide(id: GuidedReasonId): GuideProgress {
  const shape = initialReasonParameters(id);
  if (id === "r4" || id === "r5" || /^r1[0-7]$/.test(id)) shape.rotation2 = 33;
  const family = relatedCases(id);
  return {
    stage: 0,
    term: 0,
    shape,
    prediction: null,
    caseId: family[Math.floor(Math.random() * family.length)],
    answers: {},
    written: null,
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

export function restoreGuide(
  id: GuidedReasonId,
  raw: unknown,
): GuideProgress | undefined {
  if (!raw || typeof raw !== "object") return;
  const saved = raw as Partial<GuideProgress>;
  const fresh = startGuide(id);
  const family = relatedCases(id);
  const answers: GuideProgress["answers"] = {};
  for (const candidate of family) {
    const answer = choice(saved.answers?.[candidate]);
    if (answer !== null) answers[candidate] = answer;
  }
  return {
    stage: indexIn(saved.stage, guideSteps.length) ? saved.stage! : 0,
    term: indexIn(saved.term, theoremLessons[id].terms.length)
      ? saved.term!
      : 0,
    shape: parseReasonParameters(id, saved.shape) ?? fresh.shape,
    firstLine:
      id === "r3" ? parseReasonParameters(id, saved.firstLine) : undefined,
    prediction: choice(saved.prediction),
    written: choice(saved.written),
    caseId:
      saved.caseId && family.includes(saved.caseId)
        ? saved.caseId
        : fresh.caseId,
    answers,
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
  if (id === "r6") next.alternate = !current.alternate;
  return normaliseReasonParameters(id, next);
}
