"use client";

import { useEffect,useState } from "react";
import { copy } from "@/lib/copy";
import { seasonFor } from "@/lib/challenges/logic";
import { type ClassBoard } from "@/lib/challenges/types";
import { signedScore } from "@/lib/challenges/scoring";
import { watchClassBoard } from "@/lib/db/challenges";

const c=copy.challenges;
const seasons=(()=>{
  const current=seasonFor(new Date());
  const match=/^(\d{4})-\d{2}-T([12])$/.exec(current);
  if(!match)return [current];
  let year=Number(match[1]),term=Number(match[2]);
  return Array.from({length:6},()=>{
    const label=`${year}-${String((year+1)%100).padStart(2,"0")}-T${term}`;
    if(term===1){year--;term=2;}else term=1;
    return label;
  });
})();
export function ClassBoards(){
  const [level,setLevel]=useState<1|2>(1),[season,setSeason]=useState(seasons[0]),[board,setBoard]=useState<ClassBoard|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[myClass,setMyClass]=useState("");
  useEffect(()=>{const timer=window.setTimeout(()=>{try{setMyClass(sessionStorage.getItem("lskc.challenge.classTag")??"");}catch{/* Session storage is optional. */}},0);return()=>window.clearTimeout(timer);},[]);
  useEffect(()=>{const stop=watchClassBoard(`directed-numbers_L${level}_${season}`,(value)=>{setBoard(value);setLoading(false);},()=>{setError(c.roomError);setLoading(false);});return stop;},[level,season]);
  const ranked=Object.entries(board?.classes??{}).filter(([,value])=>value.players>=5).map(([tag,value])=>({tag,average:value.totalBest/value.players,players:value.players})).sort((a,b)=>b.average-a.average);
  const low=Math.min(0,...ranked.map((item)=>item.average)),high=Math.max(1,...ranked.map((item)=>item.average)),span=high-low;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6"><header><h1 className="font-display text-navy text-4xl font-semibold">{c.boardsTitle}</h1><p className="mt-2">{c.boardsIntro}</p></header><div className="flex flex-wrap gap-4"><label>{c.boardLevel}<select className="border-grid bg-paper ml-2 min-h-12 rounded border px-3" value={level} onChange={(event)=>{setLoading(true);setLevel(Number(event.target.value) as 1|2);}}><option value={1}>1</option><option value={2}>2</option></select></label><label>{c.boardSeason}<select className="border-grid bg-paper ml-2 min-h-12 rounded border px-3" value={season} onChange={(event)=>{setLoading(true);setSeason(event.target.value);}}>{seasons.map((item)=><option key={item} value={item}>{item}</option>)}</select></label></div>{error&&<p role="alert">{error}</p>}{loading?<p role="status">{c.loading}</p>:!ranked.length?<p>{c.boardEmpty}</p>:<ol className="space-y-4">{ranked.map((item,index)=><li key={item.tag} className={`border-grid bg-paper rounded border p-4 ${item.tag===myClass?"ring-highlight ring-4":""}`}><div className="mb-2 flex items-baseline justify-between gap-3"><strong className="font-display text-navy text-2xl">{index+1}. {item.tag}</strong><span>{c.boardPlayers(item.players)}</span></div><div className="bg-grid relative h-12 overflow-hidden rounded"><span className="bg-navy absolute inset-y-0 rounded" style={{left:`${(0-low)/span*100}%`,width:`${Math.max(3,Math.abs(item.average)/span*100)}%`,transform:item.average<0?"translateX(-100%)":undefined}}/><strong className="relative z-10 flex h-full items-center px-3 text-graphite">{c.average(Number(item.average.toFixed(1)))} ({signedScore(Math.round(item.average))})</strong></div></li>)}</ol>}</main>;
}
