"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Math as MathText } from "@/components/Math";
import { copy } from "@/lib/copy";
import { GeometryText } from "../similarity/Notation";
import type { CongruenceQuestion } from "./types";
import styles from "./congruence.module.css";

const c = copy.similarity;
const Equation = memo(function Equation({ tex }: { tex: string }) {
  return <MathText>{`\\displaystyle ${tex}`}</MathText>;
});

export function Solution({
  question,
  current,
  onStep,
}: {
  question: CongruenceQuestion;
  current: number;
  onStep: (step: number) => void;
}) {
  const [history, setHistory] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo(0, 0);
  }, [current]);
  function change(next: number) {
    setHistory(false);
    onStep(next);
  }
  return (
    <section
      className={styles.solution}
      aria-label={c.textbookSolution}
      data-testid="congruence-solution"
    >
      <div className={styles.stepControls}>
        <button disabled={current < 0} onClick={() => change(current - 1)}>
          {c.previousStep}
        </button>
        <button
          className={styles.primary}
          disabled={current >= question.steps.length - 1}
          onClick={() => change(current + 1)}
        >
          {c.nextStep}
        </button>
        <button disabled={current < 0} onClick={() => change(-1)}>
          {c.resetSolution}
        </button>
      </div>
      <p className={styles.stepCount} role="status">
        {current < 0
          ? c.selectSolutionStep
          : `${c.stepLabel} ${current + 1} / ${question.steps.length}`}
      </p>
      {current > 0 && (
        <button
          className={styles.history}
          aria-expanded={history}
          onClick={() => setHistory(!history)}
        >
          {history ? c.hidePreviousLines : c.previousLines}
        </button>
      )}
      <div ref={body} className={styles.solutionBody}>
        {current < 0 ? (
          <div className={styles.start}>
            <span aria-hidden="true">△ ≅ △</span>
            <h3>{copy.congruence.start}</h3>
            <p>{copy.congruence.startHint}</p>
          </div>
        ) : (
          <table className={styles.proofTable} aria-label={c.textbookSolution}>
            <thead>
              <tr>
                <th scope="col">{c.proofStatement}</th>
                <th scope="col">{c.proofReason}</th>
              </tr>
            </thead>
            <tbody>
              {question.steps.slice(0, current + 1).map((step, i) => (
                <tr
                  key={i}
                  hidden={!history && i !== current}
                  data-active={i === current}
                  data-step-index={i}
                  data-testid="congruence-step"
                  data-conclusion={step.conclusion || undefined}
                >
                  <td>
                    <button
                      aria-label={`${c.highlightStep} ${i + 1}`}
                      aria-describedby={`congruence-statement-${i}`}
                      aria-pressed={i === current}
                      onClick={() => change(i)}
                    >
                      <span id={`congruence-statement-${i}`}>
                        {step.heading && (
                          <span className={styles.printedLine}>
                            <GeometryText>{step.heading}</GeometryText>
                          </span>
                        )}
                        {step.math?.map((tex, j) => (
                          <span className={styles.printedLine} key={j}>
                            <Equation tex={tex} />
                          </span>
                        ))}
                        {step.text && (
                          <span className={styles.printedLine}>
                            <GeometryText>{step.text}</GeometryText>
                          </span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td>
                    {step.reason && <GeometryText>{step.reason}</GeometryText>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {question.sourceNote && current === question.steps.length - 1 && (
          <p className={styles.note}>
            <strong>{c.sourceNote}</strong> {question.sourceNote}
          </p>
        )}
        <p className={styles.credit}>
          {c.solutionSource} {question.solutionPages.join(", ")}
        </p>
      </div>
    </section>
  );
}
