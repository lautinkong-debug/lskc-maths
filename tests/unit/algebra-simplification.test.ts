import { describe, expect, it } from "vitest";
import katex from "katex";
import {
  questions,
  choicesFor,
  selectQuestions,
  recordAnswer,
  recordHelp,
  type Progress,
} from "@/apps/algebra-simplification/bank";
import { equivalent } from "@/apps/polynomials/algebra";

// Independently transcribed printed answer keys, pp. 3.52 and 3.54.
const printed = [
  "7*a",
  "-4*b",
  "2*z",
  "3*y",
  "-p",
  "-5*q",
  "3*x+5",
  "5*s-2",
  "3*a-b",
  "2*q",
  "4*y",
  "6*m*n",
  "14*x",
  "k",
  "8*a^2",
  "-m^2*n^2",
  "30*b^2",
  "12*z^3",
  "2+2*p",
  "p+q",
  "2*x",
  "9*p",
  "8*d^3",
  "y^4*z",
  "3*a-2",
  "2*y",
  "10+9*c",
  "-3*x+4",
  "3*b-3*a",
  "4*b+1",
  "3*a+5",
  "-2*b",
  "5+4*q",
  "2*a^2",
  "24*k^3",
  "y^3*z/2",
  "6*a^2",
  "4*w",
  "8*x",
  "6",
  "3*y-3",
  "-3*a+b",
];

describe("textbook simplification bank", () => {
  it("covers the 42 advertised parts with unique source references", () => {
    expect(questions).toHaveLength(42);
    expect(printed).toHaveLength(42);
    expect(new Set(questions.map((q) => q.id)).size).toBe(42);
    expect(questions.filter((q) => q.skill === "terms")).toHaveLength(18);
    expect(questions.filter((q) => q.skill === "mixed")).toHaveLength(14);
    expect(questions.filter((q) => q.skill === "indices")).toHaveLength(10);
  });
  it("preserves the new textbook references, answer pages and Level 2 coverage", () => {
    const quick = selectQuestions("quick", "all");
    expect(quick.map((q) => q.ref)).toEqual([
      "3.4(a)",
      "3.4(b)",
      "3.5(a)",
      "3.5(b)",
      "3.6(a)",
      "3.6(b)",
    ]);
    expect(quick.map((q) => q.page)).toEqual([
      "3.11",
      "3.11",
      "3.11",
      "3.11",
      "3.12",
      "3.12",
    ]);
    expect(quick.every((q) => q.answerPage === "3.52")).toBe(true);
    const revision = selectQuestions("revision", "all");
    expect(revision.map((q) => q.ref)).toEqual([
      "3(a)",
      "3(b)",
      "3(c)",
      "4(a)",
      "4(b)",
      "4(c)",
      "5(a)",
      "5(b)",
      "5(c)",
      "6(a)",
      "6(b)",
      "6(c)",
      "28(a)",
      "28(b)",
      "28(c)",
      "29(a)",
      "29(b)",
      "29(c)",
    ]);
    expect(revision.every((q) => q.answerPage === "3.54")).toBe(true);
    expect(
      revision.filter((q) => q.page === "3.40" && q.level === 1),
    ).toHaveLength(12);
    expect(
      revision.filter((q) => q.page === "3.42" && q.level === 2),
    ).toHaveLength(6);
    expect(revision.find((q) => q.id === "R3-29(a)")?.original.tex).toBe(
      "14+3a\\div3-a-8",
    );
  });
  for (const [collection, counts] of [
    ["all", [42, 18, 14, 10]],
    ["exercise", [18, 10, 4, 4]],
    ["quick", [6, 2, 2, 2]],
    ["revision", [18, 6, 8, 4]],
  ] as const) {
    it(`${collection}: every skill filter has the intended coverage`, () => {
      for (const [i, skill] of (
        ["all", "terms", "mixed", "indices"] as const
      ).entries()) {
        const selected = selectQuestions(collection, skill);
        expect(selected).toHaveLength(counts[i]);
        expect(
          selected.every(
            (q) =>
              (collection === "all" || q.collection === collection) &&
              (skill === "all" || q.skill === skill),
          ),
        ).toBe(true);
      }
    });
  }
  for (const [i, q] of questions.entries()) {
    it(`${q.id}: source, every working line and final answer agree with printed key`, () => {
      expect(equivalent(q.original.exact, printed[i])).toBe(true);
      expect(equivalent(q.answer.exact, printed[i])).toBe(true);
      for (const step of q.steps)
        expect(equivalent(step.exact, printed[i])).toBe(true);
      expect(q.steps.at(-1)?.tex).toBe(q.answer.tex);
    });
    it(`${q.id}: one simplified answer, two wrong answers, one equivalent unfinished choice`, () => {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map((x) => x.tex)).size).toBe(4);
      expect(q.choices.filter((x) => x.id === "correct")).toHaveLength(1);
      for (const choice of q.choices) {
        expect(equivalent(choice.exact, q.answer.exact)).toBe(
          ["correct", "unfinished"].includes(choice.id),
        );
        if (choice.id !== "correct") expect(choice.feedback).toBeTruthy();
      }
      for (const expr of [q.original, q.answer, ...q.steps, ...q.choices]) {
        expect(() =>
          katex.renderToString(expr.tex, {
            throwOnError: true,
            strict: "error",
          }),
        ).not.toThrow();
      }
    });
  }
  it("shuffles complete options without a fixed correct-answer position", () => {
    const positions = new Set<number>();
    for (let seed = 0; seed < 40; seed++)
      for (const q of questions) {
        const choices = choicesFor(q, seed);
        expect(new Set(choices.map((x) => x.id)).size).toBe(4);
        positions.add(choices.findIndex((x) => x.id === "correct"));
      }
    expect(positions.size).toBe(4);
  });
});

describe("honest session progress", () => {
  it("counts an unaided correct answer once", () => {
    const p = recordAnswer({}, "q", true);
    expect(p.q).toEqual({
      solved: true,
      firstTry: true,
      attempts: 1,
      helped: false,
    });
    expect(recordAnswer(p, "q", true)).toBe(p);
    expect(recordAnswer(p, "q", false)).toBe(p);
  });
  it("does not award first try after a wrong or unfinished choice", () => {
    const p = recordAnswer(recordAnswer({}, "q", false), "q", true);
    expect(p.q).toMatchObject({ solved: true, firstTry: false, attempts: 2 });
  });
  it("hints or viewed working remove first-try eligibility before the first answer", () => {
    const p = recordAnswer(recordHelp({}, "q"), "q", true);
    expect(p.q).toMatchObject({ solved: true, firstTry: false, helped: true });
  });
  it("reviewing a solved question preserves the earned result", () => {
    const p = recordAnswer({}, "q", true);
    expect(recordHelp(p, "q")).toBe(p);
  });
  it("keeps support and attempts separate for different questions", () => {
    let p: Progress = recordHelp({}, "a");
    p = recordAnswer(p, "b", true);
    expect(p.a.solved).toBe(false);
    expect(p.b.firstTry).toBe(true);
  });
});
