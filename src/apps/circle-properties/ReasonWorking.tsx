"use client";

import { useId, useState } from "react";
import MathText from "./MathText";
import { reasonWorking } from "./reasonWorkingData";
import s from "./reason-working.module.css";

/** Mount keyed by the selected reason so every new application starts at the givens. */
export default function ReasonWorking({ reasonId }: { reasonId: string }) {
  const [step, setStep] = useState(1);
  const id = useId();
  const working = reasonWorking[reasonId];
  if (!working) return null;
  return (
    <section className={s.working} aria-labelledby={`${id}-heading`}>
      <header className={s.header}>
        <h4 id={`${id}-heading`}>Write the working</h4>
        <span role="status">
          Reason {working.number} · Step {step} of 3
        </span>
      </header>
      <p className={s.intro}>
        Use the givens and the circle reason to justify your conclusion.
      </p>
      <ol className={s.steps}>
        <li className={s.given}>
          <h5>
            <span>1</span> State the givens
          </h5>
          <div className={s.mathLine}>
            <span className={s.symbol} aria-label="because">
              ∵
            </span>
            <div>
              {working.givens.map((line) => (
                <p key={line}>
                  <MathText>{line}</MathText>
                </p>
              ))}
            </div>
            <span className={s.source}>(given)</span>
          </div>
        </li>
        {step >= 2 && (
          <li className={s.conditions}>
            <h5>
              <span>2</span> Check the conditions
            </h5>
            <ul>
              {working.checks.map((line) => (
                <li key={line}>
                  <MathText>{line}</MathText>
                </li>
              ))}
            </ul>
            <details className={s.fullCondition}>
              <summary>Full condition for this reason</summary>
              <p>
                <MathText>{working.condition}</MathText>
              </p>
            </details>
          </li>
        )}
        {step >= 3 && (
          <li className={s.conclusion}>
            <h5>
              <span>3</span> Apply the reason and conclude
            </h5>
            <div className={s.mathLine}>
              <span className={s.symbol} aria-label="therefore">
                ∴
              </span>
              <div>
                <p className={s.result}>
                  <MathText>{working.conclusion}</MathText>
                </p>
                <p className={s.reason}>
                  (<MathText>{working.reason}</MathText>)
                </p>
              </div>
            </div>
          </li>
        )}
      </ol>
      <div className={s.controls}>
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            Previous step
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className={s.next}
            onClick={() => setStep(step + 1)}
          >
            {step === 1
              ? "Next: check the conditions"
              : "Next: apply the reason"}
          </button>
        ) : (
          <button type="button" onClick={() => setStep(1)}>
            Write it again
          </button>
        )}
      </div>
    </section>
  );
}
