"use client";

import { circleLessonCopy as c } from "@/lib/copy";
import { reasons } from "./content";
import {
  chordLessonStarts,
  initialChordLesson,
  sortCards,
  writeItems,
  type ChordLessonState,
  type ChordLessonStep,
  type ChordReason,
} from "./chordLessonData";
import type { Parameters } from "./geometry";
import MathText from "./MathText";
import s from "./chord-lesson.module.css";

const reasonLabel = (id: ChordReason) =>
  reasons.find((reason) => reason.id === id)!.label;
const theorem = { r1: "16.1", r2: "16.2" } as const;

/** One result card: the given fact, what it gives you, and the reason to write. */
function Found({
  found,
  given,
  get,
  reason,
  say,
}: {
  found: string;
  given: string;
  get: string;
  reason: ChordReason;
  say: string;
}) {
  return (
    <div className={s.found} role="status">
      <strong>
        <MathText>{found}</MathText>
      </strong>
      <dl>
        <dt>{c.given}</dt>
        <dd>
          <MathText>{given}</MathText>
        </dd>
        <dt>{c.get}</dt>
        <dd>
          <MathText>{get}</MathText>
        </dd>
        <dt>{c.write}</dt>
        <dd>
          (<MathText>{reasonLabel(reason)}</MathText>)
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
  const writeRight = writeItems.filter(
    (item) => state.write[item.id] === item.answer,
  ).length;
  const complete = writeRight === writeItems.length;
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
                reason={step === 0 ? "r1" : "r2"}
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
                <th scope="col">{c.given}</th>
                <th scope="col">{c.get}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">16.1</th>
                <td>
                  <MathText>{c.perpendicular.given}</MathText>
                </td>
                <td>
                  <MathText>{c.perpendicular.get}</MathText>
                </td>
              </tr>
              <tr>
                <th scope="row">16.2</th>
                <td>
                  <MathText>{c.midpoint.given}</MathText>
                </td>
                <td>
                  <MathText>{c.midpoint.get}</MathText>
                </td>
              </tr>
            </tbody>
          </table>
          <p className={s.trap}>
            <MathText>{c.which.trap}</MathText>
          </p>
          <p className={s.task}>{c.which.task}</p>
          <ol className={s.cards}>
            {sortCards.map((card, index) => {
              const choice = state.sort[card.id];
              return (
                <li
                  key={card.id}
                  data-result={choice ? choice === card.answer : undefined}
                >
                  <p>
                    <strong>
                      <MathText>{card.given}</MathText>
                    </strong>{" "}
                    <MathText>{card.ask}</MathText>
                  </p>
                  <div role="group" aria-label={c.which.cardLabel(index + 1)}>
                    {(["r1", "r2"] as const).map((id) => (
                      <button
                        type="button"
                        key={id}
                        aria-pressed={choice === id}
                        onClick={() =>
                          onState((previous) => ({
                            ...previous,
                            sort: { ...previous.sort, [card.id]: id },
                          }))
                        }
                      >
                        {theorem[id]}
                      </button>
                    ))}
                  </div>
                  <p className={s.feedback} aria-live="polite">
                    {choice &&
                      (choice === card.answer
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
              const choice = state.write[item.id];
              const right = choice === item.answer;
              const [first, ...rest] = item.lines;
              return (
                <li key={item.id} data-result={choice ? right : undefined}>
                  <p>
                    <strong>
                      <MathText>{item.question}</MathText>
                    </strong>
                  </p>
                  <div className={s.working}>
                    <p>
                      <MathText>{first}</MathText>{" "}
                      <span className={s.blank}>
                        {right ? (
                          <>
                            (<MathText>{reasonLabel(item.answer)}</MathText>)
                          </>
                        ) : (
                          c.writeStep.blank
                        )}
                      </span>
                    </p>
                    {rest.map((line) => (
                      <p key={line}>
                        <MathText>{line}</MathText>
                      </p>
                    ))}
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
                        onClick={() =>
                          onState((previous) => ({
                            ...previous,
                            write: { ...previous.write, [item.id]: id },
                          }))
                        }
                      >
                        (<MathText>{reasonLabel(id)}</MathText>)
                      </button>
                    ))}
                  </div>
                  <p className={s.feedback} aria-live="polite">
                    {choice && (right ? c.writeStep.right : c.writeStep.wrong)}
                  </p>
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
