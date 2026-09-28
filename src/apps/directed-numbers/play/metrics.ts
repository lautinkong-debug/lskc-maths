import { parseAnswer } from "../lib/parse";
import { type Question } from "../lib/generate";
import { scoreRun, type Mark, type Scoring } from "@/lib/challenges/scoring";
import { type EarnedMetrics } from "./progress";

export function longestCorrectStreak(marks:readonly Mark[]):number {
  let current=0,max=0;
  for(const mark of marks) {
    current=mark==="correct"?current+1:0;
    max=Math.max(max,current);
  }
  return max;
}
export function recoveredFromNegative(marks:readonly Mark[],scoring:Scoring,finalScore:number):boolean {
  return finalScore>0&&marks.some((_,index)=>scoreRun(marks.slice(0,index+1),scoring,null).total<0);
}
export function runMetrics(questions:readonly Question[],answers:readonly string[],marks:readonly Mark[],scoring:Scoring,finalScore:number):EarnedMetrics {
  let zeroCorrect=0,orderFirstStreak=0,currentFirstStreak=0;
  for(let index=0;index<marks.length;index++) {
    const question=questions[index],response=answers[index]??"";
    if(question?.firstAnswer) {
      currentFirstStreak=response.split("|")[0]===question.firstAnswer?currentFirstStreak+1:0;
      orderFirstStreak=Math.max(orderFirstStreak,currentFirstStreak);
    } else currentFirstStreak=0;
    if(marks[index]==="correct" && question) {
      const expected=parseAnswer(question.answer);
      if(question.answer==="zero" || expected.ok && expected.value.n===0) zeroCorrect++;
    }
  }
  return {zeroCorrect,orderFirstStreak,belowZero:recoveredFromNegative(marks,scoring,finalScore)};
}
