import { useEffect, useState, useId, useRef, useLayoutEffect } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { type Ast } from "../lib/parse";
import { expressionTex, type Step } from "../lib/steps";
import { highlightedTex, signArrowTex } from "../lib/demonstration";
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
  arrowPhase = 0,
}: {
  tex: string;
  nextStep?: Step;
  highlight: boolean;
  latest: boolean;
  original?: boolean;
  arrowPhase?: number;
}) {
  const marked = nextStep ? signArrowTex(nextStep) : null;
  const pair = marked ? nextStep!.ruleId : null;
  const root = useRef<HTMLDivElement>(null);
  const marker = useId().replaceAll(":", "");
  const markedTex = marked ? `${original ? "" : "= "}${marked}` : tex;
  useLayoutEffect(() => {
    const node = root.current;
    if (!node || !marked) return;
    const measure = () => {
      const signs = [
        ...node.querySelectorAll(
          `.${styles.plain} .katex-html [style*="color"]`,
        ),
      ].filter((el) => /^[+−-]$/.test(el.textContent ?? ""));
      if (signs.length !== 2) return;
      const box = node.getBoundingClientRect();
      const [a, b] = signs.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left - box.left + r.width / 2;
      });
      const middle = (a + b) / 2;
      node
        .querySelector('[data-arrow="first"]')
        ?.setAttribute("d", `M ${a} 2 Q ${a} 15 ${middle - 3} 30`);
      node
        .querySelector('[data-arrow="second"]')
        ?.setAttribute("d", `M ${b} 2 Q ${b} 15 ${middle + 3} 30`);
      node
        .querySelector("[data-result-sign]")
        ?.setAttribute("x", String(middle));
      node.setAttribute("data-arrows-positioned", "true");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [marked, markedTex]);
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
        ref={root}
        className={`${styles.layers} ${highlight ? styles.highlighted : ""} ${arrowPhase > 0 ? styles.arrowsShown : ""} ${arrowPhase > 1 ? styles.arrowsCombined : ""}`}
      >
        <Tex className={styles.plain} label={tex}>
          {markedTex}
        </Tex>
        {nextStep && (
          <span className={styles.highlight} aria-hidden="true">
            <Tex>{`${original ? "" : "= "}${highlightedTex(nextStep)}`}</Tex>
          </span>
        )}
        {pair && (
          <div className={styles.arrowsRow} aria-hidden={arrowPhase === 0}>
            <div className={styles.arrowContents}>
              <svg
                height="60"
                className={styles.arrows}
                data-testid="sign-combination"
                role="img"
                aria-label={t.signPair(
                  pair[0],
                  pair[1],
                  pair[0] === pair[1] ? "+" : "−",
                )}
              >
                <defs>
                  <marker
                    id={marker}
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
                  </marker>
                </defs>
                <path
                  data-arrow="first"
                  pathLength="1"
                  className={styles.signArrow}
                  markerEnd={`url(#${marker})`}
                />
                <path
                  data-arrow="second"
                  pathLength="1"
                  className={styles.signArrow}
                  markerEnd={`url(#${marker})`}
                />
                <text
                  data-result-sign="true"
                  y="57"
                  textAnchor="middle"
                  className={styles.resultSign}
                >
                  {pair[0] === pair[1] ? "+" : "−"}
                </text>
              </svg>
            </div>
          </div>
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
        arrowPhase={position}
      />
      <ol className={styles.working} aria-label={t.allSteps}>
        {steps.slice(0, Math.ceil(position / 2)).map((step, index) => {
          const applied = index < completed;
          return (
            <li
              key={index}
              className={styles.step}
              data-testid="working-step"
              data-completed={applied}
            >
              <div className={styles.stepContents}>
                <div className={styles.note}>
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
                        arrowPhase={Math.max(0, position - (index + 1) * 2)}
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
