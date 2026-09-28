import { describe, expect, it } from "vitest";
import { scoreRun } from "./scoring";
import { CODE_ALPHABET, displayCode, normaliseCode, validJoinCode } from "./codes";
import { ADJECTIVES, ANIMALS, nickname, validNicknameIndex } from "./nicknames";

describe("directed scoring", () => {
  const marks = ["correct","correct","correct","wrong","correct","correct","correct","correct"] as const;
  it("scores both penalty choices and a negative total", () => {
    expect(scoreRun(marks,"directed",null).total).toBe(80);
    expect(scoreRun(marks,"gentle",null).total).toBe(85);
    expect(scoreRun(["wrong","wrong","wrong","wrong"],"directed",null).total).toBe(-20);
  });
  it("limits the speed bonus to the accuracy contribution", () => {
    const ten = Array(10).fill("correct") as "correct"[];
    expect(scoreRun(ten,"directed",75).total).toBe(155);
    expect(scoreRun(ten,"directed",150).speedBonus).toBe(0);
    expect(scoreRun(ten,"directed",0).speedBonus).toBe(30);
    expect(scoreRun(ten,"directed",null).speedBonus).toBe(0);
  });
  it("does not count skipped questions as wrong", () => {
    expect(scoreRun(["correct","skipped","wrong"],"directed",null).total).toBe(5);
  });
});
describe("safe names and join codes", () => {
  it("uses only indexed nickname parts", () => {
    expect(ADJECTIVES).toHaveLength(24); expect(ANIMALS).toHaveLength(16);
    expect(nickname([23,0])).toBe("Swift Fox");
    expect(validNicknameIndex([24,0])).toBe(false);
    expect(validNicknameIndex([1.5,0])).toBe(false);
  });
  it("normalises and validates the agreed alphabet", () => {
    expect(CODE_ALPHABET).not.toContain("O"); expect(CODE_ALPHABET).not.toContain("0");
    expect(normaliseCode("k7p 4qx")).toBe("K7P4QX");
    expect(displayCode("k7p4qx")).toBe("K7P 4QX");
    expect(validJoinCode("k7p 4qx")).toBe(true);
    expect(validJoinCode("OOO 000")).toBe(false);
  });
});
