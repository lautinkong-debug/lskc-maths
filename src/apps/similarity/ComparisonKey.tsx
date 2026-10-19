import { Math } from "@/components/Math";
import { copy } from "@/lib/copy";
import { GeometryText } from "./Notation";
import { conditions, type ReasonPair } from "./reasons";
import type { SourceQuestion } from "./types";
import styles from "./similarity.module.css";

/** A compact, always-visible key beside each annotated diagram, independent of the proof panel. */
export function ComparisonKey({
  question,
  pair,
  hiddenSides = [],
  showAngles = true,
}: {
  question: SourceQuestion;
  pair: ReasonPair;
  hiddenSides?: string[];
  showAngles?: boolean;
}) {
  const c = copy.similarity;
  const sides = conditions(question, pair, "sides").filter(
    (row) => !hiddenSides.includes(row.id),
  );
  if (!sides.length) return null;
  if (pair.criterion === "not-similar")
    return (
      <div className={styles.matchKey}>
        <strong>{c.notSimilarReason}</strong>
        <GeometryText>{sides.map((s) => s.text).join("; ")}</GeometryText>
      </div>
    );
  const [a, b] = pair.shapes.map((i) => question.shapes[i]);
  const shown = a.vertices.length > 4 ? sides.slice(0, 2) : sides;
  const fractions = shown.map((row) => {
    const edge = row.edge!;
    const labelA = edge.map((i) => a.vertices[i]).join("");
    const labelB = edge.map((i) => b.vertices[i]).join("");
    return `\\frac{\\mathit{${labelA}}}{\\mathit{${labelB}}}`;
  });
  const ratio = pair.ratio?.replace(/√(\d+)/g, "\\sqrt{$1}").split("/");
  const value = ratio
    ? ratio.length === 2
      ? `\\frac{${ratio[0]}}{${ratio[1]}}`
      : ratio[0]
    : "k";
  const tex = `${fractions.join(" = ")}${a.vertices.length > 4 ? " = \\cdots" : ""} = ${value}`;
  const label = `${sides.map((row) => row.text.split(" = ")[0]).join(" = ")} = ${pair.ratio ?? "k"}`;
  return (
    <div className={styles.matchKey} data-testid="corresponding-ratio-key">
      <strong>{c.originalRatio}</strong>
      <Math label={label}>{`\\displaystyle ${tex}`}</Math>
      <small>
        {pair.criterion === "AAA" ? c.followsAAA : c.followsSimilarity}{" "}
        {showAngles && c.matchedAngles}
      </small>
    </div>
  );
}
