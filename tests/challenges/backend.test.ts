import { afterAll,beforeAll,describe,expect,it } from "vitest";
import { Timestamp } from "firebase-admin/firestore";
import { encodeSetCode } from "@/apps/directed-numbers/lib/setCode";
import { challengeDefinitions } from "@/apps/challenge-definitions";
import { adminDb,ChallengeError } from "@/lib/server/firebaseAdmin";
import { changeChallengeClosing,deleteChallengeRoom,joinChallenge,startChallenge,submitChallenge } from "@/lib/server/challenges";
import { expireAfter,questionOrder,seasonFor,sortKey } from "@/lib/challenges/logic";

if(process.env.FIRESTORE_EMULATOR_HOST===undefined||process.env.GCLOUD_PROJECT!=="demo-lskc-maths")
  throw new Error("Challenge tests require the demo Firestore emulator.");

const roomId="challengeTestRoom123",code="TEST23",ref=adminDb.collection("rooms").doc(roomId);
const now=()=>new Date(),ts=(date:Date)=>Timestamp.fromDate(date);
async function fixture(options:{status?:"lobby"|"live"|"closed";closesAt?:Date;maxAttempts?:number;order?:"same"|"shuffled"}={}) {
  await adminDb.recursiveDelete(ref).catch(()=>undefined);
  await adminDb.collection("roomCodes").doc(code).delete();
  await adminDb.collection("classBoards").doc("directed-numbers_L1_2026-27-T1").delete();
  const start=now(),closesAt=options.closesAt??new Date(start.getTime()+3600000),expireAt=expireAfter(closesAt);
  await ref.set({code,appSlug:"directed-numbers",title:"Stage F test",kind:"live",settings:{skills:["addSubtract"],level:1,questionCount:5,timeLimitSec:60,scoring:"directed",order:options.order??"same",maxAttempts:options.maxAttempts??2,showNames:"top10"},seed:12345,classTag:"1A",season:"2026-27-T1",status:options.status??"live",opensAt:ts(start),closesAt:ts(closesAt),createdBy:"teacher2@lskc.edu.hk",createdAt:ts(start),expireAt:ts(expireAt),playerCount:0});
  await adminDb.collection("roomCodes").doc(code).set({roomId,expireAt:ts(expireAt)});
}
const join=(uid:string)=>joinChallenge(uid,{code,nicknameIndex:[23,0],frame:0,classNumber:12});
const answers=()=>challengeDefinitions["directed-numbers"].generate(encodeSetCode({skills:["addSubtract"],level:1,questionCount:5,seed:12345})).map((question)=>question.answer);
async function errorCode(operation:Promise<unknown>):Promise<string> {try{await operation;return "none";}catch(error){expect(error).toBeInstanceOf(ChallengeError);return (error as ChallengeError).code;}}

