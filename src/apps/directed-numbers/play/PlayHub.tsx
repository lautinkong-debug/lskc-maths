"use client";
import { lazy,Suspense,useState } from "react";
import { usePresentation } from "@/components/PresentationFrame";
import { Avatar,Stamp,StarRating } from "@/components/game";
import { copy } from "@/lib/copy";
import { ADJECTIVES,ANIMALS,avatar,nickname } from "@/lib/challenges/nicknames";
import { button,field,primary } from "../components/ui";
import { generateQuestions } from "../lib/generate";
import { decodeSetCode,encodeSetCode,hashSeed,SKILLS,type SetSettings,type Skill } from "../lib/setCode";
import { awardProgress,blankProgress,frameIndex,hongKongDate,nextRankXP,rankIndex,recommendedLevel,totalStars,useProgress,visibleDailyStreak,type GameSettings } from "./progress";
import type { RunSummary } from "../challenge/Runner";

const Runner=lazy(()=>import("../challenge/Runner"));
const LiftRush=lazy(()=>import("./games/LiftRush"));
const c=copy.apps.directedNumbers.playLesson;
type WorldLevel=1|2|3;
type Screen="hub"|"settings"|"challenge"|"run"|"lift";
type RunPlan={code:string;world?:number;level?:WorldLevel;dailyDate?:string};
const WORLD_SKILLS:Skill[]=["numberLine","addSubtract","brackets","signs","mixed","mistakes"];
function randomSeed():number {
  const random=new Uint32Array(1);
  if(typeof crypto!=="undefined" && crypto.getRandomValues) crypto.getRandomValues(random);
  else random[0]=Math.floor(Math.random()*2**32);
  return random[0]%(2**24);
}
function Settings({progress,update,onBack}:{progress:ReturnType<typeof blankProgress>;update:(change:(current:ReturnType<typeof blankProgress>)=>ReturnType<typeof blankProgress>)=>void;onBack:()=>void}) {
  const [confirm,setConfirm]=useState(false);
  function setting(key:keyof GameSettings,value:boolean){update((old)=>({...old,settings:{...old.settings,[key]:value}}));}
  return <section className="space-y-5" aria-label={c.settings}>
    <h2 className="font-display text-navy text-3xl font-bold">{c.settings}</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="font-semibold">{c.nickname}<select className={field} value={progress.nickname[0]} onChange={(event)=>update((old)=>({...old,nickname:[Number(event.target.value),old.nickname[1]]}))}>{ADJECTIVES.map((word,index)=><option key={word} value={index}>{word}</option>)}</select></label>
      <label className="font-semibold">{c.avatar}<select className={field} value={progress.nickname[1]} onChange={(event)=>update((old)=>({...old,nickname:[old.nickname[0],Number(event.target.value)]}))}>{ANIMALS.map(([animal,emoji],index)=><option key={animal} value={index}>{emoji} {animal}</option>)}</select></label>
      <label className="font-semibold">{c.frame}<select className={field} value={progress.selectedFrame} onChange={(event)=>update((old)=>({...old,selectedFrame:Number(event.target.value)}))}>{Array.from({length:frameIndex(progress.xp)+1},(_,index)=><option key={index} value={index}>{index+1}</option>)}</select></label>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{(["sound","vibration","relaxed","reduceMotion"] as const).map((key)=><label key={key} className="border-grid bg-paper flex min-h-14 items-center gap-3 rounded border p-3"><input type="checkbox" checked={progress.settings[key]} onChange={(event)=>setting(key,event.target.checked)} />{key==="reduceMotion"?c.reduceMotion:key==="relaxed"?c.relaxed:key==="sound"?c.sound:c.vibration}</label>)}</div>
    <p>{c.settingsNote}</p>
    {!confirm?<button className={button} onClick={()=>setConfirm(true)}>{c.reset}</button>:<div className="border-crimson-deep rounded border p-4"><p>{c.resetAsk}</p><div className="mt-2 flex gap-2"><button className={primary} onClick={()=>{update(()=>blankProgress());setConfirm(false);}}>{c.resetYes}</button><button className={button} onClick={()=>setConfirm(false)}>{c.cancel}</button></div></div>}
    <button className={button} onClick={onBack}>{c.back}</button>
  </section>;
}
function ChallengeSetup({onStart,onBack}:{onStart:(code:string)=>void;onBack:()=>void}) {
  const [skills,setSkills]=useState<Skill[]>(["numberLine","addSubtract","mixed"]),[level,setLevel]=useState<1|2>(1),[count,setCount]=useState<5|10|20>(10),[code,setCode]=useState(""),[message,setMessage]=useState("");
  function toggle(skill:Skill){setSkills((current)=>current.includes(skill)?current.filter((item)=>item!==skill):[...current,skill]);}
  function make(){if(!skills.length){setMessage(c.chooseSkill);return;}const settings:SetSettings={skills,level,questionCount:count,seed:randomSeed()};const next=encodeSetCode(settings);setCode(next);setMessage("");}
  function start(){const decoded=decodeSetCode(code);if(!decoded){setMessage(c.invalidCode);return;}setMessage("");onStart(encodeSetCode(decoded));}
  return <section className="space-y-5" aria-label={c.challengeRun}>
    <h2 className="font-display text-navy text-3xl font-bold">{c.challengeRun}</h2>
    <p>{c.setCodeHelp}</p>
    <div className="border-grid bg-paper rounded border p-4"><label className="font-semibold">{c.setCode}<input className={`${field} max-w-52 font-mono uppercase tracking-widest`} maxLength={8} value={code} onChange={(event)=>{setCode(event.target.value.toUpperCase().replace(/\s/g,""));setMessage("");}} /></label><button className={`${primary} mt-3`} onClick={start}>{c.useCode}</button>{message&&<p role="alert" className="text-crimson-deep mt-2">{message}</p>}</div>
    <fieldset className="border-grid rounded border p-4"><legend className="font-display text-navy text-xl font-semibold">{c.chooseSkills}</legend><div className="grid gap-2 sm:grid-cols-2">{SKILLS.map((skill)=><label key={skill} className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={skills.includes(skill)} onChange={()=>toggle(skill)} />{c.skillLabels[skill]}</label>)}</div></fieldset>
    <div className="flex flex-wrap gap-3"><label className="font-semibold">{c.chooseLevel}<select className={field} value={level} onChange={(event)=>setLevel(Number(event.target.value) as 1|2)}><option value={1}>1</option><option value={2}>2</option></select></label><label className="font-semibold">{c.chooseCount}<select className={field} value={count} onChange={(event)=>setCount(Number(event.target.value) as 5|10|20)}>{([5,10,20] as const).map((n)=><option key={n} value={n}>{n}</option>)}</select></label></div>
    <div className="flex flex-wrap gap-2"><button className={primary} onClick={make}>{c.makeSet}</button><button className={button} onClick={onBack}>{c.back}</button></div>
  </section>;
}
export default function PlayHub() {
  const presenting=usePresentation();
  const [progress,update]=useProgress(),[screen,setScreen]=useState<Screen>("hub"),[run,setRun]=useState<RunPlan|null>(null),[liftLevel,setLiftLevel]=useState<WorldLevel>(1),[reward,setReward]=useState<"rank"|"best"|null>(null);
  const today=hongKongDate(),recommended=recommendedLevel(progress),rank=rankIndex(progress.xp);
  const emoji=avatar(progress.nickname),name=nickname(progress.nickname);
  function startWorld(world:number,level:WorldLevel) {
    setReward(null);
    if(world===2){setLiftLevel(level);setScreen("lift");return;}
    const skill=WORLD_SKILLS[world-1],settings:SetSettings={skills:[skill],level:level===1?1:2,questionCount:10,seed:randomSeed()};
    setRun({code:encodeSetCode(settings),world,level});setScreen("run");
  }
  function startDaily(){const settings:SetSettings={skills:["numberLine","addSubtract","brackets","signs","mixed","wordProblems","mistakes"],level:2,questionCount:10,seed:hashSeed(today)};setRun({code:encodeSetCode(settings),dailyDate:today});setReward(null);setScreen("run");}
  function complete(result:RunSummary|{score:RunSummary["score"];stars:number}) {
    const world=screen==="lift"?2:run?.world,level=screen==="lift"?liftLevel:run?.level;
    const best=world&&level?progress.best[`${world}-${level}`]:undefined;
    const next=awardProgress(progress,{world,level,stars:result.stars,score:result.score,dailyDate:screen==="run"?run?.dailyDate:undefined});
    setReward(rankIndex(next.xp)>rankIndex(progress.xp)?"rank":world&&level&&(best===undefined||result.score.total>best)?"best":null);
    update(()=>next);
  }
  if(screen==="settings")return <Settings progress={progress} update={update} onBack={()=>setScreen("hub")} />;
  if(screen==="challenge")return <ChallengeSetup onStart={(code)=>{setRun({code});setReward(null);setScreen("run");}} onBack={()=>setScreen("hub")} />;
  if(screen==="run"&&run) {
    const settings=decodeSetCode(run.code);
    if(!settings)return <p>{c.invalidCode}</p>;
    const questions=generateQuestions(settings);
    return <div className="space-y-4">{reward&&<Stamp label={reward==="rank"?c.newRank:c.personalBest}/>}<Suspense fallback={<p>{copy.apps.loading}</p>}><Runner key={run.code} questions={questions} timeLimitSec={progress.settings.relaxed?null:settings.questionCount*15} settings={progress.settings} onComplete={complete} onExit={()=>{setScreen("hub");setReward(null);}} onNextLevel={run.world&&run.level ? ()=>run.level===3&&run.world===6?setScreen("hub"):startWorld(run.level===3?run.world!+1:run.world!,run.level===3?1:(run.level!+1) as WorldLevel):undefined} avatarEmoji={emoji} /></Suspense></div>;
  }
  if(screen==="lift")return <div className="space-y-4">{reward&&<Stamp label={reward==="rank"?c.newRank:c.personalBest}/>}<Suspense fallback={<p>{copy.apps.loading}</p>}><LiftRush key={liftLevel} level={liftLevel} settings={progress.settings} avatarEmoji={emoji} onComplete={complete} onExit={()=>{setScreen("hub");setReward(null);}} /></Suspense></div>;
  return <section className={`min-w-0 space-y-5 ${presenting?"text-xl":""}`} aria-label={c.title}>
    <h2 className="font-display text-navy text-3xl font-bold">{c.title}</h2><p>{c.intro}</p>
    <div className="border-grid bg-paper flex flex-wrap items-center gap-4 rounded border p-4 shadow-sm"><Avatar emoji={emoji} name={name} frame={progress.selectedFrame}/><div className="min-w-0 flex-1"><strong>{name}</strong><p>{c.ranks[rank]}</p><div className="bg-grid mt-2 h-3 rounded"><div className="bg-highlight h-3 rounded" style={{width:`${Math.min(100,progress.xp/nextRankXP(progress.xp)*100)}%`}} /></div><p className="text-sm">{c.xp(progress.xp,nextRankXP(progress.xp))}</p></div><div className="font-semibold">{c.streak(visibleDailyStreak(progress,today))}<br />★ {c.stars(totalStars(progress))}</div></div>
    <div className="border-highlight bg-highlight/25 rounded border-2 p-4 shadow-sm"><h3 className="font-display text-navy text-2xl font-semibold">{c.today}</h3><p>{progress.dailyCompleted===today?c.dailyDone:c.dailyPlay}</p><button className={`${primary} mt-2`} disabled={progress.dailyCompleted===today} onClick={startDaily}>{c.play}</button></div>
    <div className="graph-paper border-grid grid gap-3 rounded border p-4 md:grid-cols-2">{c.worlds.map((world,index)=>{
      const worldNo=index+1,levelRecommended=recommended.world===worldNo;
      return <section key={world} className={`border-grid bg-paper relative rounded border p-4 shadow-sm ${index%2?"md:translate-y-5":""}`}>
        {levelRecommended&&<span className="bg-highlight/60 absolute right-3 top-3 rounded px-2 text-sm font-semibold">{c.recommended}</span>}
        <h3 className="font-display text-navy pr-20 text-xl font-semibold">{worldNo} {world}</h3><p>{c.skills[index]}</p>
        <div className="mt-3 flex flex-wrap gap-2">{([1,2,3] as const).map((level)=><button key={level} className={`${button} flex min-w-24 flex-col items-center px-2 ${levelRecommended&&recommended.level===level?"border-navy bg-highlight/30":""}`} onClick={()=>startWorld(worldNo,level)}>{c.level(level)}{level===3&&<small>{c.boss}</small>}<StarRating count={progress.stars[`${worldNo}-${level}`]??0}/></button>)}</div>
        {[3,4,6].includes(worldNo)&&<p className="text-pencil mt-3 text-sm">{c.coming}</p>}
      </section>;
    })}</div>
    <div className="flex flex-wrap gap-2"><button className={primary} onClick={()=>setScreen("challenge")}>{c.challengeRun}</button><button className={button} onClick={()=>setScreen("settings")}>{c.settings}</button><button className={button} disabled>{c.stampBook}</button><button className={button} disabled>{c.classJoin}</button></div>
  </section>;
}
