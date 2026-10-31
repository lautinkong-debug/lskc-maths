"use client";

import { useEffect, useRef, useState } from "react";
import { reasons, type LabId } from "./content";
import { questLevels, shuffledQuestChoices } from "./quest";
import {
  initialQuest,
  parseQuest,
  questResultKey,
  questSeconds,
  questProofCards,
  type QuestAttempt,
  type QuestGame,
} from "./questSession";
import { useLocalSession } from "./useLocalSession";
import ReasonFlowDiagram from "./ReasonFlowDiagram";
import MathText from "./MathText";
import s from "./quest.module.css";

const games = [
  {
    id: "unlock",
    icon: "◇",
    title: "Unlock the Circle",
    text: "Open three locks with a reason, a conclusion and a condition.",
    action: "Unlock",
  },
  {
    id: "build",
    icon: "▰",
    title: "Build the Proof",
    text: "Tap the statement tiles to build a complete mathematical argument.",
    action: "Build",
  },
  {
    id: "detective",
    icon: "⌕",
    title: "Circle Detective",
    text: "Repair a student's mistaken reason, then check the missing condition.",
    action: "Investigate",
  },
] as const;
const tier = (level: number) =>
  level <= 6
    ? "Trail 1 · Discover"
    : level <= 12
      ? "Trail 2 · Connect"
      : "Trail 3 · Master";
const starText = (stars: number) => "★".repeat(stars) + "☆".repeat(3 - stars);
const reasonName = (id: string) =>
  reasons.find((r) => r.id === id)?.label ?? id;

