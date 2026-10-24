import { describe, expect, it } from "vitest";
import {
  applyMove,
  newMatch,
  questionFor,
  optionsFor,
  matchSummary,
  playerView,
  joinMatch,
} from "../../src/lib/polynomial-tug/game";
import { sameAnswer } from "../../src/apps/polynomials/quest/algebra";
import type { Match, Skill } from "../../src/lib/polynomial-tug/types";

function game(seats = [0, 1, 2, 3]) {
  const m = newMatch(37);
  for (const seat of seats) m.members[seat] = "student-" + seat;
  return m;
}
function solve(m: Match, seat: number) {
  const q = questionFor(m, seat);
  return applyMove(m, seat, {
    action: "answer",
    questionId: q.id,
    option: optionsFor(m, seat).findIndex((o) => sameAnswer(o, q.answer)),
  });
}
function next(m: Match, seat: number) {
  return applyMove(m, seat, {
    action: "next",
    questionId: questionFor(m, seat).id,
  });
}
function skill(m: Match, seat: number, id: Skill) {
  return applyMove(m, seat, {
    action: "skill",
    questionId: questionFor(m, seat).id,
    skill: id,
  });
}
function round(m: Match) {
  for (const seat of [0, 1, 2, 3]) m = solve(m, seat);
  for (const seat of [0, 1, 2, 3]) m = next(m, seat);
  return m;
}
function level(n: number) {
  let m = game();
  for (let i = 0; i < (n - 1) * 3; i++) m = round(m);
  return m;
}

describe("flexible groups and active skills", () => {
  it("one student can pull and continue without an empty partner", () => {
    const m = solve(game([0]), 0);
    expect(m.position).toBe(-1);
    expect(next(m, 0).pairs[0].round).toBe(1);
    expect(matchSummary(m).pairs[0].energy).toBe(1);
  });
  it("one against one and unequal teams count only active members", () => {
    let m = solve(game([0, 2]), 0);
    m = solve(m, 2);
    expect(m.position).toBe(0);
    expect(next(next(m, 0), 2).pairs.map((p) => p.round)).toEqual([1, 1]);
    const uneven = solve(solve(game([0, 2, 3]), 0), 2);
    expect(uneven.pairs[1].pulls).toBe(0);
    expect(solve(uneven, 3).position).toBe(0);
  });
  it("queues a new partner after play begins and activates them on the next round", () => {
    let m = solve(game([0, 2]), 0);
    m = joinMatch(m, "late", 0);
    expect(playerView(m, 1).phase).toBe("waiting");
    expect(() => solve(m, 1)).toThrow("waiting");
    m = next(m, 0);
    expect(playerView(m, 1).phase).toBe("answering");
    expect(solve(m, 0).pairs[0].pulls).toBe(1);
    expect(solve(solve(m, 0), 1).pairs[0].pulls).toBe(2);
  });
  it("a late join after a wrong attempt waits and never changes the answer requirement", () => {
    let m = game([0, 2]);
    const q = questionFor(m, 0);
    m = applyMove(m, 0, {
      action: "answer",
      questionId: q.id,
      option: optionsFor(m, 0).findIndex((o) => !sameAnswer(o, q.answer)),
    });
    m = joinMatch(m, "late", 0);
    expect(playerView(m, 1).phase).toBe("waiting");
    m = applyMove(m, 0, { action: "retry", questionId: q.id });
    expect(solve(m, 0).pairs[0].pulls).toBe(1);
  });
  it("joins an untouched round immediately and rejects full or finished matches", () => {
    const m = joinMatch(game([0, 2]), "late", 0);
    expect(playerView(m, 1).phase).toBe("answering");
    expect(solve(m, 0).pairs[0].pulls).toBe(0);
    expect(() => joinMatch(m, "overflow", 0)).toThrow("full");
    m.winner = 0;
    expect(() => joinMatch(m, "late2", 1)).toThrow("finished");
  });
  it("unlocks Power Pull at level two, spends once and adds two only to the next pull", () => {
    expect(() => skill(game(), 0, "boost")).toThrow("locked");
    let m = level(2);
    m = skill(m, 0, "boost");
    expect(m.pairs[0].energy).toBe(1);
    expect(skill(m, 1, "boost")).toBe(m);
    expect(() => skill(m, 1, "shield")).toThrow("skill-used");
    m = solve(solve(m, 0), 1);
    expect(m.position).toBe(-4);
    expect(m.pairs[0].lastPower).toBe(4);
    expect(m.pairs[0].energy).toBe(2);
    m = next(next(m, 0), 1);
    expect(solve(solve(m, 0), 1).position).toBe(-6);
  });
  it("Anchor Shield blocks two units once and cannot be stacked", () => {
    let m = level(3);
    m = skill(m, 0, "shield");
    m = solve(solve(m, 2), 3);
    expect(m.position).toBe(1);
    expect(m.pairs[1].lastBlocked).toBe(2);
    expect(m.pairs[0].shield).toBe(false);
    m = next(next(m, 2), 3);
    expect(solve(solve(m, 2), 3).position).toBe(4);
  });
  it("Team Surge doubles level-four power and energy never exceeds six", () => {
    let m = level(4);
    expect(m.pairs[0].energy).toBe(6);
    m = skill(m, 1, "surge");
    expect(m.pairs[0].energy).toBe(2);
    m = solve(solve(m, 0), 1);
    expect(m.position).toBe(-8);
    expect(m.pairs[0].lastPower).toBe(8);
  });
  it("legacy pairs default to no skills; insufficient energy and empty seats cannot act", () => {
    const m = level(2);
    delete m.pairs[0].energy;
    delete m.pairs[0].armed;
    delete m.pairs[0].shield;
    expect(matchSummary(m).pairs[0].energy).toBe(0);
    expect(() => skill(m, 0, "boost")).toThrow("energy");
    expect(() => solve(game([0]), 1)).toThrow("empty-seat");
  });
  it("a skill needs a current question, unfinished round and valid identity", () => {
    const m = level(3);
    expect(() =>
      applyMove(m, 0, { action: "skill", questionId: "old", skill: "shield" }),
    ).toThrow("stale-question");
    expect(() => skill(m, 0, "unknown" as Skill)).toThrow("invalid-skill");
    expect(() => skill(solve(solve(m, 0), 1), 0, "boost")).toThrow("not-ready");
  });
});
