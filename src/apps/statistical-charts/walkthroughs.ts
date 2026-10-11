import { groupedTable } from "./statistics";
export const weightRows = groupedTable(
  [5, 12, 11, 5, 3].map((frequency, i) => ({
    lower: 41 + i * 10,
    upper: 50 + i * 10,
    frequency,
  })),
  1,
).rows;
// Explicit teaching reconstruction, not a digitisation of the photographed graph.
export const billRows = groupedTable(
  [5, 20, 25, 12, 12, 6].map((frequency, i) => ({
    lower: 301 + i * 100,
    upper: 400 + i * 100,
    frequency,
  })),
  1,
).rows;
export const walkthroughLengths = [16, 6, 5, 10];
