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
import ReasonEvidencePanel from "./ReasonEvidencePanel";
import TwoBisectorsDiagram from "./TwoBisectorsDiagram";
import { proofLineHints } from "./ReasonProofLines";
import ReasonLabel from "./ReasonLabel";
import {
  normaliseReasonParameters,
  reasonMeasurements,
  type ReasonParameters,
} from "./reasonExploration";
import { reasonResultFact } from "./reasonFlow";
import {
  bisectorIntersection,
  theoremLessons,
  type GuidedReasonId,
} from "./theoremLessonData";
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
  const [hideConclusion, setHideConclusion] = useState(false);
  const [investigateBoth, setInvestigateBoth] = useState(true);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const caseHeading = useRef<HTMLHeadingElement>(null);
  const lessonPanel = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const lesson = theoremLessons[id];
  const reason = reasonById(id);
  const termInfo = lesson.terms[term];
  const attempt = history[cursor];
  const transfer = getGuideCase(attempt.id, attempt.variant);
  const proofReason = writtenReasonQuestion(id);
  const currentCase = stage === 3 ? transfer : lesson.write;
  const answer = attempt.selected;
  const exploringIntersection = id === "r3" && stage === 1 && investigateBoth;
  const comparingChords =
    exploringIntersection ||
    (id === "r3" && stage === 2 && !!progress.secondChordShown);
  const activeShape =
    id === "r3" ? (progress.exploredChords?.first ?? shape) : shape;
  const question = comparingChords ? bisectorIntersection : lesson.prediction;
  const selectedPrediction = comparingChords
    ? (progress.intersectionPrediction ?? null)
    : prediction;
  const predicted = selectedPrediction === question.answer;
  const reveal = stage === 2 && predicted && !hideConclusion;
  const complete =
    written === lesson.write.answer && writtenReason === proofReason.answer;
  function showBoardOnPhone() {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    requestAnimationFrame(() => {
      const node = board.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight / 3) {
        node.focus({ preventScroll: true });
        node.scrollIntoView({ block: "start" });
      }
    });
  }
  function chooseTerm(next: number) {
    update({ term: next });
    showBoardOnPhone();
  }
  const step = (next: number) => {
    if (next === 1) setInvestigateBoth(true);
    setHideConclusion(false);
    setShowLines(false);
    setConfirmRestart(false);
    if (next >= 2) setFocus(false);
    update(
      id === "r3" && stage === 1 && next === 2
        ? { stage: next, secondChordShown: investigateBoth }
        : { stage: next },
    );
    if (next === 0 || next === 1) showBoardOnPhone();
  };
  const changeShape = (next: ReasonParameters) =>
    update({
      shape: normaliseReasonParameters(id, next),
      exploredChords: undefined,
    });
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
    setInvestigateBoth(true);
    setHideConclusion(false);
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
        data-step={stage}
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

        <div
          ref={board}
          tabIndex={-1}
          className={s.board}
          role="region"
          aria-label={c.boardLabel}
        >
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
              <div className={s.boardCaption}>
                <h4 className={s.boardTitle}>
                  {stage === 0 ? (
                    <MathText>{termInfo.term}</MathText>
                  ) : stage === 1 ? (
                    <MathText>
                      {exploringIntersection
                        ? c.investigateCrossing
                        : lesson.investigate}
                    </MathText>
                  ) : comparingChords ? (
                    <MathText>
                      {predicted ? c.centreLocated : c.compareBisectors}
                    </MathText>
                  ) : predicted ? (
                    c.readMarks
                  ) : (
                    c.predict
                  )}
                </h4>
                {id === "r3" && (stage === 1 || stage === 2) && (
                  <button
                    type="button"
                    className={s.secondChordButton}
                    onClick={() => {
                      setShowLines(false);
                      setHideConclusion(false);
                      if (stage === 1) setInvestigateBoth(!investigateBoth);
                      else update({ secondChordShown: !comparingChords });
                    }}
                  >
                    {stage === 1
                      ? investigateBoth
                        ? c.investigateOne
                        : c.investigateBoth
                      : comparingChords
                        ? c.showOneChord
                        : c.addSecondChord}
                  </button>
                )}
              </div>
              {stage === 0 && (
                <p className={s.wordCue} aria-live="polite">
                  <MathText>{termInfo.meaning}</MathText>
                </p>
              )}
              {comparingChords ? (
                <TwoBisectorsDiagram
                  first={activeShape}
                  other={progress.exploredChords?.second ?? firstLine}
                  reveal={exploringIntersection || reveal}
                  ink={ink}
                  onMove={(first, second) =>
                    update({ exploredChords: { first, second } })
                  }
                />
              ) : (
                <ReasonFlowDiagram
                  reasonId={id}
                  reveal={reveal}
                  parameters={activeShape}
                  onChange={stage > 0 ? changeShape : undefined}
                  focusMarks={stage === 0 ? termInfo.marks : undefined}
                  focusLabel={stage === 0 ? termInfo.term : undefined}
                  proofLines={reveal && showLines}
                  ink={ink}
                />
              )}
              {stage === 0 ? (
                <div className={s.tag} aria-live="polite">
                  <span>{c.termCount(term + 1, lesson.terms.length)}</span>
                  {focus && (
                    <div className={s.actions}>
                      <button
                        disabled={term === 0}
                        type="button"
                        onClick={() => chooseTerm(term - 1)}
                      >
                        {c.previousTag}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          termFinished ? step(1) : chooseTerm(term + 1)
                        }
                      >
                        {termFinished ? c.investigateNext : c.nextTag}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                (!comparingChords || focus || (stage === 2 && predicted)) && (
                  <div className={s.boardFoot}>
                    {!comparingChords && (
                      <span>{reveal ? c.revealedKey : c.givenKey}</span>
                    )}
                    {stage === 2 && predicted && (
                      <div className={s.shapeActions}>
                        <button
                          type="button"
                          aria-pressed={reveal}
                          onClick={() => {
                            setHideConclusion(!hideConclusion);
                            setShowLines(false);
                          }}
                        >
                          {reveal
                            ? c.hideConclusionMarks
                            : c.showConclusionMarks}
                        </button>
                      </div>
                    )}
                    {reveal && !comparingChords && proofLineHints[id] && (
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
                        {!exploringIntersection && (
                          <button
                            type="button"
                            onClick={() =>
                              changeShape(anotherGuideShape(id, activeShape))
                            }
                          >
                            {c.anotherShape}
                          </button>
                        )}
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
                              ?.querySelector<HTMLButtonElement>(
                                "[data-choice]",
                              )
                              ?.focus(),
                          );
                        }}
                      >
                        {c.answerPrediction}
                      </button>
                    )}
                  </div>
                )
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
          {(stage === 1 || stage === 2) && (
            <ReasonEvidencePanel
              reasonId={id}
              parameters={activeShape}
              revealed={exploringIntersection || reveal}
              given={comparingChords ? c.intersectionGivens : undefined}
              conclusion={comparingChords ? c.centreLocated : reasonResultFact(id, activeShape)}
              hint={comparingChords ? c.intersectionReason : undefined}
            />
          )}
          {stage === 0 && (
            <>
              <h4>{c.words}</h4>
              <div className={s.termList}>
                {lesson.terms.map((item, index) => (
                  <button
                    type="button"
                    key={item.term}
                    aria-pressed={term === index}
                    onClick={() => chooseTerm(index)}
                  >
                    <MathText>{item.term}</MathText>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={s.primary}
                onClick={() => (termFinished ? step(1) : chooseTerm(term + 1))}
              >
                {termFinished ? c.investigateNext : c.nextTag}
              </button>
            </>
          )}
          {stage === 1 && (
            <>
              {!exploringIntersection && (
                <details className={s.readings}>
                  <summary>{c.readings}</summary>
                  <p>{c.readingHint}</p>
                  <MeasurementList
                    label={c.readingLabel}
                    measurements={reasonMeasurements(id, activeShape)}
                  />
                </details>
              )}
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
                key={comparingChords ? "two-chord" : "one-case"}
                question={question}
                prompt={question.question}
                selected={selectedPrediction}
                onAnswer={(next) =>
                  update(
                    comparingChords
                      ? { intersectionPrediction: next }
                      : { prediction: next },
                  )
                }
              />
              {predicted && (
                <>
                  {reveal && !comparingChords && (
                    <details className={s.readings}>
                      <summary>{c.whyItWorks}</summary>
                      <p>
                        <MathText>{lesson.explanation}</MathText>
                      </p>
                    </details>
                  )}
                  <button
                    type="button"
                    className={s.diagramJump}
                    onClick={() => {
                      setHideConclusion(false);
                      board.current?.focus({ preventScroll: true });
                      board.current?.scrollIntoView({ block: "start" });
                    }}
                  >
                    {comparingChords ? c.findIntersection : c.seeConclusion}
                  </button>
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
