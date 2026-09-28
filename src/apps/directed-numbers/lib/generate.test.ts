import { describe, expect, it } from "vitest";
import { directedNumbersDefinition as definition } from "../challenge/definition";
import { generateQuestions, gradeQuestion, liftQuestion, mulberry32 } from "./generate";
import { decodeSetCode, encodeSetCode, SKILLS } from "./setCode";
import { evaluate, parse, parseAnswer } from "./parse";
import { equals } from "./rational";
import { misconceptionForAnswer, misconceptions } from "./misconceptions";

describe("repeatable question sets", () => {
  it("round-trips every setting in an eight-character code", () => {
    for (const seed of [0,1,123456,2**24-1]) for (const level of [1,2] as const) for (const count of [5,10,20] as const) {
      const settings = {seed,level,questionCount:count,skills:["numberLine","mixed","wordProblems"] as (typeof SKILLS)[number][]};
      const code = encodeSetCode(settings);
      expect(code).toHaveLength(8);
      expect(decodeSetCode(code)).toEqual(settings);
      expect(decodeSetCode(code.toLowerCase())).toEqual(settings);
    }
    expect(decodeSetCode("oooooooo")).toBeNull();
  });
  it("makes 200 reproducible sets per skill and level without repeated prompts", () => {
    for (const skill of SKILLS) for (const level of [1,2] as const) for (let seed=0;seed<200;seed++) {
      const settings = {skills:[skill],level,questionCount:10 as const,seed};
      const first = generateQuestions(settings), second = generateQuestions(settings);
      expect(first).toEqual(second);
      expect(new Set(first.map((q) => `${q.promptText}|${q.promptTex ?? ""}|${q.line?.value ?? ""}`)).size).toBe(10);
      for (const question of first) {
        expect(gradeQuestion(question, question.firstAnswer ? `${question.firstAnswer}|${question.answer}` : question.answer)).toBe(true);
        if (question.showMe.expression && !["compare","order","readLine","mistake"].includes(question.type)) {
          const expression=parse(question.showMe.expression),answer=parseAnswer(question.answer);
          expect(expression.ok).toBe(true);
          if(question.type==="sign" && expression.ok) expect(Math.sign(evaluate(expression.value).n)).toBe(question.answer==="positive"?1:question.answer==="negative"?-1:0);
          else {
            expect(answer.ok).toBe(true);
            if(expression.ok && answer.ok) expect(equals(evaluate(expression.value),answer.value)).toBe(true);
          }
        }
      }
    }
  },20000);
  it("grades the same generated questions after decoding a shared code", () => {
    const settings = {skills:["mixed","numberLine"] as (typeof SKILLS)[number][],level:2 as const,questionCount:20 as const,seed:98765};
    const code=encodeSetCode(settings);
    expect(definition.generate(code)).toEqual(generateQuestions(settings));
    const questions=definition.generate(code);
    for (let i=0;i<500;i++) {
      const question=questions[i%questions.length];
      const answer=i%3===0 ? question.answer : String(i-250);
      const response=question.firstAnswer ? `${question.firstAnswer}|${answer}` : answer;
      expect(definition.grade(question,response)).toBe(gradeQuestion(question,response));
    }
  });
  it("makes twenty different mistake pages", () => {
    for (const level of [1,2] as const) for(let seed=0;seed<200;seed++) {
      const questions=generateQuestions({skills:["mistakes"],level,questionCount:20,seed});
      expect(new Set(questions.map((item)=>item.promptText)).size).toBe(20);
    }
  });
  it("balances answer signs and keeps lift word problems inside the building", () => {
    for(const skill of ["addSubtract","brackets","mixed","wordProblems"] as const) for(const level of [1,2] as const) for(let seed=0;seed<200;seed++) {
      const questions=generateQuestions({skills:[skill],level,questionCount:20,seed});
      const values=questions.map((question)=>parseAnswer(question.answer));
      expect(values.every((value)=>value.ok)).toBe(true);
      const signs=values.map((value)=>value.ok?Math.sign(value.value.n):0);
      expect(signs.filter((sign)=>sign>0).length).toBe(10);
      expect(signs.filter((sign)=>sign<0).length).toBe(10);
      for(const question of questions) if(question.promptText.startsWith("The lift starts at floor")) {
        const answer=parseAnswer(question.answer);
        if(answer.ok) {expect(answer.value.d).toBe(1);expect(answer.value.n).toBeGreaterThanOrEqual(-5);expect(answer.value.n).toBeLessThanOrEqual(30);}
      }
    }
  });
  it("keeps lift destinations inside the tower", () => {
    for (const level of [1,2,3] as const) for (let seed=0;seed<200;seed++) {
      const random=mulberry32(seed); let floor=0;
      for (let i=0;i<20;i++) {
        const question=liftQuestion(floor,level,random);
        expect(question.target).toBeGreaterThanOrEqual(-5);
        expect(question.target).toBeLessThanOrEqual(10);
        expect(question.frames.at(-1)?.to).toBe(question.target);
        floor=question.target;
      }
    }
  });
});
describe("red-pen misconceptions", () => {
  it("has every specified mistake with a correction example", () => {
    expect(misconceptions).toHaveLength(11);
    for (const item of misconceptions) for (const example of [item.example,item.second]) {
      expect(example.wrong).not.toBe(example.right);
      if(item.id!=="negatives-compared-by-size") {
        const expression=parse(example.expression),answer=parseAnswer(example.right);
        expect(expression.ok).toBe(true);
        expect(answer.ok).toBe(true);
        if(expression.ok && answer.ok) expect(equals(evaluate(expression.value),answer.value)).toBe(true);
      }
    }
    expect(misconceptionForAnswer({expression:"5 − (−3)",answer:"8",a:5,b:-3,op:"-"},"2")).toBe("minus-minus-unchanged");
  });
});
