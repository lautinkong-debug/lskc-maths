"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import { Math as Tex } from "@/components/Math";
import { Hud,PaperConfetti,Stamp,StarRating } from "@/components/game";
import { useHaptics,useSound } from "@/components/game/effects";
import { copy } from "@/lib/copy";
import { scoreRun,signedScore,type Mark,type ScoreBreakdown } from "@/lib/challenges/scoring";
import { button,field,primary } from "../../components/ui";
import { mulberry32 } from "../../lib/generate";
import { toText } from "../../lib/rational";
import { gradeSignCard,makeSignCard,signDirection,type SnapSign } from "../../lib/signSnap";
import { longestCorrectStreak,recoveredFromNegative } from "../metrics";
import { type GameResult,type GameSettings } from "../progress";

const c=copy.apps.directedNumbers.playLesson;
export function signStars(correct:number,marks:readonly Mark[],relaxed:boolean):number {
  if(relaxed){const accuracy=marks.length?correct/marks.length:0;return accuracy===1?3:accuracy>=.8?2:accuracy>=.6?1:0;}
  return correct>=25?3:correct>=18?2:correct>=10?1:0;
}
export default function SignSnap({level,seed,settings,onComplete,onExit}:{level:1|2|3;seed:number;settings:GameSettings;onComplete:(result:GameResult)=>void;onExit:()=>void}) {
  const [card,setCard]=useState(()=>makeSignCard(mulberry32(seed),level,0));
  const [marks,setMarks]=useState<Mark[]>([]),[feedback,setFeedback]=useState<"correct"|"wrong"|null>(null),[chosen,setChosen]=useState<SnapSign|null>(null),[bonusValue,setBonusValue]=useState(""),[remaining,setRemaining]=useState(45),[done,setDone]=useState(false),[lastScore,setLastScore]=useState<ScoreBreakdown|null>(null),[lastStars,setLastStars]=useState(0);
  const started=useRef(0),finished=useRef(false),swipeStart=useRef<number|null>(null),zeroCorrect=useRef(0),lastBeep=useRef(-1);
  const sound=useSound(settings.sound),haptic=useHaptics(settings.vibration);
  const correct=marks.filter((mark)=>mark==="correct").length;
  const streak=marks.reduce((n,mark)=>mark==="correct"?n+1:0,0);
  const pace=Math.floor(correct/5)+1;
  useEffect(()=>{started.current=Date.now();},[]);
  const finish=useCallback((finalMarks:Mark[])=>{
    if(finished.current)return;finished.current=true;
    const breakdown=scoreRun(finalMarks,"directed",settings.relaxed?null:Math.min(45,(Date.now()-started.current)/1000));
    const stars=signStars(breakdown.correct,finalMarks,settings.relaxed);
    setLastScore(breakdown);setLastStars(stars);setDone(true);sound("podium");
    onComplete({score:breakdown,stars,metrics:{signStreak:longestCorrectStreak(finalMarks),zeroCorrect:zeroCorrect.current,belowZero:recoveredFromNegative(finalMarks,"directed",breakdown.total)}});
  },[settings.relaxed,onComplete,sound]);
  useEffect(()=>{
    if(settings.relaxed||done)return;
    const timer=window.setInterval(()=>setRemaining(Math.max(0,45-Math.floor((Date.now()-started.current)/1000))),200);
    return ()=>window.clearInterval(timer);
  },[settings.relaxed,done]);
  useEffect(()=>{if(!settings.relaxed&&remaining===0&&!done)finish(marks);},[remaining,settings.relaxed,done,marks,finish]);
  useEffect(()=>{if(!settings.relaxed&&!done&&remaining>0&&remaining<=10&&lastBeep.current!==remaining){lastBeep.current=remaining;sound("countdown");}},[remaining,settings.relaxed,done,sound]);
  useEffect(()=>{
    if(settings.relaxed||feedback!=="correct"||done)return;
    const timer=window.setTimeout(()=>{setCard(makeSignCard(mulberry32(seed+marks.length),level,marks.length));setChosen(null);setBonusValue("");setFeedback(null);},Math.max(500,1700-(pace-1)*150));
    return ()=>window.clearTimeout(timer);
  },[settings.relaxed,feedback,done,seed,marks.length,level,pace]);
  function submit(sign:SnapSign,value=""){
    if(feedback||done||finished.current)return;
    if(card.bonus&&!value){setChosen(sign);return;}
    const right=gradeSignCard(card,sign,value),mark:Mark=right?"correct":"wrong";
    if(right&&card.sign==="zero")zeroCorrect.current++;
    const next=[...marks,mark];setMarks(next);setChosen(sign);setFeedback(mark);
    sound(right?(streak>=2?"streak":"correct"):"wrong");haptic(right?"correct":"wrong");
    if(settings.relaxed&&next.length===12)finish(next);
  }
  function next(){setCard(makeSignCard(mulberry32(seed+marks.length),level,marks.length));setChosen(null);setBonusValue("");setFeedback(null);}
  function keyDown(event:React.KeyboardEvent<HTMLElement>){
    if(event.target instanceof HTMLInputElement||event.target instanceof HTMLButtonElement)return;
    const sign=event.key==="ArrowLeft"?"negative":event.key==="ArrowRight"?"positive":event.key==="ArrowDown"||event.key==="0"?"zero":null;
    if(sign){event.preventDefault();submit(sign);}
  }
  if(done&&lastScore)return <section className="relative space-y-5" aria-label={c.signSnap.finish}>
    <PaperConfetti show={lastStars===3} reduceMotion={settings.reduceMotion}/><h2 className="font-display text-navy text-3xl font-bold">{c.signSnap.finish}</h2>
    <div className="border-grid bg-paper rounded border p-5 shadow-sm"><StarRating count={lastStars} animate reduceMotion={settings.reduceMotion}/><p>{c.score} <strong className="font-display text-3xl">{signedScore(lastScore.total)}</strong></p><p>{lastScore.terms.map((term)=>term.label).join(" + ")} = {signedScore(lastScore.total)}</p><p>{c.earned(lastScore.positiveEarned)}</p>{lastStars===3&&<Stamp label={c.threeStars} reduceMotion={settings.reduceMotion}/>}</div>
    <button className={button} onClick={onExit}>{c.back}</button>
  </section>;
  return <section tabIndex={0} onKeyDown={keyDown} className="min-w-0 space-y-4" aria-label={c.signSnap.title}>
    <Hud score={scoreRun(marks,"directed",null).total} index={marks.length+1} total={settings.relaxed?12:25} streak={streak} remaining={settings.relaxed?undefined:remaining} timeLimit={settings.relaxed?undefined:45} reduceMotion={settings.reduceMotion}/>
    <h2 className="font-display text-navy text-3xl font-bold">{c.signSnap.title}</h2><p>{c.signSnap.intro}</p><p className="text-pencil text-sm">{c.signSnap.instruction} {c.signSnap.pace(pace)}</p>
    <div className="graph-paper border-grid rounded border p-4 sm:p-8" onPointerDown={(event)=>{swipeStart.current=event.clientX;}} onPointerUp={(event)=>{if(swipeStart.current!==null){const dx=event.clientX-swipeStart.current;if(Math.abs(dx)>50)submit(dx<0?"negative":"positive");swipeStart.current=null;}}}>
      <div className={`border-grid bg-paper mx-auto max-w-3xl rounded border-2 p-5 text-center shadow-sm ${feedback&&chosen?"motion-safe:transition-transform":""}`} style={feedback&&chosen&&!settings.reduceMotion?{transform:`translateX(${chosen==="negative"?"-12%":chosen==="positive"?"12%":"0"})`,transitionDuration:`${Math.max(120,400-pace*30)}ms`}:undefined}>
        <div className="overflow-x-auto text-2xl sm:text-4xl"><Tex className="whitespace-nowrap">{card.expression.replaceAll("−","-").replaceAll("×","\\times").replaceAll("÷","\\div")}</Tex></div>
        {card.bonus&&<p className="mt-3 font-semibold">{c.signSnap.bonus}</p>}
      </div>
      <svg viewBox="0 0 600 75" className="mt-5 w-full" role="img" aria-label={c.signSnap.intro}><path d="M35 37H565" stroke="currentColor" strokeWidth="3"/><path d="M35 37l12 -7v14zM565 37l-12 -7v14z" fill="currentColor"/><path d="M300 23v28" stroke="currentColor" strokeWidth="2"/><text x="60" y="68" textAnchor="middle" fill="currentColor">−</text><text x="300" y="68" textAnchor="middle" fill="currentColor">0</text><text x="540" y="68" textAnchor="middle" fill="currentColor">+</text>{feedback&&<circle cx={signDirection(card.sign)==="left"?60:signDirection(card.sign)==="right"?540:300} cy="37" r="8" fill="var(--color-gold)"/>}</svg>
    </div>
    <div className="grid gap-2 sm:grid-cols-3"><button className={button} disabled={!!feedback} onClick={()=>submit("negative")}>{c.signSnap.negative}</button><button className={button} disabled={!!feedback} onClick={()=>submit("zero")}>{c.signSnap.zero}</button><button className={button} disabled={!!feedback} onClick={()=>submit("positive")}>{c.signSnap.positive}</button></div>
    {card.bonus&&chosen&&!feedback&&<div className="border-grid bg-paper rounded border p-4"><label className="font-semibold">{c.signSnap.value}<input className={`${field} max-w-48`} value={bonusValue} onChange={(event)=>setBonusValue(event.target.value)} /></label><button className={`${primary} mt-2`} onClick={()=>submit(chosen,bonusValue)}>{c.signSnap.submitBonus}</button></div>}
    {feedback&&<div role="status" className={`rounded border-l-4 p-3 ${feedback==="correct"?"border-navy bg-navy-wash":"border-crimson-deep bg-crimson-wash"}`}><p>{feedback==="correct"?<><strong className="text-xl">+10 ✓ </strong>{c.signSnap.right}</>:card.sign==="zero"?c.signSnap.zeroHint:card.bonus&&chosen===card.sign?c.signSnap.bonusHint(toText(card.value,{signed:true})):c.signSnap.wrong(card.sign)}</p><p className="font-semibold">{toText(card.value,{signed:true})}</p><button className={`${primary} mt-2`} onClick={next}>{c.signSnap.next}</button></div>}
    <p className="text-pencil text-sm">{c.signSnap.stars}</p><button className={button} onClick={onExit}>{c.back}</button>
  </section>;
}
