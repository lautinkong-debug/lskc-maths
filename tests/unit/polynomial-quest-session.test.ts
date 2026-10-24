import { describe, expect, it } from "vitest";
import {
  newSession,
  transition,
  starsFor,
} from "../../src/apps/polynomials/quest/session";
import {
  blankProgress,
  decodeProgress,
  loadProgress,
  recordResult,
  STORAGE_KEY,
} from "../../src/apps/polynomials/quest/progress";
import type { Coefficients } from "../../src/apps/polynomials/quest/algebra";

describe("Polynomial Quest battle rules", () => {
  it("six original successes win, duplicate submissions/next actions cannot advance twice", () => {
    let s = newSession(0, 42, "run");
    for (let i = 0; i < 6; i++) {
      const id = s.question.id;
      const action = { type: "submit" as const, id, answer: s.question.answer };
      s = transition(s, action);
      expect(s.cleared).toBe(i + 1);
      expect(transition(s, action)).toBe(s);
      s = transition(s, { type: "next", id });
      expect(transition(s, { type: "next", id })).toBe(s);
    }
    expect(s.phase).toBe("complete");
    expect(s.unaided).toBe(6);
    expect(starsFor(s.unaided)).toBe(3);
  });
  it("a wrong answer reveals working, then requires a distinct retry; help never inflates original accuracy", () => {
    let s = newSession(1, 17, "recovery");
    for (let i = 0; i < 6; i++) {
      const original = s.question;
      s = transition(s, {
        type: "submit",
        id: original.id,
        answer: original.answer.map((n) => n + 1) as Coefficients,
      });
      expect(s.phase).toBe("correction");
      expect(s.cleared).toBe(i);
      expect(
        transition(s, {
          type: "submit",
          id: original.id,
          answer: original.answer,
        }),
      ).toBe(s);
      s = transition(s, { type: "retry", id: original.id });
      expect(s.question.source).not.toBe(original.source);
      s = transition(s, {
        type: "submit",
        id: s.question.id,
        answer: s.question.answer,
      });
      s = transition(s, { type: "next", id: s.question.id });
    }
    expect(s.phase).toBe("complete");
    expect(s.unaided).toBe(0);
    expect(starsFor(s.unaided)).toBe(1);
  });
  it("hints reset combo and four unaided originals earn two stars", () => {
    let s = newSession(2, 12, "hints");
    for (let i = 0; i < 6; i++) {
      if (i >= 4) {
        s = transition(s, { type: "hint", id: s.question.id });
        expect(s.combo).toBe(0);
      }
      s = transition(s, {
        type: "submit",
        id: s.question.id,
        answer: s.question.answer,
      });
      s = transition(s, { type: "next", id: s.question.id });
    }
    expect(s.unaided).toBe(4);
    expect(starsFor(s.unaided)).toBe(2);
  });
  it("invalid numbers and stale actions leave the state unchanged", () => {
    const s = newSession(0, 1, "safe");
    expect(transition(s, { type: "hint", id: "old" })).toBe(s);
    expect(
      transition(s, { type: "submit", id: s.question.id, answer: [NaN, 0, 0] }),
    ).toBe(s);
  });
});

describe("Polynomial Quest local progress", () => {
  const memory = () => {
    const data = new Map<string, string>();
    return {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, v: string) => {
        data.set(key, v);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    };
  };
  it("validates untrusted/corrupt storage and unknown versions", () => {
    for (const value of [
      null,
      "{",
      "null",
      '{"version":2}',
      '{"version":1,"stages":[{"stars":999,"best":-1}]}',
    ])
      expect(decodeProgress(value)).toEqual(blankProgress());
  });
  it("retains maxima, merges the latest other-tab result, and is idempotent", () => {
    const storage = memory(),
      stale = blankProgress();
    const first = recordResult(storage, stale, 0, 6);
    recordResult(storage, stale, 1, 4);
    const merged = recordResult(storage, first.progress, 0, 0);
    expect(merged.available).toBe(true);
    expect(merged.progress.stages[0]).toEqual({ stars: 3, best: 6 });
    expect(merged.progress.stages[1]).toEqual({ stars: 2, best: 4 });
    const raw = storage.getItem(STORAGE_KEY);
    recordResult(storage, merged.progress, 0, 0);
    expect(storage.getItem(STORAGE_KEY)).toBe(raw);
  });
  it("keeps the game usable with storage denied", () => {
    const storage = {
      getItem: () => {
        throw Error("denied");
      },
      setItem: () => {
        throw Error("denied");
      },
    };
    expect(loadProgress(storage).available).toBe(false);
    const r = recordResult(storage, blankProgress(), 2, 6);
    expect(r.available).toBe(false);
    expect(r.progress.stages[2].stars).toBe(3);
  });
});
