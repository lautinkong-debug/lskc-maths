import { starsFor } from "./session";
import type { Stage } from "./questions";

export const STORAGE_KEY = "lskc.polynomial-quest.v1";
export type Progress = {
  version: 1;
  stages: { stars: number; best: number }[];
};
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export type StoredProgress = { progress: Progress; available: boolean };
export const blankProgress = (): Progress => ({
  version: 1,
  stages: Array.from({ length: 4 }, () => ({ stars: 0, best: 0 })),
});
export function decodeProgress(raw: string | null): Progress {
  try {
    const p = JSON.parse(raw ?? "null");
    if (p?.version !== 1 || !Array.isArray(p.stages) || p.stages.length !== 4)
      return blankProgress();
    if (
      !p.stages.every(
        (s: { stars: number; best: number }) =>
          s &&
          Number.isInteger(s.stars) &&
          Number.isInteger(s.best) &&
          s.best >= 0 &&
          s.best <= 6 &&
          (s.stars === 0 ? s.best === 0 : s.stars === starsFor(s.best)),
      )
    )
      return blankProgress();
    return {
      version: 1,
      stages: p.stages.map((s: { stars: number; best: number }) => ({
        stars: s.stars,
        best: s.best,
      })),
    };
  } catch {
    return blankProgress();
  }
}
export function loadProgress(
  storage: Pick<Storage, "getItem">,
): StoredProgress {
  try {
    return {
      progress: decodeProgress(storage.getItem(STORAGE_KEY)),
      available: true,
    };
  } catch {
    return { progress: blankProgress(), available: false };
  }
}
export function recordResult(
  storage: StoragePort,
  current: Progress,
  stage: Stage,
  unaided: number,
): StoredProgress {
  const latest = loadProgress(storage);
  const progress: Progress = {
    version: 1,
    stages: current.stages.map((s, i) => ({
      stars: Math.max(s.stars, latest.progress.stages[i].stars),
      best: Math.max(s.best, latest.progress.stages[i].best),
    })),
  };
  progress.stages[stage] = {
    stars: Math.max(progress.stages[stage].stars, starsFor(unaided)),
    best: Math.max(progress.stages[stage].best, unaided),
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return { progress, available: latest.available };
  } catch {
    return { progress, available: false };
  }
}
