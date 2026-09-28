"use client";

import { useState,type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { createChallengeRoom } from "@/lib/db/challenges";
import { SKILLS,type Skill } from "@/apps/directed-numbers/lib/setCode";
import { type ChallengeKind,type ChallengeSettings } from "@/lib/challenges/types";

const c=copy.challenges,p=copy.apps.directedNumbers.playLesson;
const input="border-grid bg-paper focus:border-navy min-h-12 w-full rounded border px-3 py-2";
const classes=Array.from({length:6},(_,year)=>"ABCDEF".split("").map((letter)=>`${year+1}${letter}`)).flat();
function suggestedClose(kind:ChallengeKind):string {
  const date=new Date(Date.now()+(kind==="live"?10:24*60)*60_000);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}T${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
}

export function CreateChallenge({initialSettings}:{initialSettings?:ChallengeSettings}) {
  const router=useRouter();
  const [title,setTitle]=useState("Directed numbers"),[kind,setKind]=useState<ChallengeKind>("live"),[classTag,setClassTag]=useState("");
  const [closes,setCloses]=useState(()=>suggestedClose("live")),[settings,setSettings]=useState<ChallengeSettings>(initialSettings??{skills:["addSubtract"],level:1,questionCount:5,timeLimitSec:300,scoring:"directed",order:"same",maxAttempts:2,showNames:"top10"});
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  function change<K extends keyof ChallengeSettings>(key:K,value:ChallengeSettings[K]){setSettings((old)=>({...old,[key]:value}));}
  function toggle(skill:Skill){setSettings((old)=>({...old,skills:old.skills.includes(skill)?old.skills.filter((item)=>item!==skill):[...old.skills,skill]}));}
  async function create(event:FormEvent){
    event.preventDefault();setError("");setBusy(true);
    try{
      const result=await createChallengeRoom({title,kind,settings,classTag:classTag||null,closesAt:new Date(closes)});
      router.push(`/challenges/${result.roomId}`);
    }catch(cause){setError(cause instanceof Error?cause.message:c.createError);setBusy(false);}
  }
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
    <header><h1 className="font-display text-navy text-4xl font-semibold">{c.newTitle}</h1><p className="mt-2">{c.newIntro}</p></header>
    <form onSubmit={create} className="space-y-6">
      <div className="border-grid bg-paper grid gap-4 rounded border p-5 sm:grid-cols-2">
        <label>{c.title}<input className={input} value={title} maxLength={60} onChange={(event)=>setTitle(event.target.value)} required /></label>
        <label>{c.type}<select className={input} value={kind} onChange={(event)=>{const next=event.target.value as ChallengeKind;setKind(next);setCloses(suggestedClose(next));change("maxAttempts",next==="live"?Math.min(settings.maxAttempts,3):settings.maxAttempts);}}><option value="live">{c.liveNow}</option><option value="homework">{c.homework}</option></select></label>
        <label>{c.classTag}<select className={input} value={classTag} onChange={(event)=>setClassTag(event.target.value)}><option value="">{c.noClass}</option>{classes.map((tag)=><option key={tag} value={tag}>{tag}</option>)}</select></label>
        <label>{c.closesAt}<input className={input} type="datetime-local" value={closes} onChange={(event)=>setCloses(event.target.value)} suppressHydrationWarning required /></label>
      </div>
      <fieldset className="border-grid rounded border p-5"><legend className="font-display text-navy px-2 text-2xl font-semibold">{c.skills}</legend><div className="grid gap-2 sm:grid-cols-2">{SKILLS.map((skill)=><label key={skill} className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={settings.skills.includes(skill)} onChange={()=>toggle(skill)} />{p.skillLabels[skill]}</label>)}</div></fieldset>
      <div className="border-grid bg-paper grid gap-4 rounded border p-5 sm:grid-cols-3">
        <label>{c.level}<select className={input} value={settings.level} onChange={(event)=>change("level",Number(event.target.value) as 1|2)}><option value={1}>1</option><option value={2}>2</option></select></label>
        <label>{c.questions}<select className={input} value={settings.questionCount} onChange={(event)=>change("questionCount",Number(event.target.value) as 5|10|15|20)}>{([5,10,15,20] as const).map((n)=><option key={n} value={n}>{n}</option>)}</select></label>
        <label>{c.timeLimit}<select className={input} value={settings.timeLimitSec??"none"} onChange={(event)=>change("timeLimitSec",event.target.value==="none"?null:Number(event.target.value))}><option value="none">{c.noTime}</option>{[60,120,180,300,600,900].map((n)=><option key={n} value={n}>{c.minutes(n/60)}</option>)}</select></label>
        <label>{c.scoring}<select className={input} value={settings.scoring} onChange={(event)=>change("scoring",event.target.value as ChallengeSettings["scoring"])}><option value="directed">{c.directed}</option><option value="gentle">{c.gentle}</option></select></label>
        <label>{c.attempts}<select className={input} value={settings.maxAttempts} onChange={(event)=>change("maxAttempts",Number(event.target.value))}>{Array.from({length:kind==="live"?3:5},(_,i)=>i+1).map((n)=><option key={n} value={n}>{n}</option>)}</select></label>
        <label>{c.order}<select className={input} value={settings.order} onChange={(event)=>change("order",event.target.value as ChallengeSettings["order"])}><option value="same">{c.sameOrder}</option><option value="shuffled">{c.shuffledOrder}</option></select></label>
        <label>{c.names}<select className={input} value={settings.showNames} onChange={(event)=>change("showNames",event.target.value as ChallengeSettings["showNames"])}><option value="all">{c.allNames}</option><option value="top10">{c.topTenNames}</option><option value="avatars">{c.avatarsOnly}</option></select></label>
      </div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>change("scoring","gentle")} className="border-navy min-h-12 rounded border px-4">{c.gentlePreset}</button><button type="button" onClick={()=>change("timeLimitSec",null)} className="border-navy min-h-12 rounded border px-4">{c.noTimerPreset}</button><button type="button" onClick={()=>change("showNames","avatars")} className="border-navy min-h-12 rounded border px-4">{c.avatarsPreset}</button></div>
      {error&&<p role="alert" className="text-crimson-deep">{error}</p>}
      <button className="bg-navy min-h-12 rounded px-6 font-semibold text-white disabled:opacity-50" disabled={busy||!settings.skills.length} type="submit">{busy?c.creating:c.create}</button>
    </form>
  </main>;
}
