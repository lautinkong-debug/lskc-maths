import { copy } from "@/lib/copy";
import { memo, useEffect, useRef, useState } from "react";
import { Math as MathText } from "@/components/Math";
import { GeometryText } from "./Notation";
import type { SourceQuestion } from "./types";
import { criterionNames, type ReasonPair, type ReasonView } from "./reasons";
import type { TextbookSolution } from "./textbook-types";
import type { Correspondence, CorrespondencePair } from "./correspondence";
import { CorrespondencePanel } from "./CorrespondencePanel";
import { proofSection } from "./proofSection";
import styles from "./similarity.module.css";

const c = copy.similarity;
// Dragging shapes must not re-typeset the entire textbook solution.
const PrintedEquation = memo(function PrintedEquation({
  tex,
  fit,
}: {
  tex: string;
  fit: boolean;
}) {
  const line = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = line.current;
    if (!element) return;
    if (!fit) {
      element.style.removeProperty("font-size");
      return;
    }
    const resize = () => {
      const math = element.querySelector<HTMLElement>(".katex-html");
      if (!math || !element.clientWidth) return;
      const current = parseFloat(getComputedStyle(element).fontSize);
      const normal = parseFloat(
        getComputedStyle(element.parentElement!).fontSize,
      );
      const natural = math.getBoundingClientRect().width / current;
      if (!natural) return;
      const size =
        Math.floor(
          Math.min(normal, (element.clientWidth - 1) / natural) * 100,
        ) / 100;
      if (Math.abs(size - current) > 0.02) element.style.fontSize = `${size}px`;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    let mounted = true;
    void document.fonts.ready.then(() => {
      if (mounted) resize();
    });
    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [fit, tex]);
  return (
    <span ref={line} className={styles.printedMath}>
      <MathText>{`\\displaystyle ${tex}`}</MathText>
    </span>
  );
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
  correspondence,
  correspondingPair,
  onCompare,
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
  correspondence?: Correspondence;
  correspondingPair?: CorrespondencePair;
  onCompare: (key: string) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const [history, setHistory] = useState(false);
  const activeStep = focus ?? visible - 1;
  const section = proofSection(solution.steps, activeStep);
  useEffect(() => {
    if (classroom) {
      const body = panel.current?.querySelector(`.${styles.proofBody}`);
      const row = body?.querySelector(`[data-step-index="${focus}"]`);
      if (body && row) {
        const keepVisible = () => {
          // The row can fit even when its table heading also needs space.
          if (!history) body.scrollTop = 0;
          const viewport = body.getBoundingClientRect();
          const line = row.getBoundingClientRect();
          if (line.bottom > viewport.bottom)
            body.scrollTop += line.bottom - viewport.bottom;
          else if (line.top < viewport.top)
            body.scrollTop -= viewport.top - line.top;
        };
        keepVisible();
        if (history) return;
        // The first revealed equation can load fonts after the initial render.
        const observer = new ResizeObserver(keepVisible);
        observer.observe(row);
        observer.observe(body);
        return () => observer.disconnect();
      } else body?.scrollTo(0, 0);
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
  }, [focus, visible, classroom, history]);
  const pair = pairs[pairIndex];
  function next() {
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
      <div
        className={styles.proofBody}
        data-comparing={classroom && !!correspondence && !history}
      >
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
                hidden={
                  classroom &&
                  (i < section.start ||
                    i >= section.end ||
                    (!history && i !== activeStep))
                }
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
                      onFocus(i);
                    }}
                  >
                    {step.heading && (
                      <span className={styles.printedLine}>
                        <GeometryText>{step.heading}</GeometryText>
                      </span>
                    )}
                    {step.math?.map((math, j) => (
                      <PrintedEquation key={j} tex={math} fit={classroom} />
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
        {correspondence && correspondingPair && (
          <CorrespondencePanel
            correspondence={correspondence}
            pair={correspondingPair}
            onCompare={onCompare}
          />
        )}
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
