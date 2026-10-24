import { describe, expect, it } from "vitest";
import {
  activeClock,
  speedBonus,
  TIME_TARGETS,
} from "../../src/lib/polynomial-tug/timing";
import {
  applyMove,
  joinMatch,
  newMatch,
  optionsFor,
  questionFor,
  startMatchClocks,
  matchSummary,
} from "../../src/lib/polynomial-tug/game";
import { sameAnswer } from "../../src/apps/polynomials/quest/algebra";
import type { Match, Move } from "../../src/lib/polynomial-tug/types";
const start = 100000;
function ready(level = 1, seats = [0, 1, 2, 3]) {
  const match = newMatch(123, "timed-test-secret");
  for (const seat of seats) match.members[seat] = "p" + seat;
  for (const p of match.pairs) {
    p.round = (level - 1) * 3;
    p.pulls = p.round;
    p.energy = 6;
  }
  return startMatchClocks(match, start);
}
function answer(m: Match, seat: number, now: number, wrong = false) {
  const q = questionFor(m, seat);
  const option = optionsFor(m, seat).findIndex(
    (o) => sameAnswer(o, q.answer) !== wrong,
  );
  return applyMove(
    m,
    seat,
    { action: "answer", questionId: q.id, option },
    now,
  );
}
function next(m: Match, seat: number, now: number) {
  return applyMove(
    m,
    seat,
    { action: "next", questionId: questionFor(m, seat).id },
    now,
  );
}
describe("difficulty and server-timed pulling force", () => {
  it("allows more working time at harder levels and uses exact inclusive boundaries", () => {
    expect(TIME_TARGETS.map((t) => [t.fastMs, t.steadyMs])).toEqual([
      [20000, 40000],
      [30000, 60000],
      [40000, 80000],
      [50000, 100000],
    ]);
    for (let level = 1; level <= 4; level++) {
      const t = TIME_TARGETS[level - 1];
      expect(speedBonus(level, t.fastMs, true)).toBe(2);
      expect(speedBonus(level, t.fastMs + 1, true)).toBe(1);
      expect(speedBonus(level, t.steadyMs, true)).toBe(1);
      expect(speedBonus(level, t.steadyMs + 1, true)).toBe(0);
      expect(speedBonus(level, 1, false)).toBe(0);
      expect(speedBonus(level, null, true)).toBe(0);
    }
  });
  it("uses the slower active partner's completion and awards the pull only once", () => {
    let m = answer(ready(), 0, start + 5000);
    expect(m.position).toBe(0);
    m = answer(m, 1, start + 30000);
    expect(m.pairs[0]).toMatchObject({
      lastBasePower: 1,
      lastSpeedBonus: 1,
      lastElapsedMs: 30000,
      lastPower: 2,
    });
    expect(m.position).toBe(-2);
    expect(answer(m, 1, start + 50000)).toBe(m);
  });
  it("adds speed to difficulty, then applies offensive skills and the opposing shield", () => {
    let m = ready(4);
    m = applyMove(
      m,
      0,
      { action: "skill", skill: "surge", questionId: questionFor(m, 0).id },
      start + 1000,
    );
    m = applyMove(
      m,
      2,
      { action: "skill", skill: "shield", questionId: questionFor(m, 2).id },
      start + 1000,
    );
    m = answer(answer(m, 0, start + 3000), 1, start + 4000);
    expect(m.pairs[0]).toMatchObject({
      lastBasePower: 4,
      lastSpeedBonus: 2,
      lastSkillBonus: 6,
      lastBlocked: 2,
      lastPower: 10,
    });
    expect(m.position).toBe(-10);
    expect(m.pairs[1].shield).toBe(false);
  });
  it("a wrong attempt removes the speed bonus even after a fast retry", () => {
    let m = answer(ready(), 0, start + 1000, true);
    m = applyMove(
      m,
      0,
      { action: "retry", questionId: questionFor(m, 0).id },
      start + 2000,
    );
    m = answer(answer(m, 0, start + 3000), 1, start + 4000);
    expect(m.pairs[0]).toMatchObject({
      lastBasePower: 1,
      lastSpeedBonus: 0,
      lastElapsedMs: 4000,
      lastPower: 1,
    });
  });
  it("pauses the authoritative room clock without resetting earned thinking time", () => {
    expect(
      activeClock({ status: "live", pausedMs: 5000, pausedAt: null }, start),
    ).toBe(start - 5000);
    expect(
      activeClock(
        { status: "paused", pausedMs: 5000, pausedAt: start },
        start + 60000,
      ),
    ).toBe(start - 5000);
    expect(
      activeClock(
        { status: "live", pausedMs: 65000, pausedAt: null },
        start + 65000,
      ),
    ).toBe(start);
  });
  it("starts the next round only when all active partners are ready", () => {
    let m = answer(answer(ready(), 0, start + 5000), 1, start + 6000);
    m = next(m, 0, start + 9000);
    expect(m.pairs[0].startedAt).toBe(start);
    m = next(m, 1, start + 20000);
    expect(m.pairs[0].startedAt).toBe(start + 20000);
    expect(matchSummary(m, start + 23000).pairs[0].elapsedMs).toBe(3000);
    expect(m.pairs[0].lastBlocked).toBe(0);
  });
  it("queues arrivals into a timed round and starts an empty pair's own clock on arrival", () => {
    let m = ready(1, [0]);
    m = joinMatch(m, "partner", 0, start + 10000);
    expect(m.pupils[1].phase).toBe("waiting");
    expect(m.pairs[0].startedAt).toBe(start);
    m = joinMatch(m, "opponent", 1, start + 30000);
    expect(m.pairs[1].startedAt).toBe(start + 30000);
    expect(answer(m, 2, start + 35000).pairs[1].lastSpeedBonus).toBe(2);
  });
  it("ignores submitted timing claims and keeps old rooms playable", () => {
    let m = ready(1, [0]);
    const q = questionFor(m, 0),
      option = optionsFor(m, 0).findIndex((o) => sameAnswer(o, q.answer));
    const forged = {
      action: "answer",
      questionId: q.id,
      option,
      elapsedMs: 0,
      speedBonus: 999,
    } as Move;
    m = applyMove(m, 0, forged, start + 60000);
    expect(m.pairs[0].lastPower).toBe(1);
    const old = newMatch(1);
    delete old.goal;
    old.members[0] = "legacy";
    delete old.pairs[0].startedAt;
    expect(answer(old, 0, start).pairs[0].lastSpeedBonus).toBe(0);
    expect(matchSummary(old).goal).toBe(24);
    expect(newMatch(1).goal).toBe(48);
  });
});

