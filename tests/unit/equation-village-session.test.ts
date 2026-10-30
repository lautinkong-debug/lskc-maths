import { describe, expect, test } from "vitest";
import {
  bridgeRestored,
  buildWorking,
  newSession,
  restoreSession,
  transferComplete,
  type Session,
} from "@/apps/equation-village/session";
import { equationLatex } from "@/apps/equation-village/model";

function solved(): Session {
  return {
    ...newSession(),
    started: true,
    moves: [
      { kind: "subtract", amount: "3" },
      { kind: "divide", amount: "2" },
    ],
    checkedValue: "4",
  };
}

function roundTrip(session: Session) {
  return restoreSession(JSON.stringify(session));
}

describe("working and restoration", () => {
  test("new sessions share no mutable progress", () => {
    const first = newSession();
    const second = newSession();
    first.moves.push({ kind: "subtract", amount: "3" });
    expect(second.moves).toEqual([]);
    expect(bridgeRestored(second)).toBe(false);
    expect(transferComplete(second)).toBe(false);
  });
  test("working follows the original equation and records every accepted step", () => {
    expect(buildWorking(solved().moves).map(equationLatex)).toEqual([
      "2x + 3 = 11",
      "2x = 8",
      "x = 4",
    ]);
    expect(bridgeRestored(solved())).toBe(true);
    expect(roundTrip(solved())).toEqual(solved());
  });
  test("finding an isolated value still requires checking the original", () => {
    expect(bridgeRestored({ ...solved(), checkedValue: "" })).toBe(false);
    expect(bridgeRestored({ ...solved(), checkedValue: "5" })).toBe(false);
    expect(roundTrip({ ...solved(), checkedValue: "5" })).toBeNull();
  });
  test("guessing 4 cannot replace the algebraic working", () => {
    expect(
      roundTrip({ ...newSession(), started: true, checkedValue: "4" }),
    ).toBeNull();
    expect(
      roundTrip({ ...solved(), moves: [{ kind: "subtract", amount: "3" }] }),
    ).toBeNull();
  });
  test("an equally valid divide-first fractional route restores", () => {
    const alternative: Session = {
      ...solved(),
      moves: [
        { kind: "divide", amount: "2" },
        { kind: "subtract", amount: "3/2" },
      ],
      checkedValue: "8/2",
    };
    expect(bridgeRestored(alternative)).toBe(true);
    expect(roundTrip(alternative)).toEqual(alternative);
  });
  test("an invalid suffix cannot obtain credit from a valid solved prefix", () => {
    const altered: Session = {
      ...solved(),
      moves: [...solved().moves, { kind: "divide", amount: "0" }],
    };
    expect(bridgeRestored(altered)).toBe(false);
    expect(roundTrip(altered)).toBeNull();
  });
  test("a session that was never started cannot be restored", () => {
    expect(bridgeRestored({ ...solved(), started: false })).toBe(false);
    expect(roundTrip({ ...solved(), started: false })).toBeNull();
  });
});

describe("transfer and assistance", () => {
  test("opening transfer requires a checked bridge", () => {
    expect(
      roundTrip({ ...newSession(), started: true, transferOpen: true }),
    ).toBeNull();
    expect(transferComplete({ ...solved(), transferAnswer: "5" })).toBe(false);
  });
  test("a correct fresh answer completes only the matching transfer", () => {
    const completed: Session = {
      ...solved(),
      transferOpen: true,
      transferAnswer: "5",
    };
    expect(transferComplete(completed)).toBe(true);
    expect(roundTrip(completed)).toEqual(completed);
    expect(transferComplete({ ...completed, transferAnswer: "4" })).toBe(false);
    expect(roundTrip({ ...completed, transferAnswer: "4" })).toBeNull();
  });
  test("the similar retry has a fresh solution", () => {
    const retry: Session = {
      ...solved(),
      transferOpen: true,
      transferIndex: 1,
      transferMistakes: 1,
      transferAnswer: "6",
    };
    expect(transferComplete(retry)).toBe(true);
    expect(roundTrip(retry)).toEqual(retry);
    expect(transferComplete({ ...retry, transferAnswer: "5" })).toBe(false);
  });
  test("saving assisted completion does not turn it into independent completion", () => {
    const assisted: Session = {
      ...solved(),
      hints: 2,
      mistakes: 1,
      transferOpen: true,
      transferIndex: 1,
      transferMistakes: 2,
      transferAnswer: "6",
    };
    const restored = roundTrip(assisted);
    expect(restored).toEqual(assisted);
    expect(restored && transferComplete(restored)).toBe(true);
    expect(
      restored!.hints + restored!.mistakes + restored!.transferMistakes,
    ).toBe(5);
  });
  test("independent completion preserves zero help and mistake counts", () => {
    const restored = roundTrip({
      ...solved(),
      transferOpen: true,
      transferAnswer: "5",
    });
    expect(restored?.hints).toBe(0);
    expect(restored?.mistakes).toBe(0);
    expect(restored?.transferMistakes).toBe(0);
  });
  test("a retry without a previous mistake cannot claim independent completion", () => {
    const forged: Session = {
      ...solved(),
      transferOpen: true,
      transferIndex: 1,
      transferAnswer: "6",
    };
    expect(transferComplete(forged)).toBe(false);
    expect(roundTrip(forged)).toBeNull();
  });
  test("transfer records cannot precede restoration or exist behind a closed transfer", () => {
    expect(
      roundTrip({
        ...newSession(),
        started: true,
        transferIndex: 1,
        transferMistakes: 1,
      }),
    ).toBeNull();
    expect(roundTrip({ ...solved(), transferMistakes: 1 })).toBeNull();
    expect(
      roundTrip({ ...solved(), transferIndex: 1, transferMistakes: 1 }),
    ).toBeNull();
  });
});

describe("untrusted saved data", () => {
  test("missing save starts clean, corrupt JSON does not", () => {
    expect(restoreSession(null)).toEqual(newSession());
    expect(restoreSession("")).toEqual(newSession());
    expect(restoreSession("broken")).toBeNull();
    expect(restoreSession("null")).toBeNull();
  });
  test.each([
    { version: 2 },
    { started: "true" },
    { moves: "subtract 3" },
    { hints: -1 },
    { hints: 1.5 },
    { mistakes: 10001 },
    { transferMistakes: null },
    { checkedValue: 4 },
    { transferAnswer: 5 },
    { transferOpen: "yes" },
    { transferIndex: 2 },
    { moves: [{ kind: "add", amount: "0" }] },
    { moves: [{ kind: "divide", amount: "0" }] },
    { moves: [{ kind: "multiply", amount: "1000" }] },
    { moves: [{ kind: "execute", amount: "3" }] },
    { moves: [{ kind: "subtract", amount: 3 }] },
    { moves: [null] },
    { moves: [{}] },
    { moves: Array(21).fill({ kind: "add", amount: "1" }) },
  ])("rejects malformed data %#", (patch) => {
    expect(
      restoreSession(
        JSON.stringify({ ...newSession(), started: true, ...patch }),
      ),
    ).toBeNull();
  });
  test("invented completion flags are ignored", () => {
    const restored = restoreSession(
      JSON.stringify({
        ...newSession(),
        complete: true,
        bridgeRestored: true,
        score: 999,
      }),
    );
    expect(restored).toEqual(newSession());
    expect(restored && transferComplete(restored)).toBe(false);
  });
});
