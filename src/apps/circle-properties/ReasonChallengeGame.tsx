"use client";

import { useEffect, useRef, useState } from "react";
import { circleReasonGameCopy as c } from "@/lib/copy";
import { type LabId, reasons } from "./content";
import { CheckDiagram } from "./TransferCheck";
import MathText from "./MathText";
import { useLocalSession } from "./useLocalSession";
import {
  challengeGroups,
  challengeGroup,
  getReasonChallenge,
  gradeReasonChallenge,
  shuffleChallengeChoices,
} from "./reasonChallenge";
import {
  initialChallengeSession,
  newChallengeDraft,
  parseChallengeSession,
  updateChallengeChain,
  challengeSpeedBonus,
  archiveChallengeRun,
  challengeVariant,
  startChallengeSet,
  similarChallengeQuestion,
  viewChallengeSet,
  type ChallengeResponse,
  type ChallengeSession,
} from "./reasonChallengeSession";
import s from "./reason-challenge.module.css";

const labelFor = (id: string) => reasons.find((r) => r.id === id)?.label ?? id;

function LockIcon({ unlocked }: { unlocked: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path
        d={unlocked ? "M9 10V6a4 4 0 0 1 8 0" : "M8 10V6a4 4 0 0 1 8 0v4"}
      />
      <path d="M12 14v3" />
    </svg>
  );
}

