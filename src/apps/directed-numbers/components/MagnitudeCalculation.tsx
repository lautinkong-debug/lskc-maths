import { useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { magnitudeModel, type SimpleMove } from "../lib/textbook";
import { readNumber, toTex } from "../lib/rational";
import { moneyGuidance } from "../lib/moneyGuidance";
import { MoneyPicture } from "./MoneyPicture";
import styles from "./MagnitudeCalculation.module.css";

const c = copy.apps.directedNumbers.magnitudeLesson;
const money = c.money;

/** One account balance: positive credit, negative debt charges. */
export function MagnitudeCalculation({
  move,
  stage,
}: {
  move: SimpleMove;
  stage: number;
}) {
  const [replay, setReplay] = useState(0);
  const m = magnitudeModel(move);
  const guidance = money.guidance[moneyGuidance(move)];
  const showMagnitude = stage >= 4;
  const subtract = m.kind === "opposite" || m.kind === "cancel";
  const swapped = subtract && m.distance > m.a;
  const left = swapped ? m.labels.distance : m.labels.a;
  const right = swapped ? m.labels.a : m.labels.distance;
  const tex = (label: string) =>
    toTex(readNumber(label), {
      style: move.exact?.style ?? "decimal",
    });
  const event =
    move.b === 0
      ? "unchanged"
      : move.op === "+"
        ? move.b > 0
          ? "receive"
          : "borrow"
        : move.b > 0
          ? "pay"
          : "repay";
  const start = move.start > 0 ? "credit" : move.start < 0 ? "debt" : "settled";
  const rule =
    m.delta === 0
      ? "unchanged"
      : m.a === 0
        ? "fromZero"
        : subtract
          ? "subtract"
          : "add";
  const reasoning =
    rule === "unchanged" || rule === "fromZero"
      ? rule
      : subtract
        ? event === "receive"
          ? "receiveDebt"
          : event === "pay"
            ? "payCredit"
            : event === "borrow"
              ? "borrowCredit"
              : "cancelDebt"
        : m.sign === "negative"
          ? event === "pay"
            ? "payDebt"
            : "moreDebt"
          : event === "repay"
            ? "refundCredit"
            : "moreCredit";
  const colour = (negative: boolean) => (negative ? "#DA2127" : "#0F4574");
  const startColour = colour(move.start < 0);
  const eventColour = colour(m.delta < 0);
  const equation = `${tex(left)} ${subtract ? "-" : "+"} ${tex(right)} = ${tex(m.labels.magnitude)}`;
  const colouredEquation = `\\textcolor{${swapped ? eventColour : startColour}}{${tex(left)}} ${subtract ? "-" : "+"} \\textcolor{${swapped ? startColour : eventColour}}{${tex(right)}} = ${tex(m.labels.magnitude)}`;

  return (
    <section
      className={styles.card}
      aria-label={money.title}
      data-testid="money-analogy"
      data-event={event}
    >
      <div className={styles.heading}>
        <h4>{money.title}</h4>
        {showMagnitude && (
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            aria-label={c.replayMagnitude}
            title={c.replayMagnitude}
          >
            ↻
          </button>
        )}
      </div>
      <p className={styles.key}>{money.key}</p>
      {stage === 0 ? (
        <p className={styles.prompt}>{money.ready}</p>
      ) : (
        <div key={replay}>
          <div className={styles.ledger}>
            <div
              className={styles.entry}
              style={{ color: startColour }}
              data-testid="money-start"
            >
              <MoneyPicture kind={start} />
              <div className={styles.entryText}>
                <span>{money.start[start]}</span>
                <strong>
                  {money.currency} <Tex>{tex(m.labels.a)}</Tex>
                </strong>
              </div>
            </div>
            {stage >= 2 && (
              <>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
                <div
                  className={`${styles.entry} ${styles.transaction}`}
                  style={{ color: eventColour }}
                  data-testid="money-event"
                >
                  <MoneyPicture kind={event} />
                  <div className={styles.entryText}>
                    <span>{money.events[event]}</span>
                    <strong>
                      {money.currency} <Tex>{tex(m.labels.distance)}</Tex>
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
          {stage >= 3 && (
            <div
              className={styles.guidance}
              data-testid="money-outcome"
              data-sign={m.sign}
            >
              <p className={styles.cue}>{guidance.cue}</p>
              <p className={styles.bridge}>{guidance.bridge}</p>
            </div>
          )}
          {stage >= 2 && !showMagnitude && (
            <p className={styles.prompt} data-testid="money-question">
              {stage === 2 ? money.signQuestion : money.magnitudeQuestion}
            </p>
          )}
          {showMagnitude && (
            <div
              className={styles.calculation}
              data-testid="magnitude-animation"
              data-operation={subtract ? "subtract" : "add"}
            >
              <h5>{money.rules[rule]}</h5>
              <p className={styles.reason} data-testid="money-reason">
                {money.reasoning[reasoning]}
              </p>
              {subtract && (
                <p className={styles.keyword}>{c.magnitudeSubtract}</p>
              )}
              <div
                className={styles.result}
                data-testid="magnitude-animation-result"
              >
                <Tex label={equation}>{colouredEquation}</Tex>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
