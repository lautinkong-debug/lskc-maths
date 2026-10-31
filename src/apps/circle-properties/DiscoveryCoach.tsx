"use client";

import type { LabId } from "./content";
import type { Parameters } from "./geometry";
import { evaluateMission, missions } from "./missions";
import { samePlaygroundShape } from "./session";
import {
  checkDiscovery,
  discoveryChallenge,
  emptyDiscoverySession,
  missionHints,
  parseDiscoverySession,
  type ChallengeLevel,
  type DiscoveryCheckState,
} from "./discovery";
import { useLocalSession } from "./useLocalSession";
import s from "./discovery.module.css";
import MathText from "./MathText";

export default function DiscoveryCoach({
  labId,
  parameters,
  onChange,
  missionIndex,
  onMissionChange,
  collected,
  recordedShape,
  onComplete,
  onShowRecordedShape,
  onPractice,
  onCondition,
  conditionPrompt = "What changes if a condition is removed?",
  onExplain,
  simple = false,
}: {
  labId: LabId;
  parameters: Parameters;
  onChange: (next: Parameters) => void;
  missionIndex: number;
  onMissionChange: (index: number) => void;
  collected: string[];
  recordedShape?: Parameters;
  onComplete: (id: string) => void;
  onShowRecordedShape: () => void;
  onPractice: () => void;
  onCondition?: () => void;
  conditionPrompt?: string;
  onExplain?: () => void;
  simple?: boolean;
}) {
  const [session, setSession, storageFailed] = useLocalSession(
    `discovery-${labId}`,
    emptyDiscoverySession,
    parseDiscoverySession,
  );
  const mission = missions[labId][missionIndex];
  const result = evaluateMission(mission, parameters);
  const earned = collected.includes(mission.id) || !!recordedShape;
  const showingRecording =
    !!recordedShape && samePlaygroundShape(labId, parameters, recordedShape);
  let recordingHint = result.complete
    ? "Target reached. Record this shape to reopen it later."
    : "Move a ringed point to meet the task.";
  if (recordedShape) {
    recordingHint = showingRecording
      ? `The board shows your saved circle for Task ${missionIndex + 1}. You can keep dragging.`
      : `You can return to the circle you saved for Task ${missionIndex + 1}.`;
  } else if (earned) {
    recordingHint = result.complete
      ? "This task already has a star. Record this shape to save its point positions."
      : "Your earlier star has no saved diagram. Match the task to record a circle.";
  }
  const hints = missionHints(mission);
  const hintLevel = session.hints[mission.id] ?? 0;
  const card = discoveryChallenge(labId, session.level, missionIndex);
  const check = session.checks[card.id] ?? {
    draft: "",
    checked: false,
    revealed: false,
  };
  const evaluation = check.checked
    ? checkDiscovery(card, check.draft)
    : undefined;
  const open = session.open[mission.id] ?? false;
  const readyForCondition =
    result.complete || earned || check.checked || check.revealed;
  const feedback = check.revealed ? card.explanation : evaluation?.feedback;
  const [firstFeedback = "", ...moreFeedback] =
    feedback?.split(/(?<=[.!?])\s+/) ?? [];
  function updateCheck(patch: Partial<DiscoveryCheckState>) {
    setSession((previous) => ({
      ...previous,
      checks: {
        ...previous.checks,
        [card.id]: {
          ...(previous.checks[card.id] ?? {
            draft: "",
            checked: false,
            revealed: false,
          }),
          ...patch,
        },
      },
    }));
  }
  function capture() {
    if (!result.complete) return;
    onComplete(mission.id);
    setSession((previous) => ({
      ...previous,
      open: { ...previous.open, [mission.id]: true },
    }));
  }
  function setLevel(level: ChallengeLevel) {
    setSession((previous) => ({ ...previous, level }));
  }
  const taskChoices = (
    <div className={s.steps} aria-label="Choose mission">
      {missions[labId].map((item, i) => (
        <button
          type="button"
          key={item.id}
          aria-label={`Mission ${i + 1}: ${item.title}`}
          aria-current={i === missionIndex ? "step" : undefined}
          onClick={() => onMissionChange(i)}
        >
          <span aria-hidden="true">
            {collected.includes(item.id) ? "★" : "☆"}
          </span>{" "}
          {i + 1}
        </button>
      ))}
    </div>
  );
  const extraTools = (
    <div className={s.extraContent}>
      {simple && taskChoices}
      {onCondition && !readyForCondition && (
        <button type="button" className={s.related} onClick={onCondition}>
          <MathText>{conditionPrompt}</MathText>
        </button>
      )}
      <details className={s.precisionDetails}>
        <summary>About the measurements</summary>
        <p className={s.precision}>
          Drag targets allow about 0.6° or 0.08 cm of error (ratio targets:
          0.015). Recording a shape does not prove a theorem.
        </p>
      </details>
      {earned && !simple && (
        <button
          type="button"
          className={s.next}
          onClick={() => onMissionChange((missionIndex + 1) % 3)}
        >
          {missionIndex === 2 ? "Revisit a task" : "Next task"}
        </button>
      )}
      {(!open || (!check.checked && !check.revealed)) && (
        <button type="button" className={s.related} onClick={onPractice}>
          Practise this reason
        </button>
      )}
    </div>
  );
  return (
    <div className={s.coach} data-simple={simple}>
      {!recordedShape ? (
        <button
          type="button"
          className={s.primary}
          disabled={!result.complete}
          onClick={capture}
        >
          Record this shape
        </button>
      ) : (
        <p className={s.recorded} role="status">
          {showingRecording ? "✓ Shape recorded" : "Recorded earlier"}
        </p>
      )}
      <p className={s.status} data-ready={result.complete} role="status">
        {recordingHint}
      </p>
      {recordedShape && (
        <button
          type="button"
          className={s.recall}
          onClick={onShowRecordedShape}
        >
          Show recorded circle
        </button>
      )}
      {result.complete && onExplain && (
        <button type="button" className={s.diagramLink} onClick={onExplain}>
          Highlight this property
        </button>
      )}
      {!simple && taskChoices}
      <div className={s.hintControls}>
        <button
          type="button"
          disabled={hintLevel >= hints.length}
          onClick={() =>
            setSession((previous) => ({
              ...previous,
              hints: {
                ...previous.hints,
                [mission.id]: Math.min(hints.length, hintLevel + 1),
              },
            }))
          }
        >
          {hintLevel === 0
            ? "A small hint"
            : hintLevel < hints.length
              ? "Another hint"
              : "All hints shown"}
        </button>
        {hintLevel > 0 && (
          <button
            type="button"
            onClick={() =>
              setSession((previous) => ({
                ...previous,
                hints: { ...previous.hints, [mission.id]: 0 },
              }))
            }
          >
            Hide hints
          </button>
        )}
      </div>
      {hintLevel > 0 && (
        <ol className={s.hints}>
          {hints.slice(0, hintLevel).map((hint) => (
            <li key={hint}>
              <MathText>{hint}</MathText>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        className={s.openCheck}
        data-recommended={earned}
        aria-expanded={open}
        onClick={() =>
          setSession((previous) => ({
            ...previous,
            open: { ...previous.open, [mission.id]: !open },
          }))
        }
      >
        {open ? "New-case challenge" : "Predict a new case"}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <section className={s.check} aria-label="Predict a new case">
          <div className={s.levels} aria-label="Choose challenge support">
            {(["support", "core", "stretch"] as const).map((level) => (
              <button
                type="button"
                key={level}
                aria-pressed={session.level === level}
                onClick={() => setLevel(level)}
              >
                {level === "support"
                  ? "Support"
                  : level === "core"
                    ? "Core"
                    : "Stretch"}
              </button>
            ))}
          </div>
          <p className={s.kind}>{card.kind} · a different case</p>
          <p className={s.prompt}>
            <MathText>{card.prompt}</MathText>
          </p>
          {card.choices ? (
            <div className={s.choices}>
              {card.choices.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={check.draft === option.id}
                  onClick={() =>
                    updateCheck({ draft: option.id, checked: true })
                  }
                >
                  <MathText>{option.label}</MathText>
                </button>
              ))}
            </div>
          ) : (
            <form
              className={s.answer}
              onSubmit={(event) => {
                event.preventDefault();
                updateCheck({ checked: true });
              }}
            >
              <label htmlFor={`discovery-${card.id}`}>
                Your prediction {card.unit ? `(${card.unit})` : "(ratio)"}
              </label>
              <div>
                <input
                  id={`discovery-${card.id}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={check.draft}
                  maxLength={48}
                  onChange={(event) =>
                    updateCheck({ draft: event.target.value, checked: false })
                  }
                />
                <button type="submit">Check prediction</button>
              </div>
            </form>
          )}
          <details className={s.checkHint}>
            <summary>Hint for this new case</summary>
            <p>
              <MathText>{card.hint}</MathText>
            </p>
          </details>
          {(evaluation || check.revealed) && (
            <div
              className={s.response}
              data-correct={evaluation?.correct === true && !check.revealed}
              role="status"
            >
              <strong>
                {check.revealed
                  ? "Answer viewed"
                  : evaluation?.correct
                    ? "Prediction supported"
                    : "Check this condition"}
              </strong>
              <p>
                <MathText>{firstFeedback}</MathText>
              </p>
              {moreFeedback.length > 0 && (
                <details className={s.feedbackDetails}>
                  <summary>Why?</summary>
                  <p>
                    <MathText>{moreFeedback.join(" ")}</MathText>
                  </p>
                </details>
              )}
            </div>
          )}
          <div className={s.followActions}>
            {!check.revealed && !evaluation?.correct && (
              <button
                type="button"
                onClick={() => updateCheck({ revealed: true })}
              >
                Show the reasoning
              </button>
            )}
            {card.experiment && (check.checked || check.revealed) && (
              <button
                type="button"
                onClick={() => {
                  onChange(card.experiment!);
                  updateCheck({ tried: true });
                  onExplain?.();
                }}
              >
                Try this case on the circle
              </button>
            )}
            {(check.checked || check.revealed) && (
              <button
                type="button"
                onClick={() =>
                  updateCheck({
                    draft: "",
                    checked: false,
                    revealed: false,
                    tried: false,
                  })
                }
              >
                Try prediction again
              </button>
            )}
          </div>
          {check.tried && (
            <p className={s.precision}>
              The board now shows the new case. Move its points to test your
              prediction further; the operation mission above is unchanged.
            </p>
          )}
          {(check.checked || check.revealed) && (
            <button type="button" className={s.related} onClick={onPractice}>
              Practise this reason
            </button>
          )}
        </section>
      )}
      {onCondition && readyForCondition && (
        <div className={s.conditionEntry}>
          <span>Test a condition</span>
          <button type="button" onClick={onCondition}>
            <MathText>{conditionPrompt}</MathText>
          </button>
        </div>
      )}
      {simple && earned && (
        <button
          type="button"
          className={s.next}
          onClick={() => onMissionChange((missionIndex + 1) % 3)}
        >
          {missionIndex === 2 ? "Revisit a task" : "Next task"}
        </button>
      )}
      {simple ? (
        <details className={s.moreOptions}>
          <summary>More options</summary>
          {extraTools}
        </details>
      ) : (
        extraTools
      )}
      {storageFailed && (
        <p role="status">
          This browser could not save the current prediction. You can continue
          exploring.
        </p>
      )}
    </div>
  );
}
