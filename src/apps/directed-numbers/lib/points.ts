export type Point = { id: string; value: number };
export function pointRange(
  points: Point[],
  opposite?: number,
): [number, number] {
  const values = points.map((p) => p.value);
  if (opposite !== undefined) values.push(opposite);
  return [
    Math.min(-10, ...values.map((v) => v - 2)),
    Math.max(10, ...values.map((v) => v + 2)),
  ];
}
export function comparisonRule(a: number, b: number) {
  if (a === b) return "equal";
  if (a === 0 || b === 0) return "zeroRule";
  if (a < 0 && b < 0) return "negativeRule";
  if (a > 0 && b > 0) return "positiveRule";
  return "mixedRule";
}
export function orderMistake(values: number[], ascending: boolean) {
  return values.findIndex(
    (value, i) =>
      i > 0 && (ascending ? values[i - 1] > value : values[i - 1] < value),
  );
}
export function moveItem<T>(values: T[], from: number, to: number): T[] {
  if (from < 0 || from >= values.length || to < 0 || to >= values.length)
    return values;
  const next = [...values],
    [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
export const orderSets = [
  [3, -8, 0, -2, 7, -5],
  [-1, 6, -9, 4, 0, -3],
  [8, -6, 2, -10, 5, 0],
];
