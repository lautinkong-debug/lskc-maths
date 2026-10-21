"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Math as MathText } from "@/components/Math";
import { Board } from "./Board";
import { congruenceGamesCopy as c } from "./copy";
import {
  conditions,
  evidenceName,
  gradeEvidence,
  lessonRound,
  lessonSetup,
  mixedRounds,
  pretty,
  same,
  type Condition,
  type Criterion,
  type Evidence,
  type Mission,
  type Round,
} from "./model";
import styles from "./games.module.css";

const storageKey = "congruence-detective-progress-v1";
const allIds = [
  ...conditions.flatMap((condition) =>
    [0, 1, 2].map((level) => `lesson-${condition}-${level + 1}`),
  ),
  ...mixedRounds.map((round) => round.id),
];
const title = (mission: Mission) =>
  mission === "mixed" ? c.mixed : c.missions[mission].title;
function storedProgress() {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribeStorage(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const systemMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Classroom({
  children,
  onExit,
  reduced,
}: {
  children: ReactNode;
  onExit: () => void;
  reduced: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    node.showModal();
    return () => node.close();
  }, []);
  useEffect(() => {
    const handle = () => {
      if (window.location.hash !== "#games") onExit();
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, [onExit]);
  return (
    <dialog
      ref={dialog}
      className={styles.classroom}
      aria-label={c.classroom}
      data-reduced={reduced}
      data-testid="congruence-game-classroom"
      onCancel={(event) => {
        event.preventDefault();
        onExit();
      }}
    >
      {children}
    </dialog>
  );
}

function Symbol({ condition }: { condition: Condition }) {
  return (
    <svg viewBox="0 0 260 128" className={styles.symbol} aria-hidden="true">
      <path
        d="M28 101 L90 24 L126 101 Z M162 30 L226 102 L144 106 Z"
        stroke="var(--color-navy)"
        strokeWidth="2.5"
        fill="var(--color-navy-wash)"
      />
      {condition === "SSS" && (
        <path
          d="M54 62 l10 7 M104 62 l-11 6 M72 95 v13 M77 95 v13 M184 61 l-9 8 M151 62 l12 4 M181 100 l1 13 M186 100 l1 13"
          stroke="var(--color-crimson)"
          strokeWidth="2.5"
        />
      )}
      {condition === "SAS" && (
        <>
          <path
            d="M28 101 L90 24 M28 101 L126 101 M162 30 L226 102 M162 30 L144 106"
            stroke="var(--color-crimson)"
            strokeWidth="4"
          />
          <path
            d="M41 84 Q52 94 48 101 M157 50 Q169 54 176 47"
            stroke="var(--color-crimson)"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {(condition === "ASA" || condition === "AAS") && (
        <>
          <path
            d="M41 84 Q52 94 48 101 M109 101 Q106 91 116 82 M157 50 Q169 54 176 47 M212 86 Q201 96 205 103"
            stroke="var(--color-crimson)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d={
              condition === "ASA"
                ? "M28 101 L126 101 M162 30 L226 102"
                : "M90 24 L126 101 M144 106 L226 102"
            }
            stroke="var(--color-crimson)"
            strokeWidth="4"
          />
        </>
      )}
      {condition === "RHS" && (
        <>
          <path
            d="M26 104 L26 26 L124 104 Z"
            fill="var(--color-paper)"
            stroke="var(--color-navy)"
            strokeWidth="3"
          />
          <path
            d="M26 86 H44 V104 M26 26 L124 104"
            stroke="var(--color-crimson)"
            strokeWidth="3"
            fill="none"
          />
          <text x="58" y="61" fontSize="17" fill="var(--color-crimson)">
            H
          </text>
        </>
      )}
    </svg>
  );
}

export default function CongruenceGames({
  presenting = false,
}: {
  presenting?: boolean;
}) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [level, setLevel] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [sound, setSound] = useState(false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const osReduced = useSyncExternalStore(
    subscribeMotion,
    systemMotion,
    () => true,
  );
  const reduced = motionOverride ?? osReduced;
  const stored = useSyncExternalStore(
    subscribeStorage,
    storedProgress,
    () => "[]",
  );
  let saved: string[] = [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed))
      saved = parsed.filter(
        (id): id is string => typeof id === "string" && allIds.includes(id),
      );
  } catch {
    /* Optional local progress. */
  }
  const done = [...new Set([...saved, ...completed])];
  const root = useRef<HTMLElement>(null);
  const lastMission = useRef<Mission | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const close = useCallback(() => {
    setMission(null);
    setFinished(false);
  }, []);
  useEffect(() => {
    if (!mission && lastMission.current)
      root.current
        ?.querySelector<HTMLButtonElement>(
          `[data-mission="${lastMission.current}"]`,
        )
        ?.focus();
  }, [mission]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  function play(success: boolean) {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context
        .resume()
        .then(() => {
          [
            success ? 523 : 220,
            success ? 659 : 196,
            ...(success ? [784] : []),
          ].forEach((frequency, i) => {
            const oscillator = context.createOscillator(),
              gain = context.createGain();
            const start = context.currentTime + i * 0.1;
            oscillator.type = "sine";
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.045, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + 0.18);
            oscillator.onended = () => {
              oscillator.disconnect();
              gain.disconnect();
            };
          });
        })
        .catch(() => {
          /* Audio is optional. */
        });
    } catch {
      /* Audio is optional. */
    }
  }
  function open(next: Mission) {
    lastMission.current = next;
    setMission(next);
    setFinished(false);
    const ids =
      next === "mixed"
        ? mixedRounds.map((round) => round.id)
        : [0, 1, 2].map((n) => `lesson-${next}-${n + 1}`);
    setLevel(
      Math.max(
        0,
        ids.findIndex((id) => !done.includes(id)),
      ),
    );
  }
  function complete(id: string) {
    const next = [...new Set([...done, id])];
    setCompleted(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Play also works with storage disabled. */
    }
  }
  const total = mission === "mixed" ? mixedRounds.length : 3;
  return (
    <section
      ref={root}
      className={styles.games}
      data-projecting={presenting}
      data-testid="congruence-games"
    >
      <header className={styles.lobbyHeader}>
        <div>
          <h2>{c.title}</h2>
          <p className={styles.lead}>{c.intro}</p>
          <p>{c.description}</p>
        </div>
        <div className={styles.progress}>
          <strong>
            {done.length}
            <span> / {allIds.length}</span>
          </strong>
          <span>{c.progress}</span>
        </div>
      </header>
      <div className={styles.missions}>
        {conditions.map((condition, index) => (
          <button
            key={condition}
            className={styles.mission}
            data-mission={condition}
            aria-label={c.missions[condition].title}
            onClick={() => open(condition)}
          >
            <div className={styles.missionTop}>
              <span className={styles.number}>{index + 1}</span>
              <span>
                {
                  done.filter((id) => id.startsWith(`lesson-${condition}-`))
                    .length
                }{" "}
                / 3
              </span>
            </div>
            <Symbol condition={condition} />
            <h3>{c.missions[condition].title}</h3>
            <strong>{c.missions[condition].rule}</strong>
            <p>{c.missions[condition].description}</p>
          </button>
        ))}
      </div>
      <button
        className={styles.mixedCard}
        data-mission="mixed"
        onClick={() => open("mixed")}
      >
        <div>
          <h3>{c.mixed}</h3>
          <p>{c.mixedDescription}</p>
        </div>
        <strong>
          {done.filter((id) => id.startsWith("mixed-")).length} /{" "}
          {mixedRounds.length} →
        </strong>
      </button>
      <p className={styles.saved}>{c.saved}</p>
      {mission && (
        <Classroom onExit={close} reduced={reduced}>
          <header className={styles.gameHeader}>
            <button onClick={close}>← {c.back}</button>
            <div className={styles.gameTitle}>
              <h2>{title(mission)}</h2>
              <p>
                {mission === "mixed" ? c.mixedTask : c.missions[mission].rule}
              </p>
            </div>
            <div className={styles.preferences}>
              <button aria-pressed={sound} onClick={() => setSound(!sound)}>
                {sound ? c.soundOn : c.soundOff}
              </button>
              <button
                aria-pressed={reduced}
                onClick={() => setMotionOverride(!reduced)}
              >
                {reduced ? c.motionOff : c.motionOn}
              </button>
            </div>
            <label className={styles.roundSelect}>
              {c.round}
              <select
                aria-label={c.round}
                value={level}
                onChange={(event) => {
                  setLevel(Number(event.target.value));
                  setFinished(false);
                }}
              >
                {Array.from({ length: total }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} / {total}
                  </option>
                ))}
              </select>
            </label>
          </header>
          {finished ? (
            <div className={styles.finished}>
              <span className={styles.seal} aria-hidden="true">
                ✓
              </span>
              <h2>{c.completed}</h2>
              <p>{c.completedText}</p>
              <button
                onClick={() => {
                  setLevel(0);
                  setFinished(false);
                }}
              >
                {c.replay}
              </button>
              <button onClick={close}>{c.back}</button>
            </div>
          ) : (
            <RoundGame
              key={`${mission}-${level}`}
              mission={mission}
              level={level}
              onResult={play}
              onNext={(id) => {
                complete(id);
                if (level + 1 === total) setFinished(true);
                else setLevel(level + 1);
              }}
            />
          )}
        </Classroom>
      )}
    </section>
  );
}

