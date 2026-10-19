import { centre } from "./geometry";
import type { Condition, ReasonPair } from "./reasons";
import type { Point } from "./types";

export type PlacedShape = { id: number; points: Point[]; colour: string };
export function pairedSideLabels(
  shapes: PlacedShape[],
  groups: number[][],
  pair: ReasonPair | undefined,
  rows: Condition[],
  size = 1,
) {
  if (
    !pair ||
    !groups.some((group) => pair.shapes.every((id) => group.includes(id)))
  )
    return [];
  const members = pair.shapes.map((id) => shapes.find((s) => s.id === id)!);
  const vertices = members[0].points.map((_, i) => ({
    ...centre(members.map((s) => s.points[i])),
    label: "",
  }));
  const middle = centre(vertices);
  const [numerator, denominator = "1"] = (pair.ratio ?? "k").split("/");
  const ratio = `${numerator}:${denominator}`;
  return rows
    .filter((r) => r.kind === "side" && r.edge)
    .map((row) => {
      const edge = row.edge!;
      const names = members.map((s) =>
        edge.map((i) => s.points[i].label).join(""),
      );
      const values =
        row.values ?? pair.lengths?.map((lengths) => lengths[row.index] ?? "");
      const text = names
        .map((name, i) => `${name}${values?.[i] ? ` = ${values[i]}` : ""}`)
        .join(" ↔ ");
      const a = vertices[edge[0]],
        b = vertices[edge[1]],
        mid = centre([a, b]);
      const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      let nx = -(b.y - a.y) / length,
        ny = (b.x - a.x) / length;
      if (nx * (mid.x - middle.x) + ny * (mid.y - middle.y) < 0) {
        nx *= -1;
        ny *= -1;
      }
      const width =
        Math.max(text.length * 9.5 + 24, ratio.length * 9.5 + 90) * size;
      const height = 52 * size,
        gap = 15 * size;
      const x =
        mid.x +
        (Math.abs(nx) > 0.35 ? Math.sign(nx) * (width / 2 + gap) : nx * gap) -
        width / 2;
      const y =
        mid.y +
        (Math.abs(ny) > 0.35 ? Math.sign(ny) * (height / 2 + gap) : ny * gap) -
        height / 2;
      return {
        row,
        names,
        values,
        ratio,
        text,
        colours: members.map((s) => s.colour),
        mid,
        x,
        y,
        width,
        height,
        size,
      };
    });
}
export type PairedSideLabel = ReturnType<typeof pairedSideLabels>[number];
export function sideLabelPoints(labels: PairedSideLabel[]): Point[] {
  return labels.flatMap((l) => [
    { x: l.x, y: l.y, label: "" },
    { x: l.x + l.width, y: l.y + l.height, label: "" },
  ]);
}
