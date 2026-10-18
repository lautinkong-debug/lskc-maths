import styles from "../DirectedNumbers.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { ArithmeticInput } from "../components/ArithmeticInput";
import { lessonKey } from "../components/LessonKeys";
import { usePrediction } from "../components/usePrediction";
import { button, field, primary } from "../components/ui";
import {
  evaluate,
  parse,
  parseAnswer,
  type Ast,
  type Span,
} from "../lib/parse";
import { abs, equals, terminates, toTex } from "../lib/rational";
import { expressionTex, workOut, type RuleId } from "../lib/steps";

const c = copy.apps.directedNumbers;
const m = c.mixedLesson;
const presets = [
  "(+4) + (+3) × (−2)",
  "(−18) ÷ (+3) − (−2)",
  "[(+5) − (−4)] × (−2)",
  "(−1.5) × (+4) + (+7)",
  "(−2 1/4) ÷ (+3/2) + (+1)",
  "[(−6) + (+2)] ÷ (−4)",
  "12/(5 + (−8)) − (−3)",
  "[(−15) + (+7) × (−2)] / [(−3)(+2) + 1]",
];
const defaultParsed = parse(presets[0]);
if (!defaultParsed.ok) throw new Error("Invalid mixed lesson preset");
const defaultAst = defaultParsed.value;
function startingAst(source?: string) {
  const parsed = source ? parse(source) : null;
  return parsed?.ok ? parsed.value : defaultAst;
}
function operations(ast: Ast): { span: Span; tex: string }[] {
  if (ast.kind === "number") return [];
  if (ast.kind === "group" || ast.kind === "unary")
    return operations(ast.child);
  return [
    ...operations(ast.left),
    { span: ast.span, tex: expressionTex(ast) },
    ...operations(ast.right),
  ];
}
function noteFor(rule: RuleId): string {
  if (rule in c.bracketLesson.notes)
    return c.bracketLesson.notes[rule as keyof typeof c.bracketLesson.notes];
  return c.arithmetic.notes[rule as keyof typeof c.arithmetic.notes];
}

