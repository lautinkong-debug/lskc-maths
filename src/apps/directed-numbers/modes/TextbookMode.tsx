import { useState } from "react";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { button, field } from "../components/ui";
import {
  SignMagnitude,
  type ExplanationMethod,
} from "../components/SignMagnitude";
import { AnimatedWorking } from "../components/AnimatedWorking";
import { parseJourney } from "../lib/moves";
import {
  textbookQuestions,
  simpleMove,
  type TextbookQuestion,
} from "../lib/textbook";
const c = copy.apps.directedNumbers.textbookLesson;
const t = copy.apps.directedNumbers.demonstration;
function DemonstrationQuestion({
  question,
  hideOptional,
  setHideOptional,
  method,
  setMethod,
}: {
  question: TextbookQuestion;
  hideOptional: boolean;
  setHideOptional: (value: boolean) => void;
  method: ExplanationMethod;
  setMethod: (method: ExplanationMethod) => void;
}) {
  const move = simpleMove(question.expression, true);
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-navy text-xl font-semibold">
          {c.reference(question.exercise, question.question, question.part)}
        </h3>
        <p className="text-pencil text-sm">
          {c.page(question.page)} · {c.levelName(question.level)}
        </p>
      </div>
      {move ? (
        <SignMagnitude
          move={move}
          expression={question.expression}
          method={method}
          onMethodChange={setMethod}
          wide
        />
      ) : (
        <AnimatedWorking
          expression={question.expression}
          hideOptional={hideOptional}
          setHideOptional={setHideOptional}
        />
      )}
      {parseJourney(question.expression).ok && (
        <a
          className={`${button} inline-flex`}
          href={`#add-subtract:e=${encodeURIComponent(question.expression)}`}
        >
          {c.bird} →
        </a>
      )}
    </div>
  );
}

export default function TextbookMode({
  initialQuestion,
}: {
  initialQuestion?: string;
}) {
  const presenting = usePresentation();
  const [hideOptional, setHideOptional] = useState(false);
  const [method, setMethod] = useState<ExplanationMethod>("number-line");
  const initial =
    textbookQuestions.find((q) => q.id === initialQuestion) ??
    textbookQuestions[0];
  const [exercise, setExercise] = useState<TextbookQuestion["exercise"]>(
    initial.exercise,
  );
  const [level, setLevel] = useState("all"),
    [index, setIndex] = useState(
      textbookQuestions
        .filter((q) => q.exercise === initial.exercise)
        .findIndex((q) => q.id === initial.id),
    );
  const questions = textbookQuestions.filter(
    (q) =>
      q.exercise === exercise && (level === "all" || q.level === Number(level)),
  );
  const question = questions[index];
  function remember(q: TextbookQuestion) {
    window.history.replaceState(null, "", `#textbook:e=${q.id}`);
  }
  function choose(next: number) {
    setIndex(next);
    remember(questions[next]);
  }
  return (
    <section className={`min-w-0 space-y-5 ${presenting ? "text-xl" : ""}`}>
      {!presenting && (
        <h2 className="font-display text-navy text-2xl font-semibold">
          {c.title}
        </h2>
      )}
      {!presenting && (
        <p className="text-pencil max-w-3xl">{t.textbookIntro}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          {c.exercise}
          <select
            className={field}
            value={exercise}
            onChange={(e) => {
              setExercise(e.target.value as TextbookQuestion["exercise"]);
              setIndex(0);
              remember(
                textbookQuestions.find(
                  (q) =>
                    q.exercise === e.target.value &&
                    (level === "all" || q.level === Number(level)),
                )!,
              );
            }}
          >
            {["2B", "2C", "R2"].map((name) => (
              <option key={name} value={name}>
                {c.exerciseName(name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c.level}
          <select
            className={field}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setIndex(0);
              remember(
                textbookQuestions.find(
                  (q) =>
                    q.exercise === exercise &&
                    (e.target.value === "all" ||
                      q.level === Number(e.target.value)),
                )!,
              );
            }}
          >
            <option value="all">{c.all}</option>
            {[1, 2].map((n) => (
              <option key={n} value={n}>
                {c.levelName(n)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c.question}
          <select
            className={field}
            value={index}
            onChange={(e) => choose(Number(e.target.value))}
          >
            {questions.map((q, i) => (
              <option
                key={q.id}
                value={i}
              >{`Q${q.question}(${q.part})`}</option>
            ))}
          </select>
        </label>
      </div>
      {!presenting && (
        <p className="text-pencil text-sm">
          {t.selected(index + 1, questions.length)}
        </p>
      )}
      <DemonstrationQuestion
        key={question.id}
        question={question}
        hideOptional={hideOptional}
        setHideOptional={setHideOptional}
        method={method}
        setMethod={setMethod}
      />
      <div className="flex flex-wrap justify-between gap-3">
        <button
          className={button}
          disabled={index === 0}
          onClick={() => choose(index - 1)}
        >
          ← {c.previous}
        </button>
        <button
          className={button}
          disabled={index === questions.length - 1}
          onClick={() => choose(index + 1)}
        >
          {c.next} →
        </button>
      </div>
      <footer className="border-grid text-pencil space-y-2 border-t pt-4 text-sm">
        <p>{c.coverage}</p>
        <p>{c.source}</p>
      </footer>
    </section>
  );
}
