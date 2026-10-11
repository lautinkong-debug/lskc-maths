import { useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { button, field, primary } from "../components/ui";
import { SignMagnitude } from "../components/SignMagnitude";
import { parse, parseAnswer } from "../lib/parse";
import { equals, abs, toTex } from "../lib/rational";
import { expressionTex, workOut } from "../lib/steps";
import { parseJourney } from "../lib/moves";
import {
  textbookQuestions,
  simpleMove,
  type TextbookQuestion,
} from "../lib/textbook";
const c = copy.apps.directedNumbers.textbookLesson;

function PracticeQuestion({
  question,
  onCorrect,
}: {
  question: TextbookQuestion;
  onCorrect: () => void;
}) {
  const [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState("");
  const [showWorking, setShowWorking] = useState(false);
  const parsed = parse(question.expression),
    expected = parseAnswer(question.answer);
  if (!parsed.ok || !expected.ok) return null; // The complete bank is validated in textbook.test.ts.
  const move = simpleMove(question.expression);
  const bird = parseJourney(question.expression).ok;
  return (
    <div className="min-w-0 space-y-5">
      <div className="border-grid bg-navy-wash space-y-3 rounded border p-5">
        <h3 className="text-navy font-semibold">
          {c.reference(question.exercise, question.question, question.part)}
        </h3>
        <p className="text-pencil text-sm">
          {c.page(question.page)} · {c.levelName(question.level)}
        </p>
        <div className="overflow-x-auto py-3 text-2xl">
          <Tex>{expressionTex(parsed.value)}</Tex>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const submitted = parseAnswer(answer);
            if (!submitted.ok) {
              setFeedback(submitted.message);
              return;
            }
            if (equals(submitted.value, expected.value)) {
              setFeedback(c.correct);
              onCorrect();
            } else
              setFeedback(
                equals(abs(submitted.value), abs(expected.value))
                  ? c.signHint
                  : c.retry,
              );
          }}
        >
          <label className="block max-w-sm font-semibold">
            {c.answer}
            <input
              className={field}
              autoComplete="off"
              value={answer}
              aria-describedby="textbook-answer-help"
              onChange={(e) => {
                setAnswer(e.target.value);
                setFeedback("");
              }}
            />
          </label>
          <p id="textbook-answer-help" className="text-sm">
            {c.answerHelp}
          </p>
          <button className={primary}>{c.check}</button>
          {feedback && (
            <p role="status" className="font-medium">
              {feedback}
            </p>
          )}
        </form>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className={button}
          aria-expanded={showWorking}
          onClick={() => setShowWorking((value) => !value)}
        >
          {showWorking ? c.hide : c.reveal}
        </button>
        {bird && (
          <a
            className={button}
            href={`#add-subtract:e=${encodeURIComponent(question.expression)}`}
          >
            {c.bird} →
          </a>
        )}
        {move && (
          <a
            className={button}
            href={`#sign-magnitude:e=${encodeURIComponent(question.expression)}`}
          >
            {c.magnitude} →
          </a>
        )}
      </div>
      {showWorking && (
        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <section
            className="border-grid min-w-0 space-y-3 rounded border p-4"
            aria-label={c.working}
          >
            <h3 className="font-semibold">{c.working}</h3>
            <ol className="space-y-3">
              {workOut(parsed.value).map((step, index) => (
                <li
                  key={index}
                  className="overflow-x-auto border-l-2 border-[#c8d8e6] pl-3 text-xl"
                >
                  <Tex>{`= ${step.tex}`}</Tex>
                </li>
              ))}
            </ol>
            <p className="border-grid border-t pt-3 font-semibold">
              {c.result}:{" "}
              <Tex>
                {toTex(expected.value, {
                  style: question.answer.includes(".") ? "decimal" : "improper",
                })}
              </Tex>
            </p>
          </section>
          {move && <SignMagnitude move={move} staticResult />}
        </div>
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
  const initial =
    textbookQuestions.find((q) => q.id === initialQuestion) ??
    textbookQuestions[0];
  const [exercise, setExercise] = useState<"2B" | "2C">(initial.exercise);
  const [level, setLevel] = useState("all"),
    [index, setIndex] = useState(
      textbookQuestions
        .filter((q) => q.exercise === initial.exercise)
        .findIndex((q) => q.id === initial.id),
    );
  const [correct, setCorrect] = useState<Set<string>>(new Set());
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
      <h2 className="font-display text-navy text-2xl font-semibold">
        {c.title}
      </h2>
      <p className="text-pencil max-w-3xl">{c.intro}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          {c.exercise}
          <select
            className={field}
            value={exercise}
            onChange={(e) => {
              setExercise(e.target.value as "2B" | "2C");
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
            {["2B", "2C"].map((name) => (
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
      <p className="text-pencil text-sm">
        {c.progress(
          index + 1,
          questions.length,
          questions.filter((q) => correct.has(q.id)).length,
        )}
      </p>
      <PracticeQuestion
        key={question.id}
        question={question}
        onCorrect={() =>
          setCorrect((previous) => new Set(previous).add(question.id))
        }
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
