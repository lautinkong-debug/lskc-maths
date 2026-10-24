"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { Math as MathNotation } from "@/components/Math";
import { JoinQR } from "@/components/challenges/JoinQR";
import { Working } from "@/apps/polynomials/quest/Working";
import { expressionTex } from "@/apps/polynomials/algebra";
import type { RoomView, MatchSummary } from "@/lib/polynomial-tug/types";
import questStyles from "@/apps/polynomials/quest/quest.module.css";
import { Rope } from "./Rope";
import { SkillTray } from "./SkillTray";
import styles from "./Tug.module.css";
const c = copy.polynomialTug,
  qcopy = copy.polynomialQuest;
const subscribeOrigin = () => () => {};
const readOrigin = () => window.location.origin;
const serverOrigin = () => "";
async function call(
  body?: Record<string, unknown>,
  code?: string,
): Promise<RoomView> {
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  const response = await fetch(
    `/api/polynomial-tug${body ? "" : `?code=${encodeURIComponent(code!)}`}`,
    {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.message || c.errors.connection), {
      retryAfter: Number(response.headers.get("Retry-After")) || 0,
    });
  return result.state;
}
function PairStatus({ match, side }: { match: MatchSummary; side: number }) {
  const pair = match.pairs[side];
  return (
    <section className={styles.pairStatus} data-side={side}>
      <h3>
        {c.pair(side)} <span>{c.level(pair.level)}</span>
      </h3>
      <strong>{c.power(pair.power)}</strong>
      <div className={styles.readyList}>
        {[0, 1].map((i) => (
          <span key={i} data-ready={pair.ready[i]}>
            {c.seat(i)}:{" "}
            {match.waiting?.[side * 2 + i]
              ? c.waitingRound
              : pair.advancing[i]
                ? c.nextReady
                : pair.ready[i]
                  ? c.ready
                  : match.occupied[side * 2 + i]
                    ? c.thinking
                    : c.emptySeat}
          </span>
        ))}
      </div>
    </section>
  );
}
function result(match: MatchSummary, closed: boolean) {
  if (
    !match.occupied.slice(0, 2).some(Boolean) ||
    !match.occupied.slice(2).some(Boolean)
  )
    return c.practiceComplete;
  const winner =
    match.winner ??
    (closed
      ? match.position === 0
        ? null
        : match.position < 0
          ? 0
          : 1
      : null);
  return winner === null ? c.draw : c.win(winner);
}
export default function Tug({ initialCode = "" }: { initialCode?: string }) {
  const { role, loading } = useAuth();
  const [code, setCode] = useState(initialCode),
    [entry, setEntry] = useState(initialCode),
    [groups, setGroups] = useState(8),
    [state, setState] = useState<RoomView | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [offline, setOffline] = useState(false),
    [ending, setEnding] = useState(false),
    [hint, setHint] = useState("");
  const origin = useSyncExternalStore(
    subscribeOrigin,
    readOrigin,
    serverOrigin,
  );
  const codeRef = useRef(initialCode),
    busyRef = useRef(false),
    focus = useRef<HTMLHeadingElement>(null),
    mounted = useRef(true);
  const teacher = role === "teacher" || role === "admin";
  const open = useCallback((value: string) => {
    const normal = value.trim().toUpperCase();
    codeRef.current = normal;
    setCode(normal);
    setEntry(normal);
    setState(null);
    setError("");
    setOffline(false);
    setEnding(false);
    setHint("");
    window.history.replaceState(
      null,
      "",
      normal ? `?room=${encodeURIComponent(normal)}` : window.location.pathname,
    );
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const accept = useCallback((next: RoomView) => {
    if (!mounted.current || next.code !== codeRef.current) return;
    setState((old) => {
      if (
        old?.code === next.code &&
        (Boolean(old.you && !next.you) ||
          next.revision < old.revision ||
          (next.match &&
            old.match &&
            next.match.revision < old.match.revision) ||
          next.groups.some(
            (g, i) => g.revision < (old.groups[i]?.revision ?? 0),
          ))
      )
        return old;
      return next;
    });
    setOffline(false);
  }, []);
  useEffect(() => {
    if (!code || loading) return;
    let cancelled = false,
      failures = 0,
      timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      let delay = 3000;
      if (!document.hidden)
        try {
          const next = await call(undefined, code);
          if (!cancelled) {
            accept(next);
            setError("");
            failures = 0;
            if (
              next.status === "closed" ||
              (next.role === "student" &&
                next.match &&
                next.match.winner !== null)
            )
              return;
            if (next.status === "lobby") delay = 5000;
          }
        } catch (cause) {
          if (!cancelled) {
            failures++;
            delay = Math.max(
              Math.min(30000, 3000 * 2 ** Math.min(failures, 4)),
              ((cause as { retryAfter?: number })?.retryAfter ?? 0) * 1000,
            );
            setOffline(true);
            setError(
              cause instanceof Error ? cause.message : c.errors.connection,
            );
          }
        }
      if (!cancelled) timer = setTimeout(poll, delay);
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, loading, accept]);
  const command = async (
    action: string,
    extra: Record<string, unknown> = {},
  ) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    const requestedCode = codeRef.current;
    try {
      const next = await call({ action, code: requestedCode, ...extra });
      if (!mounted.current || requestedCode !== codeRef.current) return;
      if (action === "create") {
        codeRef.current = next.code;
        setCode(next.code);
        window.history.replaceState(null, "", `?room=${next.code}`);
      }
      if (action === "create" || requestedCode === codeRef.current)
        accept(next);
    } catch (cause) {
      if (mounted.current && requestedCode === codeRef.current)
        setError(cause instanceof Error ? cause.message : c.errors.connection);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const player = state?.player,
    me = state?.you,
    match = state && me ? state.match : null;
  const phase = player?.phase,
    qid = player?.question.id;
  useEffect(() => {
    if (phase && phase !== "answering")
      focus.current?.focus({ preventScroll: true });
  }, [phase, qid]);
  const closed = state?.status === "closed",
    finished = !!match && (match.winner !== null || closed);
  return (
    <main className={styles.page} data-teacher={state?.role === "teacher"}>
      <header className={styles.header}>
        <div>
          <Link href="/apps/polynomials#play">{c.back}</Link>
          <h1>{c.title}</h1>
          <p>{c.subtitle}</p>
        </div>
        {code && (
          <button
            className={styles.quiet}
            disabled={busy}
            onClick={() => open("")}
          >
            {c.newRoom}
          </button>
        )}
      </header>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {offline && state && <p role="status">{c.reconnect}</p>}
      {!code && (
        <>
          <section className={styles.previewArena}>
            <div>
              <h2>{c.arenaIntro}</h2>
              <p className={styles.intro}>{c.intro}</p>
            </div>
            <Rope />
          </section>
          <div className={styles.setup}>
            <section>
              <h2>{c.joinTitle}</h2>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  open(entry);
                }}
              >
                <label>
                  {c.code}
                  <input
                    value={entry}
                    onChange={(e) => setEntry(e.target.value.toUpperCase())}
                    maxLength={6}
                    autoComplete="off"
                    required
                    pattern="[A-HJ-KM-NP-Z2-9]{6}"
                  />
                </label>
                <button
                  className={styles.primary}
                  type="submit"
                  disabled={loading}
                >
                  {c.open}
                </button>
              </form>
            </section>
            <section>
              <h2>{c.setup}</h2>
              {teacher ? (
                <>
                  <label>
                    {c.groups}
                    <select
                      value={groups}
                      onChange={(e) => setGroups(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>{c.capacity(groups)}</p>
                  <button
                    className={styles.primary}
                    disabled={busy}
                    onClick={() => void command("create", { groups })}
                  >
                    {c.create}
                  </button>
                </>
              ) : (
                <>
                  <p>{c.teacherSignIn}</p>
                  <Link href="/login">{c.signIn}</Link>
                </>
              )}
            </section>
          </div>
          <p className={styles.rules}>
            {c.rules} {c.flexible}
          </p>
          <ol className={styles.levels}>
            {c.levels.map((name, i) => (
              <li key={name}>
                <strong>{c.level(i + 1)}</strong>
                <span>{name}</span>
                <b>{c.power(i + 1)}</b>
              </li>
            ))}
          </ol>
        </>
      )}
      {code && !state && !error && <p role="status">{c.loading}</p>}
      {state?.role === "teacher" && (
        <>
          <section className={styles.roomHeader}>
            <div>
              <h2>{c.overview}</h2>
              <p>{c.code}</p>
              <strong className={styles.code} data-testid="tug-code">
                {state.code}
              </strong>
              <p>
                {c.players(
                  state.groups.flatMap((g) => g.occupied).filter(Boolean)
                    .length,
                  state.groupCount * 4,
                )}
              </p>
              <p>{c[state.status]}</p>
              {state.status === "lobby" && (
                <p className={styles.flexibleNote}>{c.flexible}</p>
              )}
            </div>
            <div className={styles.qr}>
              <JoinQR url={`${origin}/polynomial-tug?room=${state.code}`} />
            </div>
            <div className={styles.controls}>
              {state.status === "lobby" && (
                <button
                  className={styles.primary}
                  disabled={
                    busy || !state.groups.some((g) => g.occupied.some(Boolean))
                  }
                  onClick={() => void command("start")}
                >
                  {c.start}
                </button>
              )}
              {state.status === "live" && (
                <button
                  className={styles.primary}
                  disabled={busy}
                  onClick={() => void command("pause")}
                >
                  {c.pause}
                </button>
              )}
              {state.status === "paused" && (
                <button
                  className={styles.primary}
                  disabled={busy}
                  onClick={() => void command("resume")}
                >
                  {c.resume}
                </button>
              )}
              {!closed && (
                <button
                  className={styles.secondary}
                  onClick={() => setEnding(true)}
                >
                  {c.end}
                </button>
              )}
            </div>
          </section>
          {ending && (
            <div className={styles.confirm} role="alert">
              <p>{c.confirmEnd}</p>
              <button
                disabled={busy}
                className={styles.primary}
                onClick={() => {
                  setEnding(false);
                  void command("end");
                }}
              >
                {c.endYes}
              </button>
              <button className={styles.quiet} onClick={() => setEnding(false)}>
                {c.cancel}
              </button>
            </div>
          )}
          <div className={styles.matches}>
            {state.groups.map((game, i) => (
              <article key={i} className={styles.match}>
                <h2>
                  {c.group(i + 1)}{" "}
                  <span className={styles.modeBadge}>
                    {c.matchMode(
                      game.occupied.slice(0, 2).filter(Boolean).length,
                      game.occupied.slice(2).filter(Boolean).length,
                    )}
                  </span>
                </h2>
                <Rope match={game} />
                {(game.winner !== null || closed) && (
                  <p className={styles.winner}>{result(game, !!closed)}</p>
                )}
                <div className={styles.pairs}>
                  {[0, 1].map((side) => (
                    <PairStatus key={side} side={side} match={game} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {state?.role === "student" && !me && (
        <section>
          <h2>
            {c.joinTitle} · {state.code}
          </h2>
          <p>{closed ? c.closed : c.choosePair}</p>
          <div className={styles.joinGroups}>
            {state.groups.map((game, g) => (
              <article key={g}>
                <h3>{c.group(g + 1)}</h3>
                {[0, 1].map((side) => (
                  <button
                    key={side}
                    className={styles.joinPair}
                    disabled={
                      busy ||
                      closed ||
                      game.winner !== null ||
                      game.occupied.slice(side * 2, side * 2 + 2).every(Boolean)
                    }
                    aria-label={c.joinPair(g + 1, side)}
                    onClick={() => void command("join", { group: g, side })}
                  >
                    <strong>{c.pair(side)}</strong>
                    <span>
                      {
                        game.occupied
                          .slice(side * 2, side * 2 + 2)
                          .filter(Boolean).length
                      }{" "}
                      / 2
                    </span>
                    <span>
                      {game.occupied
                        .slice(side * 2, side * 2 + 2)
                        .every(Boolean)
                        ? c.full
                        : c.join}
                    </span>
                  </button>
                ))}
              </article>
            ))}
          </div>
        </section>
      )}
      {state?.role === "student" && me && match && (
        <section className={styles.student}>
          <div className={styles.studentHeader}>
            <h2>
              {c.group(me.group + 1)} · {c.pair(Math.floor(me.seat / 2))} ·{" "}
              {c.seat(me.seat % 2)}
            </h2>
            <p role="status">{c[state.status]}</p>

            <span className={styles.modeBadge}>
              {c.matchMode(
                match.occupied.slice(0, 2).filter(Boolean).length,
                match.occupied.slice(2).filter(Boolean).length,
              )}
            </span>
          </div>
          <Rope match={match} />
          <div className={styles.pairs}>
            {[0, 1].map((side) => (
              <PairStatus key={side} side={side} match={match} />
            ))}
          </div>
          {finished ? (
            <div className={styles.result}>
              <h2>{result(match, !!closed)}</h2>
              <p>{c.result}</p>
            </div>
          ) : phase === "waiting" ? (
            <div className={styles.waiting}>
              <h3>{c.waitingRound}</h3>
              <p>{c.waitingRoundDetail}</p>
            </div>
          ) : state.status === "lobby" ? (
            <p className={styles.rules}>{c.rules}</p>
          ) : (
            player && (
              <div className={styles.playArea}>
                <aside className={styles.levelCard}>
                  <h3>{c.level(match.pairs[Math.floor(me.seat / 2)].level)}</h3>
                  <p>
                    {c.levels[match.pairs[Math.floor(me.seat / 2)].level - 1]}
                  </p>
                  <strong>
                    {c.power(match.pairs[Math.floor(me.seat / 2)].power)}
                  </strong>
                  <p>
                    {match.pairs[Math.floor(me.seat / 2)].level === 4
                      ? c.maxLevel
                      : c.progress(
                          match.pairs[Math.floor(me.seat / 2)].pulls % 3,
                        )}
                  </p>
                  <p>{c.goal}</p>
                  <SkillTray
                    pair={match.pairs[Math.floor(me.seat / 2)]}
                    disabled={busy || offline || state.status !== "live"}
                    onActivate={(skill) =>
                      void command("skill", { questionId: qid, skill })
                    }
                  />
                </aside>
                <section
                  id="tug-question-panel"
                  className={`${styles.questionPanel} ${questStyles.quest}`}
                >
                  <a className={styles.skillJump} href="#team-skills">
                    {c.skillJump(match.pairs[Math.floor(me.seat / 2)].energy)}
                  </a>
                  <h3>{c.choose}</h3>
                  <div
                    className={styles.expression}
                    data-testid="tug-question"
                    data-source={player.question.source}
                  >
                    <MathNotation>
                      {expressionTex(player.question.source)}
                    </MathNotation>
                  </div>
                  <p>{c.choiceHint}</p>
                  <div className={styles.options}>
                    {player.question.choices.map((source, i) => (
                      <button
                        key={`${qid}-${i}`}
                        className={styles.option}
                        data-testid="tug-choice"
                        data-source={source}
                        data-selected={
                          player.feedback?.selected === i || undefined
                        }
                        data-correct={
                          player.feedback?.correctOption === i || undefined
                        }
                        disabled={
                          busy ||
                          offline ||
                          state.status !== "live" ||
                          phase !== "answering"
                        }
                        onClick={() =>
                          void command("answer", { questionId: qid, option: i })
                        }
                      >
                        <span className={styles.letter}>
                          {qcopy.choiceLetters[i]}
                        </span>
                        <MathNotation>{expressionTex(source)}</MathNotation>
                        {player.feedback &&
                          (player.feedback.selected === i ||
                            player.feedback.correctOption === i) && (
                            <small>
                              {player.feedback.selected === i
                                ? c.yourChoice
                                : ""}{" "}
                              {player.feedback.correctOption === i
                                ? c.correctAnswer
                                : ""}
                            </small>
                          )}
                      </button>
                    ))}
                  </div>
                  {phase === "answering" && (
                    <>
                      <button
                        className={styles.quiet}
                        onClick={() => setHint(qid!)}
                      >
                        {c.hint}
                      </button>
                      {hint === qid && (
                        <p className={styles.hint}>
                          {qcopy.hints[player.question.hint]}
                        </p>
                      )}
                    </>
                  )}
                  {player.feedback && (
                    <section className={styles.feedback}>
                      <h3 ref={focus} tabIndex={-1} role="status">
                        {phase === "correct" ? c.correct : c.wrong}
                      </h3>
                      {phase === "wrong" ? (
                        <>
                          <button
                            className={styles.primary}
                            disabled={
                              busy || offline || state.status !== "live"
                            }
                            onClick={() =>
                              void command("retry", { questionId: qid })
                            }
                          >
                            {c.retry}
                          </button>
                          <Working question={player.feedback.question} />
                        </>
                      ) : (
                        <>
                          <p>
                            {match.pairs[Math.floor(me.seat / 2)].resolved
                              ? c.pullDone(
                                  match.pairs[Math.floor(me.seat / 2)]
                                    .lastPower,
                                )
                              : c.waitPartner}
                          </p>
                          {match.pairs[Math.floor(me.seat / 2)].lastBlocked >
                            0 && (
                            <p>
                              {c.blocked(
                                match.pairs[Math.floor(me.seat / 2)]
                                  .lastBlocked,
                              )}
                            </p>
                          )}
                          {match.pairs[Math.floor(me.seat / 2)].resolved &&
                            (match.pairs[Math.floor(me.seat / 2)].advancing[
                              me.seat % 2
                            ] ? (
                              <p>{c.waitNext}</p>
                            ) : (
                              <button
                                className={styles.primary}
                                disabled={
                                  busy || offline || state.status !== "live"
                                }
                                onClick={() =>
                                  void command("next", { questionId: qid })
                                }
                              >
                                {c.next}
                              </button>
                            ))}
                          <details>
                            <summary>{c.working}</summary>
                            <Working question={player.feedback.question} />
                          </details>
                        </>
                      )}
                    </section>
                  )}
                </section>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}
