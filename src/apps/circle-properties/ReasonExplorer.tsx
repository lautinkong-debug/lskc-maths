"use client";

import { useId, useState } from "react";
import { labs, reasons, type LabId } from "./content";
import MathText from "./MathText";
import ReasonFlowDiagram from "./ReasonFlowDiagram";
import ReasonWorking from "./ReasonWorking";
import { reasonWorking } from "./reasonWorkingData";
import { reasonFlow } from "./reasonFlow";
import {
  initialReasonParameters,
  normaliseReasonParameters,
  reasonControls,
  reasonMeasurements,
  reasonDragHint,
  reasonConstraint,
  type ReasonParameters,
} from "./reasonExploration";
import {
  initialReasonExperiment,
  parseReasonExperiment,
} from "./reasonExperimentSession";
import { useLocalSession } from "./useLocalSession";
import s from "./reason-explorer.module.css";

/** Separates the information we start with from the conclusion we may draw. */
export default function ReasonExplorer({
  labId,
  onPractice,
}: {
  labId: LabId;
  onPractice: () => void;
}) {
  const lab = labs.find((item) => item.id === labId)!;
  const related = lab.reasonIds.map((id) =>
    reasons.find((reason) => reason.id === id)!,
  );
  const [saved, setSaved, saveFailed] = useLocalSession(
    `reason-explorer-${labId}`,
    () => initialReasonExperiment(labId),
    (raw) => parseReasonExperiment(labId, raw),
  );
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const reason =
    related.find((item) => item.id === saved.selectedId) ?? related[0];
  const revealed = revealedId === reason.id;
  const experiment = saved.shapes[reason.id];
  const measurements = reasonMeasurements(reason.id, experiment.parameters);
  const currentShape = JSON.stringify(experiment.parameters);
  const currentCase = experiment.samples.findIndex(
    (sample) => JSON.stringify(sample) === currentShape,
  );
  const format = (value: number, unit: string) =>
    Number(value.toFixed(unit ? 1 : 3));
  function change(next: ReasonParameters) {
    setSaved((previous) => ({
      ...previous,
      shapes: {
        ...previous.shapes,
        [reason.id]: {
          ...previous.shapes[reason.id],
          parameters: normaliseReasonParameters(reason.id, next),
        },
      },
    }));
  }
  const flow = reasonFlow[reason.id];
  const id = useId();
  const choose = (reasonId: string) => {
    setSaved((previous) => ({ ...previous, selectedId: reasonId }));
    setRevealedId(null);
  };

  return (
    <section className={s.explorer} aria-labelledby={`${id}-heading`}>
      <div className={s.header}>
        <div>
          <h3 id={`${id}-heading`}>See how each reason works</h3>
          <p>Keep the givens. Change the shape. Discover what stays true.</p>
        </div>
        <div className={s.legend} aria-label="Diagram colour key">
          <span className={s.givenKey}>Given</span>
          <span className={s.resultKey}>Concluded</span>
          <span className={s.scale}>Model radius: 10 cm</span>
        </div>
      </div>

      <div
        className={s.selector}
        role="group"
        aria-label="Choose a reason to visualise"
      >
        {related.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === reason.id}
            aria-label={`Reason ${item.number}: ${reasonFlow[item.id].startingFact}`}
            onClick={() => choose(item.id)}
          >
            <span className={s.number}>{item.number}</span>
            <span>
              <MathText>{reasonFlow[item.id].startingFact}</MathText>
            </span>
          </button>
        ))}
      </div>

      <div className={s.exploreInstructions}>
        <p>
          <strong>Keep the givens: </strong>
          <MathText>
            {reasonConstraint(reason.id).replace(/^Held: /, "")}
          </MathText>
        </p>
        <p>
          <MathText>{reasonDragHint(reason.id)}</MathText> Both diagrams move
          together.
        </p>
        <div className={s.experimentActions}>
          <button
            type="button"
            onClick={() => {
              change(initialReasonParameters(reason.id));
              setRevealedId(null);
            }}
          >
            Reset diagram
          </button>
          <button
            type="button"
            disabled={currentCase >= 0 || experiment.samples.length >= 3}
            onClick={() =>
              setSaved((previous) => ({
                ...previous,
                shapes: {
                  ...previous.shapes,
                  [reason.id]: {
                    ...previous.shapes[reason.id],
                    samples: [
                      ...previous.shapes[reason.id].samples,
                      { ...previous.shapes[reason.id].parameters },
                    ].slice(-3),
                  },
                },
              }))
            }
          >
            Keep this case ({experiment.samples.length}/3)
          </button>
          {experiment.samples.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setSaved((previous) => ({
                  ...previous,
                  shapes: {
                    ...previous.shapes,
                    [reason.id]: { ...previous.shapes[reason.id], samples: [] },
                  },
                }))
              }
            >
              Clear saved cases
            </button>
          )}
        </div>
        {experiment.samples.length > 0 && (
          <div
            className={s.caseRecall}
            role="group"
            aria-label="Reopen a saved case"
          >
            {experiment.samples.map((sample, index) => (
              <button
                type="button"
                key={index}
                aria-pressed={currentCase === index}
                aria-controls={`${id}-stages`}
                onClick={() => change({ ...sample })}
              >
                Show case {index + 1}
              </button>
            ))}
            <span role="status" aria-atomic="true">
              {currentCase >= 0
                ? `Showing case ${currentCase + 1}`
                : "Exploring a new shape"}
            </span>
          </div>
        )}
        {reason.id === "r3" && (
          <p className={s.trailHint}>
            Keep a case, turn the chord, then keep another. Where do the dashed
            perpendicular bisectors meet?
          </p>
        )}
      </div>

      <div className={s.stages} id={`${id}-stages`} key={reason.id}>
        <div className={`${s.stage} ${s.givenStage}`}>
          <h4>
            <span aria-hidden="true">1</span> Given
          </h4>
          <p className={s.fact}>
            <MathText>{reason.given}</MathText>
          </p>
          <ReasonFlowDiagram
            reasonId={reason.id}
            reveal={false}
            parameters={experiment.parameters}
            onChange={change}
            trails={experiment.samples}
          />
          <p className={s.observationLabel}>
            <strong>Observe while dragging</strong>
            <br />
            These measurements are observations, not extra givens.
          </p>
          <div
            className={s.liveMeasurements}
            aria-label="Reason exploration measurements"
          >
            {measurements.map((m) => (
              <div key={m.label}>
                <span>
                  <MathText>{m.label}</MathText>
                </span>
                <strong>
                  {format(m.value, m.unit)}
                  <small> {m.unit}</small>
                </strong>
              </div>
            ))}
          </div>
        </div>
        {revealed ? (
          <div className={`${s.stage} ${s.resultStage}`}>
            <h4>
              <span aria-hidden="true">2</span> Therefore
            </h4>
            <p className={s.fact}>
              <MathText>{reason.conclusion}</MathText>
            </p>
            <ReasonFlowDiagram
              reasonId={reason.id}
              reveal
              parameters={experiment.parameters}
              onChange={change}
              trails={experiment.samples}
            />
            <p className={s.syncHint}>
              Drag either diagram. The blue givens stay true; the green marks
              show the conclusion.
            </p>
            <p className={s.direction} aria-label="Given to conclusion">
              <span>
                <MathText>{flow.startingFact}</MathText>
              </span>
              <span className={s.arrow} aria-label="therefore">
                →
              </span>
              <strong>
                <MathText>{flow.resultFact}</MathText>
              </strong>
            </p>
          </div>
        ) : (
          <div className={`${s.stage} ${s.questionStage}`}>
            <div className={s.question}>
              <span className={s.questionMark} aria-hidden="true">
                ?
              </span>
              <h4>What can you conclude?</h4>
              <p>
                Drag the ringed points and compare the measurements. Which new
                fact keeps appearing?
              </p>
              <button
                className={s.primary}
                type="button"
                onClick={() => setRevealedId(reason.id)}
              >
                Reveal the conclusion
              </button>
            </div>
          </div>
        )}
      </div>

      <details className={s.fineTune}>
        <summary>Keyboard controls for these diagrams</summary>
        <p>
          Focus a ringed point and use the arrow keys. Hold Shift to move
          further, or use these controls.
        </p>
        <div className={s.controlGrid}>
          {reasonControls(reason.id).map((control) => (
            <label key={control.key}>
              <span>
                <MathText>{control.label}</MathText>
                <output>
                  {format(
                    experiment.parameters[control.key] ?? 0,
                    control.unit ?? "",
                  )}{" "}
                  {control.unit}
                </output>
              </span>
              <input
                type="range"
                aria-label={`Reason diagram: ${control.label}`}
                min={control.min}
                max={control.max}
                step={control.step}
                value={experiment.parameters[control.key] ?? 0}
                onChange={(e) =>
                  change({
                    ...experiment.parameters,
                    [control.key]: Number(e.target.value),
                  })
                }
              />
            </label>
          ))}
        </div>
      </details>

      {experiment.samples.length > 0 && (
        <details className={s.savedCases}>
          <summary>Compare saved cases ({experiment.samples.length})</summary>
          <p>
            Try different shapes and directions. Which values stay the same, or
            change together?
          </p>
          <div
            className={s.tableScroll}
            tabIndex={0}
            role="region"
            aria-label="Saved measurements comparison"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Case</th>
                  {measurements.map((m) => (
                    <th key={m.label} scope="col">
                      <MathText>{m.label}</MathText>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...experiment.samples, experiment.parameters].map(
                  (sample, i) => (
                    <tr key={i}>
                      <th scope="row">
                        {i === experiment.samples.length ? "Now" : i + 1}
                      </th>
                      {reasonMeasurements(reason.id, sample).map((m) => (
                        <td key={m.label}>
                          {format(m.value, m.unit)} {m.unit}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {revealed && (
        <div className={s.explanation}>
          <div
            className={s.writtenSummary}
            role="region"
            aria-label="Written deduction"
          >
            <p className={s.givenLine}>
              <span className={s.proofSymbol} aria-label="because">
                ∵
              </span>
              <span>
                <MathText>{flow.startingFact}</MathText>
              </span>
            </p>
            <p className={s.conclusionLine}>
              <span className={s.proofSymbol} aria-label="therefore">
                ∴
              </span>
              <span>
                <MathText>{reasonWorking[reason.id].conclusion}</MathText>{" "}
                <span className={s.inlineReason}>
                  (<MathText>{reason.label}</MathText>)
                </span>
              </span>
            </p>
          </div>
          <div className={s.reasonText}>
            <div>
              <h4>Write the reason</h4>
              <p className={s.formalReason}>
                <MathText>{reason.label}</MathText>
              </p>
            </div>
            <div>
              <h4>Check the conditions</h4>
              <p>
                <MathText>{reason.condition}</MathText>
              </p>
            </div>
          </div>
          <p className={s.contrast}>
            <MathText>{flow.contrast}</MathText>
          </p>
          <ReasonWorking key={reason.id} reasonId={reason.id} />
          <div className={s.actions}>
            <button type="button" onClick={() => setRevealedId(null)}>
              Replay from the givens
            </button>
            <button type="button" onClick={onPractice}>
              Practise these reasons
            </button>
          </div>
        </div>
      )}

      {related.length > 1 && (
        <details className={s.comparison}>
          <summary>Compare these {related.length} reasons</summary>
          <p>
            Choose the reason by the direction: what you have → what you need.
          </p>
          <table>
            <caption className={s.srOnly}>
              Different starting facts and conclusions
            </caption>
            <thead>
              <tr>
                <th scope="col">Reason</th>
                <th scope="col">Given</th>
                <th scope="col">Therefore</th>
              </tr>
            </thead>
            <tbody>
              {related.map((item) => (
                <tr key={item.id} data-selected={item.id === reason.id}>
                  <th scope="row">
                    <button
                      type="button"
                      aria-label={`Show reason ${item.number}`}
                      onClick={() => choose(item.id)}
                    >
                      {item.number}
                    </button>
                  </th>
                  <td>
                    <MathText>{reasonFlow[item.id].startingFact}</MathText>
                  </td>
                  <td>
                    <MathText>{reasonFlow[item.id].resultFact}</MathText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
      {saveFailed && (
        <p role="status">
          This browser could not save the exploration. You can keep dragging and
          comparing.
        </p>
      )}
    </section>
  );
}
