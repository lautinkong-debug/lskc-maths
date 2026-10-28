"use client";

import { useEffect, useState } from "react";
import { LessonWorkspace } from "@/components/LessonWorkspace";
import { Math } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import {
  choicesFor,
  questions,
  recordAnswer,
  recordHelp,
  selectQuestions,
  type Collection,
  type Choice,
  type Progress,
  type Skill,
} from "./bank";
import styles from "./simplification.module.css";

const c = copy.algebraSimplification;
type Mode = "practice" | "learn";

export default function AlgebraSimplification() {
  const presenting = usePresentation();
  const [mode, setMode] = useState<Mode>("practice");
  const [skill, setSkill] = useState<Skill | "all">("all");
  const [collection, setCollection] = useState<Collection | "all">("all");
  const [id, setId] = useState(questions[0].id);
  const [progress, setProgress] = useState<Progress>({});
  const [selected, setSelected] = useState<Choice | null>(null);
  const [hint, setHint] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1800);
  const bank = selectQuestions(collection, skill);
  const question = questions.find((q) => q.id === id)!;
  const index = bank.findIndex((q) => q.id === id);
  const choices = choicesFor(question, 2603);
  const record = progress[id];
  const solved = bank.filter((q) => progress[q.id]?.solved).length;
  const firstTry = bank.filter((q) => progress[q.id]?.firstTry).length;
  const similar = bank.find(
    (q) => q.skill === question.skill && q.id !== id && !progress[q.id]?.solved,
  );
  const sourceLabel = c.source(
    c.collections[question.collection],
    question.ref,
    question.page,
    question.collection === "quick",
  );

  useEffect(() => {
    if (!playing || mode !== "learn") return;
    const timer = window.setTimeout(() => {
      setProgress((current) => recordHelp(current, id));
      setStep((current) =>
        globalThis.Math.min(current + 1, question.steps.length),
      );
      if (step + 1 >= question.steps.length) setPlaying(false);
    }, speed);
    return () => window.clearTimeout(timer);
  }, [playing, mode, step, speed, question, id]);

  function chooseQuestion(nextId: string) {
    setId(nextId);
    setSelected(null);
    setHint(false);
    setStep(0);
    setPlaying(false);
  }
  function chooseMode(next: Mode) {
    setMode(next);
    setPlaying(false);
    if (next === "learn") {
      setStep(0);
    }
  }
  function answer(choice: Choice) {
    if (record?.solved) return;
    setSelected(choice);
    setProgress((current) =>
      recordAnswer(current, id, choice.id === "correct"),
    );
  }
  function similarQuestion() {
    if (similar) chooseQuestion(similar.id);
  }

  return (
    <div
      className={styles.app}
      data-presenting={presenting || undefined}
      data-testid="algebra-app"
    >
      <LessonWorkspace
        subject={c.topic}
        symbol="x"
        active={mode === "learn" ? c.learn : c.practice}
        presenting={presenting}
        navigation={
          <nav className={styles.navigation} aria-label={c.navigation}>
            <button
              type="button"
              aria-current={mode === "practice" ? "page" : undefined}
              onClick={() => chooseMode("practice")}
            >
              {c.practice}
            </button>
            <button
              type="button"
              aria-current={mode === "learn" ? "page" : undefined}
              onClick={() => chooseMode("learn")}
            >
              {c.learn}
            </button>
            <p className={styles.coverage}>{c.coverage}</p>
          </nav>
        }
      >
        <div className={styles.content}>
          <header className={styles.heading}>
            <div>
              <h2>{c.intro}</h2>
              <p>{mode === "learn" ? c.learnSubtitle : c.subtitle}</p>
            </div>
            <div className={styles.score} aria-live="polite">
              <strong>{c.progress(solved, bank.length)}</strong>
              <span>{c.score(firstTry)}</span>
            </div>
          </header>
          <div className={styles.filters}>
            <label className={styles.collectionFilter}>
              {c.collection}
              <select
                value={collection}
                onChange={(event) => {
                  const next = event.target.value as Collection | "all";
                  setCollection(next);
                  chooseQuestion(selectQuestions(next, skill)[0].id);
                }}
              >
                <option value="all">{c.allCollections}</option>
                {Object.entries(c.collections).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {c.skill}
              <select
                value={skill}
                onChange={(event) => {
                  const next = event.target.value as Skill | "all";
                  setSkill(next);
                  chooseQuestion(selectQuestions(collection, next)[0].id);
                }}
              >
                <option value="all">{c.all}</option>
                {Object.entries(c.skills).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {c.question}
              <select
                value={id}
                onChange={(event) => chooseQuestion(event.target.value)}
              >
                {bank.map((q) => (
                  <option
                    value={q.id}
                    key={q.id}
                  >{`${c.questionOption(q.collection, q.ref)}${progress[q.id]?.solved ? ` · ${c.solved}` : ""}`}</option>
                ))}
              </select>
            </label>
          </div>
          <section className={styles.sheet} aria-label={sourceLabel}>
            <div className={styles.source}>
              <span>{sourceLabel}</span>
              <span>
                {c.skills[question.skill]} · {c.level(question.level)}
              </span>
            </div>
            <div className={styles.problem}>
              <span>{c.prompt}</span>
              <Math className={styles.expression}>{question.original.tex}</Math>
            </div>
            {mode === "practice" ? (
              <>
                <h3 className={styles.choose}>{c.choose}</h3>
                <div className={styles.choices}>
                  {choices.map((choice, i) => (
                    <button
                      type="button"
                      key={choice.id}
                      data-testid="algebra-choice"
                      aria-label={c.answerOption(
                        String.fromCharCode(65 + i),
                        choice.exact,
                      )}
                      className={styles.choice}
                      data-selected={selected?.id === choice.id || undefined}
                      data-correct={
                        (record?.solved && choice.id === "correct") || undefined
                      }
                      disabled={record?.solved}
                      onClick={() => answer(choice)}
                    >
                      <span className={styles.letter} aria-hidden="true">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <Math>{choice.tex}</Math>
                      {selected?.id === choice.id && (
                        <span className={styles.choiceLabel}>{c.selected}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div
                  className={styles.feedback}
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="algebra-feedback"
                >
                  {record?.solved ? (
                    <>
                      <strong>{c.correct}</strong>
                      <p>{record.firstTry ? c.firstTry : c.supported}</p>
                    </>
                  ) : selected ? (
                    <>
                      <strong>
                        {selected.id === "unfinished" ? c.unfinished : c.revise}
                      </strong>
                      {selected.id !== "unfinished" && (
                        <p>{c.feedback[selected.feedback!]}</p>
                      )}
                      <Math
                        className={styles.correction}
                      >{`=${question.steps[0].tex}`}</Math>
                    </>
                  ) : hint ? (
                    <>
                      <strong>{c.rules[question.steps[0].rule]}</strong>
                      <Math className={styles.correction}>
                        {question.steps[0].tex}
                      </Math>
                    </>
                  ) : null}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    disabled={hint || record?.solved}
                    onClick={() => {
                      setHint(true);
                      setProgress((current) => recordHelp(current, id));
                    }}
                  >
                    {c.hint}
                  </button>
                  <button type="button" onClick={() => chooseMode("learn")}>
                    {c.worked}
                  </button>
                  {selected && !record?.solved && similar && (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={similarQuestion}
                    >
                      {c.retry}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div
                className={styles.lesson}
                data-testid="algebra-player"
                data-step={step}
                data-playing={playing}
              >
                <div className={styles.playerHeader}>
                  <h3>{c.working}</h3>
                  <span>{c.step(step, question.steps.length)}</span>
                </div>
                <div className={styles.working}>
                  {step === 0 && <p className={styles.start}>{c.start}</p>}
                  {question.steps.slice(0, step).map((line, i) => (
                    <div
                      key={`${id}-${i}`}
                      className={styles.workingLine}
                      data-current={i === step - 1 || undefined}
                      data-testid="algebra-working-line"
                    >
                      <Math className={styles.lineMath}>{`=${line.tex}`}</Math>
                      <p>{c.rules[line.rule]}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.playerControls}>
                  <button
                    type="button"
                    disabled={step === 0}
                    onClick={() => {
                      setPlaying(false);
                      setStep(step - 1);
                    }}
                  >
                    {c.previous}
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={step === question.steps.length}
                    onClick={() => {
                      setPlaying(false);
                      setStep(step + 1);
                      setProgress((current) => recordHelp(current, id));
                    }}
                  >
                    {c.nextStep}
                  </button>
                  <button
                    type="button"
                    disabled={step === question.steps.length && !playing}
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? c.pause : c.play}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setStep(0);
                    }}
                  >
                    {c.replay}
                  </button>
                  <label>
                    {c.speed}
                    <select
                      value={speed}
                      onChange={(event) => setSpeed(Number(event.target.value))}
                    >
                      <option value={1800}>{c.normal}</option>
                      <option value={3200}>{c.slow}</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => chooseMode("practice")}
                >
                  {c.back}
                </button>
              </div>
            )}
            <footer className={styles.questionControls}>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => chooseQuestion(bank[index - 1].id)}
              >
                {c.previousQuestion}
              </button>
              <span>
                {index + 1} / {bank.length}
              </span>
              <button
                type="button"
                className={styles.primary}
                disabled={index === bank.length - 1}
                onClick={() => chooseQuestion(bank[index + 1].id)}
              >
                {c.next}
              </button>
            </footer>
          </section>
          {solved === bank.length && (
            <p className={styles.complete} role="status">
              {c.complete}
            </p>
          )}
          <p className={styles.note}>
            {c.answerSource(question.answerPage)} {c.session}
          </p>
        </div>
      </LessonWorkspace>
    </div>
  );
}
