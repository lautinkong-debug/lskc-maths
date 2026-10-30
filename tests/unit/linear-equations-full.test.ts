import { describe, it, expect } from "vitest";
import { questions, responses } from "../../src/apps/linear-equations/bank";
import { frames } from "../../src/apps/linear-equations/animation";
import {
  solve,
  equationTex,
  parse,
  render,
  gradeExpression,
  checkSubstitution,
} from "../../src/apps/linear-equations/engine";
import {
  readNumber,
  equals,
  toText,
  neg,
} from "../../src/apps/directed-numbers/lib/rational";
import textbook from "../../src/apps/linear-equations/textbook.json";
// Independent transcription of the printed answer key on p. 4.41.
const roots: Record<number, string> = {
  1: "4",
  2: "5",
  3: "-2",
  4: "-10",
  5: "8",
  6: "-9",
  7: "4",
  8: "28",
  9: "11",
  10: "3",
  11: "3",
  12: "1/2",
  13: "2",
  14: "2",
  15: "6",
  16: "-6",
  17: "12",
  18: "-30",
  19: "60",
  20: "9/4",
  31: "-13",
  32: "-5",
  33: "0",
  34: "11",
  35: "3",
  36: "1",
  37: "15",
  38: "2",
  39: "-5",
  40: "2",
  41: "9/4",
  42: "-11",
  43: "2",
  44: "9",
  45: "-2",
  46: "4",
  47: "17/4",
  48: "19",
  49: "-1",
  50: "5/3",
  51: "10/3",
  52: "7/10",
};
const outputs: Record<number, string[]> = {
  21: ["48"],
  22: ["83", "85"],
  23: ["13"],
  24: ["4"],
  25: ["3*p+2*p=30", "6"],
  26: ["n-18=n/2", "36"],
  27: ["2*L+14", "13"],
  28: ["51"],
  29: ["3"],
  30: ["128"],
  53: ["38"],
  54: ["400"],
  55: ["62"],
  56: ["11/2", "Agree", "198"],
  57: ["55"],
  58: ["2", "3"],
  59: ["60"],
  60: ["1400"],
  61: ["2*n/5", "n/5", "2400"],
  62: ["7", "Agree", "50/3"],
  63: ["20", "20", "23"],
};
describe("complete textbook coverage", () => {
  it("contains every requested part exactly once", () => {
    expect(questions).toHaveLength(106);
    expect(new Set(questions.map((q) => q.id)).size).toBe(106);
    expect(questions.filter((q) => q.collection === "quick")).toHaveLength(27);
    expect(
      questions.filter((q) => q.collection === "revision").map((q) => q.number),
    ).toEqual(Array.from({ length: 63 }, (_, i) => i + 1));
  });
  for (const row of textbook.quickRows)
    it("matches Quick Practice " + row[1], () => {
      const q = questions.find((q) => q.id === row[0])!;
      expect(
        equals(solve(q.equation, q.variable), readNumber(String(row[3]))),
      ).toBe(true);
    });
  for (const [n, answer] of Object.entries(roots))
    it("matches printed Revision " + n, () => {
      const q = questions.find((q) => q.id === "revision-" + n)!;
      expect(q.answer).toBe(answer);
    });
  for (const [n, answers] of Object.entries(outputs))
    it("matches every contextual response in Revision " + n, () => {
      const q = questions.find((q) => q.id === "revision-" + n)!;
      expect(responses(q).map((r) => r.answer)).toEqual(answers);
    });
  it("keeps all word Quick Practice responses", () =>
    expect(
      questions
        .filter((q) => q.collection === "quick" && q.prompt)
        .map((q) => responses(q).map((r) => r.answer)),
    ).toEqual([["(x-5)/2=16", "37"], ["160"], ["30"], ["11"], ["700"]]));
});
describe("all animated algebra remains equivalent", () => {
  for (const q of questions)
    it(q.id, () => {
      const seq = frames(q.equation, q.variable);
      expect(seq.length).toBeGreaterThan(1);
      for (const [i, f] of seq.entries()) {
        expect(
          toText(solve(f.equation, q.variable)).replace("−", "-"),
          f.equation,
        ).toBe(q.answer);
        expect(
          checkSubstitution(f.equation, q.variable, readNumber(q.answer)).valid,
        ).toBe(true);
        if (f.kind === "move") {
          const prev = seq[i - 1];
          const old = [...prev.left, ...prev.right].find(
            (t) => t.id === f.moved,
          )!;
          const target = (f.from === "left" ? f.right : f.left).find(
            (t) => t.id === f.moved,
          )!;
          expect(equals(target.coefficient, neg(old.coefficient))).toBe(true);
          expect(
            (f.from === "left" ? f.left : f.right).some(
              (t) => t.id === f.moved,
            ),
          ).toBe(false);
        }
      }
      expect(seq.at(-1)?.kind).toBe("finish");
    });
  it("accepts equivalent student models and expressions", () => {
    expect(gradeExpression("2(L+7)", "L", "2*L+14")).toBe("correct");
    expect(gradeExpression("(x-5)/2=16", "x", "(x-5)/2=16", true)).toBe(
      "correct",
    );
    expect(gradeExpression("2p + 3p = 30", "p", "3*p+2*p=30", true)).toBe(
      "correct",
    );
    expect(gradeExpression("2n/5", "n", "2*n/5")).toBe("correct");
    expect(gradeExpression("n/5", "n", "2*n/5")).toBe("incorrect");
    expect(gradeExpression("alert(1)", "x", "x")).toBe("invalid");
    expect(gradeExpression("x/0=1", "x", "x=1", true)).toBe("invalid");
  });
});

