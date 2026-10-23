import type { Point, SourceQuestion } from "./types";
import type { TextbookStep } from "./textbook-types";
import { placeAngleLabels } from "./angleLabels";
import { equalAngleReference, stepGeometry } from "./stepGeometry";
import type { LabelBox } from "./vertexLabels";

export type CorrespondencePair = {
  key: string;
  kind: "side" | "angle";
  members: { triangle: string; name: string }[];
  label: string;
};
export type Correspondence = {
  vertices: [string, string][];
  pairs: CorrespondencePair[];
};

export const matchesTriangle = (triangle: string, labels: string[]) =>
  triangle.length === labels.length &&
  [...triangle].every((v) => labels.includes(v));

export const correspondenceLabelKey = (triangle: string, name: string) =>
  `${triangle}:${name}`;

/** Allocate both members together so stacked triangles cannot overprint names. */
export function layoutCorrespondenceLabels(
  pair: CorrespondencePair | undefined,
  source: Point[],
  shapes: Point[][],
  size = 1,
  reserved?: LabelBox[],
  rightAngles: string[] = [],
) {
  const requests =
    pair?.kind === "angle"
      ? pair.members.flatMap((member) => {
          const placed = shapes.find((ps) =>
            matchesTriangle(
              member.triangle,
              ps.map((p) => p.label),
            ),
          );
          if (!placed) return [];
          return stepGeometry(
            { angles: [member.name] },
            source,
            placed,
          ).angles.map(({ points: [first, vertex, last] }) => ({
            key: correspondenceLabelKey(member.triangle, member.name),
            text: `∠${member.name}`,
            first,
            vertex,
            last,
            right: rightAngles.some((other) =>
              equalAngleReference(member.name, other, source),
            ),
          }));
        })
      : [];
  return placeAngleLabels(requests, {
    size,
    fontSize: Math.max(17 * size, 17),
    vertices: shapes.flat(),
    polygons: shapes,
    reserved,
  });
}

/** Use the printed order, never lengths or proximity in a not-to-scale drawing.
 * A given/recalled similarity is valid too; headings and negated statements are not. */
export function conclusionCorrespondence(
  question: SourceQuestion,
  step?: TextbookStep,
): Correspondence | undefined {
  const match = step?.math
    ?.join(" ")
    .match(/\\triangle\s*([A-Z]{3})\s*\\sim\s*\\triangle\s*([A-Z]{3})/);
  if (!match) return;
  const triangles = [match[1], match[2]];
  if (
    triangles.some(
      (name) =>
        new Set(name).size !== 3 ||
        [...name].some((v) => !question.points.some((p) => p.label === v)),
    )
  )
    return;
  return {
    vertices: [...triangles[0]].map((v, i) => [v, triangles[1][i]]),
    pairs: (["side", "angle"] as const).flatMap((kind) =>
      [0, 1, 2].map((index) => {
        const members = triangles.map((triangle) => ({
          triangle,
          name:
            kind === "side"
              ? triangle[index] + triangle[(index + 1) % 3]
              : triangle[(index + 2) % 3] +
                triangle[index] +
                triangle[(index + 1) % 3],
        }));
        return {
          key: `${triangles.join(":")}:${kind}:${index}`,
          kind,
          members,
          // Corresponding sides are proportional, not necessarily equal.
          label: members
            .map((m) => `${kind === "angle" ? "∠" : ""}${m.name}`)
            .join(kind === "angle" ? " = " : " ↔ "),
        };
      }),
    ),
  };
}

/** An extracted copy owns only its explicitly named member, even at a shared
 * vertex or when a different triangle has collinear rays through that vertex. */
export function correspondenceHighlights(
  pair: CorrespondencePair,
  placedLabels?: string[],
  hiddenTriangles: string[] = [],
): TextbookStep["highlights"] {
  const same = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v) => b.includes(v));
  const names = pair.members
    .filter(
      (m) =>
        (!placedLabels || same([...m.triangle], placedLabels)) &&
        !hiddenTriangles.some((t) => same([...t], [...m.triangle])),
    )
    .map((m) => m.name);
  return pair.kind === "side" ? { sides: names } : { angles: names };
}
