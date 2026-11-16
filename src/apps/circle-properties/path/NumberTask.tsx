import { useId, useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import Figure from "./Figure";
import type { NumberQuestion } from "./types";
import s from "./path.module.css";

/** "8", "8.0" and " 8 cm" all mean 8. Anything else is not a number yet. */
export function readNumber(draft: string): number | null {
  const cleaned = draft
    .replace(/−/g, "-")
    .replace(/[°\s]|cm|m\b/gi, "")
    .trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}
export const closeEnough = (value: number, answer: number) =>
  Math.abs(value - answer) <= Math.max(0.05, Math.abs(answer) * 0.005);

/**
 * Find a length or an angle on your own. Hints come one at a time, and the
 * full written answer appears at the end, right or wrong.
 */
export default function NumberTask({
  question,
  onDone,
}: {
  question: NumberQuestion;
  onDone: (firstTry: boolean) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"ask" | "wrong" | "right" | "shown">(
    "ask",
  );
  const [note, setNote] = useState("");
  const over = state === "right" || state === "shown";
  function check() {
    const value = readNumber(draft);
    if (value === null) {
      setNote(c.typeNumber);
      setState("wrong");
      return;
    }
    if (closeEnough(value, question.answer)) {
      setState("right");
      onDone(tries === 0 && hints === 0);
      return;
    }
    const slip = question.slips?.find((item) => closeEnough(value, item.value));
    setNote(slip?.why ?? c.checkWorking);
    setTries(tries + 1);
    setState("wrong");
  }
  function show() {
    setState("shown");
    onDone(false);
  }
  return (
    <div className={s.split}>
      <div className={s.board}>
        <Figure figure={question.figure} />
        <p className={s.notToScale}>{c.notToScale}</p>
      </div>
      <div className={s.task}>
        <dl className={s.knowWant}>
          <div data-kind="given">
            <dt>{c.given}</dt>
            <dd>
              <MathText>{question.given}</MathText>
            </dd>
          </div>
        </dl>
        <label className={s.ask} htmlFor={id}>
          <MathText>{question.prompt}</MathText>
        </label>
        <div className={s.row}>
          <span className={s.field}>
            <input
              id={id}
              inputMode="decimal"
              autoComplete="off"
              value={draft}
              disabled={over}
              onChange={(event) => {
                setDraft(event.target.value);
                if (state === "wrong") setState("ask");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && draft.trim() && !over) check();
              }}
            />
            <span>{question.unit}</span>
          </span>
          {!over && (
            <button
              type="button"
              className={s.primary}
              disabled={!draft.trim()}
              onClick={check}
            >
              {c.check}
            </button>
          )}
        </div>
        <p className={s.feedback} role="status" data-tone={state}>
          {state === "right" && <strong>{c.correct}</strong>}
          {state === "wrong" && (
            <>
              <strong>{c.notYet}</strong> <MathText>{note}</MathText>
            </>
          )}
          {state === "shown" && <strong>{c.studyWorking}</strong>}
        </p>
        {hints > 0 && !over && (
          <ol className={s.hints}>
            {question.hints.slice(0, hints).map((hint) => (
              <li key={hint}>
                <MathText>{hint}</MathText>
              </li>
            ))}
          </ol>
        )}
        {!over && (
          <div className={s.row}>
            {hints < question.hints.length && (
              <button
                type="button"
                className={s.quiet}
                onClick={() => setHints(hints + 1)}
              >
                {hints === 0 ? c.hint : c.anotherHint}
              </button>
            )}
            {(tries >= 2 || hints >= question.hints.length) && (
              <button type="button" className={s.quiet} onClick={show}>
                {c.showWorking}
              </button>
            )}
          </div>
        )}
        {over && (
          <div className={s.solution}>
            <h4>{c.writeItLikeThis}</h4>
            <ol>
              {question.solution.map((line) => (
                <li key={line}>
                  <MathText>{line}</MathText>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
