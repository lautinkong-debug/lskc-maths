"use client";
import Link from "next/link";
import { lazy, Suspense, useRef, useState } from "react";
import { usePresentation } from "@/components/PresentationFrame";
import { Avatar, Stamp, StarRating } from "@/components/game";
import { copy } from "@/lib/copy";
import { useAuth } from "@/lib/auth";
import {
  ADJECTIVES,
  ANIMALS,
  avatar,
  nickname,
} from "@/lib/challenges/nicknames";
import { button, field, primary } from "../components/ui";
import { generateQuestions } from "../lib/generate";
import {
  decodeSetCode,
  encodeSetCode,
  hashSeed,
  SKILLS,
  type SetSettings,
  type Skill,
} from "../lib/setCode";
import {
  availableInks,
  awardProgress,
  blankProgress,
  frameIndex,
  hongKongDate,
  nextRankXP,
  rankIndex,
  recommendedLevel,
  totalStars,
  useProgress,
  visibleDailyStreak,
  type GameResult,
  type GameSettings,
} from "./progress";
import {
  newStamps,
  stampDefinitions,
  unlockedStamps,
  type StampId,
} from "./stamps";
import type { RunSummary } from "../challenge/Runner";
import { WorldMark } from "./WorldMark";
import styles from "./PlayHub.module.css";

const Runner = lazy(() => import("../challenge/Runner"));
const LiftRush = lazy(() => import("./games/LiftRush"));
const TargetHop = lazy(() => import("./games/TargetHop"));
const SignSnap = lazy(() => import("./games/SignSnap"));
const RedPenHero = lazy(() => import("./games/RedPenHero"));
const StampBook = lazy(() => import("./StampBook"));
const c = copy.apps.directedNumbers.playLesson;
type WorldLevel = 1 | 2 | 3;
type Screen =
  | "hub"
  | "settings"
  | "challenge"
  | "run"
  | "lift"
  | "hop"
  | "sign"
  | "redpen"
  | "stamps";
