"use client";

import MathText from "./MathText";
import { circleReviewCopy as c } from "@/lib/copy";

import { useState } from "react";
import { reasons, type LabId } from "./content";
import { useLocalSession } from "./useLocalSession";
import {
  answerCard,
  cardKey,
  feedbackFor,
  freshPracticeRound,
  initialPractice,
  nextCard,
  nextRound,
  parsePractice,
  practiceSummary,
  questionFor,
  reasonLabel,
  relayPositions,
  relayView,
  visitQuestion,
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
  collected,
  onCollect,
  onResetRecord,
}: {
  collected: string[];
  onCollect: (id: string) => void;
  onResetRecord: () => void;
}) {
  const [state, setState, storageFailed] = useLocalSession(
    PRACTICE_KEY,
    () => initialPractice(collected),
    parsePractice,
  );
  const [openedAt] = useState(clock);
  const [notice, setNotice] = useState("");
  const [highlightKey, setHighlightKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const view = relayView(state);
  const { card, answer, review } = view;
  const positions = relayPositions(state);
  const cursor = positions.findIndex(
    (p) => p.round === view.round && p.index === view.index,
  );
  const question = card ? questionFor(card) : undefined;
  const correct = question && answer === question.reasonId;
  const summary = practiceSummary(
    state.history,
    Math.max(openedAt, state.lastActivity),
  );
  const related = view.focusLab
    ? topicNames[view.focusLab]
    : "Mixed circle reasons";
  const ids = question ? [question.reasonId, ...question.distractorIds] : [];
  const offset =
    (view.index + view.round + (card?.variant ?? 0)) % Math.max(1, ids.length);
  const options = ids.slice(offset).concat(ids.slice(0, offset));
  const feedback =
    question && answer !== null ? feedbackFor(question, answer) : "";
  const shortFeedback = feedback.split(/(?<=\.)\s/)[0];
  function choose(id: string) {
    if (!question || review || answer !== null) return;
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
    setNotice(c.generated);
    setHighlightKey(0);
    setState(freshPracticeRound(state, clock()));
  }
  function visit(position: (typeof positions)[number]) {
    if (!position) return;
    setNotice("");
    setHighlightKey(0);
    setState(visitQuestion(state, position));
  }
  function advance() {
    if (review) visit(positions[cursor + 1]);
    else if (answer !== null) {
      setNotice("");
      setHighlightKey(0);
      setState(nextCard(state));
    }
  }
  return (
    <section className={styles.root} aria-label="Reason practice">
      <header className={styles.header}>
        <div>
          <h2>{c.title}</h2>
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
      <nav className={styles.questionNav} aria-label={c.navigation}>
        <button
          type="button"
          disabled={cursor <= 0}
          onClick={() => visit(positions[cursor - 1])}
        >
          <span aria-hidden="true">← </span>
          {c.previous}
        </button>
        <label>
          <span>{c.goTo}</span>
          <select
            value={cursor}
            onChange={(e) => visit(positions[Number(e.target.value)])}
          >
            {positions.map((p, i) => (
              <option key={`${p.round}-${p.index}`} value={i}>
                Round {p.round} ·{" "}
                {p.round === state.round && p.index === state.queue.length
                  ? "Round review"
                  : `Q${p.index + 1}`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!review && answer === null}
          onClick={advance}
        >
          {c.next}
          <span aria-hidden="true"> →</span>
        </button>
        <button type="button" className={styles.newSet} onClick={startMixed}>
          <span aria-hidden="true">↻ </span>
          {c.newSet}
        </button>
      </nav>
      {review && (
        <div className={styles.reviewBar}>
          <span>{c.reviewing(view.round, view.index + 1)}</span>
          <button
            type="button"
            onClick={() => visit(positions[positions.length - 1])}
          >
            {c.resume}
          </button>
        </div>
      )}
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
      {question && card ? (
        <div className={styles.layout} key={`${view.round}-${cardKey(card)}`}>
          <ReasonDiagram
            question={question}
            emphasise={answer !== null}
            highlightKey={highlightKey}
          />
          <div className={styles.question}>
            <div className={styles.topline}>
              <span>
                Question {view.index + 1} of {view.queue.length} · Round{" "}
                {view.round}
              </span>
              <label>
                <input
                  type="checkbox"
                  checked={state.recall}
                  disabled={review}
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
              value={view.index}
              max={view.queue.length}
              aria-label="Relay progress"
            />
            <div
              className={`${styles.given} ${answer !== null && !correct ? styles.highlight : ""}`}
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
            {review && answer === null && (
              <p className={styles.archivedNote}>{c.noAnswer}</p>
            )}
            {!review && state.recall && !state.revealed && answer === null ? (
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
                    disabled={review || answer !== null}
                    data-result={
                      answer === null && !review
                        ? undefined
                        : id === question.reasonId
                          ? "correct"
                          : id === answer
                            ? "incorrect"
                            : undefined
                    }
                    onClick={() => choose(id)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    <span>
                      ({reasonLabel(id)})
                      {review &&
                        (id === answer || id === question.reasonId) && (
                          <small className={styles.reviewChoice}>
                            {[
                              id === answer && c.yourAnswer,
                              id === question.reasonId && c.correctReason,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        )}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {answer !== null && (
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
                      <b>Your choice:</b> ({reasonLabel(answer)})
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
                  onClick={advance}
                >
                  {!review && view.index + 1 === view.queue.length
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
        <div className={styles.recordActions}>
          {confirmReset ? (
            <div role="group" aria-label={c.resetRecord}>
              <p>{c.resetRecordPrompt}</p>
              <button
                type="button"
                onClick={() => {
                  setState({
                    ...initialPractice(),
                    recall: state.recall,
                    lastFocusToken: state.lastFocusToken,
                  });
                  onResetRecord();
                  setNotice(c.recordReset);
                  setHighlightKey(0);
                  setConfirmReset(false);
                }}
              >
                {c.confirmReset}
              </button>
              <button type="button" onClick={() => setConfirmReset(false)}>
                {c.cancelReset}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)}>
              {c.resetRecord}
            </button>
          )}
        </div>
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
