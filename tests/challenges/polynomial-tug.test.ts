import { afterAll, describe, expect, it } from "vitest";
import { adminDb } from "../../src/lib/server/firebaseAdmin";
import {
  createTugRoom,
  joinTugRoom,
  controlTugRoom,
  readTugRoom,
  moveTug,
} from "../../src/lib/server/polynomialTug";
import { questionFor, optionsFor } from "../../src/lib/polynomial-tug/game";
import { sameAnswer } from "../../src/apps/polynomials/quest/algebra";
import { speedBonus } from "../../src/lib/polynomial-tug/timing";
import type { Match } from "../../src/lib/polynomial-tug/types";
if (
  process.env.GCLOUD_PROJECT !== "demo-lskc-maths" ||
  !process.env.FIRESTORE_EMULATOR_HOST
)
  throw new Error("Emulator required");
const codes: string[] = [];
afterAll(async () => {
  for (const code of codes)
    await adminDb.recursiveDelete(adminDb.doc(`polynomialTugRooms/${code}`));
});
async function room(groups = 8) {
  const code = await createTugRoom("tug-test@lskc.edu.hk", groups);
  codes.push(code);
  return code;
}
async function correct(code: string, uid: string, group: number) {
  const m = (
    await adminDb.doc(`polynomialTugRooms/${code}/matches/${group}`).get()
  ).data() as Match;
  const actual = (await readTugRoom(uid, null, code)).you!;
  const q = questionFor(m, actual.seat);
  return moveTug(uid, code, {
    action: "answer",
    questionId: q.id,
    option: optionsFor(m, actual.seat).findIndex((a) =>
      sameAnswer(a, q.answer),
    ),
  });
}
describe("Polynomial Tug on the demo emulator", () => {
  it("fills 32 unique seats, rejects overflow, and synchronises concurrent partner answers exactly once", async () => {
    const code = await room();
    await Promise.all(
      Array.from({ length: 32 }, (_, i) =>
        joinTugRoom(
          `tug-${i}`,
          code,
          Math.floor(i / 4),
          Math.floor((i % 4) / 2),
        ),
      ),
    );
    const board = await readTugRoom("teacher", "tug-test@lskc.edu.hk", code);
    expect(board.groups).toHaveLength(8);
    expect(
      board.groups.flatMap((g) => g.occupied).filter(Boolean),
    ).toHaveLength(32);
    await expect(joinTugRoom("extra", code, 0, 0)).rejects.toThrow("full");
    await joinTugRoom("tug-0", code, 7, 1);
    expect((await readTugRoom("tug-0", null, code)).you?.group).toBe(0);
    await controlTugRoom("tug-test@lskc.edu.hk", code, "start");
    const one = await readTugRoom("tug-0", null, code);
    expect(one.role).toBe("student");
    expect(one.player?.feedback).toBeNull();
    expect(JSON.stringify(one)).not.toMatch(
      /"seed"|"members"|"answer"|"steps"|tug-1/,
    );
    await Promise.all([correct(code, "tug-0", 0), correct(code, "tug-1", 0)]);
    await correct(code, "tug-0", 0);
    const after = await readTugRoom("tug-0", null, code);
    expect(after.match!.pairs[0].lastBasePower).toBe(1);
    expect(after.match!.pairs[0].lastSpeedBonus).toBe(
      speedBonus(1, after.match!.pairs[0].lastElapsedMs, true),
    );
    expect(after.match!.position).toBe(
      -1 - after.match!.pairs[0].lastSpeedBonus,
    );
    expect(after.groups).toEqual([]);
    expect(
      typeof (
        await adminDb.doc(`polynomialTugRooms/${code}/matches/0`).get()
      ).get("expireAt").toMillis,
    ).toBe("function");
    expect(
      (await readTugRoom("teacher", "tug-test@lskc.edu.hk", code)).groups
        .slice(1)
        .every((g) => g.position === 0),
    ).toBe(true);
    await controlTugRoom("tug-test@lskc.edu.hk", code, "pause");
    await expect(correct(code, "tug-2", 0)).rejects.toThrow("paused");
    await controlTugRoom("tug-test@lskc.edu.hk", code, "resume");
    await correct(code, "tug-2", 0);
    await controlTugRoom("tug-test@lskc.edu.hk", code, "end");
    await expect(correct(code, "tug-3", 0)).rejects.toThrow("closed");
  }, 60000);
  it("rejects foreign owners, incomplete starts, forged question IDs and outsiders", async () => {
    const code = await room(1);
    await expect(
      controlTugRoom("other@lskc.edu.hk", code, "start"),
    ).rejects.toThrow("owner");
    await expect(
      controlTugRoom("tug-test@lskc.edu.hk", code, "start"),
    ).rejects.toThrow("one student");
    await Promise.all(
      [0, 1, 2, 3].map((i) =>
        joinTugRoom(`secure-${i}`, code, 0, Math.floor(i / 2)),
      ),
    );
    await controlTugRoom("tug-test@lskc.edu.hk", code, "start");
    const mine = await readTugRoom("secure-0", null, code);
    await expect(
      moveTug("secure-1", code, {
        action: "answer",
        questionId: mine.player!.question.id,
        option: 0,
      }),
    ).rejects.toThrow("stale");
    await expect(
      moveTug("outsider", code, {
        action: "answer",
        questionId: mine.player!.question.id,
        option: 0,
      }),
    ).rejects.toThrow("Join");
    await adminDb.doc(`polynomialTugRooms/${code}`).update({ expiresAt: 0 });
    await expect(readTugRoom("secure-0", null, code, true)).rejects.toThrow(
      "expired",
    );
  }, 30000);
});

