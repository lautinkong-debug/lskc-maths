"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect,useRef,useState } from "react";
import { Avatar,PaperConfetti } from "@/components/game";
import { copy } from "@/lib/copy";
import { createChallengeRoom,closeChallengeRoom,deleteChallengeRoom,extendChallengeRoom,getChallengeClassNumbers,startChallengeRoom,watchChallengeEntries,watchChallengeRoom,watchChallengeStats,type QuestionStat } from "@/lib/db/challenges";
import { type ChallengeEntry,type ChallengeRoom } from "@/lib/challenges/types";
import { challengeDefinitions } from "@/apps/challenge-definitions";
import { encodeSetCode } from "@/apps/directed-numbers/lib/setCode";
import { signedScore } from "@/lib/challenges/scoring";
import { JoinQR } from "./JoinQR";

const c=copy.challenges,p=copy.apps.directedNumbers.playLesson;
const action="border-navy bg-paper min-h-12 rounded border px-4 font-semibold text-navy hover:bg-navy-wash disabled:opacity-50";
const primary="bg-navy min-h-12 rounded px-5 font-semibold text-white disabled:opacity-50";
function sorted(entries:ChallengeEntry[]){return entries.filter((entry)=>entry.sortKey!==null).sort((a,b)=>(b.sortKey??0)-(a.sortKey??0));}
function formatLeft(ms:number){const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;}
function showMeUrl(question:{showMe:{mode:string;expression?:string}}){return `/apps/directed-numbers#${question.showMe.mode}${question.showMe.expression?`:e=${encodeURIComponent(question.showMe.expression)}`:""}`;}

function RankedList({entries,showNames}:{entries:ChallengeEntry[];showNames:ChallengeRoom["settings"]["showNames"]}){
  const positions=useRef(new Map<string,number>()),nodes=useRef(new Map<string,HTMLLIElement>());
  useEffect(()=>{
    const next=new Map<string,number>();
    for(const entry of entries){const node=nodes.current.get(entry.uid);if(!node)continue;const y=node.getBoundingClientRect().top;next.set(entry.uid,y);const prior=positions.current.get(entry.uid);if(prior!==undefined&&prior!==y&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)node.animate([{transform:`translateY(${prior-y}px)`},{transform:"translateY(0)"}],{duration:400,easing:"ease-out"});}
    positions.current=next;
  },[entries]);
  if(!entries.length)return <p>{c.noScores}</p>;
  return <ol className="space-y-2">{entries.slice(0,10).map((entry,index)=><li key={entry.uid} ref={(node)=>{if(node)nodes.current.set(entry.uid,node);else nodes.current.delete(entry.uid);}} className="border-grid bg-paper flex min-h-16 items-center gap-3 rounded border px-3 py-2"><strong className="w-8 text-xl tabular-nums">{index+1}</strong><Avatar emoji={entry.avatar} name={showNames==="avatars"?c.avatar:entry.nickname} frame={entry.frame}/><span className="min-w-0 flex-1 truncate font-semibold">{showNames==="avatars"?c.avatar:entry.nickname}</span><span className="bg-grid hidden h-3 max-w-64 flex-1 rounded sm:block"><span className="bg-navy block h-3 rounded" style={{width:`${Math.max(5,Math.min(100,((entry.bestScore??0)+100)/450*100))}%`}}/></span><strong className="font-display text-navy text-2xl tabular-nums">{signedScore(entry.bestScore??0)}</strong></li>)}{entries.length>10&&<li className="text-center">{c.morePlayers(entries.length-10)}</li>}</ol>;
}

