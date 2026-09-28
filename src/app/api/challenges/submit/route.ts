import { submitChallenge,type SubmitInput } from "@/lib/server/challenges";
import { challengeFailure,parseChallengeBody } from "@/lib/server/challengeResponse";
import { requireContentAccess,verifyBearer } from "@/lib/server/firebaseAdmin";

export const runtime="nodejs";
export async function POST(request:Request):Promise<Response> {
  try{
    const token=await verifyBearer(request.headers.get("authorization"));requireContentAccess(token);
    const body=await parseChallengeBody(request);
    const result=await submitChallenge(token.uid,body as SubmitInput);
    return Response.json({ok:true,...result});
  }catch(error){return challengeFailure(error);}
}