export default function ReasonChallenge({
  onExplore,
}: {
  onExplore: (lab: LabId) => void;
}) {
  const [state, setState, saveFailed] = useLocalSession(
    "reason-challenge-v1",
    initialChallengeSession,
    parseChallengeSession,
  );
  const [now, setNow] = useState(() => Date.now());
  const [hint, setHint] = useState("");
  const [confirmRecord, setConfirmRecord] = useState<"reset" | "delete" | null>(
    null,
  );
  const top = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const review = state.reviewSet !== null;
  const view = viewChallengeSet(state);
  const reasonId = view.queue[view.index];
  const challenge = reasonId
    ? getReasonChallenge(reasonId, challengeVariant(view))
    : null;
  const draft = reasonId
    ? (view.drafts[reasonId] ?? (review ? newChallengeDraft(0, 0) : undefined))
    : undefined;
  const activeDraft = state.drafts[state.queue[state.index]];
  const grade =
    challenge && draft?.checked
      ? gradeReasonChallenge(challenge, draft.response)
      : null;
  const reasoningValid =
    !!grade && grade.condition && grade.target && grade.reason;
  const group = challengeGroup(view.group);
  const solved = view.queue.filter((id) => view.drafts[id]?.complete).length;
  const score = Object.values(view.drafts).reduce(
    (total, d) => total + d.bestScore,
    0,
  );
  const remaining = draft?.deadline
    ? Math.max(0, Math.ceil((draft.deadline - now) / 1000))
    : 0;
  const locked =
    review || (!!draft && (draft.complete || draft.checked || draft.expired));
  const allAnswered =
    !!draft && Object.values(draft.response).every((v) => v.trim().length > 0);
  const finished = !review && state.started && solved === state.queue.length;

  useEffect(() => {
    if (
      !state.started ||
      !activeDraft?.deadline ||
      activeDraft.complete ||
      activeDraft.expired
    )
      return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      setState((previous) => {
        const id = previous.queue[previous.index],
          current = previous.drafts[id];
        if (
          !current ||
          current.complete ||
          current.expired ||
          !current.deadline ||
          time < current.deadline
        )
          return previous;
        return {
          ...previous,
          streak: 0,
          drafts: { ...previous.drafts, [id]: { ...current, expired: true } },
        };
      });
    };
    const timer = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // The setter accepts a functional update against the latest saved session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.started,
    state.index,
    activeDraft?.deadline,
    activeDraft?.complete,
    activeDraft?.expired,
  ]);

  function scrollTop() {
    requestAnimationFrame(() =>
      top.current?.scrollIntoView({ block: "start", behavior: "auto" }),
    );
  }
  function start() {
    // Called only from button events to start a real-time deadline.
    // eslint-disable-next-line react-hooks/purity
    const time = Date.now();
    setNow(time);
    setHint("");
    setState((previous) =>
      startChallengeSet(previous, time, view.group, view.seconds),
    );
    scrollTop();
  }
  function navigate(index: number) {
    // Called only from navigation events, never while rendering.
    // eslint-disable-next-line react-hooks/purity
    const time = Date.now();
    setNow(time);
    setHint("");
    setState((previous) => {
      if (previous.reviewSet !== null) {
        const archived = viewChallengeSet(previous);
        return archived.queue[index]
          ? { ...previous, reviewIndex: index }
          : previous;
      }
      const id = previous.queue[index];
      if (!id) return previous;
      return {
        ...previous,
        index,
        drafts: {
          ...previous.drafts,
          [id]:
            previous.drafts[id] ?? newChallengeDraft(previous.seconds, time),
        },
      };
    });
    scrollTop();
  }
  function trySimilar() {
    // This handler creates a new deadline only after a student clicks the button.
    // eslint-disable-next-line react-hooks/purity
    const time = Date.now();
    setNow(time);
    setHint(c.similarReady);
    setState((previous) => similarChallengeQuestion(previous, time));
    scrollTop();
  }
  function respond(key: keyof ChallengeResponse, value: string) {
    setHint("");
    setState((previous) => {
      if (previous.reviewSet !== null) return previous;
      if (previous.queue[previous.index] !== reasonId) return previous;
      const current = previous.drafts[reasonId];
      if (!current || current.checked || current.complete || current.expired)
        return previous;
      if (current.deadline && Date.now() >= current.deadline)
        return {
          ...previous,
          streak: 0,
          drafts: {
            ...previous.drafts,
            [reasonId]: { ...current, expired: true },
          },
        };
      return {
        ...previous,
        drafts: {
          ...previous.drafts,
          [reasonId]: {
            ...current,
            response: { ...current.response, [key]: value },
          },
        },
      };
    });
  }
  function submit() {
    if (!challenge) return;
    setState((previous) => {
      if (previous.reviewSet !== null) return previous;
      if (previous.queue[previous.index] !== reasonId) return previous;
      const current = previous.drafts[reasonId];
      if (
        !current ||
        current.checked ||
        current.complete ||
        current.expired ||
        !Object.values(current.response).every((v) => v.trim())
      )
        return previous;
      const time = Date.now();
      if (current.deadline && time >= current.deadline)
        return {
          ...previous,
          streak: 0,
          drafts: {
            ...previous.drafts,
            [reasonId]: { ...current, expired: true },
          },
        };
      const currentChallenge = getReasonChallenge(
        reasonId,
        challengeVariant(previous),
      );
      const result = gradeReasonChallenge(currentChallenge, current.response);
      const bonus = challengeSpeedBonus(
        current,
        previous.seconds,
        result.correct,
        time,
      );
      const updated = {
        ...current,
        checked: true,
        complete: result.correct,
        tries: Math.min(999, current.tries + 1),
        bestScore: Math.max(current.bestScore, result.score + bonus),
      };
      const drafts = { ...previous.drafts, [reasonId]: updated };
      const runScore = Object.values(drafts).reduce(
        (sum, d) => sum + d.bestScore,
        0,
      );
      const runSolved = previous.queue.filter(
        (id) => drafts[id]?.complete,
      ).length;
      const old = previous.best[previous.group];
      return {
        ...previous,
        ...updateChallengeChain(previous, reasonId, time),
        drafts,
        best: {
          ...previous.best,
          [previous.group]: {
            score: Math.max(old?.score ?? 0, runScore),
            solved: Math.max(old?.solved ?? 0, runSolved),
          },
        },
      };
    });
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }),
    );
  }
  function retry(practice = false) {
    const time = Date.now();
    setNow(time);
    setHint("");
    setState((previous) => {
      if (previous.reviewSet !== null) return previous;
      if (previous.queue[previous.index] !== reasonId) return previous;
      const current = previous.drafts[reasonId];
      if (!current || current.complete) return previous;
      return {
        ...previous,
        drafts: {
          ...previous.drafts,
          [reasonId]: {
            ...current,
            checked: false,
            expired: false,
            helped: current.helped || practice || current.expired,
            deadline: practice
              ? null
              : current.expired && previous.seconds
                ? time + previous.seconds * 1000
                : current.deadline,
          },
        },
      };
    });
  }
  function useHint() {
    if (!challenge || !draft || locked) return;
    setHint(c.hint);
    setState((previous) => {
      if (previous.reviewSet !== null) return previous;
      const current = previous.drafts[reasonId];
      if (
        previous.queue[previous.index] !== reasonId ||
        !current ||
        current.checked ||
        current.complete ||
        current.expired
      )
        return previous;
      return {
        ...previous,
        drafts: {
          ...previous.drafts,
          [reasonId]: { ...current, helped: true },
        },
      };
    });
  }
  function choices(key: "condition" | "target" | "reason", values: string[]) {
    if (!draft) return null;
    const correctChoice =
      key === "condition"
        ? challenge?.q.condition
        : key === "target"
          ? challenge?.target
          : challenge?.q.reasonId;
    return (
      <div
        className={key === "reason" ? `${s.choices} ${s.skillHand}` : s.choices}
        role="group"
        aria-label={
          key === "condition"
            ? c.conditionChoices
            : key === "target"
              ? c.targetChoices
              : c.reasonChoices
        }
      >
        {shuffleChallengeChoices(
          values,
          view.seed + view.index * 37 + key.length,
        ).map((value) => (
          <button
            type="button"
            key={value}
            className={key === "reason" ? s.skillCard : undefined}
            aria-label={key === "reason" ? labelFor(value) : undefined}
            data-choice={value}
            data-correct-choice={review ? value === correctChoice : undefined}
            aria-pressed={draft.response[key] === value}
            disabled={locked}
            onClick={() => respond(key, value)}
          >
            <span className={s.radio} aria-hidden="true">
              {draft.response[key] === value ? "●" : "○"}
            </span>
            {key === "reason" ? (
              <span className={s.skillBody}>
                <small>{c.reasonCard}</small>
                <span className={s.choiceText}>
                  <MathText>{labelFor(value)}</MathText>
                </span>
                {review && (
                  <small className={s.reviewChoice}>
                    {[
                      draft.response[key] === value && c.savedChoice,
                      value === correctChoice && c.correctChoice,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                )}
              </span>
            ) : (
              <span className={s.choiceText}>
                <MathText>{value}</MathText>
                {review && (
                  <small className={s.reviewChoice}>
                    {[
                      draft.response[key] === value && c.savedChoice,
                      value === correctChoice && c.correctChoice,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className={s.game} aria-label={c.region} ref={top}>
      <header className={s.header}>
        <div>
          <span className={s.kicker}>{c.kicker}</span>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
        </div>
        <div className={s.score}>
          <strong>{score}</strong>
          <span>{c.levelPoints}</span>
        </div>
      </header>
      <div
        className={s.chainBadge}
        title={c.chainHelp}
        aria-label={c.perfectChain}
      >
        <span aria-hidden="true">✦</span>
        <strong>{c.chainCount(view.streak)}</strong>
        <span>{c.bestChain(state.bestStreak)}</span>
      </div>
      {saveFailed && (
        <p className={s.notice} role="status">
          {c.saveFailed}
        </p>
      )}
      {(state.queue.length > 0 || state.archive.length > 0) && (
        <div className={s.setToolbar}>
          <label>
            <span>{c.viewSet}</span>
            <select
              aria-label={c.viewSet}
              value={review || state.queue.length ? view.setNumber : ""}
              onChange={(event) => {
                const number = Number(event.target.value);
                setHint("");
                setState((previous) => ({
                  ...previous,
                  reviewSet: number === previous.setNumber ? null : number,
                  reviewIndex: 0,
                }));
                scrollTop();
              }}
            >
              {!state.queue.length && (
                <option value="" disabled>
                  {c.selectOldSet}
                </option>
              )}
              {state.queue.length > 0 && (
                <option value={state.setNumber}>
                  {c.currentSet(
                    state.setNumber,
                    challengeGroup(state.group).title,
                  )}
                </option>
              )}
              {[...state.archive].reverse().map((run) => (
                <option key={run.setNumber} value={run.setNumber}>
                  {c.savedSet(run.setNumber, challengeGroup(run.group).title)}
                </option>
              ))}
            </select>
          </label>
          {(review || state.started) && (
            <button type="button" className={s.primary} onClick={() => start()}>
              {c.newSetSameLevel}
            </button>
          )}
        </div>
      )}
      {review && (
        <div className={s.reviewBanner}>
          <span>{c.reviewingSet(view.setNumber)}</span>
          <button
            type="button"
            onClick={() => {
              setHint("");
              setState((previous) => ({
                ...previous,
                reviewSet: null,
                started: previous.queue.length > 0,
              }));
              scrollTop();
            }}
          >
            {state.queue.length ? c.backToSet : c.levels}
          </button>
        </div>
      )}
      <div className={s.recordTools}>
        <button type="button" onClick={() => setConfirmRecord("reset")}>
          {c.resetRecord}
        </button>
        {review && (
          <button type="button" onClick={() => setConfirmRecord("delete")}>
            {c.deleteSet}
          </button>
        )}
        {confirmRecord && (
          <div
            className={s.reviewBanner}
            role="group"
            aria-label={c.manageRecord}
          >
            <p>
              {confirmRecord === "reset"
                ? c.resetPrompt
                : c.deletePrompt(view.setNumber)}
            </p>
            <button
              type="button"
              onClick={() => {
                setState((previous) =>
                  confirmRecord === "reset"
                    ? {
                        ...initialChallengeSession,
                        group: previous.group,
                        seconds: previous.seconds,
                      }
                    : {
                        ...previous,
                        archive: previous.archive.filter(
                          (run) => run.setNumber !== previous.reviewSet,
                        ),
                        reviewSet: null,
                        reviewIndex: 0,
                      },
                );
                setConfirmRecord(null);
                setHint("");
                scrollTop();
              }}
            >
              {confirmRecord === "reset" ? c.confirmReset : c.confirmDelete}
            </button>
            <button type="button" onClick={() => setConfirmRecord(null)}>
              {c.keepRecord}
            </button>
          </div>
        )}
      </div>
      {(!state.started && !review) || !challenge || !draft ? (
        <>
          <div className={s.levels} role="group" aria-label={c.chooseLevel}>
            {challengeGroups.map((g, i) => (
              <button
                type="button"
                key={g.id}
                aria-pressed={state.group === g.id}
                onClick={() =>
                  setState((previous) =>
                    previous.group === g.id
                      ? previous
                      : {
                          ...archiveChallengeRun(previous),
                          group: g.id,
                        },
                  )
                }
              >
                <span className={s.levelNumber}>{i + 1}</span>
                <strong>{g.title}</strong>
                <span className={s.small}>
                  {c.reasonNumbers(
                    g.reasonIds.map(
                      (id) =>
                        reasons.find((reason) => reason.id === id)!.number,
                    ),
                  )}
                </span>
                <small>
                  {c.levelProgress(
                    g.reasonIds.length,
                    state.best[g.id]?.solved ?? 0,
                  )}
                </small>
              </button>
            ))}
          </div>
          <div className={s.setup}>
            <div>
              <h3>{group.title}</h3>
              <p>{c.setup}</p>
            </div>
            <label>
              {c.pace}
              <select
                aria-label={c.challengePace}
                value={state.seconds}
                onChange={(e) => {
                  const seconds = Number(
                    e.target.value,
                  ) as ChallengeSession["seconds"];
                  setState((previous) =>
                    previous.seconds === seconds
                      ? previous
                      : {
                          ...archiveChallengeRun(previous),
                          seconds,
                        },
                  );
                }}
              >
                <option value={0}>{c.practiceOption}</option>
                <option value={120}>{c.speed120}</option>
                <option value={90}>{c.speed90}</option>
                <option value={60}>{c.speed60}</option>
              </select>
            </label>
            <button type="button" className={s.primary} onClick={() => start()}>
              {c.start}
            </button>
            {state.queue.length > 0 &&
              state.drafts[state.queue[state.index]] && (
                <button
                  type="button"
                  onClick={() => {
                    setState((previous) => ({ ...previous, started: true }));
                    scrollTop();
                  }}
                >
                  {c.resume}
                </button>
              )}
          </div>
          <p className={s.guide}>{c.scoring}</p>
        </>
      ) : (
        <>
          <div className={s.roundBar}>
            <button
              type="button"
              onClick={() =>
                setState((previous) => ({
                  ...previous,
                  started: false,
                  reviewSet: null,
                }))
              }
            >
              {c.levels}
            </button>
            <strong>
              {c.runProgress(group.title, solved, view.queue.length)}
            </strong>
            <span
              className={s.timer}
              data-urgent={!review && !!draft.deadline && remaining <= 20}
            >
              {review
                ? c.reviewMode
                : draft.complete
                  ? c.solved
                  : draft.deadline
                    ? c.seconds(remaining)
                    : c.practice}
            </span>
          </div>
          <progress
            className={s.progress}
            value={solved}
            max={view.queue.length}
            aria-label={c.missionsSolved}
          />
          <nav className={s.navigation} aria-label={c.questionNavigation}>
            <button
              type="button"
              disabled={view.index === 0}
              onClick={() => navigate(view.index - 1)}
            >
              {c.previous}
            </button>
            <div>
              {view.queue.map((id, i) => (
                <button
                  type="button"
                  key={id}
                  aria-label={c.goToQuestion(i + 1)}
                  aria-current={i === view.index ? "step" : undefined}
                  data-solved={view.drafts[id]?.complete}
                  onClick={() => navigate(i)}
                >
                  {i + 1}
                  {view.drafts[id]?.complete ? " ✓" : ""}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={view.index === view.queue.length - 1}
              onClick={() => navigate(view.index + 1)}
            >
              {c.next}
            </button>
          </nav>
          {finished && (
            <div className={s.finish} role="status">
              <strong>{c.levelComplete}</strong>
              <span>{c.levelFinished(state.queue.length)}</span>
            </div>
          )}
          <div className={s.layout}>
            <div className={s.figure} data-question-id={challenge.q.id}>
              <span className={s.questionCount}>
                {c.mission(view.index + 1, view.queue.length)}
              </span>
              <h3>
                <MathText>{challenge.q.ask}</MathText>
              </h3>
              <div className={s.given}>
                <strong>{c.given}</strong>
                <p>
                  <MathText>{challenge.q.given}</MathText>
                </p>
              </div>
              <div
                className={s.reasonLock}
                role="region"
                aria-label={c.reasonLock}
                data-unlocked={reasoningValid}
              >
                <div>
                  <LockIcon unlocked={reasoningValid} />
                  <strong>
                    {reasoningValid ? c.conclusionUnlocked : c.reasonLock}
                  </strong>
                </div>
                {reasoningValid ? (
                  <p>
                    <MathText>{challenge.target}</MathText>
                  </p>
                ) : (
                  <p>{c.unlockInstruction}</p>
                )}
              </div>
              <CheckDiagram q={challenge.q} reviewed={reasoningValid} />
              <div className={s.figureTools}>
                <button
                  type="button"
                  onClick={() => onExplore(challenge.q.lab)}
                >
                  {c.explore}
                </button>
                <button type="button" onClick={useHint} disabled={locked}>
                  {c.smallHint}
                </button>
              </div>
              {hint && (
                <p role="status" className={s.notice}>
                  {hint}
                </p>
              )}
            </div>
            <div className={s.answerPanel}>
              <div className={s.gates} aria-label={c.answerProgress}>
                {(["value", "condition", "target", "reason"] as const).map(
                  (key) => (
                    <span
                      key={key}
                      data-ready={!!draft.response[key]}
                      data-correct={grade?.[key]}
                      aria-label={c.gateState(c.stepNames[key], !!grade?.[key])}
                    >
                      <LockIcon unlocked={!!grade?.[key]} />
                      <small>{c.stepNames[key]}</small>
                    </span>
                  ),
                )}
              </div>
              <fieldset className={s.step}>
                <legend>
                  <b>1</b> {c.findValue} <MathText>x</MathText>
                </legend>
                <label htmlFor="reason-challenge-value">
                  {c.myValue} <MathText>x</MathText>{" "}
                  {challenge.q.unit && `(${challenge.q.unit})`}
                </label>
                <input
                  id="reason-challenge-value"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.response.value}
                  disabled={locked}
                  onChange={(e) =>
                    respond("value", e.target.value.slice(0, 40))
                  }
                />
                {grade && (
                  <p className={s.fieldFeedback}>
                    {grade.value ? c.valueCorrect : c.valueRetry}
                  </p>
                )}
                {review && (
                  <p className={s.fieldFeedback}>
                    {c.correctValue(challenge.q.answer, challenge.q.unit)}
                  </p>
                )}
              </fieldset>
              <fieldset className={s.step}>
                <legend>
                  <b>2</b> {c.checkCondition}
                </legend>
                <p>{c.conditionPrompt}</p>
                {choices("condition", [
                  challenge.q.condition,
                  ...challenge.q.wrongConditions,
                ])}
              </fieldset>
              <fieldset className={s.step}>
                <legend>
                  <b>3</b> {c.identifyTarget}
                </legend>
                <p>{c.targetPrompt}</p>
                {choices("target", [
                  challenge.target,
                  ...challenge.wrongTargets,
                ])}
              </fieldset>
              <fieldset className={s.step}>
                <legend>
                  <b>4</b> {c.chooseReason}
                </legend>
                <p>{c.reasonPrompt}</p>
                {choices("reason", challenge.reasonChoices)}
              </fieldset>
              {!locked && (
                <button
                  type="button"
                  className={s.primary}
                  disabled={!allAnswered}
                  onClick={submit}
                >
                  {c.submit}
                </button>
              )}
              {!allAnswered && !locked && (
                <p className={s.small}>{c.incomplete}</p>
              )}
              <div ref={resultRef} aria-live="polite">
                {grade && (
                  <div
                    className={grade.correct ? s.success : s.review}
                    role="status"
                  >
                    <h4>{grade.correct ? c.correct : c.repair}</h4>
                    <p>{c.answerScore(grade.score, draft.bestScore)}</p>
                    {grade.messages.map((message) => (
                      <p key={message}>
                        <MathText>{message}</MathText>
                      </p>
                    ))}
                    {(grade.correct || review) && (
                      <div className={s.working}>
                        <p>
                          ∵ <MathText>{challenge.q.given}</MathText>
                        </p>
                        <p>
                          ∴ <MathText>{challenge.target}</MathText> (
                          <MathText>{labelFor(challenge.q.reasonId)}</MathText>)
                        </p>
                        <p>
                          <MathText>{challenge.q.explanation}</MathText>
                        </p>
                      </div>
                    )}
                    {!review && !grade.correct && !draft.expired && (
                      <div className={s.actions}>
                        <button
                          type="button"
                          className={s.primary}
                          onClick={trySimilar}
                        >
                          {c.similarQuestion}
                        </button>
                        <button type="button" onClick={() => retry()}>
                          {c.retry}
                        </button>
                      </div>
                    )}
                    {grade.correct && view.index < view.queue.length - 1 && (
                      <button
                        type="button"
                        className={s.primary}
                        onClick={() => navigate(view.index + 1)}
                      >
                        {c.nextMission}
                      </button>
                    )}
                  </div>
                )}
                {review && !grade && (
                  <div className={s.working}>
                    <p>{c.uncheckedSaved}</p>
                    <p>
                      ∵ <MathText>{challenge.q.given}</MathText>
                    </p>
                    <p>
                      ∴ <MathText>{challenge.target}</MathText> (
                      <MathText>{labelFor(challenge.q.reasonId)}</MathText>)
                    </p>
                    <p>
                      <MathText>{challenge.q.explanation}</MathText>
                    </p>
                  </div>
                )}
                {!review && draft.expired && !draft.complete && (
                  <div className={s.review} role="status">
                    <h4>{c.timeUp}</h4>
                    <p>{c.timeUpBody}</p>
                    <button
                      type="button"
                      className={s.primary}
                      onClick={() => retry(true)}
                    >
                      {c.continuePractice}
                    </button>
                    <button type="button" onClick={() => retry()}>
                      {c.retryTimer}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={s.footer}>
            <span>{c.setPersistence}</span>
            <button type="button" onClick={() => start()}>
              {c.restart}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