describe("legacy timing compatibility", () => {
  function legacy() {
    const match = newMatch(123, "legacy-test-secret");
    delete match.goal;
    for (const pair of match.pairs) {
      delete pair.startedAt;
      delete pair.lastElapsedMs;
      delete pair.lastBasePower;
      delete pair.lastSpeedBonus;
      delete pair.lastSkillBonus;
    }
    return match;
  }
  it("keeps old lobby starts and empty-side live arrivals untimed", () => {
    const lobby = legacy();
    lobby.members[0] = "old-pupil";
    const started = startMatchClocks(lobby, start);
    expect(started).toBe(lobby);
    expect(answer(started, 0, start + 1000).pairs[0].lastSpeedBonus).toBe(0);
    const joined = joinMatch(lobby, "late-opponent", 1, start + 2000);
    expect(joined.pairs[1].startedAt).toBeUndefined();
    expect(answer(joined, 2, start + 3000).pairs[1].lastSpeedBonus).toBe(0);
    expect(matchSummary(joined).goal).toBe(24);
  });
  it("reconstructs old resolved difficulty and skills without counting a shield twice", () => {
    for (const [pulls, power, blocked, base, skill] of [
      [7, 1, 2, 3, 0],
      [4, 4, 0, 2, 2],
      [10, 6, 2, 4, 4],
      [3, 1, 0, 1, 0],
    ]) {
      const match = legacy();
      Object.assign(match.pairs[0], {
        pulls,
        round: pulls - 1,
        resolved: true,
        lastPower: power,
        lastBlocked: blocked,
      });
      const result = matchSummary(match).pairs[0];
      expect(result).toMatchObject({
        lastBasePower: base,
        lastSpeedBonus: 0,
        lastSkillBonus: skill,
        lastBlocked: blocked,
        lastPower: power,
      });
      expect(
        result.lastBasePower +
          result.lastSpeedBonus +
          result.lastSkillBonus -
          result.lastBlocked,
      ).toBe(power);
    }
  });
});
