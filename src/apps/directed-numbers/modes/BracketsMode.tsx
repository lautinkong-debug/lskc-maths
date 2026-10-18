import styles from "../DirectedNumbers.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { evaluate, parseAnswer, type Ast } from "../lib/parse";
import { abs, equals, neg, toText, compare } from "../lib/rational";
import {
  bracketSteps,
  expressionTex,
  parseAdditive,
  signedTerms,
  sumRule,
  termsTex,
  totals,
  type NumberStyle,
} from "../lib/steps";
import { AdditiveInput } from "../components/AdditiveInput";
import { usePrediction } from "../components/usePrediction";
import { lessonKey } from "../components/LessonKeys";
import { button, field, primary } from "../components/ui";
const c = copy.apps.directedNumbers,
  b = c.bracketLesson;
const examples = [
  "(+2) + (−3) − (−8)",
  "(−1) − (+3.8) − (−1.5)",
  "−3/2 + [4 + (−5)]",
  "(+4) − [(+4) + (+2)]",
  "(−7) + (+3)",
  "(+3) + (−3)",
  "(−4) + (−2)",
  "−(−4)",
];
const initial = parseAdditive(examples[0]);
if (!initial.ok) throw new Error("Invalid lesson preset");
const defaultAst = initial.value;
function initialAst(value?: string) {
  const result = value ? parseAdditive(value) : null;
  return result?.ok ? result.value : defaultAst;
}
function Snippet({
  ast,
  target,
  onTap,
  style,
}: {
  ast: Ast;
  target?: Ast;
  onTap: () => void;
  style: NumberStyle;
}) {
  if (ast === target)
    return (
      <button
        className="bg-highlight/40 border-highlight min-h-12 rounded border-2 px-2 py-1"
        onClick={onTap}
        aria-label={b.remove}
      >
        <Tex>{expressionTex(ast, style)}</Tex>
      </button>
    );
  if (ast.kind === "binary")
    return (
      <>
        <Snippet ast={ast.left} target={target} onTap={onTap} style={style} />
        <Tex className={ast.right === target ? "bg-highlight/40 px-1" : ""}>
          {ast.op}
        </Tex>
        <Snippet ast={ast.right} target={target} onTap={onTap} style={style} />
      </>
    );
  if (ast.kind === "group" && ast.child.kind === "number")
    return <Tex>{expressionTex(ast, style)}</Tex>;
  if (ast.kind === "group" || ast.kind === "unary") {
    const left = ast.kind === "unary" ? ast.op : ast.bracket,
      right = ast.kind === "unary" ? "" : ast.bracket === "[" ? "]" : ")";
    return (
      <>
        <Tex>{left}</Tex>
        <Snippet ast={ast.child} target={target} onTap={onTap} style={style} />
        <Tex>{right}</Tex>
      </>
    );
  }
  return <Tex>{expressionTex(ast, style)}</Tex>;
}
function targetGroup(
  ast: Ast,
  span?: { start: number; end: number },
): Ast | undefined {
  if (!span) return undefined;
  if (
    ast.kind === "group" &&
    ast.child.kind === "number" &&
    ast.span.start >= span.start &&
    ast.span.end <= span.end
  )
    return ast;
  if (ast.kind === "binary")
    return targetGroup(ast.left, span) ?? targetGroup(ast.right, span);
  if (ast.kind === "group" || ast.kind === "unary")
    return targetGroup(ast.child, span);
}
export default function BracketsMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const [numberStyle, setNumberStyle] = useState<NumberStyle>(
    initialExpression?.includes(".") && !initialExpression.includes("/")
      ? "decimal"
      : "improper",
  );
  const [ast, setAst] = useState(() => initialAst(initialExpression)),
    [input, setInput] = useState(initialExpression ?? examples[0]);
  const [position, setPosition] = useState(0),
    [example, setExample] = useState(0),
    [predict, setPredict] = usePrediction(presenting);
  const [prediction, setPrediction] = useState(""),
    [revealed, setRevealed] = useState(false),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState(""),
    [reorder, setReorder] = useState(false);
  const steps = useMemo(() => bracketSteps(ast), [ast]);
  const working = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (working.current)
      working.current.scrollTop = working.current.scrollHeight;
  }, [position]);
  const nextStep = steps[position],
    last = steps[position - 1],
    current = last?.ast ?? ast,
    result = evaluate(ast),
    terms = signedTerms(ast),
    total = totals(terms);
  const canPredict =
    !!nextStep && ["++", "+-", "-+", "--"].includes(nextStep.ruleId);
  const hidden = predict && canPredict && !revealed;
  const finished = position === steps.length;
  const allBracketsGone = !steps
    .slice(position)
    .some((s) => s.kind === "bracket");
  const scale = Math.max(
    total.positive.n / total.positive.d,
    total.negative.n / total.negative.d,
    1,
  );
  function load(next: Ast) {
    setAst(next);
    setPosition(0);
    setPrediction("");
    setRevealed(false);
    setAnswer("");
    setFeedback("");
    setReorder(false);
  }
  function next() {
    if (hidden) {
      setRevealed(true);
      return;
    }
    setPosition(Math.min(steps.length, position + 1));
    setRevealed(false);
    setPrediction("");
  }
  function back() {
    setPosition(Math.max(0, position - 1));
    setRevealed(false);
    setPrediction("");
    setFeedback("");
  }
  function fresh() {
    const index = (example + 1) % examples.length;
    setExample(index);
    setInput(examples[index]);
    const parsed = parseAdditive(examples[index]);
    if (parsed.ok) {
      load(parsed.value);
      setNumberStyle(
        examples[index].includes(".") && !examples[index].includes("/")
          ? "decimal"
          : "improper",
      );
    }
  }
  function choose(sign: string) {
    const right =
      nextStep?.ruleId === "++" || nextStep?.ruleId === "--" ? "+" : "-";
    setPrediction(sign === right ? b.predictRight : b.predictWrong);
    if (sign === right) setRevealed(true);
  }
  function check() {
    const parsed = parseAnswer(answer);
    setFeedback(
      !parsed.ok
        ? parsed.message
        : equals(parsed.value, result)
          ? b.correct
          : equals(abs(parsed.value), abs(result))
            ? b.wrongSign
            : b.wrongSize,
    );
  }
  const rule = canPredict && !hidden ? nextStep.ruleId : last?.ruleId;
  const sumsNote = b.notes[sumRule(total.positive, neg(total.negative))];
  return (
    <section
      tabIndex={0}
      aria-label={b.title}
      onKeyDown={(event) =>
        lessonKey(event, presenting, {
          next,
          back,
          reveal: () => setRevealed(true),
          newExample: fresh,
          predict: () => {
            setPredict(!predict);
            setRevealed(false);
          },
        })
      }
      className={`min-w-0 space-y-4 ${presenting ? "text-xl" : ""}`}
    >
      <h2 className="font-display text-navy text-2xl font-semibold">
        {b.title}
      </h2>
      {!presenting && <p>{b.intro}</p>}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[3fr_2fr]">
        <div className={styles.graphBoard}>
          <div
            className={`flex min-h-24 items-center gap-2 overflow-x-auto py-4 whitespace-nowrap ${presenting ? "text-4xl" : "text-2xl"}`}
          >
            <Snippet
              style={numberStyle}
              ast={current}
              target={
                nextStep?.kind === "bracket"
                  ? targetGroup(current, nextStep.sourceHighlight)
                  : undefined
              }
              onTap={next}
            />
          </div>
          <p className="min-h-12" aria-live="polite">
            {hidden
              ? b.predict
              : finished
                ? b.finished
                : nextStep?.kind === "bracket"
                  ? b.tap
                  : allBracketsGone
                    ? b.ready
                    : b.inside}
          </p>
          {hidden && (
            <div className="flex gap-3">
              <button className={button} onClick={() => choose("+")}>
                <Tex>+</Tex>
              </button>
              <button className={button} onClick={() => choose("-")}>
                <Tex>-</Tex>
              </button>
            </div>
          )}
          {prediction && (
            <p role="status" className="text-crimson-deep my-3">
              {prediction}
            </p>
          )}
          {last && (
            <p
              className="border-highlight my-3 border-l-4 pl-3"
              aria-live="polite"
            >
              {b.notes[last.noteKey]}
            </p>
          )}
          {allBracketsGone && (
            <section className="mt-4">
              <h3 className="font-display text-navy text-xl font-semibold">
                {b.signSize}
              </h3>
              <p className="mt-2">{sumsNote}</p>
              <svg
                viewBox="0 0 500 140"
                role="img"
                aria-label={b.barLabel(
                  toText(total.positive, { style: numberStyle }),
                  toText(total.negative, { style: numberStyle }),
                )}
                className="text-navy mt-3 w-full max-w-xl"
              >
                <path d="M140 12V116" stroke="currentColor" strokeWidth="2" />
                <text x="8" y="37" fontSize="18" fill="currentColor">
                  {b.gain} {toText(total.positive, { style: numberStyle })}
                </text>
                <rect
                  x="140"
                  y="18"
                  width={(320 * (total.positive.n / total.positive.d)) / scale}
                  height="27"
                  fill="currentColor"
                />
                <text x="8" y="88" fontSize="18" fill="currentColor">
                  {b.loss} {toText(total.negative, { style: numberStyle })}
                </text>
                <rect
                  x="140"
                  y="69"
                  width={(320 * (total.negative.n / total.negative.d)) / scale}
                  height="27"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                <text
                  x="140"
                  y="137"
                  textAnchor="middle"
                  fontSize="18"
                  fill="currentColor"
                >
                  0
                </text>
              </svg>
              {finished && (
                <p aria-live="polite">
                  {b.signExplain(
                    toText(total.positive, { style: numberStyle }),
                    toText(total.negative, { style: numberStyle }),
                    toText(result, { style: numberStyle }),
                  )}
                </p>
              )}
              <label className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reorder}
                  onChange={(e) => setReorder(e.target.checked)}
                />
                {b.reorder}
              </label>
              {reorder && (
                <>
                  <div className="mt-2 overflow-x-auto py-2 text-2xl">
                    <Tex>
                      {termsTex(
                        [...terms].sort((a, b) => compare(b, a)),
                        numberStyle,
                      )}
                    </Tex>
                  </div>
                  <p className="mt-2">{b.reorderHelp}</p>
                </>
              )}
            </section>
          )}
        </div>
        <aside className="min-w-0 space-y-4">
          <section className="border-grid bg-paper rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {c.working}
            </h3>
            <div
              ref={working}
              className={`mt-3 max-h-64 space-y-3 overflow-auto pb-2 ${presenting ? "text-3xl" : "text-xl"}`}
            >
              <Tex className="block whitespace-nowrap">
                {expressionTex(ast, numberStyle)}
              </Tex>
              {steps.slice(0, position).map((step, i) => (
                <div key={i}>
                  <Tex
                    className={`inline-block whitespace-nowrap ${i === steps.length - 1 ? "border-navy border-b-4 border-double pb-1" : ""} ${i === position - 1 ? "bg-highlight/30" : ""}`}
                  >{`= ${expressionTex(step.ast, numberStyle)}`}</Tex>
                </div>
              ))}
            </div>
          </section>
          <section className="border-grid rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {b.rules}
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {Object.entries(b.rulesTex).map(([id, tex]) => (
                <div
                  key={id}
                  className={`overflow-x-auto rounded p-2 ${rule === id ? "bg-highlight/40 border-navy border" : "border border-transparent"}`}
                >
                  <Tex>{tex}</Tex>
                </div>
              ))}
            </div>
            <p className="mt-2">{b.summary}</p>
          </section>
        </aside>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="mr-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={predict}
            onChange={(e) => {
              setPredict(e.target.checked);
              setRevealed(false);
            }}
          />
          {c.predict}
        </label>
        <button className={button} disabled={!position} onClick={back}>
          ← {c.back}
        </button>
        <button className={primary} disabled={finished} onClick={next}>
          {hidden
            ? c.showMe
            : nextStep?.kind === "bracket"
              ? b.remove
              : b.calculate}{" "}
          →
        </button>
        <button className={button} onClick={() => load(ast)}>
          {c.reset}
        </button>
        <button className={button} onClick={fresh}>
          {c.newExample}
        </button>
        <span className="text-sm">{c.progress(position, steps.length)}</span>
      </div>
      <AdditiveInput
        value={input}
        onChange={setInput}
        onLoad={(next) => {
          load(next);
          setNumberStyle(
            input.includes(".") && !input.includes("/")
              ? "decimal"
              : "improper",
          );
        }}
        presenting={presenting}
      />
      {!presenting && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
            className="border-grid rounded border p-4"
          >
            <label htmlFor="dn-bracket-answer" className="font-semibold">
              {b.answer}
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="dn-bracket-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={`${field} max-w-xs`}
              />
              <button className={`${button} mt-1`}>{b.check}</button>
              <button
                type="button"
                className={`${button} mt-1`}
                onClick={() => {
                  setPosition(steps.length);
                  setFeedback("");
                }}
              >
                {c.showMe}
              </button>
            </div>
            <p role="status" className="text-crimson-deep mt-2">
              {feedback}
            </p>
          </form>
          <details>
            <summary className="min-h-12 cursor-pointer py-3 font-semibold">
              {b.think}
            </summary>
            <p>{b.thought}</p>
          </details>
        </>
      )}
      <details>
        <summary className="min-h-12 cursor-pointer py-3">{c.keys}</summary>
        <p>{b.keys}</p>
      </details>
      <div className="flex flex-wrap gap-3">
        <a href="#multiply-divide" className={button}>
          {b.next}
        </a>
        <a href="#play" className={button}>
          {b.play}
        </a>
      </div>
    </section>
  );
}
