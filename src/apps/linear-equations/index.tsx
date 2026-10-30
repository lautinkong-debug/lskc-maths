"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LessonWorkspace } from "@/components/LessonWorkspace";
import { usePresentation } from "@/components/PresentationFrame";
import { Math as Maths } from "@/components/Math";
import { copy } from "@/lib/copy";
import { readNumber, toTex } from "../directed-numbers/lib/rational";
import {
  questions,
  defaultId,
  responses,
  similarQuestion,
  type Question,
} from "./bank";
import {
  checkSubstitution,
  equationTex,
  expressionTex,
  gradeAnswer,
  gradeExpression,
  type Grade,
} from "./engine";
import { frames } from "./animation";
import AnimatedLesson, { frameReason } from "./AnimatedLesson";
import { QuestionContent } from "./QuestionContent";
import styles from "./linear-equations.module.css";
const c = copy.linearEquations;
const progressKey = "lskc-equations-independent-v1",
  eventName = "lskc-equations-progress";
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(eventName, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(eventName, cb);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(progressKey) ?? "[]";
  } catch {
    return "[]";
  }
}
function readProgress(raw: string): string[] {
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids)
      ? [
          ...new Set(
            ids.filter(
              (id): id is string =>
                typeof id === "string" && questions.some((q) => q.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
function saveProgress(id?: string) {
  try {
    localStorage.setItem(
      progressKey,
      JSON.stringify(id ? [...new Set([...readProgress(snapshot()), id])] : []),
    );
    window.dispatchEvent(new Event(eventName));
  } catch {}
}
function reference(q: Question) {
  return q.collection === "generated"
    ? c.retrySource
    : (q.collection === "quick"
        ? c.quickPrefix
        : q.collection === "revision"
          ? c.revisionPrefix
          : c.exercisePrefix) +
        q.reference +
        " · p. " +
        q.page;
}
function Check({ question: q }: { question: Question }) {
  const r = checkSubstitution(q.equation, q.variable, readNumber(q.answer));
  return (
    <section className={styles.check}>
      <h3>{c.check}</h3>
      <p>{c.substitute(q.variable)}</p>
      <div className={styles.checkGrid}>
        <div>
          <span>{c.left}</span>
          <Maths display>{r.left + "=" + toTex(r.leftValue)}</Maths>
        </div>
        <div>
          <span>{c.right}</span>
          <Maths display>{r.right + "=" + toTex(r.rightValue)}</Maths>
        </div>
      </div>
      <p className={styles.verified}>{r.valid ? c.verified : ""}</p>
    </section>
  );
}
function Solution({ question: q }: { question: Question }) {
  return (
    <section className={styles.result}>
      <h3>{c.solution}</h3>
      {q.prompt && (
        <div className={styles.model}>
          <p>{q.setup}</p>
          <Maths display>{equationTex(q.equation)}</Maths>
          <Maths display>
            {q.variable + "=" + toTex(readNumber(q.answer))}
          </Maths>
        </div>
      )}
      {responses(q).map((r, i) => (
        <div className={styles.answerResult} key={i}>
          <strong>{r.label}</strong>
          {r.kind === "choice" ? (
            <p>{r.answer}</p>
          ) : (
            <Maths display>
              {r.kind === "equation"
                ? equationTex(r.answer)
                : r.kind === "expression"
                  ? expressionTex(r.answer)
                  : toTex(readNumber(r.answer))}
            </Maths>
          )}
          {r.unit && <span>{r.unit}</span>}
          {r.expression && q.prompt && (
            <p>
              <Maths>
                {expressionTex(r.expression) +
                  "=" +
                  toTex(readNumber(r.answer))}
              </Maths>
            </p>
          )}
        </div>
      ))}
      {q.conclusion && <p>{q.conclusion}</p>}
      <Check question={q} />
    </section>
  );
}
function Practice({
  original,
  learn,
  next,
  hasNext,
}: {
  original: Question;
  learn: () => void;
  next: () => void;
  hasNext: boolean;
}) {
  const [variant, setVariant] = useState(0),
    [answers, setAnswers] = useState<string[]>([]),
    [grades, setGrades] = useState<Grade[]>([]),
    [revealed, setRevealed] = useState(false),
    [hint, setHint] = useState(false),
    [step, setStep] = useState(0),
    [attempts, setAttempts] = useState(0),
    [independent, setIndependent] = useState(false);
  const q = variant ? similarQuestion(original, variant) : original,
    fields = responses(q),
    sequence = frames(q.equation, q.variable);
  const correct =
      grades.length === fields.length && grades.every((g) => g === "correct"),
    finished = correct || revealed;
  function reset(v: number) {
    setVariant(v);
    setAnswers([]);
    setGrades([]);
    setRevealed(false);
    setHint(false);
    setStep(0);
    setAttempts(0);
    setIndependent(false);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (finished) return;
    const results = fields.map((r, i) =>
      r.kind === "choice"
        ? answers[i] === r.answer
          ? "correct"
          : "incorrect"
        : r.kind
          ? gradeExpression(
              answers[i] ?? "",
              q.variable,
              r.answer,
              r.kind === "equation",
            )
          : gradeAnswer(answers[i] ?? "", q.variable, r.answer),
    );
    setGrades(results);
    if (results.every((g) => g === "correct")) {
      const unaided = !variant && !hint && !step && !attempts;
      setIndependent(unaided);
      if (unaided) saveProgress(q.id);
    }
    if (!results.includes("invalid")) setAttempts(attempts + 1);
  }
  return (
    <section className={styles.practice}>
      <p className={styles.reference}>{reference(q)}</p>
      <h2>{q.prompt ? c.wordPractice : c.practiceTitle}</h2>
      <QuestionContent question={q} />
      <form onSubmit={submit} className={styles.answerForm}>
        {fields.map((r, i) => (
          <div key={i} className={styles.answerField}>
            <label htmlFor={"equation-answer-" + i}>
              {q.prompt ? r.label : c.answer}
              {r.unit ? " (" + r.unit + ")" : ""}
            </label>
            {r.kind === "choice" ? (
              <select
                id={"equation-answer-" + i}
                value={answers[i] ?? ""}
                disabled={finished}
                onChange={(e) => {
                  setAnswers((a) => {
                    const n = [...a];
                    n[i] = e.target.value;
                    return n;
                  });
                  setGrades([]);
                }}
              >
                <option value="">{c.chooseAnswer}</option>
                {r.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={"equation-answer-" + i}
                value={answers[i] ?? ""}
                disabled={finished}
                onChange={(e) => {
                  setAnswers((a) => {
                    const n = [...a];
                    n[i] = e.target.value;
                    return n;
                  });
                  setGrades([]);
                }}
                autoComplete="off"
                spellCheck={false}
                maxLength={160}
                aria-describedby={"help-" + i}
                aria-invalid={
                  (grades[i] && grades[i] !== "correct") || undefined
                }
              />
            )}
            <p id={"help-" + i}>
              {r.kind === "choice"
                ? c.explainChoice
                : r.kind
                  ? c.expressionHelp
                  : c.inputHelp}
            </p>
            {grades[i] && (
              <p className={styles.fieldFeedback} data-result={grades[i]}>
                {r.kind
                  ? grades[i] === "correct"
                    ? c.partCorrect
                    : grades[i] === "invalid"
                      ? c.expressionInvalid
                      : c.partIncorrect
                  : q.prompt && grades[i] === "correct"
                    ? c.partCorrect
                    : q.prompt && grades[i] === "incorrect"
                      ? c.partIncorrect
                      : c.feedback[grades[i]]}
              </p>
            )}
          </div>
        ))}
        <button
          className={styles.primary}
          disabled={finished || fields.some((_, i) => !answers[i]?.trim())}
        >
          {c.checkAnswer}
        </button>
      </form>
      <div
        role="status"
        className={styles.feedback}
        data-result={correct ? "correct" : revealed ? "revealed" : undefined}
      >
        {correct && <p>{independent ? c.independent : c.helped}</p>}
        {revealed && <strong>{c.revealed}</strong>}
        {grades.some((g) => g === "sign" || g === "incorrect") && (
          <p>{c.hints[q.skill]}</p>
        )}
      </div>
      {!finished && (
        <div className={styles.helpControls}>
          <button onClick={() => setHint(true)} disabled={hint}>
            {c.hint}
          </button>
          <button
            onClick={() => {
              setStep(step + 1);
              if (step + 1 === sequence.length - 1) setRevealed(true);
            }}
          >
            {c.showStep}
          </button>
          <button
            onClick={() => {
              setRevealed(true);
              setStep(sequence.length - 1);
            }}
          >
            {c.reveal}
          </button>
        </div>
      )}
      {hint && (
        <p className={styles.hint}>
          {q.setup ?? c.firstHint + " " + c.hints[q.skill]}
        </p>
      )}
      {step > 0 && (
        <ol className={styles.working}>
          {sequence.slice(0, step + 1).map((f, i) => (
            <li key={i}>
              <span>{frameReason(f)}</span>
              <Maths display>{equationTex(f.equation)}</Maths>
            </li>
          ))}
        </ol>
      )}
      {finished && (
        <>
          <Solution question={q} />
          <div className={styles.controls}>
            {!original.prompt && (
              <button
                className={styles.primary}
                onClick={() => reset(variant + 1)}
              >
                {c.similar}
              </button>
            )}
            {hasNext && <button onClick={next}>{c.nextQuestion}</button>}
            {variant > 0 && (
              <button onClick={() => reset(0)}>{c.backToTextbook}</button>
            )}
            <button onClick={learn}>{c.showLesson}</button>
          </div>
        </>
      )}
    </section>
  );
}
export default function LinearEquations() {
  const presenting = usePresentation();
  const [mode, setMode] = useState<"learn" | "practice">("learn"),
    [id, setId] = useState(defaultId);
  const progress = readProgress(
    useSyncExternalStore(subscribe, snapshot, () => "[]"),
  );
  useEffect(() => {
    function readHash() {
      const [m, q] = location.hash.slice(1).split("/");
      if (m === "learn" || m === "practice") setMode(m);
      if (questions.some((x) => x.id === q)) setId(q);
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, []);
  const q = questions.find((x) => x.id === id) ?? questions[0],
    available = questions.filter((x) => x.collection === q.collection),
    index = available.findIndex((x) => x.id === id);
  function select(nextId: string, nextMode = mode) {
    setId(nextId);
    setMode(nextMode);
    history.pushState(null, "", "#" + nextMode + "/" + nextId);
  }
  const next = () => {
    if (available[index + 1]) select(available[index + 1].id);
  };
  return (
    <div
      className={styles.app}
      data-testid="equation-studio"
      data-projecting={presenting || undefined}
    >
      <LessonWorkspace
        subject={c.title}
        symbol="="
        active={mode === "learn" ? c.learn : c.practice}
        presenting={presenting}
        navigation={
          <nav className={styles.navigation} aria-label={c.navigation}>
            <button
              aria-current={mode === "learn" ? "page" : undefined}
              onClick={() => select(id, "learn")}
            >
              {c.learn}
            </button>
            <button
              aria-current={mode === "practice" ? "page" : undefined}
              onClick={() => select(id, "practice")}
            >
              {c.practice}
            </button>
            <p>{c.coverage}</p>
            <p>{c.progress(progress.length, questions.length)}</p>
          </nav>
        }
      >
        <header className={styles.intro}>
          <h2>{c.intro}</h2>
          <p>{c.subtitle}</p>
        </header>
        <div className={styles.picker}>
          <label>
            {c.collection}
            <select
              value={q.collection}
              onChange={(e) =>
                select(
                  questions.find((x) => x.collection === e.target.value)!.id,
                )
              }
            >
              {Object.entries(c.collections).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            {c.question}
            <select value={id} onChange={(e) => select(e.target.value)}>
              {available.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.collection === "4A" || x.collection === "4B"
                    ? c.exercisePrefix + x.reference
                    : (x.collection === "quick"
                        ? c.quickPrefix
                        : c.revisionPrefix) + x.reference}
                </option>
              ))}
            </select>
          </label>
        </div>
        {mode === "learn" ? (
          <div key={"learn/" + id}>
            <div className={styles.questionHeading}>
              <p className={styles.reference}>{reference(q)}</p>
            </div>
            <QuestionContent question={q} model />
            <AnimatedLesson question={q}>
              <Solution question={q} />
              <button
                className={styles.primary}
                onClick={() => select(id, "practice")}
              >
                {c.practiceAgain}
              </button>
            </AnimatedLesson>
          </div>
        ) : (
          <Practice
            key={"practice/" + id}
            original={q}
            learn={() => select(id, "learn")}
            next={next}
            hasNext={index < available.length - 1}
          />
        )}
        <nav
          className={styles.questionNavigation}
          aria-label={c.questionNavigation}
        >
          <button
            onClick={() => select(available[index - 1].id)}
            disabled={index <= 0}
          >
            {c.previousQuestion}
          </button>
          <button onClick={next} disabled={index >= available.length - 1}>
            {c.nextQuestion}
          </button>
        </nav>
        <footer className={styles.footer}>
          <p>
            {c.coverage} {c.sourceNote}
          </p>
          <p>{c.progress(progress.length, questions.length)}</p>
          <p>{c.progressNote}</p>
          <button
            onClick={() => {
              if (confirm(c.resetConfirm)) saveProgress();
            }}
            disabled={!progress.length}
          >
            {c.resetProgress}
          </button>
        </footer>
      </LessonWorkspace>
    </div>
  );
}
