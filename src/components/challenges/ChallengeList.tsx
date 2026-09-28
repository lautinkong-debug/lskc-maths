"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import { useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { listTeacherChallenges } from "@/lib/db/challenges";
import { type ChallengeRoom } from "@/lib/challenges/types";

const c=copy.challenges;
export function ChallengeList(){
  const {user}=useAuth();
  const [rooms,setRooms]=useState<ChallengeRoom[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  useEffect(()=>{
    if(!user?.email)return;
    let active=true;
    listTeacherChallenges(user.email).then((items)=>{if(active){setRooms(items);setLoading(false);}}).catch(()=>{if(active){setError(c.roomError);setLoading(false);}});
    return()=>{active=false;};
  },[user?.email]);
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
    <header><h1 className="font-display text-navy text-4xl font-semibold">{c.myTitle}</h1><p className="mt-2">{c.myIntro}</p><Link href="/challenges/new?app=directed-numbers" className="bg-navy mt-4 inline-flex min-h-12 items-center rounded px-5 font-semibold text-white">{c.newTitle}</Link></header>
    {loading?<p role="status">{c.loading}</p>:error?<p role="alert">{error}</p>:!rooms.length?<p>{c.myEmpty}</p>:<div className="grid gap-4 sm:grid-cols-2">{rooms.map((room)=><Link key={room.id} href={`/challenges/${room.id}`} className="border-grid bg-paper hover:border-navy rounded border p-5 shadow-sm"><h2 className="font-display text-navy text-2xl font-semibold">{room.title}</h2><p className="mt-2">{room.classTag??c.noClass} · {room.kind==="live"?c.liveNow:c.homework} · {room.status==="lobby"?c.lobby:room.status==="live"?c.live:c.results}</p><p className="mt-2 font-mono text-xl font-bold tracking-widest">{room.code}</p><p className="mt-1 text-sm">{c.players(room.playerCount)} · {room.closesAt.toLocaleString("en-HK")}</p></Link>)}</div>}
  </main>;
}
