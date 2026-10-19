import { copy } from "@/lib/copy";
import { GeometryText } from "./Notation";
import type { SourceQuestion } from "./types";
import type { Condition, ReasonPair, ReasonView } from "./reasons";
import { markColours } from "./ReasonMarks";
import styles from "./similarity.module.css";

const c = copy.similarity;
const titles = {
  AAA: c.aaaReason,
  SSS: c.sssReason,
  SAS: c.sasReason,
  given: c.givenReason,
  polygon: c.polygonReason,
  "not-similar": c.notSimilarReason,
};
export function ReasonsPanel({
  question,
  pairs,
  pairIndex,
  onPair,
  view,
  onView,
  rows,
  focus,
  onFocus,
  selected,
}: {
  question: SourceQuestion;
  pairs: ReasonPair[];
  pairIndex: number;
  onPair: (i: number) => void;
  view: ReasonView;
  onView: (v: ReasonView) => void;
  rows: Condition[];
  focus: string | null;
  onFocus: (id: string | null) => void;
  selected: number[];
}) {
  const pair = pairs[pairIndex];
  if (!pair) return null;
  return (
    <section className={styles.reasonPanel} data-testid="diagram-reasons">
      <div className={styles.reasonHeading}>
        <strong>{titles[pair.criterion]}</strong>
        {pairs.length > 1 ? (
          <label>
            {c.reasonPair}{" "}
            <select
              value={pairIndex}
              onChange={(e) => onPair(Number(e.target.value))}
            >
              {pairs.map((p, i) => (
                <option key={i} value={i}>
                  {p.shapes.map((j) => question.shapes[j].name).join(" / ")}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span>
            <GeometryText>
              {pair.shapes.map((i) => question.shapes[i].name).join(" / ")}
            </GeometryText>
          </span>
        )}
        <div className={styles.tools}>
          <button onClick={() => onFocus(null)} aria-pressed={focus === null}>
            {c.allMarks}
          </button>
          <>
            <button
              onClick={() => onView("both")}
              aria-pressed={view === "both"}
            >
              {c.bothMarks}
            </button>
            <button
              onClick={() => onView("proof")}
              aria-pressed={view === "proof"}
            >
              {c.proofMarks}
            </button>
            <button
              onClick={() => onView("angles")}
              aria-pressed={view === "angles"}
            >
              {c.angleMarks}
            </button>
            <button
              onClick={() => onView("sides")}
              aria-pressed={view === "sides"}
            >
              {c.sideMarks}
            </button>
          </>
        </div>
      </div>
      <p>{pair.criterion === "given" ? c.givenHint : c.reasonHint}</p>
      {!pair.shapes.every((i) => selected.includes(i)) && (
        <p role="status">{c.missingPair}</p>
      )}
      <div className={styles.reasonRows}>
        {rows.map((r) => (
          <button
            key={r.id}
            aria-pressed={focus === r.id}
            onClick={() => onFocus(focus === r.id ? null : r.id)}
            data-testid={`condition-${r.id}`}
          >
            <span
              className={styles.conditionSymbol}
              style={{ color: markColours[r.index % 3] }}
            >
              {r.kind === "angle"
                ? r.degrees !== undefined
                  ? `${r.degrees}°`
                  : [
                      "α",
                      "β",
                      "γ",
                      "δ",
                      "ε",
                      "ζ",
                      "η",
                      "θ",
                      "ι",
                      "κ",
                      "λ",
                      "μ",
                    ][r.index]
                : r.index + 1}
            </span>
            <span>
              <GeometryText>{r.text}</GeometryText>
              <small>
                <GeometryText>{r.note}</GeometryText>
              </small>
            </span>
          </button>
        ))}
      </div>
      {rows.some((r) => r.kind === "side") && <p>{c.originalLengths}</p>}
    </section>
  );
}
