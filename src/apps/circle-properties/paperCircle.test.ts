import { describe, expect, it } from "vitest";
import {
  foldStage,
  isPaperStep,
  mirrorStage,
  PAPER_RADIUS,
  paperAction,
  paperChords,
  paperLastStage,
  paperTask,
  pythagorasSum,
  wordProgress,
  type PaperStep,
} from "./paperCircle";

describe("paper circle demonstrations", () => {
  it("starts from worksheet paper circle 1, and every chord fits the circle", () => {
    expect(paperChords[0]).toEqual({ half: 4, distance: 3, tilt: 0 });
    expect(pythagorasSum(paperChords[0])).toBe("9 + 16 = 25");
    for (const chord of paperChords)
      expect(chord.half ** 2 + chord.distance ** 2).toBeCloseTo(
        PAPER_RADIUS ** 2,
      );
  });

  it("shows each tag before its word, then the link", () => {
    expect(wordProgress(0)).toEqual({ tags: 0, words: 0, link: false });
    expect(wordProgress(1)).toEqual({ tags: 1, words: 0, link: false });
    expect(wordProgress(2)).toEqual({ tags: 1, words: 1, link: false });
    expect(wordProgress(8)).toEqual({ tags: 4, words: 4, link: false });
    expect(wordProgress(9)).toEqual({ tags: 4, words: 4, link: true });
  });

  it("has a task and an action for every stage of every step", () => {
    for (const step of [0, 1, 2] as PaperStep[])
      for (let stage = 0; stage <= paperLastStage[step]; stage++) {
        expect(paperTask(step, stage)).toBeTruthy();
        expect(paperAction(step, stage)).toBeTruthy();
      }
    expect(paperAction(1, foldStage.start)).toContain("Fold");
    expect(paperAction(1, foldStage.folded)).toContain("Open");
    expect(paperAction(2, mirrorStage.picture)).toContain("Flip");
    for (const step of [0, 1, 2] as PaperStep[])
      expect(paperAction(step, paperLastStage[step])).toBe("Next step →");
  });

  it("keeps a blank hidden for one press before its answer", () => {
    expect(paperAction(2, mirrorStage.radii)).toBe("Show the reason →");
    expect(paperAction(2, mirrorStage.congruent)).toBe("Show the reason →");
    expect(paperAction(2, mirrorStage.halves)).toBe("Show the answer →");
  });

  it("only the first three lesson steps are demonstrations", () => {
    expect([0, 1, 2, 3, 6].map(isPaperStep)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });
});
