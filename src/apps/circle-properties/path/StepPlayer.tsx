import { useEffect, useRef, useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import Figure from "./Figure";
import { tools } from "./tools";
import type { Script, ScriptStep } from "./types";
import type { Tones } from "./figureModel";
import s from "./path.module.css";

/** The written line, with its blank shown as a slot or as the chosen words. */
function Line({ step, filled }: { step: ScriptStep; filled: boolean }) {
  if (!step.line) return null;
  const [before, after = ""] = step.line.split("___");
  if (!step.blank || !step.line.includes("___"))
    return <MathText>{step.line}</MathText>;
  return (
    <>
      <MathText>{before}</MathText>
      <span className={s.slot} data-filled={filled}>
        {filled ? (
          <MathText>{step.blank.options[step.blank.answer]}</MathText>
        ) : (
          "?"
        )}
      </span>
      <MathText>{after}</MathText>
    </>
  );
}

/**
 * Tells a proof or a worked example one line at a time. Each line lights up
 * its part of the figure and asks for one small decision.
 */
export default function StepPlayer({
  script,
  onDone,
}: {
  script: Script;
  onDone: (firstTry: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [helped, setHelped] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const steps = script.steps,
    step = steps[index];
  const needsAnswer = Boolean(step.blank) && !solved;
  const reached = finished ? steps.length : index + 1;

  let tones: Tones = {},
    turn = 0;
  for (const earlier of steps.slice(0, reached)) {
    tones = { ...tones, ...earlier.show };
    if (earlier.turn !== undefined) turn = earlier.turn;
  }

  useEffect(() => {
    // Bring the new line into view on a phone, where the figure sits above it.
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index, finished]);

  function answer(option: number) {
    if (!step.blank || solved) return;
    if (option === step.blank.answer) {
      setSolved(true);
      return;
    }
    const next = wrong.includes(option) ? wrong : [...wrong, option];
    setWrong(next);
    // Two misses: show the words, so nobody is stuck on one line.
    if (next.length >= 2 || next.length >= step.blank.options.length - 1) {
      setHelped(true);
      setSolved(true);
    }
  }
  function next() {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
      setSolved(false);
      setWrong([]);
      setToolOpen(false);
    } else {
      setFinished(true);
      onDone(!helped);
    }
  }
  function restart() {
    setIndex(0);
    setSolved(false);
    setWrong([]);
    setHelped(false);
    setFinished(false);
    setToolOpen(false);
  }
  const lastWrong = wrong.at(-1);
  const shownAnswer = solved && wrong.length >= 2;
  const tool = step.tool ? tools[step.tool] : undefined;

  return (
    <div className={s.split}>
      <div className={s.board}>
        <Figure
          figure={script.figure}
          tones={tones}
          focus={finished ? [] : step.focus}
          turn={turn}
        />
        <p className={s.key}>
          <span data-key="given">{c.keyGiven}</span>
          <span data-key="get">{c.keyGet}</span>
          <span data-key="focus">{c.keyFocus}</span>
        </p>
      </div>
      <div className={s.task}>
        <h3 className={s.taskTitle}>
          <MathText>{script.title}</MathText>
        </h3>
        <dl className={s.knowWant}>
          <div data-kind="given">
            <dt>{script.kind === "proof" ? c.weKnow : c.given}</dt>
            <dd>
              <MathText>{script.know}</MathText>
            </dd>
          </div>
          <div data-kind="get">
            <dt>{script.kind === "proof" ? c.weWant : c.find}</dt>
            <dd>
              <MathText>{script.want}</MathText>
            </dd>
          </div>
        </dl>
        {reached > 1 || finished ? (
          <ol className={s.written} aria-label={c.writtenSoFar}>
            {steps.slice(0, finished ? steps.length : index).map(
              (earlier, i) =>
                earlier.line && (
                  <li key={i}>
                    <Line step={earlier} filled />
                  </li>
                ),
            )}
          </ol>
        ) : null}
        {finished ? (
          <div className={s.moral} ref={cardRef}>
            <strong>
              {script.kind === "proof" ? c.proofDone : c.workedDone}
            </strong>
            <p>
              <MathText>{script.moral}</MathText>
            </p>
            <button type="button" className={s.quiet} onClick={restart}>
              {c.again}
            </button>
          </div>
        ) : (
          <div className={s.stepCard} ref={cardRef}>
            <p className={s.count}>{c.lineOf(index + 1, steps.length)}</p>
            <p className={s.say}>
              <MathText>{step.say}</MathText>
            </p>
            {step.line && (
              <p className={s.line}>
                <Line step={step} filled={solved} />
              </p>
            )}
            {step.blank && (
              <div className={s.chips} role="group" aria-label={c.fillBlank}>
                {step.blank.options.map((option, i) => (
                  <button
                    type="button"
                    key={option}
                    className={s.chip}
                    data-state={
                      solved && i === step.blank!.answer
                        ? "right"
                        : wrong.includes(i)
                          ? "wrong"
                          : undefined
                    }
                    disabled={solved || wrong.includes(i)}
                    onClick={() => answer(i)}
                  >
                    <MathText>{option}</MathText>
                  </button>
                ))}
              </div>
            )}
            <p
              className={s.feedback}
              role="status"
              data-tone={
                step.blank
                  ? solved
                    ? shownAnswer
                      ? "shown"
                      : "right"
                    : lastWrong !== undefined
                      ? "wrong"
                      : undefined
                  : undefined
              }
            >
              {step.blank && solved && !shownAnswer && <strong>{c.yes}</strong>}
              {step.blank && shownAnswer && (
                <>
                  <strong>{c.hereItIs}</strong>{" "}
                  <MathText>
                    {c.answerIs(step.blank.options[step.blank.answer])}
                  </MathText>
                </>
              )}
              {step.blank && !solved && lastWrong !== undefined && (
                <>
                  <strong>{c.notYet}</strong>{" "}
                  <MathText>
                    {step.blank.why?.[lastWrong] ?? c.lookYellow}
                  </MathText>
                </>
              )}
            </p>
            {tool && (
              <div className={s.tool}>
                <button
                  type="button"
                  className={s.quiet}
                  aria-expanded={toolOpen}
                  onClick={() => setToolOpen(!toolOpen)}
                >
                  {c.whatIs(tool.name)}
                </button>
                {toolOpen && (
                  <p>
                    <strong>
                      <MathText>{tool.name}</MathText>:
                    </strong>{" "}
                    <MathText>{tool.means}</MathText>
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              className={s.primary}
              disabled={needsAnswer}
              onClick={next}
            >
              {index + 1 < steps.length ? c.nextLine : c.finish}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
