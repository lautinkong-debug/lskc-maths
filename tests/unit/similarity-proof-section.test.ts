import { describe, expect, it } from "vitest";
import { proofSection } from "../../src/apps/similarity/proofSection";
import { textbookSolutions } from "../../src/apps/similarity/textbook";

describe("current textbook proof section", () => {
  it("hides Q19 part a when part b starts, and restores it when going back", () => {
    const steps = textbookSolutions["ex8c-19"].steps;
    expect(proofSection(steps, 15)).toEqual({ start: 0, end: 16 });
    expect(proofSection(steps, 16)).toEqual({ start: 16, end: 26 });
    expect(proofSection(steps, 25)).toEqual({ start: 16, end: 26 });
    expect(proofSection(steps, 3)).toEqual({ start: 0, end: 16 });
  });
  it("separates the two comparisons shown in Q17 before its calculation part", () => {
    const steps = textbookSolutions["ex8c-17"].steps;
    expect(proofSection(steps, 4)).toEqual({ start: 0, end: 5 });
    expect(proofSection(steps, 6)).toEqual({ start: 5, end: 11 });
    expect(proofSection(steps, 11)).toEqual({ start: 11, end: 22 });
  });
  it("recognises part c, roman subparts and alternative solutions", () => {
    expect(proofSection(textbookSolutions["ex8a-21"].steps, 12).start).toBe(8);
    expect(proofSection(textbookSolutions["rev8-33"].steps, 4)).toEqual({
      start: 4,
      end: 12,
    });
    expect(proofSection(textbookSolutions["rev8-31"].steps, 14).start).toBe(12);
  });
  it("keeps preliminary angle calculations together with their proof", () => {
    for (const id of ["qp8-5", "ex8b-16", "qp8-2"]) {
      const steps = textbookSolutions[id].steps;
      for (let i = 0; i < steps.length; i++)
        expect(proofSection(steps, i)).toEqual({ start: 0, end: steps.length });
    }
  });
  it("never includes an earlier printed part or a future part in any of the 72 solutions", () => {
    for (const solution of Object.values(textbookSolutions)) {
      const before = JSON.stringify(solution);
      for (let i = 0; i < solution.steps.length; i++) {
        const section = proofSection(solution.steps, i);
        expect(section.start).toBeLessThanOrEqual(i);
        expect(section.end).toBeGreaterThan(i);
        for (let j = section.start + 1; j < section.end; j++)
          expect(solution.steps[j].heading ?? "").not.toMatch(
            /^\([a-z]+\)(?:\s|$)/i,
          );
      }
      expect(JSON.stringify(solution)).toBe(before);
    }
  });
});
