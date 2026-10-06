import { cert,getApp,getApps,initializeApp } from "firebase-admin/app";
import { getAuth,type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const emulator=process.env.NEXT_PUBLIC_USE_EMULATORS==="true"||!!process.env.FIRESTORE_EMULATOR_HOST;
if(typeof window!=="undefined")throw new Error("Firebase Admin is server-only.");
if(emulator){
  const project=process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID??"demo-lskc-maths";
  if(project!=="demo-lskc-maths")throw new Error("Emulator mode requires demo-lskc-maths.");
  process.env.FIRESTORE_EMULATOR_HOST="127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099";
}
function initializeProductionAdminApp(){
  const serviceAccountJson=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if(!serviceAccountJson)throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON for Firebase Admin in production.");
  try{return initializeApp({credential:cert(JSON.parse(serviceAccountJson))});}
  catch{throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service account.");}
}
const adminApp=getApps().length?getApp():emulator?initializeApp({projectId:"demo-lskc-maths"}):initializeProductionAdminApp();
export const adminDb=getFirestore(adminApp);
const adminAuth=getAuth(adminApp);

export class ChallengeError extends Error {
  constructor(public readonly code:string,message:string,public readonly status=400){super(message);}
}
export async function verifyBearer(header:string|null):Promise<DecodedIdToken> {
  const match=/^Bearer (\S+)$/.exec(header??"");
  if(!match)throw new ChallengeError("unauthorized","Sign in or join the challenge before trying again.",401);
  try{return await adminAuth.verifyIdToken(match[1]);}
  catch{throw new ChallengeError("unauthorized","Your session has expired. Sign in or join again.",401);}
}
export async function requireTeacher(token:DecodedIdToken):Promise<string> {
  const email=token.email?.toLowerCase(),domains=(process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS??"lskc.edu.hk").split(",").map((domain)=>domain.trim().toLowerCase());
  if(!token.email_verified||!email||!domains.includes(email.split("@")[1]))throw new ChallengeError("forbidden","This action is for teachers only.",403);
  const teacher=await adminDb.doc(`teachers/${email}`).get();
  if(!teacher.exists)throw new ChallengeError("forbidden","This action is for teachers only.",403);
  return email;
}
export function requireContentAccess(token:DecodedIdToken):void {
  if(process.env.NEXT_PUBLIC_ACCESS_MODE!=="school")return;
  const email=token.email?.toLowerCase(),domains=(process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS??"lskc.edu.hk").split(",").map((domain)=>domain.trim().toLowerCase());
  if(!token.email_verified||!email||!domains.includes(email.split("@")[1]))throw new ChallengeError("forbidden","Use your school account to join this challenge.",403);
}
