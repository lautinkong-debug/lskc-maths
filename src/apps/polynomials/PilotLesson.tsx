import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import { equations, frames, question, toTex } from "./model";
import { TeachingBoard } from "./TeachingBoard";
import { PlaybackControls, usePlayback } from "./PlaybackControls";
import styles from "./polynomials.module.css";
const c = copy.polynomials;
export function PilotLesson() {
  const last = frames.length - 1,
    player = usePlayback(last),
    frame = frames[player.index];
  return (
    <div
      className={styles.player}
      data-testid="polynomial-player"
      data-question={question.id}
      data-step={player.index}
      data-playing={player.playing}
    >
      <header className={styles.questionHeader}>
        <div>
          <h2>{c.reference}</h2>
          <p>{c.question}</p>
        </div>
        <span>{c.sourcePage}</span>
      </header>
      <PlaybackControls player={player} last={last} />
      <div className={styles.lessonGrid}>
        <TeachingBoard frame={frame} />
        <section
          className={styles.working}
          aria-labelledby="polynomial-working-title"
        >
          <header>
            <h3 id="polynomial-working-title">{c.working}</h3>
            <p>{c.workingHint}</p>
          </header>
          <ol>
            {equations.slice(0, frame.equation + 1).map((line, i) => (
              <li
                key={line.id}
                data-testid="working-line"
                data-current={i === frame.equation}
              >
                <div className={styles.workingEquation}>
                  <MathNotation>{`${i ? "= " : ""}${toTex(line.expression)}`}</MathNotation>
                </div>
                <p>{c.lineReasons[line.id]}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <details className={styles.source}>
        <summary>{c.source}</summary>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-testid="source-question"
          src={question.sourceImage}
          alt={c.sourceAlt}
          width={1534}
          height={100}
          loading="lazy"
        />
        <p>{c.sourceCaption}</p>
      </details>
    </div>
  );
}