describe("challenge backend on the demo emulator",()=>{
  beforeAll(async()=>{await fixture();});
  afterAll(async()=>{await adminDb.recursiveDelete(ref).catch(()=>undefined);await adminDb.collection("roomCodes").doc(code).delete();await adminDb.collection("classBoards").doc("directed-numbers_L1_2026-27-T1").delete();});
  it("joins, starts, re-marks and updates private/public results and the class board",async()=>{
    const first=await join("student-one"),second=await join("student-two");
    expect(first.nickname).toBe("Swift Fox");expect(second.nickname).toBe("Swift Fox 2");
    expect((await ref.collection("private").doc("student-one").get()).get("classNumber")).toBe(12);
    const run=await startChallenge("student-one",roomId);
    expect(run.questionOrder).toEqual([0,1,2,3,4]);
    const result=await submitChallenge("student-one",{runId:run.runId,answers:answers(),score:99999,clientTimingsMs:[0,0,0,0,0]});
    expect(result.breakdown.correct).toBe(5);expect(result.score).toBeLessThan(99999);expect(result.rank).toBe(1);expect(result.personalBest).toBe(true);
    const entry=(await ref.collection("entries").doc("student-one").get()).data()!;
    expect(entry.bestScore).toBe(result.score);expect(entry.email).toBeUndefined();expect(entry.classNumber).toBeUndefined();
    const board=(await adminDb.collection("classBoards").doc("directed-numbers_L1_2026-27-T1").get()).data()!;
    expect(board.classes["1A"]).toEqual({players:1,totalBest:result.score});
    expect((await ref.collection("stats").doc("questions").get()).get("perQuestion")).toEqual(Array.from({length:5},()=>({attempts:1,correct:1})));
    expect(await errorCode(submitChallenge("student-one",{runId:run.runId,answers:answers()}))).toBe("already-submitted");
  },30000);
  it("rejects another player's run and a late run",async()=>{
    await fixture();await join("owner");await join("other");
    const run=await startChallenge("owner",roomId);
    expect(await errorCode(submitChallenge("other",{runId:run.runId,answers:answers()}))).toBe("not-your-run");
    await ref.collection("runs").doc(run.runId).update({startedAt:ts(new Date(Date.now()-76000))});
    expect(await errorCode(submitChallenge("owner",{runId:run.runId,answers:answers()}))).toBe("late");
  });
  it("limits starts and rejects closed or expired codes",async()=>{
    await fixture({maxAttempts:1});await join("owner");await startChallenge("owner",roomId);
    expect(await errorCode(startChallenge("owner",roomId))).toBe("attempts-used");
    expect(await errorCode(joinChallenge("bad-request",{code:undefined,nicknameIndex:[23,0],frame:0} as unknown as Parameters<typeof joinChallenge>[1]))).toBe("invalid-code");
    await fixture({status:"closed"});expect(await errorCode(join("late"))).toBe("closed");
    await fixture({closesAt:new Date(Date.now()-1000)});expect(await errorCode(join("expired"))).toBe("closed");
  });
  it("uses deterministic shuffled orders and a numeric tie key",async()=>{
    await fixture({order:"shuffled"});await join("owner");
    const run=await startChallenge("owner",roomId);
    expect(run.questionOrder).toEqual(questionOrder(5,12345,"owner",true));
    expect([...run.questionOrder].sort()).toEqual([0,1,2,3,4]);
    const start=new Date("2026-09-28T00:00:00Z"),end=new Date(start.getTime()+3600000);
    expect(sortKey(10,5,5,1000,start,start,end)).toBeGreaterThan(sortKey(10,4,5,1000,start,start,end));
    expect(sortKey(10,5,5,1000,start,start,end)).toBeGreaterThan(sortKey(10,5,5,1010,start,start,end));
    expect(sortKey(10,5,5,1000,start,start,end)).toBeGreaterThan(sortKey(10,5,5,1000,new Date(start.getTime()+1000),start,end));
    expect(seasonFor(new Date("2026-08-31T17:00:00Z"))).toBe("2026-27-T1");
    expect(seasonFor(new Date("2026-01-31T17:00:00Z"))).toBe("2025-26-T2");
    expect(seasonFor(new Date("2026-02-01T00:00:00Z"))).toBe("2025-26-T2");
  });
  it("deletes the code and all room subcollections",async()=>{
    await fixture();await join("owner");await startChallenge("owner",roomId);
    await deleteChallengeRoom(roomId);
    expect((await ref.get()).exists).toBe(false);
    expect((await adminDb.collection("roomCodes").doc(code).get()).exists).toBe(false);
    expect((await ref.collection("entries").doc("owner").get()).exists).toBe(false);
  });
  it("extends and closes with matching child expiry dates",async()=>{
    await fixture();await join("owner");await startChallenge("owner",roomId);
    const before=(await ref.get()).get("expireAt") as Timestamp;
    await changeChallengeClosing(roomId,"extend");
    const extended=(await ref.get()).get("expireAt") as Timestamp;
    expect(extended.toMillis()-before.toMillis()).toBe(120000);
    expect(((await ref.collection("entries").doc("owner").get()).get("expireAt") as Timestamp).toMillis()).toBe(extended.toMillis());
    expect(((await adminDb.collection("roomCodes").doc(code).get()).get("expireAt") as Timestamp).toMillis()).toBe(extended.toMillis());
    await changeChallengeClosing(roomId,"close");
    const closed=(await ref.get()).get("expireAt") as Timestamp;
    expect(closed.toMillis()).toBeLessThan(extended.toMillis());
    for(const group of ["entries","private","runs"]){
      const document=(await ref.collection(group).limit(1).get()).docs[0];
      expect((document.get("expireAt") as Timestamp).toMillis()).toBe(closed.toMillis());
    }
    expect((await adminDb.collection("roomCodes").doc(code).get()).exists).toBe(false);
  });
});
