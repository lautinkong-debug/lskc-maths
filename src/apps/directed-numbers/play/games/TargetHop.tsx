"use client";
import { useRef,useState } from "react";
import { Hud,PaperConfetti,Stamp,StarRating } from "@/components/game";
import { useHaptics,useSound } from "@/components/game/effects";
import { copy } from "@/lib/copy";
import { scoreRun,signedScore,type Mark,type ScoreBreakdown } from "@/lib/challenges/scoring";
import { button,primary } from "../../components/ui";
import { mulberry32 } from "../../lib/generate";
import { hopStars,makeHopSet,solveHop,type HopCard } from "../../lib/targetHop";
import { type GameResult,type GameSettings } from "../progress";

const c=copy.apps.directedNumbers.playLesson;
const signed=(n:number)=>n<0?`−${-n}`:n>0?`+${n}`:"0";
const cardText=(card:HopCard)=>`${card.op==="-"?"−":"+"} (${signed(card.operand)})`;
export function levelHopStars(puzzleStars:readonly number[]):number {
  const solved=puzzleStars.filter((stars)=>stars>0).length,withinPar=puzzleStars.filter((stars)=>stars>=2).length,shortest=puzzleStars.filter((stars)=>stars===3).length;
  return shortest===10?3:withinPar>=8?2:solved>=6?1:0;
}
export default function TargetHop({level,seed,settings,onComplete,onExit,avatarEmoji="🦊"}:{level:1|2|3;seed:number;settings:GameSettings;onComplete:(result:GameResult)=>void;onExit:()=>void;avatarEmoji?:string}) {
  const [puzzles]=useState(()=>makeHopSet(mulberry32(seed),level));
  const [index,setIndex]=useState(0),[history,setHistory]=useState<{position:number;id:number}[]>([]),[puzzleStars,setPuzzleStars]=useState<number[]>([]),[marks,setMarks]=useState<Mark[]>([]),[message,setMessage]=useState(""),[won,setWon]=useState(false),[hint,setHint]=useState(""),[done,setDone]=useState(false),[lastScore,setLastScore]=useState<ScoreBreakdown|null>(null),[lastStars,setLastStars]=useState(0);
  const finished=useRef(false),sound=useSound(settings.sound),haptic=useHaptics(settings.vibration);
  const puzzle=puzzles[index],position=history.at(-1)?.position??puzzle.start,used=new Set(history.map((step)=>step.id));
  function finish(nextMarks:Mark[],nextStars:number[]){
    if(finished.current)return;finished.current=true;
    const breakdown=scoreRun(nextMarks,"directed",null),stars=levelHopStars(nextStars);
    setLastScore(breakdown);setLastStars(stars);setDone(true);sound("podium");
    onComplete({score:breakdown,stars,metrics:{hopThreeStarPuzzles:nextStars.filter((n)=>n===3).length,zeroCorrect:puzzles.filter((p,i)=>p.target===0&&nextStars[i]>0).length}});
  }
  function play(card:HopCard){
    if(won||used.has(card.id))return;
    const next=position+card.delta;
    if(next < -12||next > 12){setMessage(c.targetHop.outOfRange);haptic("wrong");return;}
    const steps=[...history,{position:next,id:card.id}];setHistory(steps);setHint("");
    if(next===puzzle.target){const stars=hopStars(steps.length,puzzle);setWon(true);setPuzzleStars([...puzzleStars,stars]);setMarks([...marks,"correct"]);setMessage(c.targetHop.success(stars));sound("correct");haptic("correct");}
    else if(steps.length===puzzle.cards.length)setMessage(c.targetHop.noCards);
    else setMessage(c.targetHop.current(signed(next)));
  }
  function undo(){if(won)return;setHistory(history.slice(0,-1));setMessage("");setHint("");}
  function showHint(){
    const remaining=puzzle.cards.filter((card)=>!used.has(card.id)),route=solveHop(position,puzzle.target,remaining);
    const first=remaining.find((card)=>card.id===route?.[0]);
    setHint(first?c.targetHop.hintCard(cardText(first)):c.targetHop.noCards);
  }
  function skip(){if(won)return;setWon(true);setPuzzleStars([...puzzleStars,0]);setMarks([...marks,"skipped"]);setMessage(c.targetHop.solution(puzzle.solution.map((id)=>cardText(puzzle.cards.find((card)=>card.id===id)!)).join(" → ")));}
  function next(){
    if(index===9){finish(marks,puzzleStars);return;}
    setIndex(index+1);setHistory([]);setWon(false);setMessage("");setHint("");
  }
  if(done&&lastScore)return <section className="relative space-y-5" aria-label={c.targetHop.finish}>
    <PaperConfetti show={lastStars===3} reduceMotion={settings.reduceMotion}/><h2 className="font-display text-navy text-3xl font-bold">{c.targetHop.finish}</h2>
    <div className="border-grid bg-paper rounded border p-5 shadow-sm"><StarRating count={lastStars} animate reduceMotion={settings.reduceMotion}/><p>{c.score} <strong className="font-display text-3xl">{signedScore(lastScore.total)}</strong></p><p>{lastScore.terms.map((term)=>term.label).join(" + ")} = {signedScore(lastScore.total)}</p><p>{c.earned(lastScore.positiveEarned)}</p>{lastStars===3&&<Stamp label={c.threeStars} reduceMotion={settings.reduceMotion}/>}</div>
    <button className={button} onClick={onExit}>{c.back}</button>
  </section>;
  return <section className="min-w-0 space-y-4" aria-label={c.targetHop.title}>
    <Hud score={scoreRun(marks,"directed",null).total} index={index+1} total={10} streak={marks.reduce((n,mark)=>mark==="correct"?n+1:0,0)} reduceMotion={settings.reduceMotion}/>
    <h2 className="font-display text-navy text-3xl font-bold">{c.targetHop.title}</h2><p>{c.targetHop.intro} {c.targetHop.noTimer}</p>
    <p className="font-semibold">{c.targetHop.puzzle(index+1)} · {c.targetHop.start(signed(puzzle.start))} · {c.targetHop.target(signed(puzzle.target))}</p>
    <div className="graph-paper border-grid overflow-x-auto rounded border p-3 sm:p-5">
      <svg viewBox="0 0 1000 150" className="min-w-[700px] w-full" role="img" aria-label={`${c.targetHop.line}. ${c.targetHop.current(signed(position))}`}>
        <path d="M30 77H970" stroke="var(--color-navy)" strokeWidth="3"/><path d="M30 77l12 -7v14zM970 77l-12 -7v14z" fill="var(--color-navy)"/>
        {Array.from({length:25},(_,i)=>{const x=40+i*38.3,n=i-12;return <g key={n}><path d={`M${x} 68v19`} stroke="var(--color-navy)"/><text x={x} y="110" textAnchor="middle" fill="currentColor" fontSize="14">{signed(n)}</text></g>;})}
        <text x={40+(puzzle.start+12)*38.3} y="45" textAnchor="middle" fontSize="27">★</text>
        <text x={40+(puzzle.target+12)*38.3} y="45" textAnchor="middle" fontSize="29">⚑</text>
        <text x="40" y="145" textAnchor="middle" fontSize="27" className={settings.reduceMotion?"":"motion-safe:transition-transform motion-safe:duration-300"} style={{transform:`translateX(${(position+12)*38.3}px)`}}>{avatarEmoji}</text>
      </svg>
    </div>
    <p aria-live="polite">{c.targetHop.current(signed(position))} · {c.targetHop.cardsUsed(history.length,puzzle.par,puzzle.minimum)}</p>
    <div className="flex flex-wrap gap-2">{puzzle.cards.map((card)=><button key={card.id} className={`${button} min-h-14 text-xl`} disabled={won||used.has(card.id)} onClick={()=>play(card)} aria-label={c.targetHop.card(cardText(card))}>{cardText(card)}</button>)}</div>
    <div className="flex flex-wrap gap-2"><button className={button} disabled={!history.length||won} onClick={undo}>{c.targetHop.undo}</button><button className={button} disabled={!history.length||won} onClick={()=>{setHistory([]);setMessage("");setHint("");}}>{c.targetHop.resetPuzzle}</button><button className={button} disabled={won} onClick={showHint}>{c.targetHop.hint}</button><button className={button} disabled={won} onClick={skip}>{c.targetHop.showSolution}</button></div>
    {hint&&<p role="status" className="border-navy bg-navy-wash rounded border-l-4 p-3">{hint}</p>}
    {message&&<div role="status" className={`rounded border-l-4 p-3 ${won?"border-navy bg-navy-wash":"border-crimson-deep bg-crimson-wash"}`}><p>{won&&(puzzleStars.at(-1)??0)>0&&<strong className="text-xl">+10 ✓ </strong>}{message}</p>{won&&<><StarRating count={puzzleStars.at(-1)??0} animate reduceMotion={settings.reduceMotion}/><div><button className={`${primary} mt-2`} onClick={next}>{index===9?c.targetHop.finish:c.targetHop.next}</button></div></>}</div>}
    <p className="text-pencil text-sm">{c.targetHop.levelStars}</p><button className={button} onClick={onExit}>{c.back}</button>
  </section>;
}