describe("flexible attendance and transactional skills", () => {
  it("starts with one pupil, queues a late partner and requires both next round", async () => {
    const code = await room(8);
    await readTugRoom("late", null, code); // Previously cached as unseated.
    await joinTugRoom("solo", code, 0, 0);
    await controlTugRoom("tug-test@lskc.edu.hk", code, "start");
    await correct(code, "solo", 0);
    await joinTugRoom("late", code, 0, 0);
    const late = await readTugRoom("late", null, code);
    expect(late.player!.phase).toBe("waiting");
    expect(late.groups).toHaveLength(0);
    expect(late.match!.pairs[0].pulls).toBe(1);
    await expect(
      moveTug("late", code, {
        action: "next",
        questionId: late.player!.question.id,
      }),
    ).rejects.toThrow("next round");
    const solo = await readTugRoom("solo", null, code);
    await moveTug("solo", code, {
      action: "next",
      questionId: solo.player!.question.id,
    });
    expect((await readTugRoom("late", null, code)).player!.phase).toBe(
      "answering",
    );
    await correct(code, "solo", 0);
    expect((await readTugRoom("solo", null, code)).match!.pairs[0].pulls).toBe(
      1,
    );
    await correct(code, "late", 0);
    expect((await readTugRoom("late", null, code)).match!.pairs[0].pulls).toBe(
      2,
    );
    await controlTugRoom("tug-test@lskc.edu.hk", code, "pause");
    await joinTugRoom("opponent", code, 0, 1);
    expect((await readTugRoom("opponent", null, code)).player!.phase).toBe(
      "answering",
    );
    await expect(correct(code, "opponent", 0)).rejects.toThrow("paused");
    await controlTugRoom("tug-test@lskc.edu.hk", code, "end");
    await expect(joinTugRoom("new", code, 1, 0)).rejects.toThrow("ended");
  }, 30000);
  it("deduplicates simultaneous partner skills and consumes an opposing shield once", async () => {
    const code = await room(1);
    await Promise.all(
      [0, 1, 2, 3].map((i) =>
        joinTugRoom("skill-" + i, code, 0, Math.floor(i / 2)),
      ),
    );
    const ref = adminDb.doc("polynomialTugRooms/" + code + "/matches/0");
    const match = (await ref.get()).data() as Match;
    for (const p of match.pairs) {
      p.pulls = 9;
      p.round = 9;
      p.energy = 6;
    }
    await ref.set(match);
    await controlTugRoom("tug-test@lskc.edu.hk", code, "start");
    const views = await Promise.all(
      [0, 1, 2, 3].map((i) => readTugRoom("skill-" + i, null, code, true)),
    );
    await Promise.all(
      [0, 1].map((i) =>
        moveTug("skill-" + i, code, {
          action: "skill",
          skill: "surge",
          questionId: views[i].player!.question.id,
        }),
      ),
    );
    expect(
      (await readTugRoom("skill-0", null, code)).match!.pairs[0].energy,
    ).toBe(2);
    await moveTug("skill-2", code, {
      action: "skill",
      skill: "shield",
      questionId: views[2].player!.question.id,
    });
    await Promise.all([
      correct(code, "skill-0", 0),
      correct(code, "skill-1", 0),
    ]);
    const after = await readTugRoom("skill-0", null, code);
    const expected =
      (4 + speedBonus(4, after.match!.pairs[0].lastElapsedMs, true)) * 2 - 2;
    expect(after.match!.position).toBe(-expected);
    expect(after.match!.pairs[0]).toMatchObject({
      energy: 3,
      armed: null,
      lastBlocked: 2,
      pulls: 10,
    });
    expect(after.match!.pairs[1].shield).toBe(false);
    await correct(code, "skill-0", 0);
    expect((await readTugRoom("skill-0", null, code)).match!.position).toBe(
      -expected,
    );
    await controlTugRoom("tug-test@lskc.edu.hk", code, "end");
  }, 30000);
});

it("freezes the team clock during teacher pauses and does not write during reads", async () => {
  const code = await room(2);
  await joinTugRoom("clock-pupil", code, 0, 0);
  await controlTugRoom("tug-test@lskc.edu.hk", code, "start");
  const matchRef = adminDb.doc("polynomialTugRooms/" + code + "/matches/0");
  const before = await matchRef.get();
  await readTugRoom("clock-pupil", null, code, true);
  await readTugRoom("clock-pupil", null, code, true);
  expect((await matchRef.get()).updateTime!.isEqual(before.updateTime!)).toBe(
    true,
  );
  await controlTugRoom("tug-test@lskc.edu.hk", code, "pause");
  const frozen = (await readTugRoom("clock-pupil", null, code, true)).match!
    .pairs[0].elapsedMs!;
  await joinTugRoom("paused-arrival", code, 1, 0);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  expect(
    (await readTugRoom("clock-pupil", null, code, true)).match!.pairs[0]
      .elapsedMs,
  ).toBe(frozen);
  expect(
    (await readTugRoom("paused-arrival", null, code, true)).match!.pairs[0]
      .elapsedMs,
  ).toBe(0);
  await controlTugRoom("tug-test@lskc.edu.hk", code, "resume");
  const resumed = (await readTugRoom("clock-pupil", null, code, true)).match!
    .pairs[0].elapsedMs!;
  expect(resumed - frozen).toBeLessThan(1000);
  const roomData = (
    await adminDb.doc("polynomialTugRooms/" + code).get()
  ).data()!;
  expect(roomData.pausedMs).toBeGreaterThanOrEqual(1200);
  await correct(code, "clock-pupil", 0);
  const result = (await readTugRoom("clock-pupil", null, code, true)).match!
    .pairs[0];
  expect(result.lastPower).toBe(result.lastBasePower + result.lastSpeedBonus);
  await controlTugRoom("tug-test@lskc.edu.hk", code, "end");
}, 30000);
