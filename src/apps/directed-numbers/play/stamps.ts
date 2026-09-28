import { copy } from "@/lib/copy";
import { totalStars, type Progress } from "./progress";

const definitions=copy.apps.directedNumbers.playLesson.stampDefinitions;
export type StampId = typeof definitions[number]["id"];
export const stampDefinitions=definitions;

export function unlockedStamps(progress: Progress): StampId[] {
  const stats=progress.stats;
  const earned: Record<StampId,boolean> = {
    "first-steps":Object.keys(progress.stars).length>0,
    "below-zero":stats.belowZero,
    "zero-hero":stats.zeroCorrect>=5,
    "going-up":stats.liftStreak>=10,
    "sign-sniper":stats.signStreak>=20,
    "hop-master":stats.hopThreeStarPuzzles>=10,
    "island-explorer":[1,2,3].every((level)=>progress.stars["3-"+level]===3),
    "order-keeper":stats.orderFirstStreak>=10,
    "red-pen-hero":stats.redPenFound>=15,
    "perfect-page":stats.perfectChallenge,
    "five-day-streak":stats.maxDailyStreak>=5,
    "quest-complete":totalStars(progress)===54,
    "class-challenger":stats.classChallenge,
    "podium":stats.podium,
    "most-improved":stats.mostImproved,
  };
  return definitions.filter((item)=>earned[item.id]).map((item)=>item.id);
}

export function newStamps(before:Progress,after:Progress):StampId[] {
  const previous=new Set(unlockedStamps(before));
  return unlockedStamps(after).filter((id)=>!previous.has(id));
}
