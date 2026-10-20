import { copy } from "@/lib/copy";
import { GeometryText } from "./Notation";
import type { SourceQuestion } from "./types";
import {
  criterionNames,
  type Condition,
  type ReasonPair,
  type ReasonView,
} from "./reasons";
import { markColours } from "./ReasonMarks";
import styles from "./similarity.module.css";

const c = copy.similarity;
const titles = {
  ...criterionNames,
  AAA: c.aaaReason,
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
  const [a, b] = pair.shapes.map((i) => question.shapes[i]);
  const conclusion = `${a.name} ${pair.criterion === "not-similar" ? "≁" : "∼"} ${b.name}`;
  const establishing = rows
    .filter((r) => !r.consequence && pair.criterion !== "given")
    .sort((a, b) =>
      pair.criterion === "SAS"
        ? Number(a.kind === "angle") - Number(b.kind === "angle")
        : 0,
    );
  const consequences = rows.filter(
    (r) => r.consequence || pair.criterion === "given",
  );
  const sideSteps = establishing.filter((r) => r.kind === "side");
  const ratioSummary = sideSteps
    .map((r) => r.text.split(" = ")[0])
    .join(pair.criterion === "not-similar" ? " ≠ " : " = ");
  function proofRow(r: Condition) {
    return (
      <tr key={r.id}>
        <td>
          <button
            aria-pressed={focus === r.id}
            onClick={() => onFocus(focus === r.id ? null : r.id)}
            data-testid={`condition-${r.id}`}
            style={{ color: markColours[r.index % 3] }}
          >
            <GeometryText>{r.text}</GeometryText>
          </button>
        </td>
        <td data-testid="proof-reason">
          <GeometryText>{r.note}</GeometryText>
        </td>
      </tr>
    );
  }
  return (
    <section
      className={styles.reasonPanel}
      data-testid="diagram-reasons"
      aria-label={c.proofTitle}
    >
      <h3>
        {pair.criterion === "given"
          ? c.proofGiven
          : pair.criterion === "not-similar"
            ? c.proofCounterexample
            : c.proofTitle}
      </h3>
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
                  {p.shapes.map((j) => question.shapes[j].name).join(" & ")}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className={styles.tools} role="group" aria-label={c.markOptions}>
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
      <p>
        {pair.criterion === "given"
          ? c.givenHint
          : view === "proof"
            ? c.proofOnlyHint
            : c.reasonHint}
      </p>
      {!pair.shapes.every((i) => selected.includes(i)) && (
        <p role="status">{c.missingPair}</p>
      )}
      <table className={styles.proofTable} aria-label={c.proofTitle}>
        <caption>
          <GeometryText>{`${c.proofIn} ${a.name} ${c.proofAnd} ${b.name},`}</GeometryText>
        </caption>
        <colgroup>
          <col style={{ width: "56%" }} />
          <col style={{ width: "44%" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{c.proofStatement}</th>
            <th scope="col">{c.proofReason}</th>
          </tr>
        </thead>
        <tbody>
          {establishing
            .filter((r) => pair.criterion !== "SAS" || r.kind === "side")
            .map(proofRow)}
          {sideSteps.length > 1 && (
            <tr data-testid="proof-ratio-summary">
              <td>
                ∴ <GeometryText>{ratioSummary}</GeometryText>
              </td>
              <td>
                {pair.criterion === "not-similar"
                  ? c.unequalRatios
                  : c.equalRatios}
              </td>
            </tr>
          )}
          {pair.criterion === "SAS" &&
            establishing.filter((r) => r.kind === "angle").map(proofRow)}
          <tr
            className={styles.proofConclusion}
            data-testid="similarity-conclusion"
          >
            <td>
              {pair.criterion !== "given" && "∴ "}
              <GeometryText>{conclusion}</GeometryText>
            </td>
            <td>{criterionNames[pair.criterion]}</td>
          </tr>
          {consequences.length > 0 && (
            <tr>
              <th className={styles.afterProof} colSpan={2}>
                {pair.criterion === "given"
                  ? c.givenConsequences
                  : c.afterSimilarity}
              </th>
            </tr>
          )}
          {consequences.map(proofRow)}
        </tbody>
      </table>
      {focus !== null && (
        <button className={styles.clearCondition} onClick={() => onFocus(null)}>
          {c.allMarks}
        </button>
      )}
      {rows.some((r) => r.kind === "side") && <p>{c.originalLengths}</p>}
    </section>
  );
}
