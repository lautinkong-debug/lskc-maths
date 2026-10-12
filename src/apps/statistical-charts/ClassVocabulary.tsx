import { useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { Math as MathText } from "@/components/Math";
import { useAnswers } from "./answers";
import { BoundaryLesson } from "./BoundaryLesson";
import { ClassIntervalDiagram } from "./ClassIntervalDiagram";
import { VocabularyCorrection } from "./VocabularyCorrection";
import { VocabularyCalculation } from "./VocabularyCalculation";
import {
  vocabularyCalculation,
  type VocabularyCalculationKind,
} from "./vocabularyCalculationModel";
import { format } from "./statistics";
import {
  classVocabulary,
  matchesVocabularyAnswer,
  vocabularyExamples,
  vocabularyFields,
  vocabularyFieldTerms,
  vocabularyRecallOrders,
} from "./vocabularyModel";
import s from "./lab.module.css";
const c = copy.statisticalCharts.vocabulary;
const letters = ["L", "B", "M", "W"];
export function ClassVocabulary() {
  const [calculation, setCalculation] =
    useState<VocabularyCalculationKind | null>(null);
  const [calculationStep, setCalculationStep] = useState(0);
  const [calculationPlaying, setCalculationPlaying] = useState(false);
  const correctionRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [correction, setCorrection] = useState<{
    term: number;
    field: number | null;
    attempt: number;
  } | null>(null);
  const [example, setExample] = useState(0),
    [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState("learn"),
    [round, setRound] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [complete, setComplete] = useState(false);
  const [drafts, setDrafts] = useState<string[]>(Array(6).fill("")),
    [checked, setChecked] = useState(false);
  const allowed = useAnswers(),
    input = vocabularyExamples[example],
    v = classVocabulary(input.lower, input.upper, input.precision);
  const active =
    mode === "recall" ? vocabularyRecallOrders[example][round] : selected;
  const show = mode === "learn" && allowed;
  const calculationFrame =
    calculation && show
      ? vocabularyCalculation(v, input.precision, calculation, calculationStep)
      : null;
  function closeCalculation() {
    setCalculation(null);
    setCalculationPlaying(false);
    setCalculationStep(0);
  }
  function chooseCalculation(kind: VocabularyCalculationKind) {
    setCalculation(kind);
    setCalculationStep(0);
    setCalculationPlaying(false);
    setPlaying(false);
  }
  useEffect(() => {
    if (!calculationPlaying || !calculation || !show) return;
    const timer = setTimeout(() => {
      if (calculationStep === 2) setCalculationPlaying(false);
      setCalculationStep((step) => Math.min(step + 1, 3));
    }, 2200);
    return () => clearTimeout(timer);
  }, [calculationPlaying, calculation, calculationStep, show]);
  const formulas = [
    `${v.lower} · ${v.upper}`,
    `${v.lower} − ${format(v.halfStep)} = ${v.low}; ${v.upper} + ${format(v.halfStep)} = ${v.high}`,
    `(${v.lower} + ${v.upper}) ÷ 2 = ${v.mark}`,
    `${v.high} − ${v.low} = ${v.width}`,
  ];
  useEffect(() => {
    if (
      correction &&
      allowed &&
      window.matchMedia("(max-width: 900px)").matches
    ) {
      correctionRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [correction, allowed]);
  function explain(term: number, field: number | null = null) {
    setCorrection((previous) => ({
      term,
      field,
      attempt: (previous?.attempt ?? 0) + 1,
    }));
    setSelected(term);
  }
  function retry() {
    const field = correction?.field;
    setCorrection(null);
    setAnswer(null);
    setChecked(false);
    if (field != null) inputRefs.current[field]?.focus();
    else choiceRefs.current[0]?.focus();
  }
  useEffect(() => {
    if (!playing || mode !== "learn" || !allowed) return;
    const timer = setTimeout(() => {
      if (selected === 3) setPlaying(false);
      else setSelected((n) => (n === 4 ? 0 : n + 1));
    }, 2300);
    return () => clearTimeout(timer);
  }, [playing, selected, mode, allowed]);
  function reset(nextMode = mode) {
    setMode(nextMode);
    setPlaying(false);
    setRound(0);
    setAnswer(null);
    setComplete(false);
    setDrafts(Array(6).fill(""));
    setChecked(false);
    setCorrection(null);
    closeCalculation();
  }
  return (
    <section className={s.vocabulary} aria-label={c.title}>
      <div className={s.activityHeader}>
        <div>
          <p className={s.chapter}>{c.eyebrow}</p>
          <h3>{c.title}</h3>
        </div>
        <label className={s.field}>
          {c.example}
          <select
            value={example}
            onChange={(e) => {
              setExample(Number(e.target.value));
              reset();
            }}
          >
            {vocabularyExamples.map((e, i) => (
              <option key={i} value={i}>
                {c.set} {i + 1}: {e.lower}–{e.upper} · {c.step} {e.precision}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={s.lessonActions}>
        {c.modes.map((name, i) => (
          <button
            key={name}
            aria-pressed={
              mode === ["learn", "recall", "calculate", "boundaries"][i]
            }
            onClick={() =>
              reset(["learn", "recall", "calculate", "boundaries"][i])
            }
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => {
            setExample((example + 1) % vocabularyExamples.length);
            reset();
          }}
        >
          {c.newExample}
        </button>
      </div>
      {mode === "boundaries" ? (
        <BoundaryLesson key={example} example={input} />
      ) : (
        <div className={s.vocabularyGrid} data-practice={mode !== "learn"}>
          <div className={s.conceptCard} ref={correctionRef}>
            <p className={s.chapter}>
              {c.oneClass}:{" "}
              <strong>
                {v.lower}–{v.upper}
              </strong>
            </p>
            <p className={s.small}>
              {c.recordedStep} {input.precision}
            </p>
            <ClassIntervalDiagram
              values={v}
              active={calculationFrame?.term ?? active}
              show={show}
              learn={mode === "learn"}
              emphasis={
                calculationFrame
                  ? {
                      ...calculationFrame,
                      field: null,
                      attempt: calculationStep,
                    }
                  : allowed
                    ? correction
                    : null
              }
            />
            {correction && allowed && (
              <VocabularyCorrection
                values={v}
                term={correction.term}
                field={correction.field}
                onRetry={retry}
                onReplay={() => explain(correction.term, correction.field)}
              />
            )}
            {mode === "learn" && (
              <>
                {show &&
                  (calculation ? (
                    <VocabularyCalculation
                      values={v}
                      precision={input.precision}
                      kind={calculation}
                      step={calculationStep}
                      playing={calculationPlaying}
                      onKind={chooseCalculation}
                      onStep={(step) => {
                        setCalculationStep(step);
                        setCalculationPlaying(false);
                      }}
                      onPlay={() => {
                        setPlaying(false);
                        if (calculationStep === 3) setCalculationStep(0);
                        setCalculationPlaying(!calculationPlaying);
                      }}
                      onClose={closeCalculation}
                    />
                  ) : (
                    <button
                      className={s.calculationLaunch}
                      onClick={() => chooseCalculation("markLimits")}
                    >
                      {c.calculation.title}
                    </button>
                  ))}
                {!calculationFrame && (
                  <details className={s.vocabularyNotes}>
                    <summary>{c.definitions}</summary>
                    <p>{c.intervalMeaning}</p>
                    <p>{c.lowerLimitMeaning}</p>
                    <p>{c.upperLimitMeaning}</p>
                    <p>
                      {c.recordedStep} {input.precision}; {c.halfStep}{" "}
                      {format(v.halfStep)}.
                    </p>
                    <p>{c.precisionRule}</p>
                  </details>
                )}
              </>
            )}
          </div>
          <div className={s.conceptCard}>
            {mode === "learn" && (
              <>
                <div className={s.lessonActions}>
                  <button
                    disabled={!allowed}
                    onClick={() => {
                      closeCalculation();
                      if (!playing) setSelected(4);
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? c.pause : c.play}
                  </button>
                  <button
                    disabled={!allowed}
                    onClick={() => {
                      setPlaying(false);
                      closeCalculation();
                      setSelected(
                        selected === 4 ? 0 : selected === 3 ? 4 : selected + 1,
                      );
                    }}
                  >
                    {c.next}
                  </button>
                </div>
                <div className={s.memoryCards}>
                  <button
                    className={s.memoryCard}
                    aria-pressed={(calculationFrame?.term ?? selected) === 4}
                    onClick={() => {
                      setSelected(4);
                      setPlaying(false);
                      closeCalculation();
                    }}
                  >
                    <span className={s.memoryLetter}>I</span>
                    <span>
                      <strong>{c.intervalLabel}</strong>
                      <b>
                        {v.lower}–{v.upper}
                      </b>
                    </span>
                  </button>
                  {c.names.map((name, i) => (
                    <button
                      key={name}
                      className={s.memoryCard}
                      aria-pressed={(calculationFrame?.term ?? selected) === i}
                      onClick={() => {
                        setSelected(i);
                        setPlaying(false);
                        closeCalculation();
                      }}
                    >
                      <span className={s.memoryLetter}>{letters[i]}</span>
                      <span>
                        <strong>{c.cardLabels[i]}</strong>
                        {i === 2 && (
                          <span className={s.markFormula}>
                            <span>{c.markEquals}</span>
                            <MathText label={c.markLimits}>
                              {c.markLimitsFraction}
                            </MathText>
                          </span>
                        )}
                        {show && i !== 0 && i !== 2 && <b>{formulas[i]}</b>}
                        {i === 2 && (
                          <>
                            {show && (
                              <MathText
                                className={s.workedFraction}
                                label={formulas[2]}
                              >{`\\dfrac{${v.lower}+${v.upper}}{2}=${v.mark}`}</MathText>
                            )}
                            <span className={s.markFormula}>
                              <span>{c.markEquals}</span>
                              <MathText label={c.markBoundaries}>
                                {c.markBoundariesFraction}
                              </MathText>
                            </span>
                            {show && (
                              <MathText
                                className={s.workedFraction}
                                label={`(${v.low} + ${v.high}) ÷ 2 = ${v.mark}`}
                              >{`\\dfrac{${v.low}+${v.high}}{2}=${v.mark}`}</MathText>
                            )}
                          </>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {mode === "recall" && (
              <>
                <p className={s.chapter}>
                  {c.recallProgress} {round + 1} / 4
                </p>
                <h4>{c.recallQuestion}</h4>
                <div className={s.memoryChoices}>
                  {c.names.map((name, i) => (
                    <button
                      key={name}
                      aria-pressed={answer === i}
                      ref={(el) => {
                        choiceRefs.current[i] = el;
                      }}
                      onClick={() => {
                        setAnswer(i);
                        if (i !== active && allowed) explain(active);
                        else setCorrection(null);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div aria-live="polite">
                  {answer !== null && allowed && (
                    <p className={s.scaleNote}>
                      {answer === active ? c.correct : c.lookAgain}{" "}
                      {c.phrases[active]}. {c.meanings[active]}
                    </p>
                  )}
                  {complete && <p className={s.scaleNote}>{c.complete}</p>}
                </div>
                <button
                  disabled={!allowed || answer !== active || complete}
                  onClick={() => {
                    if (round === 3) setComplete(true);
                    else {
                      setRound(round + 1);
                      setAnswer(null);
                      setCorrection(null);
                    }
                  }}
                >
                  {c.nextPrompt}
                </button>
              </>
            )}
            {mode === "calculate" && (
              <>
                <h4>{c.calculateTitle}</h4>
                <p>{c.calculateIntro}</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setChecked(true);
                    const firstWrong = vocabularyFields.findIndex(
                      (field, i) =>
                        !matchesVocabularyAnswer(drafts[i], v[field]),
                    );
                    if (allowed && firstWrong >= 0)
                      explain(vocabularyFieldTerms[firstWrong], firstWrong);
                    else setCorrection(null);
                  }}
                >
                  <div className={s.vocabularyAnswers}>
                    {vocabularyFields.map((field, i) => {
                      const correct = matchesVocabularyAnswer(
                        drafts[i],
                        v[field],
                      );
                      return (
                        <div className={s.field} key={field}>
                          <label htmlFor={`vocabulary-input-${field}`}>
                            {c.fields[i]}
                          </label>
                          <input
                            id={`vocabulary-input-${field}`}
                            ref={(el) => {
                              inputRefs.current[i] = el;
                            }}
                            aria-label={c.fields[i]}
                            aria-describedby={
                              checked && allowed
                                ? `vocabulary-feedback-${field}`
                                : undefined
                            }
                            inputMode="decimal"
                            value={drafts[i]}
                            onChange={(e) => {
                              setDrafts(
                                drafts.map((value, j) =>
                                  j === i ? e.target.value : value,
                                ),
                              );
                              setChecked(false);
                              setCorrection(null);
                            }}
                            aria-invalid={checked && allowed && !correct}
                          />
                          {checked && allowed && (
                            <span
                              id={`vocabulary-feedback-${field}`}
                              className={correct ? s.small : s.frequencyError}
                            >
                              {correct ? c.correct : c.lookAgain}
                            </span>
                          )}
                          {checked && allowed && !correct && (
                            <button
                              type="button"
                              className={s.correctionLink}
                              aria-label={`${c.correction.show}: ${c.fields[i]}`}
                              onClick={() =>
                                explain(vocabularyFieldTerms[i], i)
                              }
                            >
                              {c.correction.show}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button disabled={!allowed} type="submit">
                    {c.check}
                  </button>
                </form>
                {checked &&
                  allowed &&
                  vocabularyFields.every((field, i) =>
                    matchesVocabularyAnswer(drafts[i], v[field]),
                  ) && (
                    <p role="status" className={s.scaleNote}>
                      {c.allCorrect}
                    </p>
                  )}
              </>
            )}
            {!allowed && (
              <p className={s.small}>
                {copy.statisticalCharts.classroom.answersHidden}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
