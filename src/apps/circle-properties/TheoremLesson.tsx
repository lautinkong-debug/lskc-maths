"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import {
  circleCopy,
  circleLessonCopy,
  circleTheoremLessonCopy as c,
} from "@/lib/copy";
import { reasons, type Lab, type Reason } from "./content";
import MathText from "./MathText";
import MeasurementList from "./MeasurementList";
import InkToolbar from "./InkToolbar";
import { useInkBoard } from "./useInkBoard";
import ReasonFlowDiagram from "./ReasonFlowDiagram";
import { proofLineHints } from "./ReasonProofLines";
import ReasonLabel from "./ReasonLabel";
import {
  normaliseReasonParameters,
  reasonMeasurements,
  type ReasonParameters,
} from "./reasonExploration";
import { reasonFlow, reasonResultFact } from "./reasonFlow";
import { theoremLessons, type GuidedReasonId } from "./theoremLessonData";
import {
  anotherGuideShape,
  guideSteps,
  advanceGuideCase,
  answerGuideCase,
  restoreGuide,
  startGuide,
  type GuideProgress,
} from "./theoremGuideSession";
import { getGuideCase, writtenReasonQuestion } from "./theoremCaseBank";
import { useLocalSession } from "./useLocalSession";
import s from "./theorem-lesson.module.css";

function lessonIds(lab: Lab) {
  return lab.reasonIds.filter((id): id is GuidedReasonId =>
    Object.hasOwn(theoremLessons, id),
  );
}
const reasonById = (id: string): Reason => reasons.find((r) => r.id === id)!;

export default function TheoremLesson({
  lab,
  onRelay,
  chordSelector,
}: {
  lab: Lab;
  onRelay: () => void;
  chordSelector?: ReactNode;
}) {
  const ids = lessonIds(lab);
  const [selected, select, saveFailed] = useLocalSession<GuidedReasonId>(
    `guided-reason-${lab.id}`,
    () => ids[0],
    (raw) => ids.find((id) => id === raw),
  );
  const active = ids.includes(selected) ? selected : ids[0];
  const selector =
    chordSelector ??
    (ids.length > 1 && (
      <nav className={s.reasonNav} aria-label={c.chooseTheorem}>
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === active}
            onClick={() => select(id)}
          >
            {reasonById(id).number} · {theoremLessons[id].title}
          </button>
        ))}
      </nav>
    ));
  return (
    <>
      <LessonActivity
        key={active}
        id={active}
        selector={selector}
        onRelay={onRelay}
      />
      {saveFailed && <p role="status">{c.selectionFailed}</p>}
    </>
  );
}

type Question = {
  options: readonly string[];
  feedback: readonly string[];
  answer: number;
};
const optionLabel = (key: string) =>
  key === "insufficient" ? c.insufficient : reasonById(key).label;
