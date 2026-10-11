import { copy } from "@/lib/copy";
import { parse } from "../lib/parse";
import { demonstrationSteps } from "../lib/demonstration";
import {
  EquationFrame,
  TeachingControls,
  useDemonstration,
} from "./TeachingSteps";
const t = copy.apps.directedNumbers.demonstration;
export function AnimatedWorking({ expression }: { expression: string }) {
  const parsed = parse(expression);
  if (!parsed.ok) throw new Error("Invalid textbook expression");
  const steps = demonstrationSteps(parsed.value);
  const timeline = useDemonstration(steps.length * 2);
  return (
    <section
      className="border-grid space-y-4 rounded border p-4"
      aria-label={t.working}
    >
      <h3 className="font-display text-navy text-xl font-semibold">
        {t.working}
      </h3>
      <TeachingControls timeline={timeline} />
      <EquationFrame
        ast={parsed.value}
        steps={steps}
        position={timeline.position}
        spread
      />
      {timeline.position === timeline.last && (
        <p role="status" className="font-semibold">
          {t.complete}
        </p>
      )}
    </section>
  );
}
