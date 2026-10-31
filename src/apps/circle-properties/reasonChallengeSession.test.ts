import { describe, expect, it } from "vitest";
import {
  challengeGroups,
  createChallengeQueue,
  getReasonChallenge,
} from "./reasonChallenge";
import {
  emptyChallengeResponse,
  initialChallengeSession,
  newChallengeDraft,
  parseChallengeSession,
  updateChallengeChain,
  challengeSpeedBonus,
  type ChallengeSession,
} from "./reasonChallengeSession";

function session(seconds: ChallengeSession["seconds"] = 0): ChallengeSession {
  const queue = createChallengeQueue("mixed", 12345);
  return {
    ...initialChallengeSession,
    group: "mixed",
    seed: 12345,
    queue,
    seconds,
    started: true,
    drafts: { [queue[0]]: newChallengeDraft(seconds, 1793460000000) },
  };
}

function correctResponse(state: ChallengeSession, index = state.index) {
  const c = getReasonChallenge(state.queue[index], (state.seed + index) % 3);
  return {
    value: String(c.q.answer),
    condition: c.q.condition,
    target: c.target,
    reason: c.q.reasonId,
  };
}

describe("reason challenge saved sessions", () => {
  it("starts cleanly and does not import scores from the removed three-game schema", () => {
    expect(parseChallengeSession(undefined)).toBeUndefined();
    expect(parseChallengeSession(null)).toBeUndefined();
    expect(parseChallengeSession([])).toBeUndefined();
    expect(parseChallengeSession({})).toEqual(initialChallengeSession);
    expect(
      parseChallengeSession({
        game: "unlock",
        mode: "speed",
        active: { status: "won" },
        results: { "unlock-r1-speed": { stars: 3, score: 420 } },
      }),
    ).toEqual(initialChallengeSession);
  });

  it("preserves a mixed queue and partial four-field answers exactly through reload", () => {
    const state = session(90);
    const id = state.queue[0];
    const response = { ...correctResponse(state), value: "2.", target: "" };
    state.drafts[id].response = response;
    const parsed = parseChallengeSession(JSON.parse(JSON.stringify(state)))!;
    expect(parsed.queue).toEqual(state.queue);
    expect(parsed.seed).toBe(state.seed);
    expect(parsed.started).toBe(true);
    expect(parsed.drafts[id].response).toEqual(response);
    expect(parsed.drafts[id].deadline).toBe(state.drafts[id].deadline);
  });

  it("keeps separate Q1 and Q2 drafts, attempts, feedback state and original timers", () => {
    const state = session(60);
    const first = state.queue[0];
    const second = state.queue[1];
    state.drafts[first] = {
      ...state.drafts[first],
      response: correctResponse(state),
      checked: true,
      complete: true,
      tries: 1,
      bestScore: 118,
    };
    state.index = 1;
    state.drafts[second] = {
      ...newChallengeDraft(60, 1793460030000),
      response: { ...emptyChallengeResponse(), value: "11" },
    };
    const parsed = parseChallengeSession(JSON.parse(JSON.stringify(state)))!;
    expect(parsed.index).toBe(1);
    expect(parsed.drafts[first]).toEqual(state.drafts[first]);
    expect(parsed.drafts[second]).toEqual(state.drafts[second]);
    const back = parseChallengeSession({ ...parsed, index: 0 })!;
    expect(back.drafts[first].response).toEqual(correctResponse(back));
    expect(back.drafts[first].bestScore).toBe(118);
    expect(back.drafts[first].tries).toBe(1);
    expect(back.drafts[second].response.value).toBe("11");
  });

  it("allows expired attempts to continue as helped practice without fabricating a timer", () => {
    const state = session(120);
    const id = state.queue[0];
    state.drafts[id] = { ...state.drafts[id], helped: true, deadline: null };
    const parsed = parseChallengeSession(state)!;
    expect(parsed.started).toBe(true);
    expect(parsed.drafts[id].helped).toBe(true);
    expect(parsed.drafts[id].deadline).toBeNull();
    expect(newChallengeDraft(0, 1000).deadline).toBeNull();
    expect(newChallengeDraft(60, 1000).deadline).toBe(61000);
    expect(newChallengeDraft(90, 1000).deadline).toBe(91000);
    expect(newChallengeDraft(120, 1000).deadline).toBe(121000);
  });

  it("keeps expired and checked states when reopening without resetting the time budget", () => {
    const state = session(60);
    const id = state.queue[0];
    state.drafts[id].expired = true;
    state.drafts[id].checked = true;
    state.drafts[id].tries = 2;
    const parsed = parseChallengeSession(state)!;
    expect(parsed.drafts[id]).toMatchObject({
      expired: true,
      checked: true,
      tries: 2,
      deadline: 1793460060000,
    });
  });

  it("does not trust a complete flag when the four answers do not justify completion", () => {
    const state = session();
    const id = state.queue[0];
    state.drafts[id].checked = true;
    state.drafts[id].complete = true;
    expect(parseChallengeSession(state)?.drafts[id].complete).toBe(false);
    state.drafts[id].response = correctResponse(state);
    expect(parseChallengeSession(state)?.drafts[id].complete).toBe(true);
    state.drafts[id].checked = false;
    expect(parseChallengeSession(state)?.drafts[id].complete).toBe(false);
  });

  it("strips unknown response fields which would otherwise crash form validation", () => {
    const state = session();
    const id = state.queue[0];
    const raw = {
      ...state,
      drafts: {
        [id]: {
          ...state.drafts[id],
          response: { ...correctResponse(state), unexpected: { crash: true } },
        },
      },
    };
    expect(parseChallengeSession(raw)?.drafts[id].response).toEqual(
      correctResponse(state),
    );
  });

  it.each([
    { response: { value: 7, condition: "", target: "", reason: "" } },
    {
      response: {
        value: "7".repeat(41),
        condition: "",
        target: "",
        reason: "",
      },
    },
    { response: { value: "7", condition: "fake", target: "", reason: "" } },
    { response: { value: "7", condition: "", target: "fake", reason: "" } },
    { response: { value: "7", condition: "", target: "", reason: "r999" } },
    { deadline: -1 },
    { deadline: NaN },
    { deadline: Infinity },
    { deadline: null, helped: false },
    { tries: -1 },
    { tries: 0.5 },
    { bestScore: 121 },
    { bestScore: -1 },
  ])("discards malformed current draft %j safely", (changes) => {
    const state = session(90);
    const id = state.queue[0];
    const parsed = parseChallengeSession({
      ...state,
      drafts: { [id]: { ...state.drafts[id], ...changes } },
    })!;
    expect(parsed.drafts[id]).toBeUndefined();
    expect(parsed.started).toBe(false);
  });

  it("rejects missing, duplicate and out-of-group queues instead of resuming the wrong question", () => {
    const state = session();
    for (const queue of [
      [],
      state.queue.slice(1),
      Array(17).fill("r1"),
      [...state.queue.slice(1), "r18"],
    ]) {
      const parsed = parseChallengeSession({ ...state, queue })!;
      expect(parsed.queue).toEqual([]);
      expect(parsed.started).toBe(false);
    }
    expect(parseChallengeSession({ ...state, group: "chords" })?.started).toBe(
      false,
    );
  });

  it("sanitises counters, ignores stale drafts, and bounds group best records", () => {
    const state = session();
    const parsed = parseChallengeSession({
      ...state,
      seconds: 30,
      index: 100,
      drafts: { ...state.drafts, r99: newChallengeDraft(0, 0) },
      best: {
        mixed: { score: 200, solved: 2 },
        chords: { score: 601, solved: 5 },
        angles: { score: 100, solved: 5 },
        other: { score: 100, solved: 1 },
      },
    })!;
    expect(parsed.seconds).toBe(0);
    expect(parsed.index).toBe(0);
    expect(parsed.drafts.r99).toBeUndefined();
    expect(parsed.best).toEqual({ mixed: { score: 200, solved: 2 } });
    for (const group of challengeGroups)
      expect(group.reasonIds.length * 120).toBeGreaterThan(0);
  });
});

