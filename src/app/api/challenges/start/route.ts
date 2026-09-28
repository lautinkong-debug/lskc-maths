import { startChallenge } from "@/lib/server/challenges";
import { challengeFailure,parseChallengeBody } from "@/lib/server/challengeResponse";
import { ChallengeError,requireContentAccess,verifyBearer } from "@/lib/server/firebaseAdmin";

export const runtime="nodejs";
export async function POST(request:Request):Promise<Response> {
  try{
    const token=await verifyBearer(request.headers.get("authorization"));requireContentAccess(token);
    const body=await parseChallengeBody(request);
    if(typeof body.roomId!=="string")throw new ChallengeError("invalid-room","Choose a challenge to start.");
    const result=await startChallenge(token.uid,body.roomId);
    return Response.json({ok:true,...result});
  }catch(error){return challengeFailure(error);}
}
