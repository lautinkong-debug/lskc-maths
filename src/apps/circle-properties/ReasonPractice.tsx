"use client";

import MathText from "./MathText";

import { useEffect, useState } from "react";
import { reasons, reasonQuestions, type LabId } from "./content";
import { useLocalSession } from "./useLocalSession";
import {
  answerCard,
  cardKey,
  feedbackFor,
  focusPractice,
  initialPractice,
  nextCard,
  nextRound,
  parsePractice,
  practiceSummary,
  questionFor,
  reasonLabel,
  PRACTICE_KEY,
} from "./practice";
import ReasonDiagram from "./ReasonDiagram";
import styles from "./practice.module.css";

const clock = () => Date.now();
const topicNames: Record<LabId, string> = {
  bisector: "Centre, chords and perpendicular bisectors",
  chords: "Equal chords and perpendicular distances",
  centre: "Centre and circumference angles",
  segment: "Angles in the same segment",
  semicircle: "Angles in a semicircle and the converse",
  "equal-arcs": "Equal angles, arcs and chords",
  ratios: "Ratios of arcs and angles",
};

export default function ReasonPractice({
  focusLab,
  focusToken,
  collected,
  onCollect,
}: {
  focusLab: LabId | null;
  focusToken: number;
  collected: string[];
  onCollect: (id: string) => void;
}) {
  const [state, setState, storageFailed] = useLocalSession(
    PRACTICE_KEY,
    () => initialPractice(collected),
    parsePractice,
  );
  const [openedAt] = useState(clock);
  const [notice, setNotice] = useState("");
  const [highlightKey, setHighlightKey] = useState(0);
  useEffect(() => {
    if (focusLab && focusToken > state.lastFocusToken) {
      // An explicit request from a different playground starts its related examples.
      // Ordinary remounts restore the saved token and current question unchanged.
      setState((current) => focusPractice(current, focusLab, focusToken));
    }
  }, [focusLab, focusToken, setState, state.lastFocusToken]);
  const card = state.queue[state.index],
    question = card ? questionFor(card) : undefined;
  const correct = question && state.answer === question.reasonId;
  const summary = practiceSummary(
    state.history,
    Math.max(openedAt, state.lastActivity),
  );
  const related = state.focusLab
    ? topicNames[state.focusLab]
    : "Mixed circle reasons";
  const ids = question ? [question.reasonId, ...question.distractorIds] : [];
  const offset =
    (state.index + state.round + (card?.variant ?? 0)) %
    Math.max(1, ids.length);
  const options = ids.slice(offset).concat(ids.slice(0, offset));
  const feedback =
    question && state.answer !== null
      ? feedbackFor(question, state.answer)
      : "";
  const shortFeedback = feedback.split(/(?<=\.)\s/)[0];
  function choose(id: string) {
    if (!question || state.answer !== null) return;
    setState(answerCard(state, id, clock()));
    if (id === question.reasonId) onCollect(id);
  }
  function startRound(review = false) {
    const now = clock();
    if (review && practiceSummary(state.history, now).due === 0) {
      setNotice(
        "No reviews are due yet. Correct reasons are scheduled for a later day. You can continue this question or start a mixed round.",
      );
      return;
    }
    setNotice("");
    setHighlightKey(0);
    setState(nextRound(state, now, review));
  }
  function startMixed() {
    setNotice("");
    setHighlightKey(0);
    setState(
      nextRound(
        {
          ...state,
          focusLab: null,
          remaining: reasonQuestions.map((q) => ({
            questionId: q.id,
            variant: state.history[q.reasonId]?.seen ? 1 : 0,
          })),
        },
        clock(),
      ),
    );
  }
  return (
    <section className={styles.root} aria-label="Reason practice">
      <header className={styles.header}>
        <div>
          <h2>Reason relay</h2>
          <p>
            Use the diagram. Recall a reason. Check which conditions make it
            work.
          </p>
        </div>
      </header>
      <div className={styles.route}>
        <strong>{related}</strong>
        <details className={styles.roundMenu}>
          <summary>Change round</summary>
          <div>
            <button type="button" onClick={startMixed}>
              Start a mixed round
            </button>
            <button type="button" onClick={() => startRound(true)}>
              Review due reasons{summary.due ? ` (${summary.due})` : ""}
            </button>
          </div>
        </details>
      </div>
      {storageFailed && (
        <p className={styles.saveNote} role="status">
          This browser could not save your practice. Keep this page open to
          retain the current round.
        </p>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      {question ? (
        <div className={styles.layout} key={cardKey(card)}>
          <ReasonDiagram
            question={question}
            emphasise={state.answer !== null}
            highlightKey={highlightKey}
          />
          <div className={styles.question}>
            <div className={styles.topline}>
              <span>
                Question {state.index + 1} of {state.queue.length} · Round{" "}
                {state.round}
              </span>
              <label>
                <input
                  type="checkbox"
                  checked={state.recall}
                  onChange={(e) =>
                    setState({
                      ...state,
                      recall: e.target.checked,
                      revealed: false,
                    })
                  }
                />
                Recall before choices
              </label>
            </div>
            <progress
              value={state.index}
              max={state.queue.length}
              aria-label="Relay progress"
            />
            <div
              className={`${styles.given} ${state.answer !== null && !correct ? styles.highlight : ""}`}
            >
              <span>Given</span>
              <p>
                <MathText>{question.given}</MathText>
              </p>
            </div>
            <div className={styles.conclusion}>
              <span>We want to justify</span>
              <p>
                <MathText>{question.statement}</MathText>
              </p>
            </div>
            <h3>Which reason connects the two?</h3>
            {state.recall && !state.revealed && state.answer === null ? (
              <div className={styles.recall}>
                <p>Say or write the reason before looking at the choices.</p>
                <small>Your spoken answer is not automatically marked.</small>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => setState({ ...state, revealed: true })}
                >
                  Show the choices
                </button>
              </div>
            ) : (
              <div className={styles.choices}>
                {options.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    disabled={state.answer !== null}
                    data-result={
                      state.answer === null
                        ? undefined
                        : id === question.reasonId
                          ? "correct"
                          : id === state.answer
                            ? "incorrect"
                            : undefined
                    }
                    onClick={() => choose(id)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    <span>({reasonLabel(id)})</span>
                  </button>
                ))}
              </div>
            )}
            {state.answer !== null && (
              <div
                className={styles.feedback}
                role="status"
                data-correct={!!correct}
              >
                <h3>
                  {correct
                    ? "This reason fits the given conditions."
                    : "Check the direction and the conditions."}
                </h3>
                <p>
                  <MathText>{shortFeedback}</MathText>
                </p>
                {!correct && (
                  <p className={styles.correction}>
                    <b>Use:</b> ({reasonLabel(question.reasonId)})
                  </p>
                )}
                <button
                  type="button"
                  className={styles.figureAction}
                  onClick={() => setHighlightKey((value) => value + 1)}
                >
                  Show the givens on the diagram
                </button>
                <details className={styles.feedbackDetails}>
                  <summary>Why this reason works</summary>
                  {!correct && (
                    <p>
                      <b>Your choice:</b> ({reasonLabel(state.answer)})
                    </p>
                  )}
                  {feedback !== shortFeedback && (
                    <p>
                      <MathText>{feedback}</MathText>
                    </p>
                  )}
                  <p>
                    <b>Keep this condition:</b>{" "}
                    <MathText>
                      {
                        reasons.find((r) => r.id === question.reasonId)!
                          .condition
                      }
                    </MathText>
                  </p>
                  <small>
                    {correct
                      ? "One correct response is evidence of practice, not proof of mastery. Revisit a changed example later."
                      : "A different example of this question will return after other questions."}
                  </small>
                </details>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    setHighlightKey(0);
                    setState(nextCard(state));
                  }}
                >
                  {state.index + 1 === state.queue.length
                    ? "See round review"
                    : "Next question"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.roundEnd}>
          <h3>Round review</h3>
          <p className={styles.score}>
            {state.roundCorrect} / {state.queue.length} correct
          </p>
          <p>
            {state.missed.length
              ? `${state.missed.length} example${state.missed.length === 1 ? "" : "s"} will return in a changed form, after at least three other answers.`
              : "You connected the givens to the reasons in this round. Try a new context next."}
          </p>
          <p>
            Return on a later day for a changed example. Only a successful
            later-day review adds to that count.
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => startRound()}
          >
            Play the next five
          </button>
        </div>
      )}
      <details className={styles.history}>
        <summary>Your reason review record · {summary.seen} tried</summary>
        <div className={styles.stats} aria-label="Practice evidence">
          <span>
            <b>{summary.seen}</b> Tried
          </span>
          <span>
            <b>{summary.correctOnce}</b> Correct at least once
          </span>
          <span>
            <b>{summary.reviewedLater}</b> Correct on a later day
          </span>
        </div>
        <p>
          “Correct at least once” includes valid successes saved from the
          earlier version. Their original dates are unknown, so they do not
          count as later-day reviews.
        </p>
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Attempts</th>
              <th>Errors</th>
              <th>Review evidence</th>
            </tr>
          </thead>
          <tbody>
            {reasons.map((r) => {
              const h = state.history[r.id];
              return (
                <tr key={r.id}>
                  <td>
                    {r.number} · {r.label}
                  </td>
                  <td>{h?.seen ?? 0}</td>
                  <td>{h?.mistakes ?? 0}</td>
                  <td>
                    {h?.reviewedLater
                      ? "Correct on a later day"
                      : h?.correct
                        ? "Correct at least once"
                        : h?.seen
                          ? "Needs another example"
                          : "Not tried"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </section>
  );
}
