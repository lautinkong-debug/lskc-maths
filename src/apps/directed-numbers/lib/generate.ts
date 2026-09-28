import { parse,parseAnswer } from "./parse";
import { add,div,equals,mul,readNumber,sub,toText } from "./rational";
import { misconceptions, type MisconceptionId, type MisconceptionInput } from "./misconceptions";
import { SKILLS, type SetSettings, type Skill } from "./setCode";
import { hops, moveFor } from "./moves";
import { copy } from "@/lib/copy";
import { expressionTex } from "./steps";

const p=copy.apps.directedNumbers.playLesson.prompts;
export function mathTex(expression:string):string {
  const result=parse(expression);
  return result.ok?expressionTex(result.value):expression;
}

export type QuestionType = "compare" | "order" | "readLine" | "evaluate" | "sign" | "word" | "mistake";
export type Question = {
  id: string;
  type: QuestionType;
  skill: Skill;
  promptTex?: string;
  promptText: string;
  answer: string;
  options?: string[];
  distractors: { value: string; misconceptionId: MisconceptionId }[];
  showMe: { mode: string; expression: string };
  firstChoices?: { id: string; label: string }[];
  firstAnswer?: string;
  line?: { min: number; max: number; value: number };
  context?: MisconceptionInput;
};
export function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value = (value + 0x6d2b79f5) >>> 0; let t = value; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (random: () => number, values: readonly number[]) => values[Math.floor(random() * values.length)];
const int = (random: () => number, min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const signed = (value: number) => value < 0 ? `−${-value}` : value > 0 ? `+${value}` : "0";
const signedDecimal = (sign:number,tenths:number) => `${sign<0?"−":"+"}0.${tenths}`;
const signedFraction = (sign:number,numerator:number,denominator:number) => `${sign<0?"−":"+"}${numerator}/${denominator}`;
const signedMixed = (sign:number,whole:number,numerator:number,denominator:number) => `${sign<0?"−":"+"}${whole} ${numerator}/${denominator}`;
function shuffle<T>(random: () => number, items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = int(random, 0, i); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
function numericOptions(answer: number, random: () => number): string[] {
  const values = new Set([answer, -answer, answer + (answer >= 0 ? 2 : -2), answer + (answer >= 0 ? -2 : 2)]);
  for (let offset = 1; values.size < 4; offset++) values.add(answer + offset);
  return shuffle(random, [...values].slice(0, 4).map(signed));
}
function distractors(context?: MisconceptionInput): Question["distractors"] {
  if (!context) return [];
  return misconceptions.flatMap((entry) => { const value = entry.apply(context); return value !== null && value !== context.answer ? [{ value, misconceptionId: entry.id }] : []; });
}
function makeQuestion(skill: Skill, level: 1 | 2, random: () => number, index: number): Question {
  const max = level === 1 ? 20 : 100;
  if (skill === "numberLine") {
    const kind = index % 3;
    if (kind === 0) {
      const a = int(random, -max, max); let b = int(random, -max, max);
      if (a === b) b = b === max ? b - 1 : b + 1;
      const answer = a < b ? "<" : ">";
      const context = { expression: `${signed(a)} ? ${signed(b)}`, answer, a, b, op: "compare" };
      return { id: "", type: "compare", skill, promptTex: `${signed(a)}\\quad\\square\\quad${signed(b)}`, promptText: p.compare(signed(a),signed(b)), answer, options: ["<", ">"], distractors: distractors(context), showMe: { mode: "number-line", expression: "" }, context };
    }
    if (kind === 1) {
      const values = new Set<number>(); while (values.size < 4) values.add(int(random, -max, max));
      const shown = shuffle(random, [...values]); const sorted = [...shown].sort((a,b) => a-b);
      const answer = sorted.map(signed).join(", ");
      const variants = [answer, [...sorted].reverse().map(signed).join(", "), [sorted[1],sorted[0],sorted[2],sorted[3]].map(signed).join(", ")];
      return { id: "", type: "order", skill, promptText: p.order(shown.map(signed).join(", ")), answer, options: shuffle(random, variants), distractors: [], showMe: { mode: "number-line", expression: "" } };
    }
    const value = (index%2?-1:1)*int(random,1,10);
    return { id: "", type: "readLine", skill, promptText: p.readLine, answer: signed(value), options: numericOptions(value, random), distractors: [], line: { min: -10, max: 10, value }, showMe: { mode: "number-line", expression: "" } };
  }
  if (skill === "signs") {
    const count = level === 1 ? 2 : int(random, 3, 4); const factors = Array.from({length:count}, () => pick(random, [-5,-4,-3,-2,2,3,4,5]));
    if (index % 9 === 0) factors[int(random,0,count-1)] = 0;
    const operations = Array.from({length:count-1}, () => level === 2 && random() < .4 ? "÷" : "×");
    for (let i = 1; i < count; i++) if (operations[i-1] === "÷" && factors[i] === 0) factors[i] = 2;
    if(!factors.includes(0)) {
      const desired=index%2?-1:1;
      const otherSign=factors.slice(1).reduce((sign,n)=>sign*Math.sign(n),1);
      factors[0]=Math.abs(factors[0])*desired*otherSign;
    }
    const expression = factors.map((n,i) => `${i ? ` ${operations[i-1]} ` : ""}(${signed(n)})`).join("");
    const value = factors.reduce((v,n) => n === 0 ? 0 : v * Math.sign(n), 1);
    const answer = value === 0 ? p.zero : value > 0 ? p.positive : p.negative;
    return { id: "", type: "sign", skill, promptText: p.sign, promptTex: mathTex(expression), answer, options: [p.negative,p.zero,p.positive], distractors: [], showMe: { mode: "multiply-divide", expression } };
  }
  if (skill === "mistakes") {
    const entry = misconceptions[index % misconceptions.length];
    const example = index >= misconceptions.length ? entry.second : entry.example;
    const faulty = index % 5 !== 0;
    return { id: "", type: "mistake", skill, promptText: p.mistake(example.expression,faulty ? example.wrong : example.right), answer: faulty ? p.no : p.yes, options: [p.yes,p.no], distractors: [], showMe: { mode: entry.id==="negatives-compared-by-size"?"number-line":"mixed", expression: entry.id==="negatives-compared-by-size"?"":example.expression } };
  }
  if (skill === "wordProblems") {
    const direction=index%2?-1:1,contextIndex=index % p.wordContexts.length;
    const a=contextIndex===1?int(random,1,5):direction*int(random,1,10);
    const b=contextIndex===1?signed(-int(random,a+1,a+5)):level===1?signed(direction*int(random,1,9)):signedDecimal(direction,int(random,1,9));
    const answer=toText(add(readNumber(String(a)),readNumber(b)));
    const expression = `(${signed(a)}) + (${b})`;
    const context = level===1 ? { expression, answer, a, b:readNumber(b).n, op: "+" } : undefined;
    return { id: "", type: "word", skill, promptText: p.word(p.wordContexts[contextIndex],signed(a),b), answer, distractors: distractors(context), showMe: { mode: "add-subtract", expression }, context };
  }
  if (skill === "mixed") {
    const direction=index%2?-1:1,cSign=random()<.5?-1:1;
    const a=direction*int(random,5,12),c=cSign*int(random,2,3);
    const b=level===1?signed(direction*cSign*int(random,2,5)):index%3===0?signedDecimal(direction*cSign,int(random,1,9)):index%3===1?signedFraction(direction*cSign,int(random,1,3),int(random,2,10)):signedMixed(direction*cSign,1,1,int(random,2,10));
    if(index%3===1) {
      const divisor=level===1?signed(int(random,2,4)):signedFraction(1,1,int(random,2,10));
      const dividend=level===1?signed(-direction*int(random,1,4)*readNumber(divisor).n):signed(-direction*int(random,1,3));
      const expression=`(${signed(a)}) − (${dividend}) ÷ (${divisor})`;
      const quotient=div(readNumber(dividend),readNumber(divisor));
      if(!quotient.ok) throw new Error("Generated a zero divisor");
      const answer=toText(sub(readNumber(String(a)),quotient.value));
      return {id:"",type:"evaluate",skill,promptTex:mathTex(expression),promptText:p.mixed,answer,firstChoices:[{id:"subtract",label:p.subtractFirst},{id:"divide",label:p.divideFirst}],firstAnswer:"divide",distractors:[],showMe:{mode:"mixed",expression}};
    }
    if(index%3===2) {
      const inside=level===1?signed(direction*int(random,1,4)):signedMixed(direction,1,1,int(random,2,10));
      const multiplier=int(random,2,3);
      const expression=`[(${signed(a)}) + (${inside})] × (${signed(multiplier)})`;
      const answer=toText(mul(add(readNumber(String(a)),readNumber(inside)),readNumber(String(multiplier))));
      return {id:"",type:"evaluate",skill,promptTex:mathTex(expression),promptText:p.mixed,answer,firstChoices:[{id:"multiply",label:p.multiplyFirst},{id:"brackets",label:p.bracketFirst}],firstAnswer:"brackets",distractors:[],showMe:{mode:"mixed",expression}};
    }
    const expression = `(${signed(a)}) + (${b}) × (${signed(c)})`;
    const answer=toText(add(readNumber(String(a)),mul(readNumber(b),readNumber(String(c)))));
    const context = level===1 ? { expression, answer, a, b:readNumber(b).n, c, op: "add-mul" } : undefined;
    return { id: "", type: "evaluate", skill, promptTex: mathTex(expression), promptText: p.mixed, answer, firstChoices: [{id:"add",label:p.addFirst},{id:"multiply",label:p.multiplyFirst}], firstAnswer: "multiply", distractors: distractors(context), showMe: { mode: "mixed", expression }, context };
  }
  if (skill === "brackets") {
    const direction=index%2?-1:1,a=direction*int(random,2,12);
    const b=level===1?signed(-direction*int(random,1,9)):signedDecimal(-direction,int(random,1,9));
    const c=level===1?signed(-direction*int(random,1,8)):index%2?signedFraction(-direction,int(random,1,3),int(random,2,10)):signedMixed(-direction,1,1,int(random,2,10));
    const expression = `(${signed(a)}) − [(${b}) + (${c})]`;
    const answer=toText(sub(readNumber(String(a)),add(readNumber(b),readNumber(c))));
    const context = level===1 ? { expression, answer, a, b:readNumber(b).n, c:readNumber(c).n, op: "minus-bracket" } : undefined;
    return { id: "", type: "evaluate", skill, promptTex: mathTex(expression), promptText: p.evaluate, answer, distractors: distractors(context), showMe: { mode: "brackets", expression }, context };
  }
  const direction=index%2?-1:1,crossAdd=index%4===0,crossSub=index%4===3;
  const a=crossAdd?-int(random,2,10):crossSub?int(random,2,10):direction*int(random,level===1?2:5,max);
  const op=crossAdd?"+":crossSub?"−":random()<.5?"+":"−";
  const bSign=crossAdd||crossSub?1:random()<.5?direction:-direction;
  const pullsBack=(op==="+"&&bSign!==direction)||(op==="−"&&bSign===direction);
  const magnitude=crossAdd||crossSub?int(random,Math.abs(a)+1,Math.abs(a)+9):int(random,1,pullsBack?Math.min(12,Math.abs(a)-1):12);
  const b=level===1||crossAdd||crossSub?signed(bSign*magnitude):index%3===0?signedDecimal(bSign,int(random,1,9)):index%3===1?signedFraction(bSign,int(random,1,5),int(random,2,10)):signedMixed(bSign,1,1,int(random,2,10));
  const extra=level===2?index%2?signedFraction(-direction,int(random,1,4),int(random,2,10)):signedDecimal(-direction,int(random,1,9)):null;
  const fourth=level===2&&index%3===0?signedDecimal(direction,int(random,1,9)):null;
  const expression = `(${signed(a)}) ${op} (${b})${extra?` − (${extra})`:""}${fourth?` + (${fourth})`:""}`;
  const first=op==="+"?add(readNumber(String(a)),readNumber(b)):sub(readNumber(String(a)),readNumber(b));
  const afterThird=extra?sub(first,readNumber(extra)):first;
  const answer=toText(fourth?add(afterThird,readNumber(fourth)):afterThird);
  const context = level===1 ? {expression,answer,a,b:readNumber(b).n,op:op==="+"?"+":"-"} : undefined;
  return { id:"", type:"evaluate", skill, promptTex:mathTex(expression), promptText:p.evaluate, answer, distractors:distractors(context), showMe:{mode:"add-subtract",expression},context };
}
export function generateQuestions(settings: SetSettings): Question[] {
  const random = mulberry32(settings.seed); const seen = new Set<string>(); const questions: Question[] = [];
  const skills = SKILLS.filter((skill) => settings.skills.includes(skill));
  for (let index=0;index<settings.questionCount;index++) {
    const skill = skills[index % skills.length];
    let question: Question | null = null;
    for (let attempt=0;attempt<100;attempt++) {
      const candidate = makeQuestion(skill,settings.level,random,index);
      const key = `${candidate.promptText}|${candidate.promptTex ?? ""}|${candidate.line?.value ?? ""}`;
      if (!seen.has(key)) { seen.add(key); question = candidate; break; }
    }
    if (!question) throw new Error("Could not make a unique question set");
    question.id = `${settings.seed}-${index}-${skill}`;
    questions.push(question);
  }
  return questions;
}
export function gradeQuestion(question: Question, response: string): boolean {
  const [first, answer] = question.firstAnswer ? response.split("|") : [undefined, response];
  if (question.firstAnswer && first !== question.firstAnswer) return false;
  if (["compare","order","sign","mistake"].includes(question.type)) return answer?.trim() === question.answer;
  const given = parseAnswer(answer ?? ""), expected = parseAnswer(question.answer);
  return given.ok && expected.ok && equals(given.value, expected.value);
}
export function liftQuestion(current: number, level: 1 | 2 | 3, random: () => number): { expression: string; target: number; op: "+" | "-"; operand: number; frames: ReturnType<typeof hops> } {
  for (let tries=0;tries<100;tries++) {
    const op: "+" | "-" = level === 1 ? "+" : random()<.5 ? "+" : "-";
    let operand = int(random,1,Math.min(level === 3 ? 9 : 6,10));
    if (op === "+" || level === 3) operand *= random()<.5 ? -1 : 1;
    const move = moveFor(op, operand);
    const target = current + (move.direction === "left" ? -move.distance : move.direction === "right" ? move.distance : 0);
    if (target >= -5 && target <= 10 && target !== current) {
      const expression = `(${signed(current)}) ${op === "-" ? "−" : "+"} (${signed(operand)})`;
      return { expression, target, op, operand, frames: hops(current, op, operand) };
    }
  }
  throw new Error("Could not make a safe lift journey");
}