function Fact({ round, evidence }: { round: Round; evidence: Evidence }) {
  const name = (member: number) =>
    evidenceName(round, evidence, member).replace("∠", "\\angle ");
  const unit = evidence.kind === "angle" ? "^\\circ" : "";
  return (
    <MathText>
      {same(...evidence.values)
        ? `${name(0)}=${name(1)}=${pretty(evidence.values[0])}${unit}`
        : `${name(0)}=${pretty(evidence.values[0])}${unit},\\ ${name(1)}=${pretty(evidence.values[1])}${unit}`}
    </MathText>
  );
}

function RoundGame({
  mission,
  level,
  onResult,
  onNext,
}: {
  mission: Mission;
  level: number;
  onResult: (success: boolean) => void;
  onNext: (id: string) => void;
}) {
  const setup = mission === "mixed" ? null : lessonSetup(mission, level);
  const [value, setValue] = useState(setup?.start ?? 0);
  const [draft, setDraft] = useState(String(setup?.start ?? 0));
  const [selected, setSelected] = useState<string[]>([]);
  const [criterion, setCriterion] = useState<Criterion | null>(null);
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [history, setHistory] = useState(false);
  const [hint, setHint] = useState(false);
  const [controlsHost, setControlsHost] = useState<HTMLElement | null>(null);
  const desk = useRef<HTMLElement>(null);
  const round =
    mission === "mixed"
      ? mixedRounds[level]
      : lessonRound(mission, level, value);
  const focus = passed
    ? revealed
      ? round.proof[revealed - 1].evidence
      : []
    : null;
  function edit(next: number) {
    if (!setup || !Number.isFinite(next)) return;
    const bounded = Math.max(setup.min, Math.min(setup.max, next));
    setValue(bounded);
    setDraft(String(bounded));
    setFeedback("");
    setSelected([]);
    setCriterion(null);
  }
  function toggle(id: string) {
    if (passed) return;
    setSelected((old) =>
      old.includes(id) ? old.filter((item) => item !== id) : [...old, id],
    );
    setFeedback("");
  }
  function check() {
    if (!criterion) {
      setFeedback(c.choose);
      return;
    }
    const result = gradeEvidence(round, criterion, selected);
    setFeedback(c.feedback[result.code]);
    onResult(result.correct);
    if (result.correct) {
      setPassed(true);
      setRevealed(0);
      desk.current?.scrollTo({ top: 0 });
    }
  }
  const finalStep = revealed === round.proof.length;
  return (
    <div className={styles.workspace}>
      <p className={styles.task}>
        {mission === "mixed" ? c.mixedTask : c.missions[mission].task}
      </p>
      <div className={styles.playLayout}>
        <Board
          round={round}
          selected={selected}
          focus={focus}
          onSelect={toggle}
          controlsHost={controlsHost}
        />
        <aside ref={desk} className={styles.desk} aria-label={c.controlPanel}>
          <details className={styles.diagramControls}>
            <summary>{c.diagramControls}</summary>
            <div ref={setControlsHost} />
          </details>
          {!passed ? (
            <>
              {setup && mission !== "mixed" && (
                <section className={styles.construction}>
                  <h3>{c.construction}</h3>
                  <p className={styles.small}>{c.target}</p>
                  <label className={styles.measurement}>
                    <span>{c.missions[mission].control}</span>
                    <span className={styles.valueInput}>
                      <input
                        type="number"
                        min={setup.min}
                        max={setup.max}
                        step={setup.step}
                        value={draft}
                        aria-label={c.missions[mission].control}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setDraft(raw);
                          const numeric = Number(raw);
                          if (
                            raw.trim() &&
                            Number.isFinite(numeric) &&
                            numeric >= setup.min &&
                            numeric <= setup.max
                          ) {
                            setValue(numeric);
                            setSelected([]);
                            setCriterion(null);
                            setFeedback("");
                          }
                        }}
                        onBlur={() => {
                          if (!draft.trim() || !Number.isFinite(Number(draft)))
                            setDraft(String(value));
                          else edit(Number(draft));
                        }}
                      />
                      {setup.kind === "angle" ? "°" : c.units}
                    </span>
                    <input
                      type="range"
                      min={setup.min}
                      max={setup.max}
                      step={setup.step}
                      value={value}
                      aria-label={`${c.missions[mission].control} slider`}
                      onChange={(event) => edit(Number(event.target.value))}
                    />
                  </label>
                  <details className={styles.constructionHelp}>
                    <summary>{c.constructionNote.split(".")[0]}.</summary>
                    <p>{c.constructionNote}</p>
                    <button onClick={() => edit(setup.start)}>
                      {c.resetMeasurement}
                    </button>
                  </details>
                </section>
              )}
              <section className={styles.evidenceSection}>
                <h3>{mission === "mixed" ? c.collectMixed : c.collect}</h3>
                <p className={styles.small}>{c.selectHint}</p>
                <div className={styles.evidenceList}>
                  {round.evidence.map((evidence) => (
                    <button
                      key={evidence.id}
                      data-testid={`congruence-evidence-${evidence.id}`}
                      aria-pressed={selected.includes(evidence.id)}
                      onClick={() => toggle(evidence.id)}
                    >
                      <span className={styles.tick} aria-hidden="true">
                        {selected.includes(evidence.id) ? "✓" : "+"}
                      </span>
                      <Fact round={round} evidence={evidence} />
                    </button>
                  ))}
                </div>
              </section>
              <fieldset className={styles.conditions}>
                <legend>
                  {mission === "mixed" ? c.chooseMixed : c.chooseCondition}
                </legend>
                {[
                  ...conditions,
                  ...(mission === "mixed" ? ["insufficient" as const] : []),
                ].map((condition) => (
                  <button
                    key={condition}
                    aria-pressed={criterion === condition}
                    onClick={() => {
                      setCriterion(condition);
                      setFeedback("");
                    }}
                  >
                    {condition === "insufficient" ? c.insufficient : condition}
                  </button>
                ))}
              </fieldset>
              <div className={styles.actions}>
                <div
                  className={styles.feedback}
                  role="status"
                  data-visible={!!feedback}
                >
                  {feedback}
                </div>
                {feedback && (
                  <button
                    className={styles.retry}
                    onClick={() => setFeedback("")}
                  >
                    {c.retry}
                  </button>
                )}
                <div className={styles.actionRow}>
                  <button className={styles.primary} onClick={check}>
                    {c.check}
                  </button>
                  <button aria-expanded={hint} onClick={() => setHint(!hint)}>
                    {hint ? c.dismissHint : c.hint}
                  </button>
                </div>
                {hint && (
                  <p className={styles.hint}>
                    {mission === "mixed"
                      ? c.mixedTask
                      : c.missions[mission].hint}
                  </p>
                )}
              </div>
            </>
          ) : (
            <section
              className={styles.proof}
              data-testid="congruence-game-proof"
            >
              <p className={styles.success} role="status">
                ✓ {feedback}
              </p>
              <div className={styles.proofTitle}>
                <h3>{c.proof}</h3>
                <span>
                  {revealed} / {round.proof.length}
                </span>
              </div>
              <p className={styles.small}>{c.proofHint}</p>
              <div className={styles.proofControls}>
                <button
                  disabled={!revealed}
                  onClick={() => setRevealed((old) => Math.max(0, old - 1))}
                >
                  {c.previousStep}
                </button>
                <button
                  className={styles.primary}
                  disabled={finalStep}
                  onClick={() => setRevealed((old) => old + 1)}
                >
                  {c.nextStep}
                </button>
                <button disabled={!revealed} onClick={() => setRevealed(0)}>
                  {c.replayProof}
                </button>
              </div>
              <div className={styles.proofPaper} aria-live="polite">
                <div className={styles.proofColumns}>
                  <span>{c.statement}</span>
                  <span>{c.reason}</span>
                </div>
                {!revealed ? (
                  <p>{c.proofStart}</p>
                ) : (
                  round.proof.slice(0, revealed).map((step, index) => (
                    <div
                      className={styles.proofStep}
                      key={index}
                      hidden={!history && index !== revealed - 1}
                      data-current={index === revealed - 1}
                    >
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <div className={styles.proofStatement}>
                        <MathText>{proofLayout(step.tex)}</MathText>
                      </div>
                      <p className={styles.proofReason}>
                        {step.reasonKey === "given"
                          ? c.given
                          : step.reasonKey === "insufficient"
                            ? c.insufficientReason
                            : step.reasonKey}
                      </p>
                    </div>
                  ))
                )}
              </div>
              {revealed > 1 && (
                <button
                  className={styles.historyButton}
                  aria-expanded={history}
                  onClick={() => setHistory(!history)}
                >
                  {history ? c.hideHistory : c.showHistory}
                </button>
              )}
              {finalStep && (
                <>
                  <p className={styles.explanation}>
                    {c.explanations[round.explanationKey]}
                  </p>
                  <button
                    className={styles.primary}
                    onClick={() => onNext(round.id)}
                  >
                    {level + 1 ===
                    (mission === "mixed" ? mixedRounds.length : 3)
                      ? c.finish
                      : c.next}
                  </button>
                </>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Keep a statement and its reason beside each other on narrow screens. */
function proofLayout(tex: string) {
  const angles = tex.match(/^(\\angle .*?) = (\\angle .*?) = (.*?)$/);
  if (angles)
    return `\\begin{aligned}${angles[1]}&=${angles[2]}\\\\&=${angles[3]}\\end{aligned}`;
  const twoValues = tex.split(",\\quad ");
  if (twoValues.length === 2)
    return `\\begin{gathered}${twoValues[0]}\\\\${twoValues[1]}\\end{gathered}`;
  if (tex.startsWith("\\text{Congruence"))
    return "\\begin{gathered}\\text{Congruence is}\\\\\\text{not established.}\\end{gathered}";
  return tex;
}
