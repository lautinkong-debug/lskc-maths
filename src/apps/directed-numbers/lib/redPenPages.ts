import { misconceptions, type MisconceptionId, type MistakeExample } from "./misconceptions";
import { mathTex } from "./generate";
import { parse } from "./parse";
import { readNumber, toTex } from "./rational";
import { workOut } from "./steps";
import { copy } from "@/lib/copy";

const c=copy.apps.directedNumbers.playLesson.redPen;

export type RedPenLine = {
  id: number;
  text?: string;
  tex?: string;
  fault?: MisconceptionId;
  correction?: string;
};
export type RedPenPage = { lines: RedPenLine[]; clean: boolean; boss: boolean };
const simpleIds: MisconceptionId[] = [
  "neg-plus-neg-positive", "keep-first-sign", "minus-minus-unchanged",
  "reversed-subtraction", "product-read-as-difference",
  "bracket-minus-partial", "negatives-compared-by-size",
];
function shuffle<T>(random: () => number, list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}
function equation(example: MistakeExample, value: string, compare: boolean): string {
  if (compare) return example.expression.replace("?", value);
  return mathTex(example.expression) + " = " + toTex(readNumber(value), { signed: true });
}
function pageLines(entry: typeof misconceptions[number], example: MistakeExample, faulty: boolean): RedPenLine[] {
  const compare = entry.id === "negatives-compared-by-size";
  const lines: RedPenLine[] = [{ id: 0, tex: compare ? example.expression : mathTex(example.expression) }];
  const parsed = compare ? null : parse(example.expression);
  const intermediate = parsed?.ok ? workOut(parsed.value).slice(0,-1).slice(0,2) : [];
  for (const step of intermediate) lines.push({ id: lines.length, tex: step.tex });
  if (lines.length === 1) lines.push({ id: 1, text: c.checkSigns });
  lines.push({
    id: lines.length,
    tex: equation(example, faulty ? example.wrong : example.right, compare),
    fault: faulty ? entry.id : undefined,
    correction: faulty ? equation(example, example.right, compare) : undefined,
  });
  return lines;
}
export function makeRedPenPages(random: () => number, level: 1 | 2 | 3): RedPenPage[] {
  const pool = level === 1 ? misconceptions.filter((entry) => simpleIds.includes(entry.id)) : misconceptions;
  const choices = shuffle(random,pool);
  const pages: RedPenPage[] = [];
  for (let index = 0; index < 5; index++) {
    if (index === 4) {
      const first = choices[4], second = choices[5];
      const a = level === 1 ? first.example : first.second;
      const b = level === 1 ? second.example : second.second;
      pages.push({
        clean: false, boss: true,
        lines: [
          { id: 0, text: c.twoPieces },
          { id: 1, tex: first.id === "negatives-compared-by-size" ? a.expression : mathTex(a.expression) },
          { id: 2, tex: equation(a,a.wrong,first.id === "negatives-compared-by-size"), fault: first.id, correction: equation(a,a.right,first.id === "negatives-compared-by-size") },
          { id: 3, tex: second.id === "negatives-compared-by-size" ? b.expression : mathTex(b.expression) },
          { id: 4, tex: equation(b,b.wrong,second.id === "negatives-compared-by-size"), fault: second.id, correction: equation(b,b.right,second.id === "negatives-compared-by-size") },
        ],
      });
      continue;
    }
    const entry = choices[index], clean = index === 1;
    const example = level === 1 ? entry.example : entry.second;
    pages.push({ clean, boss: false, lines: pageLines(entry,example,!clean) });
  }
  return pages;
}
export function reasonChoices(id: MisconceptionId, random: () => number): MisconceptionId[] {
  const others = shuffle(random,misconceptions.map((entry) => entry.id).filter((other) => other !== id));
  return shuffle(random,[id,others[0],others[1]]);
}
