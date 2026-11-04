"use client";

import { Fragment, useRef, useState } from "react";
import { circleLessonCopy as c } from "@/lib/copy";
import { reasons } from "./content";
import {
  chordLessonStarts,
  initialChordLesson,
  solutionBlanks,
  sortCards,
  writeItems,
  type ChordLessonState,
  type ChordLessonStep,
  type ChordReason,
  type SolutionReason,
} from "./chordLessonData";
import ChordSketch from "./ChordSketch";
import type { Parameters } from "./geometry";
import MathText from "./MathText";
import ReasonLabel, { Highlight } from "./ReasonLabel";
import s from "./chord-lesson.module.css";

const reason = (id: ChordReason) => reasons.find((item) => item.id === id)!;
const theorem = { r1: "16.1", r2: "16.2" } as const;
const sortRight = (state: ChordLessonState) =>
  sortCards.filter((card) => state.sort[card.id] === card.answer).length;
const writeComplete = (state: ChordLessonState) =>
  writeItems
    .flatMap(solutionBlanks)
    .every((blank) => state.write[blank.id] === blank.answer);

/** A hidden reason's words; the theorems also show their highlighted halves. */
function SolutionReasonLabel({
  id,
  arrow,
}: {
  id: SolutionReason;
  arrow?: boolean;
}) {
  return id === "r1" || id === "r2" ? (
    <ReasonLabel reason={reason(id)} arrow={arrow} />
  ) : (
    <MathText>{c.writeStep.otherReasons[id]}</MathText>
  );
}

/** A solved blank's buttons disappear, so keyboard focus moves on within the card. */
function keepFocusIn(card: HTMLElement | null) {
  requestAnimationFrame(() =>
    (card?.querySelector("button") ?? card)?.focus({ preventScroll: true }),
  );
}

/** Says right or wrong in words and a tick or cross, not by colour alone. */
function Stamp({ right }: { right: boolean }) {
  return (
    <span className={s.stamp} data-right={right}>
      {right ? c.stamp.right : c.stamp.wrong}
    </span>
  );
}

/** One result card: the given fact, what it gives you, and the reason to write. */
function Found({
  found,
  given,
  get,
  reasonId,
  say,
}: {
  found: string;
  given: string;
  get: string;
  reasonId: ChordReason;
  say: string;
}) {
  return (
    <div className={s.found} role="status">
      <strong>
        <MathText>{found}</MathText>
      </strong>
      <dl>
        <dt>
          <Highlight kind="given">{c.given}</Highlight>
        </dt>
        <dd>
          <MathText>{given}</MathText>
        </dd>
        <dt>
          <Highlight kind="get">{c.get}</Highlight>
        </dt>
        <dd>
          <MathText>{get}</MathText>
        </dd>
        <dt>{c.write}</dt>
        <dd className={s.writeReason}>
          (<ReasonLabel reason={reason(reasonId)} />)
        </dd>
      </dl>
      <p className={s.say}>♪ {say}</p>
    </div>
  );
}

