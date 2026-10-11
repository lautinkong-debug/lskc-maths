import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { Math as MathText } from "@/components/Math";
import { useAnswers } from "./answers";
import { BoundaryLesson } from "./BoundaryLesson";
import { ClassIntervalDiagram } from "./ClassIntervalDiagram";
import { format } from "./statistics";
import {
  classVocabulary,
  matchesVocabularyAnswer,
  vocabularyExamples,
  vocabularyFields,
} from "./vocabularyModel";
import s from "./lab.module.css";
const c = copy.statisticalCharts.vocabulary;
const letters = ["L", "B", "M", "W"];
const recallOrder = [1, 3, 0, 2];
export function ClassVocabulary() {
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
  const active = mode === "recall" ? recallOrder[round] : selected;
  const show = mode === "learn" && allowed;
  const formulas = [
    `${v.lower} · ${v.upper}`,
    `${v.lower} − ${format(v.halfStep)} = ${v.low}; ${v.upper} + ${format(v.halfStep)} = ${v.high}`,
    `(${v.lower} + ${v.upper}) ÷ 2 = ${v.mark}`,
    `${v.high} − ${v.low} = ${v.width}`,
  ];
  useEffect(() => {
    if (!playing || mode !== "learn" || !allowed) return;
    const timer = setTimeout(() => {
      if (selected === 3) setPlaying(false);
      else setSelected((n) => n + 1);
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
                {e.lower}–{e.upper} · {c.step} {e.precision}
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
        <div className={s.vocabularyGrid}>
          <div className={s.conceptCard}>
            <p className={s.chapter}>
              {c.oneClass}:{" "}
              <strong>
                {v.lower}–{v.upper}
              </strong>
            </p>
            <ClassIntervalDiagram
              values={v}
              active={active}
              show={show}
              learn={mode === "learn"}
            />
            {mode === "learn" && (
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
          </div>
          <div className={s.conceptCard}>
            {mode === "learn" && (
              <>
                <div className={s.lessonActions}>
                  <button
                    disabled={!allowed}
                    onClick={() => {
                      if (selected === 3) setSelected(0);
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? c.pause : c.play}
                  </button>
                  <button
                    disabled={!allowed}
                    onClick={() => {
                      setPlaying(false);
                      setSelected((selected + 1) % 4);
                    }}
                  >
                    {c.next}
                  </button>
                </div>
                <div className={s.memoryCards}>
                  {c.names.map((name, i) => (
                    <button
                      key={name}
                      className={s.memoryCard}
                      aria-pressed={selected === i}
                      onClick={() => {
                        setSelected(i);
                        setPlaying(false);
                      }}
                    >
                      <span className={s.memoryLetter}>{letters[i]}</span>
                      <span>
                        <strong>{c.phrases[i]}</strong>
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
                      onClick={() => setAnswer(i)}
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
                  }}
                >
                  <div className={s.vocabularyAnswers}>
                    {vocabularyFields.map((field, i) => {
                      const correct = matchesVocabularyAnswer(
                        drafts[i],
                        v[field],
                      );
                      return (
                        <label className={s.field} key={field}>
                          {c.fields[i]}
                          <input
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
                            }}
                            aria-invalid={checked && allowed && !correct}
                          />
                          {checked && allowed && (
                            <span
                              id={`vocabulary-feedback-${field}`}
                              className={correct ? s.small : s.frequencyError}
                            >
                              {correct ? (
                                c.correct
                              ) : field === "width" ? (
                                `${c.widthHint} ${formulas[3]}`
                              ) : field === "low" || field === "high" ? (
                                `${c.boundaryHint} ${formulas[1]}`
                              ) : field === "mark" ? (
                                <>
                                  {c.markHint}{" "}
                                  <MathText
                                    label={formulas[2]}
                                  >{`\\dfrac{${v.lower}+${v.upper}}{2}=${v.mark}`}</MathText>
                                </>
                              ) : (
                                c.limitHint
                              )}
                            </span>
                          )}
                        </label>
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
