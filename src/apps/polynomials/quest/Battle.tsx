import { useEffect, useMemo, useRef } from "react";
import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import { expressionTex } from "../algebra";
import { polynomialSource, sameAnswer } from "./algebra";
import { answerChoices } from "./choices";
import { Guardian } from "./Guardian";
import { Working } from "./Working";
import type { Action, Session } from "./session";
import styles from "./quest.module.css";
const c = copy.polynomialQuest;

export function Battle({
  session: s,
  active,
  act,
  back,
  restart,
}: {
  session: Session;
  active: boolean;
  act: (a: Action) => void;
  back: () => void;
  restart: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null),
    feedback = useRef<HTMLHeadingElement>(null);
  const q = s.question;
  const choices = useMemo(() => answerChoices(q), [q]);
  const answering = s.phase === "answering";
  useEffect(() => {
    if (!active) return;
    if (answering) first.current?.focus({ preventScroll: true });
    else feedback.current?.focus();
  }, [active, answering, q.id]);
  const misconception =
    s.submitted && q.mistakes.find((m) => sameAnswer(m.answer, s.submitted!));
  const incorrect = c.terms.filter((_, i) => s.submitted?.[i] !== q.answer[i]);
  return (
    <div
      data-testid="quest-battle"
      data-phase={s.phase}
      className={styles.battle}
    >
      <header className={styles.battleHeader}>
        <button type="button" className={styles.textButton} onClick={back}>
          {c.back}
        </button>
        <span>{c.round(s.round + 1)}</span>
        <button type="button" className={styles.textButton} onClick={restart}>
          {c.restart}
        </button>
      </header>
      <div className={styles.battleGrid}>
        <aside className={styles.arena}>
          <Guardian
            stage={s.stage}
            remaining={6 - s.cleared}
            celebrate={s.phase === "correct"}
          />
          <h2>{c.stages[s.stage].name}</h2>
          <p className={styles.shieldCount}>{c.shields(6 - s.cleared)}</p>
          <div className={styles.shieldTrack} aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} data-cleared={i < s.cleared} />
            ))}
          </div>
          <p className={styles.combo}>
            {s.combo > 1 ? c.combo(s.combo) : c.stages[s.stage].skill}
          </p>
        </aside>
        <section className={styles.problem}>
          {s.recovery > 0 && <p className={styles.recovery}>{c.recovery}</p>}
          <h3>{s.stage < 2 ? c.collectTask : c.task}</h3>
          <div
            className={styles.question}
            data-testid="quest-question"
            data-source={q.source}
          >
            <MathNotation>{expressionTex(q.source)}</MathNotation>
          </div>
          <fieldset disabled={!answering} aria-describedby="quest-entry-help">
            <legend>{c.entry}</legend>
            <p className={styles.entryHint} id="quest-entry-help">
              {c.entryHint}
            </p>
            <div className={styles.choices}>
              {choices.map((answer, i) => {
                const source = polynomialSource(answer);
                const selected =
                  !!s.submitted && sameAnswer(answer, s.submitted);
                const correct = !answering && sameAnswer(answer, q.answer);
                return (
                  <button
                    key={source}
                    ref={i === 0 ? first : undefined}
                    type="button"
                    className={styles.choice}
                    data-testid="quest-choice"
                    data-source={source}
                    data-selected={selected || undefined}
                    data-correct={correct || undefined}
                    onClick={() => {
                      if (active && answering)
                        act({ type: "submit", id: q.id, answer });
                    }}
                  >
                    <span className={styles.choiceLetter}>
                      {c.choiceLetters[i]}
                    </span>
                    <span className={styles.choiceExpression}>
                      <MathNotation>{expressionTex(source)}</MathNotation>
                    </span>
                    {(selected || correct) && (
                      <span className={styles.choiceStatus}>
                        {selected && <span>{c.yourChoice}</span>}
                        {correct && <span>{c.correctAnswer}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => act({ type: "hint", id: q.id })}
                disabled={s.hint}
              >
                {c.hint}
              </button>
            </div>
          </fieldset>
          {s.hint && answering && (
            <aside className={styles.hint} role="status">
              <strong>{c.hintHeading}</strong>
              <p>{c.hints[q.hint]}</p>
            </aside>
          )}
          {s.recovery > 0 && answering && (
            <p className={styles.helpNote}>{c.recoveryNote}</p>
          )}
          {!answering && (
            <section
              className={styles.feedback}
              data-correct={s.phase === "correct"}
            >
              <h3 tabIndex={-1} ref={feedback} role="status">
                {s.phase === "correct" ? c.correct : c.correction}
              </h3>
              <p>
                {s.phase === "correct"
                  ? c.correctDetail
                  : misconception
                    ? c.misconceptions[misconception.kind]
                    : c.wrongTerms(incorrect.join(", "))}
              </p>
              {s.phase === "correction" && <p>{c.correctionDetail}</p>}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() =>
                    act({
                      type: s.phase === "correct" ? "next" : "retry",
                      id: q.id,
                    })
                  }
                >
                  {s.phase === "correction"
                    ? c.retry
                    : s.round === 5
                      ? c.finish
                      : c.next}
                </button>
              </div>
              {s.phase === "correction" ? (
                <Working question={q} />
              ) : (
                <details>
                  <summary>{c.working}</summary>
                  <Working question={q} />
                </details>
              )}
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
