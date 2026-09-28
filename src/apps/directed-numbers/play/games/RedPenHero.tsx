"use client";
import { useRef,useState } from "react";
import { Math as Tex } from "@/components/Math";
import { Hud,PaperConfetti,Stamp,StarRating } from "@/components/game";
import { useHaptics,useSound } from "@/components/game/effects";
import { copy } from "@/lib/copy";
import { scoreRun,signedScore,type Mark,type ScoreBreakdown } from "@/lib/challenges/scoring";
import { button,primary } from "../../components/ui";
import { mulberry32 } from "../../lib/generate";
import { makeRedPenPages,reasonChoices } from "../../lib/redPenPages";
import { type MisconceptionId } from "../../lib/misconceptions";
import { type GameResult,type GameSettings } from "../progress";
import { recoveredFromNegative } from "../metrics";

const c=copy.apps.directedNumbers.playLesson;
export default function RedPenHero({level,seed,settings,onComplete,onExit}:{level:1|2|3;seed:number;settings:GameSettings;onComplete:(result:GameResult)=>void;onExit:()=>void}) {
  const [pages]=useState(()=>makeRedPenPages(mulberry32(seed),level));
  const [index,setIndex]=useState(0),[pens,setPens]=useState(3),[selected,setSelected]=useState<number|null>(null),[choices,setChoices]=useState<MisconceptionId[]>([]),[found,setFound]=useState<number[]>([]),[rejected,setRejected]=useState<MisconceptionId[]>([]),[pageDone,setPageDone]=useState(false),[marks,setMarks]=useState<Mark[]>([]),[message,setMessage]=useState(""),[done,setDone]=useState(false),[lastScore,setLastScore]=useState<ScoreBreakdown|null>(null),[lastStars,setLastStars]=useState(0);
  const foundCount=useRef(0),finished=useRef(false),sound=useSound(settings.sound),haptic=useHaptics(settings.vibration);
  const page=pages[index];
  function finish(nextMarks:Mark[],pensLeft:number,completed:boolean){
    if(finished.current)return;finished.current=true;
    const breakdown=scoreRun(nextMarks,"directed",null),stars=completed?pensLeft:0;
    setLastScore(breakdown);setLastStars(stars);setDone(true);sound("podium");
    onComplete({score:breakdown,stars,metrics:{redPenFound:foundCount.current,belowZero:recoveredFromNegative(nextMarks,"directed",breakdown.total)}});
  }
  function losePen(nextMarks:Mark[],note:string){
    const left=pens-1;setPens(left);setMarks(nextMarks);setMessage(note);sound("wrong");haptic("wrong");
    if(left<=0)finish(nextMarks,0,false);
  }
  function chooseLine(lineId:number){
    if(pageDone||done||selected!==null)return;
    const line=page.lines.find((item)=>item.id===lineId)!;
    if(!line.fault){losePen([...marks,"wrong"],c.redPen.wrongLine);return;}
    if(found.includes(lineId))return;
    setSelected(lineId);setChoices(reasonChoices(line.fault,mulberry32(seed+index*100+lineId)));setRejected([]);setMessage(c.redPen.chooseReason);
  }
  function chooseReason(reason:MisconceptionId){
    if(selected===null||done)return;
    const line=page.lines.find((item)=>item.id===selected)!;
    if(reason!==line.fault){setRejected([...rejected,reason]);losePen([...marks,"wrong"],c.redPen.wrongReason);return;}
    foundCount.current++;
    const nextFound=[...found,selected],allFound=page.lines.every((item)=>!item.fault||nextFound.includes(item.id));
    setFound(nextFound);setMarks([...marks,"correct"]);setSelected(null);setChoices([]);setRejected([]);setPageDone(allFound);
    setMessage(allFound?c.redPen.right:c.redPen.more);sound("correct");haptic("correct");
  }
  function allCorrect(){
    if(pageDone||done||selected!==null)return;
    if(!page.clean){losePen([...marks,"wrong"],c.redPen.wrongLine);return;}
    setPageDone(true);setMarks([...marks,"correct"]);setMessage(c.redPen.clean);sound("correct");haptic("correct");
  }
  function next(){
    if(index===4){finish(marks,pens,true);return;}
    setIndex(index+1);setSelected(null);setChoices([]);setFound([]);setRejected([]);setPageDone(false);setMessage("");
  }
  if(done&&lastScore)return <section className="relative space-y-5" aria-label={c.redPen.finish}>
    <PaperConfetti show={lastStars===3} reduceMotion={settings.reduceMotion}/><h2 className="font-display text-navy text-3xl font-bold">{c.redPen.finish}</h2>
    <div className="border-grid bg-paper rounded border p-5 shadow-sm"><StarRating count={lastStars} animate reduceMotion={settings.reduceMotion}/><p>{c.score} <strong className="font-display text-3xl">{signedScore(lastScore.total)}</strong></p><p>{lastScore.terms.map((term)=>term.label).join(" + ")} = {signedScore(lastScore.total)}</p><p>{c.earned(lastScore.positiveEarned)}</p>{lastStars===3&&<Stamp label={c.threeStars} reduceMotion={settings.reduceMotion}/>}</div>
    <button className={button} onClick={onExit}>{c.back}</button>
  </section>;
  return <section className="min-w-0 space-y-4" aria-label={c.redPen.title}>
    <Hud score={scoreRun(marks,"directed",null).total} index={index+1} total={5} streak={marks.reduce((n,mark)=>mark==="correct"?n+1:0,0)} reduceMotion={settings.reduceMotion}/>
    <h2 className="font-display text-navy text-3xl font-bold">{c.redPen.title}</h2><p>{c.redPen.intro}</p>
    <div className="flex flex-wrap justify-between gap-2 font-semibold"><p>{c.redPen.page(index+1)} {page.boss&&`· ${c.redPen.boss}`}</p><p aria-live="polite">{c.redPen.pens(pens)} 🖊</p></div>
    <div className="graph-paper border-grid space-y-3 rounded border p-3 sm:p-5">
      {page.lines.map((line)=><div key={line.id}>
        <button className={`${button} bg-paper flex min-h-16 w-full min-w-0 items-center gap-3 overflow-x-auto text-left ${line.id%2?"rotate-[0.4deg]":"-rotate-[0.4deg]"} ${found.includes(line.id)?"border-crimson-deep border-2":""} ${selected===line.id?"bg-highlight/30":""}`} disabled={pageDone||found.includes(line.id)||selected!==null} onClick={()=>chooseLine(line.id)} aria-label={c.redPen.line(line.id+1)}><span className="text-pencil shrink-0">{line.id+1}.</span><span className="min-w-max text-lg sm:text-xl">{line.tex?<Tex>{line.tex}</Tex>:line.text}</span>{found.includes(line.id)&&<span className={`text-crimson-deep ml-auto text-2xl ${settings.reduceMotion?"":"motion-safe:animate-pulse"}`}>◯</span>}</button>
        {found.includes(line.id)&&line.correction&&<div className="border-crimson-deep bg-crimson-wash mt-1 rounded border-l-4 p-3"><p className="text-sm font-semibold">{c.redPen.right}</p><div className="text-navy overflow-x-auto text-lg"><Tex>{line.correction}</Tex></div><p className="text-sm">{c.redPen.reasons[line.fault!]}</p></div>}
      </div>)}
    </div>
    <button className={button} disabled={pageDone||selected!==null} onClick={allCorrect}>{c.redPen.allCorrect}</button>
    {selected!==null&&<div className="border-grid bg-paper space-y-2 rounded border p-4"><h3 className="font-display text-navy text-xl font-bold">{c.redPen.chooseReason}</h3>{choices.map((reason)=><button key={reason} className={`${button} block w-full text-left`} disabled={rejected.includes(reason)} onClick={()=>chooseReason(reason)}>{c.redPen.reasons[reason]}</button>)}</div>}
    {message&&<div role="status" className={`rounded border-l-4 p-3 ${pageDone?"border-navy bg-navy-wash":"border-crimson-deep bg-crimson-wash"}`}><p>{pageDone&&<strong className="text-xl">+10 ✓ </strong>}{message}</p>{pageDone&&<button className={`${primary} mt-2`} onClick={next}>{index===4?c.redPen.finish:c.redPen.next}</button>}</div>}
    <button className={button} onClick={onExit}>{c.back}</button>
  </section>;
}
