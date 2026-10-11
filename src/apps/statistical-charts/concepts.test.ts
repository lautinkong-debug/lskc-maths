import { describe, expect, it } from "vitest";
import {
  ageExamples,
  ageRows,
  conceptRows,
  cumulativeExamples,
  frequencyRises,
  histogramChoices,
  stemLeaves,
} from "./concepts";
describe("representation connections", () => {
  it("counts duplicate leaves as distinct observations in the supplied example", () => {
    expect(stemLeaves(ageExamples[0]).map((r) => r.leaves)).toEqual([
      [0, 3],
      [1, 4, 5, 8],
      [0, 2, 3, 5, 6, 9],
      [1, 1, 3],
    ]);
    expect(ageRows(ageExamples[0]).map((r) => r.frequency)).toEqual([
      2, 4, 6, 3,
    ]);
    expect(ageRows(ageExamples[0]).at(-1)?.cumulative).toBe(15);
  });
  it("recovers frequencies by differences, including an extended plateau", () => {
    const rows = conceptRows(cumulativeExamples[0]);
    expect(rows.map((r) => r.cumulative)).toEqual([4, 8, 8, 8, 12, 16]);
    expect(frequencyRises(rows)).toEqual([4, 4, 0, 0, 4, 4]);
    for (const frequencies of cumulativeExamples) {
      const options = histogramChoices(conceptRows(frequencies));
      expect(options[1]).toEqual(frequencies);
      expect(new Set(options.map((v) => v.join())).size).toBe(4);
    }
  });
});
