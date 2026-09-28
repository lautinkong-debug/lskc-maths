import { useSyncExternalStore } from "react";
import { type NicknameIndex, validNicknameIndex } from "@/lib/challenges/nicknames";
import { type ScoreBreakdown } from "@/lib/challenges/scoring";

export const PROGRESS_KEY = "lskc.dn.progress.v1";
const RANKS = [0,150,400,800,1500,2500] as const;
export type GameSettings = { sound: boolean; vibration: boolean; relaxed: boolean; reduceMotion: boolean };
export type Progress = {
  version: 1;
  nickname: NicknameIndex;
  selectedFrame: number;
  xp: number;
  stars: Record<string, number>;
  best: Record<string, number>;
  dailyLast: string | null;
  dailyStreak: number;
  dailyCompleted: string | null;
  settings: GameSettings;
};
export function blankProgress(): Progress {
  return { version: 1, nickname: [23,0], selectedFrame:0, xp: 0, stars: {}, best: {}, dailyLast: null, dailyStreak: 0, dailyCompleted: null, settings: {sound:false,vibration:true,relaxed:false,reduceMotion:false} };
}
export function rankIndex(xp: number): number {
  return RANKS.reduce<number>((rank, threshold, index) => xp >= threshold ? index : rank, 0);
}
export function nextRankXP(xp: number): number {
  return RANKS.find((threshold) => threshold > xp) ?? RANKS.at(-1)!;
}
export function frameIndex(xp: number): number {
  return Math.min(3, Math.floor(rankIndex(xp) / 2) + (rankIndex(xp) === 5 ? 1 : 0));
}
export function totalStars(progress: Progress): number {
  return Object.values(progress.stars).reduce((sum,n) => sum+n, 0);
}
export function recommendedLevel(progress: Progress): {world:number;level:number} {
  for (let world=1;world<=6;world++) for (let level=1;level<=3;level++) if ((progress.stars[`${world}-${level}`] ?? 0) < 2) return {world,level};
  return {world:1,level:1};
}
export function hongKongDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}
export function visibleDailyStreak(progress:Progress,day:string):number {
  return progress.dailyLast===day || progress.dailyLast===previousDate(day) ? progress.dailyStreak : 0;
}
function previousDate(day: string): string {
  const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate()-1);
  return date.toISOString().slice(0,10);
}
export function awardProgress(progress: Progress, result: {world?:number;level?:number;stars:number;score:ScoreBreakdown;dailyDate?:string}): Progress {
  const next: Progress = {...progress,stars:{...progress.stars},best:{...progress.best},xp:progress.xp+result.score.positiveEarned};
  if (result.world && result.level) {
    const key=`${result.world}-${result.level}`;
    next.stars[key]=Math.max(next.stars[key] ?? 0,result.stars);
    next.best[key]=Math.max(next.best[key] ?? Number.NEGATIVE_INFINITY,result.score.total);
  }
  if (result.dailyDate && progress.dailyCompleted !== result.dailyDate) {
    next.dailyStreak=progress.dailyLast === previousDate(result.dailyDate) ? progress.dailyStreak+1 : 1;
    next.dailyLast=result.dailyDate;
    next.dailyCompleted=result.dailyDate;
  }
  return next;
}
function validProgress(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const p=value as Partial<Progress>;
  return p.version===1 && typeof p.xp==="number" && p.xp>=0 && !!p.stars && !!p.best && Array.isArray(p.nickname) && validNicknameIndex(p.nickname) && Number.isInteger(p.selectedFrame) && (p.selectedFrame ?? -1)>=0 && (p.selectedFrame ?? 4)<=3 && !!p.settings;
}
export function readProgress(): Progress {
  try { const raw=localStorage.getItem(PROGRESS_KEY); if (raw) { const value:unknown=JSON.parse(raw); if (validProgress(value)) return value; } } catch { /* Storage may be disabled. */ }
  return blankProgress();
}
export function writeProgress(value: Progress): void {
  saved=value;
  try { localStorage.setItem(PROGRESS_KEY,JSON.stringify(value)); } catch { /* Keep in-session state. */ }
  if (typeof window!=="undefined") window.dispatchEvent(new Event(PROGRESS_KEY));
}
const serverProgress=blankProgress();
let saved:Progress|undefined;
function snapshot():Progress { return saved ?? (saved=readProgress()); }
function subscribe(listener:()=>void):()=>void {
  const onStorage=(event:StorageEvent)=>{if(event.key===PROGRESS_KEY){saved=readProgress();listener();}};
  window.addEventListener("storage",onStorage);
  window.addEventListener(PROGRESS_KEY,listener);
  return ()=>{window.removeEventListener("storage",onStorage);window.removeEventListener(PROGRESS_KEY,listener);};
}
export function useProgress(): [Progress,(change:(current:Progress)=>Progress)=>void] {
  const progress=useSyncExternalStore(subscribe,snapshot,()=>serverProgress);
  function update(change:(current:Progress)=>Progress) {writeProgress(change(snapshot()));}
  return [progress,update];
}
