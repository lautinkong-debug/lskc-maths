import { useState } from "react";
import { useAnswers } from "./answers";
import {
  useProgressState,
  validBoolean,
  validInteger,
  validText,
} from "./progress";
import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { Field } from "./Editors";
import { interval } from "./Chart";
import { ConstructionGraph } from "./ConstructionGraph";
import { FrequencyTable } from "./FrequencyTable";
import {
  expectedConnection,
  gradeAnswer,
  lessonStages,
  questionFormula,
  targets,
  type FeedbackCode,
  type QuestionKind,
} from "./learning";
import { format, type ChartType, type Row } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts,
  l = c.learning;
export type ActivityProps = {
  rows: Row[];
  type: ChartType;
  title: string;
  axisLabel: string;
  precision: number;
  raw?: string[];
  initialLevel?: 1 | 2 | 3;
};

export function GivenTable({
  rows,
  precision,
}: {
  rows: Row[];
  precision: number;
}) {
  return (
    <div className={s.tableScroll}>
      <table className={s.table}>
        <caption>{l.sourceTable}</caption>
        <thead>
          <tr>
            <th>{c.interval}</th>
            <th>{c.frequency}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{interval(r, precision === 0)}</td>
              <td>{r.frequency}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={s.small}>
        {precision ? `${l.precision}: ${format(precision)}` : l.continuous}
      </p>
    </div>
  );
}
function AnswerBox({
  rows,
  index,
  kind,
  requireAttempt,
}: {
  rows: Row[];
  index: number;
  kind: QuestionKind;
  requireAttempt: boolean;
}) {
  const allowAnswers = useAnswers();
  const [answer, setAnswer] = useProgressState(
      `answer-${index}-${kind}`,
      "",
      validText,
    ),
    [feedback, setFeedback] = useState<FeedbackCode | null>(null),
    [hint, setHint] = useState(false),
    [reveal, setReveal] = useState(false),
    [attempted, setAttempted] = useProgressState(
      `attempted-${index}-${kind}`,
      false,
      validBoolean,
    );
  return (
    <div className={s.answerBox}>
      <Field label={l.input}>
        <input
          inputMode="decimal"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setFeedback(null);
            setReveal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFeedback(gradeAnswer(answer, rows[index], kind));
              setAttempted(true);
            }
          }}
        />
      </Field>
      <div className={s.toolbar}>
        <button
          className={s.primaryAction}
          onClick={() => {
            setFeedback(gradeAnswer(answer, rows[index], kind));
            setAttempted(true);
          }}
        >
          {l.check}
        </button>
        <button onClick={() => setHint(!hint)} aria-expanded={hint}>
          {l.hint}
        </button>
        <button
          disabled={!allowAnswers || (requireAttempt && !attempted)}
          onClick={() => setReveal(true)}
        >
          {l.answer}
        </button>
      </div>
      {hint && (
        <p className={s.chartNote}>
          {
            l.feedback[
              (
                {
                  mark: "midpoint",
                  low: "halfUnit",
                  width: "boundaryWidth",
                  cumulative: "runningSum",
                } as const
              )[kind]
            ]
          }
        </p>
      )}
      {feedback && (
        <p
          role="status"
          className={feedback === "correct" ? s.success : s.error}
        >
          {l.feedback[feedback]}
        </p>
      )}
      {allowAnswers && (reveal || feedback === "correct") && (
        <div className={s.worked}>
          <strong>{l.correction}</strong>
          <div className={s.formula}>
            <Tex>{questionFormula(rows, index, kind)}</Tex>
          </div>
        </div>
      )}
    </div>
  );
}
export function ScalarExercise({
  rows,
  precision,
  initialKind = "mark",
  requireAttempt = false,
}: {
  rows: Row[];
  precision: number;
  initialKind?: QuestionKind;
  requireAttempt?: boolean;
}) {
  const [index, setIndex] = useProgressState(
      "scalar-index",
      0,
      validInteger(0, rows.length - 1),
    ),
    [kind, setKind] = useProgressState<QuestionKind>(
      "scalar-kind",
      initialKind,
      (v): v is QuestionKind =>
        ["mark", "low", "width", "cumulative"].includes(v as string),
    ),
    [retry, setRetry] = useState(0);
  return (
    <section className={s.scalar}>
      <div className={s.pair}>
        <Field label={l.row}>
          <select
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
          >
            {rows.map((r, i) => (
              <option key={i} value={i}>
                {interval(r, precision === 0)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={l.calculation}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as QuestionKind)}
          >
            {(["mark", "low", "width", "cumulative"] as const).map((k) => (
              <option key={k} value={k}>
                {l.questions[k]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <AnswerBox
        key={`${index}-${kind}-${retry}`}
        rows={rows}
        index={index}
        kind={kind}
        requireAttempt={requireAttempt}
      />
      <button
        disabled={rows.length < 2}
        onClick={() => {
          setIndex((index + 1) % rows.length);
          setRetry(retry + 1);
        }}
      >
        {l.nextQuestion}
      </button>
    </section>
  );
}
export function LearningSteps({
  rows,
  type,
  title,
  axisLabel,
  precision,
  raw,
}: ActivityProps) {
  const allowAnswers = useAnswers();
  const [step, setStep] = useProgressState(
      "lesson-step",
      0,
      validInteger(0, lessonStages(type).length - 1),
    ),
    [revealed, setRevealed] = useProgressState(
      "lesson-revealed",
      0,
      validInteger(0, targets(rows, type).length),
    ),
    [hint, setHint] = useState(false),
    [answer, setAnswer] = useState(false),
    [selected, setSelected] = useState<number | null>(null);
  const stages = lessonStages(type),
    stage = stages[step],
    all = targets(rows, type),
    histogram = type === "histogram",
    cumulative = type.startsWith("cumulative");
  const text =
    stage === "prepare"
      ? l.prepareText
      : stage === "calculate"
        ? histogram
          ? l.calculateHistogram
          : cumulative
            ? l.calculateCumulative
            : l.calculateFrequency
        : stage === "ends"
          ? l.endsText
          : stage === "axes"
            ? histogram
              ? l.axesHistogram
              : cumulative
                ? l.axesCumulative
                : l.axesFrequency
            : stage === "plot"
              ? histogram
                ? l.plotHistogram
                : l.plotPoints
              : stage === "join"
                ? l.joinText
                : stage === "smooth"
                  ? l.smoothText
                  : l.finishText;
  const points =
    stage === "axes"
      ? []
      : stage === "plot"
        ? all.slice(0, answer ? all.length : revealed)
        : all;
  const connection =
    stage === "smooth" || stage === "finish"
      ? expectedConnection(type)
      : stage === "join"
        ? "straight"
        : "none";
  function move(next: number) {
    setStep(next);
    setRevealed(0);
    setHint(false);
    setAnswer(false);
  }
  return (
    <section className={s.activity} aria-label={l.learn}>
      <div className={s.lessonProgress}>
        <span>
          {l.step} {step + 1} {l.of} {stages.length}
        </span>
        <progress value={step + 1} max={stages.length} />
      </div>
      <div className={s.sectionHeader}>
        <h3>{l[stage]}</h3>
        <button onClick={() => move(0)}>{l.restart}</button>
      </div>
      <p className={s.lessonText}>{text}</p>
      <div className={s.learningLayout}>
        <aside className={s.lessonAside}>
          <h4>{l.sourceTable}</h4>
          <GivenTable rows={rows} precision={precision} />
          {stage === "prepare" && raw && (
            <details>
              <summary>{l.sourceRaw}</summary>
              <p className={s.rawPreview}>{raw.slice(0, 100).join(", ")}</p>
              {raw.length > 100 && <p className={s.small}>{l.sourcePreview}</p>}
            </details>
          )}
        </aside>
        <div className={s.lessonBody}>
          {stage === "prepare" && (
            <p className={s.chartNote}>
              {
                c.chartNotes[
                  [
                    "histogram",
                    "polygon",
                    "curve",
                    "cumulativePolygon",
                    "cumulativeCurve",
                  ].indexOf(type)
                ]
              }
            </p>
          )}
          {stage === "calculate" && (
            <ScalarExercise
              rows={rows}
              precision={precision}
              initialKind={
                histogram ? "low" : cumulative ? "cumulative" : "mark"
              }
            />
          )}
          {stage === "ends" && (
            <div className={s.endClasses}>
              {[all[0], all.at(-1)!].map((p, i) => (
                <div key={i}>
                  <strong>{c.zero}</strong>
                  <p>
                    {c.mark}: {format(p.x)}
                  </p>
                  <p>{c.frequency}: 0</p>
                </div>
              ))}
            </div>
          )}
          {["axes", "plot", "join", "smooth", "finish"].includes(stage) && (
            <ConstructionGraph
              key={`${type}-${stage}`}
              rows={rows}
              type={type}
              title={title}
              axisLabel={axisLabel}
              precision={precision}
              items={points}
              connection={connection}
              animate={stage === "join" || stage === "smooth"}
              showCoordinates={stage === "plot"}
            />
          )}
          {stage === "plot" && (
            <div className={s.toolbar}>
              <button
                disabled={revealed >= all.length || answer}
                onClick={() => setRevealed(revealed + 1)}
              >
                {histogram ? l.nextBar : l.nextPoint}
              </button>
              <span>
                {l.revealed}: {answer ? all.length : revealed} / {all.length}
              </span>
            </div>
          )}
          {stage === "finish" && <p className={s.success}>{l.complete}</p>}
        </div>
      </div>
      <div className={s.lessonActions}>
        <button disabled={step === 0} onClick={() => move(step - 1)}>
          {l.previous}
        </button>
        <button onClick={() => setHint(!hint)} aria-expanded={hint}>
          {l.hint}
        </button>
        <button
          disabled={!allowAnswers}
          onClick={() => setAnswer(!answer)}
          aria-expanded={answer}
        >
          {l.answer}
        </button>
        <button
          className={s.primaryAction}
          disabled={step === stages.length - 1}
          onClick={() => move(step + 1)}
        >
          {l.next}
        </button>
      </div>
      {hint && (
        <p className={s.chartNote}>
          {histogram
            ? l.hintHistogram
            : cumulative
              ? l.hintCumulative
              : l.hintFrequency}
        </p>
      )}
      {allowAnswers && answer && (
        <section className={s.worked}>
          <h4>{l.solution}</h4>
          <FrequencyTable
            rows={rows}
            full
            continuous={precision === 0}
            selected={selected}
            onSelect={setSelected}
          />
          <ConstructionGraph
            rows={rows}
            type={type}
            title={title}
            axisLabel={axisLabel}
            precision={precision}
            items={all}
            connection={expectedConnection(type)}
            model
            showCoordinates
          />
        </section>
      )}
    </section>
  );
}
