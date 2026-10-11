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
      className={`${styles.controls} border-grid flex flex-wrap items-center gap-2 border-y px-3 py-2`}
      aria-label={t.controls}
      data-testid="teaching-controls"
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
  const pair = marked ? (nextStep!.signArrows?.pair ?? nextStep!.ruleId) : null;
  const arrowGroups = pair
    ? (nextStep?.signArrows?.groups ?? [
        { signs: pair, result: pair[0] === pair[1] ? "+" : "−" },
      ])
    : [];
  const focused = highlight && Boolean(nextStep);
  const operationArrows = Boolean(nextStep?.signArrows);
  const root = useRef<HTMLDivElement>(null);
  const marker = useId().replaceAll(":", "");
  const markedTex = focused
    ? `${original ? "" : "= "}${highlightedTex(nextStep!, true)}`
    : marked && arrowPhase > 0
      ? `${original ? "" : "= "}${marked}`
      : tex;
  useLayoutEffect(() => {
    const node = root.current;
    if (!node || !marked) return;
    const measure = () => {
      const signs = [
        ...node.querySelectorAll(
          `.${styles.plain} .katex-html [style*="color"]`,
        ),
      ].filter((el) => /^[+−-]$/.test(el.textContent ?? ""));
      const groups = nextStep?.signArrows?.groups ?? [
        { signs: pair!, result: "" },
      ];
      if (
        signs.length !== groups.reduce((n, group) => n + group.signs.length, 0)
      )
        return;
      const box = node.getBoundingClientRect();
      const anchors = signs.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left - box.left + r.width / 2;
      });
      let offset = 0;
      groups.forEach((group, index) => {
        const values = anchors.slice(offset, offset + group.signs.length);
        const middle = (values[0] + values.at(-1)!) / 2;
        const arrows = node.querySelector(`[data-arrow-group="${index}"]`)!;
        values.forEach((value, i) =>
          arrows
            .querySelectorAll("[data-arrow]")
            [i]?.setAttribute(
              "d",
              `M ${value} 2 Q ${value} 15 ${middle + (i - (values.length - 1) / 2) * 6} 30`,
            ),
        );
        arrows
          .querySelector("[data-result-sign]")
          ?.setAttribute("x", String(middle));
        offset += values.length;
      });
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
  }, [marked, markedTex, nextStep, pair]);
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
      data-next-calculation={focused || undefined}
    >
      {focused && <span className="sr-only">{t.calculateNext}</span>}
      <div
        ref={root}
        className={`${styles.layers} ${arrowPhase > 0 ? styles.arrowsShown : ""} ${arrowPhase > 1 || (operationArrows && arrowPhase > 0) ? styles.arrowsCombined : ""}`}
      >
        <Tex className={styles.plain} label={tex}>
          {markedTex}
        </Tex>
        {pair && (
          <div className={styles.arrowsRow} aria-hidden={arrowPhase === 0}>
            <div className={styles.arrowContents}>
              <svg
                height="60"
                className={styles.arrows}
                data-testid="sign-combination"
                role="img"
                aria-label={
                  nextStep?.signArrows?.groups
                    ? arrowGroups
                        .map((group) => t.signGroup(group.signs, group.result))
                        .join("; ")
                    : t.signPair(
                        pair[0],
                        pair[1],
                        pair[0] === pair[1] ? "+" : "−",
                      )
                }
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
                {arrowGroups.map((group, index) => (
                  <g key={index} data-arrow-group={index}>
                    {[...group.signs].map((_, i) => (
                      <path
                        key={i}
                        data-arrow={
                          i === 0
                            ? "first"
                            : i === 1
                              ? "second"
                              : `factor-${i + 1}`
                        }
                        pathLength="1"
                        className={styles.signArrow}
                        markerEnd={`url(#${marker})`}
                      />
                    ))}
                    <text
                      data-result-sign="true"
                      y="57"
                      textAnchor="middle"
                      className={styles.resultSign}
                    >
                      {group.result}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Colour marks only the generated magnitude span; CSS animates that span in place. */
function SplitOperationLine({
  step,
  applied,
  latest,
  highlight,
}: {
  step: Step;
  applied: boolean;
  latest: boolean;
  highlight: boolean;
}) {
  const reveal = step.signReveal;
  const label = `= ${step.batchReveal ? (applied ? step.tex : step.batchReveal.signTex) : `${reveal!.prefix}${reveal!.sign}${applied ? reveal!.magnitude : ""}${reveal!.suffix}`}`;
  const animated =
    step.batchReveal?.animatedTex ??
    `${reveal!.prefix}${reveal!.sign}\\textcolor{#13579B}{${reveal!.magnitude}}${reveal!.suffix}`;
  return (
    <div
      className={`${styles.equation} ${styles.splitOperation} ${applied ? styles.magnitudeShown : ""} ${highlight ? styles.splitFocused : ""}`}
      data-equation-line="true"
      data-tex={label}
      data-testid="operation-sign-magnitude"
      data-magnitude-shown={applied}
      data-next-calculation={highlight || undefined}
    >
      {highlight && <span className="sr-only">{t.calculateNext}</span>}
      <span data-testid={latest ? "after-equation" : undefined}>
        <span role="math" aria-label={label}>
          <span aria-hidden="true">
            <Tex>{`= ${animated}`}</Tex>
          </span>
        </span>
      </span>
    </div>
  );
}

export function EquationFrame({
  ast,
  steps,
  position,
  spread = false,
}: {
  ast: Ast;
  steps: Step[];
  position: number;
  spread?: boolean;
}) {
  const completed = Math.min(steps.length, Math.floor(position / 2));
  const highlighting = position % 2 === 1 && completed < steps.length;
  const notes: Record<string, string> = {
    ...c.bracketLesson.notes,
    ...c.arithmetic.notes,
  };
  // Choose the break from the complete question, never the revealed row count.
  // This keeps earlier working in the same column on Next, Previous and Replay.
  const columns = spread && steps.length >= 4;
  const originalTex = expressionTex(ast, steps[0]?.numberStyle);
  const board = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [columnBreak, setColumnBreak] = useState(steps.length);
  const split = columns ? columnBreak : steps.length;
  useLayoutEffect(() => {
    const node = board.current,
      measure = probe.current;
    if (!columns || !node || !measure) return;
    const arrange = () => {
      if (node.clientWidth < 960) return;
      // Measure the finished question at the desired classroom size. Future
      // rows live only in this invisible, inaccessible sizing area.
      const widest = Math.max(
        ...Array.from(
          measure.querySelectorAll<HTMLElement>("[data-measure-math]"),
          (el) => el.scrollWidth,
        ),
      );
      const size =
        Math.floor(
          Math.min(32, (32 * (measure.clientWidth - 16)) / widest) * 100,
        ) / 100;
      node.style.setProperty("--board-font", `${size}px`);
      const toolbar = node.parentElement?.querySelector<HTMLElement>(
        '[data-testid="teaching-controls"]',
      );
      const available = Math.max(
        360,
        window.innerHeight - (toolbar?.offsetHeight ?? 80) - 100,
      );
      node.style.setProperty("--board-height", `${available}px`);
      const rows = Array.from(measure.children) as HTMLElement[];
      const rowHeight = (row: HTMLElement, index: number) => {
        const equation = row.querySelector<HTMLElement>(`.${styles.equation}`)!;
        const arrow = steps[index] && signArrowTex(steps[index]) ? 60 : 0;
        // The probe has a fixed 32px font: scale only its equation area,
        // keeping the explanation, padding and sign arrows at their own sizes.
        return (
          row.offsetHeight -
          (equation.offsetHeight - 16 - arrow) * (1 - size / 32) +
          2
        );
      };
      let height = rowHeight(rows[0], 0) + 36;
      let count = 0;
      for (const row of rows.slice(1)) {
        const required = rowHeight(row, count + 1);
        if (count > 0 && height + required > available) break;
        height += required;
        count++;
      }
      setColumnBreak((value) => (value === count ? value : count));
    };
    arrange();
    const observer = new ResizeObserver(arrange);
    observer.observe(node);
    window.addEventListener("resize", arrange);
    document.fonts.addEventListener("loadingdone", arrange);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", arrange);
      document.fonts.removeEventListener("loadingdone", arrange);
    };
  }, [columns, steps]);
  const visible = Math.ceil(position / 2);
  const renderSteps = (start: number, end: number) => (
    <ol className={styles.working} aria-label={t.allSteps} start={start + 1}>
      {steps.slice(start, Math.min(end, visible)).map((step, offset) => {
        const index = start + offset;
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
                <span>
                  {step.batchReveal ? t.independentSigns : notes[step.noteKey]}
                </span>
                {(step.signReveal || step.batchReveal) && (
                  <span className={styles.optionalBadge} title={t.optionalHelp}>
                    {t.optionalStep}
                  </span>
                )}
              </div>
              <div
                className={`${styles.result} ${applied || step.signReveal || step.batchReveal ? styles.expanded : ""}`}
                aria-hidden={!applied && !step.signReveal && !step.batchReveal}
              >
                <div className={styles.resultContents}>
                  {step.signReveal || step.batchReveal ? (
                    <SplitOperationLine
                      step={step}
                      applied={applied}
                      latest={index + 1 === completed}
                      highlight={highlighting && index + 1 === completed}
                    />
                  ) : (
                    applied && (
                      <EquationLine
                        tex={`= ${step.tex}`}
                        nextStep={steps[index + 1]}
                        arrowPhase={Math.max(0, position - (index + 1) * 2)}
                        highlight={highlighting && index + 1 === completed}
                        latest={index + 1 === completed}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
  return (
    <div
      ref={board}
      className={`min-w-0 ${columns ? styles.board : ""}`}
      style={{ overflowAnchor: "none" }}
      data-testid="equation-frame"
      data-phase={
        position === 0 ? "start" : highlighting ? "highlight" : "applied"
      }
    >
      {columns && (
        <div ref={probe} className={styles.measure} aria-hidden="true" inert>
          {[null, ...steps].map((step, index) => {
            const next = steps[index];
            const tex = next
              ? (signArrowTex(next) ?? step?.tex ?? originalTex)
              : step!.tex;
            return (
              <div key={index}>
                {step && (
                  <div className={styles.note}>
                    <span
                      data-measure-note={
                        step.batchReveal
                          ? t.independentSigns
                          : notes[step.noteKey]
                      }
                    />
                    {(step.signReveal || step.batchReveal) && (
                      <span
                        className={styles.optionalBadge}
                        data-measure-note={t.optionalStep}
                      />
                    )}
                  </div>
                )}
                <div className={styles.equation}>
                  <span data-measure-math className={styles.measureMath}>
                    <Tex>{`${step ? "= " : ""}${tex}`}</Tex>
                  </span>
                  {next && signArrowTex(next) && <div style={{ height: 60 }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.columns}>
        <div className={styles.column} data-working-column="first">
          {columns && <p className={styles.columnHeading}>{t.firstColumn}</p>}
          <EquationLine
            tex={originalTex}
            nextStep={steps[0]}
            highlight={highlighting && completed === 0}
            latest={completed === 0}
            original
            arrowPhase={position}
          />
          {renderSteps(0, split)}
        </div>
        {columns && (
          <div
            className={`${styles.column} ${visible <= split ? styles.waitingColumn : ""}`}
            data-working-column="continued"
          >
            <p className={styles.columnHeading}>{t.nextColumn}</p>
            {renderSteps(split, steps.length)}
          </div>
        )}
      </div>
    </div>
  );
}
