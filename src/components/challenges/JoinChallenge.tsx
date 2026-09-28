"use client";

import Link from "next/link";
import { useEffect,useState,Suspense,type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { ACCESS_MODE } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { Avatar,Stamp } from "@/components/game";
import { ANIMALS,ADJECTIVES,avatar,nickname,randomNickname,type NicknameIndex } from "@/lib/challenges/nicknames";
import { displayCode,normaliseCode } from "@/lib/challenges/codes";
import { findChallengeByCode,getChallengeEntry,joinChallenge,startChallengeRun,submitChallengeRun,watchChallengeEntries,watchChallengeRoom } from "@/lib/db/challenges";
import { type ChallengeEntry,type ChallengeRoom } from "@/lib/challenges/types";
import { signedScore } from "@/lib/challenges/scoring";
import { challengeDefinitions } from "@/apps/challenge-definitions";
import { challengeRunners } from "@/apps/challenge-runners";
import { useProgress,frameIndex } from "@/apps/directed-numbers/play/progress";
import { type Question } from "@/apps/directed-numbers/lib/generate";

const c=copy.challenges,p=copy.apps.directedNumbers.playLesson;
const Runner=challengeRunners["directed-numbers"];
const input="border-grid bg-paper min-h-12 w-full rounded border px-3 py-2";
const action="border-navy min-h-12 rounded border px-4 font-semibold text-navy";
const primary="bg-navy min-h-12 rounded px-5 font-semibold text-white disabled:opacity-50";
type Phase="code"|"identity"|"waiting"|"countdown"|"running"|"submitting"|"result";
type StartedRun=Awaited<ReturnType<typeof startChallengeRun>> & {startedAt:number};
type ServerResult=Awaited<ReturnType<typeof submitChallengeRun>>;
function sessionKey(roomId:string){return `lskc.challenge.run.${roomId}`;}
function progressKey(runId:string){return `lskc.challenge.progress.${runId}`;}
function resultKey(roomId:string){return `lskc.challenge.result.${roomId}`;}
function sessionGet(key:string){try{return sessionStorage.getItem(key);}catch{return null;}}
function sessionSet(key:string,value:string){try{sessionStorage.setItem(key,value);}catch{/* Continue without session storage. */}}
function sessionRemove(key:string){try{sessionStorage.removeItem(key);}catch{/* Continue without session storage. */}}
function showMeUrl(question:Question){const {mode,expression}=question.showMe;return `/apps/directed-numbers#${mode}${expression?`:e=${encodeURIComponent(expression)}`:""}`;}

export function JoinChallenge({initialCode=""}:{initialCode?:string}){
  const {loading:authLoading,joinAnonymously}=useAuth();
  const [progress,updateProgress]=useProgress();
  const [code,setCode]=useState(normaliseCode(initialCode)),[room,setRoom]=useState<ChallengeRoom|null>(null),[entries,setEntries]=useState<ChallengeEntry[]>([]);
  const [phase,setPhase]=useState<Phase>("code"),[choice,setChoice]=useState<NicknameIndex>(progress.nickname),[frame,setFrame]=useState(progress.selectedFrame),[classNumber,setClassNumber]=useState("");
  const [joinedName,setJoinedName]=useState(""),[run,setRun]=useState<StartedRun|null>(null),[count,setCount]=useState(3),[answers,setAnswers]=useState<string[]>([]),[result,setResult]=useState<ServerResult|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[now,setNow]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{
    if(!initialCode||authLoading)return;
    let active=true;
    findChallengeByCode(initialCode).then(async(found)=>{
      if(!active)return;
      if(!found||found.status==="closed"||Date.now()>=found.closesAt.getTime()){setError(c.codeError);return;}
      setRoom(found);setPhase("identity");
      const uid=auth.currentUser?.uid;
      if(uid){
        const entry=await getChallengeEntry(found.id,uid);
        if(!active||!entry)return;
        setJoinedName(entry.nickname);
        const saved=sessionGet(sessionKey(found.id));
        if(saved){try{const parsed=JSON.parse(saved) as StartedRun;if(parsed.runId&&parsed.setCode){setRun(parsed);setPhase("running");return;}}catch{/* Ignore a damaged session. */}}
        const prior=sessionGet(resultKey(found.id));
        if(prior&&entry.bestScore!==null){try{const restored=JSON.parse(prior) as {marked:ServerResult;answers:string[];run:StartedRun};setResult(restored.marked);setAnswers(restored.answers);setRun(restored.run);setPhase("result");return;}catch{/* Ignore a damaged session. */}}
        setPhase("waiting");
      }
    }).catch(()=>{if(active)setError(c.codeError);});
    return()=>{active=false;};
  },[initialCode,authLoading]);
  const roomId=room?.id;
  useEffect(()=>{
    if(!roomId)return;
    const stopRoom=watchChallengeRoom(roomId,(value)=>{if(value)setRoom(value);},()=>setError(c.roomError));
    const stopEntries=watchChallengeEntries(roomId,setEntries,()=>setError(c.roomError));
    return()=>{stopRoom();stopEntries();};
  },[roomId]);
  useEffect(()=>{
    if(phase!=="countdown")return;
    if(count===0){const timer=window.setTimeout(()=>setPhase("running"),550);return()=>window.clearTimeout(timer);}
    const timer=window.setTimeout(()=>setCount((current)=>current-1),1000);return()=>window.clearTimeout(timer);
  },[phase,count]);
  async function find(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");
    try{const found=await findChallengeByCode(code);if(!found||found.status==="closed"||Date.now()>=found.closesAt.getTime())throw new Error(c.codeError);setRoom(found);setCode(found.code);setPhase("identity");window.history.replaceState(null,"",`/join/${found.code}`);}
    catch(cause){setError(cause instanceof Error?cause.message:c.codeError);}finally{setBusy(false);}
  }
  async function join(){
    if(!room)return;setBusy(true);setError("");
    try{
      if(ACCESS_MODE==="public"&&!auth.currentUser)await joinAnonymously();
      const joined=await joinChallenge({code:room.code,nicknameIndex:choice,frame,classNumber:classNumber?Number(classNumber):null});
      setJoinedName(joined.nickname);sessionSet("lskc.challenge.roomId",joined.roomId);if(room.classTag)sessionSet("lskc.challenge.classTag",room.classTag);setPhase("waiting");
    }catch(cause){setError(cause instanceof Error?cause.message:c.codeError);}finally{setBusy(false);}
  }
  async function start(){
    if(!room)return;setBusy(true);setError("");
    try{const started={...(await startChallengeRun(room.id)),startedAt:Date.now()};setRun(started);sessionSet(sessionKey(room.id),JSON.stringify(started));sessionRemove(resultKey(room.id));setCount(3);setPhase("countdown");}
    catch(cause){setError(cause instanceof Error?cause.message:c.actionError);}finally{setBusy(false);}
  }
  async function finish(finalAnswers:string[],timings:number[]){
    if(!room||!run)return;setPhase("submitting");setAnswers(finalAnswers);setError("");
    try{const marked=await submitChallengeRun(run.runId,finalAnswers,timings);setResult(marked);sessionRemove(sessionKey(room.id));sessionRemove(progressKey(run.runId));sessionSet(resultKey(room.id),JSON.stringify({marked,answers:finalAnswers,run}));setPhase("result");
      const prior=entries.find((entry)=>entry.uid===auth.currentUser?.uid);
      updateProgress((old)=>({...old,stats:{...old.stats,classChallenge:true,podium:old.stats.podium||marked.rank<=3,mostImproved:old.stats.mostImproved||(room.kind==="homework"&&prior?.firstScore!==null&&prior?.firstScore!==undefined&&marked.score-prior.firstScore>=30)}}));
    }catch(cause){setError(cause instanceof Error?cause.message:c.actionError);setPhase("running");}
  }
  const baseQuestions=run?challengeDefinitions["directed-numbers"].generate(run.setCode):[];
  const activeQuestions=run?run.questionOrder.map((index)=>baseQuestions[index]).filter((question):question is Question=>Boolean(question)):[];
  const ranking=entries.filter((entry)=>entry.sortKey!==null).sort((a,b)=>(b.sortKey??0)-(a.sortKey??0));
  const ownIndex=ranking.findIndex((entry)=>entry.uid===auth.currentUser?.uid);
  const gap=ownIndex>0?Math.max(0,(ranking[ownIndex-1].bestScore??0)-(ranking[ownIndex].bestScore??0)):null;
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
    {phase==="code"&&<><h1 className="font-display text-navy text-4xl font-semibold">{c.joinTitle}</h1><p>{c.joinIntro}</p><form onSubmit={find} className="max-w-md space-y-3"><label className="block font-semibold">{c.enterCode}<input autoComplete="off" className={`${input} mt-1 font-mono text-2xl uppercase tracking-widest`} maxLength={8} value={displayCode(code)} onChange={(event)=>setCode(normaliseCode(event.target.value).slice(0,6))}/></label><button className={primary} disabled={busy} type="submit">{c.findRoom}</button></form></>}
    {room&&phase!=="code"&&<header><p className="font-mono text-navy text-xl font-bold tracking-widest">{displayCode(room.code)}</p><h1 className="font-display text-navy mt-1 text-4xl font-semibold">{room.title}</h1><p>{room.classTag??c.noClass} · {c.level} {room.settings.level} · {c.questions} {room.settings.questionCount}</p></header>}
    {error&&<p role="alert" className="border-crimson-deep text-crimson-deep rounded border p-3">{error}</p>}
    {room&&phase==="identity"&&<section className="border-grid bg-paper space-y-4 rounded border p-5"><h2 className="font-display text-navy text-2xl">{c.chooseIdentity}</h2><div className="flex items-center gap-3"><Avatar emoji={avatar(choice)} name={nickname(choice)} frame={frame}/><strong>{nickname(choice)}</strong><button className={action} onClick={()=>setChoice(randomNickname())}>{c.shuffle}</button></div><div className="grid gap-3 sm:grid-cols-2"><label>{c.nickname}<select className={input} value={choice[0]} onChange={(event)=>setChoice([Number(event.target.value),choice[1]])}>{ADJECTIVES.map((word,index)=><option key={word} value={index}>{word}</option>)}</select></label><label>{c.avatar}<select className={input} value={choice[1]} onChange={(event)=>setChoice([choice[0],Number(event.target.value)])}>{ANIMALS.map(([name,emoji],index)=><option key={name} value={index}>{emoji} {name}</option>)}</select></label><label>{c.frame}<select className={input} value={frame} onChange={(event)=>setFrame(Number(event.target.value))}>{Array.from({length:frameIndex(progress.xp)+1},(_,index)=><option key={index} value={index}>{index+1}</option>)}</select></label><label>{c.classNumber}<input className={input} type="number" min={1} max={45} value={classNumber} onChange={(event)=>setClassNumber(event.target.value)}/><small>{c.classNumberHelp}</small></label></div><p className="text-sm">{c.privacyNotice}</p><button className={primary} disabled={busy||authLoading} onClick={()=>void join()}>{busy?c.joining:c.join}</button></section>}
    {room&&phase==="waiting"&&<section className="graph-paper border-grid space-y-4 rounded border p-6"><h2 className="font-display text-navy text-3xl">{room.status==="lobby"?c.waiting:room.status==="closed"?c.finished:c.startRun}</h2><p>{joinedName} · {c.players(room.playerCount)}</p>{room.status==="live"&&(!now||now<room.closesAt.getTime())&&<button className={primary} disabled={busy} onClick={()=>void start()}>{busy?c.starting:c.startRun}</button>}</section>}
    {phase==="countdown"&&<section aria-live="assertive" className="graph-paper border-grid flex min-h-[50vh] items-center justify-center rounded border"><strong className="font-display text-navy text-8xl">{c.countdown(count)}</strong></section>}
    {phase==="running"&&run&&<Suspense fallback={<p>{c.loading}</p>}><Runner key={run.runId} questions={activeQuestions} timeLimitSec={run.timeLimitSec} scoring={run.scoring as "directed"|"gentle"} settings={progress.settings} avatarEmoji={entries.find((entry)=>entry.uid===auth.currentUser?.uid)?.avatar??avatar(choice)} storageKey={progressKey(run.runId)} startedAt={run.startedAt} onFinish={(final,timings)=>{void finish(final,timings);}} onExit={()=>{sessionRemove(sessionKey(room!.id));sessionRemove(progressKey(run.runId));setPhase("waiting");}} /></Suspense>}
    {phase==="submitting"&&<p role="status" className="font-display text-navy text-3xl">{c.submitting}</p>}
    {phase==="result"&&result&&<section className="space-y-5">
      <h2 className="font-display text-navy text-3xl">{c.yourResult}</h2>
      {result.personalBest&&<Stamp label={c.personalBest}/>}
      <div className="border-grid bg-paper rounded border p-5">
        <p className="font-display text-navy text-5xl font-bold">{signedScore(result.score)}</p>
        <p className="mt-3 font-semibold">{c.scoreWorking}</p>
        <p className="overflow-x-auto tabular-nums">{result.breakdown.terms.map((term)=>term.label).join(" + ")} = {signedScore(result.score)}</p>
        <p className="mt-3 text-xl">{ownIndex<0?c.gapLoading:ownIndex===0?c.topPlace:c.gap(gap??0)}</p>
        <p>{c.attemptsLeft(result.attemptsLeft)}</p>
      </div>
      <details className="border-grid rounded border p-4">
        <summary className="cursor-pointer font-semibold">{c.reviewAnswers}</summary>
        <ol className="mt-4 space-y-3">{activeQuestions.map((question,index)=>{
          const correct=challengeDefinitions["directed-numbers"].grade(question,answers[index]??"");
          return <li key={question.id} className="border-grid bg-paper rounded border p-3">
            <strong>{p.question(index+1,activeQuestions.length)}:</strong> {question.promptText}
            <p>{c.yourAnswer(answers[index]??"")}</p>
            <p className={correct?"":"text-crimson-deep font-semibold"}>{c.correctAnswer(question.answer)}</p>
            {!correct&&<Link className="text-navy underline" href={showMeUrl(question)}>{c.showMe}</Link>}
          </li>;
        })}</ol>
      </details>
      <div className="flex flex-wrap gap-2">{result.attemptsLeft>0&&room?.status==="live"&&<button className={primary} onClick={()=>{setRun(null);setResult(null);setPhase("waiting");}}>{c.nextAttempt}</button>}<Link className={action} href="/apps/directed-numbers#play">{c.returnToPlay}</Link></div>
    </section>}
  </main>;
}