describe("independent first-try chains", () => {
  const time = 1793460000000;

  it("awards one chain step for all four correct fields without changing the draft or score", () => {
    const state = session();
    const id = state.queue[0];
    state.drafts[id].response = correctResponse(state);
    const before = JSON.stringify(state);
    expect(updateChallengeChain(state, id, time)).toEqual({
      streak: 1,
      bestStreak: 1,
    });
    expect(JSON.stringify(state)).toBe(before);
    expect(state.drafts[id].bestScore).toBe(0);
  });

  it("does not award again on review, navigation, reload or a repeated submission", () => {
    let state = session();
    const first = state.queue[0];
    state.drafts[first].response = correctResponse(state);
    state = { ...state, ...updateChallengeChain(state, first, time) };
    state.drafts[first] = {
      ...state.drafts[first],
      checked: true,
      complete: true,
      tries: 1,
      bestScore: 100,
    };
    const repeated = { streak: 1, bestStreak: 1 };
    expect(updateChallengeChain(state, first, time)).toEqual(repeated);
    state = parseChallengeSession(JSON.parse(JSON.stringify(state)))!;
    expect(updateChallengeChain(state, first, time)).toEqual(repeated);

    state.index = 1;
    const second = state.queue[1];
    state.drafts[second] = newChallengeDraft(0, time);
    state.drafts[second].response = correctResponse(state);
    expect(updateChallengeChain(state, first, time)).toEqual(repeated);
    expect(updateChallengeChain(state, second, time)).toEqual({
      streak: 2,
      bestStreak: 2,
    });
    expect(state.drafts[first].tries).toBe(1);
    expect(state.drafts[first].bestScore).toBe(100);
  });

  it.each(["value", "condition", "target", "reason"] as const)(
    "breaks the chain on a checked wrong %s, retaining its record",
    (field) => {
      const state = { ...session(), streak: 2, bestStreak: 5 };
      const id = state.queue[0];
      const c = getReasonChallenge(id, state.seed % 3);
      state.drafts[id].response = {
        ...correctResponse(state),
        [field]: {
          value: String(c.q.answer + 1),
          condition: c.q.wrongConditions[0],
          target: c.wrongTargets[0],
          reason: c.reasonChoices.find((reason) => reason !== id)!,
        }[field],
      };
      expect(updateChallengeChain(state, id, time)).toEqual({
        streak: 0,
        bestStreak: 5,
      });
    },
  );

  it.each([{ tries: 1 }, { helped: true }])(
    "does not extend the independent chain for a correct repair or hint %j",
    (change) => {
      const state = { ...session(), streak: 2, bestStreak: 5 };
      const id = state.queue[0];
      state.drafts[id] = {
        ...state.drafts[id],
        response: correctResponse(state),
        ...change,
      };
      expect(updateChallengeChain(state, id, time)).toEqual({
        streak: 0,
        bestStreak: 5,
      });
    },
  );

  it("leaves unfinished answers alone and breaks a timed-out chain without awarding it", () => {
    const state = { ...session(60), streak: 2, bestStreak: 5 };
    const id = state.queue[0];
    expect(updateChallengeChain(state, id, time)).toEqual({
      streak: 2,
      bestStreak: 5,
    });
    state.drafts[id].response = correctResponse(state);
    expect(updateChallengeChain(state, id, time + 60000)).toEqual({
      streak: 0,
      bestStreak: 5,
    });
    state.drafts[id].expired = true;
    expect(updateChallengeChain(state, id, time)).toEqual({
      streak: 0,
      bestStreak: 5,
    });
  });

  it("migrates older saves to zero chain instead of inventing past independent successes", () => {
    const state = session();
    const id = state.queue[0];
    state.drafts[id] = {
      ...state.drafts[id],
      response: correctResponse(state),
      checked: true,
      complete: true,
      tries: 1,
      bestScore: 100,
    };
    const parsed = parseChallengeSession({
      ...state,
      streak: undefined,
      bestStreak: undefined,
    })!;
    expect(parsed.streak).toBe(0);
    expect(parsed.bestStreak).toBe(0);
    expect(parsed.drafts[id].bestScore).toBe(100);
  });

  it("bounds saved chains by independent solved drafts and preserves the record for a fresh level", () => {
    const state = session();
    expect(
      parseChallengeSession({ ...state, streak: 4, bestStreak: 8 }),
    ).toMatchObject({
      streak: 0,
      bestStreak: 8,
    });
    const id = state.queue[0];
    state.drafts[id] = {
      ...state.drafts[id],
      response: correctResponse(state),
      checked: true,
      complete: true,
      tries: 1,
    };
    expect(
      parseChallengeSession({ ...state, streak: 4, bestStreak: 8 }),
    ).toMatchObject({
      streak: 1,
      bestStreak: 8,
    });
    expect(
      parseChallengeSession({ ...state, streak: 1, bestStreak: 0 }),
    ).toMatchObject({
      streak: 1,
      bestStreak: 1,
    });
    expect(
      parseChallengeSession({ ...initialChallengeSession, bestStreak: 8 }),
    ).toMatchObject({
      streak: 0,
      bestStreak: 8,
    });
    for (const invalid of [-1, 18, 0.5, "4", NaN, Infinity]) {
      expect(
        parseChallengeSession({
          ...state,
          streak: invalid,
          bestStreak: invalid,
        }),
      ).toMatchObject({
        streak: 0,
        bestStreak: 0,
      });
    }
  });
});

