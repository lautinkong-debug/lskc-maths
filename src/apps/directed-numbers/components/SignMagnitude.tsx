import { useId, useLayoutEffect, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import {
  magnitudeModel,
  magnitudeExpression,
  type SimpleMove,
} from "../lib/textbook";
import { parse } from "../lib/parse";
import { demonstrationSteps } from "../lib/demonstration";
import {
  EquationFrame,
  TeachingControls,
  useDemonstration,
} from "./TeachingSteps";
import styles from "./SignMagnitude.module.css";
import { GraphNumberText, StackedNumberText } from "./GraphNumberText";
import { MagnitudeCalculation } from "./MagnitudeCalculation";
import { MagnitudeRule } from "./MagnitudeRule";
import { button, primary } from "./ui";
export type ExplanationMethod = "number-line" | "owe";
const c = copy.apps.directedNumbers.magnitudeLesson;
const t = copy.apps.directedNumbers.demonstration;
function MagnitudeGraph({
  move,
  stage,
  startLabel,
}: {
  move: SimpleMove;
  stage: number;
  startLabel?: string;
}) {
  const presenting = usePresentation();
  const marker = useId().replaceAll(":", "");
  const m = magnitudeModel(move);
  const fractions = Object.values(m.labels).some((label) =>
    label.includes("/"),
  );
  const startY = fractions ? 216 : 195;
  const startBarY = fractions ? 306 : 263;
  const movementBarY = fractions ? 376 : 306;
  const resultBarY = fractions ? 446 : 349;
  const calculationY = fractions ? 514 : 394;
  const low = Math.min(0, move.start, m.end),
    high = Math.max(0, move.start, m.end);
  const span = high - low || 1,
    margin = span * 0.2;
  const x = (n: number) =>
    60 + ((n - low + margin) / (span + margin * 2)) * 520;
  const zero = x(0),
    start = x(move.start),
    end = x(m.end);
  const moving = stage >= 2,
    calculate = stage >= 4,
    complete = stage >= 5;
  const colour = m.delta < 0 ? "#b51b25" : "#0f4574";
  const resultColour = "#6d28d9";
  const magnitudePattern = `${marker}-magnitude`;
  const calculation = useRef<SVGTextElement>(null);
  const finish = useRef<SVGTextElement>(null);
  const finishAnchor = m.end < 0 ? "end" : "start";
  const finishX = end + (m.end < 0 ? -16 : 16);
  // Put Finish beside its point; keep Start and zero in separate rows.
  const finishY = 161;
  const resultCentre = (zero + end) / 2;
  useLayoutEffect(() => {
    const node = finish.current;
    if (!node) return;
    const align = () => {
      const width = node.getComputedTextLength();
      node.setAttribute(
        "x",
        String(
          finishAnchor === "end"
            ? Math.max(20 + width, finishX)
            : Math.min(620 - width, finishX),
        ),
      );
    };
    align();
    document.fonts.addEventListener("loadingdone", align);
    return () => document.fonts.removeEventListener("loadingdone", align);
  }, [complete, m.labels.end, finishX, finishAnchor]);
  useLayoutEffect(() => {
    const node = calculation.current;
    if (!node) return;
    const align = () => {
      const half = node.getComputedTextLength() / 2;
      // Centre below the measured distance, keeping long fraction/decimal
      // calculations inside the graph's edges.
      node.setAttribute(
        "x",
        String(Math.max(20 + half, Math.min(620 - half, resultCentre))),
      );
    };
    align();
    document.fonts.addEventListener("loadingdone", align);
    return () => document.fonts.removeEventListener("loadingdone", align);
  }, [calculate, m.calculation, resultCentre]);
  function distanceBar(
    from: number,
    to: number,
    y: number,
    label: string,
    stroke: string,
    key: string,
  ) {
    const direction = Math.sign(to - from);
    const head = Math.min(12, Math.abs(to - from) * 0.4);
    const arrow =
      direction === 0
        ? ""
        : ` M${to - direction * head},${y - head / 2} L${to},${y} L${to - direction * head},${y + head / 2}`;
    return (
      <g
        key={key}
        className={styles.reveal}
        data-testid={`distance-${key}`}
        data-from={from}
        data-to={to}
      >
        <path
          d={`M${from},${y - 5} v10 M${from},${y} H${to}${arrow}`}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          fill="none"
        />
        <GraphNumberText
          x={(from + to) / 2}
          y={y - (fractions ? 30 : 12)}
          textAnchor="middle"
          fontSize={17}
          fontWeight={key === "result" ? "700" : undefined}
          fill={stroke}
        >
          {label}
        </GraphNumberText>
      </g>
    );
  }
  return (
    <svg
      viewBox={`0 0 640 ${fractions ? 550 : 410}`}
      className={`h-auto w-full ${presenting ? (fractions ? "max-h-[550px]" : "max-h-[380px]") : ""}`}
      role="img"
      aria-label={c.exactCaption(
        startLabel ?? m.labels.start,
        c.motion(m.labels.distance, m.delta),
        complete ? m.labels.end : undefined,
      )}
      data-testid="magnitude-line"
      data-stage={stage}
    >
      <defs>
        <pattern
          id={magnitudePattern}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M-3 3 L3 -3 M0 12 L12 0 M9 15 L15 9"
            stroke={resultColour}
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />
        </pattern>
        <marker
          id={marker}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L7,3.5 L0,7 Z" fill={colour} />
        </marker>
      </defs>
      {calculate && (
        <g
          className={styles.reveal}
          data-testid="magnitude-highlight"
          aria-hidden="true"
        >
          <rect
            x={Math.min(zero, end)}
            y="123"
            width={Math.abs(end - zero)}
            height="32"
            fill="#ede9fe"
            fillOpacity="0.7"
          />
          <rect
            x={Math.min(zero, end)}
            y="123"
            width={Math.abs(end - zero)}
            height="32"
            fill={`url(#${magnitudePattern})`}
          />
          {m.end === 0 && (
            <line
              x1={zero}
              x2={zero}
              y1="123"
              y2="155"
              stroke={resultColour}
              strokeWidth="3"
            />
          )}
        </g>
      )}
      <line
        x1="25"
        x2="615"
        y1="155"
        y2="155"
        stroke="#7990a3"
        strokeWidth="2"
      />
      <path
        d="M32 150 L25 155 L32 160 M608 150 L615 155 L608 160"
        fill="none"
        stroke="#7990a3"
        strokeWidth="2"
      />
      <line
        x1={zero}
        x2={zero}
        y1="60"
        y2={resultBarY + 11}
        stroke="#0f4574"
        strokeWidth="3"
        data-testid="graph-zero-line"
      />
      <line
        x1={start}
        x2={start}
        y1="75"
        y2={startBarY}
        stroke="#7990a3"
        strokeDasharray="4 4"
      />
      <circle cx={start} cy="155" r="5" fill="#0f4574" />
      <GraphNumberText
        x={start}
        y={startY}
        textAnchor="middle"
        fontSize={18}
        fill="#0f4574"
        data-testid="graph-start"
      >
        {`${c.startMark}: ${startLabel ?? m.labels.start}`}
      </GraphNumberText>
      {m.delta !== 0 && (
        <g
          className={styles.motion}
          style={{
            transformOrigin: `${start}px 75px`,
            transform: `scaleX(${moving ? 1 : 0})`,
          }}
        >
          <line
            x1={start}
            x2={end}
            y1="75"
            y2="75"
            stroke={colour}
            strokeWidth="6"
            markerEnd={`url(#${marker})`}
          />
        </g>
      )}
      <GraphNumberText
        x={320}
        y={33}
        textAnchor="middle"
        fontSize={19}
        fontWeight="600"
        fill={colour}
      >
        {moving
          ? c.motion(m.labels.distance, m.delta)
          : stage === 0
            ? t.graphReady
            : t.startHint}
      </GraphNumberText>
      <g
        className={styles.motion}
        style={{ transform: `translateX(${moving ? end : start}px)` }}
      >
        <circle
          cy="155"
          r="8"
          fill={stage >= 3 ? resultColour : colour}
          stroke="#fff"
          strokeWidth="2"
        />
      </g>
      {calculate && (
        <line
          x1={end}
          x2={end}
          y1="123"
          y2={resultBarY + 6}
          stroke={resultColour}
          strokeDasharray="4 4"
        />
      )}
      {complete && (
        <GraphNumberText
          textRef={finish}
          x={finishX}
          y={finishY}
          textAnchor={finishAnchor}
          fontSize={18}
          fontWeight="700"
          fill={resultColour}
          stroke="#fff"
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
          data-testid="graph-finish"
        >
          {`${c.endMark}: ${m.labels.end}`}
        </GraphNumberText>
      )}
      <g data-testid="graph-zero-label">
        <rect
          x={zero - 17}
          y={87}
          width="34"
          height="33"
          rx="6"
          fill="#fff"
          stroke="#0f4574"
          strokeWidth="1.5"
        />
        <text
          x={zero}
          y={112}
          textAnchor="middle"
          fontSize="26"
          fontWeight="800"
          fill="#0f4574"
        >
          0
        </text>
      </g>
      {stage >= 1 &&
        distanceBar(
          zero,
          start,
          startBarY,
          t.startDistance(m.labels.a),
          "#0f4574",
          "start",
        )}
      {moving &&
        distanceBar(
          start,
          end,
          movementBarY,
          t.moveDistance(m.labels.distance),
          "#b51b25",
          "movement",
        )}
      {calculate &&
        distanceBar(
          zero,
          end,
          resultBarY,
          m.kind === "same"
            ? t.total(m.labels.magnitude)
            : t.remaining(m.labels.magnitude),
          resultColour,
          "result",
        )}
      {calculate && (
        <GraphNumberText
          key="calculation"
          textRef={calculation}
          x={resultCentre}
          y={calculationY}
          textAnchor="middle"
          className={styles.reveal}
          fontSize={25}
          fontWeight="700"
          fill={resultColour}
          data-testid="graph-calculation"
        >
          {m.calculation}
        </GraphNumberText>
      )}
    </svg>
  );
}
export function SignMagnitude({
  move,
  expression,
  startLabel,
  staticResult = false,
  wide = false,
  method = "number-line",
  onMethodChange,
}: {
  move: SimpleMove;
  expression?: string;
  startLabel?: string;
  staticResult?: boolean;
  wide?: boolean;
  method?: ExplanationMethod;
  onMethodChange?: (method: ExplanationMethod) => void;
}) {
  const presenting = usePresentation();
  const parsed = parse(expression ?? magnitudeExpression(move));
  const [showRule, setShowRule] = useState(false);
  const ruleId = useId();
  if (!parsed.ok) throw new Error("Invalid number-line demonstration");
  const steps = demonstrationSteps(parsed.value).filter(
    (step) => step.kind === "bracket",
  );
  const bracketEnd = steps.length * 2;
  const timeline = useDemonstration(
    bracketEnd + 5,
    staticResult ? bracketEnd + 5 : 0,
  );
  const stage = Math.max(0, timeline.position - bracketEnd);
  const m = magnitudeModel(move);
  const title =
    stage === 0
      ? t.bracketStage
      : stage === 1
        ? method === "owe"
          ? c.money.startStage
          : t.startStage
        : stage === 2
          ? method === "owe"
            ? c.money.moveStage
            : t.moveStage
          : stage === 3
            ? t.signStage
            : stage === 4
              ? t.magnitudeStage
              : t.answerStage;
  return (
    <section
      className={`${styles.board} min-w-0 ${presenting ? "space-y-2" : "space-y-4"}`}
      aria-label={c.title}
    >
      <h3
        className="font-display text-navy text-xl font-semibold"
        aria-live="polite"
      >
        {title}
      </h3>
      {!staticResult && (
        <TeachingControls timeline={timeline}>
          <button
            type="button"
            className={`${button} ${styles.ruleButton}`}
            aria-expanded={showRule}
            aria-controls={ruleId}
            onClick={() => {
              timeline.seek(timeline.position);
              setShowRule((shown) => !shown);
            }}
          >
            <span aria-hidden="true" className={styles.ruleIcon}>
              ±
            </span>
            {c.quickRule.button}
          </button>
        </TeachingControls>
      )}
      {onMethodChange && (
        <div className={styles.methodPicker} role="group" aria-label={c.method}>
          <span className="text-pencil mr-1 text-sm">{c.method}</span>
          {(["number-line", "owe"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={method === value ? primary : button}
              aria-pressed={method === value}
              onClick={() => onMethodChange(value)}
            >
              {c.methods[value]}
            </button>
          ))}
        </div>
      )}
      <div className={wide ? styles.lessonGrid : "space-y-4"}>
        <div className={`${styles.workingPanel} min-w-0 space-y-4`}>
          <p className={styles.panelLabel}>{copy.lessonWorkspace.working}</p>
          {!staticResult ? (
            <EquationFrame
              ast={parsed.value}
              steps={steps}
              position={Math.min(timeline.position, bracketEnd)}
            />
          ) : (
            <>
              <div className="overflow-x-auto text-2xl">
                <Tex>{`${move.start} ${m.delta < 0 ? "-" : "+"} ${m.distance}${stage === 5 ? ` = ${m.end}` : ""}`}</Tex>
              </div>
            </>
          )}
          {!staticResult && stage >= 3 && (
            <ol className="space-y-3 text-sm" aria-label={t.graphSteps}>
              <li className={styles.reveal}>
                <p className="font-semibold">
                  {t.signFirst}{" "}
                  {method === "owe" ? c.money.sign[m.sign] : c[m.sign]}
                </p>
                <div
                  className={`mt-2 overflow-x-auto text-2xl whitespace-nowrap ${m.sign === "zero" && stage === 3 ? "invisible" : ""}`}
                  data-testid="signed-magnitude-equation"
                >
                  <span
                    role="math"
                    aria-label={`= ${stage >= 4 ? m.signedMagnitudeTex : m.signTex}`}
                  >
                    <span aria-hidden="true" data-testid="result-sign-prefix">
                      <Tex>{`= ${m.signTex}`}</Tex>
                    </span>
                    <span
                      aria-hidden="true"
                      data-testid="result-magnitude-term"
                      className={`${styles.magnitudeTerm} ${stage >= 4 ? styles.magnitudeTermShown : ""}`}
                    >
                      <Tex>{m.magnitudeExpressionTex}</Tex>
                    </span>
                  </span>
                </div>
              </li>
              {stage === 5 && (
                <li className={styles.reveal}>
                  <div
                    className="overflow-x-auto text-2xl"
                    data-testid="final-equation"
                  >
                    <Tex>{`= ${m.signedResultTex}`}</Tex>
                  </div>
                </li>
              )}
            </ol>
          )}
          {showRule && <MagnitudeRule id={ruleId} move={move} />}
        </div>
        <div className={`${styles.visualPanel} min-w-0 space-y-3`}>
          <p className={styles.panelLabel}>{copy.lessonWorkspace.visual}</p>
          {method === "owe" ? (
            <MagnitudeCalculation move={move} stage={stage} />
          ) : (
            <>
              <MagnitudeGraph
                move={move}
                stage={stage}
                startLabel={startLabel}
              />
              {stage >= 3 && (
                <div
                  data-testid="magnitude-result"
                  className="space-y-3 text-sm"
                  aria-live="polite"
                >
                  {m.kind === "opposite" && (
                    <p>{m.distance > m.a ? c.crosses : c.stays}</p>
                  )}
                  {m.kind === "cancel" && <p>{t.zero}</p>}
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div
                      className="bg-navy-wash rounded p-3"
                      data-testid="result-sign"
                    >
                      <dt className="text-sm">{c.sign}</dt>
                      <dd className="text-navy font-semibold">{c[m.sign]}</dd>
                    </div>
                    {stage >= 4 && (
                      <div
                        className="bg-navy-wash rounded p-3"
                        data-testid="result-magnitude"
                      >
                        <dt className="text-sm">{c.magnitude}</dt>
                        <dd className="text-navy font-semibold">
                          <StackedNumberText>
                            {c.distance(m.labels.magnitude)}
                          </StackedNumberText>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
