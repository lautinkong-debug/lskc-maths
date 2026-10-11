import { useId } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { magnitudeModel, type SimpleMove } from "../lib/textbook";
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
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
export function magnitudeCalculation(move: SimpleMove) {
  const m = magnitudeModel(move);
  return m.kind === "same"
    ? `${m.a} + ${m.distance} = ${m.magnitude}`
    : m.kind === "opposite" || m.kind === "cancel"
      ? `${Math.max(m.a, m.distance)} − ${Math.min(m.a, m.distance)} = ${m.magnitude}`
      : m.kind === "noMove"
        ? `${m.a} + 0 = ${m.magnitude}`
        : `0 + ${m.distance} = ${m.magnitude}`;
}
function MagnitudeGraph({ move, stage }: { move: SimpleMove; stage: number }) {
  const presenting = usePresentation();
  const marker = useId().replaceAll(":", "");
  const m = magnitudeModel(move);
  const low = Math.min(0, move.start, m.end),
    high = Math.max(0, move.start, m.end);
  const span = Math.max(10, high - low),
    margin = span * 0.2;
  const x = (n: number) =>
    60 + ((n - low + margin) / (span + margin * 2)) * 520;
  const zero = x(0),
    start = x(move.start),
    end = x(m.end);
  const moving = stage >= 2,
    calculate = stage >= 3,
    complete = stage >= 4;
  const colour = m.delta < 0 ? "#b51b25" : "#0f4574";
  function distanceBar(
    from: number,
    to: number,
    y: number,
    label: string,
    stroke: string,
    key: string,
  ) {
    return (
      <g key={key} className={styles.reveal} data-testid={`distance-${key}`}>
        <path
          d={`M${from},${y - 5} v10 M${from},${y} H${to} M${to},${y - 5} v10`}
          stroke={stroke}
          strokeWidth="4"
          fill="none"
        />
        <text
          x={(from + to) / 2}
          y={y - 12}
          textAnchor="middle"
          fontSize="17"
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
      aria-label={c.caption(move.start, m.delta, complete ? m.end : undefined)}
      data-testid="magnitude-line"
      data-stage={stage}
    >
      <defs>
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
        y1="100"
        y2="333"
        stroke="#7990a3"
        strokeDasharray="4 4"
      />
      <text x={zero} y="208" textAnchor="middle" fontSize="18" fill="#0f4574">
        0
      </text>
      <line
        x1={start}
        x2={start}
        y1="75"
        y2="243"
        stroke="#7990a3"
        strokeDasharray="4 4"
      />
      <circle cx={start} cy="155" r="5" fill="#0f4574" />
      <text x={start} y="185" textAnchor="middle" fontSize="18" fill="#0f4574">
        {c.startMark}: {signed(move.start)}
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
          ? c.motion(m.distance, m.delta)
          : stage === 0
            ? t.graphReady
            : t.startHint}
      </text>
      <g
        className={styles.motion}
        style={{ transform: `translateX(${moving ? end : start}px)` }}
      >
        <circle cy="155" r="8" fill={colour} stroke="#fff" strokeWidth="2" />
      </g>
      {calculate && (
        <line
          x1={end}
          x2={end}
          y1="92"
          y2="335"
          stroke={colour}
          strokeDasharray="4 4"
        />
      )}
      {complete && (
        <text
          x={end}
          y="123"
          textAnchor="middle"
          fontSize="18"
          fontWeight="600"
          fill={colour}
        >
          {c.endMark}: {signed(m.end)}
        </text>
      )}
      {stage >= 1 &&
        distanceBar(start, zero, 243, t.startDistance(m.a), "#0f4574", "start")}
      {moving &&
        distanceBar(
          start,
          end,
          286,
          t.moveDistance(m.distance),
          "#b51b25",
          "movement",
        )}
      {calculate &&
        distanceBar(
          zero,
          end,
          329,
          m.kind === "same" ? t.total(m.magnitude) : t.remaining(m.magnitude),
          "#0f4574",
          "result",
        )}
      {calculate && (
        <text
          key="calculation"
          x="320"
          y="374"
          textAnchor="middle"
          className={styles.reveal}
          fontSize="25"
          fontWeight="700"
          fill="#0f4574"
          data-testid="graph-calculation"
        >
          {magnitudeCalculation(move)}
        </text>
      )}
    </svg>
  );
}
export function SignMagnitude({
  move,
  expression,
  staticResult = false,
  wide = false,
}: {
  move: SimpleMove;
  expression?: string;
  staticResult?: boolean;
  wide?: boolean;
}) {
  const presenting = usePresentation();
  const parsed = parse(
    expression ?? `(${signed(move.start)})${move.op}(${signed(move.b)})`,
  );
  if (!parsed.ok) throw new Error("Invalid integer demonstration");
  const steps = demonstrationSteps(parsed.value).filter(
    (step) => step.kind === "bracket",
  );
  const bracketEnd = steps.length * 2;
  const timeline = useDemonstration(
    bracketEnd + 4,
    staticResult ? bracketEnd + 4 : 0,
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
                <Tex>{`${move.start} ${m.delta < 0 ? "-" : "+"} ${m.distance}${stage === 4 ? ` = ${m.end}` : ""}`}</Tex>
              </div>
            </>
          )}
          {!staticResult && stage >= 1 && (
            <ol className="space-y-2 text-sm" aria-label={t.graphSteps}>
              <li className={styles.reveal}>{t.startHint}</li>
              {stage >= 2 && <li className={styles.reveal}>{t.moveHint}</li>}
              {stage >= 3 && <li className={styles.reveal}>{c[m.kind]}</li>}
              {stage === 4 && (
                <li className={styles.reveal}>
                  <p>{t.resultHint}</p>
                  <div
                    className="mt-2 overflow-x-auto text-2xl"
                    data-testid="final-equation"
                  >
                    <Tex>{`= ${m.end}`}</Tex>
                  </div>
                </li>
              )}
            </ol>
          )}
        </div>
        <div className="min-w-0 space-y-3">
          <MagnitudeGraph move={move} stage={stage} />
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
                <div className="bg-navy-wash rounded p-3">
                  <dt className="text-sm">{c.magnitude}</dt>
                  <dd className="text-navy font-semibold">
                    {c.distance(m.magnitude)}
                  </dd>
                </div>
                {stage === 4 && (
                  <div className="bg-navy-wash rounded p-3">
                    <dt className="text-sm">{c.sign}</dt>
                    <dd className="text-navy font-semibold">{c[m.sign]}</dd>
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
