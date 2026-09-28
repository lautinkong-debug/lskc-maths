import { collection,doc,getDoc,getDocs,onSnapshot,query,updateDoc,where,writeBatch,type FirestoreDataConverter,type QueryDocumentSnapshot,type Unsubscribe } from "firebase/firestore";
import { db,auth } from "@/lib/firebase";
import { type NicknameIndex } from "@/lib/challenges/nicknames";
import { randomJoinCode } from "@/lib/challenges/codes";
import { expireAfter,seasonFor,validClassTag,validSettings } from "@/lib/challenges/logic";
import { type ChallengeRoom,type ChallengeEntry,type ClassBoard,type ChallengeKind,type ChallengeSettings } from "@/lib/challenges/types";

const toDate=(value:unknown):Date=>value&&typeof value==="object"&&"toDate" in value&&typeof value.toDate==="function"?value.toDate():new Date(0);
const roomConverter:FirestoreDataConverter<ChallengeRoom>={
  toFirestore:(room)=>{const data={...room};delete (data as Partial<ChallengeRoom>).id;return data;},
  fromFirestore:(snap:QueryDocumentSnapshot)=>{
    const data=snap.data();return {...data,id:snap.id,opensAt:toDate(data.opensAt),closesAt:toDate(data.closesAt),createdAt:toDate(data.createdAt),expireAt:toDate(data.expireAt)} as ChallengeRoom;
  },
};
const entryConverter:FirestoreDataConverter<ChallengeEntry>={
  toFirestore:(entry)=>{const data={...entry};delete (data as Partial<ChallengeEntry>).uid;return data;},
  fromFirestore:(snap:QueryDocumentSnapshot)=>{
    const data=snap.data();return {...data,uid:snap.id,joinedAt:toDate(data.joinedAt),lastSubmittedAt:data.lastSubmittedAt?toDate(data.lastSubmittedAt):null,expireAt:toDate(data.expireAt)} as ChallengeEntry;
  },
};
const boardConverter:FirestoreDataConverter<ClassBoard>={
  toFirestore:(board)=>{const data={...board};delete (data as Partial<ClassBoard>).id;return data;},
  fromFirestore:(snap:QueryDocumentSnapshot)=>({...snap.data(),id:snap.id,updatedAt:toDate(snap.data().updatedAt),expireAt:toDate(snap.data().expireAt)}) as ClassBoard,
};
const room=(id:string)=>doc(db,"rooms",id).withConverter(roomConverter);
const secureRandom=()=>crypto.getRandomValues(new Uint32Array(1))[0]/2**32;
const seed=()=>crypto.getRandomValues(new Uint32Array(1))[0]%(2**24);
export type CreateChallengeInput={title:string;kind:ChallengeKind;settings:ChallengeSettings;classTag:string|null;closesAt:Date};