export default function MixedMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const [ast, setAst] = useState(() => startingAst(initialExpression));
  const [input, setInput] = useState(initialExpression ?? presets[0]);
  const [presetIndex, setPresetIndex] = useState(0);
  const [signWorking, setSignWorking] = useState(false);
  const [decimal, setDecimal] = useState(false);
  const [predict, setPredict] = usePrediction(presenting);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerNote, setAnswerNote] = useState("");
  const working = useRef<HTMLDivElement>(null);
  const steps = useMemo(
    () => workOut(ast, { signWorking }),
    [ast, signWorking],
  );
  const result = evaluate(ast);
  const finished = position >= steps.length;
  const nextStep = steps[position];
  const current = position ? steps[position - 1].ast : ast;
  const hidden = predict && !revealed && !finished;
  const choices = nextStep?.kind === "mixed" ? [] : operations(current);
  const canChoose = !finished && choices.length > 0 && (hidden || !predict);
  useEffect(() => {
    working.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
  }, [position]);
  function load(next: Ast, source: string) {
    setAst(next);
    setInput(source);
    setPosition(0);
    setRevealed(false);
    setFeedback("");
    setAnswer("");
    setAnswerNote("");
  }
  function newExample() {
    const index = (presetIndex + 1) % presets.length;
    const parsed = parse(presets[index]);
    if (!parsed.ok) throw new Error("Invalid mixed lesson preset");
    setPresetIndex(index);
    load(parsed.value, presets[index]);
  }
  function next() {
    if (finished) return;
    if (hidden) {
      setRevealed(true);
      return;
    }
    const wasSignLine = nextStep.kind === "sign";
    setPosition(position + 1);
    setRevealed(wasSignLine);
    setFeedback("");
  }
  function back() {
    if (position === 0) return;
    setPosition(position - 1);
    setRevealed(true);
    setFeedback("");
  }
  function choose(span: Span) {
    if (!nextStep) return;
    if (
      span.start === nextStep.sourceHighlight.start &&
      span.end === nextStep.sourceHighlight.end
    ) {
      setRevealed(true);
      setFeedback(m.choiceRight);
    } else {
      setFeedback(m.choiceWrong(nextStep.ruleId));
    }
  }
  function checkAnswer() {
    const parsed = parseAnswer(answer);
    setAnswerNote(
      !parsed.ok
        ? parsed.message
        : equals(parsed.value, result)
          ? m.answerRight
          : equals(abs(parsed.value), abs(result))
            ? m.wrongSign
            : m.wrongSize,
    );
  }
  const activeRule = nextStep?.ruleId ?? steps.at(-1)?.ruleId;
  return (
    <section
      tabIndex={0}
      aria-label={m.title}
      onKeyDown={(event) =>
        lessonKey(event, presenting, {
          next,
          back,
          reveal: () => setRevealed(true),
          newExample,
          predict: () => {
            setPredict(!predict);
            setRevealed(false);
          },
        })
      }
      className={`min-w-0 space-y-4 ${presenting ? "text-xl" : ""}`}
    >
      <h2 className="font-display text-navy text-2xl font-semibold">
        {m.title}
      </h2>
      {!presenting && <p>{m.intro}</p>}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`${styles.graphBoard} space-y-4`}>
          <div
            className={`min-w-0 overflow-x-auto py-3 ${presenting ? "text-4xl" : "text-2xl"}`}
          >
            <Tex className="whitespace-nowrap">
              {position ? steps[position - 1].tex : expressionTex(ast)}
            </Tex>
          </div>
          <p className="font-semibold" aria-live="polite">
            {finished ? m.finished : hidden ? m.predictPrompt : m.nextPrompt}
          </p>
          {canChoose && (
            <div className="space-y-2">
              <h3 className="font-display text-navy text-xl font-semibold">
                {m.choose}
              </h3>
              <div className="flex flex-wrap gap-2">
                {choices.map((choice, index) => (
                  <button
                    key={`${choice.span.start}-${choice.span.end}-${index}`}
                    className={button}
                    onClick={() => choose(choice.span)}
                    aria-label={m.choiceLabel(index + 1)}
                  >
                    <Tex>{choice.tex}</Tex>
                  </button>
                ))}
              </div>
              {feedback && (
                <p
                  role="status"
                  className={
                    feedback === m.choiceRight
                      ? "text-navy"
                      : "text-crimson-deep"
                  }
                >
                  {feedback}
                </p>
              )}
            </div>
          )}
          {nextStep && !hidden && (
            <p className="border-highlight border-l-4 pl-3">
              {noteFor(nextStep.noteKey)}
            </p>
          )}
        </div>
        <aside className="min-w-0 space-y-4">
          <section className="border-grid bg-paper min-w-0 rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {c.working}
            </h3>
            <div
              ref={working}
              className={`mt-3 max-h-72 space-y-2 overflow-auto pb-2 ${presenting ? "text-3xl" : "text-xl"}`}
            >
              <Tex className="block whitespace-nowrap">
                {expressionTex(ast)}
              </Tex>
              {steps.slice(0, position).map((step, index) => (
                <div key={index}>
                  <Tex
                    className={`inline-block whitespace-nowrap ${index === steps.length - 1 ? "border-navy border-b-4 border-double pb-1" : ""} ${index === position - 1 ? "bg-highlight/30" : ""}`}
                  >{`= ${step.tex}`}</Tex>
                  {index === position - 1 && (
                    <p className="text-pencil mt-1 text-sm">
                      {noteFor(step.noteKey)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="border-grid min-w-0 rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {m.rules}
            </h3>
            <ol className="mt-2 space-y-2">
              {m.order.map((rule, index) => (
                <li
                  key={rule}
                  className={`rounded px-2 py-1 ${
                    (index === 0 && activeRule === "inner-brackets-first") ||
                    (index === 1 &&
                      activeRule &&
                      [
                        "mult-div-first",
                        "reciprocal",
                        "same-sign-product",
                        "diff-sign-product",
                        "same-sign-quotient",
                        "diff-sign-quotient",
                      ].includes(activeRule)) ||
                    (index === 2 && activeRule === "left-to-right")
                      ? "bg-highlight/40 border-navy border"
                      : ""
                  }`}
                >
                  {rule}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="mr-2 flex min-h-12 items-center gap-2">
          <input
            type="checkbox"
            checked={predict}
            onChange={(event) => {
              setPredict(event.target.checked);
              setRevealed(false);
            }}
          />
          {c.predict}
        </label>
        <button className={button} disabled={position === 0} onClick={back}>
          ← {c.back}
        </button>
        <button className={primary} disabled={finished} onClick={next}>
          {hidden ? c.showMe : m.nextStep} →
        </button>
        <button
          className={button}
          onClick={() => {
            setPosition(0);
            setRevealed(false);
            setFeedback("");
            setAnswerNote("");
          }}
        >
          {c.reset}
        </button>
        <button className={button} onClick={newExample}>
          {c.newExample}
        </button>
        <span className="text-pencil text-sm">
          {c.progress(position, steps.length)}
        </span>
      </div>
      {!presenting && (
        <div className="flex flex-wrap gap-3">
          {presets.map((source, index) => (
            <button
              key={source}
              className={`${button} text-sm`}
              onClick={() => {
                const parsed = parse(source);
                if (!parsed.ok) return;
                setPresetIndex(index);
                load(parsed.value, source);
              }}
            >
              {m.preset(index + 1)}
            </button>
          ))}
        </div>
      )}
      {!presenting && (
        <ArithmeticInput
          value={input}
          onChange={setInput}
          onLoad={(next) => load(next, input)}
          presenting={presenting}
        />
      )}
      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-12 items-center gap-2">
          <input
            type="checkbox"
            checked={signWorking}
            onChange={(event) => {
              setSignWorking(event.target.checked);
              setPosition(0);
              setRevealed(false);
            }}
          />
          {m.signWorking}
        </label>
        {terminates(result) && result.d !== 1 && (
          <label className="flex min-h-12 items-center gap-2">
            <input
              type="checkbox"
              checked={decimal}
              onChange={(event) => setDecimal(event.target.checked)}
            />
            {m.decimal}
          </label>
        )}
      </div>
      {finished && decimal && (
        <p className="text-navy font-semibold">
          {m.decimalAnswer} <Tex>{toTex(result, { style: "decimal" })}</Tex>
        </p>
      )}
      {!presenting && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            checkAnswer();
          }}
          className="border-grid bg-paper rounded border p-4"
        >
          <label htmlFor="dn-mixed-answer" className="font-semibold">
            {m.answer}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="dn-mixed-answer"
              className={`${field} max-w-xs`}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <button className={`${button} mt-1`} type="submit">
              {m.check}
            </button>
            <button
              className={`${button} mt-1`}
              type="button"
              onClick={() => {
                setPosition(steps.length);
                setRevealed(true);
                setAnswerNote("");
              }}
            >
              {c.showMe}
            </button>
          </div>
          {answerNote && (
            <p role="status" className="text-crimson-deep mt-2">
              {answerNote}
            </p>
          )}
        </form>
      )}
      <details>
        <summary className="min-h-12 cursor-pointer py-2 font-semibold">
          {m.think}
        </summary>
        <p>{m.thought}</p>
      </details>
      <a className={`${button} inline-flex items-center`} href="#play">
        {m.play} →
      </a>
    </section>
  );
}
