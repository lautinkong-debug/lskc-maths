"use client";

import { useState } from "react";
import { Math as MathText } from "@/components/Math";
import { copy } from "@/lib/copy";
import { Board, evidenceName } from "./Board";
import {
  gradeEvidence,
  lessonRound,
  lessonSetup,
  mixedRounds,
  type Changes,
  type Criterion,
  type Mission,
  type Round,
} from "./model";
import styles from "./games.module.css";

const c = copy.similarityGames;
const missions: Mission[] = ["aaa", "sides", "included"];
const storageKey = "similarity-detective-progress-v1";
const allIds = [
  ...missions.flatMap((m) => [0, 1, 2].map((i) => `lesson-${m}-${i + 1}`)),
  ...mixedRounds.map((r) => r.id),
];
const rule = (criterion: Criterion) =>
  criterion === "insufficient" ? c.insufficient : c.missions[criterion].rule;
const stageTitle = (mission: Mission | "mixed") =>
  mission === "mixed" ? c.mixed : c.missions[mission].title;

function Symbol({ kind }: { kind: Mission | "mixed" }) {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" className={styles.symbol}>
      <path
        d="M32 122 L94 35 L148 122 Z"
        fill="var(--color-navy-wash)"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <path
        d="M184 120 L210 20 L297 88 Z"
        fill="none"
        stroke="var(--color-crimson)"
        strokeWidth="3"
      />
      {(kind === "aaa" || kind === "mixed") && (
        <>
          <path
            d="M46 104 Q58 110 55 122 M84 49 Q94 57 104 51 M129 122 Q130 110 139 107"
            fill="none"
            stroke="var(--color-crimson)"
            strokeWidth="3"
          />
          <text x="72" y="108" fontSize="25" fill="var(--color-navy)">
            α
          </text>
        </>
      )}
      {(kind === "sides" || kind === "mixed") && (
        <>
          <text x="49" y="72" fontSize="20" fill="var(--color-navy)">
            3
          </text>
          <text x="83" y="143" fontSize="20" fill="var(--color-navy)">
            4
          </text>
          <text x="185" y="70" fontSize="20" fill="var(--color-crimson)">
            6
          </text>
          <text x="245" y="128" fontSize="20" fill="var(--color-crimson)">
            8
          </text>
        </>
      )}
      {kind === "included" && (
        <>
          <path
            d="M49 99 Q66 111 61 122"
            stroke="var(--color-crimson)"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="32" cy="122" r="6" fill="var(--color-crimson)" />
          <path
            d="M190 97 Q211 101 208 113"
            stroke="var(--color-crimson)"
            strokeWidth="4"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

export default function SimilarityGames({
  presenting = false,
}: {
  presenting?: boolean;
}) {
  const [game, setGame] = useState<Mission | "mixed" | null>(null);
  const [level, setLevel] = useState(0);
  const [done, setDone] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "[]",
      );
      if (Array.isArray(saved))
        return [
          ...new Set(
            saved.filter(
              (id): id is string =>
                typeof id === "string" && allIds.includes(id),
            ),
          ),
        ];
    } catch {
      /* Progress is optional. */
    }
    return [];
  });
  const [finished, setFinished] = useState(false);
  function complete(id: string) {
    const next = [...new Set([...done, id])];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Storage may be unavailable. */
    }
    setDone(next);
  }
  function open(mission: Mission | "mixed") {
    setGame(mission);
    setFinished(false);
    const ids =
      mission === "mixed"
        ? mixedRounds.map((r) => r.id)
        : [0, 1, 2].map((n) => `lesson-${mission}-${n + 1}`);
    const next = ids.findIndex((id) => !done.includes(id));
    setLevel(Math.max(0, next));
  }
  return (
    <section
      className={styles.games}
      data-projecting={presenting}
      data-testid="similarity-games"
    >
      {!game ? (
        <>
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
            {missions.map((mission, i) => (
              <button
                key={mission}
                className={styles.mission}
                aria-label={c.missions[mission].title}
                onClick={() => open(mission)}
              >
                <div className={styles.missionTop}>
                  <span className={styles.number}>{i + 1}</span>
                  <span>
                    {
                      done.filter((id) => id.startsWith(`lesson-${mission}-`))
                        .length
                    }{" "}
                    / 3
                  </span>
                </div>
                <Symbol kind={mission} />
                <h3>{c.missions[mission].title}</h3>
                <strong>{c.missions[mission].rule}</strong>
                <p>{c.missions[mission].description}</p>
              </button>
            ))}
          </div>
          <button
            className={styles.mixedCard}
            aria-label={c.mixed}
            onClick={() => open("mixed")}
          >
            <div>
              <h3>{c.mixed}</h3>
              <p>{c.mixedDescription}</p>
            </div>
            <strong>
              {done.filter((id) => id.startsWith("mixed-")).length} / 12{" "}
              <span aria-hidden="true">→</span>
            </strong>
          </button>
          <p className={styles.footnote}>{c.saved}</p>
          <p className={styles.footnote}>
            {c.source}{" "}
            <a
              href="https://www.gmath.hk/s1/similarity"
              target="_blank"
              rel="noreferrer"
            >
              {c.sourceLink}
            </a>
          </p>
        </>
      ) : (
        <>
          <header className={styles.gameHeader}>
            <button
              onClick={() => {
                setGame(null);
                setFinished(false);
              }}
            >
              ← {c.back}
            </button>
            <div>
              <h2>{stageTitle(game)}</h2>
              <p>
                {game === "mixed" ? c.mixedDescription : c.missions[game].rule}
              </p>
            </div>
            <span>
              {game === "mixed" ? c.round : c.level} {level + 1} /{" "}
              {game === "mixed" ? 12 : 3}
            </span>
          </header>
          {finished ? (
            <div className={styles.finished} role="status">
              <span aria-hidden="true" className={styles.seal}>
                ✓
              </span>
              <h3>{c.resultTitle}</h3>
              <p>{c.resultText}</p>
              <button
                onClick={() => {
                  setLevel(0);
                  setFinished(false);
                }}
              >
                {c.playAgain}
              </button>
              <button
                onClick={() => {
                  setGame(null);
                  setFinished(false);
                }}
              >
                {c.back}
              </button>
            </div>
          ) : (
            <>
              <nav
                className={styles.rounds}
                aria-label={game === "mixed" ? c.round : c.level}
              >
                {Array.from({ length: game === "mixed" ? 12 : 3 }, (_, i) => {
                  const id =
                    game === "mixed"
                      ? mixedRounds[i].id
                      : `lesson-${game}-${i + 1}`;
                  return (
                    <button
                      key={id}
                      aria-label={`${game === "mixed" ? c.round : c.level} ${i + 1}`}
                      aria-pressed={i === level}
                      onClick={() => setLevel(i)}
                      data-done={done.includes(id)}
                    >
                      {done.includes(id) ? "✓" : i + 1}
                    </button>
                  );
                })}
              </nav>
              <RoundGame
                key={`${game}-${level}`}
                mission={game}
                level={level}
                onComplete={(id) => complete(id)}
                onNext={() =>
                  level + 1 === (game === "mixed" ? 12 : 3)
                    ? setFinished(true)
                    : setLevel(level + 1)
                }
              />
            </>
          )}
        </>
      )}
    </section>
  );
}

