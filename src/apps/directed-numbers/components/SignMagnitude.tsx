import { useId, useLayoutEffect, useRef } from "react";
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
  const finishX = end + (m.end < 0 ? -14 : 22);
  const finishY = Math.abs(end - start) < 130 ? 210 : 185;
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
        <text
          x={(from + to) / 2}
          y={y - 12}
          textAnchor="middle"
          fontSize="17"
          fontWeight={key === "result" ? "700" : undefined}
          fill={stroke}
        >
          {label}
        </text>
      </g>
    );
  }
  return (
    <svg
      viewBox="0 0 640 390"
      className={`h-auto w-full ${presenting ? "max-h-[380px]" : ""}`}
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
            y="87"
            width={Math.abs(end - zero)}
            height="249"
            fill="#ede9fe"
            fillOpacity="0.7"
          />
          <rect
            x={Math.min(zero, end)}
            y="87"
            width={Math.abs(end - zero)}
            height="249"
            fill={`url(#${magnitudePattern})`}
          />
          {m.end === 0 && (
            <line
              x1={zero}
              x2={zero}
              y1="87"
              y2="336"
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
        y2="340"
        stroke="#0f4574"
        strokeWidth="3"
        data-testid="graph-zero-line"
      />
      <line
        x1={start}
        x2={start}
        y1="75"
        y2="243"
        stroke="#7990a3"
        strokeDasharray="4 4"
      />
      <circle cx={start} cy="155" r="5" fill="#0f4574" />
      <text
        x={start}
        y="185"
        textAnchor="middle"
        fontSize="18"
        fill="#0f4574"
        data-testid="graph-start"
      >
        {c.startMark}: {startLabel ?? m.labels.start}
      </text>
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
      <text
        x="320"
        y="33"
        textAnchor="middle"
        fontSize="19"
        fontWeight="600"
        fill={colour}
      >
        {moving
          ? c.motion(m.labels.distance, m.delta)
          : stage === 0
            ? t.graphReady
            : t.startHint}
      </text>
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
          y1="92"
          y2="335"
          stroke={resultColour}
          strokeDasharray="4 4"
        />
      )}
      {complete && (
        <text
          ref={finish}
          x={finishX}
          y={finishY}
          textAnchor={finishAnchor}
          fontSize="18"
          fontWeight="700"
          fill={resultColour}
          stroke="#fff"
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
          data-testid="graph-finish"
        >
          {c.endMark}: {m.labels.end}
        </text>
      )}
      <g data-testid="graph-zero-label">
        <rect
          x={zero - 17}
          y="189"
          width="34"
          height="33"
          rx="6"
          fill="#fff"
          stroke="#0f4574"
          strokeWidth="1.5"
        />
        <text
          x={zero}
          y="214"
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
          243,
          t.startDistance(m.labels.a),
          "#0f4574",
          "start",
        )}
      {moving &&
        distanceBar(
          start,
          end,
          286,
          t.moveDistance(m.labels.distance),
          "#b51b25",
          "movement",
        )}
      {calculate &&
        distanceBar(
          zero,
          end,
          329,
          m.kind === "same"
            ? t.total(m.labels.magnitude)
            : t.remaining(m.labels.magnitude),
          resultColour,
          "result",
        )}
      {calculate && (
        <text
          key="calculation"
          ref={calculation}
          x={resultCentre}
          y="374"
          textAnchor="middle"
          className={styles.reveal}
          fontSize="25"
          fontWeight="700"
          fill={resultColour}
          data-testid="graph-calculation"
        >
          {m.calculation}
        </text>
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
}: {
  move: SimpleMove;
  expression?: string;
  startLabel?: string;
  staticResult?: boolean;
  wide?: boolean;
}) {
  const presenting = usePresentation();
  const parsed = parse(expression ?? magnitudeExpression(move));
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
        ? t.startStage
        : stage === 2
          ? t.moveStage
          : stage === 3
            ? t.signStage
            : stage === 4
              ? t.magnitudeStage
              : t.answerStage;
  return (
    <section
      className={`border-grid bg-paper min-w-0 rounded border p-4 ${presenting ? "space-y-2" : "space-y-4"}`}
      aria-label={c.title}
    >
      <h3
        className="font-display text-navy text-xl font-semibold"
        aria-live="polite"
      >
        {title}
      </h3>
      {!staticResult && <TeachingControls timeline={timeline} />}
      <div
        className={
          wide ? "grid min-w-0 items-start gap-5 lg:grid-cols-2" : "space-y-4"
        }
      >
        <div className="min-w-0 space-y-4">
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
                  {t.signFirst} {c[m.sign]}
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
              {stage >= 4 && (
                <li className={styles.reveal}>
                  <p className="font-semibold">{t.magnitudeNext}</p>
                  <p>{c[m.kind]}</p>
                </li>
              )}
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
          )}{" "}
        </div>
        <div className="min-w-0 space-y-3">
          <MagnitudeGraph move={move} stage={stage} startLabel={startLabel} />
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
                      {c.distance(m.labels.magnitude)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
