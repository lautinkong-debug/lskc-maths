import { copy } from "@/lib/copy";
import { memo, useEffect, useRef, useState } from "react";
import { Math as MathText } from "@/components/Math";
import { GeometryText } from "./Notation";
import type { SourceQuestion } from "./types";
import { criterionNames, type ReasonPair, type ReasonView } from "./reasons";
import type { TextbookSolution } from "./textbook-types";
import styles from "./similarity.module.css";

const c = copy.similarity;
// Dragging shapes must not re-typeset the entire textbook solution.
const PrintedEquation = memo(function PrintedEquation({
  tex,
}: {
  tex: string;
}) {
  return <MathText>{`\\displaystyle ${tex}`}</MathText>;
});
export function ReasonsPanel({
  classroom = false,
  question,
  pairs,
  pairIndex,
  onPair,
  view,
  onView,
  solution,
  visible,
  onVisible,
  onReset,
  focus,
  onFocus,
  selected,
}: {
  classroom?: boolean;
  question: SourceQuestion;
  pairs: ReasonPair[];
  pairIndex: number;
  onPair: (i: number) => void;
  view: ReasonView;
  onView: (v: ReasonView) => void;
  solution: TextbookSolution;
  visible: number;
  onVisible: (n: number) => void;
  onReset: () => void;
  focus: number | null;
  onFocus: (n: number | null) => void;
  selected: number[];
}) {
  const panel = useRef<HTMLElement>(null);
  const [history, setHistory] = useState(false);
  useEffect(() => {
    if (classroom) {
      panel.current?.querySelector(`.${styles.proofBody}`)?.scrollTo(0, 0);
      return;
    }
    const container = panel.current;
    const row = container?.querySelector(`[data-step-index="${focus}"]`);
    if (!container || !row) return;
    const box = container.getBoundingClientRect(),
      line = row.getBoundingClientRect();
    if (line.bottom > box.bottom - 12)
      container.scrollTop += line.bottom - box.bottom + 12;
    else if (line.top < box.top + 140)
      container.scrollTop -= box.top + 140 - line.top;
  }, [focus, visible, classroom]);
  const pair = pairs[pairIndex];
  function next() {
    setHistory(false);
    const index = Math.min(visible, solution.steps.length - 1);
    onVisible(index + 1);
    onFocus(index);
  }
  return (
    <section
      ref={panel}
      className={styles.reasonPanel}
      data-testid="diagram-reasons"
      aria-label={c.textbookSolution}
    >
      <h3>{c.textbookSolution}</h3>
      {!classroom && <p>{c.textbookStepHint}</p>}
      <div className={styles.solutionControls}>
        <button
          onClick={() => {
            setHistory(false);
            const count = Math.max(0, visible - 1);
            onVisible(count);
            onFocus(count ? count - 1 : null);
          }}
          disabled={visible === 0}
        >
          {c.previousStep}
        </button>
        <button onClick={next} disabled={visible === solution.steps.length}>
          {c.nextStep}
        </button>
        <button
          onClick={() => {
            setHistory(false);
            onReset();
          }}
          disabled={visible === 0 && focus === null}
        >
          {c.resetSolution}
        </button>
        {!classroom && focus !== null && (
          <button onClick={() => onFocus(null)}>{c.allMarks}</button>
        )}
      </div>
      <p role="status">
        {focus === null
          ? c.selectSolutionStep
          : `${c.stepLabel} ${focus + 1} / ${solution.steps.length}`}
      </p>
      {classroom && visible > 1 && (
        <button
          className={styles.historyToggle}
          onClick={() => setHistory(!history)}
          aria-expanded={history}
        >
          {history ? c.hidePreviousLines : c.previousLines}
        </button>
      )}
      <div className={styles.proofBody}>
        {classroom && visible === 0 && (
          <div className={styles.proofStart}>
            <span aria-hidden="true">△ ∼ △</span>
            <h4>{c.stepReady}</h4>
            <p>{c.stepReadyHint}</p>
          </div>
        )}
        <table className={styles.proofTable} aria-label={c.textbookSolution}>
          <colgroup>
            <col style={{ width: "64%" }} />
            <col style={{ width: "36%" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{c.proofStatement}</th>
              <th scope="col">{c.proofReason}</th>
            </tr>
          </thead>
          <tbody>
            {solution.steps.slice(0, visible).map((step, i) => (
              <tr
                key={i}
                hidden={classroom && !history && i !== (focus ?? visible - 1)}
                data-testid={
                  step.conclusion ? "similarity-conclusion" : "textbook-step"
                }
                data-step-index={i}
                data-active={focus === i}
                className={step.conclusion ? styles.proofConclusion : undefined}
              >
                <td>
                  <button
                    data-testid={`solution-step-${i}`}
                    aria-label={`${c.highlightStep} ${i + 1}`}
                    aria-pressed={focus === i}
                    onClick={() => {
                      setHistory(false);
                      onFocus(focus === i ? null : i);
                    }}
                  >
                    {step.heading && (
                      <span className={styles.printedLine}>
                        <GeometryText>{step.heading}</GeometryText>
                      </span>
                    )}
                    {step.math?.map((math, j) => (
                      <span className={styles.printedMath} key={j}>
                        <PrintedEquation tex={math} />
                      </span>
                    ))}
                    {step.text && (
                      <span className={styles.printedLine}>
                        <GeometryText>{step.text}</GeometryText>
                      </span>
                    )}
                  </button>
                </td>
                <td data-testid="proof-reason">
                  {step.reason && <GeometryText>{step.reason}</GeometryText>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {solution.sourceNote && (
          <p className={styles.sourceNote}>
            <strong>{c.sourceNote}</strong>{" "}
            <GeometryText>{solution.sourceNote}</GeometryText>
          </p>
        )}
        <p>
          {c.solutionSource} {solution.pages.join(", ")}
        </p>
        <details className={styles.markSettings}>
          <summary>{c.markOptions}</summary>
          {classroom && focus !== null && (
            <button onClick={() => onFocus(null)}>{c.allMarks}</button>
          )}
          <div className={styles.reasonHeading}>
            <button
              onClick={() => {
                onFocus(null);
                onVisible(solution.steps.length);
                setHistory(true);
              }}
              disabled={visible === solution.steps.length}
            >
              {c.showAllSteps}
            </button>
            {pair && <strong>{criterionNames[pair.criterion]}</strong>}
            {pairs.length > 1 && (
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
            )}
            <div
              className={styles.tools}
              role="group"
              aria-label={c.markOptions}
            >
              {(
                [
                  ["both", c.bothMarks],
                  ["proof", c.proofMarks],
                  ["angles", c.angleMarks],
                  ["sides", c.sideMarks],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => onView(v)}
                  aria-pressed={view === v}
                >
                  {label}
                </button>
              ))}
            </div>
            {pair && !pair.shapes.every((i) => selected.includes(i)) && (
              <p role="status">{c.missingPair}</p>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
