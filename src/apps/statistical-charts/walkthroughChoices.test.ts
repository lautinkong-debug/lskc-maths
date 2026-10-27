import { expect, it } from "vitest";
import { conceptRows, frequencyRises } from "./concepts";
import { cumulativePoints } from "./statistics";
import { histogramWalkthroughChoices } from "./walkthroughChoiceData";

it("reconstructs all four printed bar patterns and their cumulative totals", () => {
  const expected = [
    [0, 2, 6, 10, 14, 18, 26],
    [0, 4, 8, 8, 8, 12, 16],
    [0, 6, 9, 9, 9, 12, 18],
    [0, 8, 12, 16, 20, 24, 32],
  ];
  histogramWalkthroughChoices.forEach((values, i) => {
    const rows = conceptRows(values);
    expect(cumulativePoints(rows).map((p) => p.y)).toEqual(expected[i]);
    expect(frequencyRises(rows)).toEqual(values);
  });
});
it("only B has a flat middle with equal rises on each side", () => {
  expect(
    histogramWalkthroughChoices.map(
      (v) => v[2] === 0 && v[3] === 0 && v[0] === v[1] && v[4] === v[5],
    ),
  ).toEqual([false, true, false, false]);
});
