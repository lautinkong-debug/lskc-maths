import { useEffect, useId, useRef, useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import Figure from "./Figure";
import { closeEnough, readNumber } from "./NumberTask";
import type { Question } from "./types";
import s from "./path.module.css";

export type Marked = {
  question: Question;
  right: boolean;
  /** What the student chose or typed, as text for the review. */
  shown: string;
  /** For a "which reason" question: the reason picked. */
  pickedReason?: string;
  /** A sentence about this wrong answer, when the slip is recognised. */
  note?: string;
};

type Draft = { picked?: number; text?: string };

export function mark(question: Question, draft: Draft): Marked {
  if (question.kind === "choice") {
    const option =
      draft.picked === undefined ? undefined : question.options[draft.picked];
    return {
      question,
      right: Boolean(option?.good),
      shown: option?.text ?? c.noAnswer,
      pickedReason: option?.reasonId,
      note: option && !option.good ? option.why : undefined,
    };
  }
  const value = readNumber(draft.text ?? "");
  const right = value !== null && closeEnough(value, question.answer);
  return {
    question,
    right,
    shown: draft.text?.trim()
      ? `${draft.text.trim()} ${question.unit}`
      : c.noAnswer,
    note:
      !right && value !== null
        ? question.slips?.find((slip) => closeEnough(value, slip.value))?.why
        : undefined,
  };
}

export const rightAnswer = (question: Question) =>
  question.kind === "choice"
    ? (question.options.find((option) => option.good)?.text ?? "")
    : `${question.answer} ${question.unit}`;

const letters = "ABCD";

/**
 * Runs a list of questions. A station Check marks each answer at once, so the
 * student learns from it. The Chapter test marks nothing until it is handed in.
 */
export default function Quiz({
  questions,
  feedback,
  onFinish,
}: {
  questions: Question[];
  feedback: "each" | "end";
  onFinish: (marked: Marked[]) => void;
}) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    questions.map(() => ({})),
  );
  const [locked, setLocked] = useState<boolean[]>(() =>
    questions.map(() => false),
  );
  const topRef = useRef<HTMLDivElement>(null);
  const question = questions[index],
    draft = drafts[index];
  const isLocked = locked[index];
  const result = isLocked ? mark(question, draft) : undefined;
  const hasAnswer =
    question.kind === "choice"
      ? draft.picked !== undefined
      : Boolean(draft.text?.trim());
  const last = index === questions.length - 1;

  useEffect(() => {
    topRef.current?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const update = (next: Draft) =>
    setDrafts(drafts.map((item, i) => (i === index ? next : item)));
  const finish = () =>
    onFinish(questions.map((item, i) => mark(item, drafts[i])));
  function forward() {
    if (feedback === "each" && !isLocked) {
      setLocked(locked.map((item, i) => (i === index ? true : item)));
      return;
    }
    if (last) finish();
    else setIndex(index + 1);
  }
  const answered = drafts.filter(
    (item) => item.picked !== undefined || item.text?.trim(),
  ).length;

  return (
    <div className={s.quiz}>
      <div className={s.quizBar}>
        <p ref={topRef} tabIndex={-1} className={s.count}>
          {c.questionOf(index + 1, questions.length)}
        </p>
        <ol className={s.dots} aria-label={c.progress}>
          {questions.map((item, i) => {
            const done = locked[i] ? mark(item, drafts[i]).right : undefined;
            return (
              <li
                key={item.id}
                data-current={i === index}
                data-state={
                  feedback === "each"
                    ? done === undefined
                      ? undefined
                      : done
                        ? "right"
                        : "wrong"
                    : drafts[i].picked !== undefined || drafts[i].text?.trim()
                      ? "answered"
                      : undefined
                }
              >
                {feedback === "end" ? (
                  <button
                    type="button"
                    aria-label={c.goToQuestion(i + 1)}
                    aria-current={i === index}
                    onClick={() => setIndex(i)}
                  >
                    {i + 1}
                  </button>
                ) : (
                  <span>{i + 1}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <div className={question.figure ? s.split : s.solo} key={question.id}>
        {question.figure && (
          <div className={s.board}>
            <Figure figure={question.figure} />
            <p className={s.notToScale}>{c.notToScale}</p>
          </div>
        )}
        <div className={s.task}>
          {question.given && (
            <dl className={s.knowWant}>
              <div data-kind="given">
                <dt>{c.given}</dt>
                <dd>
                  <MathText>{question.given}</MathText>
                </dd>
              </div>
            </dl>
          )}
          {question.kind === "choice" ? (
            <>
              <p className={s.ask}>
                <MathText>{question.prompt}</MathText>
              </p>
              <div
                className={s.options}
                role="radiogroup"
                aria-label={c.chooseOne}
              >
                {question.options.map((option, i) => {
                  const state = !isLocked
                    ? draft.picked === i
                      ? "picked"
                      : undefined
                    : option.good
                      ? "right"
                      : draft.picked === i
                        ? "wrong"
                        : undefined;
                  return (
                    <button
                      type="button"
                      key={option.text}
                      role="radio"
                      aria-checked={draft.picked === i}
                      className={s.option}
                      data-state={state}
                      disabled={isLocked}
                      onClick={() => update({ picked: i })}
                    >
                      <span className={s.letter} aria-hidden="true">
                        {state === "right"
                          ? "✓"
                          : state === "wrong"
                            ? "✗"
                            : letters[i]}
                      </span>
                      <span>
                        <MathText>{option.text}</MathText>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <label className={s.ask} htmlFor={id}>
                <MathText>{question.prompt}</MathText>
              </label>
              <span className={s.field}>
                <input
                  id={id}
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.text ?? ""}
                  disabled={isLocked}
                  onChange={(event) => update({ text: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && hasAnswer) forward();
                  }}
                />
                <span>{question.unit}</span>
              </span>
            </>
          )}
          {result && (
            <div
              className={s.feedback}
              role="status"
              data-tone={result.right ? "right" : "wrong"}
            >
              <strong>{result.right ? c.correct : c.notThisTime}</strong>{" "}
              {question.kind === "choice" ? (
                <MathText>
                  {result.right
                    ? (question.options.find((option) => option.good)?.why ??
                      "")
                    : (result.note ?? "")}
                </MathText>
              ) : (
                !result.right && (
                  <MathText>
                    {result.note ?? c.answerIs(rightAnswer(question))}
                  </MathText>
                )
              )}
              {question.kind === "number" && (
                <ol className={s.working}>
                  {question.solution.map((line) => (
                    <li key={line}>
                      <MathText>{line}</MathText>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
          <div className={s.row}>
            {feedback === "end" && index > 0 && (
              <button
                type="button"
                className={s.quiet}
                onClick={() => setIndex(index - 1)}
              >
                {c.back}
              </button>
            )}
            <button
              type="button"
              className={s.primary}
              disabled={feedback === "each" ? !hasAnswer : false}
              onClick={forward}
            >
              {feedback === "each" && !isLocked
                ? c.check
                : last
                  ? feedback === "end"
                    ? c.handIn(answered, questions.length)
                    : c.seeResult
                  : c.nextQuestion}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
