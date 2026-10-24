import { describe, expect, it } from "vitest";
import {
  newMatch,
  questionFor,
  applyMove,
  pairLevel,
  matchSummary,
  playerView,
  optionsFor,
} from "../../src/lib/polynomial-tug/game";
import { answerChoices } from "../../src/apps/polynomials/quest/choices";
import { sameAnswer } from "../../src/apps/polynomials/quest/algebra";
import type { Match } from "../../src/lib/polynomial-tug/types";

function solve(m: Match, seat: number) {
  const q = questionFor(m, seat);
  return applyMove(m, seat, {
    action: "answer",
    questionId: q.id,
    option: optionsFor(m, seat).findIndex((a) => sameAnswer(a, q.answer)),
  });
}
function advance(m: Match, side: number) {
  for (const seat of [side * 2, side * 2 + 1])
    m = applyMove(m, seat, {
      action: "next",
      questionId: questionFor(m, seat).id,
    });
  return m;
}
describe("cooperative polynomial tug", () => {
  it("does not reveal the correct letter through its public question ID", () => {
    let recovered = 0;
    for (let seed = 0; seed < 128; seed++) {
      const m = newMatch(
          seed,
          "test-secret-for-repeatable-security-regression",
        ),
        q = questionFor(m, 0);
      const guess = answerChoices(q).findIndex((a) => sameAnswer(a, q.answer));
      const submitted = applyMove(m, 0, {
        action: "answer",
        questionId: q.id,
        option: guess,
      });
      if (submitted.pupils[0].phase === "correct") recovered++;
    }
    expect(recovered).toBeLessThan(80);
  });
  it("needs both partners, awards once, and waits for both to continue", () => {
    const first = solve(newMatch(42), 0);
    expect(first.position).toBe(0);
    expect(playerView(first, 0).phase).toBe("correct");
    const paired = solve(first, 1);
    expect(paired.position).toBe(-1);
    expect(paired.pairs[0].pulls).toBe(1);
    expect(solve(paired, 1)).toEqual(paired);
    const oneNext = applyMove(paired, 0, {
      action: "next",
      questionId: questionFor(paired, 0).id,
    });
    expect(oneNext.pairs[0].round).toBe(0);
    expect(advance(paired, 0).pairs[0].round).toBe(1);
    expect(paired.pairs[1].round).toBe(0);
  });
  it("reveals only submitted working and changes a wrong question for retry", () => {
    const m = solve(newMatch(13), 0),
      q = questionFor(m, 1);
    expect(JSON.stringify(playerView(m, 1))).not.toContain('"answer":');
    expect(playerView(m, 1).feedback).toBeNull();
    const wrong = applyMove(m, 1, {
      action: "answer",
      questionId: q.id,
      option: optionsFor(m, 1).findIndex((a) => !sameAnswer(a, q.answer)),
    });
    expect(wrong.position).toBe(0);
    expect(playerView(wrong, 1).feedback?.question.answer).toEqual(q.answer);
    const retry = applyMove(wrong, 1, { action: "retry", questionId: q.id });
    expect(questionFor(retry, 1).source).not.toBe(q.source);
    expect(playerView(retry, 0).phase).toBe("correct");
    expect(solve(retry, 1).position).toBe(-1);
  });
  it("earns levels 1–4 with bounded powers and a terminal win", () => {
    let m = newMatch(7);
    const powers: number[] = [];
    for (let turn = 0; turn < 11; turn++) {
      powers.push(pairLevel(m.pairs[0]));
      m = solve(solve(m, 0), 1);
      if (m.winner !== null) break;
      m = advance(m, 0);
    }
    expect(powers).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4]);
    expect(m.position).toBe(-24);
    expect(m.winner).toBe(0);
    expect(matchSummary(m).pairs[0].power).toBe(4);
    expect(() =>
      applyMove(m, 2, {
        action: "answer",
        questionId: questionFor(m, 2).id,
        option: 0,
      }),
    ).toThrow();
  });
  it("rejects stale IDs, invalid seats, invalid options and premature retry/next", () => {
    const m = newMatch(1),
      id = questionFor(m, 0).id;
    expect(() =>
      applyMove(m, 0, { action: "answer", questionId: "stale", option: 0 }),
    ).toThrow();
    expect(() =>
      applyMove(m, 4, { action: "answer", questionId: id, option: 0 }),
    ).toThrow();
    expect(() =>
      applyMove(m, 0, { action: "answer", questionId: id, option: 4 }),
    ).toThrow();
    expect(() =>
      applyMove(m, 0, { action: "retry", questionId: id }),
    ).toThrow();
    expect(() => applyMove(m, 0, { action: "next", questionId: id })).toThrow();
  });
});
