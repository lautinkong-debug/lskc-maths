import { Math as MathText } from "@/components/Math";
import { copy } from "@/lib/copy";
import { classVocabulary } from "./vocabularyModel";
import { format } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.vocabulary;
export function VocabularyCorrection({
  values: v,
  term,
  field,
  onRetry,
  onReplay,
}: {
  values: ReturnType<typeof classVocabulary>;
  term: number;
  field: number | null;
  onRetry: () => void;
  onReplay: () => void;
}) {
  const equation =
    term === 2
      ? `\\dfrac{${v.lower}+${v.upper}}{2}=${v.mark}`
      : term === 3
        ? `${v.high}-${v.low}=${v.width}`
        : "";
  return (
    <div
      className={s.correction}
      data-testid="vocabulary-correction"
      data-term={term}
    >
      <h4>{field == null ? c.phrases[term] : c.fields[field]}</h4>
      <p role="status" className={s.correctionCaption}>
        {c.correction.captions[term]}
      </p>
      {equation && (
        <MathText className={s.correctionEquation}>{equation}</MathText>
      )}
      {term === 1 && (
        <div className={s.correctionEquations}>
          {(field == null || field === 2) && (
            <MathText>{`${v.lower}-${format(v.halfStep)}=${v.low}`}</MathText>
          )}
          {(field == null || field === 3) && (
            <MathText>{`${v.upper}+${format(v.halfStep)}=${v.high}`}</MathText>
          )}
        </div>
      )}
      <div className={s.correctionActions}>
        <button type="button" onClick={onReplay}>
          {c.correction.replay}
        </button>
        <button type="button" onClick={onRetry}>
          {c.correction.retry}
        </button>
      </div>
    </div>
  );
}
