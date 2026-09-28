import { parseAnswer } from "./parse";
import { equals } from "./rational";

export type MisconceptionId =
  | "neg-plus-neg-positive" | "keep-first-sign" | "minus-minus-unchanged"
  | "reversed-subtraction" | "product-read-as-difference" | "chain-multiplied"
  | "mult-div-right-to-left" | "bracket-minus-partial" | "odd-negatives-positive"
  | "negatives-compared-by-size" | "add-before-multiply";
export type MisconceptionInput = { expression: string; answer: string; a?: number; b?: number; c?: number; op?: string };
export type MistakeExample = { expression: string; wrong: string; right: string };
export type Misconception = { id: MisconceptionId; apply: (question: MisconceptionInput) => string | null; example: MistakeExample; second: MistakeExample };
const result = (value: number) => String(value);
export const misconceptions: Misconception[] = [
  { id: "neg-plus-neg-positive", apply: (q) => q.op === "+" && q.a !== undefined && q.b !== undefined && q.a < 0 && q.b < 0 ? result(-q.a - q.b) : null, example: { expression: "(−6) + (−8)", wrong: "+14", right: "−14" }, second:{expression:"(−3) + (−5)",wrong:"+8",right:"−8"} },
  { id: "keep-first-sign", apply: (q) => q.op === "+" && q.a !== undefined && q.b !== undefined && q.a < 0 && q.b > Math.abs(q.a) ? result(q.a - q.b) : null, example: { expression: "−5 + 12", wrong: "−7", right: "+7" },second:{expression:"−4 + 11",wrong:"−7",right:"+7"} },
  { id: "minus-minus-unchanged", apply: (q) => q.op === "-" && q.a !== undefined && q.b !== undefined && q.b < 0 ? result(q.a + q.b) : null, example: { expression: "5 − (−3)", wrong: "2", right: "8" },second:{expression:"7 − (−2)",wrong:"5",right:"9"} },
  { id: "reversed-subtraction", apply: (q) => q.op === "-" && q.a !== undefined && q.b !== undefined && q.a < q.b ? result(Math.abs(q.a - q.b)) : null, example: { expression: "5 − 9", wrong: "4", right: "−4" },second:{expression:"3 − 8",wrong:"5",right:"−5"} },
  { id: "product-read-as-difference", apply: (q) => q.op === "*" && q.a !== undefined && q.b !== undefined && q.a < 0 && q.b < 0 ? result(q.a + q.b) : null, example: { expression: "−4(−6)", wrong: "−10", right: "+24" },second:{expression:"−3(−5)",wrong:"−8",right:"+15"} },
  { id: "chain-multiplied", apply: (q) => q.op === "chain-sub" && q.a !== undefined && q.b !== undefined && q.c !== undefined ? result(q.a * q.b * q.c) : null, example: { expression: "−2 − 3 − 5", wrong: "−30", right: "−10" },second:{expression:"−1 − 4 − 6",wrong:"−24",right:"−11"} },
  { id: "mult-div-right-to-left", apply: (q) => q.op === "div-mul" && q.a !== undefined && q.b !== undefined && q.c !== undefined && q.b !== 0 ? result(q.a / (q.b * q.c)) : null, example: { expression: "48 ÷ (−8) × 2", wrong: "−3", right: "−12" },second:{expression:"36 ÷ (−6) × 3",wrong:"−2",right:"−18"} },
  { id: "bracket-minus-partial", apply: (q) => q.op === "minus-bracket" && q.a !== undefined && q.b !== undefined && q.c !== undefined ? result(q.a - q.b + q.c) : null, example: { expression: "9 − [4 + 2]", wrong: "7", right: "3" },second:{expression:"10 − [3 + 4]",wrong:"11",right:"3"} },
  { id: "odd-negatives-positive", apply: (q) => q.op === "three-product" && q.a !== undefined && q.b !== undefined && q.c !== undefined && [q.a,q.b,q.c].filter((n) => n < 0).length % 2 === 1 ? result(Math.abs(q.a * q.b * q.c)) : null, example: { expression: "(−2)(−3)(−4)", wrong: "+24", right: "−24" },second:{expression:"(−1)(−4)(−5)",wrong:"+20",right:"−20"} },
  { id: "negatives-compared-by-size", apply: (q) => q.op === "compare" && q.a !== undefined && q.b !== undefined && q.a < 0 && q.b < 0 ? (q.a > q.b ? "<" : ">") : null, example: { expression: "−6 ? −4", wrong: ">", right: "<" },second:{expression:"−8 ? −3",wrong:">",right:"<"} },
  { id: "add-before-multiply", apply: (q) => q.op === "add-mul" && q.a !== undefined && q.b !== undefined && q.c !== undefined ? result((q.a + q.b) * q.c) : null, example: { expression: "(−7) − (−6) × (−5)", wrong: "+5", right: "−37" },second:{expression:"(−4) − (−3) × (−2)",wrong:"+2",right:"−10"} },
];
export function misconceptionForAnswer(question: MisconceptionInput, answer: string): MisconceptionId | null {
  for (const entry of misconceptions) {
    const wrong = entry.apply(question);
    if (wrong === null || wrong === question.answer) continue;
    const givenNumber = parseAnswer(answer), wrongNumber = parseAnswer(wrong);
    if (givenNumber.ok && wrongNumber.ok ? equals(givenNumber.value, wrongNumber.value) : answer.trim() === wrong) return entry.id;
  }
  return null;
}
