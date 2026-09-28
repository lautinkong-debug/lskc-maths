"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { Hud,PaperConfetti,Stamp,StarRating } from "@/components/game";
import { useHaptics,useSound } from "@/components/game/effects";
import { scoreRun,signedScore,type Mark,type ScoreBreakdown } from "@/lib/challenges/scoring";
import { button,primary } from "../../components/ui";
import { liftQuestion,mathTex,mulberry32 } from "../../lib/generate";
import { type GameSettings } from "../progress";

const c=copy.apps.directedNumbers.playLesson;
const FLOORS=Array.from({length:16},(_,index)=>10-index);
export const floorLabel=(floor:number) => floor===0?"G":floor<0?`B${-floor}`:`${floor}/F`;
export function liftStars(correct:number,marks:readonly Mark[],relaxed:boolean):number {
  if (relaxed) {
    const accuracy=marks.length ? correct/marks.length : 0;
    return accuracy===1?3:accuracy>=.8?2:accuracy>=.6?1:0;
  }
  return correct>=16?3:correct>=12?2:correct>=8?1:0;
}
export default function LiftRush({level,settings,onComplete,onExit,avatarEmoji="🦊"}:{level:1|2|3;settings:GameSettings;onComplete:(result:{score:ScoreBreakdown;stars:number})=>void;onExit:()=>void;avatarEmoji?:string}) {
  const random=useRef(mulberry32((Date.now() ^ Math.floor(Math.random()*2**24))>>>0));
  const [floor,setFloor]=useState(1),[selected,setSelected]=useState(1),[question,setQuestion]=useState(()=>liftQuestion(1,level,random.current));
  const [marks,setMarks]=useState<Mark[]>([]),[feedback,setFeedback]=useState<"correct"|"wrong"|null>(null),[chosen,setChosen]=useState<number|null>(null),[remaining,setRemaining]=useState(60),[done,setDone]=useState(false),[lastScore,setLastScore]=useState<ScoreBreakdown|null>(null),[lastStars,setLastStars]=useState(0);
  const started=useRef(0),finished=useRef(false),motion=useRef<number[]>([]);
  const sound=useSound(settings.sound),haptic=useHaptics(settings.vibration);
  let streak=0;for(let i=marks.length-1;i>=0&&marks[i]==="correct";i--)streak++;
  const score=scoreRun(marks,"directed",null).total;
  useEffect(()=>{started.current=Date.now();},[]);
  const finish=useCallback((finalMarks:Mark[])=>{
    if(finished.current)return;finished.current=true;
    const elapsed=settings.relaxed?null:Math.min(60,(Date.now()-started.current)/1000);
    const breakdown=scoreRun(finalMarks,"directed",elapsed);
    const starCount=liftStars(breakdown.correct,finalMarks,settings.relaxed);
    setLastScore(breakdown);setLastStars(starCount);setDone(true);onComplete({score:breakdown,stars:starCount});
  },[settings.relaxed,onComplete]);
  useEffect(()=>{
    if (settings.relaxed||done) return;
    const timer=window.setInterval(()=>setRemaining(Math.max(0,60-Math.floor((Date.now()-started.current)/1000))),200);
    return ()=>window.clearInterval(timer);
  },[settings.relaxed,done]);
  useEffect(()=>{if(!settings.relaxed&&remaining===0&&!done) finish(marks);},[remaining,settings.relaxed,done,marks,finish]);
  useEffect(()=>()=>{motion.current.forEach(clearTimeout);},[]);
  function moveCar(target:number) {
    const reduced=settings.reduceMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){setFloor(target);return;}
    const direction=target>floor?1:-1;
    for(let step=1;step<=Math.abs(target-floor);step++) motion.current.push(window.setTimeout(()=>setFloor(floor+direction*step),step*80));
  }
  function choose(destination:number) {
    if(feedback||done)return;
    setChosen(destination);
    const right=destination===question.target,mark:Mark=right?"correct":"wrong";
    const nextMarks=[...marks,mark];setMarks(nextMarks);setFeedback(mark);moveCar(question.target);
    sound(right?(streak>=2?"streak":"correct"):"wrong");haptic(right?"correct":"wrong");
    if(settings.relaxed&&nextMarks.length>=12) motion.current.push(window.setTimeout(()=>finish(nextMarks),Math.abs(question.target-floor)*80+450));
    if(!settings.relaxed) motion.current.push(window.setTimeout(()=>nextPassenger(question.target),Math.abs(question.target-floor)*80+700));
  }
  function nextPassenger(current:number) {
    if(finished.current)return;
    setFloor(current);setSelected(current);setQuestion(liftQuestion(current,level,random.current));setChosen(null);setFeedback(null);
  }
  function restart() {
    motion.current.forEach(clearTimeout);motion.current=[];finished.current=false;started.current=Date.now();setFloor(1);setSelected(1);setQuestion(liftQuestion(1,level,random.current));setMarks([]);setFeedback(null);setChosen(null);setRemaining(60);setDone(false);setLastScore(null);setLastStars(0);
  }
  function keyDown(event:React.KeyboardEvent<HTMLElement>) {
    if(event.target instanceof HTMLInputElement||event.target instanceof HTMLButtonElement)return;
    if(event.key==="ArrowUp"){event.preventDefault();setSelected(Math.min(10,selected+1));}
    if(event.key==="ArrowDown"){event.preventDefault();setSelected(Math.max(-5,selected-1));}
    if(event.key==="Enter"){event.preventDefault();choose(selected);}
  }
  if(done&&lastScore) return <section className="relative space-y-5" aria-label={c.liftFinish}>
    <PaperConfetti show={lastStars===3}/><h2 className="font-display text-navy text-3xl font-bold">{c.liftFinish}</h2>
    <div className="border-grid bg-paper rounded border p-5 shadow-sm"><StarRating count={lastStars}/><p>{c.score} <strong className="font-display text-3xl">{signedScore(lastScore.total)}</strong></p><p>{lastScore.terms.map((term)=>term.label).join(" + ")} = {signedScore(lastScore.total)}</p><p>{c.earned(lastScore.positiveEarned)}</p>{lastStars===3&&<Stamp label={c.threeStars}/>}</div>
    <div className="flex flex-wrap gap-2"><button className={primary} onClick={restart}>{c.tryAgain}</button><button className={button} onClick={onExit}>{c.back}</button></div>
  </section>;
  const display=level===3&&marks.length%2===0?question.expression.replace(/^\(([^)]+)\)/,"$1"):question.expression;
  return <section tabIndex={0} onKeyDown={keyDown} className="min-w-0 space-y-4" aria-label={c.liftTitle}>
    <Hud score={score} index={marks.length+1} total={settings.relaxed?12:16} streak={streak} remaining={settings.relaxed?undefined:remaining} timeLimit={settings.relaxed?undefined:60}/>
    <h2 className="font-display text-navy text-3xl font-bold">{c.liftTitle}</h2><p>{c.liftIntro} {c.liftInstruction}</p>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="graph-paper border-grid relative h-[450px] overflow-hidden rounded border p-3" role="img" aria-label={c.liftPosition(floorLabel(floor))}>
        {FLOORS.map((item)=><div key={item} className="border-grid flex h-[6.25%] items-center border-b text-sm"><span>{floorLabel(item)}</span></div>)}
        <div className="bg-navy absolute right-6 flex h-[6.25%] w-20 items-center justify-center rounded text-2xl text-paper transition-[top] duration-75 motion-reduce:transition-none" style={{top:`${(10-floor)*6.25}%`}}><span role="img" aria-label={avatarEmoji}>{avatarEmoji}</span></div>
      </div>
      <div className="min-w-0 space-y-4"><div className="border-grid bg-paper rotate-1 rounded border p-5 shadow-sm"><p className="font-semibold">{c.liftPassenger}</p><div className="overflow-x-auto text-3xl"><Tex className="whitespace-nowrap">{mathTex(display)}</Tex></div></div>
        <p>{c.liftSelected}: <strong>{floorLabel(selected)}</strong></p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">{FLOORS.map((item)=><button key={item} type="button" onClick={()=>{setSelected(item);choose(item);}} disabled={!!feedback} aria-label={c.liftFloor(floorLabel(item))} className={`${button} min-w-0 px-1 ${selected===item?"border-navy bg-highlight/40":""} ${chosen===item&&feedback==="wrong"?"border-crimson-deep bg-crimson-wash":""} ${feedback&&item===question.target?"border-navy bg-navy-wash":""}`}>{floorLabel(item)}</button>)}</div>
        {feedback&&<div className={`border-l-4 pl-3 ${feedback==="correct"?"border-navy":"border-crimson-deep"}`} role="status"><p>{feedback==="correct"?c.liftRight:c.liftWrong(floorLabel(question.target))}</p>{settings.relaxed&&marks.length<12&&<button className={`${primary} mt-2`} onClick={()=>nextPassenger(question.target)}>{c.liftNext}</button>}</div>}
      </div>
    </div><p className="text-pencil text-sm">{c.liftStars}</p><button className={button} onClick={onExit}>{c.back}</button>
  </section>;
}
