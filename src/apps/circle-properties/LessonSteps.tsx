import type { CSSProperties, ReactNode } from "react";
import { circlePathCopy } from "@/lib/copy";
import { cpaStages, type CpaStage } from "./path/types";
import s from "./lesson-steps.module.css";

export type LessonStep = { name: string; cpa: CpaStage; done?: boolean };

/**
 * The step bar of a guided lesson, in the Learn path's own shape: one row of
 * steps under the three Concrete, Pictorial and Abstract bands. A step keeps
 * its name as the button's name, so a lesson script can say "press Fold".
 */
export default function LessonSteps({
  label,
  steps,
  current,
  onSelect,
}: {
  label: string;
  steps: readonly LessonStep[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const stages = cpaStages.filter((stage) =>
    steps.some((step) => step.cpa === stage),
  );
  return (
    <div
      className={s.frame}
      style={
        {
          "--columns": steps.length,
          "--narrow-columns": Math.ceil(steps.length / 2),
        } as CSSProperties
      }
    >
      <ol className={s.bands} aria-label={circlePathCopy.cpaLabel}>
        {stages.map((stage) => (
          <li
            key={stage}
            data-cpa={stage}
            data-current={steps[current]?.cpa === stage}
            style={{
              gridColumn: `span ${steps.filter((step) => step.cpa === stage).length}`,
            }}
          >
            <strong>{circlePathCopy.cpa[stage].name}</strong>
            <span>{circlePathCopy.cpa[stage].means}</span>
          </li>
        ))}
      </ol>
      <nav className={s.steps} aria-label={label}>
        {steps.map((step, index) => (
          <button
            type="button"
            key={step.name}
            aria-current={index === current ? "step" : undefined}
            data-cpa={step.cpa}
            data-done={step.done}
            onClick={() => onSelect(index)}
          >
            <span className={s.number} aria-hidden="true">
              {index + 1}
            </span>
            <span className={s.name}>{step.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/** The line above a step's work: its stage, its heading, and where it sits. */
export function LessonWhere({
  cpa,
  count,
  children,
}: {
  cpa: CpaStage;
  count?: string;
  children: ReactNode;
}) {
  return (
    <div className={s.where}>
      <span className={s.tag} data-cpa={cpa}>
        {circlePathCopy.cpa[cpa].name}
      </span>
      {children}
      {count && <span className={s.count}>{count}</span>}
    </div>
  );
}
