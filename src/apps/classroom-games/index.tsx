"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { classroomGamePlayerCopy as words } from "@/lib/copy";
import {
  games,
  gameIds,
  gameOrigin,
  gameUrl,
  teacherUrl,
  spacecraftText,
  type EmbeddedGame,
  type GameSetup,
} from "./games";
import { makeMathsBank, parseBank, forThreeLanes } from "./questions";
import styles from "./games.module.css";

type Session = { id: EmbeddedGame; payload: GameSetup };
const defaultDraft = {
  custom: false,
  raw: "",
  seconds: "",
  left: "",
  right: "",
  lead: "3",
};
type Draft = typeof defaultDraft;

function readDraft(id: EmbeddedGame): Draft {
  try {
    const saved = JSON.parse(
      localStorage.getItem("lskc.classroom-games." + id) || "{}",
    );
    const text = (key: keyof Draft) =>
      typeof saved?.[key] === "string" ? (saved[key] as string) : "";
    return {
      custom: saved?.custom === true,
      raw: text("raw"),
      seconds: text("seconds"),
      left: text("left"),
      right: text("right"),
      lead: text("lead") || "3",
    };
  } catch {
    return { ...defaultDraft };
  }
}

function Setup({
  id,
  onBack,
  onStart,
}: {
  id: EmbeddedGame;
  onBack: () => void;
  onStart: (s: Session) => void;
}) {
  const [draft, setDraft] = useState(() => readDraft(id));
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const timed = id === "archery" || id === "spacecraft" || id === "tank";
  const minOptions = id === "spacecraft" ? 3 : 4;
  function update(patch: Partial<Draft>) {
    setError("");
    setDraft((prev) => ({ ...prev, ...patch }));
  }
  function start(event: FormEvent) {
    event.preventDefault();
    try {
      const bank = draft.custom
        ? parseBank(draft.raw, minOptions)
        : makeMathsBank(games[id].count);
      if (id === "tug" && bank.length < 2) throw new Error(words.minTug);
      const payload: GameSetup = {
        type: "INIT_QUESTIONS",
        language: "en",
        questions:
          id === "spacecraft"
            ? bank.map(forThreeLanes).map(spacecraftText)
            : bank,
      };
      if (timed)
        payload.answerTimeSeconds = draft.seconds
          ? Number(draft.seconds)
          : null;
      if (id === "race") payload.answerTimeSeconds = 14;
      if (id === "tug") {
        payload.teams = [
          { name: draft.left.trim() || words.leftDefault, color: "#e84b46" },
          { name: draft.right.trim() || words.rightDefault, color: "#2766d5" },
        ];
        payload.winCondition = {
          type: "rope_threshold",
          value: Number(draft.lead),
        };
      }
      try {
        localStorage.setItem(
          "lskc.classroom-games." + id,
          JSON.stringify(draft),
        );
      } catch {
        /* Storage is optional. */
      }
      onStart({ id, payload });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : words.invalid);
    }
  }
  return (
    <section className={styles.setup}>
      <button type="button" className={styles.link} onClick={onBack}>
        ← {words.menu}
      </button>
      <h2 ref={heading} tabIndex={-1}>
        {words.games[id].name}
      </h2>
      <p>{words.games[id].description}</p>
      <form onSubmit={start}>
        <label>
          {words.bank}
          <select
            value={draft.custom ? "custom" : "sample"}
            onChange={(e) => update({ custom: e.target.value === "custom" })}
          >
            <option value="sample">
              {words.sample} ({games[id].count})
            </option>
            <option value="custom">{words.custom}</option>
          </select>
        </label>
        {draft.custom && (
          <div>
            <label htmlFor="cg-bank">{words.questions}</label>
            <p id="cg-format" className={styles.hint}>
              {words.format} {id === "spacecraft" && words.formatThree}
            </p>
            <textarea
              id="cg-bank"
              rows={5}
              value={draft.raw}
              aria-describedby="cg-format"
              placeholder={words.example}
              onChange={(e) => update({ raw: e.target.value })}
            />
            <label>
              {words.file}
              <input
                type="file"
                accept=".txt,.json,text/plain,application/json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    const raw = await file.text();
                    parseBank(raw, minOptions);
                    update({ raw });
                  } catch (cause) {
                    setError(
                      cause instanceof Error
                        ? cause.message
                        : words.importFailed,
                    );
                  }
                }}
              />
            </label>
          </div>
        )}
        {timed && (
          <label>
            {words.timer}
            <input
              type="number"
              min={5}
              max={300}
              value={draft.seconds}
              onChange={(e) => update({ seconds: e.target.value })}
            />
          </label>
        )}
        {id === "tug" && (
          <div className={styles.teamFields}>
            <label>
              {words.teamOne}
              <input
                maxLength={24}
                placeholder={words.leftDefault}
                value={draft.left}
                onChange={(e) => update({ left: e.target.value })}
              />
            </label>
            <label>
              {words.teamTwo}
              <input
                maxLength={24}
                placeholder={words.rightDefault}
                value={draft.right}
                onChange={(e) => update({ right: e.target.value })}
              />
            </label>
            <label>
              {words.lead}
              <input
                type="number"
                min={2}
                max={9}
                required
                value={draft.lead}
                onChange={(e) => update({ lead: e.target.value })}
              />
            </label>
          </div>
        )}
        {draft.custom && <p className={styles.hint}>{words.localNote}</p>}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button className={styles.primary}>{words.play}</button>
      </form>
    </section>
  );
}