/** The panel beside the circle: the steps, each discovery and the reference table. */
export default function ChordLesson({
  state,
  onState,
  onShape,
  conditionMet,
  revealed,
  onDeduce,
}: {
  state: ChordLessonState;
  onState: (update: (previous: ChordLessonState) => ChordLessonState) => void;
  onShape: (parameters: Parameters) => void;
  /** The given fact is true on the circle right now. */
  conditionMet: boolean;
  /** The class has pressed for the deduction during this visit to the step. */
  revealed: boolean;
  onDeduce: () => void;
}) {
  const { step, found } = state;
  function go(next: ChordLessonStep) {
    // A diagram step always starts again from N off the mid-point, for the next class.
    if (next === 0 || next === 1) onShape({ ...chordLessonStarts[next] });
    onState((previous) => ({ ...previous, step: next }));
  }
  const diagramStep = step === 0 ? c.perpendicular : c.midpoint;

  return (
    <section className={s.lesson} aria-label={c.mode}>
      <h3 className={s.title}>{c.title}</h3>
      <nav className={s.steps} aria-label={c.stepsLabel}>
        {c.steps.map((label, index) => (
          <button
            type="button"
            key={label}
            aria-current={step === index ? "step" : undefined}
            data-done={
              index < 2
                ? found[index]
                : index === 2
                  ? sortRight(state) === sortCards.length
                  : writeComplete(state)
            }
            onClick={() => go(index as ChordLessonStep)}
          >
            <span aria-hidden="true">{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <p className={s.stepOf}>{c.stepOf(step + 1, c.steps.length)}</p>

      {(step === 0 || step === 1) && (
        <>
          {/* The task itself sits above the circle, where every topic shows it. */}
          <h4>
            <MathText>{diagramStep.heading}</MathText>
          </h4>
          {revealed ? (
            <>
              <Found
                found={diagramStep.found}
                given={diagramStep.given}
                get={diagramStep.get}
                reasonId={step === 0 ? "r1" : "r2"}
                say={diagramStep.say}
              />
              <button
                type="button"
                className={s.primary}
                onClick={() => go((step + 1) as ChordLessonStep)}
              >
                {c.next}
              </button>
              <button type="button" onClick={() => go(step)}>
                {c.showAgain}
              </button>
            </>
          ) : conditionMet ? (
            // A pause for the class: the circle shows only the condition so far.
            <div className={s.condition} role="status">
              <p>
                <Highlight kind="given">{c.given}</Highlight>{" "}
                <MathText>{diagramStep.given}</MathText>
              </p>
              <button type="button" className={s.primary} onClick={onDeduce}>
                {c.deduce}
              </button>
            </div>
          ) : (
            <p className={s.waiting}>
              <MathText>{diagramStep.waiting}</MathText>
            </p>
          )}
        </>
      )}

      {/* The questions fill the full width below; this stays beside the circle to refer to. */}
      {step >= 2 && (
        <>
          <h4>{step === 2 ? c.which.heading : c.writeStep.heading}</h4>
          <table className={s.compare}>
            <caption className={s.visuallyHidden}>{c.which.table}</caption>
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">
                  <Highlight kind="given">{c.given}</Highlight>
                </th>
                <th scope="col">
                  <Highlight kind="get">{c.get}</Highlight>
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["r1", c.perpendicular],
                  ["r2", c.midpoint],
                ] as const
              ).map(([id, row]) => (
                <Fragment key={id}>
                  <tr>
                    <th scope="row" rowSpan={2}>
                      {theorem[id]}
                    </th>
                    <td>
                      <MathText>{row.given}</MathText>
                    </td>
                    <td>
                      <MathText>{row.get}</MathText>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className={s.writeReason}>
                      (<ReasonLabel reason={reason(id)} />)
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className={s.trap}>
            <strong>{c.which.trap.title}</strong>
            <ul>
              {c.which.trap.points.map((point) => (
                <li key={point}>
                  <MathText>{point}</MathText>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

/** Steps 3 and 4: the question cards, across the full width below the circle. */
export function ChordLessonQuestions({
  state,
  onState,
  onShape,
  onPractice,
  onFreePlay,
}: {
  state: ChordLessonState;
  onState: (update: (previous: ChordLessonState) => ChordLessonState) => void;
  onShape: (parameters: Parameters) => void;
  onPractice: () => void;
  onFreePlay: () => void;
}) {
  const { step } = state;
  const top = useRef<HTMLElement>(null);
  // Only the card just answered animates, not every saved answer on return.
  const [fresh, setFresh] = useState<string | null>(null);
  const sorted = sortCards.filter((card) => state.sort[card.id]);
  const right = sortRight(state);
  const complete = writeComplete(state);

  return (
    <section
      ref={top}
      className={`${s.lesson} ${s.questions}`}
      aria-label={c.questions}
    >
      {step === 2 && (
        <>
          <p className={s.task}>{c.which.task}</p>
          <ol className={s.cards}>
            {sortCards.map((card, index) => {
              const choice = state.sort[card.id];
              const correct = choice === card.answer;
              return (
                <li
                  key={card.id}
                  data-result={choice ? correct : undefined}
                  data-fresh={fresh === card.id}
                >
                  {choice && <Stamp right={correct} />}
                  <div className={s.cardBody}>
                    <p className={s.question}>
                      <strong>
                        <MathText>{card.given}</MathText>
                      </strong>{" "}
                      <MathText>{card.ask}</MathText>
                    </p>
                    <ChordSketch
                      sketch={card.sketch}
                      label={c.sketch(`${card.given} ${card.ask}`)}
                    />
                  </div>
                  <div
                    className={s.reasonChoices}
                    role="group"
                    aria-label={c.which.cardLabel(index + 1)}
                  >
                    {(["r1", "r2"] as const).map((id) => (
                      <button
                        type="button"
                        key={id}
                        aria-pressed={choice === id}
                        data-mark={
                          choice !== id
                            ? undefined
                            : correct
                              ? "right"
                              : "wrong"
                        }
                        onClick={() => {
                          setFresh(card.id);
                          onState((previous) => ({
                            ...previous,
                            sort: { ...previous.sort, [card.id]: id },
                          }));
                        }}
                      >
                        <span>
                          (<ReasonLabel reason={reason(id)} />)
                        </span>
                      </button>
                    ))}
                  </div>
                  <p
                    className={s.feedback}
                    data-right={choice ? correct : undefined}
                    aria-live="polite"
                  >
                    {choice &&
                      (correct
                        ? c.which.right[card.answer]
                        : c.which.wrong[card.answer])}
                  </p>
                </li>
              );
            })}
          </ol>
          {sorted.length === sortCards.length && (
            <div className={s.score} role="status">
              <strong>{c.which.score(right, sortCards.length)}</strong>
              {right < sortCards.length && (
                <button
                  type="button"
                  onClick={() =>
                    onState((previous) => ({ ...previous, sort: {} }))
                  }
                >
                  {c.which.again}
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            className={s.primary}
            onClick={() => {
              onState((previous) => ({ ...previous, step: 3 }));
              // The button is at the end of a long list; the next step starts at the top.
              requestAnimationFrame(() =>
                top.current?.scrollIntoView({ block: "start" }),
              );
            }}
          >
            {c.next}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <p className={s.task}>{c.writeStep.task}</p>
          {/* Fixed columns: a card never jumps across when a solved blank's buttons close. */}
          <div className={s.solutionColumns}>
            {[writeItems.slice(0, 2), writeItems.slice(2)].map((column) => (
              <ol key={column[0].id} className={s.cards}>
                {column.map((item) => {
                  const blanks = solutionBlanks(item);
                  const solved = blanks.every(
                    (blank) => state.write[blank.id] === blank.answer,
                  );
                  const wrong = blanks.some(
                    (blank) =>
                      state.write[blank.id] &&
                      state.write[blank.id] !== blank.answer,
                  );
                  return (
                    <li
                      key={item.id}
                      tabIndex={-1}
                      data-result={solved ? true : wrong ? false : undefined}
                      data-fresh={fresh === item.id}
                    >
                      {(solved || wrong) && <Stamp right={solved} />}
                      <div className={s.cardBody}>
                        <p className={s.question}>
                          <strong>
                            <MathText>{item.question}</MathText>
                          </strong>
                        </p>
                        <ChordSketch
                          sketch={item.sketch}
                          label={c.sketch(item.question)}
                        />
                      </div>
                      {/* Live, so a screen reader hears each reason as it is filled in. */}
                      <div className={s.working} aria-live="polite">
                        {item.lines.map((line) => (
                          <p
                            key={line.text}
                            className={line.indent ? s.indent : undefined}
                          >
                            <MathText>{line.text}</MathText>
                            {line.reason && (
                              <span className={s.shownReason}>
                                ({line.reason})
                              </span>
                            )}
                            {line.blank &&
                              (state.write[line.blank.id] ===
                              line.blank.answer ? (
                                <span className={s.filled}>
                                  (
                                  <SolutionReasonLabel
                                    id={line.blank.answer}
                                    arrow={false}
                                  />
                                  )
                                </span>
                              ) : (
                                <span className={s.blank}>
                                  {c.writeStep.blank(
                                    blanks.indexOf(line.blank) + 1,
                                  )}
                                </span>
                              ))}
                          </p>
                        ))}
                      </div>
                      {blanks.map((blank, number) => {
                        const choice = state.write[blank.id];
                        if (choice === blank.answer) return null;
                        return (
                          <div key={blank.id} className={s.blankChoices}>
                            <p>{c.writeStep.choose(number + 1)}</p>
                            <div
                              className={s.reasonChoices}
                              role="group"
                              aria-label={c.writeStep.blankLabel(
                                writeItems.indexOf(item) + 1,
                                number + 1,
                              )}
                            >
                              {blank.choices.map((id) => (
                                <button
                                  type="button"
                                  key={id}
                                  aria-pressed={choice === id}
                                  data-mark={
                                    choice === id ? "wrong" : undefined
                                  }
                                  onClick={(event) => {
                                    setFresh(item.id);
                                    onState((previous) => ({
                                      ...previous,
                                      write: {
                                        ...previous.write,
                                        [blank.id]: id,
                                      },
                                    }));
                                    if (id === blank.answer)
                                      keepFocusIn(
                                        event.currentTarget.closest("li"),
                                      );
                                  }}
                                >
                                  <span>
                                    (<SolutionReasonLabel id={id} />)
                                  </span>
                                </button>
                              ))}
                            </div>
                            <p
                              className={s.feedback}
                              data-right={choice ? false : undefined}
                              aria-live="polite"
                            >
                              {choice && c.writeStep.wrong[blank.answer]}
                            </p>
                          </div>
                        );
                      })}
                    </li>
                  );
                })}
              </ol>
            ))}
          </div>
          {complete && (
            <div className={s.complete} role="status">
              <strong>{c.complete}</strong>
              <ul>
                {c.remember.map((line) => (
                  <li key={line}>
                    <MathText>{line}</MathText>
                  </li>
                ))}
              </ul>
              <div className={s.actions}>
                <button
                  type="button"
                  className={s.primary}
                  onClick={onPractice}
                >
                  {c.practise}
                </button>
                <button type="button" onClick={onFreePlay}>
                  {c.freePlay}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShape({ ...chordLessonStarts[0] });
                    onState(() => initialChordLesson());
                  }}
                >
                  {c.restart}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
