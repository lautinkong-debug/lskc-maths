import { describe, expect, it } from "vitest";
import {
  forThreeLanes,
  makeMathsBank,
  parseBank,
} from "@/apps/classroom-games/questions";

describe("classroom game question banks", () => {
  it.each([9, 20, 40, 80])(
    "generates %i different maths questions with reachable answers",
    (count) => {
      const questions = makeMathsBank(count);
      expect(questions).toHaveLength(count);
      expect(new Set(questions.map((q) => q.question)).size).toBe(count);
      questions.forEach((q, index) => {
        const n = Math.floor(index / 5) + 2;
        const answers = [
          n,
          4 * n + 6,
          180 - 65 - (n + 25),
          n * 20 * 0.8,
          n ** 2 + 3,
        ];
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options[q.correctIndex]).toBe(String(answers[index % 5]));
      });
    },
  );

  it("parses pipe-delimited teacher questions with the first answer correct", () => {
    const rows = parseBank(
      "  What is 2 + 3? | 5 | 1 | 2 | 7\r\n\r\n 求 3² 的值。 | 9 | 3 | 6 | 27 ",
    );
    expect(rows.map((row) => row.options[row.correctIndex])).toEqual([
      "5",
      "9",
    ]);
    expect(rows[1].question).toBe("求 3² 的值。");
  });

  it("normalises numerical JSON choices and keeps their original order and explanation", () => {
    const row = parseBank(
      '[{"question":" 3² = ? ","options":[" 6 ",7,8,9],"correctIndex":3,"explanation":"3 × 3"}]',
    )[0];
    expect(row).toEqual({
      question: "3² = ?",
      options: ["6", "7", "8", "9"],
      correctIndex: 3,
      explanation: "3 × 3",
    });
  });

  it.each([0, 1, 2, 3])(
    "keeps the correct option from position %i among the three visible lanes",
    (correctIndex) => {
      const row = {
        question: "Pick a value",
        options: ["1", "2", "3", "4"],
        correctIndex,
        explanation: "Review",
      };
      const mapped = forThreeLanes(row);
      expect(mapped.options).toHaveLength(3);
      expect(new Set(mapped.options).size).toBe(3);
      expect(mapped.options[mapped.correctIndex]).toBe(
        row.options[correctIndex],
      );
      expect(mapped.explanation).toBe(row.explanation);
      expect(row.options).toEqual(["1", "2", "3", "4"]);
    },
  );

  it("accepts a three-option bank for three-lane games", () => {
    const raw = "Which is less than zero? | −2 | 2 | 3";
    const row = parseBank(raw, 3)[0];
    expect(row.options[row.correctIndex]).toBe("−2");
    expect(forThreeLanes(row)).toEqual(row);
    expect(() => parseBank(raw)).toThrow(/four different choices/);
  });

  it.each([
    "",
    "[]",
    "[{",
    "[null]",
    "Q | 1 |  1 | 2 | 3",
    "Q | 1 | 2 | 3 |",
    '[{"question":"Q","options":[1,2,3,4],"correctIndex":4}]',
    '[{"question":"Q","options":[1,2,3,4],"correctIndex":0.5}]',
    '[{"question":"Q","options":[1,null,3,4],"correctIndex":1}]',
  ])("rejects invalid input %s", (raw) => {
    expect(() => parseBank(raw)).toThrow();
  });
});