export default function CircleQuest({
  onExplore,
}: {
  onExplore: (lab: LabId) => void;
}) {
  const [progress, setProgress, saveFailed] = useLocalSession(
    "quest-v1",
    initialQuest,
    parseQuest,
  );
  const [now, setNow] = useState(() => Date.now());
  const topRef = useRef<HTMLElement>(null);
  const active = progress.active;
  const level = questLevels.find((l) => l.id === active?.levelId);
  const proofCards = level ? questProofCards(level) : [];
  const game = games.find((g) => g.id === (active?.game ?? progress.game))!;
  const running = active?.status === "playing";
  const seconds = active?.deadline
    ? Math.max(0, Math.ceil((active.deadline - now) / 1000))
    : 0;
  const completed = questLevels.filter(
    (l) => progress.results[questResultKey(progress.game, l.id, progress.mode)],
  ).length;
  const totalScore = Object.values(progress.results).reduce(
    (sum, result) => sum + result.score,
    0,
  );

  useEffect(() => {
    if (!active?.deadline || active.status !== "playing") return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      setProgress((state) => {
        const round = state.active;
        if (
          !round?.deadline ||
          round.status !== "playing" ||
          time < round.deadline
        )
          return state;
        return {
          ...state,
          active: {
            ...round,
            status: "expired",
            feedback:
              "Time is up. Try again or explore this reason at your own pace.",
          },
        };
      });
    };
    const timer = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // setProgress writes the latest persisted state through a functional updater.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.deadline, active?.status]);

  function scrollTop() {
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ block: "start", behavior: "auto" }),
    );
  }
  function start(
    levelId: string,
    nextGame: QuestGame = progress.game,
    practice = false,
  ) {
    const next = questLevels.find((l) => l.id === levelId)!;
    const mode = practice ? "practice" : progress.mode;
    // Start is called only by a user's level/replay button, never while rendering.
    // eslint-disable-next-line react-hooks/purity
    const time = Date.now();
    setNow(time);
    setProgress((state) => ({
      ...state,
      game: nextGame,
      mode,
      active: {
        game: nextGame,
        levelId,
        mode,
        deadline:
          mode === "speed" ? time + questSeconds(next.level) * 1000 : null,
        stage: 0,
        seed: time % 2147483647,
        clues: [],
        order: [],
        mistakes: 0,
        hints: 0,
        status: "playing",
        feedback: "",
        score: 0,
        stars: 0,
      },
    }));
    scrollTop();
  }
  function changeRound(change: (round: QuestAttempt) => QuestAttempt) {
    setProgress((state) => {
      const round = state.active;
      if (!round || round.status !== "playing") return state;
      if (
        round.levelId !== active?.levelId ||
        round.game !== active.game ||
        round.stage !== active.stage
      )
        return state;
      if (round.deadline && Date.now() >= round.deadline)
        return {
          ...state,
          active: {
            ...round,
            status: "expired",
            feedback: "Time is up. Try again or switch to practice.",
          },
        };
      return { ...state, active: change(round) };
    });
  }
  function finish() {
    setProgress((state) => {
      const round = state.active;
      if (!round || round.status !== "playing") return state;
      if (
        round.levelId !== active?.levelId ||
        round.game !== active.game ||
        round.stage !== active.stage
      )
        return state;
      const left = round.deadline
        ? Math.max(0, Math.ceil((round.deadline - Date.now()) / 1000))
        : 0;
      if (round.deadline && left === 0)
        return {
          ...state,
          active: {
            ...round,
            status: "expired",
            feedback: "Time is up. Try again or switch to practice.",
          },
        };
      const stars =
        round.mistakes === 0 && round.hints === 0
          ? 3
          : round.mistakes <= 2 && round.hints <= 1
            ? 2
            : 1;
      const score =
        stars * 100 + (round.mistakes === 0 && round.hints === 0 ? left : 0);
      const key = questResultKey(round.game, round.levelId, round.mode);
      const previous = state.results[key];
      return {
        ...state,
        active: {
          ...round,
          status: "won",
          stars,
          score,
          feedback: "Reason justified. The circle is unlocked!",
        },
        results: {
          ...state.results,
          [key]: {
            stars: Math.max(previous?.stars ?? 0, stars),
            score: Math.max(previous?.score ?? 0, score),
          },
        },
      };
    });
  }
  function choose(correct: boolean, feedback: string, final: boolean) {
    if (!correct) {
      changeRound((round) => ({
        ...round,
        mistakes: Math.min(999, round.mistakes + 1),
        feedback,
      }));
      return;
    }
    if (final) finish();
    else
      changeRound((round) => ({
        ...round,
        stage: round.stage + 1,
        feedback: "That step is justified. Open the next lock.",
      }));
  }
  function checkProof() {
    if (!level || !active) return;
    const wrong = level.proofSteps.findIndex(
      (step, index) => step.id !== active.order[index],
    );
    if (wrong === -1) finish();
    else
      changeRound((round) => ({
        ...round,
        mistakes: Math.min(999, round.mistakes + 1),
        feedback:
          wrong === 0
            ? "Start with the given facts. A conclusion cannot be used as a given."
            : "Check the condition before making the conclusion. Tap a placed tile to remove it and try again.",
      }));
  }

  return (
    <section className={s.quest} ref={topRef} aria-label="Circle Quest">
      <header className={s.header}>
        <div>
          <span className={s.eyebrow}>51 MISSIONS · 3 GAMES</span>
          <h2>Circle Quest</h2>
          <p>17 reasons. Three ways to master them.</p>
        </div>
        <div className={s.score}>
          <strong>{totalScore}</strong>
          <span>best-score total</span>
        </div>
      </header>
      {saveFailed && (
        <p role="status" className={s.warning}>
          This browser could not save your quest. You can keep playing.
        </p>
      )}
      {!active || !level ? (
        <>
          <div
            className={s.gameChoices}
            role="group"
            aria-label="Choose a game"
          >
            {games.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={progress.game === item.id}
                onClick={() => setProgress((p) => ({ ...p, game: item.id }))}
              >
                <span className={s.gameIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </button>
            ))}
          </div>
          <div className={s.mapHeader}>
            <div>
              <h3>{game.title}</h3>
              <p>
                {completed}/17 levels completed in {progress.mode} mode
              </p>
            </div>
            <div className={s.mode} role="group" aria-label="Challenge mode">
              <button
                type="button"
                aria-pressed={progress.mode === "practice"}
                onClick={() => setProgress((p) => ({ ...p, mode: "practice" }))}
              >
                Practice · no timer
              </button>
              <button
                type="button"
                aria-pressed={progress.mode === "speed"}
                onClick={() => setProgress((p) => ({ ...p, mode: "speed" }))}
              >
                Speed challenge
              </button>
            </div>
          </div>
          <p className={s.mapHint}>
            {progress.mode === "speed"
              ? "Beat the clock: 120, 105 or 90 seconds by trail. The timer continues if you refresh. Independent correct finishes earn a time bonus."
              : "Take your time. Use a hint, explore a diagram, and retry as often as you need."}
          </p>
          <p className={s.starGuide}>
            ★★★ Independent solve · ★★ A little help · ★ Completed after
            practice. Replaying improves your best score.
          </p>
          {[0, 6, 12].map((from) => (
            <section key={from} className={s.trail} aria-label={tier(from + 1)}>
              <h4>{tier(from + 1)}</h4>
              <div className={s.levels}>
                {questLevels
                  .slice(from, from === 12 ? 17 : from + 6)
                  .map((item) => {
                    const result =
                      progress.results[
                        questResultKey(progress.game, item.id, progress.mode)
                      ];
                    return (
                      <button
                        type="button"
                        className={s.level}
                        key={item.id}
                        onClick={() => start(item.id)}
                        aria-label={`Level ${item.level}: ${item.title}`}
                      >
                        <span className={s.levelNumber}>{item.level}</span>
                        <strong>{item.title}</strong>
                        <small>Reason {item.number}</small>
                        <span
                          className={s.stars}
                          aria-label={`${result?.stars ?? 0} of 3 stars`}
                        >
                          {starText(result?.stars ?? 0)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
          <p className={s.mapHint}>
            Start at Level 1 or choose any reason you want to practise. Your
            best results stay in this browser.
          </p>
        </>
      ) : (
        <>
          <div className={s.roundTop}>
            <button
              type="button"
              className={s.secondary}
              onClick={() => {
                setProgress((p) => ({ ...p, active: null }));
                scrollTop();
              }}
            >
              ← Level map
            </button>
            <span>
              {game.title} · Level {level.level}/17
            </span>
            <span
              className={s.clock}
              data-urgent={active.mode === "speed" && seconds <= 20}
            >
              {active.mode === "speed" ? `◷ ${seconds}s` : "∞ Practice"}
            </span>
          </div>
          <h3 className={s.roundTitle}>{level.title}</h3>
          <div className={s.playLayout}>
            <div className={s.circleCard}>
              <div className={s.given}>
                <strong>Given</strong>
                <MathText>{level.given}</MathText>
              </div>
              <ReasonFlowDiagram
                reasonId={level.reasonId}
                reveal={active.status === "won"}
              />
              <p className={s.diagramHint}>
                {active.status === "won"
                  ? "The green marks show what your reason justifies."
                  : "Use the blue givens to decide what follows."}
              </p>
              <button
                type="button"
                className={s.secondary}
                onClick={() => onExplore(level.lab)}
              >
                Explore this property
              </button>
            </div>
            <div className={s.challenge}>
              {running && (
                <>
                  {active.game !== "build" && (
                    <div className={s.locks} aria-label="Mission steps">
                      {(active.game === "unlock"
                        ? ["Reason", "Conclusion", "Condition"]
                        : ["Repair", "Check"]
                      ).map((step, i) => (
                        <span
                          key={step}
                          data-current={active.stage === i}
                          data-done={active.stage > i}
                        >
                          {active.stage > i ? "✓" : i + 1} {step}
                        </span>
                      ))}
                    </div>
                  )}
                  {active.game === "detective" && (
                    <div className={s.case}>
                      <strong>The student’s argument</strong>
                      <p>
                        <MathText>{level.conclusion}</MathText>
                      </p>
                      <p>
                        (
                        <MathText>
                          {reasonName(level.detective.erroneousReasonId)}
                        </MathText>
                        )
                      </p>
                      <span>
                        The conclusion needs a valid justification. Repair the
                        reason, then check its condition.
                      </span>
                    </div>
                  )}
                  {active.game === "unlock" &&
                  active.clues.length < level.givens.length ? (
                    <div>
                      <h4>Collect the givens</h4>
                      <p>
                        Inspect the blue marks. Tap each fact you can use before
                        choosing a reason.
                      </p>
                      <div className={s.answers} data-testid="quest-clues">
                        {level.givens.map((clue, i) => (
                          <button
                            type="button"
                            key={clue}
                            aria-pressed={active.clues.includes(i)}
                            disabled={active.clues.includes(i)}
                            onClick={() =>
                              changeRound((round) => ({
                                ...round,
                                clues: round.clues.includes(i)
                                  ? round.clues
                                  : [...round.clues, i],
                              }))
                            }
                          >
                            <span aria-hidden="true">
                              {active.clues.includes(i) ? "✓ " : "◇ "}
                            </span>
                            <MathText>{clue}</MathText>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : active.game === "build" ? (
                    <>
                      <h4>Build the argument</h4>
                      <p>
                        Choose three valid tiles in order: givens → condition →
                        conclusion with its reason.
                      </p>
                      <ol className={s.proofSlots}>
                        {level.proofSteps.map((_, i) => {
                          const placed = proofCards.find(
                            (step) => step.id === active.order[i],
                          );
                          return (
                            <li key={i}>
                              {placed ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeRound((round) => ({
                                      ...round,
                                      order: round.order.filter(
                                        (id) => id !== placed.id,
                                      ),
                                      feedback: "",
                                    }))
                                  }
                                >
                                  <MathText>{placed.text}</MathText>
                                  <small>Tap to remove</small>
                                </button>
                              ) : (
                                <span>Step {i + 1}</span>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                      <div
                        className={s.tiles}
                        role="group"
                        aria-label="Proof tiles"
                      >
                        {shuffledQuestChoices(
                          proofCards,
                          active.seed + level.level * 7,
                        )
                          .filter((step) => !active.order.includes(step.id))
                          .map((step) => (
                            <button
                              type="button"
                              key={step.id}
                              data-proof-step={step.id}
                              disabled={
                                active.order.length >= level.proofSteps.length
                              }
                              onClick={() =>
                                changeRound((round) => ({
                                  ...round,
                                  order:
                                    round.order.includes(step.id) ||
                                    round.order.length >=
                                      level.proofSteps.length
                                      ? round.order
                                      : [...round.order, step.id],
                                  feedback: "",
                                }))
                              }
                            >
                              <MathText>{step.text}</MathText>
                            </button>
                          ))}
                      </div>
                      <button
                        type="button"
                        className={s.primary}
                        disabled={
                          active.order.length !== level.proofSteps.length
                        }
                        onClick={checkProof}
                      >
                        Check my proof
                      </button>
                    </>
                  ) : active.stage === 0 ? (
                    <>
                      <h4>
                        {active.game === "detective"
                          ? "Which reason repairs this argument?"
                          : "Which reason opens the first lock?"}
                      </h4>
                      <div className={s.answers} data-testid="quest-answers">
                        {shuffledQuestChoices(
                          [level.reasonId, ...level.distractorReasonIds],
                          active.seed + level.level * 11,
                        ).map((id) => (
                          <button
                            type="button"
                            key={id}
                            data-choice-id={id}
                            onClick={() =>
                              choose(
                                id === level.reasonId,
                                level.feedbackByReasonId[id] ?? level.hint,
                                false,
                              )
                            }
                          >
                            <MathText>{reasonName(id)}</MathText>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : active.game === "unlock" && active.stage === 1 ? (
                    <>
                      <h4>What must follow from the givens?</h4>
                      <div className={s.answers} data-testid="quest-answers">
                        {shuffledQuestChoices(
                          level.conclusionChoices,
                          active.seed + level.level * 13,
                        ).map((choice) => (
                          <button
                            type="button"
                            key={choice.id}
                            data-choice-id={choice.id}
                            onClick={() =>
                              choose(
                                choice.correct,
                                "Follow the direction of your reason. Which new fact does it justify from these givens?",
                                false,
                              )
                            }
                          >
                            <MathText>{choice.text}</MathText>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>Which condition makes the reason valid?</h4>
                      <div className={s.answers} data-testid="quest-answers">
                        {shuffledQuestChoices(
                          level.conditionChoices,
                          active.seed + level.level * 17,
                        ).map((choice) => (
                          <button
                            type="button"
                            key={choice.id}
                            data-choice-id={choice.id}
                            onClick={() =>
                              choose(choice.correct, level.condition, true)
                            }
                          >
                            <MathText>{choice.text}</MathText>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <div className={s.help}>
                    <button
                      type="button"
                      className={s.secondary}
                      onClick={() =>
                        changeRound((round) => ({
                          ...round,
                          hints: Math.min(999, round.hints + 1),
                          feedback:
                            round.hints === 0 ? level.hint : level.condition,
                        }))
                      }
                    >
                      A small hint
                    </button>
                    <span>
                      {active.mistakes}{" "}
                      {active.mistakes === 1 ? "retry" : "retries"}
                    </span>
                  </div>
                  <p role="status" className={s.feedback}>
                    <MathText>
                      {active.feedback ||
                        "Look for the givens first. You can explore or ask for a hint."}
                    </MathText>
                  </p>
                </>
              )}
              {active.status === "won" && (
                <div className={s.win}>
                  <span
                    className={s.stars}
                    aria-label={`${active.stars} of 3 stars`}
                  >
                    {starText(active.stars)}
                  </span>
                  <h4>
                    {active.game === "build"
                      ? "Proof complete!"
                      : active.game === "detective"
                        ? "Case solved!"
                        : "Circle unlocked!"}
                  </h4>
                  <p>Round score {active.score} · Your best result is saved.</p>
                  <div className={s.working}>
                    <p>
                      ∵ <MathText>{level.given}</MathText>
                    </p>
                    <p>
                      ∴ <MathText>{level.conclusion}</MathText> (
                      <MathText>{level.reasonLabel}</MathText>)
                    </p>
                  </div>
                  {level.level < 17 ? (
                    <button
                      type="button"
                      className={s.primary}
                      onClick={() =>
                        start(questLevels[level.level].id, active.game)
                      }
                    >
                      Next level →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={s.primary}
                      onClick={() => {
                        setProgress((p) => ({ ...p, active: null }));
                        scrollTop();
                      }}
                    >
                      Back to all levels
                    </button>
                  )}
                  <button
                    type="button"
                    className={s.secondary}
                    onClick={() => start(level.id, active.game)}
                  >
                    Replay this level
                  </button>
                </div>
              )}
              {active.status === "expired" && (
                <div className={s.timeout}>
                  <span className={s.bigIcon}>◷</span>
                  <h4>Time is up</h4>
                  <p>
                    You can retry the speed challenge or work through this level
                    without a timer.
                  </p>
                  <button
                    type="button"
                    className={s.primary}
                    onClick={() => start(level.id, active.game)}
                  >
                    Try speed again
                  </button>
                  <button
                    type="button"
                    className={s.secondary}
                    onClick={() => start(level.id, active.game, true)}
                  >
                    Practise without a timer
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
