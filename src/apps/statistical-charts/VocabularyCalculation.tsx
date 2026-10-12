import { copy } from "@/lib/copy";
import { Math as MathText } from "@/components/Math";
import {
  vocabularyCalculation,
  type VocabularyCalculationKind,
} from "./vocabularyCalculationModel";
import { classVocabulary } from "./vocabularyModel";
import s from "./lab.module.css";
const c = copy.statisticalCharts.vocabulary.calculation;
export function VocabularyCalculation({
  values,
  precision,
  kind,
  step,
  playing,
  onKind,
  onStep,
  onPlay,
  onClose,
}: {
  values: ReturnType<typeof classVocabulary>;
  precision: number;
  kind: VocabularyCalculationKind;
  step: number;
  playing: boolean;
  onKind: (kind: VocabularyCalculationKind) => void;
  onStep: (step: number) => void;
  onPlay: () => void;
  onClose: () => void;
}) {
  const frame = vocabularyCalculation(values, precision, kind, step);
  return (
    <section className={s.calculationLesson} aria-label={c.title}>
      <label className={s.field}>
        {c.title}
        <select
          value={kind}
          onChange={(e) => onKind(e.target.value as VocabularyCalculationKind)}
        >
          {Object.entries(c.lessons).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className={s.calculationStep} key={`${kind}:${step}`} role="status">
        <p>
          {step + 1} / 4 · {c.instructions[kind][step]}
        </p>
        <MathText>{frame.latex}</MathText>
      </div>
      <div className={s.calculationActions}>
        <button onClick={onPlay}>{playing ? c.pause : c.play}</button>
        <button onClick={() => onStep(step - 1)} disabled={step === 0}>
          {c.previous}
        </button>
        <button onClick={() => onStep(step + 1)} disabled={step === 3}>
          {c.next}
        </button>
        <button onClick={() => onStep(0)}>{c.replay}</button>
        <button onClick={onClose}>{c.close}</button>
      </div>
    </section>
  );
}
