import { ChallengeError } from "./firebaseAdmin";

export async function parseChallengeBody(request:Request):Promise<Record<string,unknown>> {
  try{
    const value:unknown=await request.json();
    if(value&&typeof value==="object"&&!Array.isArray(value))return value as Record<string,unknown>;
  }catch{/* Friendly error below. */}
  throw new ChallengeError("invalid-request","Check the challenge details and try again.");
}
export function challengeFailure(error:unknown):Response {
  if(error instanceof ChallengeError)return Response.json({ok:false,code:error.code,message:error.message},{status:error.status});
  return Response.json({ok:false,code:"server-error",message:"The challenge could not be saved. Please try again."},{status:500});
}
