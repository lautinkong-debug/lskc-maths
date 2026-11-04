"use client";

import { Fragment, useState } from "react";
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

export default function ChordLesson({
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
  const { step, found } = state;
  // Only the card just answered animates, not every saved answer on return.
  const [fresh, setFresh] = useState<string | null>(null);
  function go(next: ChordLessonStep) {
    // Each diagram step restarts from N off the mid-point until it is solved.
    if ((next === 0 || next === 1) && !found[next])
      onShape({ ...chordLessonStarts[next] });
    onState((previous) => ({ ...previous, step: next }));
  }
  const sorted = sortCards.filter((card) => state.sort[card.id]);
  const sortRight = sorted.filter(
    (card) => state.sort[card.id] === card.answer,
  ).length;
  const complete = writeItems
    .flatMap(solutionBlanks)
    .every((blank) => state.write[blank.id] === blank.answer);
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
                  ? sortRight === sortCards.length
                  : complete
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
          {found[step] ? (
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
            </>
          ) : (
            <p className={s.waiting}>
              <MathText>{diagramStep.waiting}</MathText>
            </p>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h4>{c.which.heading}</h4>
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
          <p className={s.trap}>
            <MathText>{c.which.trap}</MathText>
          </p>
          <p className={s.task}>{c.which.task}</p>
          <ol className={s.cards}>
            {sortCards.map((card, index) => {
              const choice = state.sort[card.id];
              const right = choice === card.answer;
              return (
                <li
                  key={card.id}
                  data-result={choice ? right : undefined}
                  data-fresh={fresh === card.id}
                >
                  {choice && <Stamp right={right} />}
                  <div className={s.cardBody}>
                    <div className={s.question}>
                      <p>
                        <strong>
                          <MathText>{card.given}</MathText>
                        </strong>{" "}
                        <MathText>{card.ask}</MathText>
                      </p>
                      <div
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
                                : right
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
                            {theorem[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ChordSketch
                      sketch={card.sketch}
                      label={c.sketch(`${card.given} ${card.ask}`)}
                    />
                  </div>
                  <p
                    className={s.feedback}
                    data-right={choice ? right : undefined}
                    aria-live="polite"
                  >
                    {choice &&
                      (right
                        ? c.which.right[card.answer]
                        : c.which.wrong[card.answer])}
                  </p>
                </li>
              );
            })}
          </ol>
          {sorted.length === sortCards.length && (
            <div className={s.score} role="status">
              <strong>{c.which.score(sortRight, sortCards.length)}</strong>
              {sortRight < sortCards.length && (
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
          <button type="button" className={s.primary} onClick={() => go(3)}>
            {c.next}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h4>{c.writeStep.heading}</h4>
          <p className={s.task}>{c.writeStep.task}</p>
          <ol className={s.cards}>
            {writeItems.map((item, index) => {
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
                  <div className={s.working}>
                    {item.lines.map((line) => (
                      <p
                        key={line.text}
                        className={line.indent ? s.indent : undefined}
                      >
                        <MathText>{line.text}</MathText>
                        {line.reason && (
                          <span className={s.shownReason}>({line.reason})</span>
                        )}
                        {line.blank &&
                          (state.write[line.blank.id] === line.blank.answer ? (
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
                            index + 1,
                            number + 1,
                          )}
                        >
                          {blank.choices.map((id) => (
                            <button
                              type="button"
                              key={id}
                              aria-pressed={choice === id}
                              data-mark={choice === id ? "wrong" : undefined}
                              onClick={() => {
                                setFresh(item.id);
                                onState((previous) => ({
                                  ...previous,
                                  write: { ...previous.write, [blank.id]: id },
                                }));
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
