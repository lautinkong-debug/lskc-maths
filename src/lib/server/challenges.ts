import { randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { challengeDefinitions } from "@/apps/challenge-definitions";
import { encodeSetCode } from "@/apps/directed-numbers/lib/setCode";
import { avatar,nickname,validNicknameIndex,type NicknameIndex } from "@/lib/challenges/nicknames";
import { normaliseCode,validJoinCode } from "@/lib/challenges/codes";
import { expireAfter,questionOrder,sortKey } from "@/lib/challenges/logic";
import { scoreRun,type Mark } from "@/lib/challenges/scoring";
import { type ChallengeRoom,type ChallengeEntry } from "@/lib/challenges/types";
import { adminDb,ChallengeError } from "./firebaseAdmin";

const at=(value:Date)=>Timestamp.fromDate(value);
const date=(value:unknown):Date=>value instanceof Timestamp?value.toDate():value instanceof Date?value:new Date(0);
const fail=(code:string,message:string,status=400):never=>{throw new ChallengeError(code,message,status);};
type RoomData=Omit<ChallengeRoom,"id"|"opensAt"|"closesAt"|"createdAt"|"expireAt"> & {opensAt:Timestamp;closesAt:Timestamp;createdAt:Timestamp;expireAt:Timestamp};
type EntryData=Omit<ChallengeEntry,"uid"|"joinedAt"|"lastSubmittedAt"|"expireAt"> & {joinedAt:Timestamp;lastSubmittedAt:Timestamp|null;expireAt:Timestamp;lastStartedAt?:Timestamp|null};
type RunData={uid:string;attemptNo:number;startedAt:Timestamp;submittedAt:Timestamp|null;questionOrder:number[];expireAt:Timestamp;score?:number;marks?:Mark[]};
const roomRef=(id:string)=>adminDb.collection("rooms").doc(id);

export type JoinInput={code:string;nicknameIndex:NicknameIndex;frame:number;classNumber?:number|null};
export async function joinChallenge(uid:string,input:JoinInput):Promise<{roomId:string;nickname:string}> {
  if(!uid||typeof uid!=="string")fail("unauthorized","Join the challenge before trying again.",401);
  if(typeof input.code!=="string"||!validJoinCode(input.code))fail("invalid-code","Enter the six-character join code.");
  if(!Array.isArray(input.nicknameIndex)||!validNicknameIndex(input.nicknameIndex))fail("invalid-name","Choose a nickname and avatar.");
  if(!Number.isInteger(input.frame)||input.frame<0||input.frame>3)fail("invalid-avatar","Choose an available avatar frame.");
  if(input.classNumber!=null&&(!Number.isInteger(input.classNumber)||input.classNumber<1||input.classNumber>45))fail("invalid-class-number","Use a class number from 1 to 45.");
  const code=normaliseCode(input.code),now=new Date();
  const codeRef=adminDb.collection("roomCodes").doc(code);
  return adminDb.runTransaction(async(transaction)=>{
    const codeDoc=await transaction.get(codeRef);
    if(!codeDoc.exists)fail("code-not-found","That code doesn't match an open challenge. Check it with your teacher.",404);
    const roomId=String(codeDoc.get("roomId")??""),ref=roomRef(roomId),roomDoc=await transaction.get(ref);
    if(!roomDoc.exists)fail("code-not-found","That challenge is no longer available.",404);
    const room=roomDoc.data() as RoomData;
    if(room.code!==code||room.status==="closed"||now>=date(room.closesAt)||now>=date(codeDoc.get("expireAt")))fail("closed","This challenge has closed. Ask your teacher for a new code.");
    if(room.kind==="homework"&&now<date(room.opensAt))fail("not-open","This homework challenge has not opened yet.");
    if(room.kind==="live"&&!(["lobby","live"] as string[]).includes(room.status))fail("closed","This challenge is not open.");
    const entries=ref.collection("entries"),entryRef=entries.doc(uid),entryDoc=await transaction.get(entryRef);
    if(entryDoc.exists)return {roomId,nickname:String(entryDoc.get("nickname"))};
    if(room.playerCount>=60)fail("room-full","This challenge already has 60 players.");
    const all=await transaction.get(entries),used=new Set(all.docs.map((doc)=>String(doc.get("nickname"))));
    const base=nickname(input.nicknameIndex),display=used.has(base)?Array.from({length:60},(_,i)=>`${base} ${i+2}`).find((name)=>!used.has(name)):base;
    const chosen=display??fail("room-full","This challenge already has 60 players.");
    const entry:EntryData={nickname:chosen,avatar:avatar(input.nicknameIndex),frame:input.frame,joinedAt:at(now),attempts:0,firstScore:null,bestScore:null,bestAccuracy:null,bestElapsedMs:null,improvement:0,sortKey:null,lastSubmittedAt:null,lastStartedAt:null,expireAt:room.expireAt};
    transaction.create(entryRef,entry);
    transaction.create(ref.collection("private").doc(uid),{classNumber:input.classNumber??null,expireAt:room.expireAt});
    transaction.update(ref,{playerCount:room.playerCount+1});
    return {roomId,nickname:chosen};
  });
}

export async function startChallenge(uid:string,roomId:string):Promise<{runId:string;setCode:string;questionOrder:number[];timeLimitSec:number|null;scoring:string}> {
  if(!/^[A-Za-z0-9]{10,30}$/.test(roomId))fail("invalid-room","That challenge does not exist.");
  const ref=roomRef(roomId),now=new Date(),runId=`${roomId}.${randomUUID()}`;
  return adminDb.runTransaction(async(transaction)=>{
    const roomDoc=await transaction.get(ref),entryRef=ref.collection("entries").doc(uid),entryDoc=await transaction.get(entryRef);
    if(!roomDoc.exists||!entryDoc.exists)fail("not-joined","Join this challenge before you start.",403);
    const room=roomDoc.data() as RoomData,entry=entryDoc.data() as EntryData;
    if(room.status!=="live"||now<date(room.opensAt)||now>=date(room.closesAt))fail("not-live","This challenge is not running now.");
    if(entry.attempts>=room.settings.maxAttempts)fail("attempts-used","You have used all your attempts.");
    if(entry.lastStartedAt&&now.getTime()-date(entry.lastStartedAt).getTime()<20_000)fail("too-soon","Wait a moment before starting another attempt.",429);
    const order=questionOrder(room.settings.questionCount,room.seed,uid,room.settings.order==="shuffled");
    const setCode=encodeSetCode({skills:room.settings.skills,level:room.settings.level,questionCount:room.settings.questionCount,seed:room.seed});
    const run:RunData={uid,attemptNo:entry.attempts+1,startedAt:at(now),submittedAt:null,questionOrder:order,expireAt:room.expireAt};
    transaction.create(ref.collection("runs").doc(runId),run);
    transaction.update(entryRef,{attempts:entry.attempts+1,lastStartedAt:at(now)});
    return {runId,setCode,questionOrder:order,timeLimitSec:room.settings.timeLimitSec,scoring:room.settings.scoring};
  });
}

export type SubmitInput={runId:string;answers:string[];clientTimingsMs?:number[];score?:number};
export async function submitChallenge(uid:string,input:SubmitInput):Promise<{score:number;breakdown:ReturnType<typeof scoreRun>;rank:number;playerCount:number;personalBest:boolean;attemptsLeft:number}> {
  if(typeof input.runId!=="string"||!/^([A-Za-z0-9]{10,30})\.[0-9a-f-]{36}$/.test(input.runId))fail("invalid-run","That run does not exist.");
  if(!Array.isArray(input.answers)||input.answers.length>20||input.answers.some((answer)=>typeof answer!=="string"||answer.length>80))fail("invalid-answers","Check the answers and try again.");
  const roomId=input.runId.split(".")[0],ref=roomRef(roomId),runRef=ref.collection("runs").doc(input.runId);
  const [roomDoc,runDoc]=await Promise.all([ref.get(),runRef.get()]);
  if(!roomDoc.exists||!runDoc.exists)fail("invalid-run","That run does not exist.",404);
  const room=roomDoc.data() as RoomData,run=runDoc.data() as RunData,now=new Date();
  if(run.uid!==uid)fail("not-your-run","This run belongs to another player.",403);
  if(run.submittedAt)fail("already-submitted","This run has already been submitted.");
  const elapsedMs=Math.max(0,now.getTime()-date(run.startedAt).getTime());
  if(room.settings.timeLimitSec!==null&&elapsedMs>room.settings.timeLimitSec*1000+15000)fail("late","Time is up for this run.");
  if(now.getTime()>date(room.closesAt).getTime()+15000)fail("closed","This challenge has closed.");
  const definition=challengeDefinitions[room.appSlug];
  if(!definition)fail("unknown-app","This challenge app is unavailable.");
  const setCode=encodeSetCode({skills:room.settings.skills,level:room.settings.level,questionCount:room.settings.questionCount,seed:room.seed});
  const base=definition.generate(setCode),questions=run.questionOrder.map((index)=>base[index]);
  if(input.answers.length!==questions.length||questions.some((question)=>!question))fail("invalid-answers","Answer every question or leave it blank to skip.");
  const marks:Mark[]=questions.map((question,index)=>!input.answers[index].trim()?"skipped":definition.grade(question,input.answers[index])?"correct":"wrong");
  const breakdown=scoreRun(marks,room.settings.scoring,room.settings.timeLimitSec===null?null:elapsedMs/1000);
  const accuracy=breakdown.correct/questions.length;
  const statsRef=ref.collection("stats").doc("questions"),entryRef=ref.collection("entries").doc(uid);
  const boardRef=adminDb.collection("classBoards").doc(`${room.appSlug}_L${room.settings.level}_${room.season}`);
  const result=await adminDb.runTransaction(async(transaction)=>{
    const [currentRun,currentRoom,entryDoc,statsDoc,boardDoc]=await Promise.all([
      transaction.get(runRef),transaction.get(ref),transaction.get(entryRef),transaction.get(statsRef),transaction.get(boardRef),
    ]);
    if(!currentRun.exists||currentRun.get("submittedAt"))fail("already-submitted","This run has already been submitted.");
    if(!currentRoom.exists||!entryDoc.exists)fail("not-joined","The challenge or player is missing.");
    const entry=entryDoc.data() as EntryData;
    if(entry.attempts<run.attemptNo)fail("invalid-run","That attempt was not started.");
    const priorBest=entry.bestScore;
    const better=priorBest===null||breakdown.total>priorBest||breakdown.total===priorBest&&(
      accuracy>(entry.bestAccuracy??-1)||accuracy===entry.bestAccuracy&&(elapsedMs<(entry.bestElapsedMs??Infinity)||elapsedMs===entry.bestElapsedMs&&now<date(entry.lastSubmittedAt))
    );
    const bestScore=better?breakdown.total:priorBest!,bestAccuracy=better?accuracy:entry.bestAccuracy!,bestElapsedMs=better?elapsedMs:entry.bestElapsedMs;
    const key=better?sortKey(bestScore,breakdown.correct,questions.length,room.settings.timeLimitSec===null?null:elapsedMs,now,date(room.opensAt),date(room.closesAt)):entry.sortKey;
    const firstScore=entry.firstScore??breakdown.total;
    transaction.update(runRef,{submittedAt:at(now),score:breakdown.total,marks});
    transaction.update(entryRef,{firstScore,bestScore,bestAccuracy,bestElapsedMs,improvement:Math.max(0,bestScore-firstScore),sortKey:key,lastSubmittedAt:at(now)});
    if(run.attemptNo===1){
      const current=(statsDoc.get("perQuestion") as Array<{attempts:number;correct:number}>|undefined)??Array.from({length:questions.length},()=>({attempts:0,correct:0}));
      const perQuestion=current.map((item,index)=>{
        const runIndex=run.questionOrder.indexOf(index);
        return {attempts:item.attempts+1,correct:item.correct+(marks[runIndex]==="correct"?1:0)};
      });
      transaction.set(statsRef,{perQuestion,expireAt:room.expireAt});
    }
    if(room.classTag){
      const classes=(boardDoc.get("classes") as Record<string,{players:number;totalBest:number}>|undefined)??{};
      const previous=classes[room.classTag]??{players:0,totalBest:0};
      classes[room.classTag]={players:previous.players+(priorBest===null?1:0),totalBest:previous.totalBest+(priorBest===null?bestScore:bestScore-priorBest)};
      const priorExpiry=date(boardDoc.get("expireAt"));
      transaction.set(boardRef,{classes,updatedAt:at(now),expireAt:at(priorExpiry>date(room.expireAt)?priorExpiry:date(room.expireAt))});
    }
    return {sortKey:key,personalBest:better,attemptsLeft:Math.max(0,room.settings.maxAttempts-entry.attempts),playerCount:room.playerCount};
  });
  const higher=await ref.collection("entries").where("sortKey",">",result.sortKey).count().get();
  return {score:breakdown.total,breakdown,rank:higher.data().count+1,playerCount:result.playerCount,personalBest:result.personalBest,attemptsLeft:result.attemptsLeft};
}

/** Close or extend a room, then align every existing child document's TTL with its closing date. */
export async function changeChallengeClosing(roomId:string,action:"close"|"extend"):Promise<void> {
  if(!/^[A-Za-z0-9]{10,30}$/.test(roomId))fail("invalid-room","That challenge does not exist.");
  const ref=roomRef(roomId),snapshot=await ref.get();
  if(!snapshot.exists)fail("not-found","That challenge no longer exists.",404);
  const room=snapshot.data() as RoomData,now=new Date();
  if(action==="extend"&&(room.status==="closed"||now>=date(room.closesAt)))fail("closed","This challenge has already closed.");
  const closesAt=action==="close"?new Date(Math.min(now.getTime(),date(room.closesAt).getTime())):new Date(date(room.closesAt).getTime()+120_000);
  const expiry=at(expireAfter(closesAt));
  const first=adminDb.batch();
  first.update(ref,{status:action==="close"?"closed":room.status,closesAt:at(closesAt),expireAt:expiry});
  if(action==="close")first.delete(adminDb.collection("roomCodes").doc(room.code));
  else first.update(adminDb.collection("roomCodes").doc(room.code),{expireAt:expiry});
  await first.commit();
  const groups=await Promise.all(["entries","private","runs","stats"].map((name)=>ref.collection(name).get()));
  const documents=groups.flatMap((group)=>group.docs);
  for(let offset=0;offset<documents.length;offset+=400){
    const batch=adminDb.batch();
    for(const document of documents.slice(offset,offset+400))batch.update(document.ref,{expireAt:expiry});
    await batch.commit();
  }
}

export async function deleteChallengeRoom(roomId:string):Promise<void> {
  const ref=roomRef(roomId),roomDoc=await ref.get();
  if(!roomDoc.exists)fail("not-found","That challenge no longer exists.",404);
  const code=String(roomDoc.get("code")??"");
  if(code)await adminDb.collection("roomCodes").doc(code).delete();
  await adminDb.recursiveDelete(ref);
}