describe("pace-neutral speed bonus", () => {
  const time = 1793460000000;

  it.each([60, 90, 120] as const)(
    "uses the same 20-point scale for the %i-second pace",
    (seconds) => {
      const draft = newChallengeDraft(seconds, time);
      expect(challengeSpeedBonus(draft, seconds, true, time)).toBe(20);
      expect(
        challengeSpeedBonus(draft, seconds, true, time + seconds * 500),
      ).toBe(10);
      expect(
        challengeSpeedBonus(draft, seconds, true, time + seconds * 750),
      ).toBe(5);
      expect(challengeSpeedBonus(draft, seconds, true, draft.deadline!)).toBe(
        0,
      );
      expect(challengeSpeedBonus(draft, seconds, true, time - 1000000)).toBe(
        20,
      );
    },
  );

  it.each([
    { tries: 1 },
    { helped: true },
    { checked: true },
    { complete: true },
    { expired: true },
    { deadline: null },
    { deadline: Infinity },
  ])("awards no bonus to repaired, helped or ended attempts %j", (change) => {
    expect(
      challengeSpeedBonus(
        { ...newChallengeDraft(60, time), ...change },
        60,
        true,
        time,
      ),
    ).toBe(0);
  });

  it("keeps practice and incorrect attempts free of speed rewards", () => {
    expect(challengeSpeedBonus(newChallengeDraft(0, time), 0, true, time)).toBe(
      0,
    );
    expect(
      challengeSpeedBonus(newChallengeDraft(60, time), 60, false, time),
    ).toBe(0);
    expect(
      challengeSpeedBonus(newChallengeDraft(60, time), 60, true, NaN),
    ).toBe(0);
  });

  it("accepts the new 120-point maximum and rejects inflated saved records", () => {
    const state = session(60);
    const id = state.queue[0];
    state.drafts[id].bestScore = 120;
    state.best = { mixed: { score: 17 * 120, solved: 17 } };
    expect(parseChallengeSession(state)?.drafts[id].bestScore).toBe(120);
    expect(parseChallengeSession(state)?.best).toEqual(state.best);
    state.drafts[id].bestScore = 121;
    state.best.mixed.score++;
    expect(parseChallengeSession(state)?.drafts[id]).toBeUndefined();
    expect(parseChallengeSession(state)?.best).toEqual({});
  });
});