describe("bracket and LCM teaching stages", () => {
  it("distributes the outside 2 to both terms before simplifying the nested bracket", () => {
    const seq = frames("2*(1/6-1/3*(1-2*y))=1/2-(y-1)/3", "y");
    expect(seq[1].kind).toBe("distribute");
    expect(seq[1].factor).toBe("2");
    expect(seq[1].scene?.arrows).toHaveLength(2);
    expect(seq[1].scene?.arrows[0].from).toBe(seq[1].scene?.arrows[1].from);
    expect(seq[1].equation).toBe("2*(1/6)-2*(1/3*(1-2*y))=1/2-(y-1)/3");
    expect(seq[1].scene?.arrows[1].product).toMatch(/^-2/);
    expect(seq.filter((f) => f.kind === "distribute")).toHaveLength(3);
    expect(seq.find((f) => f.kind === "denominators")?.factor).toBe("6");
    expect(
      seq
        .find((f) => f.kind === "denominators")
        ?.scene?.arrows.filter((a) => a.from === "lfactor"),
    ).toHaveLength(3);
    expect(
      seq
        .find((f) => f.kind === "denominators")
        ?.scene?.arrows.filter((a) => a.from === "rfactor"),
    ).toHaveLength(2);
  });
  it("multiplies the non-fractional right-hand side by the LCM as well", () => {
    const seq = frames("m/4+m/3=7", "m");
    const f = seq.find((f) => f.kind === "denominators")!;
    expect(f.factor).toBe("12");
    expect(f.scene?.denominators).toEqual([3, 4]);
    expect(f.scene?.arrows).toHaveLength(3);
    expect(f.equation).toBe("12*(m/4)+12*(m/3)=12*(7)");
    const cleared = seq.find((f) => f.kind === "cancel")!;
    expect(cleared.equation).toBe("3*m+4*m=84");
  });
  it("retains negative signs in the products", () => {
    const f = frames("-(2*q-5)=3*q+10", "q").find(
      (f) => f.kind === "distribute",
    )!;
    expect(f.factor).toBe("−1");
    expect(f.scene?.arrows).toHaveLength(2);
    expect(f.equation).toContain("(-1)");
    expect(solve(f.equation, "q")).toEqual(readNumber("-1"));
  });
});

it("every distribution arrow has rendered source and destination anchors", async () => {
  const katex = await import("katex");
  for (const q of questions)
    for (const f of frames(q.equation, q.variable)) {
      if (!f.scene?.arrows.length) continue;
      const html = katex.default.renderToString(f.scene.tex, {
        trust: (c) => c.command === "\\htmlData",
        strict: false,
        throwOnError: true,
      });
      for (const arrow of f.scene.arrows) {
        expect(html, q.id + " source " + arrow.from).toContain(
          'data-eq-anchor="' + arrow.from + '"',
        );
        expect(html, q.id + " target " + arrow.to).toContain(
          'data-eq-anchor="' + arrow.to + '"',
        );
      }
    }
});

it("uses round, square and curly brackets from the innermost group outwards", () => {
  expect(render(parse("2*(1/6-1/3*(1-2*y))"))).toBe(
    String.raw`2\,\left[\frac{1}{6}-\frac{1}{3}\,\left(1-2\,y\right)\right]`,
  );
  expect(render(parse("2*(3*(4*(x+1)-2)+1)"))).toBe(
    String.raw`2\,\left\{3\,\left[4\,\left(x+1\right)-2\right]+1\right\}`,
  );
  expect(equationTex("(y-1)/3=2")).toBe(String.raw`\frac{y-1}{3}=2`);
});

it("solves decimal equations directly without converting them into denominator-clearing lessons", () => {
  const seq = frames("0.8+3*x=1.4", "x");
  expect(seq.map((f) => f.kind)).toEqual([
    "original",
    "move",
    "combine",
    "divide",
    "finish",
  ]);
  expect(seq.map((f) => f.equation)).toEqual([
    "0.8+3*x=1.4",
    "3*x=1.4-0.8",
    "3*x=0.6",
    "x=(0.6)/(3)",
    "x=0.2",
  ]);
  for (const q of questions.filter(
    (q) => q.equation.includes(".") && !q.equation.includes("/"),
  ))
    expect(
      frames(q.equation, q.variable).some(
        (f) => f.kind === "denominators" || f.kind === "cancel",
      ),
    ).toBe(false);
  const brackets = frames("0.2*(3*x-5)=0.4", "x");
  expect(brackets.find((f) => f.kind === "expand")?.equation).toBe(
    "0.6*x-1=0.4",
  );
});