export async function createChallengeRoom(input:CreateChallengeInput):Promise<{roomId:string;code:string}> {
  const user=auth.currentUser,email=user?.email?.toLowerCase();
  if(!email)throw new Error("Sign in as a teacher first.");
  const title=input.title.trim(),now=new Date();
  if(!title||title.length>60||!(input.kind==="live"||input.kind==="homework")||!validSettings(input.settings,input.kind)
    ||input.classTag!==null&&!validClassTag(input.classTag)||!(input.closesAt instanceof Date)||!Number.isFinite(input.closesAt.getTime())||input.closesAt<=now)
    throw new Error("Check the challenge settings and closing time.");
  const roomRef=doc(collection(db,"rooms")),expiry=expireAfter(input.closesAt),roomData={
    appSlug:"directed-numbers",title,kind:input.kind,settings:input.settings,seed:seed(),classTag:input.classTag,season:seasonFor(now),
    status:input.kind==="live"?"lobby":"live",opensAt:now,closesAt:input.closesAt,createdBy:email,createdAt:now,expireAt:expiry,playerCount:0,
  };
  for(let attempt=0;attempt<8;attempt++){
    const code=randomJoinCode(secureRandom),codeRef=doc(db,"roomCodes",code);
    if((await getDoc(codeRef)).exists())continue;
    const batch=writeBatch(db);
    batch.set(roomRef,{...roomData,code});batch.set(codeRef,{roomId:roomRef.id,expireAt:expiry});
    try{await batch.commit();return {roomId:roomRef.id,code};}
    catch(error){if(attempt===7)throw error;}
  }
  throw new Error("Could not make a unique join code. Try again.");
}
export async function startChallengeRoom(roomId:string):Promise<void> {await updateDoc(room(roomId),{status:"live"} as Partial<ChallengeRoom>);}
export async function closeChallengeRoom(roomId:string):Promise<void> {await callApi(`/api/challenges/rooms/${encodeURIComponent(roomId)}`,"PATCH",{action:"close"});}
export async function extendChallengeRoom(roomId:string,seconds=120):Promise<void> {
  if(seconds!==120)throw new Error("Extend adds two minutes.");
  await callApi(`/api/challenges/rooms/${encodeURIComponent(roomId)}`,"PATCH",{action:"extend"});
}
export async function getChallengeRoom(roomId:string):Promise<ChallengeRoom|null> {
  const snapshot=await getDoc(room(roomId));return snapshot.exists()?snapshot.data():null;
}
export async function listTeacherChallenges(email:string):Promise<ChallengeRoom[]> {
  const snapshot=await getDocs(query(collection(db,"rooms").withConverter(roomConverter),where("createdBy","==",email.toLowerCase())));
  return snapshot.docs.map((item)=>item.data()).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
}
export function watchChallengeRoom(roomId:string,onChange:(value:ChallengeRoom|null)=>void,onError:(error:Error)=>void):Unsubscribe {
  return onSnapshot(room(roomId),(snap)=>onChange(snap.exists()?snap.data():null),onError);
}
export function watchChallengeEntries(roomId:string,onChange:(value:ChallengeEntry[])=>void,onError:(error:Error)=>void):Unsubscribe {
  return onSnapshot(collection(db,"rooms",roomId,"entries").withConverter(entryConverter),(snap)=>onChange(snap.docs.map((item)=>item.data())),onError);
}
export function watchClassBoard(id:string,onChange:(value:ClassBoard|null)=>void,onError:(error:Error)=>void):Unsubscribe {
  return onSnapshot(doc(db,"classBoards",id).withConverter(boardConverter),(snap)=>onChange(snap.exists()?snap.data():null),onError);
}
async function callApi<T>(path:string,method:"POST"|"PATCH"|"DELETE",body?:object):Promise<T> {
  const token=await auth.currentUser?.getIdToken();if(!token)throw new Error("Join or sign in first.");
  const response=await fetch(path,{method,headers:{authorization:`Bearer ${token}`,...(body?{"content-type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
  const result=await response.json() as T & {ok:boolean;message?:string};
  if(!response.ok||!result.ok)throw new Error(result.message??"The challenge request failed.");
  return result;
}
export const joinChallenge=(body:{code:string;nicknameIndex:NicknameIndex;frame:number;classNumber?:number|null})=>callApi<{roomId:string;nickname:string}>("/api/challenges/join","POST",body);
export const startChallengeRun=(roomId:string)=>callApi<{runId:string;setCode:string;questionOrder:number[];timeLimitSec:number|null;scoring:string}>("/api/challenges/start","POST",{roomId});
export const submitChallengeRun=(runId:string,answers:string[],clientTimingsMs?:number[])=>callApi<{score:number;breakdown:import("@/lib/challenges/scoring").ScoreBreakdown;rank:number;playerCount:number;personalBest:boolean;attemptsLeft:number}>("/api/challenges/submit","POST",{runId,answers,clientTimingsMs});
export const deleteChallengeRoom=(roomId:string)=>callApi<{ok:true}>(`/api/challenges/rooms/${encodeURIComponent(roomId)}`,"DELETE");