function RoundGame({
  mission,
  level,
  onComplete,
  onNext,
}: {
  mission: Mission | "mixed";
  level: number;
  onComplete: (id: string) => void;
  onNext: () => void;
}) {
  const setup = mission === "mixed" ? null : lessonSetup(mission, level);
  const [changes, setChanges] = useState<Changes>(() => setup?.start ?? {});
  const [drafts, setDrafts] = useState<Partial<Record<keyof Changes, string>>>(
    {},
  );
  const [third, setThird] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [choice, setChoice] = useState<Criterion | null>(null);
  const [feedback, setFeedback] = useState("");
  const [passed, setPassed] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [hint, setHint] = useState(false);
  const round =
    mission === "mixed"
      ? mixedRounds[level]
      : lessonRound(mission, level, changes);
  const thirdKnown =
    mission !== "aaa" ||
    (third.trim() !== "" &&
      Math.abs(Number(third) - round.triangles[1].angles[2]) < 1e-6);
  const focus = passed
    ? revealed
      ? round.proof[revealed - 1].evidence
      : []
    : null;
  function toggle(id: string) {
    if (passed) return;
    setSelected((old) =>
      old.includes(id) ? old.filter((value) => value !== id) : [...old, id],
    );
    setFeedback("");
  }
  function edit(key: keyof Changes, value: number) {
    if (!Number.isFinite(value)) return;
    const limit = setup?.limits[key];
    if (!limit) return;
    setChanges((old) => ({
      ...old,
      [key]: Math.max(limit.min, Math.min(limit.max, value)),
    }));
    setSelected([]);
    setFeedback("");
    setPassed(false);
    setRevealed(0);
  }
  function typeValue(key: keyof Changes, raw: string) {
    setDrafts((old) => ({ ...old, [key]: raw }));
    const value = Number(raw),
      limit = setup!.limits[key]!;
    if (
      raw.trim() &&
      Number.isFinite(value) &&
      value >= limit.min &&
      value <= limit.max
    )
      edit(key, value);
  }
  function commitValue(key: keyof Changes) {
    const raw = drafts[key],
      limit = setup!.limits[key]!;
    const value = raw?.trim() ? Number(raw) : changes[key]!;
    const bounded = Number.isFinite(value)
      ? Math.max(limit.min, Math.min(limit.max, value))
      : changes[key]!;
    setDrafts((old) => ({ ...old, [key]: String(bounded) }));
    if (bounded !== changes[key]) edit(key, bounded);
  }
  function check() {
    if (!choice) {
      setFeedback(c.choose);
      return;
    }
    if (!thirdKnown) {
      setFeedback(c.feedback.third);
      return;
    }
    const result = gradeEvidence(round, choice, selected);
    if (result.correct) {
      setPassed(true);
      setFeedback(c.success);
      setRevealed(0);
    } else
      setFeedback(
        c.feedback[result.code as keyof typeof c.feedback] ??
          c.feedback.evidence,
      );
  }
  const labels: Record<keyof Changes, string> = {
    angleA: c.angleD,
    angleB: c.angleE,
    thirdSide: c.thirdSide,
    hinge: c.hinge,
  };
  const isLast = level === (mission === "mixed" ? 11 : 2);
  return (
    <>
      <ol className={styles.flow} aria-label={c.title}>
        <li data-current={!passed}>{c.explore}</li>
        <li data-current={!passed && !!choice}>{c.solve}</li>
        <li data-current={passed}>{c.explain}</li>
      </ol>
      <p className={styles.task}>
        {mission === "mixed" ? c.mixedTask : c.missions[mission].task}
      </p>
      <div className={styles.playLayout} data-explaining={passed}>
        <div className={styles.diagramColumn}>
          <Board
            round={round}
            selected={selected}
            focus={focus}
            focusMembers={
              passed && revealed ? round.proof[revealed - 1].members : undefined
            }
            onSelect={toggle}
            thirdKnown={thirdKnown}
          />
          {!passed && (
            <section className={styles.evidenceSection} aria-label={c.evidence}>
              <h3>{c.evidence}</h3>
              <p>{c.evidenceHint}</p>
              <div className={styles.evidenceList}>
                {round.evidence
                  .filter(
                    (e) => thirdKnown || e.kind !== "angle" || e.index !== 2,
                  )
                  .map((e) => (
                    <button
                      key={e.id}
                      data-testid={`evidence-${e.id}`}
                      aria-pressed={selected.includes(e.id)}
                      onClick={() => toggle(e.id)}
                    >
                      <span className={styles.tick} aria-hidden="true">
                        {selected.includes(e.id) ? "✓" : "+"}
                      </span>
                      <EvidenceEquation round={round} id={e.id} />
                    </button>
                  ))}
              </div>
            </section>
          )}
        </div>
        <aside className={styles.desk}>
          {!passed ? (
            <>
              {setup && (
                <section className={styles.construction}>
                  <h3>{c.construction}</h3>
                  {(Object.keys(setup.start) as (keyof Changes)[]).map(
                    (key) => (
                      <label key={key} className={styles.control}>
                        <span>{labels[key]}</span>
                        <input
                          type="number"
                          aria-label={labels[key]}
                          value={drafts[key] ?? changes[key] ?? ""}
                          min={setup.limits[key]!.min}
                          max={setup.limits[key]!.max}
                          step={setup.limits[key]!.step}
                          onChange={(e) => typeValue(key, e.target.value)}
                          onBlur={() => commitValue(key)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitValue(key);
                          }}
                        />
                        <input
                          type="range"
                          aria-label={`${labels[key]} ${c.explore}`}
                          min={setup.limits[key]!.min}
                          max={setup.limits[key]!.max}
                          step={setup.limits[key]!.step}
                          value={changes[key]}
                          onChange={(e) => {
                            setDrafts((old) => ({
                              ...old,
                              [key]: e.target.value,
                            }));
                            edit(key, Number(e.target.value));
                          }}
                        />
                      </label>
                    ),
                  )}
                  {mission === "aaa" && (
                    <label className={styles.control}>
                      <span>{c.thirdAngle}</span>
                      <input
                        type="number"
                        min="1"
                        max="179"
                        aria-label={c.thirdAngle}
                        value={third}
                        onChange={(e) => {
                          setThird(e.target.value);
                          setSelected((old) =>
                            old.filter((id) => id !== "angle-2"),
                          );
                          setFeedback("");
                        }}
                      />
                      <small>{c.thirdHint}</small>
                    </label>
                  )}
                  <p className={styles.small}>{c.constructionHint}</p>
                </section>
              )}
              <fieldset className={styles.conditions}>
                <legend>{c.condition}</legend>
                {[
                  ...missions,
                  ...(mission === "mixed" ? ["insufficient" as const] : []),
                ].map((criterion) => (
                  <button
                    key={criterion}
                    aria-pressed={choice === criterion}
                    onClick={() => {
                      setChoice(criterion);
                      setFeedback("");
                    }}
                  >
                    {rule(criterion)}
                  </button>
                ))}
              </fieldset>
              <button className={styles.check} onClick={check}>
                {c.check}
              </button>
              <p className={styles.feedback} role="status">
                {feedback}
              </p>
              <button
                className={styles.hintButton}
                aria-expanded={hint}
                onClick={() => setHint(!hint)}
              >
                {c.hint}
              </button>
              {hint && <p className={styles.hint}>{c.hints[mission]}</p>}
            </>
          ) : (
            <section className={styles.proof} data-testid="game-proof">
              <p className={styles.success} role="status">
                ✓ {feedback}
              </p>
              <h3>{c.proof}</h3>
              <p>{c.proofHint}</p>
              <div className={styles.proofControls}>
                <button
                  onClick={() =>
                    setRevealed((n) => Math.min(n + 1, round.proof.length))
                  }
                  disabled={revealed === round.proof.length}
                >
                  {c.nextStep}
                </button>
                <button
                  onClick={() => setRevealed(0)}
                  disabled={revealed === 0}
                >
                  {c.restartProof}
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>{c.statement}</th>
                    <th>{c.reason}</th>
                  </tr>
                </thead>
                <tbody>
                  {round.proof.slice(0, revealed).map((step, i) => (
                    <tr key={i} data-current={i === revealed - 1}>
                      <td>
                        <MathText>{`\\displaystyle ${proofLayout(step.tex)}`}</MathText>
                      </td>
                      <td>
                        {c.reasons[step.reasonKey as keyof typeof c.reasons] ??
                          step.reasonKey}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {revealed === round.proof.length && (
                <>
                  <p className={styles.explanation}>
                    {
                      c.explanations[
                        round.explanationKey as keyof typeof c.explanations
                      ]
                    }
                  </p>
                  <button
                    className={styles.check}
                    onClick={() => {
                      onComplete(round.id);
                      onNext();
                    }}
                  >
                    {isLast
                      ? c.finish
                      : mission === "mixed"
                        ? c.nextRound
                        : c.next}
                  </button>
                </>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function EvidenceEquation({ round, id }: { round: Round; id: string }) {
  const e = round.evidence.find((item) => item.id === id)!;
  const a = evidenceName(round, id, 0).replace("∠", "\\angle ");
  const b = evidenceName(round, id, 1).replace("∠", "\\angle ");
  return (
    <MathText>
      {e.kind === "side"
        ? `\\dfrac{${a}}{${b}}=\\dfrac{${Number(e.values[0].toFixed(6))}}{${Number(e.values[1].toFixed(6))}}`
        : `${a}=${Number(e.values[0].toFixed(2))}^\\circ,\\quad ${b}=${Number(e.values[1].toFixed(2))}^\\circ`}
    </MathText>
  );
}

// Keep the calculation and its reason alongside one another on a phone.
function proofLayout(tex: string) {
  const sum = tex.match(/^(.*?) = 180\^\{\\circ\} - (.*?) - (.*?) = (.*?)$/);
  if (sum)
    return `\\begin{aligned}${sum[1]} &= 180^{\\circ}\\\\&\\quad - ${sum[2]} - ${sum[3]}\\\\&= ${sum[4]}\\end{aligned}`;
  const angle = tex.match(/^(\\angle .*?) = (\\angle .*?) = (.*?)$/);
  if (angle)
    return `\\begin{aligned}${angle[1]} &= ${angle[2]}\\\\&= ${angle[3]}\\end{aligned}`;
  return tex;
}
