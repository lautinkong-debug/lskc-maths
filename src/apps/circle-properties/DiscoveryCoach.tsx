"use client";

import { circleCopy as c } from "@/lib/copy";
import { labs, type LabId } from "./content";
import type { Parameters } from "./geometry";
import { evaluateMission, missions } from "./missions";
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

/**
 * The task panel for every topic: one status line, a clear result when the
 * task is done, then optional extras under "More to try". Stars are recorded
 * by the playground as soon as a shape meets its task.
 */
export default function DiscoveryCoach({
  labId,
  parameters,
  onChange,
  missionIndex,
  onMissionChange,
  collected,
  recordedShape,
  onShowRecordedShape,
  onPractice,
  onCondition,
  conditionPrompt = "What changes if a condition is removed?",
  onExplain,
}: {
  labId: LabId;
  parameters: Parameters;
  onChange: (next: Parameters) => void;
  missionIndex: number;
  onMissionChange: (index: number) => void;
  collected: string[];
  recordedShape?: Parameters;
  onShowRecordedShape: () => void;
  onPractice: () => void;
  onCondition?: () => void;
  conditionPrompt?: string;
  onExplain?: () => void;
}) {
  const [session, setSession, storageFailed] = useLocalSession(
    `discovery-${labId}`,
    emptyDiscoverySession,
    parseDiscoverySession,
  );
  const lab = labs.find((item) => item.id === labId)!;
  const taskList = missions[labId];
  const mission = taskList[missionIndex];
  const result = evaluateMission(mission, parameters);
  const earned = collected.includes(mission.id) || !!recordedShape;
  const last = missionIndex === taskList.length - 1;
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
  const feedback = check.revealed ? card.explanation : evaluation?.feedback;
  const [firstFeedback = "", ...moreFeedback] =
    feedback?.match(/\S[\s\S]*?(?:[.!?](?=\s)|$)/g) ?? [];
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
  function setLevel(level: ChallengeLevel) {
    setSession((previous) => ({ ...previous, level }));
  }
  return (
    <div className={s.coach}>
      <div className={s.steps} role="group" aria-label={c.chooseTask}>
        {taskList.map((item, i) => (
          <button
            type="button"
            key={item.id}
            aria-label={c.taskChoice(i + 1, item.title)}
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
      {result.complete ? (
        <div className={s.done} role="status">
          <strong>{c.taskDone}</strong>
          <p>
            {c.youFound} <MathText>{lab.discovery}</MathText>
          </p>
          {onExplain && (
            <button type="button" className={s.diagramLink} onClick={onExplain}>
              {c.highlight}
            </button>
          )}
        </div>
      ) : (
        <p className={s.status} role="status">
          {earned ? c.earnedBefore : c.keepDragging}
        </p>
      )}
      {(result.complete || earned) && (
        <button
          type="button"
          className={s.primary}
          onClick={() => onMissionChange(last ? 0 : missionIndex + 1)}
        >
          {last ? c.firstTask : c.nextTask}
        </button>
      )}
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
            ? c.hint
            : hintLevel < hints.length
              ? c.anotherHint
              : c.allHints}
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
            {c.hideHints}
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
      <details className={s.moreOptions}>
        <summary>{c.moreToTry}</summary>
        <div className={s.extraContent}>
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
            {c.predict}
            <span aria-hidden="true">{open ? "−" : "+"}</span>
          </button>
          {open && (
            <section className={s.check} aria-label={c.predict}>
              <div
                className={s.levels}
                role="group"
                aria-label={c.predictCheck.levelsLabel}
              >
                {(["support", "core", "stretch"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    aria-pressed={session.level === level}
                    onClick={() => setLevel(level)}
                  >
                    {c.predictCheck.levels[level]}
                  </button>
                ))}
              </div>
              <p className={s.kind}>{c.predictCheck.kind(card.kind)}</p>
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
                    {c.predictCheck.yourPrediction(card.unit)}
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
                        updateCheck({
                          draft: event.target.value,
                          checked: false,
                        })
                      }
                    />
                    <button type="submit">{c.predictCheck.check}</button>
                  </div>
                </form>
              )}
              <details className={s.checkHint}>
                <summary>{c.predictCheck.hint}</summary>
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
                      ? c.predictCheck.viewed
                      : evaluation?.correct
                        ? c.predictCheck.supported
                        : c.predictCheck.notYet}
                  </strong>
                  <p>
                    <MathText>{firstFeedback}</MathText>
                  </p>
                  {moreFeedback.length > 0 && (
                    <details className={s.feedbackDetails}>
                      <summary>{c.predictCheck.why}</summary>
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
                    {c.predictCheck.reveal}
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
                    {c.predictCheck.tryCase}
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
                    {c.predictCheck.again}
                  </button>
                )}
              </div>
              {check.tried && (
                <p className={s.precision}>{c.predictCheck.tried}</p>
              )}
            </section>
          )}
          {onCondition && (
            <button type="button" className={s.related} onClick={onCondition}>
              <MathText>{conditionPrompt}</MathText>
            </button>
          )}
          <button type="button" className={s.related} onClick={onPractice}>
            {c.practiseReason}
          </button>
          {recordedShape && (
            <button
              type="button"
              className={s.recall}
              onClick={onShowRecordedShape}
            >
              {c.showSaved}
            </button>
          )}
          <details className={s.precisionDetails}>
            <summary>{c.aboutMeasurements}</summary>
            <p className={s.precision}>{c.measurementNote}</p>
          </details>
        </div>
      </details>
      {storageFailed && <p role="status">{c.predictCheck.storageFailed}</p>}
    </div>
  );
}
