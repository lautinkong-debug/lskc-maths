import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import { expressionTex } from "./algebra";
import {
  lessonFrames,
  type Lesson,
  type LessonStep,
  type LessonFrame,
} from "./lesson-types";
import { PlaybackControls, usePlayback } from "./PlaybackControls";
import { QuestionDiagram } from "./QuestionDiagram";
import { TermTable } from "./TermTable";
import styles from "./polynomials.module.css";
const c = copy.polynomials;
const textMath = (text: string) =>
  text
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^4/g, "⁴")
    .replace(/\*/g, " × ");
const tex = (step: LessonStep) =>
  step.math ? expressionTex(step.math) : step.tex!;

function Products({ step, frame }: { step: LessonStep; frame: LessonFrame }) {
  const d = step.distribution!,
    active = frame.activeProduct;
  const row = active === undefined ? -1 : Math.floor(active / d.right.length),
    col = active === undefined ? -1 : active % d.right.length;
  return (
    <>
      <div className={styles.factorGroups}>
        {[d.left, d.right].map((terms, k) => (
          <div key={k}>
            <span>(</span>
            {terms.map((t, i) => (
              <span key={i} data-active={i === (k === 0 ? row : col)}>
                <MathNotation>{`${i && !t.startsWith("-") ? "+" : ""}${expressionTex(t)}`}</MathNotation>
              </span>
            ))}
            <span>)</span>
          </div>
        ))}
      </div>
      {active !== undefined && (
        <div className={styles.activePair}>
          <span>{c.activeProduct(active + 1, d.products.length)}</span>
          <MathNotation>{`${expressionTex(`(${d.left[row]})*(${d.right[col]})`)}${frame.kind === "product" ? `=${expressionTex(d.products[active])}` : ""}`}</MathNotation>
          <span aria-hidden="true">↓</span>
        </div>
      )}
      <div className={styles.productGrid}>
        {d.products.map((p, i) => (
          <div
            key={i}
            className={styles.productCell}
            data-active={active === i}
          >
            <MathNotation className={styles.pair}>
              {expressionTex(
                `(${d.left[Math.floor(i / d.right.length)]})*(${d.right[i % d.right.length]})`,
              )}
            </MathNotation>
            {i < (frame.revealedProducts ?? 0) ? (
              <MathNotation
                className={styles.productResult}
              >{`=${expressionTex(p)}`}</MathNotation>
            ) : (
              <span className={styles.unrevealed} aria-label={c.unrevealed}>
                ?
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
function Vertical({ lesson, step }: { lesson: Lesson; step: number }) {
  const { rows, operator } = lesson.vertical!;
  return (
    <div className={styles.verticalWork}>
      <table>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <th>{i ? operator : ""}</th>
              {row.map((term, j) => (
                <td key={j} data-active={step >= 0}>
                  <MathNotation>{expressionTex(term)}</MathNotation>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>{c.verticalHint}</p>
    </div>
  );
}
function Board({ lesson, frame }: { lesson: Lesson; frame: LessonFrame }) {
  const step = lesson.steps[frame.step];
  const title =
    frame.kind === "read"
      ? c.readQuestion
      : frame.kind === "pair"
        ? c.factorFocus
        : frame.kind === "product"
          ? c.productReveal
          : frame.kind === "focus"
            ? c.focusSigns
            : step.title;
  const visibleMath =
    frame.kind === "focus"
      ? (lesson.steps[frame.step - 1]?.math ?? lesson.expression)
      : step?.math;
  const originalAllowed =
    !lesson.diagram &&
    lesson.skill !== "applications" &&
    !(
      lesson.part === "b" &&
      ((lesson.bank === "10C" && lesson.number >= 31) ||
        (lesson.bank === "REV" && lesson.number >= 49) ||
        (lesson.bank === "10D" && lesson.number >= 38))
    );
  return (
    <section
      className={styles.board}
      data-testid="polynomial-board"
      aria-labelledby="polynomial-action"
    >
      <header className={styles.boardHeading}>
        <span className={styles.stepMark} aria-hidden="true">
          {step?.distribution ? "×" : "="}
        </span>
        <h3 id="polynomial-action">{title}</h3>
      </header>
      <div className={styles.boardContent}>
        {lesson.diagram && (
          <QuestionDiagram lesson={lesson} step={frame.step} />
        )}
        {lesson.vertical && <Vertical lesson={lesson} step={frame.step} />}
        {lesson.bank === "10B" && lesson.number === 19 ? (
          <TermTable lesson={lesson} step={frame.step} />
        ) : frame.kind === "read" ? (
          <div
            className={lesson.diagram ? styles.initialNote : styles.focusStage}
          >
            {originalAllowed && lesson.expression && !lesson.vertical && (
              <MathNotation className={styles.heroMath}>
                {expressionTex(lesson.expression)}
              </MathNotation>
            )}
            {lesson.givenTex && (
              <MathNotation className={styles.heroMath}>
                {lesson.givenTex}
              </MathNotation>
            )}
            <p className={styles.startHint}>{c.startHint}</p>
          </div>
        ) : step.distribution ? (
          <Products step={step} frame={frame} />
        ) : step.focus ? (
          <>
            {visibleMath && (
              <MathNotation className={styles.heroMath}>
                {expressionTex(visibleMath)}
              </MathNotation>
            )}
            <div className={styles.termChanges}>
              {step.focus.before.map((t, i) => (
                <div key={i}>
                  <MathNotation>{expressionTex(t)}</MathNotation>
                  {step.focus?.after && (
                    <>
                      <span className={styles.downArrow}>↓</span>
                      {frame.kind === "change" ? (
                        <MathNotation className={styles.changedTerm}>
                          {expressionTex(step.focus.after[i])}
                        </MathNotation>
                      ) : (
                        <span className={styles.unrevealed}>?</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className={
              lesson.diagram || lesson.vertical
                ? styles.currentCalculation
                : styles.focusStage
            }
          >
            {step.label && <p className={styles.answerLabel}>{step.label}</p>}
            <MathNotation className={styles.heroMath}>{tex(step)}</MathNotation>
          </div>
        )}
      </div>
      <p className={styles.explanation}>
        {frame.kind === "read"
          ? c.readHint
          : frame.kind === "pair"
            ? c.factorInstruction
            : step.reason}
      </p>
    </section>
  );
}
export function GenericLesson({
  lesson,
  reference,
}: {
  lesson: Lesson;
  reference: string;
}) {
  const frames = lessonFrames(lesson),
    last = frames.length - 1,
    player = usePlayback(last),
    frame = frames[player.index];
  const completed = frame.kind === "focus" ? frame.step - 1 : frame.step;
  return (
    <div
      className={styles.player}
      data-testid="polynomial-player"
      data-question={lesson.id}
      data-step={player.index}
      data-playing={player.playing}
    >
      <header className={styles.questionHeader}>
        <div>
          <h2>{reference}</h2>
          <p>{textMath(lesson.prompt)}</p>
          {!!lesson.nonzero?.length && (
            <p className={styles.restrictions}>
              {c.nonzero}:{" "}
              <MathNotation>
                {lesson.nonzero.map((v) => `${v}\\ne0`).join(",\\ ")}
              </MathNotation>
            </p>
          )}
        </div>
        <span>{c.sourceReference(lesson.page)}</span>
      </header>
      <PlaybackControls player={player} last={last} />
      <div className={styles.lessonGrid}>
        <Board lesson={lesson} frame={frame} />
        <section
          className={styles.working}
          aria-labelledby="polynomial-working-title"
        >
          <header>
            <h3 id="polynomial-working-title">{c.working}</h3>
            <p>{c.workingHint}</p>
          </header>
          <ol>
            {lesson.steps.slice(0, completed + 1).map((step, i) => {
              const previous = lesson.steps[i - 1];
              const equals =
                !!step.math &&
                !!previous?.math &&
                (step.target ?? lesson.expression) ===
                  (previous.target ?? lesson.expression) &&
                step.label === previous.label;
              return (
                <li
                  key={i}
                  data-testid="working-line"
                  data-current={i === completed}
                >
                  {step.label && (
                    <p className={styles.outputLabel}>{step.label}</p>
                  )}
                  <div className={styles.workingEquation}>
                    <MathNotation>{`${equals ? "= " : ""}${tex(step)}`}</MathNotation>
                  </div>
                  <p>{textMath(step.reason)}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
      <details className={styles.source}>
        <summary>{c.source}</summary>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-testid="source-question"
          src={`/polynomials/questions/${lesson.id}.webp`}
          alt={c.sourceQuestionAlt(reference)}
          loading="lazy"
        />
        <p>{c.sourceNote}</p>
      </details>
    </div>
  );
}
