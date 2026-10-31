"use client";

import { useEffect, useRef, useState } from "react";
import { circleReasonGameCopy as c } from "@/lib/copy";
import { type LabId, reasons } from "./content";
import { CheckDiagram } from "./TransferCheck";
import MathText from "./MathText";
import { useLocalSession } from "./useLocalSession";
import {
  challengeGroups,
  createChallengeQueue,
  getReasonChallenge,
  gradeReasonChallenge,
  shuffleChallengeChoices,
  type ChallengeGroupId,
} from "./reasonChallenge";
import {
  initialChallengeSession,
  newChallengeDraft,
  parseChallengeSession,
  updateChallengeChain,
  challengeSpeedBonus,
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
  const top = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const reasonId = state.queue[state.index];
  const challenge = reasonId
    ? getReasonChallenge(reasonId, (state.seed + state.index) % 3)
    : null;
  const draft = reasonId ? state.drafts[reasonId] : undefined;
  const grade =
    challenge && draft?.checked
      ? gradeReasonChallenge(challenge, draft.response)
      : null;
  const reasoningValid =
    !!grade && grade.condition && grade.target && grade.reason;
  const group = challengeGroups.find((g) => g.id === state.group)!;
  const solved = state.queue.filter((id) => state.drafts[id]?.complete).length;
  const score = Object.values(state.drafts).reduce(
    (total, d) => total + d.bestScore,
    0,
  );
  const remaining = draft?.deadline
    ? Math.max(0, Math.ceil((draft.deadline - now) / 1000))
    : 0;
  const locked = !!draft && (draft.complete || draft.checked || draft.expired);
  const allAnswered =
    !!draft && Object.values(draft.response).every((v) => v.trim().length > 0);
  const finished = state.started && solved === state.queue.length;

  useEffect(() => {
    if (!state.started || !draft?.deadline || draft.complete || draft.expired)
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
    draft?.deadline,
    draft?.complete,
    draft?.expired,
  ]);

  function scrollTop() {
    requestAnimationFrame(() =>
      top.current?.scrollIntoView({ block: "start", behavior: "auto" }),
    );
  }
  function start(groupId: ChallengeGroupId = state.group) {
    // This clock read happens only in a start/restart button event.
    const time = Date.now();
    const seed = time % 2147483647,
      queue = createChallengeQueue(groupId, seed);
    setNow(time);
    setHint("");
    setState((previous) => ({
      ...previous,
      group: groupId,
      seed,
      queue,
      index: 0,
      started: true,
      streak: 0,
      drafts: { [queue[0]]: newChallengeDraft(previous.seconds, time) },
    }));
    scrollTop();
  }
  function navigate(index: number) {
    const time = Date.now();
    setNow(time);
    setHint("");
    setState((previous) => {
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
  function respond(key: keyof ChallengeResponse, value: string) {
    setHint("");
    setState((previous) => {
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
        (previous.seed + previous.index) % 3,
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
          state.seed + state.index * 37 + key.length,
        ).map((value) => (
          <button
            type="button"
            key={value}
            className={key === "reason" ? s.skillCard : undefined}
            aria-label={key === "reason" ? labelFor(value) : undefined}
            data-choice={value}
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
              </span>
            ) : (
              <span className={s.choiceText}>
                <MathText>{value}</MathText>
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
        <strong>{c.chainCount(state.streak)}</strong>
        <span>{c.bestChain(state.bestStreak)}</span>
      </div>
      {saveFailed && (
        <p className={s.notice} role="status">
          {c.saveFailed}
        </p>
      )}
      {!state.started || !challenge || !draft ? (
        <>
          <div className={s.levels} role="group" aria-label={c.chooseLevel}>
            {challengeGroups.map((g, i) => (
              <button
                type="button"
                key={g.id}
                aria-pressed={state.group === g.id}
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    group: g.id,
                    streak: previous.group === g.id ? previous.streak : 0,
                    queue: previous.group === g.id ? previous.queue : [],
                    drafts: previous.group === g.id ? previous.drafts : {},
                    index: previous.group === g.id ? previous.index : 0,
                  }))
                }
              >
                <span className={s.levelNumber}>{i + 1}</span>
                <strong>{g.title}</strong>
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
                onChange={(e) =>
                  setState((previous) => ({
                    ...previous,
                    seconds: Number(
                      e.target.value,
                    ) as ChallengeSession["seconds"],
                    streak: 0,
                    queue: [],
                    drafts: {},
                    index: 0,
                  }))
                }
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
                setState((previous) => ({ ...previous, started: false }))
              }
            >
              {c.levels}
            </button>
            <strong>
              {c.runProgress(group.title, solved, state.queue.length)}
            </strong>
            <span
              className={s.timer}
              data-urgent={!!draft.deadline && remaining <= 20}
            >
              {draft.complete
                ? c.solved
                : draft.deadline
                  ? c.seconds(remaining)
                  : c.practice}
            </span>
          </div>
          <progress
            className={s.progress}
            value={solved}
            max={state.queue.length}
            aria-label={c.missionsSolved}
          />
          <nav className={s.navigation} aria-label={c.questionNavigation}>
            <button
              type="button"
              disabled={state.index === 0}
              onClick={() => navigate(state.index - 1)}
            >
              {c.previous}
            </button>
            <div>
              {state.queue.map((id, i) => (
                <button
                  type="button"
                  key={id}
                  aria-label={c.goToQuestion(i + 1)}
                  aria-current={i === state.index ? "step" : undefined}
                  data-solved={state.drafts[id]?.complete}
                  onClick={() => navigate(i)}
                >
                  {i + 1}
                  {state.drafts[id]?.complete ? " ✓" : ""}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={state.index === state.queue.length - 1}
              onClick={() => navigate(state.index + 1)}
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
                {c.mission(state.index + 1, state.queue.length)}
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
                    {grade.correct && (
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
                    {!grade.correct && !draft.expired && (
                      <button
                        type="button"
                        className={s.primary}
                        onClick={() => retry()}
                      >
                        {c.retry}
                      </button>
                    )}
                    {grade.correct && state.index < state.queue.length - 1 && (
                      <button
                        type="button"
                        className={s.primary}
                        onClick={() => navigate(state.index + 1)}
                      >
                        {c.nextMission}
                      </button>
                    )}
                  </div>
                )}
                {draft.expired && !draft.complete && (
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
            <span>{c.persistence}</span>
            <button type="button" onClick={() => start()}>
              {c.restart}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
