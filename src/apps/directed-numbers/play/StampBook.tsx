"use client";
import { Stamp } from "@/components/game";
import { copy } from "@/lib/copy";
import { nickname } from "@/lib/challenges/nicknames";
import { button } from "../components/ui";
import { totalStars, type Progress } from "./progress";
import { stampDefinitions, unlockedStamps } from "./stamps";

const c=copy.apps.directedNumbers.playLesson;
export default function StampBook({progress,onBack}:{progress:Progress;onBack:()=>void}) {
  const earned=new Set(unlockedStamps(progress));
  return <section className="space-y-5" aria-label={c.stampBook}>
    <h2 className="font-display text-navy text-3xl font-bold">{c.stampBook}</h2>
    <p>{c.stampsEarned(earned.size)}</p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stampDefinitions.map((item)=><div key={item.id} className={`border-grid bg-paper min-w-0 rounded border p-4 shadow-sm ${earned.has(item.id)?"":"opacity-60"}`}>
        {earned.has(item.id)?<Stamp label={item.name} ink={progress.selectedInk} reduceMotion={progress.settings.reduceMotion}/>:<div className="border-grid text-pencil flex h-20 w-44 max-w-full -rotate-6 items-center justify-center rounded border-4 border-double text-center font-bold" aria-label={c.stampLocked}>{item.name}</div>}
        <p className="mt-2 text-sm">{item.condition}</p>
      </div>)}
    </div>
    {totalStars(progress)===54&&<div className="border-gold bg-highlight/20 rounded border-4 p-6 text-center" role="img" aria-label={c.certificateTitle}>
      <h3 className="font-display text-navy text-3xl font-bold">{c.certificateTitle}</h3>
      <p className="my-4 text-xl">{c.certificateBody(nickname(progress.nickname))}</p>
      <p className="text-sm">{c.certificateNote}</p>
    </div>}
    <button className={button} onClick={onBack}>{c.back}</button>
  </section>;
}
