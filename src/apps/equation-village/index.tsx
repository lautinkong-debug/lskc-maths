"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Math as Formula } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import HarbourScene from "./HarbourScene";
import SimpleHarbour from "./SimpleHarbour";
import {
  applyOperation,
  BRIDGE_EQUATION,
  equationLatex,
  isolatedSolution,
  parseRational,
  rationalLatex,
  rationalValue,
  TRANSFER_EQUATIONS,
  verifySolution,
  type Equation,
  type OperationKind,
  type Rational,
} from "./model";
import {
  bridgeRestored,
  buildWorking,
  newSession,
  restoreSession,
  STORAGE_KEY,
  transferComplete,
  type SavedMove,
  type Session,
} from "./session";
import styles from "./village.module.css";

const c = copy.equationVillage;
const kinds: OperationKind[] = ["add", "subtract", "multiply", "divide"];
const operationSymbols = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};
function listenToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function motionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function numberText(q: Rational) {
  return q.d === 1 ? String(q.n) : `${q.n}/${q.d}`;
}
function reason(move: SavedMove) {
  return {
    add: c.addReason,
    subtract: c.subtractReason,
    multiply: c.multiplyReason,
    divide: c.divideReason,
  }[move.kind](move.amount);
}
function nextHint(equation: Equation) {
  const unit = equation.left.unit;
  if (unit.n > 0) return c.hintSubtract(numberText(unit));
  if (unit.n < 0) return c.hintAdd(numberText({ ...unit, n: -unit.n }));
  if (!isolatedSolution(equation))
    return c.hintDivide(numberText(equation.left.x));
  return c.hintCheck;
}

function Tokens({ x, unit }: { x: Rational; unit: Rational }) {
  const compact =
    x.d !== 1 || unit.d !== 1 || Math.abs(x.n) + Math.abs(unit.n) > 16;
  if (compact)
    return (
      <div className={styles.bundles}>
        <span className={styles.capsule}>
          <Formula>{`${rationalLatex(x)}x`}</Formula>
        </span>
        <span className={styles.unit}>
          <Formula>{rationalLatex(unit)}</Formula>
        </span>
      </div>
    );
  return (
    <div className={styles.tokens} aria-hidden="true">
      {Array.from({ length: Math.abs(x.n) }, (_, i) => (
        <span className={styles.capsule} key={`x${i}`}>
          {x.n < 0 ? "−x" : "x"}
        </span>
      ))}
      {Array.from({ length: Math.abs(unit.n) }, (_, i) => (
        <span
          className={`${styles.unit} ${unit.n < 0 ? styles.negative : ""}`}
          key={`u${i}`}
        >
          {unit.n < 0 ? "−1" : "+1"}
        </span>
      ))}
      {x.n === 0 && unit.n === 0 && <span className={styles.zero}>0</span>}
    </div>
  );
}

