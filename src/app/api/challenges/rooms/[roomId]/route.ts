import { changeChallengeClosing,deleteChallengeRoom } from "@/lib/server/challenges";
import { challengeFailure,parseChallengeBody } from "@/lib/server/challengeResponse";
import { ChallengeError,requireTeacher,verifyBearer } from "@/lib/server/firebaseAdmin";

export const runtime="nodejs";
export async function DELETE(request:Request,{params}:{params:Promise<{roomId:string}>}):Promise<Response> {
  try{
    const token=await verifyBearer(request.headers.get("authorization"));await requireTeacher(token);
    const {roomId}=await params;
    await deleteChallengeRoom(roomId);
    return Response.json({ok:true});
  }catch(error){return challengeFailure(error);}
}
export async function PATCH(request:Request,{params}:{params:Promise<{roomId:string}>}):Promise<Response> {
  try{
    const token=await verifyBearer(request.headers.get("authorization"));await requireTeacher(token);
    const {roomId}=await params,body=await parseChallengeBody(request);
    if(body.action!=="close"&&body.action!=="extend")throw new ChallengeError("invalid-action","Choose Close or Extend.");
    await changeChallengeClosing(roomId,body.action);
    return Response.json({ok:true});
  }catch(error){return challengeFailure(error);}
}