type RunPlan = {
  code: string;
  world?: number;
  level?: WorldLevel;
  dailyDate?: string;
};
const WORLD_SKILLS: Skill[] = [
  "numberLine",
  "addSubtract",
  "brackets",
  "signs",
  "mixed",
  "mistakes",
];
function randomSeed(): number {
  const random = new Uint32Array(1);
  if (typeof crypto !== "undefined" && crypto.getRandomValues)
    crypto.getRandomValues(random);
  else random[0] = Math.floor(Math.random() * 2 ** 32);
  return random[0] % 2 ** 24;
}
function Settings({
  progress,
  update,
  onBack,
}: {
  progress: ReturnType<typeof blankProgress>;
  update: (
    change: (
      current: ReturnType<typeof blankProgress>,
    ) => ReturnType<typeof blankProgress>,
  ) => void;
  onBack: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  function setting(key: keyof GameSettings, value: boolean) {
    update((old) => ({ ...old, settings: { ...old.settings, [key]: value } }));
  }
  return (
    <section className="space-y-5" aria-label={c.settings}>
      <h2 className="font-display text-navy text-3xl font-bold">
        {c.settings}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="font-semibold">
          {c.nickname}
          <select
            className={field}
            value={progress.nickname[0]}
            onChange={(event) =>
              update((old) => ({
                ...old,
                nickname: [Number(event.target.value), old.nickname[1]],
              }))
            }
          >
            {ADJECTIVES.map((word, index) => (
              <option key={word} value={index}>
                {word}
              </option>
            ))}
          </select>
        </label>
        <label className="font-semibold">
          {c.avatar}
          <select
            className={field}
            value={progress.nickname[1]}
            onChange={(event) =>
              update((old) => ({
                ...old,
                nickname: [old.nickname[0], Number(event.target.value)],
              }))
            }
          >
            {ANIMALS.map(([animal, emoji], index) => (
              <option key={animal} value={index}>
                {emoji} {animal}
              </option>
            ))}
          </select>
        </label>
        <label className="font-semibold">
          {c.frame}
          <select
            className={field}
            value={progress.selectedFrame}
            onChange={(event) =>
              update((old) => ({
                ...old,
                selectedFrame: Number(event.target.value),
              }))
            }
          >
            {Array.from({ length: frameIndex(progress.xp) + 1 }, (_, index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
        <label className="font-semibold">
          {c.stampInk}
          <select
            className={field}
            value={progress.selectedInk}
            onChange={(event) =>
              update((old) => ({
                ...old,
                selectedInk: event.target.value as typeof old.selectedInk,
              }))
            }
          >
            {availableInks(progress.xp).map((ink) => (
              <option key={ink} value={ink}>
                {c.inkNames[ink]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["sound", "vibration", "relaxed", "reduceMotion"] as const).map(
          (key) => (
            <label
              key={key}
              className="border-grid bg-paper flex min-h-14 items-center gap-3 rounded border p-3"
            >
              <input
                type="checkbox"
                checked={progress.settings[key]}
                onChange={(event) => setting(key, event.target.checked)}
              />
              {key === "reduceMotion"
                ? c.reduceMotion
                : key === "relaxed"
                  ? c.relaxed
                  : key === "sound"
                    ? c.sound
                    : c.vibration}
            </label>
          ),
        )}
      </div>
      <p>{c.settingsNote}</p>
      {!confirm ? (
        <button className={button} onClick={() => setConfirm(true)}>
          {c.reset}
        </button>
      ) : (
        <div className="border-crimson-deep rounded border p-4">
          <p>{c.resetAsk}</p>
          <div className="mt-2 flex gap-2">
            <button
              className={primary}
              onClick={() => {
                update(() => blankProgress());
                setConfirm(false);
              }}
            >
              {c.resetYes}
            </button>
            <button className={button} onClick={() => setConfirm(false)}>
              {c.cancel}
            </button>
          </div>
        </div>
      )}
      <button className={button} onClick={onBack}>
        {c.back}
      </button>
    </section>
  );
}
function ChallengeSetup({
  onStart,
  onBack,
}: {
  onStart: (code: string) => void;
  onBack: () => void;
}) {
  const [skills, setSkills] = useState<Skill[]>([
      "numberLine",
      "addSubtract",
      "mixed",
    ]),
    [level, setLevel] = useState<1 | 2>(1),
    [count, setCount] = useState<5 | 10 | 20>(10),
    [code, setCode] = useState(""),
    [message, setMessage] = useState("");
  function toggle(skill: Skill) {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  }
  function make() {
    if (!skills.length) {
      setMessage(c.chooseSkill);
      return;
    }
    const settings: SetSettings = {
      skills,
      level,
      questionCount: count,
      seed: randomSeed(),
    };
    const next = encodeSetCode(settings);
    setCode(next);
    setMessage("");
  }
  function start() {
    const decoded = decodeSetCode(code);
    if (!decoded) {
      setMessage(c.invalidCode);
      return;
    }
    setMessage("");
    onStart(encodeSetCode(decoded));
  }
  return (
    <section className="space-y-5" aria-label={c.challengeRun}>
      <h2 className="font-display text-navy text-3xl font-bold">
        {c.challengeRun}
      </h2>
      <p>{c.setCodeHelp}</p>
      <div className="border-grid bg-paper rounded border p-4">
        <label className="font-semibold">
          {c.setCode}
          <input
            className={`${field} max-w-52 font-mono tracking-widest uppercase`}
            maxLength={8}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase().replace(/\s/g, ""));
              setMessage("");
            }}
          />
        </label>
        <button className={`${primary} mt-3`} onClick={start}>
          {c.useCode}
        </button>
        {message && (
          <p role="alert" className="text-crimson-deep mt-2">
            {message}
          </p>
        )}
      </div>
      <fieldset className="border-grid rounded border p-4">
        <legend className="font-display text-navy text-xl font-semibold">
          {c.chooseSkills}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex min-h-12 items-center gap-2">
              <input
                type="checkbox"
                checked={skills.includes(skill)}
                onChange={() => toggle(skill)}
              />
              {c.skillLabels[skill]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <label className="font-semibold">
          {c.chooseLevel}
          <select
            className={field}
            value={level}
            onChange={(event) => setLevel(Number(event.target.value) as 1 | 2)}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="font-semibold">
          {c.chooseCount}
          <select
            className={field}
            value={count}
            onChange={(event) =>
              setCount(Number(event.target.value) as 5 | 10 | 20)
            }
          >
            {([5, 10, 20] as const).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={primary} onClick={make}>
          {c.makeSet}
        </button>
        <button className={button} onClick={onBack}>
          {c.back}
        </button>
      </div>
    </section>
  );
}
export default function PlayHub() {
  const worldsHeading = useRef<HTMLHeadingElement>(null);
  const presenting = usePresentation();
  const { role } = useAuth();
  const [progress, update] = useProgress(),
    [screen, setScreen] = useState<Screen>("hub"),
    [run, setRun] = useState<RunPlan | null>(null),
    [gameLevel, setGameLevel] = useState<WorldLevel>(1),
    [gameSeed, setGameSeed] = useState(0),
    [reward, setReward] = useState<"rank" | "best" | null>(null),
    [earnedStamps, setEarnedStamps] = useState<StampId[]>([]);
  const today = hongKongDate(),
    recommended = recommendedLevel(progress),
    rank = rankIndex(progress.xp);
  const emoji = avatar(progress.nickname),
    name = nickname(progress.nickname);
  function startWorld(world: number, level: WorldLevel) {
    setReward(null);
    setEarnedStamps([]);
    if (world === 2 || world === 3 || world === 4 || world === 6) {
      setGameLevel(level);
      setGameSeed(randomSeed());
      setScreen(
        world === 2
          ? "lift"
          : world === 3
            ? "hop"
            : world === 4
              ? "sign"
              : "redpen",
      );
      return;
    }
    const skill = WORLD_SKILLS[world - 1],
      settings: SetSettings = {
        skills: [skill],
        level: level === 1 ? 1 : 2,
        questionCount: 10,
        seed: randomSeed(),
      };
    setRun({ code: encodeSetCode(settings), world, level });
    setScreen("run");
  }
  function startDaily() {
    const settings: SetSettings = {
      skills: [
        "numberLine",
        "addSubtract",
        "brackets",
        "signs",
        "mixed",
        "wordProblems",
        "mistakes",
      ],
      level: 2,
      questionCount: 10,
      seed: hashSeed(today),
    };
    setRun({ code: encodeSetCode(settings), dailyDate: today });
    setReward(null);
    setEarnedStamps([]);
    setScreen("run");
  }
  function complete(result: RunSummary | GameResult) {
    const specialWorld =
      screen === "lift"
        ? 2
        : screen === "hop"
          ? 3
          : screen === "sign"
            ? 4
            : screen === "redpen"
              ? 6
              : undefined;
    const world = specialWorld ?? run?.world,
      level = specialWorld ? gameLevel : run?.level;
    const best =
      world && level ? progress.best[`${world}-${level}`] : undefined;
    const perfect =
      screen === "run" &&
      !run?.world &&
      !run?.dailyDate &&
      "marks" in result &&
      result.marks.length >= 10 &&
      result.marks.every((mark) => mark === "correct");
    const next = awardProgress(progress, {
      world,
      level,
      stars: result.stars,
      score: result.score,
      dailyDate: screen === "run" ? run?.dailyDate : undefined,
      metrics: {
        ...result.metrics,
        perfectChallenge: perfect || result.metrics?.perfectChallenge,
      },
    });
    setReward(
      rankIndex(next.xp) > rankIndex(progress.xp)
        ? "rank"
        : world && level && (best === undefined || result.score.total > best)
          ? "best"
          : null,
    );
    setEarnedStamps(newStamps(progress, next));
    update(() => next);
  }
  const rewardView = (
    <>
      {reward && (
        <Stamp
          label={reward === "rank" ? c.newRank : c.personalBest}
          ink={progress.selectedInk}
          reduceMotion={progress.settings.reduceMotion}
        />
      )}{" "}
      {earnedStamps.map((id) => (
        <div
          key={id}
          className="border-highlight bg-highlight/20 rounded border p-2"
        >
          <strong>{c.newStamp}</strong>
          <Stamp
            label={stampDefinitions.find((item) => item.id === id)!.name}
            ink={progress.selectedInk}
            reduceMotion={progress.settings.reduceMotion}
          />
        </div>
      ))}
    </>
  );
  if (screen === "settings")
    return (
      <Settings
        progress={progress}
        update={update}
        onBack={() => setScreen("hub")}
      />
    );
  if (screen === "stamps")
    return (
      <Suspense fallback={<p>{copy.apps.loading}</p>}>
        <StampBook progress={progress} onBack={() => setScreen("hub")} />
      </Suspense>
    );
  if (screen === "challenge")
    return (
      <ChallengeSetup
        onStart={(code) => {
          setRun({ code });
          setReward(null);
          setScreen("run");
        }}
        onBack={() => setScreen("hub")}
      />
    );
  if (screen === "run" && run) {
    const settings = decodeSetCode(run.code);
    if (!settings) return <p>{c.invalidCode}</p>;
    const questions = generateQuestions(settings);
    return (
      <div className="space-y-4">
        {rewardView}
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <Runner
            key={run.code}
            questions={questions}
            timeLimitSec={
              progress.settings.relaxed ? null : settings.questionCount * 15
            }
            settings={progress.settings}
            onComplete={complete}
            onExit={() => {
              setScreen("hub");
              setReward(null);
              setEarnedStamps([]);
            }}
            onNextLevel={
              run.world && run.level
                ? () =>
                    run.level === 3 && run.world === 6
                      ? setScreen("hub")
                      : startWorld(
                          run.level === 3 ? run.world! + 1 : run.world!,
                          run.level === 3
                            ? 1
                            : ((run.level! + 1) as WorldLevel),
                        )
                : undefined
            }
            avatarEmoji={emoji}
          />
        </Suspense>
      </div>
    );
  }
  if (
    screen === "lift" ||
    screen === "hop" ||
    screen === "sign" ||
    screen === "redpen"
  ) {
    const props = {
      level: gameLevel,
      seed: gameSeed,
      settings: progress.settings,
      onComplete: complete,
      onExit: () => {
        setScreen("hub");
        setReward(null);
        setEarnedStamps([]);
      },
    };
    return (
      <div className="space-y-4">
        {rewardView}
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          {screen === "lift" ? (
            <LiftRush
              key={`lift-${gameLevel}`}
              {...props}
              avatarEmoji={emoji}
            />
          ) : screen === "hop" ? (
            <TargetHop
              key={`hop-${gameLevel}`}
              {...props}
              avatarEmoji={emoji}
            />
          ) : screen === "sign" ? (
            <SignSnap key={`sign-${gameLevel}`} {...props} />
          ) : (
            <RedPenHero key={`redpen-${gameLevel}`} {...props} />
          )}
        </Suspense>
      </div>
    );
  }
  return (
    <section
      className={`${styles.hub} ${presenting ? styles.compact : ""}`}
      data-reduced-motion={progress.settings.reduceMotion}
      aria-label={c.title}
    >
      <div className={styles.hero}>
        <header className={styles.intro}>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
          <svg
            className={styles.route}
            viewBox="0 0 340 52"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 37h320M22 30v14M82 30v14M142 30v14M202 30v14M262 30v14M322 30v14" />
            <path
              d="M82 32Q142-17 202 32"
              stroke="var(--color-highlight)"
              strokeDasharray="5 5"
            />
            <circle cx="82" cy="37" r="5" fill="var(--color-paper)" />
            <circle
              cx="202"
              cy="37"
              r="6"
              fill="var(--color-highlight)"
              stroke="var(--color-highlight)"
            />
            <path d="m323 32 7 5-7 5" />
          </svg>
          <button
            className={styles.explore}
            onClick={() => {
              worldsHeading.current?.focus({ preventScroll: true });
              worldsHeading.current?.scrollIntoView({ block: "start" });
            }}
          >
            {c.chooseWorld}
            <span aria-hidden="true">↓</span>
          </button>
        </header>
        <div className={styles.profile}>
          <div className={styles.identity}>
            <Avatar emoji={emoji} name={name} frame={progress.selectedFrame} />
            <div>
              <strong>{name}</strong>
              <p>{c.ranks[rank]}</p>
            </div>
          </div>
          <div>
            <p className="text-navy text-sm font-semibold">
              {c.xp(progress.xp, nextRankXP(progress.xp))}
            </p>
            <div
              className={styles.xpTrack}
              role="progressbar"
              aria-label={c.experience}
              aria-valuemin={0}
              aria-valuemax={nextRankXP(progress.xp)}
              aria-valuenow={Math.min(progress.xp, nextRankXP(progress.xp))}
            >
              <span
                style={{
                  width: `${Math.min(100, (progress.xp / nextRankXP(progress.xp)) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className={styles.stats}>
            <span>★ {c.stars(totalStars(progress))}</span>
            <span>{c.streak(visibleDailyStreak(progress, today))}</span>
          </div>
        </div>
      </div>
      <section className={styles.daily} aria-label={c.today}>
        <div className={styles.dailyText}>
          <span className={styles.dailyIcon} aria-hidden="true">
            ✦
          </span>
          <div>
            <h3>{c.today}</h3>
            <p>
              {progress.dailyCompleted === today ? c.dailyDone : c.dailyPlay}
            </p>
          </div>
        </div>
        <button
          className={primary}
          disabled={progress.dailyCompleted === today}
          onClick={startDaily}
        >
          {progress.dailyCompleted === today ? c.dailyComplete : c.dailyAction}
          <span aria-hidden="true"> →</span>
        </button>
      </section>
      <section aria-labelledby="quest-worlds">
        <div className={styles.sectionHeading}>
          <h3 id="quest-worlds" ref={worldsHeading} tabIndex={-1}>
            {c.exploreWorlds}
          </h3>
          <p>{c.worldsHelp}</p>
        </div>
        <div className={styles.map}>
          {c.worlds.map((world, index) => {
            const worldNo = index + 1,
              levelRecommended = recommended.world === worldNo;
            return (
              <section key={world} className={styles.world} aria-label={world}>
                <div className={styles.landmark}>
                  <span className={styles.worldNumber} aria-hidden="true">
                    0{worldNo}
                  </span>
                  <WorldMark world={worldNo} />
                </div>
                <div className={styles.worldBody}>
                  <div className={styles.worldTitle}>
                    {levelRecommended && (
                      <span className={styles.recommend}>
                        {c.recommended} <span aria-hidden="true">↗</span>
                      </span>
                    )}
                    <h4>{world}</h4>
                    <p>{c.skills[index]}</p>
                  </div>
                  <div className={styles.levels}>
                    {([1, 2, 3] as const).map((level) => (
                      <button
                        key={level}
                        className={styles.level}
                        data-recommended={
                          levelRecommended && recommended.level === level
                        }
                        aria-label={`${world}, ${c.level(level)}`}
                        onClick={() => startWorld(worldNo, level)}
                      >
                        {c.level(level)}
                        <StarRating
                          count={progress.stars[`${worldNo}-${level}`] ?? 0}
                        />
                        {level === 3 && <small>{c.boss}</small>}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </section>
      <div className={styles.toolkit}>
        <button className={button} onClick={() => setScreen("challenge")}>
          {c.challengeRun}
          <span aria-hidden="true"> ↗</span>
        </button>
        <button className={button} onClick={() => setScreen("stamps")}>
          {c.stampBook} ({unlockedStamps(progress).length}/15)
        </button>
        <button className={button} onClick={() => setScreen("settings")}>
          {c.settings}
        </button>
      </div>
      <section className={styles.compete}>
        <div>
          <h3>{c.competeTitle}</h3>
          <p>{c.competeIntro}</p>
        </div>
        <div className={styles.competeActions}>
          <Link className={primary} href="/join">
            {c.classJoin}
            <span aria-hidden="true"> →</span>
          </Link>
          <Link className={button} href="/boards">
            {copy.challenges.boardsTitle}
          </Link>
          {(role === "teacher" || role === "admin") && (
            <Link
              className={button}
              href="/challenges/new?app=directed-numbers"
            >
              {c.classStart}
            </Link>
          )}
        </div>
      </section>
    </section>
  );
}
