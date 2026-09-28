import { describe, expect, it } from "vitest";
import { mulberry32 } from "./generate";
import { evaluate, parse } from "./parse";
import { equals } from "./rational";
import { gradeSignCard, makeSignCard, signDirection } from "./signSnap";
import { hopStars, makeHopSet, solveHop } from "./targetHop";
import { makeRedPenPages, reasonChoices } from "./redPenPages";

describe("Sign Snap cards", () => {
  it("makes 200 exact, reproducible rounds per level without a zero divisor", () => {
    for (const level of [1,2,3] as const) for (let seed = 0; seed < 200; seed++) {
      const random = mulberry32(seed), repeat = mulberry32(seed);
      for (let index = 0; index < 30; index++) {
        const card = makeSignCard(random, level, index);
        expect(card).toEqual(makeSignCard(repeat, level, index));
        expect(card.factors).toHaveLength(level === 1 ? 2 : card.factors.length);
        for (let i = 1; i < card.factors.length; i++)
          if (card.operations[i-1] === "÷") expect(card.factors[i]).not.toBe(0);
        const parsed = parse(card.expression);
        expect(parsed.ok).toBe(true);
        if (parsed.ok) expect(equals(evaluate(parsed.value), card.value)).toBe(true);
        if (level === 1 && card.operations[0] === "÷") expect(card.value.d).toBe(1);
        expect(gradeSignCard(card, card.sign, card.bonus ? String(card.value.n) + "/" + card.value.d : "")).toBe(true);
        expect(gradeSignCard(card, card.sign === "positive" ? "negative" : "positive")).toBe(false);
        expect(card.bonus).toBe(level === 3 && index % 5 === 4);
      }
    }
    expect(signDirection("negative")).toBe("left");
    expect(signDirection("positive")).toBe("right");
  },30000);
});

describe("Target Hop puzzles", () => {
  it("makes 200 solvable ten-puzzle sets per level with shortest paths", () => {
    for (const level of [1,2,3] as const) for (let seed = 0; seed < 200; seed++) {
      const set = makeHopSet(mulberry32(seed), level);
      expect(set).toEqual(makeHopSet(mulberry32(seed), level));
      expect(set).toHaveLength(10);
      for (const [index,puzzle] of set.entries()) {
        expect(puzzle.start).toBeGreaterThanOrEqual(-12);
        expect(puzzle.target).toBeLessThanOrEqual(12);
        expect(puzzle.cards).toHaveLength(level === 1 ? 4 : 5);
        const shortest = solveHop(puzzle.start, puzzle.target, puzzle.cards);
        expect(shortest).toEqual(puzzle.solution);
        expect(shortest?.length).toBe(puzzle.minimum);
        expect(hopStars(puzzle.minimum,puzzle)).toBe(3);
        expect(hopStars(puzzle.par,puzzle)).toBe(2);
        if (level === 3 && index % 2 === 0) {
          expect(puzzle.requiresSubtractNegative).toBe(true);
          expect(solveHop(puzzle.start,puzzle.target,puzzle.cards.filter((item) => !(item.op === "-" && item.operand < 0)))).toBeNull();
        }
      }
    }
  },30000);
});

describe("Red Pen Hero pages", () => {
  it("makes a clean page and a two-mistake boss among five worked pages", () => {
    for (const level of [1,2,3] as const) for (let seed=0;seed<200;seed++) {
      const pages=makeRedPenPages(mulberry32(seed),level);
      expect(pages).toEqual(makeRedPenPages(mulberry32(seed),level));
      expect(pages).toHaveLength(5);
      expect(pages.filter((page)=>page.clean)).toHaveLength(1);
      expect(pages[4].boss).toBe(true);
      for(const [index,page] of pages.entries()) {
        expect(page.lines.length).toBeGreaterThanOrEqual(3);
        expect(page.lines.length).toBeLessThanOrEqual(5);
        expect(page.lines.filter((line)=>line.fault)).toHaveLength(index===4?2:index===1?0:1);
        for(const line of page.lines) if(line.fault) {
          expect(line.correction).not.toBe(line.tex);
          const reasons=reasonChoices(line.fault,mulberry32(seed+index));
          expect(reasons).toHaveLength(3);
          expect(new Set(reasons).size).toBe(3);
          expect(reasons).toContain(line.fault);
        }
      }
    }
  },30000);
});
