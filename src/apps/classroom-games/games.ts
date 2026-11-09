import type { GameQuestion } from "./questions";

export const games = {
  ink: { path: "classroom-games/inkwave/v3.0.0-prod-eff222e6", count: 9 },
  tug: { path: "classroom-games/tug-of-war/v1.0.0", count: 80 },
  race: {
    path: "classroom-games/knowledge-kart/v1.2.9-prod-0ac4aa85",
    count: 40,
  },
  archery: { path: "games/archery/v1.1.3", count: 20 },
  spacecraft: { path: "games/spacecraft/v1.1.4", count: 80 },
  tank: { path: "games/tank/v1.1.5", count: 80 },
} as const;

export type GameId = keyof typeof games;
export type EmbeddedGame = Exclude<GameId, "ink">;
export const gameIds = Object.keys(games) as GameId[];
export const gameOrigin = "https://cdn.studybot.cc";
export const teacherUrl = "https://studybot.relearn.chat/tools/classroom-games";

export function gameUrl(id: GameId, parentOrigin?: string) {
  const url = new URL(games[id].path + "/index.html", gameOrigin);
  url.searchParams.set("lang", "en");
  if (id === "ink") url.searchParams.set("mode", "assault");
  if (parentOrigin) url.hash = new URLSearchParams({ parentOrigin }).toString();
  return url.href;
}

export type GameSetup = {
  type: "INIT_QUESTIONS";
  questions: GameQuestion[];
  language: "en";
  answerTimeSeconds?: number | null;
  teams?: { name: string; color: string }[];
  winCondition?: { type: "rope_threshold"; value: number };
};

// Spacecraft draws some text on a canvas and interpolates the same strings
// into an HTML scorecard. A zero-width space keeps '<' visible as plain text
// in both contexts, including expressions such as 2<x<5.
export function spacecraftText(row: GameQuestion): GameQuestion {
  const literal = (value: string) => value.replaceAll("<", "<\u200b");
  return {
    ...row,
    question: literal(row.question),
    options: row.options.map(literal),
    explanation: row.explanation && literal(row.explanation),
  };
}
