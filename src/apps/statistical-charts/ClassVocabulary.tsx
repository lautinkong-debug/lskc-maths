import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { useAnswers } from "./answers";
import { BoundaryLesson } from "./BoundaryLesson";
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
            {mode === "learn" && (
              <div className={s.intervalIntro}>
                <p>{c.intervalMeaning}</p>
                <p>
                  {c.lowerLimitMeaning} {show && <strong>{v.lower}</strong>}
                </p>
                <p>
                  {c.upperLimitMeaning} {show && <strong>{v.upper}</strong>}
                </p>
              </div>
            )}
            <p className={s.small}>
              {c.recordedStep} {input.precision}; {c.halfStep}{" "}
              {format(v.halfStep)}.
            </p>
            <svg
              viewBox="0 0 710 430"
              role="img"
              aria-label={mode === "recall" ? c.recallDiagram : c.diagram}
              data-testid="vocabulary-diagram"
            >
              {[0, 1, 2].map((j) => (
                <g key={j}>
                  <rect
                    x={80 + j * 183}
                    y={20}
                    width={183}
                    height={52}
                    fill={j === 1 ? "#fff3b0" : "#f1f4f6"}
                    stroke={j === 1 && active === 0 ? "#da2127" : "#0f4574"}
                    strokeWidth={j === 1 && active === 0 ? 4 : 1}
                  />
                  <text
                    x={171.5 + j * 183}
                    y={53}
                    textAnchor="middle"
                    fontSize={22}
                    fill="#0f4574"
                    fontWeight={j === 1 ? 700 : 400}
                  >
                    {format(v.lower + (j - 1) * v.width)}–
                    {format(v.upper + (j - 1) * v.width)}
                  </text>
                </g>
              ))}
              <rect
                x={80}
                y={235}
                width={183}
                height={85}
                fill="#edf0f2"
                stroke="#aaa"
              />
              <rect
                x={446}
                y={250}
                width={183}
                height={70}
                fill="#edf0f2"
                stroke="#aaa"
              />
              <rect
                x={263}
                y={170}
                width={183}
                height={150}
                fill="#fff0a3"
                stroke="#0f4574"
                strokeWidth={2}
              />
              <line
                x1={65}
                x2={645}
                y1={320}
                y2={320}
                stroke="#263645"
                strokeWidth={2}
              />
              <g className={s.vocabularyHighlight} data-active={active === 3}>
                <path
                  d="M263 142H446 M263 142l10 -6 M263 142l10 6 M446 142l-10 -6 M446 142l-10 6"
                  stroke={active === 3 ? "#da2127" : "#0f4574"}
                  strokeWidth={active === 3 ? 4 : 2}
                  fill="none"
                />
                <text
                  x={354.5}
                  y={122}
                  textAnchor="middle"
                  fontSize={22}
                  fill="#0f4574"
                >
                  {mode === "learn"
                    ? `${c.names[3]}${show ? ` = ${v.width}` : ""}`
                    : "?"}
                </text>
              </g>
              <g className={s.vocabularyHighlight} data-active={active === 1}>
                {[263, 446].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    x2={x}
                    y1={170}
                    y2={333}
                    stroke={active === 1 ? "#da2127" : "#0f4574"}
                    strokeWidth={active === 1 ? 5 : 2}
                  />
                ))}
                <text
                  x={263}
                  y={358}
                  textAnchor="middle"
                  fontSize={23}
                  fill="#0f4574"
                >
                  {show ? v.low : "?"}
                </text>
                <text
                  x={446}
                  y={358}
                  textAnchor="middle"
                  fontSize={23}
                  fill="#0f4574"
                >
                  {show ? v.high : "?"}
                </text>
              </g>
              <g className={s.vocabularyHighlight} data-active={active === 2}>
                <path
                  d="M354.5 218V320 M354.5 320l-6 -10 M354.5 320l6 -10"
                  fill="none"
                  stroke={active === 2 ? "#da2127" : "#0f4574"}
                  strokeWidth={active === 2 ? 4 : 2}
                />
                <text
                  x={354.5}
                  y={202}
                  textAnchor="middle"
                  fontSize={20}
                  fill="#0f4574"
                >
                  {mode === "learn" ? c.names[2] : "?"}
                </text>
                <text
                  x={354.5}
                  y={358}
                  textAnchor="middle"
                  fontSize={23}
                  fill="#0f4574"
                >
                  {show ? v.mark : "?"}
                </text>
              </g>
              <text
                x={263}
                y={393}
                textAnchor="middle"
                fontSize={15}
                fill="#0f4574"
              >
                {mode === "learn" ? c.lowerBoundary : ""}
              </text>
              <text
                x={446}
                y={393}
                textAnchor="middle"
                fontSize={15}
                fill="#0f4574"
              >
                {mode === "learn" ? c.upperBoundary : ""}
              </text>
            </svg>
            {mode === "learn" && (
              <div className={s.scaleNote}>
                <strong>{c.halfRule}</strong>
                <p>{c.precisionRule}</p>
                {show && (
                  <p>
                    {v.lower} − {format(v.halfStep)} = {v.low} · {v.upper} +{" "}
                    {format(v.halfStep)} = {v.high}
                  </p>
                )}
              </div>
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
                        <span>{c.meanings[i]}</span>
                        {i === 2 && (
                          <span className={s.markFormula}>{c.markLimits}</span>
                        )}
                        {show && (
                          <b>
                            {i === 0
                              ? `${c.fields[0]}: ${v.lower} · ${c.fields[1]}: ${v.upper}`
                              : formulas[i]}
                          </b>
                        )}
                        {i === 2 && (
                          <>
                            <span className={s.markFormula}>
                              {c.markBoundaries}
                            </span>
                            {show && (
                              <b>
                                ({v.low} + {v.high}) ÷ 2 = {v.mark}
                              </b>
                            )}
                          </>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <p className={s.small}>{c.sayAloud}</p>
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
                              {correct
                                ? c.correct
                                : field === "width"
                                  ? `${c.widthHint} ${formulas[3]}`
                                  : field === "low" || field === "high"
                                    ? `${c.boundaryHint} ${formulas[1]}`
                                    : field === "mark"
                                      ? `${c.markHint} ${formulas[2]}`
                                      : c.limitHint}
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
      {mode === "learn" && (
        <p className={s.memoryChant}>{c.phrases.join(" · ")}</p>
      )}
    </section>
  );
}
