import {
  verifyBearer,
  requireContentAccess,
  requireTeacher,
  ChallengeError,
} from "@/lib/server/firebaseAdmin";
import {
  challengeFailure,
  parseChallengeBody,
} from "@/lib/server/challengeResponse";
import {
  createTugRoom,
  joinTugRoom,
  controlTugRoom,
  readTugRoom,
  moveTug,
} from "@/lib/server/polynomialTug";
import type { Move } from "@/lib/polynomial-tug/types";
import { copy } from "@/lib/copy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const response = (state: unknown) =>
  Response.json(
    { ok: true, state },
    { headers: { "Cache-Control": "no-store" } },
  );
async function actor(request: Request) {
  const token = await verifyBearer(request.headers.get("authorization"));
  requireContentAccess(token);
  return token;
}
export async function GET(request: Request) {
  try {
    const token = await actor(request),
      code = new URL(request.url).searchParams.get("code") ?? "";
    let teacher: string | null = null;
    if (token.email_verified && token.email) {
      try {
        teacher = await requireTeacher(token);
      } catch {
        /* A signed-in pupil can still join. */
      }
    }
    return response(await readTugRoom(token.uid, teacher, code));
  } catch (error) {
    return challengeFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    const token = await actor(request),
      body = await parseChallengeBody(request);
    let code = typeof body.code === "string" ? body.code : "",
      teacher: string | null = null;
    if (body.action === "create") {
      teacher = await requireTeacher(token);
      code = await createTugRoom(teacher, body.groups as number);
    } else if (
      ["start", "pause", "resume", "end"].includes(String(body.action))
    ) {
      teacher = await requireTeacher(token);
      await controlTugRoom(teacher, code, String(body.action));
    } else if (body.action === "join")
      await joinTugRoom(
        token.uid,
        code,
        body.group as number,
        body.side as number,
      );
    else if (["answer", "retry", "next"].includes(String(body.action)))
      await moveTug(token.uid, code, {
        action: body.action as Move["action"],
        questionId: body.questionId as string,
        option: body.option as number,
      });
    else
      throw new ChallengeError(
        "invalid-action",
        copy.polynomialTug.errors.move,
      );
    return response(await readTugRoom(token.uid, teacher, code));
  } catch (error) {
    return challengeFailure(error);
  }
}
