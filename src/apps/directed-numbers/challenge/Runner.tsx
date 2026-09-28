"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { Avatar,Hud,PaperConfetti,Stamp,StarRating } from "@/components/game";
import { useHaptics,useSound } from "@/components/game/effects";
import { scoreRun, type Mark, type ScoreBreakdown, type Scoring, signedScore } from "@/lib/challenges/scoring";
import { Keypad } from "../components/Keypad";
import { button,field,primary } from "../components/ui";
import { gradeQuestion,type Question } from "../lib/generate";
import { misconceptionForAnswer } from "../lib/misconceptions";
import { type GameSettings } from "../play/progress";
import { parseAnswer } from "../lib/parse";
import { toText } from "../lib/rational";
import { runMetrics } from "../play/metrics";
import { type EarnedMetrics } from "../play/progress";

const c=copy.apps.directedNumbers.playLesson;
export type RunSummary={score:ScoreBreakdown;stars:number;answers:string[];marks:Mark[];elapsedSec:number|null;metrics:EarnedMetrics};
type SavedRun={version:1;index:number;answer:string;first:string;submitted:boolean;answers:string[];marks:Mark[];times:number[];startedAt:number;questionStartedAt:number};
export function starsForRun(marks:readonly Mark[],elapsedSec:number|null,relaxed:boolean):number {
  if (!marks.length) return 0;
  const accuracy=marks.filter((mark)=>mark==="correct").length/marks.length;
  if (accuracy===1 && (relaxed || elapsedSec===null || elapsedSec<=15*marks.length)) return 3;
  return accuracy>=.8?2:accuracy>=.6?1:0;
}
function MarkedLine({question}:{question:Question}) {
  if (!question.line) return null;
  const {min,max,value}=question.line;
  const x=(n:number)=>25+(n-min)/(max-min)*650;
  return <svg viewBox="0 0 700 100" role="img" aria-label={c.lineDescription(min,max)} className="w-full min-w-[300px]">
    <line x1="20" y1="56" x2="680" y2="56" stroke="var(--color-navy)" strokeWidth="2" />
    {Array.from({length:max-min+1},(_,i)=>min+i).map((n)=><g key={n}><line x1={x(n)} x2={x(n)} y1="50" y2="62" stroke="var(--color-navy)" /><text x={x(n)} y="84" textAnchor="middle" fontSize="12">{n===value?"":n%5===0?textNumber(n):""}</text></g>)}
    <text x={x(value)} y="37" textAnchor="middle" fontSize="24" fontWeight="bold" fill="var(--color-crimson-deep)">A</text>
  </svg>;
}
export default function Runner({questions,timeLimitSec,scoring="directed",settings,onFinish,onComplete,onExit,onNextLevel,avatarEmoji="🦊",storageKey,startedAt}:{
  questions:Question[];timeLimitSec:number|null;scoring?:Scoring;settings:GameSettings;
  onFinish?:(answers:string[],clientTimingsMs:number[])=>void;
  onComplete?:(summary:RunSummary)=>void;onExit?:()=>void;onNextLevel?:()=>void;avatarEmoji?:string;storageKey?:string;startedAt?:number;
}) {
  const [index,setIndex]=useState(0),[answer,setAnswer]=useState(""),[first,setFirst]=useState("");
  const [submitted,setSubmitted]=useState(false),[answers,setAnswers]=useState<string[]>([]),[marks,setMarks]=useState<Mark[]>([]),[times,setTimes]=useState<number[]>([]);
  const [complete,setComplete]=useState(false),[review,setReview]=useState(false),[remaining,setRemaining]=useState(timeLimitSec ?? 0),[elapsed,setElapsed]=useState<number|null>(null),[keypad,setKeypad]=useState(false);
  const [restored,setRestored]=useState(!storageKey);
  const started=useRef(0),questionStarted=useRef(0),finished=useRef(false),lastBeep=useRef(-1);
  const question=questions[index];
  const sound=useSound(settings.sound),haptic=useHaptics(settings.vibration);
  let liveStreak=0;
  for (let i=marks.length-1;i>=0 && marks[i]==="correct";i--) liveStreak++;
  const liveScore=scoreRun(marks,scoring,null).total;
  const currentResponse=question?.firstAnswer ? `${first}|${answer}` : answer;
  const correct=question && submitted && gradeQuestion(question,currentResponse);
  const summaryScore=scoreRun(marks,scoring,elapsed);
  const stars=starsForRun(marks,elapsed,settings.relaxed);
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      const now=Date.now();started.current=startedAt??now;questionStarted.current=now;
      if(storageKey){
        try{
          const saved=JSON.parse(sessionStorage.getItem(storageKey)??"null") as SavedRun|null;
          if(saved?.version===1&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<questions.length&&Array.isArray(saved.answers)&&saved.answers.length<=questions.length){
            setIndex(saved.index);setAnswer(saved.answer);setFirst(saved.first);setSubmitted(saved.submitted);setAnswers(saved.answers);setMarks(saved.marks);setTimes(saved.times);
            started.current=saved.startedAt;questionStarted.current=saved.questionStartedAt;
          }
        }catch{/* Continue with the current question if session storage is unavailable. */}
        setRestored(true);
      }
      if(timeLimitSec!==null)setRemaining(Math.max(0,timeLimitSec-Math.floor((now-started.current)/1000)));
    },0);
    return()=>window.clearTimeout(timer);
  },[storageKey,startedAt,questions.length,timeLimitSec]);
  useEffect(()=>{
    if(!storageKey||!restored||complete)return;
    const saved:SavedRun={version:1,index,answer,first,submitted,answers,marks,times,startedAt:started.current,questionStartedAt:questionStarted.current};
    try{sessionStorage.setItem(storageKey,JSON.stringify(saved));}catch{/* The run still works without session storage. */}
  },[storageKey,restored,complete,index,answer,first,submitted,answers,marks,times]);
  const finish=useCallback((finalAnswers:string[],finalMarks:Mark[],finalTimes:number[])=>{
    if (finished.current) return; finished.current=true;
    const paddedAnswers=[...finalAnswers,...Array(Math.max(0,questions.length-finalAnswers.length)).fill("")];
    const paddedMarks=[...finalMarks,...Array(Math.max(0,questions.length-finalMarks.length)).fill("skipped") as Mark[]];
    const seconds=timeLimitSec===null?null:Math.min(timeLimitSec,(Date.now()-started.current)/1000);
    const score=scoreRun(paddedMarks,scoring,seconds);
    const result={score,stars:starsForRun(paddedMarks,seconds,settings.relaxed),answers:paddedAnswers,marks:paddedMarks,elapsedSec:seconds,metrics:runMetrics(questions,paddedAnswers,paddedMarks,scoring,score.total)};
    setAnswers(paddedAnswers);setMarks(paddedMarks);setElapsed(seconds);setComplete(true);
    sound("podium");
    onFinish?.(paddedAnswers,finalTimes);onComplete?.(result);
  },[questions,timeLimitSec,scoring,settings.relaxed,onFinish,onComplete,sound]);
  useEffect(() => {
    if (timeLimitSec===null || complete || !restored) return;
    const timer=window.setInterval(() => setRemaining(Math.max(0,timeLimitSec-Math.floor((Date.now()-started.current)/1000))),250);
    return () => window.clearInterval(timer);
  },[timeLimitSec,complete,restored]);
  useEffect(() => { if (timeLimitSec!==null && remaining===0 && !complete && restored) finish(answers,marks,times); },[remaining,timeLimitSec,complete,restored,answers,marks,times,finish]);
  useEffect(()=>{if(timeLimitSec!==null&&!complete&&remaining>0&&remaining<=10&&lastBeep.current!==remaining){lastBeep.current=remaining;sound("countdown");}},[remaining,timeLimitSec,complete,sound]);
  function submit(skip=false) {
    if (submitted || complete || !question) return;
    if (!skip && (!answer.trim() || (question.firstAnswer && !first))) return;
    const response=skip?"":currentResponse;
    const mark:Mark=skip?"skipped":gradeQuestion(question,response)?"correct":"wrong";
    setAnswers([...answers,response]);setMarks([...marks,mark]);setTimes([...times,Date.now()-questionStarted.current]);setSubmitted(true);
    if (mark==="correct") {sound(liveStreak>=2?"streak":"correct");haptic("correct");} else if (mark==="wrong") {sound("wrong");haptic("wrong");}
  }
  function next() {
    if (!submitted) return;
    if (index===questions.length-1) {finish(answers,marks,times);return;}
    setIndex(index+1);setAnswer("");setFirst("");setSubmitted(false);questionStarted.current=Date.now();
  }
  function restart() {
    finished.current=false;lastBeep.current=-1;started.current=Date.now();questionStarted.current=Date.now();setIndex(0);setAnswer("");setFirst("");setSubmitted(false);setAnswers([]);setMarks([]);setTimes([]);setElapsed(null);setComplete(false);setReview(false);setRemaining(timeLimitSec??0);
  }
  function key(value:string) {
    if (value==="enter") {submit();return;}
    if (value==="backspace") setAnswer(answer.slice(0,-1));
    else if (value==="clear") setAnswer("");
    else setAnswer(answer+(value==="a/b"?"/":value==="space"?" ":value));
  }
  if(!restored)return <p role="status">{copy.challenges.loading}</p>;
  if (!questions.length) return <p>{c.chooseSkill}</p>;
  if (complete) return <section className="relative space-y-5" aria-label={c.complete}>
    <PaperConfetti show={stars===3} reduceMotion={settings.reduceMotion} />
    <h2 className="font-display text-navy text-3xl font-bold">{c.complete}</h2>
    <div className="border-grid bg-paper rounded border p-5 shadow-sm">
      <StarRating count={stars} animate reduceMotion={settings.reduceMotion} />
      <p className="mt-3 text-2xl">{c.score} <CountUpScore value={summaryScore.total} /></p>
      <p className="font-semibold">{c.scoreWorking}</p>
      <p className="overflow-x-auto tabular-nums">{summaryScore.terms.map((term)=>term.label).join(" + ")} = <strong>{signedScore(summaryScore.total)}</strong></p>
      <p>{c.earned(summaryScore.positiveEarned)}</p>
      {stars===3 && <Stamp label={c.threeStars} reduceMotion={settings.reduceMotion} />}
    </div>
    <div className="flex flex-wrap gap-2"><button className={primary} onClick={restart}>{c.tryAgain}</button><button className={button} onClick={()=>setReview(!review)}>{c.review}</button>{onNextLevel && <button className={button} onClick={onNextLevel}>{c.nextLevel}</button>}{onExit && <button className={button} onClick={onExit}>{c.back}</button>}</div>
    {review && <ol className="space-y-3">{questions.map((item,i)=><li key={item.id} className="border-grid bg-paper rounded border p-3"><strong>{c.question(i+1,questions.length)}:</strong> {item.promptText} {item.promptTex && <Tex>{item.promptTex}</Tex>}<p>{c.correctAnswer(presentAnswer(item))}</p>{marks[i]!=="correct" && <a className="text-navy underline" href={showMeUrl(item)}>{c.showMe}</a>}</li>)}</ol>}
  </section>;
  const note=question.context ? misconceptionForAnswer(question.context,answer) : null;
  const wrongNote=question.firstAnswer && first!==question.firstAnswer ? c.firstStepWrong+(question.firstAnswer==="brackets"?c.bracketFirst:c.wrongOrder) : note ? c.misconceptionNotes[note] : question.type==="compare" ? c.compareHint : question.type==="order" ? c.orderHint : question.type==="sign" ? c.zeroHint : c.wrongSign;
  return <section className="min-w-0 space-y-4" aria-label={c.question(index+1,questions.length)}>
    <Hud score={liveScore} index={index+1} total={questions.length} streak={liveStreak} remaining={timeLimitSec===null?undefined:remaining} timeLimit={timeLimitSec??undefined} reduceMotion={settings.reduceMotion} />
    <div className="border-grid bg-paper min-w-0 space-y-5 rounded border p-5 shadow-sm rotate-[-1deg]">
      <div className="flex items-center gap-3"><Avatar emoji={avatarEmoji} name={avatarEmoji} /><p className="font-semibold">{question.promptText}</p></div>
      {question.promptTex && <div className="overflow-x-auto text-2xl sm:text-4xl"><Tex className="whitespace-nowrap">{question.promptTex}</Tex></div>}
      <MarkedLine question={question} />
      {question.firstChoices && <fieldset disabled={submitted} className="space-y-2"><legend className="font-semibold">{c.first}</legend><div className="flex flex-wrap gap-2">{question.firstChoices.map((choice)=><button key={choice.id} className={`${button} ${first===choice.id?"border-navy bg-highlight/40":""}`} type="button" onClick={()=>setFirst(choice.id)} aria-pressed={first===choice.id}>{choice.label}</button>)}</div></fieldset>}
      {question.options ? <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option)=><button key={option} disabled={submitted} className={`${button} ${answer===option?"border-navy bg-highlight/40":""}`} aria-pressed={answer===option} onClick={()=>setAnswer(option)}>{option}</button>)}</div> : <div><label htmlFor="dn-run-answer" className="font-semibold">{c.answer}</label><input id="dn-run-answer" className={`${field} max-w-xs`} value={answer} disabled={submitted} onChange={(event)=>setAnswer(event.target.value)} onKeyDown={(event)=>{if (event.key==="Enter") {event.preventDefault();submit();}}} /><button className={`${button} ml-2`} type="button" onClick={()=>setKeypad(!keypad)} aria-expanded={keypad}>{keypad?c.hideKeypad:c.keypad}</button>{keypad && !submitted && <Keypad onKey={key} />}</div>}
      {submitted && <div role="status" className={`border-l-4 pl-3 ${correct?"border-navy":"border-crimson-deep"}`}><p className="font-semibold">{marks.at(-1)==="skipped"?c.skipped:correct?c.correct:c.wrong}</p>{!correct && <>{marks.at(-1)!=="skipped"&&<p>{wrongNote}</p>}<p>{c.correctAnswer(presentAnswer(question))}</p><a href={showMeUrl(question)} className="text-navy underline">{c.showMe} →</a></>}</div>}
    </div>
    <div className="sticky bottom-0 flex flex-wrap gap-2 bg-paper/95 p-2">{!submitted?<><button className={primary} onClick={()=>submit()} disabled={!answer.trim() || !!question.firstAnswer && !first}>{c.check}</button><button className={button} onClick={()=>submit(true)}>{c.skip}</button></>:<button className={primary} onClick={next}>{c.next}</button>}{onExit && <button className={button} onClick={onExit}>{c.back}</button>}</div>
  </section>;
}
function showMeUrl(question:Question):string {
  const {mode,expression}=question.showMe;
  return `#${mode}${expression?`:e=${encodeURIComponent(expression)}`:""}`;
}
function textNumber(value:number):string {return value<0?`−${-value}`:String(value);}
function presentAnswer(question:Question):string {
  if(["compare","order","sign","mistake"].includes(question.type))return question.answer;
  const parsed=parseAnswer(question.answer);
  return parsed.ok?toText(parsed.value,{signed:true}):question.answer;
}
function CountUpScore({value}:{value:number}) { return <strong className="font-display text-navy tabular-nums">{signedScore(value)}</strong>; }
