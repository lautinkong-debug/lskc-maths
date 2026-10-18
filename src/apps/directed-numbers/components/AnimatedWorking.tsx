import { copy } from "@/lib/copy";
import { useMemo } from "react";
import { parse } from "../lib/parse";
import { demonstrationSteps } from "../lib/demonstration";
import {
  compactWorking,
  compactPosition,
  expandedPosition,
} from "../lib/compactWorking";
import { button } from "./ui";
import styles from "./TeachingSteps.module.css";
import {
  EquationFrame,
  TeachingControls,
  useDemonstration,
} from "./TeachingSteps";
const t = copy.apps.directedNumbers.demonstration;
export function AnimatedWorking({
  expression,
  hideOptional,
  setHideOptional,
}: {
  expression: string;
  hideOptional: boolean;
  setHideOptional: (value: boolean) => void;
}) {
  const parsed = useMemo(() => parse(expression), [expression]);
  const fullSteps = useMemo(
    () => (parsed.ok ? demonstrationSteps(parsed.value) : []),
    [parsed],
  );
  const compact = useMemo(() => compactWorking(fullSteps), [fullSteps]);
  const shortSteps = useMemo(
    () => compact.map((entry) => entry.step),
    [compact],
  );
  const steps = hideOptional ? shortSteps : fullSteps;
  const timeline = useDemonstration(steps.length * 2);
  if (!parsed.ok) throw new Error("Invalid textbook expression");
  return (
    <section
      className={`${styles.teachingBoard} space-y-4`}
      aria-label={t.working}
    >
      <h3 className="font-display text-navy text-xl font-semibold">
        {t.working}
      </h3>
      <TeachingControls timeline={timeline}>
        {shortSteps.length < fullSteps.length && (
          <button
            className={`${button} text-sm`}
            aria-pressed={hideOptional}
            onClick={() => {
              timeline.seek(
                hideOptional
                  ? expandedPosition(timeline.position, compact)
                  : compactPosition(timeline.position, compact),
              );
              setHideOptional(!hideOptional);
            }}
          >
            {hideOptional ? t.showOptional : t.hideOptional}
          </button>
        )}
      </TeachingControls>
      <EquationFrame
        ast={parsed.value}
        steps={steps}
        position={timeline.position}
        spread
      />
      <p role="status" className="min-h-[1lh] font-semibold">
        {timeline.position === timeline.last ? t.complete : ""}
      </p>
    </section>
  );
}
