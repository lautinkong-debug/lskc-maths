"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Math as MathText } from "@/components/Math";
import { copy } from "@/lib/copy";
import { GeometryText } from "../similarity/Notation";
import type { CongruenceQuestion } from "./types";
import type { Correspondence } from "./correspondence";
import type { EvidenceRow } from "./evidence";
import styles from "./congruence.module.css";

const c = copy.similarity;
const Equation = memo(function Equation({ tex }: { tex: string }) {
  return <MathText>{`\\displaystyle ${tex}`}</MathText>;
});

export function Solution({
  question,
  current,
  onStep,
  correspondence,
  pair,
  onCompare,
}: {
  question: CongruenceQuestion;
  current: number;
  onStep: (step: number) => void;
  correspondence?: Correspondence;
  pair?: EvidenceRow;
  onCompare: (key: string) => void;
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
      <div
        ref={body}
        className={styles.solutionBody}
        data-comparing={!!correspondence && !history}
      >
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
        {correspondence && pair && (
          <div
            className={styles.correspondence}
            data-testid="conclusion-correspondence"
          >
            <h3>{copy.congruence.correspondenceTitle}</h3>
            <p className={styles.vertexOrder}>
              <GeometryText>
                {correspondence.vertices
                  .map(([a, b]) => `${a} ↔ ${b}`)
                  .join(" · ")}
              </GeometryText>
            </p>
            <div
              className={styles.pairKinds}
              role="group"
              aria-label={copy.congruence.correspondingParts}
            >
              {(["side", "angle"] as const).map((kind) => (
                <button
                  key={kind}
                  aria-pressed={pair.kind === kind}
                  onClick={() =>
                    onCompare(
                      correspondence.pairs.find((row) => row.kind === kind)!
                        .key,
                    )
                  }
                >
                  {kind === "side"
                    ? copy.congruence.correspondingSides
                    : copy.congruence.correspondingAngles}
                </button>
              ))}
            </div>
            <div
              className={styles.pairChoices}
              role="group"
              aria-label={copy.congruence.choosePair}
            >
              {correspondence.pairs
                .filter((row) => row.kind === pair.kind)
                .map((row) => (
                  <button
                    key={row.key}
                    aria-pressed={pair.key === row.key}
                    onClick={() => onCompare(row.key)}
                  >
                    <GeometryText>
                      {row.members
                        .map(
                          (member) =>
                            `${row.kind === "angle" ? "∠" : ""}${member.name}`,
                        )
                        .join(" = ")}
                    </GeometryText>
                  </button>
                ))}
            </div>
            <p className={styles.pairHint}>{copy.congruence.pairHint}</p>
            <select
              className={styles.pairSelect}
              aria-label={copy.congruence.choosePair}
              value={pair.key}
              onChange={(event) => onCompare(event.target.value)}
            >
              {(["side", "angle"] as const).map((kind) => (
                <optgroup
                  key={kind}
                  label={
                    kind === "side"
                      ? copy.congruence.correspondingSides
                      : copy.congruence.correspondingAngles
                  }
                >
                  {correspondence.pairs
                    .filter((row) => row.kind === kind)
                    .map((row) => (
                      <option key={row.key} value={row.key}>
                        {row.members
                          .map(
                            (member) =>
                              `${row.kind === "angle" ? "∠" : ""}${member.name}`,
                          )
                          .join(" = ")}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
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
