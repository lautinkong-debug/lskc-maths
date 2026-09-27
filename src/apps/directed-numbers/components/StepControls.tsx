import { copy } from "@/lib/copy";
import { button, primary } from "./ui";
const c = copy.apps.directedNumbers;
export function StepControls({
  position,
  total,
  hidden,
  onNext,
  onBack,
  onReset,
  onNew,
}: {
  position: number;
  total: number;
  hidden: boolean;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={button}
        onClick={onBack}
        disabled={position === 0 && hidden}
      >
        ← {c.back}
      </button>
      <button
        className={primary}
        onClick={onNext}
        disabled={position === total && !hidden}
      >
        {hidden ? c.reveal : c.next} →
      </button>
      <button className={button} onClick={onReset}>
        {c.reset}
      </button>
      <button className={button} onClick={onNew}>
        {c.newExample}
      </button>
      <span className="text-pencil text-sm tabular-nums" aria-live="polite">
        {c.progress(position, total)}
      </span>
    </div>
  );
}