function Player({ session, onBack }: { session: Session; onBack: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<"loading" | "slow" | "ready" | "ended">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [full, setFull] = useState(false);
  const [fullError, setFullError] = useState("");
  useEffect(() => {
    const child = frame.current;
    if (!child) return;
    const timeout = window.setTimeout(() => setPhase("slow"), 60000);
    function handle(event: MessageEvent) {
      if (
        event.origin !== gameOrigin ||
        event.source !== child?.contentWindow ||
        !event.data
      )
        return;
      if (
        event.data.type === "GAME_READY" ||
        event.data.type === "GAME_RESTART"
      ) {
        window.clearTimeout(timeout);
        child.contentWindow?.postMessage(session.payload, gameOrigin);
        setPhase("ready");
      } else if (event.data.type === "GAME_END") {
        window.clearTimeout(timeout);
        setPhase("ended");
      }
    }
    window.addEventListener("message", handle);
    child.src = gameUrl(session.id, window.location.origin);
    child.focus();
    return () => {
      window.removeEventListener("message", handle);
      window.clearTimeout(timeout);
    };
  }, [session, attempt]);
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  function reload() {
    setPhase("loading");
    setAttempt((n) => n + 1);
  }
  return (
    <section ref={stage} className={styles.player}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.link}
          onClick={() => {
            if (phase !== "ready" || window.confirm(words.leave)) onBack();
          }}
        >
          ← {words.menu}
        </button>
        <h2>{words.games[session.id].name}</h2>
        {(phase === "ended" || phase === "slow") && (
          <button type="button" className={styles.action} onClick={reload}>
            {phase === "ended" ? words.again : words.retry}
          </button>
        )}
        <button
          type="button"
          className={styles.action}
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await stage.current?.requestFullscreen();
              setFullError("");
              frame.current?.focus();
            } catch {
              setFullError(words.fullFailed);
            }
          }}
        >
          {full ? words.exitFull : words.full}
        </button>
      </div>
      <iframe
        key={attempt}
        ref={frame}
        title={words.games[session.id].name}
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        referrerPolicy="no-referrer"
      />
      <div role="status" className={styles.hint}>
        {phase === "loading" && words.loading}
        {phase === "slow" && (
          <>
            {words.slow}{" "}
            <a
              className={styles.link}
              href={gameUrl(session.id)}
              target="_blank"
              rel="noreferrer"
            >
              {words.fallback}
            </a>
          </>
        )}
        {fullError}
      </div>
    </section>
  );
}

export default function ClassroomGames() {
  const [choice, setChoice] = useState<EmbeddedGame | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  function back() {
    const previous = choice;
    setSession(null);
    setChoice(null);
    requestAnimationFrame(() =>
      document.getElementById("cg-open-" + previous)?.focus(),
    );
  }
  if (session) return <Player session={session} onBack={back} />;
  if (choice)
    return (
      <Setup key={choice} id={choice} onBack={back} onStart={setSession} />
    );
  return (
    <div className={styles.library}>
      <div className={styles.grid}>
        {gameIds.map((id) => (
          <article key={id} className={styles.card}>
            <Image
              src={`/classroom-games/${id}.jpg`}
              width={640}
              height={360}
              unoptimized
              alt=""
              className={styles.preview}
            />
            <div className={styles.body}>
              <h2>{words.games[id].name}</h2>
              <p>{words.games[id].description}</p>
              {id === "ink" ? (
                <>
                  <a
                    className={styles.primary}
                    href={gameUrl(id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {words.openInk} ↗
                  </a>
                  <small>
                    {words.inkNote}{" "}
                    <a
                      className={styles.link}
                      href={teacherUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {words.teacherInk}
                    </a>
                  </small>
                </>
              ) : (
                <button
                  className={styles.primary}
                  type="button"
                  id={"cg-open-" + id}
                  aria-label={words.setup + " · " + words.games[id].name}
                  onClick={() => setChoice(id)}
                >
                  {words.setup}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className={styles.credit}>{words.attribution}</p>
    </div>
  );
}
