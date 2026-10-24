import { randomInt } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, ChallengeError } from "./firebaseAdmin";
import {
  applyMove,
  matchSummary,
  newMatch,
  playerView,
} from "../polynomial-tug/game";
import type { Match, Move, Room, RoomView } from "../polynomial-tug/types";
import { copy } from "../copy";
import { CODE_ALPHABET } from "../challenges/codes";
const e = copy.polynomialTug.errors;
function fail(message: string, status = 400): never {
  throw new ChallengeError("tug-error", message, status);
}
function roomRef(code: string) {
  if (typeof code !== "string" || !/^[A-HJ-KM-NP-Z2-9]{6}$/.test(code))
    fail(e.code);
  return adminDb.doc(`polynomialTugRooms/${code}`);
}
function roomData(data: FirebaseFirestore.DocumentData | undefined): Room {
  if (!data) fail(e.missing, 404);
  const room = data as Room;
  if (room.expiresAt <= Date.now()) fail(e.expired, 410);
  return room;
}
function matchData(data: FirebaseFirestore.DocumentData | undefined): Match {
  if (!data) fail(e.missing, 404);
  const { seed, secret, revision, members, pairs, pupils, position, winner } =
    data!;
  // Keep Firestore Timestamp metadata outside the pure structured-cloned game.
  return { seed, secret, revision, members, pairs, pupils, position, winner };
}
export async function createTugRoom(
  owner: string,
  groupCount: number,
): Promise<string> {
  if (!Number.isInteger(groupCount) || groupCount < 1 || groupCount > 8)
    fail(e.groups);
  const alphabet = CODE_ALPHABET;
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = Array.from(
      { length: 6 },
      () => alphabet[randomInt(alphabet.length)],
    ).join("");
    const ref = roomRef(code),
      expiresAt = Date.now() + 4 * 60 * 60 * 1000;
    const created = await adminDb.runTransaction(async (tx) => {
      if ((await tx.get(ref)).exists) return false;
      tx.create(ref, {
        code,
        owner,
        groupCount,
        status: "lobby",
        revision: 0,
        expiresAt,
        expireAt: Timestamp.fromMillis(expiresAt),
      });
      for (let group = 0; group < groupCount; group++)
        tx.create(ref.collection("matches").doc(String(group)), {
          ...newMatch(randomInt(2 ** 32)),
          expireAt: Timestamp.fromMillis(expiresAt),
        });
      return true;
    });
    if (created) return code;
  }
  return fail(e.create, 503);
}
export async function joinTugRoom(
  uid: string,
  code: string,
  group: number,
  side: number,
): Promise<void> {
  const ref = roomRef(code),
    membership = ref.collection("players").doc(uid);
  await adminDb.runTransaction(
    async (tx) => {
      const room = roomData((await tx.get(ref)).data());
      if ((await tx.get(membership)).exists) return;
      if (room.status !== "lobby") fail(e.joinClosed, 409);
      if (
        !Number.isInteger(group) ||
        group < 0 ||
        group >= room.groupCount ||
        (side !== 0 && side !== 1)
      )
        fail(e.seat);
      const gameRef = ref.collection("matches").doc(String(group));
      const game = matchData((await tx.get(gameRef)).data());
      const seat = [side * 2, side * 2 + 1].find(
        (i) => game.members[i] === null,
      );
      if (seat === undefined) fail(e.full, 409);
      game.members[seat] = uid;
      game.revision++;
      tx.set(gameRef, game, { merge: true });
      tx.create(membership, {
        group,
        seat,
        expireAt: Timestamp.fromMillis(room.expiresAt),
      });
    },
    { maxAttempts: 15 },
  );
}
export async function controlTugRoom(
  owner: string,
  code: string,
  action: string,
): Promise<void> {
  const ref = roomRef(code);
  await adminDb.runTransaction(async (tx) => {
    const room = roomData((await tx.get(ref)).data());
    if (room.owner !== owner) fail(e.owner, 403);
    if (action === "start") {
      if (room.status === "live") return;
      if (room.status !== "lobby") fail(e.control, 409);
      const groups = await tx.getAll(
        ...Array.from({ length: room.groupCount }, (_, i) =>
          ref.collection("matches").doc(String(i)),
        ),
      );
      if (
        groups.some((g) => (g.data() as Match).members.some((m) => m === null))
      )
        fail(e.incomplete, 409);
      room.status = "live";
    } else if (action === "pause" && room.status === "live")
      room.status = "paused";
    else if (action === "resume" && room.status === "paused")
      room.status = "live";
    else if (action === "end") room.status = "closed";
    else fail(e.control, 409);
    tx.update(ref, { status: room.status, revision: room.revision + 1 });
  });
}
export async function moveTug(
  uid: string,
  code: string,
  move: Move,
): Promise<void> {
  const ref = roomRef(code);
  await adminDb.runTransaction(
    async (tx) => {
      const room = roomData((await tx.get(ref)).data());
      if (room.status !== "live")
        fail(room.status === "paused" ? e.paused : e.closed, 409);
      const member = (await tx.get(ref.collection("players").doc(uid))).data();
      if (!member) fail(e.joinFirst, 403);
      const gameRef = ref.collection("matches").doc(String(member.group));
      const game = matchData((await tx.get(gameRef)).data());
      if (game.members[member.seat] !== uid) fail(e.joinFirst, 403);
      let next: Match;
      try {
        next = applyMove(game, member.seat, move);
      } catch (cause) {
        const key = cause instanceof Error ? cause.message : "";
        fail(
          key === "stale-question"
            ? e.stale
            : key === "finished"
              ? e.finished
              : e.move,
          409,
        );
      }
      if (next !== game) tx.set(gameRef, next, { merge: true });
    },
    { maxAttempts: 15 },
  );
}
export async function readTugRoom(
  uid: string,
  teacherEmail: string | null,
  code: string,
): Promise<RoomView> {
  const ref = roomRef(code),
    room = roomData((await ref.get()).data());
  const [membership, games] = await Promise.all([
    ref.collection("players").doc(uid).get(),
    adminDb.getAll(
      ...Array.from({ length: room.groupCount }, (_, i) =>
        ref.collection("matches").doc(String(i)),
      ),
    ),
  ]);
  const matches = games.map((g) => matchData(g.data())),
    member = membership.data();
  const you = member
    ? { group: Number(member.group), seat: Number(member.seat) }
    : null;
  const role = teacherEmail === room.owner ? "teacher" : "student";
  return {
    code: room.code,
    groupCount: room.groupCount,
    status: room.status,
    revision: room.revision,
    expiresAt: room.expiresAt,
    role,
    groups: matches.map(matchSummary),
    you,
    player:
      you && room.status !== "lobby"
        ? playerView(matches[you.group], you.seat)
        : null,
  };
}
