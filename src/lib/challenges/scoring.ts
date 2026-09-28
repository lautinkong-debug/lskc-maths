import { copy } from "@/lib/copy";

const c=copy.apps.directedNumbers.playLesson;
export type Scoring = "directed" | "gentle";
export type Mark = "correct" | "wrong" | "skipped";
export type ScoreBreakdown = {
  correct: number;
  wrong: number;
  skipped: number;
  streakBonus: number;
  speedBonus: number;
  total: number;
  positiveEarned: number;
  terms: { label: string; amount: number }[];
};
export function scoreRun(marks: readonly Mark[], scoring: Scoring, elapsedSec: number | null): ScoreBreakdown {
  let correct = 0, wrong = 0, skipped = 0, streak = 0, streakBonus = 0;
  for (const mark of marks) {
    if (mark === "correct") { correct++; streak++; if (streak >= 3) streakBonus += 5; }
    else { streak = 0; if (mark === "wrong") wrong++; else skipped++; }
  }
  const par = marks.length * 15;
  const speedBonus = elapsedSec === null || par === 0 ? 0 : Math.floor(3 * correct * Math.max(0, Math.min(1, (par - elapsedSec) / par)));
  const penalty = scoring === "directed" ? -5 : 0;
  const total = correct * 10 + wrong * penalty + streakBonus + speedBonus;
  return {
    correct, wrong, skipped, streakBonus, speedBonus, total,
    positiveEarned: correct * 10 + streakBonus + speedBonus,
    terms: [
      { label: `${correct} × (+10)`, amount: correct * 10 },
      { label: `${wrong} × (${penalty ? "−5" : "0"})`, amount: wrong * penalty },
      { label: c.scoreStreak(signedScore(streakBonus)), amount: streakBonus },
      { label: c.scoreSpeed(signedScore(speedBonus)), amount: speedBonus },
    ],
  };
}
export function signedScore(value: number): string {
  return value < 0 ? `−${Math.abs(value)}` : value > 0 ? `+${value}` : "0";
}
