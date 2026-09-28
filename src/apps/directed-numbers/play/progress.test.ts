import { describe,expect,it } from "vitest";
import { scoreRun } from "@/lib/challenges/scoring";
import { awardProgress,blankProgress,frameIndex,hongKongDate,rankIndex,recommendedLevel,totalStars } from "./progress";

describe("device-only quest progress", () => {
  it("keeps all worlds open and recommends the first level short of two stars", () => {
    const progress=blankProgress(); expect(recommendedLevel(progress)).toEqual({world:1,level:1});
    progress.stars["1-1"]=2; expect(recommendedLevel(progress)).toEqual({world:1,level:2});
  });
  it("awards positive XP and only improves saved stars and best scores", () => {
    const score=scoreRun(["correct","correct","wrong"],"directed",null);
    const first=awardProgress(blankProgress(),{world:1,level:1,stars:2,score});
    expect(first.xp).toBe(20); expect(totalStars(first)).toBe(2);
    const second=awardProgress(first,{world:1,level:1,stars:1,score:scoreRun(["wrong"],"directed",null)});
    expect(second.stars["1-1"]).toBe(2); expect(second.best["1-1"]).toBe(first.best["1-1"]);
    expect(second.xp).toBe(20);
  });
  it("uses Hong Kong's date and resets a missed daily streak quietly", () => {
    expect(hongKongDate(new Date("2026-09-26T17:00:00Z"))).toBe("2026-09-27");
    const score=scoreRun(["correct"],"directed",null);
    const day1=awardProgress(blankProgress(),{stars:0,score,dailyDate:"2026-09-27"});
    expect(awardProgress(day1,{stars:0,score,dailyDate:"2026-09-27"}).dailyStreak).toBe(1);
    expect(awardProgress(day1,{stars:0,score,dailyDate:"2026-09-28"}).dailyStreak).toBe(2);
    expect(awardProgress(day1,{stars:0,score,dailyDate:"2026-09-30"}).dailyStreak).toBe(1);
  });
  it("uses the six agreed rank thresholds", () => {
    expect([0,150,400,800,1500,2500].map(rankIndex)).toEqual([0,1,2,3,4,5]);
    expect(frameIndex(0)).toBe(0); expect(frameIndex(2500)).toBe(3);
  });
});
