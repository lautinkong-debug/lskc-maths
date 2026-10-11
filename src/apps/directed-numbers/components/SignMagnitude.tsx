import { useEffect, useId, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { magnitudeModel, type SimpleMove } from "../lib/textbook";
import { button } from "./ui";
import styles from "./SignMagnitude.module.css";

const c = copy.apps.directedNumbers.magnitudeLesson;
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** A continuous, proportional arrow complements the bird's one-unit steps. */
export function SignMagnitude({
  move,
  staticResult = false,
  wide = false,
}: {
  move: SimpleMove;
  staticResult?: boolean;
  wide?: boolean;
}) {
  const [stage, setStage] = useState(staticResult ? 2 : 0);
  const marker = useId().replaceAll(":", "");
  const m = magnitudeModel(move);
  useEffect(() => {
    if (stage !== 1) return;
    const timer = window.setTimeout(() => setStage(2), 1500);
    return () => window.clearTimeout(timer);
  }, [stage]);
  const low = Math.min(0, move.start, m.end),
    high = Math.max(0, move.start, m.end);
  const span = Math.max(10, high - low),
    margin = span * 0.2;
  const x = (n: number) =>
    60 + ((n - low + margin) / (span + margin * 2)) * 520;
  const zero = x(0),
    start = x(move.start),
    end = x(m.end);
  const showResult = stage === 2;
  const colour = m.delta < 0 ? "#b51b25" : "#0f4574";
  return (
    <section
      className="border-grid bg-paper min-w-0 space-y-4 rounded border p-4"
      aria-label={c.title}
    >
      <h3 className="font-display text-navy text-xl font-semibold">
        {c.title}
      </h3>
      <div className="overflow-x-auto text-xl">
        <Tex>{`${signed(move.start)} ${move.op} (${signed(move.b)})${showResult ? ` = ${signed(m.end)}` : ""}`}</Tex>
      </div>
      <div
        className={wide ? "grid items-start gap-6 lg:grid-cols-2" : "space-y-4"}
      >
        <div className="min-w-0 space-y-4">
          <svg
            viewBox="0 0 640 310"
            className="h-auto w-full"
            role="img"
            aria-label={c.caption(
              move.start,
              m.delta,
              showResult ? m.end : undefined,
            )}
            data-testid="magnitude-line"
            data-stage={stage}
          >
            <defs>
              <marker
                id={marker}
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill={colour} />
              </marker>
            </defs>
            <line
              x1="25"
              x2="615"
              y1="160"
              y2="160"
              stroke="#7990a3"
              strokeWidth="2"
            />
            <path
              d="M32 155 L25 160 L32 165 M608 155 L615 160 L608 165"
              fill="none"
              stroke="#7990a3"
              strokeWidth="2"
            />
            <line
              x1={zero}
              x2={zero}
              y1="105"
              y2="233"
              stroke="#7990a3"
              strokeDasharray="4 4"
            />
            <text
              x={zero}
              y="220"
              textAnchor="middle"
              fontSize="18"
              fill="#0f4574"
            >
              0
            </text>
            <line
              x1={start}
              x2={start}
              y1="75"
              y2="166"
              stroke="#7990a3"
              strokeDasharray="4 4"
            />
            <circle cx={start} cy="160" r="5" fill="#0f4574" />
            <text
              x={start}
              y="190"
              textAnchor="middle"
              fontSize="18"
              fill="#0f4574"
            >
              {c.startMark}: {signed(move.start)}
            </text>
            {m.delta !== 0 && (
              <g
                className={styles.motion}
                style={{
                  transformOrigin: `${start}px 75px`,
                  transform: `scaleX(${stage === 0 ? 0 : 1})`,
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
            {stage > 0 && (
              <text
                x={(start + end) / 2}
                y="35"
                textAnchor="middle"
                fontSize="19"
                fontWeight="600"
                fill={colour}
              >
                {c.motion(m.distance, m.delta)}
              </text>
            )}
            <g
              className={styles.motion}
              style={{
                transform: `translateX(${stage === 0 ? start : end}px)`,
              }}
            >
              <circle
                cy="160"
                r="8"
                fill={colour}
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
            {showResult && (
              <g>
                <line
                  x1={end}
                  x2={end}
                  y1="92"
                  y2="260"
                  stroke={colour}
                  strokeDasharray="4 4"
                />
                <text
                  x={end}
                  y="125"
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="600"
                  fill={colour}
                >
                  {c.endMark}: {signed(m.end)}
                </text>
                <path
                  d={`M${zero},248 v12 M${zero},254 H${end} M${end},248 v12`}
                  stroke="#0f4574"
                  strokeWidth="3"
                  fill="none"
                />
                <text
                  x={(zero + end) / 2}
                  y="290"
                  textAnchor="middle"
                  fontSize="19"
                  fontWeight="600"
                  fill="#0f4574"
                >
                  {c.distance(m.magnitude)}
                </text>
              </g>
            )}
          </svg>
          {!staticResult && (
            <button
              className={button}
              onClick={() => setStage(stage === 2 ? 0 : stage + 1)}
            >
              {stage === 0 ? c.move : stage === 1 ? c.explain : c.replay}
            </button>
          )}
        </div>
        {showResult && (
          <div
            aria-live="polite"
            className="space-y-4"
            data-testid="magnitude-result"
          >
            {move.op === "-" && (
              <div>
                <p className="text-sm">{c.normalise}</p>
                <Tex>{`${signed(move.start)} - (${signed(move.b)}) = ${signed(move.start)} + (${signed(m.delta)})`}</Tex>
              </div>
            )}
            <div className="border-grid border-t pt-3">
              <h4 className="font-semibold">{c.compare}</h4>
              <p className="mt-1">{c[m.kind]}</p>
              {m.kind === "opposite" && (
                <p className="mt-2 font-medium">
                  {m.distance > m.a ? c.crosses : c.stays}
                </p>
              )}
              <div className="mt-3 text-xl">
                <Tex>
                  {m.kind === "same"
                    ? `${m.a}+${m.distance}=${m.magnitude}`
                    : m.kind === "opposite" || m.kind === "cancel"
                      ? `${Math.max(m.a, m.distance)}-${Math.min(m.a, m.distance)}=${m.magnitude}`
                      : `|${m.end}|=${m.magnitude}`}
                </Tex>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="bg-navy-wash rounded p-3">
                <dt className="text-sm">{c.sign}</dt>
                <dd className="text-navy mt-1 font-semibold">{c[m.sign]}</dd>
              </div>
              <div className="bg-navy-wash rounded p-3">
                <dt className="text-sm">{c.magnitude}</dt>
                <dd className="text-navy mt-1 font-semibold">
                  {c.distance(m.magnitude)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
