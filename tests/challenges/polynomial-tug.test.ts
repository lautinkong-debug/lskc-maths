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
    expect(after.groups[0].position).toBe(-1);
    expect(
      typeof (
        await adminDb.doc(`polynomialTugRooms/${code}/matches/0`).get()
      ).get("expireAt").toMillis,
    ).toBe("function");
    expect(after.groups.slice(1).every((g) => g.position === 0)).toBe(true);
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
    ).rejects.toThrow("four");
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
    await expect(readTugRoom("secure-0", null, code)).rejects.toThrow(
      "expired",
    );
  }, 30000);
});
