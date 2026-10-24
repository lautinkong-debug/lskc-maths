import type { Room } from "./types";

export const TIME_TARGETS = [
  { fastMs: 20000, steadyMs: 40000 },
  { fastMs: 30000, steadyMs: 60000 },
  { fastMs: 40000, steadyMs: 80000 },
  { fastMs: 50000, steadyMs: 100000 },
] as const;

/** Pure server-clock calculation; client-supplied times never enter a Move. */
export function activeClock(
  room: Pick<Room, "status" | "pausedMs" | "pausedAt">,
  now: number,
) {
  const ongoing =
    room.status === "paused" && typeof room.pausedAt === "number"
      ? Math.max(0, now - room.pausedAt)
      : 0;
  return now - (room.pausedMs ?? 0) - ongoing;
}

export function speedBonus(
  level: number,
  elapsedMs: number | null,
  firstTry: boolean,
) {
  if (
    !firstTry ||
    elapsedMs === null ||
    !Number.isFinite(elapsedMs) ||
    elapsedMs < 0
  )
    return 0;
  const target = TIME_TARGETS[Math.max(0, Math.min(3, level - 1))];
  return elapsedMs <= target.fastMs ? 2 : elapsedMs <= target.steadyMs ? 1 : 0;
}