function Choices({
  question,
  prompt,
  selected,
  onAnswer,
  reasonOptions = false,
}: {
  question: Question;
  prompt: string;
  selected: number | null;
  onAnswer: (index: number) => void;
  reasonOptions?: boolean;
}) {
  const heading = useId();
  const feedback = useRef<HTMLParagraphElement>(null);
  const correct = selected === question.answer;
  function selectAnswer(index: number) {
    onAnswer(index);
    requestAnimationFrame(() => {
      const node = feedback.current;
      if (!node) return;
      node.focus({ preventScroll: true });
      const bounds = node.getBoundingClientRect();
      if (bounds.bottom > window.innerHeight || bounds.top < 0)
        node.scrollIntoView({ block: "nearest" });
    });
  }
  return (
    <div className={s.question} role="group" aria-labelledby={heading}>
      <h4 id={heading}>
        <MathText>{prompt}</MathText>
      </h4>
      <div className={s.options}>
        {question.options.map((option, index) => (
          <button
            type="button"
            key={option}
            data-choice={index}
            aria-pressed={selected === index}
            data-answer={
              selected === index ? (correct ? "correct" : "retry") : undefined
            }
            disabled={correct}
            onClick={() => selectAnswer(index)}
          >
            <span className={s.letter} aria-hidden="true">
              {String.fromCharCode(65 + index)}
            </span>
            <span>
              <MathText>
                {reasonOptions ? optionLabel(option) : option}
              </MathText>
            </span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <p
          className={s.feedback}
          data-correct={correct}
          role="status"
          tabIndex={-1}
          ref={feedback}
        >
          {reasonOptions &&
            correct &&
            question.options[question.answer] !== "insufficient" && (
              <strong>
                {reasonById(question.options[question.answer]).number} ·{" "}
              </strong>
            )}
          {!correct && <strong>{c.retry} </strong>}
          <MathText>{question.feedback[selected]}</MathText>
        </p>
      )}
    </div>
  );
}

function LessonActivity({
  id,
  onRelay,
  selector,
}: {
  id: GuidedReasonId;
  onRelay: () => void;
  selector: ReactNode;
}) {
  const [progress, setProgress, failed] = useLocalSession(
    `guided-theorem-${id}-v1`,
    () => startGuide(id),
    (raw) => restoreGuide(id, raw),
  );
  const update = (changes: Partial<GuideProgress>) =>
    setProgress((previous) => ({ ...previous, ...changes }));
  const {
    stage,
    term,
    shape,
    firstLine,
    prediction,
    written,
    writtenReason,
    history,
    cursor,
  } = progress;
  const ink = useInkBoard(`guided-theorem-${id}`);
  const [penOpen, setPenOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const [showLines, setShowLines] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const caseHeading = useRef<HTMLHeadingElement>(null);
  const lessonPanel = useRef<HTMLElement>(null);
  const lesson = theoremLessons[id];
  const reason = reasonById(id);
  const termInfo = lesson.terms[term];
  const attempt = history[cursor];
  const transfer = getGuideCase(attempt.id, attempt.variant);
  const proofReason = writtenReasonQuestion(id);
  const currentCase = stage === 3 ? transfer : lesson.write;
  const answer = attempt.selected;
  const predicted = prediction === lesson.prediction.answer;
  const complete =
    written === lesson.write.answer && writtenReason === proofReason.answer;
  const step = (next: number) => {
    setShowLines(false);
    setConfirmRestart(false);
    if (next >= 2) setFocus(false);
    update({ stage: next });
  };
  const changeShape = (next: ReasonParameters) =>
    update({ shape: normaliseReasonParameters(id, next) });
  const termFinished = term === lesson.terms.length - 1;
  function changeCase(direction: "previous" | "next" | "similar") {
    setProgress((previous) =>
      direction === "previous"
        ? {
            ...previous,
            cursor: Math.max(0, previous.cursor - 1),
          }
        : advanceGuideCase(id, previous, direction === "similar"),
    );
    requestAnimationFrame(() => {
      caseHeading.current?.focus({ preventScroll: true });
      caseHeading.current?.scrollIntoView({ block: "nearest" });
    });
  }
  function restart() {
    ink.reset();
    setPenOpen(false);
    setFocus(false);
    setShowLines(false);
    setConfirmRestart(false);
    setProgress(startGuide(id));
  }
  return (
    <>
      {selector &&
        (stage === 3 ? (
          <details className={s.switchTheorem}>
            <summary>{c.chooseTheorem}</summary>
            {selector}
          </details>
        ) : (
          selector
        ))}
      <section
        className={s.lesson}
        data-focused={focus}
        data-testid="theorem-lesson"
        data-reason={id}
        data-case-reason={stage === 3 ? attempt.id : undefined}
        data-case-variant={stage === 3 ? attempt.variant : undefined}
        aria-label={stage === 3 ? c.mixedPractice : c.lessonName(reason.number)}
      >
        <nav className={s.stageNav} aria-label={c.stepsLabel}>
          <h3>
            {stage === 3
              ? c.mixedPractice
              : reason.number + " · " + lesson.title}
          </h3>
          <div>
            {guideSteps.map((name, index) => (
              <button
                type="button"
                key={name}
                aria-current={index === stage ? "step" : undefined}
                aria-label={name}
                onClick={() => step(index)}
              >
                <span aria-hidden="true">{index + 1}</span>
                {name}
              </button>
            ))}
          </div>
        </nav>

        <div className={s.board} role="region" aria-label={c.boardLabel}>
          {stage < 3 ? (
            <>
              <div className={s.boardTools}>
                {penOpen && <InkToolbar board={ink} />}
                <button
                  type="button"
                  aria-pressed={penOpen}
                  onClick={() => {
                    if (penOpen) ink.setMode("move");
                    setPenOpen(!penOpen);
                  }}
                >
                  {penOpen ? circleCopy.hidePen : circleCopy.pen}
                </button>
                <button
                  type="button"
                  aria-pressed={focus}
                  onClick={() => setFocus(!focus)}
                >
                  {focus ? circleCopy.unfocus : circleCopy.focus}
                </button>
              </div>
              <h4 className={s.boardTitle}>
                {stage === 0
                  ? c.findParts
                  : stage === 1
                    ? c.changeShape
                    : predicted
                      ? c.readMarks
                      : c.predict}
              </h4>
              <ReasonFlowDiagram
                reasonId={id}
                reveal={stage === 2 && predicted}
                parameters={shape}
                onChange={stage > 0 ? changeShape : undefined}
                trails={stage > 0 && firstLine ? [firstLine] : undefined}
                focusMarks={stage === 0 ? termInfo.marks : undefined}
                proofLines={stage === 2 && predicted && showLines}
                ink={ink}
              />
              {stage === 0 ? (
                <div className={s.tag} aria-live="polite">
                  <span>{c.termCount(term + 1, lesson.terms.length)}</span>
                  <strong>
                    <MathText>{termInfo.term}</MathText>
                  </strong>
                  <p>
                    <MathText>{termInfo.meaning}</MathText>
                  </p>
                  {focus && (
                    <div className={s.actions}>
                      <button
                        disabled={term === 0}
                        type="button"
                        onClick={() => update({ term: term - 1 })}
                      >
                        {c.previousTag}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          termFinished ? step(1) : update({ term: term + 1 })
                        }
                      >
                        {termFinished ? c.investigateNext : c.nextTag}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={s.boardFoot}>
                  <span>
                    {predicted && stage === 2 ? c.revealedKey : c.givenKey}
                  </span>
                  {stage === 2 && predicted && proofLineHints[id] && (
                    <div className={s.shapeActions}>
                      <button
                        type="button"
                        aria-pressed={showLines}
                        onClick={() => setShowLines(!showLines)}
                      >
                        {showLines ? c.hideLines : c.showLines}
                      </button>
                      {showLines && (
                        <p>
                          <MathText>{proofLineHints[id]}</MathText>
                        </p>
                      )}
                    </div>
                  )}
                  {stage === 1 && (
                    <div className={s.shapeActions}>
                      {id === "r3" && (
                        <button
                          type="button"
                          onClick={() => update({ firstLine: shape })}
                        >
                          {firstLine ? c.replaceLine : c.keepLine}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          changeShape(anotherGuideShape(id, shape))
                        }
                      >
                        {c.anotherShape}
                      </button>
                      {focus && (
                        <button type="button" onClick={() => step(2)}>
                          {c.predictionNext}
                        </button>
                      )}
                    </div>
                  )}
                  {focus && stage === 2 && !predicted && (
                    <button
                      type="button"
                      onClick={() => {
                        setFocus(false);
                        requestAnimationFrame(() =>
                          lessonPanel.current
                            ?.querySelector<HTMLButtonElement>("[data-choice]")
                            ?.focus(),
                        );
                      }}
                    >
                      {c.answerPrediction}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={s.caseSheet}>
              <h4 tabIndex={-1} ref={caseHeading}>
                {stage === 3 ? c.compareReasons : c.writeProof}
              </h4>
              {stage === 3 && (
                <span>{c.casePosition(cursor + 1, history.length)}</span>
              )}
              <div className={s.given}>
                <b>{circleLessonCopy.given}</b>
                <p>
                  <MathText>{currentCase.given}</MathText>
                </p>
              </div>
              <div className={s.target}>
                <b>{c.target}</b>
                <p>
                  <MathText>{currentCase.target}</MathText>
                </p>
              </div>
              {stage === 4 && (
                <label className={s.scratch}>
                  {c.yourWorking}
                  <textarea
                    aria-label={c.yourWorking}
                    value={progress.note}
                    maxLength={1200}
                    rows={3}
                    placeholder={c.workingPlaceholder}
                    onChange={(event) => update({ note: event.target.value })}
                  />
                  <small>{c.draftHint}</small>
                </label>
              )}
            </div>
          )}
        </div>

        <section
          ref={lessonPanel}
          className={s.panel}
          aria-label={guideSteps[stage]}
        >
          {stage === 0 && (
            <>
              <h4>{c.words}</h4>
              <div className={s.termList}>
                {lesson.terms.map((item, index) => (
                  <button
                    type="button"
                    key={item.term}
                    aria-pressed={term === index}
                    onClick={() => update({ term: index })}
                  >
                    <MathText>{item.term}</MathText>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={s.primary}
                onClick={() =>
                  termFinished ? step(1) : update({ term: term + 1 })
                }
              >
                {termFinished ? c.investigateNext : c.nextTag}
              </button>
            </>
          )}
          {stage === 1 && (
            <>
              <div className={s.given}>
                <b>{circleLessonCopy.given}</b>
                <p>
                  <MathText>{reasonFlow[id].startingFact}</MathText>
                </p>
              </div>
              <p>
                <MathText>{lesson.investigate}</MathText>
              </p>
              <details className={s.readings}>
                <summary>{c.readings}</summary>
                <p>{c.readingHint}</p>
                <MeasurementList
                  label={c.readingLabel}
                  measurements={reasonMeasurements(id, shape)}
                />
              </details>
              <button
                type="button"
                className={s.primary}
                onClick={() => step(2)}
              >
                {c.predictionNext}
              </button>
            </>
          )}
          {stage === 2 && (
            <>
              <Choices
                question={lesson.prediction}
                prompt={lesson.prediction.question}
                selected={prediction}
                onAnswer={(next) => update({ prediction: next })}
              />
              {predicted && (
                <>
                  <div className={s.proof}>
                    <b>{c.therefore}</b>
                    <p>
                      <MathText>{reasonResultFact(id, shape)}</MathText>
                    </p>
                    <p>
                      <MathText>{lesson.explanation}</MathText>
                    </p>
                  </div>
                  <button
                    type="button"
                    className={s.primary}
                    onClick={() => step(3)}
                  >
                    {c.compareNext}
                  </button>
                </>
              )}
            </>
          )}
          {stage === 3 && (
            <>
              <Choices
                key={attempt.id + "-" + attempt.variant}
                question={transfer}
                prompt={c.whichReason}
                selected={answer}
                reasonOptions
                onAnswer={(next) =>
                  setProgress((previous) => answerGuideCase(previous, next))
                }
              />
              {attempt.firstError !== null && answer !== attempt.firstError && (
                <details className={s.readings}>
                  <summary>{c.firstAttempt}</summary>
                  <p>
                    <b>
                      <MathText>
                        {optionLabel(transfer.options[attempt.firstError])}
                      </MathText>
                    </b>
                  </p>
                  <p>
                    <MathText>{transfer.feedback[attempt.firstError]}</MathText>
                  </p>
                </details>
              )}
              <div className={s.actions}>
                <button
                  type="button"
                  disabled={cursor === 0}
                  onClick={() => changeCase("previous")}
                >
                  {c.previousCase}
                </button>
                <button type="button" onClick={() => changeCase("next")}>
                  {c.nextCase}
                </button>
                {attempt.firstError !== null && (
                  <button type="button" onClick={() => changeCase("similar")}>
                    {c.similarCase}
                  </button>
                )}
                {answer === transfer.answer && (
                  <button
                    type="button"
                    className={s.primary}
                    onClick={() => step(4)}
                  >
                    {c.writeNext}
                  </button>
                )}
              </div>
            </>
          )}
          {stage === 4 && (
            <>
              <Choices
                question={lesson.write}
                prompt={c.whichConclusion}
                selected={written}
                onAnswer={(next) => update({ written: next })}
              />
              <Choices
                question={proofReason}
                prompt={c.whichWrittenReason}
                reasonOptions
                selected={writtenReason}
                onAnswer={(next) => update({ writtenReason: next })}
              />
              {complete && (
                <div className={s.proof}>
                  <b>{c.model}</b>
                  <p>
                    ∵ <MathText>{lesson.write.given}</MathText>
                  </p>
                  <p>
                    ∴{" "}
                    <MathText>
                      {lesson.write.options[lesson.write.answer]}
                    </MathText>{" "}
                    (<ReasonLabel reason={reason} arrow={false} />)
                  </p>
                </div>
              )}
              <div className={s.actions}>
                {complete && (
                  <button type="button" className={s.primary} onClick={onRelay}>
                    {c.relay}
                  </button>
                )}
                {!confirmRestart && (
                  <button type="button" onClick={() => setConfirmRestart(true)}>
                    {c.restart}
                  </button>
                )}
              </div>
              {confirmRestart && (
                <div
                  className={s.resetPrompt}
                  role="group"
                  aria-label={c.restart}
                >
                  <p>{c.restartScope(reason.number)}</p>
                  <div className={s.actions}>
                    <button
                      type="button"
                      onClick={() => setConfirmRestart(false)}
                    >
                      {c.cancel}
                    </button>
                    <button type="button" onClick={restart}>
                      {c.confirmRestart}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {failed && <p role="status">{c.answersFailed}</p>}
        </section>
      </section>
    </>
  );
}