export function ChallengeRoom({roomId}:{roomId:string}){
  const router=useRouter();
  const [room,setRoom]=useState<ChallengeRoom|null>(null),[entries,setEntries]=useState<ChallengeEntry[]>([]),[stats,setStats]=useState<QuestionStat[]>([]);
  const [loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState(false),[now,setNow]=useState(0),[origin,setOrigin]=useState("");
  const [boardHidden,setBoardHidden]=useState(false),[revealed,setRevealed]=useState(0),[showDetails,setShowDetails]=useState(false),[numbers,setNumbers]=useState<Record<string,number|null>>({});
  useEffect(()=>{
    const first=window.setTimeout(()=>{setOrigin(window.location.origin);setNow(Date.now());},0);
    const timer=window.setInterval(()=>setNow(Date.now()),1000);
    const stopRoom=watchChallengeRoom(roomId,(value)=>{setRoom(value);setLoading(false);},()=>{setError(c.roomError);setLoading(false);});
    const stopEntries=watchChallengeEntries(roomId,setEntries,()=>setError(c.roomError));
    const stopStats=watchChallengeStats(roomId,setStats,()=>setError(c.roomError));
    return()=>{window.clearTimeout(first);window.clearInterval(timer);stopRoom();stopEntries();stopStats();};
  },[roomId]);
  async function act(work:()=>Promise<unknown>){setBusy(true);setError("");try{await work();}catch(cause){setError(cause instanceof Error?cause.message:c.actionError);}finally{setBusy(false);}}
  async function details(){if(!showDetails){try{setNumbers(await getChallengeClassNumbers(roomId));}catch{setError(c.roomError);return;}}setShowDetails(!showDetails);}
  if(loading)return <main className="mx-auto max-w-6xl px-4 py-12" role="status">{c.loading}</main>;
  if(!room)return <main className="mx-auto max-w-6xl px-4 py-12"><h1 className="font-display text-navy text-3xl">{c.roomMissing}</h1><Link className="text-navy underline" href="/challenges">{c.backToChallenges}</Link></main>;
  const ranked=sorted(entries),podiumOrder=[2,1,0].filter((index)=>index<ranked.length),closed=room.status==="closed"||(now>0&&now>=room.closesAt.getTime()),left=now?formatLeft(room.closesAt.getTime()-now):"—";
  const url=origin?`${origin}/join/${room.code}`:"";
  const totalAttempts=stats.reduce((sum,item)=>sum+item.attempts,0),totalCorrect=stats.reduce((sum,item)=>sum+item.correct,0),accuracy=totalAttempts?Math.round(totalCorrect/totalAttempts*100):0;
  const questions=challengeDefinitions[room.appSlug].generate(encodeSetCode({skills:room.settings.skills,level:room.settings.level,questionCount:room.settings.questionCount,seed:room.seed}));
  const misses=stats.map((item,index)=>({...item,index,question:questions[index]})).filter((item)=>item.attempts>0).sort((a,b)=>(a.correct/a.attempts)-(b.correct/b.attempts));
  const improved=room.kind==="homework"?ranked.filter((entry)=>entry.attempts>=2&&entry.firstScore!==null).sort((a,b)=>b.improvement-a.improvement)[0]:undefined;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><Link href="/challenges" className="text-navy underline">← {c.backToChallenges}</Link><h1 className="font-display text-navy mt-2 text-4xl font-semibold">{room.title}</h1><p>{room.classTag??c.noClass} · {room.kind==="live"?c.liveNow:c.homework} · {c.level} {room.settings.level}</p></div><strong className="font-display text-navy text-3xl tabular-nums">{closed?c.results:c.timeLeft(left)}</strong></header>
    {error&&<p role="alert" className="border-crimson-deep text-crimson-deep rounded border p-3">{error}</p>}
    {!closed&&<section className="graph-paper border-grid grid gap-5 rounded border p-5 sm:grid-cols-[1fr_auto]" aria-label={c.joinCode}><div><p className="font-semibold">{c.joinAt} {origin}/join</p><p className="font-display text-navy mt-3 text-6xl font-bold tracking-widest sm:text-8xl">{room.code.slice(0,3)} {room.code.slice(3)}</p><p className="mt-3 break-all">{c.joinUrl}: <a className="text-navy underline" href={url}>{url}</a></p><p className="mt-4 text-xl font-semibold" aria-live="polite">{c.players(room.playerCount)}</p><div className="mt-3 flex flex-wrap gap-2">{entries.slice(0,12).map((entry)=><Avatar key={entry.uid} emoji={entry.avatar} name={entry.nickname} frame={entry.frame}/>)}</div></div>{url&&<JoinQR url={url}/>}</section>}
    {room.status==="lobby"&&!closed?<section className="space-y-3"><h2 className="font-display text-navy text-3xl">{c.lobby}</h2><div className="flex flex-wrap gap-2"><button className={primary} disabled={busy} onClick={()=>void act(()=>startChallengeRoom(roomId))}>{c.start}</button><button className={action} disabled={busy} onClick={()=>{if(window.confirm(c.deleteConfirm))void act(async()=>{await deleteChallengeRoom(roomId);router.push("/challenges");});}}>{c.cancelRoom}</button></div></section>:!closed?<section className="space-y-5"><div className="flex flex-wrap gap-2"><button className={action} disabled={busy} onClick={()=>void act(()=>extendChallengeRoom(roomId))}>{c.extend}</button><button className={action} disabled={busy} onClick={()=>void act(()=>closeChallengeRoom(roomId))}>{c.endNow}</button><button className={action} onClick={()=>setBoardHidden(!boardHidden)}>{boardHidden?c.showBoard:c.hideBoard}</button></div><h2 className="font-display text-navy text-3xl">{c.live}</h2>{!boardHidden&&<RankedList entries={ranked} showNames={room.settings.showNames}/>}<p>{c.classAccuracy(accuracy)} · {c.answersSoFar(totalAttempts)}</p></section>:<section className="relative space-y-6"><PaperConfetti show={podiumOrder.length>0&&revealed===podiumOrder.length} /><h2 className="font-display text-navy text-3xl">{c.podium}</h2><div className="grid gap-3 sm:grid-cols-3">{[2,1,0].map((index)=><div key={index} className={`border-grid min-h-40 rounded border p-4 text-center ${podiumOrder.includes(index)&&revealed>podiumOrder.indexOf(index)?"bg-highlight/20":"bg-paper"}`}>{podiumOrder.includes(index)&&revealed>podiumOrder.indexOf(index)&&ranked[index]?<><p className="font-display text-navy text-4xl">{index+1}</p><Avatar emoji={ranked[index].avatar} name={ranked[index].nickname} frame={ranked[index].frame}/><p className="font-semibold">{room.settings.showNames==="avatars"?c.avatar:ranked[index].nickname}</p><p className="font-display text-navy text-2xl">{signedScore(ranked[index].bestScore??0)}</p></>:<p className="font-display text-5xl text-grid-strong">?</p>}</div>)}</div>{revealed<podiumOrder.length&&<button className={primary} onClick={()=>setRevealed(revealed+1)}>{c.reveal}</button>}{improved&&<p className="border-gold rounded border p-4 text-xl"><strong>{c.mostImproved}:</strong> {improved.nickname} {signedScore(improved.improvement)}</p>}<p>{c.classAccuracy(accuracy)} · {c.answersSoFar(totalAttempts)}</p><h2 className="font-display text-navy text-2xl">{c.missedQuestions}</h2>{misses.length?<div className="space-y-2">{misses.map((item)=>{const percent=Math.round(item.correct/item.attempts*100);return <div key={item.index} className="border-grid bg-paper flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{p.question(item.index+1,questions.length)}: {item.question.promptText}</p><div className="bg-grid mt-2 h-4 w-full overflow-hidden rounded" role="meter" aria-label={c.questionAccuracy(percent,item.correct,item.attempts)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span className="bg-navy block h-full rounded" style={{width:`${percent}%`}}/></div><p className="mt-1 text-sm">{c.questionAccuracy(percent,item.correct,item.attempts)}</p></div><Link className={action} href={showMeUrl(item.question)}>{c.showMe}</Link></div>;})}</div>:<p>{c.noScores}</p>}</section>}
    {closed&&<div className="flex flex-wrap gap-2"><button className={action} onClick={()=>void details()}>{showDetails?c.hideTeacherDetails:c.teacherDetails}</button><button className={action} disabled={busy} onClick={()=>void act(async()=>{const length=room.kind==="live"?10*60_000:24*60*60_000;const result=await createChallengeRoom({title:room.title,kind:room.kind,settings:room.settings,classTag:room.classTag,closesAt:new Date(Date.now()+length)});router.push(`/challenges/${result.roomId}`);})}>{c.playAgain}</button><button className={action} disabled={busy} onClick={()=>{if(window.confirm(c.deleteConfirm))void act(async()=>{await deleteChallengeRoom(roomId);router.push("/challenges");});}}>{c.deleteRoom}</button></div>}
    {showDetails&&<div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left"><caption className="text-navy mb-2 text-left font-semibold">{c.teacherDetails}</caption><thead><tr className="border-grid border-b"><th className="p-2">{c.nickname}</th><th className="p-2">{c.classNumber}</th><th className="p-2">{p.score}</th><th className="p-2">{c.attempts}</th></tr></thead><tbody>{ranked.map((entry)=><tr key={entry.uid} className="border-grid border-b"><td className="p-2">{entry.avatar} {entry.nickname}</td><td className="p-2">{numbers[entry.uid]??"—"}</td><td className="p-2">{signedScore(entry.bestScore??0)}</td><td className="p-2">{entry.attempts}</td></tr>)}</tbody></table></div>}
  </main>;
}
