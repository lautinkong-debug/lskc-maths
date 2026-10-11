import { groupedTable, rawTable, type Row } from "./statistics";

export const ageExamples = [
  [20, 23, 31, 34, 35, 38, 40, 42, 43, 45, 46, 49, 51, 51, 53],
  [21, 22, 24, 25, 26, 28, 31, 33, 35, 37, 40, 43, 51],
  [21, 25, 31, 33, 35, 37, 41, 43, 45, 47, 51, 55],
  [21, 22, 23, 25, 27, 29, 34, 43, 51, 52, 53, 55, 57, 59],
];
export const cumulativeExamples = [
  [4, 4, 0, 0, 4, 4],
  [2, 6, 0, 0, 6, 2],
  [0, 3, 3, 0, 6, 0],
];
export function ageRows(values: number[]) {
  return rawTable(values, { start: 20, width: 10, count: 4, precision: 1 })
    .rows;
}
export function conceptRows(frequencies: number[]) {
  return groupedTable(
    frequencies.map((frequency, i) => ({
      lower: i * 10,
      upper: (i + 1) * 10,
      frequency,
    })),
    0,
  ).rows;
}
export function frequencyRises(rows: Row[]) {
  return rows.map((row, i) => row.cumulative - (rows[i - 1]?.cumulative ?? 0));
}
export function stemLeaves(values: number[]) {
  return [2, 3, 4, 5].map((stem) => ({
    stem,
    leaves: values
      .filter((v) => Math.floor(v / 10) === stem)
      .map((v) => v % 10)
      .sort((a, b) => a - b),
  }));
}
export function histogramChoices(rows: Row[]) {
  const correct = frequencyRises(rows);
  return [
    correct.map((v) => v + 2),
    correct,
    correct.map((v, i) => v + (i % 2 === 0 ? 2 : 0)),
    correct.map((v, i) => v + (i % 2 === 1 ? 2 : 0)),
  ];
}