export default function EquationVillage() {
  const presenting = usePresentation();
  const systemGentle = useSyncExternalStore(
    listenToMotion,
    motionPreference,
    () => false,
  );
  const [session, setSession] = useState<Session>(newSession);
  const [hydrated, setHydrated] = useState(false);
  const [saveNote, setSaveNote] = useState<string>(c.saving);
  const [corrupt, setCorrupt] = useState(false);
  const [kind, setKind] = useState<OperationKind>("subtract");
  const [amount, setAmount] = useState("");
  const [target, setTarget] = useState("both");
  const [checkValue, setCheckValue] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
    attempt?: SavedMove;
  } | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [transferWrong, setTransferWrong] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [override, setOverride] = useState<Equation | null>(null);
  const [quiet, setQuiet] = useState(false);
  const [gentle, setGentle] = useState(false);
  const [simple, setSimple] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [lowQuality, setLowQuality] = useState(false);
  const [sound, setSound] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const lock = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const replayTimer = useRef<number | undefined>(undefined);
  const audio = useRef<AudioContext | null>(null);
  const amountInput = useRef<HTMLInputElement>(null);
  const ledger = useRef<HTMLOListElement>(null);
  const reduceMotion = systemGentle || gentle;
  const working = useMemo(() => buildWorking(session.moves), [session.moves]);
  const equation = working[working.length - 1];
  const shown = override ?? equation;
  const solved = isolatedSolution(equation) !== null;
  const restored = bridgeRestored(session);
  const complete = transferComplete(session);
  const lastMove = session.moves[session.moves.length - 1];
  const transfer = TRANSFER_EQUATIONS[session.transferIndex];
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  const onReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = restoreSession(localStorage.getItem(STORAGE_KEY));
        if (saved) {
          setSession(saved);
          setTransferWrong(
            !saved.transferAnswer &&
              (saved.transferIndex === 0
                ? saved.transferMistakes > 0
                : saved.transferMistakes > 1),
          );
        } else setCorrupt(true);
      } catch {
        setSaveNote(c.storageBlocked);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setSaveNote(c.saved);
      } catch {
        setSaveNote(c.storageBlocked);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [session, hydrated]);
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(replayTimer.current);
      void audio.current?.close();
    },
    [],
  );

  useEffect(() => {
    const list = ledger.current;
    const row = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !row) return;
    const box = list.getBoundingClientRect();
    const current = row.getBoundingClientRect();
    if (current.bottom > box.bottom)
      list.scrollTop += current.bottom - box.bottom;
    else if (current.top < box.top) list.scrollTop += current.top - box.top;
  }, [session.moves.length, override]);

  function chime() {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume();
      [523.25, 659.25, 783.99].forEach((frequency, i) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const time = context.currentTime + i * 0.1;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.045, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(time);
        oscillator.stop(time + 0.42);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      /* Sound is optional; the visual result still explains success. */
    }
  }
  function hold(duration = reduceMotion ? 120 : 850) {
    lock.current = true;
    setBusy(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      lock.current = false;
      setBusy(false);
    }, duration);
  }
  function reject(text: string, attempt?: SavedMove) {
    setFeedback({ text, error: true, attempt });
    setSession((s) => ({ ...s, mistakes: s.mistakes + 1 }));
  }
  function apply(event: FormEvent) {
    event.preventDefault();
    if (lock.current || restored) return;
    const value = parseRational(amount);
    if (!value) {
      reject(c.invalid);
      return;
    }
    if (target !== "both") {
      reject(c.sameSides, { kind, amount: numberText(value) });
      return;
    }
    const next = applyOperation(equation, { kind, amount: value });
    if (!next.ok) {
      if (next.error === "out-of-range") {
        setFeedback({ text: c.outOfRange, error: false });
        return;
      }
      reject(
        next.error === "zero-operation"
          ? kind === "divide"
            ? c.zeroDivide
            : c.zeroMultiply
          : c.invalid,
      );
      return;
    }
    if (!next.changed) {
      setFeedback({ text: c.noChange, error: false });
      return;
    }
    if (session.moves.length >= 20) {
      setFeedback({ text: c.moveLimit, error: false });
      return;
    }
    hold(reduceMotion ? 120 : kind === "divide" ? 1650 : 850);
    setSession((s) => ({
      ...s,
      moves: [...s.moves, { kind, amount: numberText(value) }],
    }));
    setRevision((n) => n + 1);
    setHintVisible(false);
    setAmount("");
    setFeedback({
      text: isolatedSolution(next.equation) ? c.isolated : c.valid,
      error: false,
    });
  }
  function undo() {
    if (lock.current || !session.moves.length || restored) return;
    setSession((s) => ({ ...s, moves: s.moves.slice(0, -1) }));
    setRevision((n) => n + 1);
    setHintVisible(false);
    setFeedback({ text: c.undoNote, error: false });
  }
  function replay() {
    if (lock.current || working.length < 2) return;
    hold(reduceMotion ? 160 : lastMove?.kind === "divide" ? 1900 : 1100);
    setOverride(working[working.length - 2]);
    setRevision((n) => n + 1);
    replayTimer.current = window.setTimeout(
      () => {
        setOverride(null);
        setRevision((n) => n + 1);
      },
      reduceMotion ? 30 : 180,
    );
    setFeedback({ text: c.replayNote, error: false });
  }
  function verify(event: FormEvent) {
    event.preventDefault();
    if (lock.current || restored) return;
    const value = parseRational(checkValue);
    if (!value) {
      reject(c.invalid);
      return;
    }
    if (!verifySolution(BRIDGE_EQUATION, value)) {
      reject(c.checkWrong);
      return;
    }
    hold();
    setSession((s) => ({ ...s, checkedValue: numberText(value) }));
    setFeedback({ text: c.checked, error: false });
    chime();
  }
  function checkTransfer(event: FormEvent) {
    event.preventDefault();
    if (
      lock.current ||
      complete ||
      (transferWrong && session.transferIndex === 0)
    )
      return;
    const value = parseRational(answer);
    if (!value) {
      setFeedback({ text: c.invalid, error: true });
      return;
    }
    if (!verifySolution(transfer, value)) {
      setSession((s) => ({ ...s, transferMistakes: s.transferMistakes + 1 }));
      setTransferWrong(true);
      setFeedback(null);
      return;
    }
    hold();
    setSession((s) => ({ ...s, transferAnswer: numberText(value) }));
    setFeedback(null);
    chime();
  }
  function reset() {
    window.clearTimeout(timer.current);
    window.clearTimeout(replayTimer.current);
    lock.current = false;
    setSession({ ...newSession(), started: true });
    setKind("subtract");
    setAmount("");
    setTarget("both");
    setCheckValue("");
    setAnswer("");
    setFeedback(null);
    setHintVisible(false);
    setTransferWrong(false);
    setOverride(null);
    setBusy(false);
    setResetOpen(false);
    setRevision((n) => n + 1);
    setCorrupt(false);
  }

  return (
    <div
      className={`${styles.app} ${presenting ? styles.presenting : ""}`}
      data-testid="equation-village"
      data-stage={
        complete
          ? "complete"
          : session.transferOpen
            ? "transfer"
            : restored
              ? "restored"
              : session.started
                ? "repair"
                : "welcome"
      }
    >
      <header className={styles.masthead}>
        <div>
          <span className={styles.location}>
            <span aria-hidden="true">⌁</span> {c.place}
          </span>
          <h2>{c.harbour}</h2>
        </div>
        <div className={styles.tools}>
          <button
            type="button"
            onClick={() => setSound((v) => !v)}
            aria-pressed={sound}
          >
            {sound ? c.soundOn : c.soundOff}
          </button>
          <details className={styles.options}>
            <summary>{c.options}</summary>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={quiet}
                  onChange={(e) => setQuiet(e.target.checked)}
                />
                {c.quiet}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={simple}
                  onChange={(e) => setSimple(e.target.checked)}
                />
                {c.simple}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={gentle || systemGentle}
                  disabled={systemGentle}
                  onChange={(e) => setGentle(e.target.checked)}
                />
                {c.gentle}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={lowQuality}
                  onChange={(e) => setLowQuality(e.target.checked)}
                />
                {c.low}
              </label>
            </div>
          </details>
        </div>
      </header>
      <div className={styles.layout}>
        <section className={styles.world} aria-label={c.sceneLabel}>
          <div
            className={styles.scene}
            data-testid="village-scene"
            data-renderer={
              simple || unavailable
                ? "illustration"
                : sceneReady
                  ? "3d"
                  : "loading"
            }
          >
            {simple || unavailable ? (
              <SimpleHarbour restored={restored} />
            ) : (
              <HarbourScene
                className={styles.canvas}
                leftX={rationalValue(shown.left.x)}
                leftUnits={rationalValue(shown.left.unit)}
                rightX={rationalValue(shown.right.x)}
                rightUnits={rationalValue(shown.right.unit)}
                restored={restored}
                reducedMotion={reduceMotion}
                paused={quiet}
                lowQuality={lowQuality}
                revision={revision}
                operation={lastMove?.kind ?? null}
                onUnavailable={onUnavailable}
                onReady={onReady}
              />
            )}
            {!sceneReady && !simple && !unavailable && (
              <span className={styles.loading}>{c.sceneLoading}</span>
            )}
            <div className={styles.sceneBadge}>
              <span aria-hidden="true">{restored ? "✓" : "⌁"}</span>
              {restored ? c.restored : c.missionCount}
            </div>
            {session.started && !session.transferOpen && (
              <div
                className={styles.equationFloat}
                data-testid="village-equation"
                data-equation={equationLatex(shown)}
              >
                <Formula>{equationLatex(shown)}</Formula>
              </div>
            )}
          </div>
          {unavailable && <p className={styles.notice}>{c.noWebgl}</p>}
          {(simple || unavailable) &&
            session.started &&
            !session.transferOpen && (
              <div className={styles.trays} role="group" aria-label={c.trays}>
                <div>
                  <span>{c.leftTray}</span>
                  <Tokens x={shown.left.x} unit={shown.left.unit} />
                </div>
                <b aria-hidden="true">=</b>
                <div>
                  <span>{c.rightTray}</span>
                  <Tokens x={shown.right.x} unit={shown.right.unit} />
                </div>
              </div>
            )}
          <div className={styles.caption}>
            <span className={styles.characterMark} aria-hidden="true">
              P
            </span>
            <div>
              <strong>{c.keeper}</strong>
              <p>
                {restored
                  ? c.restoredBody
                  : session.started
                    ? c.cellLegend
                    : c.goal}
              </p>
            </div>
          </div>
          {session.started && !session.transferOpen && (
            <p className={styles.legend}>
              <span className={styles.legendCell} aria-hidden="true">
                x
              </span>
              {c.cellLegend}
              <br />
              <span className={styles.legendUnit} aria-hidden="true">
                +1
              </span>
              {c.tokenLegend}
            </p>
          )}
        </section>

        <section className={styles.notebook} aria-label={c.notebook}>
          {!session.started ? (
            <div className={styles.welcome}>
              <span className={styles.missionIcon} aria-hidden="true">
                ⌁
              </span>
              <h3>{c.greeting}</h3>
              <p>{c.welcome}</p>
              <div className={styles.startEquation}>
                <Formula>{equationLatex(BRIDGE_EQUATION)}</Formula>
              </div>
              <button
                type="button"
                className={styles.primary}
                disabled={!hydrated}
                onClick={() => {
                  setSession((s) => ({ ...s, started: true }));
                  setCorrupt(false);
                }}
              >
                {c.start}
              </button>
              <p className={styles.small}>{c.introNote}</p>
            </div>
          ) : complete ? (
            <div data-testid="village-result" className={styles.result}>
              <div className={styles.medallion} aria-hidden="true">
                ✓
              </div>
              <h3>{c.resultTitle}</h3>
              <p>{c.resultBody}</p>
              <ul>
                <li>
                  {session.hints === 0 && session.mistakes === 0
                    ? c.independentBridge
                    : c.supportedBridge}
                </li>
                <li>
                  {session.transferMistakes === 0
                    ? c.independentTransfer
                    : c.supportedTransfer}
                </li>
              </ul>
              <Formula display>{`x = ${session.transferAnswer}`}</Formula>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={reset}
              >
                {c.replayGame}
              </button>
            </div>
          ) : session.transferOpen ? (
            <div
              className={styles.transfer}
              data-testid="village-transfer"
              data-equation={equationLatex(transfer)}
            >
              <h3>{c.transferTitle}</h3>
              <p>{c.transferIntro}</p>
              <div className={styles.transferEquation}>
                <Formula display>{equationLatex(transfer)}</Formula>
              </div>
              {transferWrong && (
                <div className={styles.correction} role="status">
                  <strong>{c.transferWorked}</strong>
                  <p>
                    {session.transferIndex === 0
                      ? c.transferCorrection
                      : c.retryCorrection}
                  </p>
                  <Formula display>
                    {session.transferIndex === 0
                      ? "\\begin{aligned}3x+2&=17\\\\3x&=15\\\\x&=5\\end{aligned}"
                      : "\\begin{aligned}2x+5&=17\\\\2x&=12\\\\x&=6\\end{aligned}"}
                  </Formula>
                </div>
              )}
              {transferWrong && session.transferIndex === 0 ? (
                <button
                  className={styles.primary}
                  type="button"
                  onClick={() => {
                    setSession((s) => ({ ...s, transferIndex: 1 }));
                    setTransferWrong(false);
                    setAnswer("");
                    setFeedback(null);
                  }}
                >
                  {c.similar}
                </button>
              ) : (
                <form onSubmit={checkTransfer} className={styles.checkForm}>
                  <label htmlFor="village-transfer-answer">{c.yourValue}</label>
                  <div>
                    <input
                      id="village-transfer-answer"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      maxLength={40}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <button className={styles.primary} disabled={busy}>
                      {c.checkAnswer}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className={styles.paperHeading}>
                <span className={styles.small}>{c.notebook}</span>
                <h3>{restored ? c.restored : c.rule}</h3>
              </div>
              <ol
                ref={ledger}
                className={styles.ledger}
                data-testid="village-ledger"
                data-long={working.length > 4}
              >
                {working.map((step, i) => (
                  <li
                    key={i}
                    aria-current={
                      i === working.length - (override ? 2 : 1)
                        ? "step"
                        : undefined
                    }
                  >
                    <span>
                      {i === 0 ? c.original : reason(session.moves[i - 1])}
                    </span>
                    <Formula>{equationLatex(step)}</Formula>
                  </li>
                ))}
              </ol>
              {restored ? (
                <div className={styles.restoredPanel}>
                  <Formula display>
                    {"2(4) + 3 = 11 \\quad \\checkmark"}
                  </Formula>
                  <p>{c.checked}</p>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={busy}
                    onClick={() => {
                      setSession((s) => ({ ...s, transferOpen: true }));
                      setFeedback(null);
                    }}
                  >
                    {c.next}
                  </button>
                </div>
              ) : solved ? (
                <form onSubmit={verify} className={styles.checkForm}>
                  <h4>{c.checkTitle}</h4>
                  <p>{c.hintCheck}</p>
                  <label htmlFor="village-check-value">{c.value}</label>
                  <input
                    id="village-check-value"
                    type="text"
                    inputMode="text"
                    value={checkValue}
                    onChange={(e) => setCheckValue(e.target.value)}
                    maxLength={40}
                    autoComplete="off"
                  />
                  <button className={styles.primary} disabled={busy}>
                    {c.check}
                  </button>
                </form>
              ) : (
                <form onSubmit={apply}>
                  <fieldset className={styles.operationPicker}>
                    <legend>{c.operation}</legend>
                    <div>
                      {kinds.map((k) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={kind === k}
                          onClick={() => {
                            setKind(k);
                            amountInput.current?.focus();
                          }}
                          disabled={busy}
                        >
                          <b aria-hidden="true">{operationSymbols[k]}</b>
                          {c.operations[k]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className={styles.inputRow}>
                    <label>
                      {c.amount}
                      <input
                        ref={amountInput}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        maxLength={40}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={busy}
                        aria-describedby="village-amount-help"
                      />
                    </label>
                    <label>
                      {c.applyTo}
                      <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={busy}
                      >
                        <option value="both">{c.both}</option>
                        <option value="left">{c.leftOnly}</option>
                        <option value="right">{c.rightOnly}</option>
                      </select>
                    </label>
                  </div>
                  <p className={styles.small} id="village-amount-help">
                    {c.amountHint}
                  </p>
                  <button className={styles.primary} disabled={busy}>
                    {busy ? c.moving : c.apply}
                  </button>
                </form>
              )}
              {!restored && (
                <div className={styles.secondaryActions}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (!hintVisible)
                        setSession((s) => ({ ...s, hints: s.hints + 1 }));
                      setHintVisible(true);
                    }}
                  >
                    {c.hint}
                  </button>
                  <button
                    type="button"
                    disabled={busy || session.moves.length === 0}
                    onClick={undo}
                  >
                    {c.undo}
                  </button>
                </div>
              )}
              {hintVisible && !restored && (
                <div className={styles.hint} role="status">
                  {nextHint(equation)}
                </div>
              )}
              {lastMove && (
                <button
                  type="button"
                  className={styles.replay}
                  onClick={replay}
                  disabled={busy}
                >
                  {c.replay}
                </button>
              )}
            </>
          )}
          {feedback && (
            <div
              className={
                feedback.error ? styles.feedbackError : styles.feedback
              }
              role={feedback.error ? "alert" : "status"}
              data-testid="village-feedback"
            >
              {feedback.text}
              {feedback.text === c.sameSides && (
                <div className={styles.matching}>
                  <span>
                    {operationSymbols[feedback.attempt?.kind ?? kind]}{" "}
                    {feedback.attempt?.amount ?? amount}
                  </span>
                  <b>=</b>
                  <span>
                    {operationSymbols[feedback.attempt?.kind ?? kind]}{" "}
                    {feedback.attempt?.amount ?? amount}
                  </span>
                  <small>{c.sameSidesVisual}</small>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <footer className={styles.footer}>
        <div>
          <p role="status">{saveNote}</p>
          {corrupt && <p role="status">{c.storageCorrupt}</p>}
        </div>
        {session.started && !complete && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setResetOpen(true)}
          >
            {c.repairAgain}
          </button>
        )}
      </footer>
      <details className={styles.teacher}>
        <summary>{c.teacherTitle}</summary>
        <p>{c.teacherText}</p>
        <p>{c.supportNote}</p>
      </details>
      {resetOpen && (
        <div
          className={styles.resetPanel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="village-reset-title"
        >
          <h3 id="village-reset-title">{c.resetTitle}</h3>
          <p>{c.resetBody}</p>
          <div>
            <button type="button" className={styles.primary} onClick={reset}>
              {c.resetConfirm}
            </button>
            <button type="button" onClick={() => setResetOpen(false)}>
              {c.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
