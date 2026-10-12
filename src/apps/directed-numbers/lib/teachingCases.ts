import { parse } from "./parse";
import { expressionTex } from "./steps";
import { demonstrationStyle } from "./demonstration";
import { readMagnitudeMove, type SimpleMove } from "./textbook";

export type TeachingCase = {
  a: string;
  b: string;
  op: SimpleMove["op"];
  expression: string;
  tex: string;
  move: SimpleMove;
};

function cases(a: string, b: string, signed: boolean): TeachingCase[] {
  const values: TeachingCase[] = [];
  for (const op of ["+", "-"] as const) {
    for (const left of ["+", "-"]) {
      for (const right of signed ? ["+", "-"] : ["+"]) {
        const first = `${left === "+" && !signed ? "" : left}${a}`;
        const second = `${right === "+" && !signed ? "" : right}${b}`;
        const expression = signed
          ? `(${first}) ${op} (${second})`
          : `${first} ${op} ${second}`;
        const parsed = parse(expression);
        const move = readMagnitudeMove(first, op, second);
        if (!parsed.ok || !move) throw new Error("Invalid teaching case");
        values.push({
          a: first,
          b: second,
          op,
          expression,
          move,
          tex: expressionTex(parsed.value, demonstrationStyle(parsed.value)),
        });
      }
    }
  }
  return values;
}

export const teachingCaseGroups = [
  { id: "integers", plain: cases("20", "30", false), signed: [] },
  { id: "signedIntegers", plain: [], signed: cases("20", "30", true) },
  {
    id: "decimals",
    plain: cases("0.2", "0.3", false),
    signed: cases("0.2", "0.3", true),
  },
  {
    id: "fractions",
    plain: cases("2/5", "3/5", false),
    signed: cases("2/5", "3/5", true),
  },
] as const;
