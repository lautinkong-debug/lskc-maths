import { useEffect, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { type Ast } from "../lib/parse";
import { expressionTex, type Step } from "../lib/steps";
import { highlightedTex } from "../lib/demonstration";
import { button, field, primary } from "./ui";
import styles from "./TeachingSteps.module.css";
const c = copy.apps.directedNumbers;
const t = c.demonstration;

export function useDemonstration(last: number, initial = 0) {
  const [position, setPosition] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [delay, setDelay] = useState(1800);
  useEffect(() => {
    if (!playing || position >= last) return;
    const timer = window.setTimeout(() => {
      setPosition(position + 1);
      if (position + 1 === last) setPlaying(false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [playing, position, last, delay]);
  return {
    position,
    last,
    playing,
    delay,
    setDelay,
    next: () => {
      setPlaying(false);
      setPosition((n) => Math.min(last, n + 1));
    },
    previous: () => {
      setPlaying(false);
      setPosition((n) => Math.max(0, n - 1));
    },
    replay: () => {
      setPosition(0);
      setPlaying(false);
    },
    play: () => {
      if (position === last) setPosition(0);
      setPlaying((value) => !value);
    },
  };
}
export function TeachingControls({
  timeline,
}: {
  timeline: ReturnType<typeof useDemonstration>;
}) {
  return (
    <div
      className="border-grid flex flex-wrap items-center gap-2 border-t pt-3"
      aria-label={t.controls}
    >
      <button className={primary} onClick={timeline.play}>
        {timeline.playing ? t.pause : t.play}
      </button>
      <button
        className={button}
        onClick={timeline.previous}
        disabled={timeline.position === 0}
      >
        {t.previous}
      </button>
      <button
        className={button}
        onClick={timeline.next}
        disabled={timeline.position === timeline.last}
      >
        {t.next}
      </button>
      <button className={button} onClick={timeline.replay}>
        {t.replay}
      </button>
      <label className="flex items-center gap-2 text-sm">
        {t.speed}
        <select
          className={field}
          value={timeline.delay}
          onChange={(e) => timeline.setDelay(Number(e.target.value))}
        >
          <option value="2800">{t.slow}</option>
          <option value="1800">{t.normal}</option>
        </select>
      </label>
      <span className="text-pencil text-sm">
        {t.progress(timeline.position, timeline.last)}
      </span>
    </div>
  );
}

/** Stable equation layers prevent highlighted KaTeX from shifting the line. */
function EquationLine({
  tex,
  nextStep,
  highlight,
  latest,
  original = false,
}: {
  tex: string;
  nextStep?: Step;
  highlight: boolean;
  latest: boolean;
  original?: boolean;
}) {
  return (
    <div
      className={styles.equation}
      data-testid={
        highlight
          ? "before-equation"
          : latest && !original
            ? "after-equation"
            : undefined
      }
      data-equation-line="true"
      data-tex={tex}
    >
      <div
        className={`${styles.layers} ${highlight ? styles.highlighted : ""}`}
      >
        <Tex className={styles.plain}>{tex}</Tex>
        {nextStep && (
          <span className={styles.highlight} aria-hidden="true">
            <Tex>{`${original ? "" : "= "}${highlightedTex(nextStep)}`}</Tex>
          </span>
        )}
      </div>
    </div>
  );
}

export function EquationFrame({
  ast,
  steps,
  position,
}: {
  ast: Ast;
  steps: Step[];
  position: number;
}) {
  const completed = Math.min(steps.length, Math.floor(position / 2));
  const highlighting = position % 2 === 1 && completed < steps.length;
  const notes: Record<string, string> = {
    ...c.bracketLesson.notes,
    ...c.arithmetic.notes,
  };
  return (
    <div
      className="min-w-0"
      data-testid="equation-frame"
      data-phase={
        position === 0 ? "start" : highlighting ? "highlight" : "applied"
      }
    >
      <EquationLine
        tex={expressionTex(ast)}
        nextStep={steps[0]}
        highlight={highlighting && completed === 0}
        latest={completed === 0}
        original
      />
      <ol className={styles.working} aria-label={t.allSteps}>
        {steps.slice(0, Math.ceil(position / 2)).map((step, index) => {
          const applied = index < completed;
          const pair = ["++", "+-", "-+", "--"].includes(step.ruleId)
            ? step.ruleId
            : null;
          return (
            <li
              key={index}
              className={styles.step}
              data-testid="working-step"
              data-completed={applied}
            >
              <div className={styles.stepContents}>
                <div className={styles.note}>
                  {pair && (
                    <span
                      className={`${styles.signs} ${applied ? styles.combine : ""}`}
                      data-testid="sign-combination"
                      aria-label={t.signPair(
                        pair[0],
                        pair[1],
                        pair[0] === pair[1] ? "+" : "−",
                      )}
                    >
                      <span aria-hidden="true" className={styles.first}>
                        {pair[0] === "-" ? "−" : "+"}
                      </span>
                      <span aria-hidden="true" className={styles.bracketLeft}>
                        (
                      </span>
                      <span aria-hidden="true" className={styles.second}>
                        {pair[1] === "-" ? "−" : "+"}
                      </span>
                      <span aria-hidden="true" className={styles.bracketRight}>
                        )
                      </span>
                      <strong aria-hidden="true" className={styles.combined}>
                        {pair[0] === pair[1] ? "+" : "−"}
                      </strong>
                    </span>
                  )}
                  <span>{notes[step.noteKey]}</span>
                </div>
                <div
                  className={`${styles.result} ${applied ? styles.expanded : ""}`}
                  aria-hidden={!applied}
                >
                  <div className={styles.resultContents}>
                    {applied && (
                      <EquationLine
                        tex={`= ${step.tex}`}
                        nextStep={steps[index + 1]}
                        highlight={highlighting && index + 1 === completed}
                        latest={index + 1 === completed}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
