"use client";
import { useEffect,useRef,useState } from "react";
import { copy } from "@/lib/copy";
const c=copy.apps.directedNumbers.playLesson;

export function Avatar({emoji,name,frame=0}:{emoji:string;name:string;frame?:number}) {
  const style=["border-solid border-navy","border-dashed border-navy","border-solid border-highlight bg-highlight/25","border-double border-gold bg-highlight/20"][Math.max(0,Math.min(3,frame))];
  return <span className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full border-4 text-3xl ${style}`} role="img" aria-label={name}>{emoji}</span>;
}
export function CountUp({value,reduceMotion=false}:{value:number;reduceMotion?:boolean}) {
  const [shown,setShown]=useState(value);
  const previous=useRef(value);
  useEffect(() => {
    const from=previous.current; previous.current=value;
    if (reduceMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches) { const frame=requestAnimationFrame(()=>setShown(value)); return ()=>cancelAnimationFrame(frame); }
    let frame=0; const start=performance.now();
    const tick=(now:number) => { const fraction=Math.min(1,(now-start)/450); setShown(Math.round(from+(value-from)*fraction)); if (fraction<1) frame=requestAnimationFrame(tick); };
    frame=requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  },[value,reduceMotion]);
  return <span className="font-display tabular-nums font-bold" aria-label={String(value)} aria-live="polite">{shown<0?`−${-shown}`:shown>0?`+${shown}`:"0"}</span>;
}
export function Countdown({seconds,total,reduceMotion=false}:{seconds:number;total:number;reduceMotion?:boolean}) {
  const remaining=Math.max(0,seconds); const ratio=total ? remaining/total : 0;
  return <span className="inline-flex items-center gap-2 tabular-nums" aria-label={c.timeSeconds(remaining)}>
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true" className={!reduceMotion&&remaining<=10 && remaining>0 ? "motion-safe:animate-pulse" : ""}>
      <circle cx="20" cy="20" r="15" fill="none" stroke="var(--color-grid-strong)" strokeWidth="4" />
      <circle cx="20" cy="20" r="15" fill="none" stroke="var(--color-navy)" strokeWidth="4" strokeDasharray={`${ratio*94.25} 94.25`} transform="rotate(-90 20 20)" />
    </svg>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}
  </span>;
}
export function StreakBar({streak,reduceMotion=false}:{streak:number;reduceMotion?:boolean}) {
  return <div className="min-w-36" aria-label={c.streakLabel(streak)}>
    <div className="flex justify-between text-sm"><span>{c.streakLabel(streak)}</span>{streak>=3 && <strong>{c.onRoll}</strong>}</div>
    <div className="bg-grid h-2 rounded"><div className={`bg-highlight h-2 rounded ${reduceMotion?"":"motion-safe:transition-all"}`} style={{width:`${Math.min(100,(streak/5)*100)}%`}} /></div>
  </div>;
}
export function Hud({score,index,total,streak,remaining,timeLimit,reduceMotion=false}:{score:number;index:number;total:number;streak:number;remaining?:number;timeLimit?:number;reduceMotion?:boolean}) {
  return <div className="border-grid bg-paper sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded border p-3 shadow-sm">
    {remaining!==undefined && timeLimit!==undefined && <Countdown seconds={remaining} total={timeLimit} reduceMotion={reduceMotion} />}
    <div className="text-xl">{c.score} <CountUp value={score} reduceMotion={reduceMotion} /></div>
    <div>{c.question(index,total)}</div>
    <StreakBar streak={streak} reduceMotion={reduceMotion} />
  </div>;
}
export function StarRating({count,total=3,animate=false,reduceMotion=false}:{count:number;total?:number;animate?:boolean;reduceMotion?:boolean}) {
  const holder=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    if(!animate||reduceMotion||window.matchMedia("(prefers-reduced-motion: reduce)").matches||!holder.current)return;
    holder.current.querySelectorAll("[data-earned-star]").forEach((element,index)=>element.animate([{transform:"scale(1.6) rotate(-12deg)",opacity:0},{transform:"scale(1) rotate(0deg)",opacity:1}],{duration:320,delay:index*250,fill:"both"}));
  },[count,animate,reduceMotion]);
  return <span ref={holder} role="img" aria-label={c.starsOutOf(count,total)} className="inline-flex whitespace-nowrap text-2xl tracking-wider">{Array.from({length:total},(_,index)=><span key={index} data-earned-star={index<count?true:undefined} className={index<count?"text-gold":"text-grid-strong"}>{index<count?"★":"☆"}</span>)}</span>;
}
export function Stamp({label,ink="crimson",reduceMotion=false}:{label:string;ink?:"crimson"|"navy"|"bronze"|"gold";reduceMotion?:boolean}) {
  const id=`game-stamp-${label.toLowerCase().replace(/[^a-z0-9]/g,"")}`;
  const holder=useRef<SVGSVGElement>(null);
  useEffect(()=>{if(!reduceMotion&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)holder.current?.animate([{transform:"scale(1.4) rotate(4deg)",opacity:0},{transform:"scale(1) rotate(-8deg)",opacity:1}],{duration:360,fill:"both"});},[label,reduceMotion]);
  const inkClass={crimson:"text-crimson-deep",navy:"text-navy",bronze:"text-bronze",gold:"text-gold"}[ink];
  return <svg ref={holder} viewBox="0 0 170 72" role="img" aria-label={label} className={`${inkClass} h-20 w-44 -rotate-6`}>
    <defs><filter id={id}><feTurbulence baseFrequency="0.035" numOctaves="2" seed="4" result="rough" /><feDisplacementMap in="SourceGraphic" in2="rough" scale="1.5" /></filter></defs>
    <g filter={`url(#${id})`} fill="none" stroke="currentColor" strokeWidth="3"><rect x="5" y="5" width="160" height="62" rx="9" /><rect x="10" y="10" width="150" height="52" rx="6" /></g>
    <text x="85" y="42" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="bold" textLength="136" lengthAdjust="spacingAndGlyphs">{label}</text>
  </svg>;
}
export function PaperConfetti({show,reduceMotion=false}:{show:boolean;reduceMotion?:boolean}) {
  const holder=useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!show || reduceMotion || !holder.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const [index,element] of Array.from(holder.current.children).entries()) {
      element.animate([{transform:`translateY(-10px) rotate(0deg)`,opacity:1},{transform:`translateY(${90+(index%4)*18}px) rotate(${index%2?130:-130}deg)`,opacity:0}],{duration:900+(index%4)*120,fill:"forwards"});
    }
  },[show,reduceMotion]);
  if (!show) return null;
  return <div ref={holder} className="pointer-events-none absolute inset-x-0 top-0 flex justify-around overflow-hidden" aria-hidden="true">{Array.from({length:14},(_,index)=><span key={index} className={`block h-2 w-3 ${["bg-navy","bg-highlight","bg-gold","bg-crimson-wash"][index%4]}`} />)}</div>;
}
