import { describe, expect, it } from "vitest";
import { questLevels } from "./quest";
import {
  initialQuest,
  parseQuest,
  questProofCards,
  questResultKey,
  questSeconds,
  type QuestAttempt,
} from "./questSession";

const round = (changes: Partial<QuestAttempt> = {}): QuestAttempt => ({
  game: "unlock",
  levelId: "r1",
  mode: "practice",
  deadline: null,
  stage: 0,
  seed: 1234,
  clues: [0],
  order: [],
  mistakes: 1,
  hints: 0,
  status: "playing",
  feedback: "Check the given information.",
  score: 0,
  stars: 0,
  ...changes,
});

describe("quest progress restoration", () => {
  it("starts safely from old empty saves and rejects missing payloads", () => {
    expect(parseQuest(undefined)).toBeUndefined();
    expect(parseQuest(null)).toBeUndefined();
    expect(parseQuest("not saved progress")).toBeUndefined();
    expect(parseQuest({})).toEqual(initialQuest);
  });

  it("does not coerce corrupt selectors into valid game IDs", () => {
    expect(parseQuest({ game: ["unlock"], mode: ["speed"] })).toMatchObject({
      game: "unlock",
      mode: "practice",
      active: null,
    });
    expect(
      parseQuest({ active: { ...round(), game: ["unlock"] } })?.active,
    ).toBeNull();
  });

  it("restores partial clues, mistakes, hints and answer order after refresh", () => {
    const active = round({
      game: "build",
      order: ["given", "decoy-condition"],
      hints: 1,
    });
    const restored = parseQuest({ game: "build", mode: "practice", active });
    expect(restored?.active).toEqual(active);
  });

  it("preserves an absolute speed deadline rather than restarting the clock", () => {
    const active = round({ mode: "speed", deadline: 1793460000123 });
    const restored = parseQuest({ mode: "speed", active });
    expect(restored?.active?.deadline).toBe(1793460000123);
    // Expiration is checked against the current clock by the game, including on finish.
    expect(
      parseQuest({ active: round({ mode: "speed", deadline: 1 }) })?.active
        ?.deadline,
    ).toBe(1);
  });

  it.each([
    { levelId: "r18" },
    { game: "other" },
    { mode: "other" },
    { stage: -1 },
    { stage: 0.5 },
    { stage: 3 },
    { game: "detective", stage: 2 },
    { game: "build", stage: 1 },
    { seed: -1 },
    { seed: Infinity },
    { clues: [0, 0] },
    { clues: [99] },
    { clues: ["0"] },
    { clues: {} },
    { mistakes: -1 },
    { hints: NaN },
    { score: 1001 },
    { stars: 4 },
    { status: "finished" },
    { mode: "practice", deadline: 1234 },
    { mode: "speed", deadline: null },
    { mode: "speed", deadline: Infinity },
    { mode: "speed", deadline: 0 },
    { order: ["given", "given"] },
    { order: ["unknown"] },
    { order: ["given", "condition", "conclusion", "decoy-condition"] },
  ])(
    "discards malformed active attempt %j without losing valid scores",
    (changes) => {
      const result = { stars: 2, score: 200 };
      const saved = parseQuest({
        active: { ...round(), ...changes },
        results: { "unlock-r1-practice": result },
      });
      expect(saved?.active).toBeNull();
      expect(saved?.results["unlock-r1-practice"]).toEqual(result);
    },
  );

  it("truncates feedback and filters unknown or malformed score entries", () => {
    const saved = parseQuest({
      active: round({ feedback: "x".repeat(1000) }),
      results: {
        "unlock-r1-practice": { stars: 3, score: 300 },
        "unlock-r1-speed": { stars: 2, score: 200 },
        "build-r2-practice": { stars: 4, score: 200 },
        "detective-r3-speed": { stars: 3, score: Infinity },
        "unlock-r18-speed": { stars: 3, score: 300 },
        arbitrary: { stars: 3, score: 300 },
      },
    });
    expect(saved?.active?.feedback).toHaveLength(800);
    expect(saved?.results).toEqual({
      "unlock-r1-practice": { stars: 3, score: 300 },
      "unlock-r1-speed": { stars: 2, score: 200 },
    });
  });

  it("restores completed and expired rounds without making them playable again", () => {
    for (const status of ["won", "expired"] as const) {
      const active = round({ mode: "speed", deadline: 1793460000123, status });
      expect(parseQuest({ active })?.active?.status).toBe(status);
    }
  });
});

describe("quest difficulty and independent records", () => {
  it("gives every reason positive time and reduces the budget by trail", () => {
    const seconds = questLevels.map((level) => questSeconds(level.level));
    expect(seconds).toEqual([
      ...Array(6).fill(120),
      ...Array(6).fill(105),
      ...Array(5).fill(90),
    ]);
    expect(seconds.every((value) => Number.isFinite(value) && value > 0)).toBe(
      true,
    );
  });

  it("keeps all 102 game, level and mode records distinct", () => {
    const keys = [];
    for (const game of ["unlock", "build", "detective"] as const)
      for (const level of questLevels)
        for (const mode of ["practice", "speed"] as const)
          keys.push(questResultKey(game, level.id, mode));
    expect(keys).toHaveLength(102);
    expect(new Set(keys).size).toBe(102);
  });

  it("includes removable decoys without duplicating a correct proof tile", () => {
    for (const level of questLevels) {
      const cards = questProofCards(level);
      expect(cards).toHaveLength(5);
      expect(new Set(cards.map((card) => card.id)).size).toBe(5);
      expect(cards.filter((card) => !card.id.startsWith("decoy-"))).toEqual(
        level.proofSteps,
      );
      expect(
        cards
          .filter((card) => card.id.startsWith("decoy-"))
          .every(
            (decoy) =>
              !level.proofSteps.some((step) => step.text === decoy.text),
          ),
      ).toBe(true);
    }
  });
});
