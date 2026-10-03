"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { seasonFor } from "@/lib/challenges/logic";
import { type ClassBoard } from "@/lib/challenges/types";
import { watchClassBoard } from "@/lib/db/challenges";
import styles from "./Challenges.module.css";

const c = copy.challenges;
const seasons = (() => {
  const current = seasonFor(new Date());
  const match = /^(\d{4})-\d{2}-T([12])$/.exec(current);
  if (!match) return [current];
  let year = Number(match[1]),
    term = Number(match[2]);
  return Array.from({ length: 6 }, () => {
    const label = `${year}-${String((year + 1) % 100).padStart(2, "0")}-T${term}`;
    if (term === 1) {
      year--;
      term = 2;
    } else term = 1;
    return label;
  });
})();
export function ClassBoards() {
  const [level, setLevel] = useState<1 | 2>(1),
    [season, setSeason] = useState(seasons[0]),
    [board, setBoard] = useState<ClassBoard | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [myClass, setMyClass] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setMyClass(sessionStorage.getItem("lskc.challenge.classTag") ?? "");
      } catch {
        /* Session storage is optional. */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const stop = watchClassBoard(
      `directed-numbers_L${level}_${season}`,
      (value) => {
        setBoard(value);
        setLoading(false);
      },
      () => {
        setError(c.roomError);
        setLoading(false);
      },
    );
    return stop;
  }, [level, season]);
  const ranked = Object.entries(board?.classes ?? {})
    .filter(([, value]) => value.players >= 5)
    .map(([tag, value]) => ({
      tag,
      average: value.totalBest / value.players,
      players: value.players,
    }))
    .sort((a, b) => b.average - a.average);
  const low = Math.min(0, ...ranked.map((item) => item.average)),
    high = Math.max(1, ...ranked.map((item) => item.average)),
    span = high - low;
  return (
    <main className={`${styles.page} mx-auto max-w-5xl space-y-7 px-4 sm:px-6`}>
      <Link className={styles.back} href="/apps/directed-numbers#play">
        ← {c.returnToPlay}
      </Link>
      <header>
        <h1 className="font-display text-navy font-semibold">
          {c.boardsTitle}
        </h1>
        <p className="mt-3 max-w-xl">{c.boardsIntro}</p>
      </header>
      <div className={styles.filters}>
        <label>
          {c.boardLevel}
          <select
            value={level}
            onChange={(event) => {
              setLoading(true);
              setError("");
              setLevel(Number(event.target.value) as 1 | 2);
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label>
          {c.boardSeason}
          <select
            value={season}
            onChange={(event) => {
              setLoading(true);
              setError("");
              setSeason(event.target.value);
            }}
          >
            {seasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">{c.loading}</p>
      ) : !ranked.length ? (
        <p className={styles.empty}>{c.boardEmpty}</p>
      ) : (
        <ol className={styles.boardList}>
          {ranked.map((item, index) => (
            <li key={item.tag} className={styles.boardRow}>
              <span className={styles.place}>{index + 1}</span>
              <div>
                <div className={styles.barHeading}>
                  <strong>
                    {item.tag}
                    {item.tag === myClass && (
                      <span className="bg-highlight ml-2 rounded px-2 py-1">
                        {c.yourClass}
                      </span>
                    )}
                  </strong>
                  <span>{c.boardPlayers(item.players)}</span>
                </div>
                <div className={styles.bar}>
                  <span
                    className={styles.barFill}
                    style={{
                      left: `${((0 - low) / span) * 100}%`,
                      width: `${(Math.abs(item.average) / span) * 100}%`,
                      transform:
                        item.average < 0 ? "translateX(-100%)" : undefined,
                      backgroundColor:
                        item.tag === myClass
                          ? "var(--color-highlight)"
                          : undefined,
                    }}
                  />
                  <span
                    className="bg-grid-strong absolute inset-y-0 w-px"
                    style={{ left: `${((0 - low) / span) * 100}%` }}
                  />
                  <strong className={styles.score}>
                    {c.average(Number(item.average.toFixed(1)))}
                  </strong>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
