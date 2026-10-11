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

export function EquationFrame({
  ast,
  steps,
  position,
}: {
  ast: Ast;
  steps: Step[];
  position: number;
}) {
  const index = Math.min(
    steps.length - 1,
    Math.floor(Math.max(0, position - 1) / 2),
  );
  const step = position > 0 ? steps[index] : undefined;
  const applied = position > 0 && position % 2 === 0;
  const pair =
    step && ["++", "+-", "-+", "--"].includes(step.ruleId) ? step.ruleId : null;
  const notes: Record<string, string> = {
    ...c.bracketLesson.notes,
    ...c.arithmetic.notes,
  };
  return (
    <div
      className="min-w-0 space-y-3"
      data-testid="equation-frame"
      data-phase={step ? (applied ? "applied" : "highlight") : "start"}
    >
      <p className="text-navy font-semibold" aria-live="polite">
        {step ? notes[step.noteKey] : t.start}
      </p>
      <div
        className="overflow-x-auto py-2 text-2xl"
        data-testid="before-equation"
      >
        <Tex className={applied ? "text-pencil" : ""}>
          {step
            ? applied
              ? expressionTex(step.before)
              : highlightedTex(step)
            : expressionTex(ast)}
        </Tex>
      </div>
      {pair && (
        <div
          key={`${index}:${applied}`}
          className={`${styles.signs} ${applied ? styles.combine : ""}`}
          aria-label={t.signPair(
            pair[0],
            pair[1],
            pair[0] === pair[1] ? "+" : "−",
          )}
        >
          <span className={styles.first}>{pair[0] === "-" ? "−" : "+"}</span>
          <span className={styles.bracket}>(</span>
          <span className={styles.second}>{pair[1] === "-" ? "−" : "+"}</span>
          <span className={styles.bracket}>)</span>
          <span aria-hidden="true">→</span>
          {applied && (
            <strong className={styles.arrive}>
              {pair[0] === pair[1] ? "+" : "−"}
            </strong>
          )}
        </div>
      )}
      {applied && step && (
        <div
          key={position}
          className={`${styles.arrive} overflow-x-auto border-l-4 border-[#0f4574] py-2 pl-3 text-2xl`}
          data-testid="after-equation"
        >
          <Tex>{`= ${step.tex}`}</Tex>
        </div>
      )}
    </div>
  );
}
