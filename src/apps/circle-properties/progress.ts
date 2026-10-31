import { reasons } from "./content";
import { allMissions } from "./missions";

export type NewProgress = { version: 2; missions: string[]; reasons: string[] };
export type Progress = NewProgress;
export const storageKey = "lskc-circle-lab-v2";
export const legacyStorageKey = "lskc-circle-lab-v1";
export const emptyProgress = (): Progress => ({
  version: 2,
  missions: [],
  reasons: [],
});

function knownIds(value: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  const provided = new Set(
    value.filter((id): id is string => typeof id === "string"),
  );
  return allowed.filter((id) => provided.has(id));
}

/** Old notebook/trap completion never becomes a new geometry-task star. */
export function parseLegacy(raw: string | null): Progress {
  const result = emptyProgress();
  if (!raw) return result;
  try {
    const value = JSON.parse(raw);
    if (value?.version === 1)
      result.reasons = knownIds(
        value.reasons,
        reasons.map((reason) => reason.id),
      );
  } catch {
    /* Optional browser data cannot block the playground. */
  }
  return result;
}

/** Restore only supported identifiers, with a bounded, canonical output. */
export function parseProgress(
  raw: string | null,
  legacyRaw?: string | null,
): Progress {
  if (raw === null) return parseLegacy(legacyRaw ?? null);
  const result = emptyProgress();
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 2) return result;
    result.missions = knownIds(
      value.missions,
      allMissions.map((mission) => mission.id),
    );
    result.reasons = knownIds(
      value.reasons,
      reasons.map((reason) => reason.id),
    );
  } catch {
    /* Optional browser data cannot block the playground. */
  }
  return result;
}
