"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { usePresentation } from "@/components/PresentationFrame";
import { Battle } from "./Battle";
import { Guardian } from "./Guardian";
import {
  newSession,
  starsFor,
  transition,
  type Action,
  type Session,
} from "./session";
import {
  blankProgress,
  loadProgress,
  recordResult,
  STORAGE_KEY,
  type StoredProgress,
} from "./progress";
import type { Stage } from "./questions";
import styles from "./quest.module.css";
const c = copy.polynomialQuest;

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars} aria-label={c.stars(count)}>
      {[1, 2, 3].map((i) => (
        <span aria-hidden="true" key={i} data-earned={i <= count}>
          ★
        </span>
      ))}
    </span>
  );
}
export default function Quest({ active }: { active: boolean }) {
  const [stored, setStored] = useState<StoredProgress>({
    progress: blankProgress(),
    available: true,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [map, setMap] = useState(true);
  const [confirm, setConfirm] = useState<"reset" | "restart" | null>(null);
  const [pendingStage, setPendingStage] = useState<Stage>(0);
  const title = useRef<HTMLHeadingElement>(null);
  const presenting = usePresentation();
  useEffect(() => {
    const read = () => {
      try {
        setStored(loadProgress(window.localStorage));
      } catch {
        setStored((previous) => ({ ...previous, available: false }));
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (active && (map || session?.phase === "complete"))
      title.current?.focus({ preventScroll: true });
  }, [active, map, session?.phase]);
  const start = useCallback((stage: Stage) => {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    setSession(newSession(stage, seed, crypto.randomUUID()));
    setMap(false);
    setConfirm(null);
  }, []);
  const act = (action: Action) => {
    if (!session) return;
    const next = transition(session, action);
    if (next === session) return;
    // The reducer also rejects stale question IDs. Completion records are maxima,
    // so a repeated render or submit cannot duplicate an award.
    setSession(next);
    if (next.phase === "complete") {
      try {
        setStored(
          recordResult(
            window.localStorage,
            stored.progress,
            next.stage,
            next.unaided,
          ),
        );
      } catch {
        setStored({
          available: false,
          progress: {
            ...stored.progress,
            stages: stored.progress.stages.map((s, i) =>
              i === next.stage
                ? {
                    stars: Math.max(s.stars, starsFor(next.unaided)),
                    best: Math.max(s.best, next.unaided),
                  }
                : s,
            ),
          },
        });
      }
    }
  };
  const unlocked = stored.progress.stages.slice(0, 3).every((s) => s.stars > 0);
  const requestStart = (stage: Stage) => {
    if (stage === 3 && !unlocked) return;
    if (session && session.phase !== "complete") {
      setPendingStage(stage);
      setConfirm("restart");
    } else start(stage);
  };
  const reset = () => {
    let available = true;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      available = false;
    }
    setStored({ progress: blankProgress(), available });
    setSession(null);
    setMap(true);
    setConfirm(null);
  };
  const total = stored.progress.stages.reduce((sum, s) => sum + s.stars, 0);
  return (
    <div
      className={styles.quest}
      data-arcade
      data-presenting={presenting || undefined}
    >
      {!stored.available && (
        <p className={styles.storageError} role="status">
          {c.savingFailed}
        </p>
      )}
      <p>
        <Link href="/polynomial-tug" className={styles.textButton}>
          {copy.polynomialTug.link}
        </Link>
      </p>
      {confirm && (
        <div className={styles.confirm} role="alert">
          <p>{confirm === "reset" ? c.resetPrompt : c.restartQuestion}</p>
          <div className={styles.actions}>
            <button
              className={styles.primary}
              onClick={() =>
                confirm === "reset" ? reset() : start(pendingStage)
              }
            >
              {confirm === "reset" ? c.confirmReset : c.confirmRestart}
            </button>
            <button
              className={styles.secondary}
              onClick={() => setConfirm(null)}
            >
              {confirm === "reset" ? c.keep : c.cancel}
            </button>
          </div>
        </div>
      )}
      {map || !session ? (
        <>
          <header className={styles.mapHeader}>
            <div>
              <h2 ref={title} tabIndex={-1}>
                {c.title}
              </h2>
              <p className={styles.tagline}>{c.intro}</p>
              <p>{c.description}</p>
              <span className={styles.total}>{c.total(total)}</span>
            </div>
            <Guardian stage={3} />
          </header>
          {session && session.phase !== "complete" && (
            <div className={styles.resume}>
              <span>
                {c.stages[session.stage].name} — {c.round(session.round + 1)}
              </span>
              <button
                className={styles.primary}
                onClick={() => {
                  setMap(false);
                  setConfirm(null);
                }}
              >
                {c.resume}
              </button>
            </div>
          )}
          <ol className={styles.trail}>
            {c.stages.map((stage, i) => {
              const record = stored.progress.stages[i],
                locked = i === 3 && !unlocked;
              return (
                <li
                  key={stage.name}
                  data-stage={i}
                  data-locked={locked}
                  data-boss={i === 3}
                >
                  <div className={styles.stop} aria-hidden="true">
                    {record.stars ? "✓" : i + 1}
                  </div>
                  <div className={styles.stageCreature}>
                    <Guardian
                      stage={i}
                      remaining={6}
                      celebrate={record.stars > 0}
                    />
                  </div>
                  <span className={styles.stageMark} aria-hidden="true">
                    {stage.mark}
                  </span>
                  <h3>{stage.name}</h3>
                  <p className={styles.skill}>{stage.skill}</p>
                  <p>{stage.description}</p>
                  <Stars count={record.stars} />
                  <p className={styles.stageStatus}>
                    {locked
                      ? c.locked
                      : record.stars
                        ? c.best(record.best)
                        : i === 0
                          ? c.recommended
                          : i === 3
                            ? c.bossReady
                            : c.ready}
                  </p>
                  <button
                    className={i === 3 ? styles.primary : styles.secondary}
                    disabled={locked}
                    onClick={() => requestStart(i as Stage)}
                  >
                    {c.start(stage.name)}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className={styles.rules}>
            <p>{c.rules}</p>
            <p>{c.starRules}</p>
            <p>{c.mapNote}</p>
          </div>
          <footer className={styles.mapFooter}>
            <p>{c.saveNote}</p>
            <button
              className={styles.textButton}
              onClick={() => setConfirm("reset")}
            >
              {c.reset}
            </button>
          </footer>
        </>
      ) : session.phase === "complete" ? (
        <section className={styles.result}>
          <Guardian stage={session.stage} remaining={0} celebrate />
          <div>
            <p className={styles.skill}>{c.stages[session.stage].name}</p>
            <h2 ref={title} tabIndex={-1}>
              {c.victory}
            </h2>
            <p>{c.victoryDetail}</p>
            <Stars count={starsFor(session.unaided)} />
            <p className={styles.resultCount}>{c.unaided(session.unaided)}</p>
            <p>{c.supported(6 - session.unaided)}</p>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                onClick={() => start(session.stage)}
              >
                {c.replay}
              </button>
              <button className={styles.secondary} onClick={() => setMap(true)}>
                {c.back}
              </button>
            </div>
          </div>
        </section>
      ) : null}
      {session && session.phase !== "complete" && (
        <div hidden={map}>
          <Battle
            key={session.question.id}
            session={session}
            active={active && !confirm && !map}
            act={act}
            back={() => {
              setMap(true);
              setConfirm(null);
            }}
            restart={() => {
              setPendingStage(session.stage);
              setConfirm("restart");
            }}
          />
        </div>
      )}
    </div>
  );
}
