import { questLevels, type QuestLevel } from "./quest";

export type QuestGame = "unlock" | "build" | "detective";
export type QuestMode = "practice" | "speed";
export type QuestAttempt = {
  game: QuestGame;
  levelId: string;
  mode: QuestMode;
  deadline: number | null;
  stage: number;
  seed: number;
  clues: number[];
  order: string[];
  mistakes: number;
  hints: number;
  status: "playing" | "won" | "expired";
  feedback: string;
  score: number;
  stars: number;
};
export type QuestProgress = {
  game: QuestGame;
  mode: QuestMode;
  active: QuestAttempt | null;
  results: Record<string, { stars: number; score: number }>;
};
export const initialQuest: QuestProgress = {
  game: "unlock",
  mode: "practice",
  active: null,
  results: {},
};
export const questResultKey = (
  game: QuestGame,
  levelId: string,
  mode: QuestMode,
) => `${game}-${levelId}-${mode}`;
const gameValid = (value: unknown): value is QuestGame =>
  typeof value === "string" && ["unlock", "build", "detective"].includes(value);
const modeValid = (value: unknown): value is QuestMode =>
  value === "practice" || value === "speed";
const integer = (value: unknown, max: number) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= max;

export function parseQuest(raw: unknown): QuestProgress | undefined {
  if (!raw || typeof raw !== "object") return;
  const value = raw as Partial<QuestProgress>;
  const results: QuestProgress["results"] = {};
  if (value.results && typeof value.results === "object") {
    for (const game of ["unlock", "build", "detective"] as const)
      for (const level of questLevels)
        for (const mode of ["practice", "speed"] as const) {
          const key = questResultKey(game, level.id, mode);
          const result = value.results[key];
          if (result && integer(result.stars, 3) && integer(result.score, 1000))
            results[key] = { stars: result.stars, score: result.score };
        }
  }
  let active: QuestAttempt | null = null;
  const a = value.active;
  const level = questLevels.find((l) => l.id === a?.levelId);
  if (
    a &&
    level &&
    gameValid(a.game) &&
    modeValid(a.mode) &&
    integer(
      a.stage,
      a.game === "unlock" ? 2 : a.game === "detective" ? 1 : 0,
    ) &&
    integer(a.seed, 2147483647) &&
    Array.isArray(a.clues) &&
    new Set(a.clues).size === a.clues.length &&
    a.clues.every((id) => integer(id, level.givens.length - 1)) &&
    integer(a.mistakes, 999) &&
    integer(a.hints, 999) &&
    ["playing", "won", "expired"].includes(a.status) &&
    integer(a.stars, 3) &&
    integer(a.score, 1000) &&
    (a.mode === "practice"
      ? a.deadline === null
      : typeof a.deadline === "number" &&
        Number.isFinite(a.deadline) &&
        a.deadline > 0) &&
    Array.isArray(a.order) &&
    a.order.length <= level.proofSteps.length &&
    new Set(a.order).size === a.order.length &&
    a.order.every((id) => questProofCards(level).some((s) => s.id === id))
  ) {
    active = {
      ...a,
      feedback: typeof a.feedback === "string" ? a.feedback.slice(0, 800) : "",
    };
  }
  return {
    game: gameValid(value.game) ? value.game : "unlock",
    mode: modeValid(value.mode) ? value.mode : "practice",
    active,
    results,
  };
}
export const questSeconds = (level: number) =>
  level <= 6 ? 120 : level <= 12 ? 105 : 90;

export function questProofCards(level: QuestLevel) {
  return [
    ...level.proofSteps,
    {
      id: "decoy-condition",
      kind: "condition" as const,
      text: level.conditionChoices.find((c) => !c.correct)!.text,
    },
    {
      id: "decoy-conclusion",
      kind: "conclusion" as const,
      text: "∴ " + level.conclusionChoices.find((c) => !c.correct)!.text,
    },
  ];
}
