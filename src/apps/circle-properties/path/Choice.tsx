import { useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import type { Option } from "./types";
import s from "./path.module.css";

const letters = "ABCD";

/**
 * One question, a few big buttons. A wrong tap explains itself and stays
 * crossed out, so the next try is easier. Nothing is taken away.
 */
export default function Choice({
  options,
  guess = false,
  disabled = false,
  disabledNote,
  onDone,
}: {
  options: Option[];
  /** A prediction: every answer is welcome and none is marked. */
  guess?: boolean;
  disabled?: boolean;
  disabledNote?: string;
  onDone: (result: { picked: number; firstTry: boolean }) => void;
}) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const finished = chosen !== null;
  function choose(index: number) {
    if (finished || disabled) return;
    setLast(index);
    if (guess || options[index].good) {
      setChosen(index);
      onDone({ picked: index, firstTry: wrong.length === 0 });
    } else if (!wrong.includes(index)) setWrong([...wrong, index]);
  }
  const shown = last === null ? null : options[last];
  return (
    <div className={s.choice}>
      <div
        className={s.options}
        role="group"
        aria-label={c.chooseOne}
        data-locked={disabled && !finished}
      >
        {options.map((option, index) => {
          const state =
            chosen === index
              ? guess
                ? "guess"
                : "right"
              : wrong.includes(index)
                ? "wrong"
                : undefined;
          return (
            <button
              type="button"
              key={option.text}
              className={s.option}
              data-state={state}
              disabled={disabled || finished || wrong.includes(index)}
              aria-pressed={chosen === index}
              onClick={() => choose(index)}
            >
              <span className={s.letter} aria-hidden="true">
                {state === "right"
                  ? "✓"
                  : state === "wrong"
                    ? "✗"
                    : letters[index]}
              </span>
              <span>
                <MathText>{option.text}</MathText>
              </span>
            </button>
          );
        })}
      </div>
      {disabled && disabledNote && <p className={s.wait}>{disabledNote}</p>}
      <p
        className={s.feedback}
        role="status"
        data-tone={
          shown ? (guess ? "guess" : shown.good ? "right" : "wrong") : undefined
        }
      >
        {shown && (
          <>
            <strong>
              {guess ? c.guessKept : shown.good ? c.yes : c.notYet}
            </strong>{" "}
            <MathText>{guess ? c.guessLater : shown.why}</MathText>
          </>
        )}
      </p>
    </div>
  );
}
