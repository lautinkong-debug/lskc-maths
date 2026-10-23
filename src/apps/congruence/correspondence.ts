import { extractEvidence, type EvidenceRow } from "./evidence";
import type { CongruenceQuestion } from "./types";

export type Correspondence = {
  triangles: [string, string];
  vertices: [string, string][];
  pairs: EvidenceRow[];
};

const canonical = (kind: EvidenceRow["kind"], name: string) =>
  kind === "side"
    ? [...name].sort().join("")
    : `${name[1]}:${[name[0], name[2]].sort().join("")}`;

/** Congruence fixes correspondence by vertex order, never by drawing proximity.
 * Do not infer a result from a heading, similarity, or a negated conclusion. */
export function conclusionCorrespondence(
  question: CongruenceQuestion,
  current: number,
): Correspondence | undefined {
  const step = question.steps[current];
  if (!step) return;
  const match = step.math
    ?.join(" ")
    .match(/\\triangle\s*([A-Z]{3})\s*\\cong\s*\\triangle\s*([A-Z]{3})/);
  if (!match) return;
  const triangles: [string, string] = [match[1], match[2]];
  if (
    triangles.some(
      (name) =>
        new Set(name).size !== 3 ||
        [...name].some(
          (letter) => !question.points.some((p) => p.label === letter),
        ),
    )
  )
    return;
  const known = extractEvidence(question, current, "all");
  const pairs = (["side", "angle"] as const).flatMap((kind) =>
    [0, 1, 2].map((index): EvidenceRow => ({
      key: `correspondence:${triangles.join(":")}:${kind}:${index}`,
      kind,
      marker: 1,
      stepIndices: [current],
      members: triangles.map((triangle) => {
        const name =
          kind === "side"
            ? triangle[index] + triangle[(index + 1) % 3]
            : triangle[(index + 2) % 3] +
              triangle[index] +
              triangle[(index + 1) % 3];
        const value = known
          .filter((row) => row.kind === kind)
          .flatMap((row) => row.members)
          .find(
            (member) =>
              member.value &&
              canonical(kind, member.name) === canonical(kind, name),
          );
        const right =
          kind === "angle" &&
          question.rightAngles?.some(
            (angle) => canonical(kind, angle) === canonical(kind, name),
          );
        return {
          name,
          ...(value
            ? { value: value.value, degrees: value.degrees }
            : right
              ? { value: "90°", degrees: 90 }
              : {}),
        };
      }),
    })),
  );
  return {
    triangles,
    vertices: [...triangles[0]].map((name, i) => [name, triangles[1][i]]),
    pairs,
  };
}
