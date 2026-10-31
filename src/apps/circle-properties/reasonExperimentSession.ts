import { labs, type LabId } from "./content";
import {
  initialReasonParameters,
  normaliseReasonParameters,
  type ReasonParameters,
} from "./reasonExploration";

export type ReasonExperimentSession = {
  selectedId: string;
  shapes: Record<
    string,
    { parameters: ReasonParameters; samples: ReasonParameters[] }
  >;
};

const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const finiteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const reasonIds = (labId: LabId) =>
  labs.find((lab) => lab.id === labId)!.reasonIds;

export function initialReasonExperiment(labId: LabId): ReasonExperimentSession {
  const ids = reasonIds(labId);
  return {
    selectedId: ids[0],
    shapes: Object.fromEntries(
      ids.map((id) => [
        id,
        { parameters: initialReasonParameters(id), samples: [] },
      ]),
    ),
  };
}

/** Read only supported finite controls, then restore the theorem's givens. */
function parseParameters(
  reasonId: string,
  raw: unknown,
): ReasonParameters | undefined {
  const value = record(raw);
  if (!value || !finiteNumber(value.primary) || !finiteNumber(value.secondary))
    return;
  const p: ReasonParameters = {
    ...initialReasonParameters(reasonId),
    primary: value.primary,
    secondary: value.secondary,
  };
  for (const key of ["rotation", "rotation2", "tertiary", "qPosition"] as const)
    if (finiteNumber(value[key])) p[key] = value[key];
  if (typeof value.alternate === "boolean") p.alternate = value.alternate;
  return normaliseReasonParameters(reasonId, p);
}

/** Reveal state deliberately stays out of storage: revisits start with the givens. */
export function parseReasonExperiment(
  labId: LabId,
  raw: unknown,
): ReasonExperimentSession | undefined {
  const value = record(raw);
  if (!value) return;
  const fallback = initialReasonExperiment(labId);
  const ids = reasonIds(labId);
  const savedShapes = record(value.shapes);
  const shapes = Object.fromEntries(
    ids.map((id) => {
      const saved = record(savedShapes?.[id]);
      const samples = Array.isArray(saved?.samples)
        ? saved.samples
            .map((sample) => parseParameters(id, sample))
            .filter(
              (sample): sample is ReasonParameters => sample !== undefined,
            )
            .slice(-3)
        : [];
      return [
        id,
        {
          parameters:
            parseParameters(id, saved?.parameters) ??
            fallback.shapes[id].parameters,
          samples,
        },
      ];
    }),
  );
  return {
    selectedId:
      typeof value.selectedId === "string" && ids.includes(value.selectedId)
        ? value.selectedId
        : fallback.selectedId,
    shapes,
  };
}
