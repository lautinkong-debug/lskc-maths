import { SKILLS,hashSeed } from "@/apps/directed-numbers/lib/setCode";
import { mulberry32 } from "@/apps/directed-numbers/lib/generate";
import { type ChallengeSettings } from "./types";

const SIXTY_DAYS=60*24*60*60*1000;
export const expireAfter=(date:Date):Date=>new Date(date.getTime()+SIXTY_DAYS);
export function seasonFor(date:Date):string {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit"}).formatToParts(date);
  const month=Number(parts.find((part)=>part.type==="month")?.value),year=Number(parts.find((part)=>part.type==="year")?.value);
  const firstYear=month>=8?year:year-1;
  return `${firstYear}-${String((firstYear+1)%100).padStart(2,"0")}-T${month>=9||month===8||month===1?1:2}`;
}
export function validClassTag(value:unknown):value is string {
  return typeof value==="string"&&/^[1-6][A-F]$/.test(value);
}
export function validSettings(value:unknown,kind:"live"|"homework"):value is ChallengeSettings {
  if(!value||typeof value!=="object")return false;
  const s=value as Partial<ChallengeSettings>;
  return Array.isArray(s.skills)&&s.skills.length>0&&s.skills.length<=SKILLS.length&&s.skills.every((skill)=>SKILLS.includes(skill))
    &&(s.level===1||s.level===2)&&[5,10,15,20].includes(s.questionCount??0)
    &&(s.timeLimitSec===null||Number.isInteger(s.timeLimitSec)&&s.timeLimitSec!>=60&&s.timeLimitSec!<=900)
    &&(s.scoring==="directed"||s.scoring==="gentle")&&(s.order==="same"||s.order==="shuffled")
    &&Number.isInteger(s.maxAttempts)&&s.maxAttempts!>=1&&s.maxAttempts!<=(kind==="live"?3:5)
    &&(s.showNames==="all"||s.showNames==="top10"||s.showNames==="avatars");
}
/** A deterministic order per player; the server sends the order and grades against it. */
export function questionOrder(count:number,seed:number,uid:string,shuffle:boolean):number[] {
  const order=Array.from({length:count},(_,index)=>index);
  if(!shuffle)return order;
  const mixed=hashSeed(`${seed}:${uid}`);
  const random=mulberry32(mixed);
  for(let index=order.length-1;index>0;index--){const swap=Math.floor(random()*(index+1));[order[index],order[swap]]=[order[swap],order[index]];}
  return order;
}
/** Numeric Firestore ordering: score, correct fraction, elapsed time (10 ms), then submission time. */
export function sortKey(score:number,correct:number,total:number,elapsedMs:number|null,submittedAt:Date,opensAt:Date,closesAt:Date):number {
  const accuracy=Math.round(correct/total*20);
  const time=elapsedMs===null?0:Math.max(0,90000-Math.min(90000,Math.floor(elapsedMs/10)));
  const span=Math.max(1,closesAt.getTime()-opensAt.getTime());
  const early=Math.max(0,Math.min(999999,Math.floor((closesAt.getTime()-submittedAt.getTime())/span*1_000_000)));
  return score*3_000_000_000_000+accuracy*100_000_000_000+time*1_000_000+early;
}
