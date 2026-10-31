"use client";

import { useRef, type PointerEvent } from "react";
import type { LabId } from "./content";
import { useLocalSession } from "./useLocalSession";
import {
  initialConditions,
  parseConditions,
  radiusComparison,
  perpendicularComparison,
  chordWithBisector,
  locatedCentre,
  type Experiment,
} from "./conditions";
import s from "./conditions.module.css";
import MathText from "./MathText";

const format = (n: number) => Number(n.toFixed(2));
const sx = (x: number) => 230 + 14 * x;
const sy = (y: number) => 185 + 14 * y;

export default function ConditionsLab({
  labId,
  entryExperiment,
  compact = false,
}: {
  labId: LabId;
  entryExperiment?: Experiment;
  compact?: boolean;
}) {
  const [state, setState, failed] = useLocalSession(
    `conditions-${labId}`,
    () => ({
      ...initialConditions(labId),
      ...(entryExperiment ? { experiment: entryExperiment } : {}),
    }),
    (raw) => {
      const parsed = parseConditions(raw);
      return parsed && entryExperiment
        ? { ...parsed, experiment: entryExperiment }
        : parsed;
    },
  );
  const svg = useRef<SVGSVGElement>(null);
  const circles = radiusComparison(state.radius, state.angle);
  const perpendicular = perpendicularComparison(state.offset);
  function locate(event: PointerEvent<SVGSVGElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    setState((v) => ({
      ...v,
      guess: {
        x: Math.max(-10, Math.min(10, (point.x - 230) / 14)),
        y: Math.max(-10, Math.min(10, (point.y - 185) / 14)),
      },
      check: false,
    }));
  }
  return (
    <section
      className={s.lab}
      aria-label="Change one condition"
      data-compact={compact}
    >
      {!compact && (
        <>
          <h3>Change one condition</h3>
          <p>
            Make a prediction, change one feature, then compare. These
            measurements help you test a conjecture; they do not prove it.
          </p>
        </>
      )}
      {compact ? (
        <label className={s.compactChooser}>
          Experiment
          <select
            aria-label="Condition experiment"
            value={state.experiment}
            onChange={(e) =>
              setState((v) => ({
                ...v,
                experiment: e.target.value as Experiment,
                reveal: false,
              }))
            }
          >
            <option value="radii">Unequal radii</option>
            <option value="perpendicular">Perpendiculars</option>
            <option value="centre">Find a hidden centre</option>
          </select>
        </label>
      ) : (
        <div className={s.tabs} aria-label="Condition experiments">
          {(
            [
              ["radii", "Do the circles need equal radii?"],
              ["perpendicular", "Is any perpendicular enough?"],
              ["centre", "Find a hidden centre"],
            ] as [Experiment, string][]
          ).map(([id, title]) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.experiment === id}
              onClick={() =>
                setState((v) => ({ ...v, experiment: id, reveal: false }))
              }
            >
              {title}
            </button>
          ))}
        </div>
      )}
      {state.experiment === "radii" && (
        <>
          <p>
            Both centre angles are {state.angle}°. Predict whether the
            highlighted arcs and chords have equal lengths. Change only the
            second radius first.
          </p>
          <div className={s.circlePair}>
            {[
              { cx: 125, r: 6, label: "O", a: "A", b: "B", colour: "#3769f4" },
              {
                cx: 125,
                r: state.radius,
                label: "T",
                a: "C",
                b: "D",
                colour: "#bc2e59",
              },
            ].map((c) => {
              const half = (state.angle * Math.PI) / 360,
                radius = c.r * 12;
              const x = c.cx + radius * Math.cos(half),
                ya = 140 - radius * Math.sin(half),
                yb = 140 + radius * Math.sin(half);
              return (
                <svg
                  key={c.label}
                  className={s.diagram}
                  viewBox="0 0 270 280"
                  role="img"
                  aria-label={`Circle with centre ${c.label}, radius ${c.r} cm and centre angle ${state.angle} degrees`}
                >
                  <circle
                    cx={c.cx}
                    cy="140"
                    r={radius}
                    fill="none"
                    stroke={c.colour}
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${x} ${ya} A ${radius} ${radius} 0 0 1 ${x} ${yb}`}
                    fill="none"
                    stroke={c.colour}
                    strokeWidth="6"
                  />
                  <path
                    d={`M ${x} ${ya} L ${c.cx} 140 L ${x} ${yb} Z`}
                    fill="none"
                    stroke={c.colour}
                    strokeWidth="2"
                  />
                  <circle cx={c.cx} cy="140" r="3" fill={c.colour} />
                  <text x={c.cx - 17} y="158">
                    <MathText svg notation>
                      {c.label}
                    </MathText>
                  </text>
                  <text x={x + 8} y={ya - 7}>
                    <MathText svg notation>
                      {c.a}
                    </MathText>
                  </text>
                  <text x={x + 8} y={yb + 16}>
                    <MathText svg notation>
                      {c.b}
                    </MathText>
                  </text>
                  <text x="135" y="20" textAnchor="middle">
                    {state.angle}° at the centre
                  </text>
                  <text x={c.cx - 55} y="260">
                    radius {c.r} cm
                  </text>
                </svg>
              );
            })}
          </div>
          <div className={s.controls}>
            <label>
              Second radius: {state.radius} cm
              <input
                aria-label="Second circle radius"
                type="range"
                min="3"
                max="9"
                step="0.5"
                value={state.radius}
                onChange={(e) =>
                  setState((v) => ({ ...v, radius: Number(e.target.value) }))
                }
              />
            </label>
            <label>
              Both centre angles: {state.angle}°
              <input
                aria-label="Both centre angles"
                type="range"
                min="30"
                max="150"
                step="5"
                value={state.angle}
                onChange={(e) =>
                  setState((v) => ({ ...v, angle: Number(e.target.value) }))
                }
              />
            </label>
          </div>
          <div className={s.choices}>
            <button
              type="button"
              onClick={() => setState((v) => ({ ...v, radius: 6 }))}
            >
              Make the radii equal
            </button>
            <button
              className={s.primary}
              type="button"
              aria-expanded={state.reveal}
              onClick={() => setState((v) => ({ ...v, reveal: !v.reveal }))}
            >
              {state.reveal
                ? "Hide lengths"
                : "Test my prediction: reveal lengths"}
            </button>
          </div>
          {state.reveal && (
            <>
              <div className={s.readouts}>
                <div>
                  <b>First circle</b>
                  <span>
                    Arc <MathText notation>AB</MathText>:{" "}
                    {format(circles.first.arc)} cm
                  </span>
                  <span>
                    Chord <MathText notation>AB</MathText>:{" "}
                    {format(circles.first.chord)} cm
                  </span>
                </div>
                <div>
                  <b>Second circle</b>
                  <span>
                    Arc <MathText notation>CD</MathText>:{" "}
                    {format(circles.second.arc)} cm
                  </span>
                  <span>
                    Chord <MathText notation>CD</MathText>:{" "}
                    {format(circles.second.chord)} cm
                  </span>
                </div>
              </div>
              <p className={s.feedback}>
                {circles.equal
                  ? "The radii now match. Both the corresponding arc lengths and chord lengths match. Change the common angle and test again."
                  : "Equal angles alone have not made the lengths equal. Change the second radius to match the first: which measurements become equal?"}
              </p>
              <p className={s.small}>
                <MathText>
                  {
                    "Why: arc length = (θ / 360°) × 2πr and chord length = 2r sin(θ/2), with θ measured in degrees. For a fixed angle, both depend on the radius. This explains why the reason specifies the same circle or equal circles."
                  }
                </MathText>
              </p>
            </>
          )}
        </>
      )}
      {state.experiment === "perpendicular" && (
        <>
          <p>
            <MathText>
              {
                "The pink line is always perpendicular to AB. Move its foot N. Does a 90° angle alone force AN = NB?"
              }
            </MathText>
          </p>
          <svg
            className={s.diagram}
            viewBox="0 0 460 370"
            role="img"
            aria-label="A perpendicular line meets a chord at a movable foot N; the line need not pass through centre O"
          >
            <circle
              cx="230"
              cy="185"
              r="140"
              fill="none"
              stroke="#3769f4"
              strokeWidth="2"
            />
            <line
              x1={sx(-perpendicular.half)}
              y1={sy(-5)}
              x2={sx(perpendicular.half)}
              y2={sy(-5)}
              stroke="#3769f4"
              strokeWidth="3"
            />
            <line
              x1={sx(state.offset)}
              y1="30"
              x2={sx(state.offset)}
              y2="335"
              stroke="#bc2e59"
              strokeWidth="3"
            />
            <line
              x1="230"
              y1="185"
              x2={sx(state.offset)}
              y2={sy(-5)}
              stroke="#667e95"
              strokeDasharray="6 5"
            />
            <path
              d={`M ${sx(state.offset) + 13} ${sy(-5)} v 13 h -13`}
              fill="none"
              stroke="#bc2e59"
              strokeWidth="2"
            />
            <circle cx="230" cy="185" r="4" fill="#143b68" />
            <text x="211" y="205">
              <MathText svg notation>
                O
              </MathText>
            </text>
            <text x={sx(-perpendicular.half) - 17} y={sy(-5) - 9}>
              <MathText svg notation>
                A
              </MathText>
            </text>
            <text x={sx(perpendicular.half) + 6} y={sy(-5) - 9}>
              <MathText svg notation>
                B
              </MathText>
            </text>
            <text x={sx(state.offset) + 7} y={sy(-5) - 10}>
              <MathText svg notation>
                N
              </MathText>
            </text>
            <text x="230" y="20" textAnchor="middle" className={s.pink}>
              perpendicular line
            </text>
          </svg>
          <div className={s.controls}>
            <label>
              <MathText>Move N along AB</MathText>
              <input
                aria-label="Foot of perpendicular line"
                type="range"
                min="-8"
                max="8"
                step="0.25"
                value={state.offset}
                onChange={(e) =>
                  setState((v) => ({ ...v, offset: Number(e.target.value) }))
                }
              />
            </label>
          </div>
          <div className={s.readouts}>
            <div>
              <strong>
                <MathText notation>AN</MathText> = {format(perpendicular.an)} cm
              </strong>
              <strong>
                <MathText notation>NB</MathText> = {format(perpendicular.nb)} cm
              </strong>
            </div>
            <div>
              <span>
                <MathText>Pink line ⊥ AB: always</MathText>
              </span>
              <span>
                <MathText notation>∠ONB</MathText> ={" "}
                {format(perpendicular.centreAngle)}°
              </span>
            </div>
          </div>
          <p className={s.feedback}>
            <MathText>
              {perpendicular.throughCentre
                ? "Now the perpendicular passes through O, and the halves are equal. Move it away and compare again."
                : "The pink line is perpendicular, but it misses O and the halves are unequal. A perpendicular from the centre is the required condition."}
            </MathText>
          </p>
          <button
            type="button"
            onClick={() => setState((v) => ({ ...v, offset: 0 }))}
          >
            <MathText>Put the perpendicular through O</MathText>
          </button>
        </>
      )}
      {state.experiment === "centre" && (
        <>
          <p>
            The centre label is hidden. Reveal a perpendicular bisector, then a
            second one. Tap their intersection to place your centre marker.
          </p>
          <div className={s.choices}>
            <label>
              <input
                type="checkbox"
                checked={state.firstBisector}
                onChange={(e) =>
                  setState((v) => ({ ...v, firstBisector: e.target.checked }))
                }
              />
              First perpendicular bisector
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.secondBisector}
                onChange={(e) =>
                  setState((v) => ({ ...v, secondBisector: e.target.checked }))
                }
              />
              Second perpendicular bisector
            </label>
          </div>
          <svg
            ref={svg}
            className={s.diagram}
            viewBox="0 0 460 370"
            role="img"
            aria-label="Hidden centre construction: tap to place a guess; keyboard coordinate controls are below"
            onPointerDown={locate}
          >
            <circle
              cx="230"
              cy="185"
              r="140"
              fill="none"
              stroke="#3769f4"
              strokeWidth="2"
            />
            {[
              {
                angle: 18,
                d: 4,
                show: state.firstBisector,
                labels: ["A", "B"],
                color: "#3769f4",
              },
              {
                angle: 107,
                d: 5.5,
                show: state.secondBisector,
                labels: ["C", "D"],
                color: "#bc2e59",
              },
            ].map((c) => {
              const chord = chordWithBisector(c.angle, c.d);
              return (
                <g key={c.angle}>
                  <line
                    x1={sx(chord.a.x)}
                    y1={sy(chord.a.y)}
                    x2={sx(chord.b.x)}
                    y2={sy(chord.b.y)}
                    stroke={c.color}
                    strokeWidth="3"
                  />
                  <text x={sx(chord.a.x) - 12} y={sy(chord.a.y) - 10}>
                    <MathText svg notation>
                      {c.labels[0]}
                    </MathText>
                  </text>
                  <text x={sx(chord.b.x) + 5} y={sy(chord.b.y) + 18}>
                    <MathText svg notation>
                      {c.labels[1]}
                    </MathText>
                  </text>
                  {c.show && (
                    <>
                      <line
                        x1={sx(-chord.normal.x * 12)}
                        y1={sy(-chord.normal.y * 12)}
                        x2={sx(chord.normal.x * 12)}
                        y2={sy(chord.normal.y * 12)}
                        stroke={c.color}
                        strokeDasharray="7 5"
                        strokeWidth="2"
                      />
                      <circle
                        cx={sx(chord.midpoint.x)}
                        cy={sy(chord.midpoint.y)}
                        r="5"
                        fill={c.color}
                      />
                    </>
                  )}
                </g>
              );
            })}
            {state.guess && (
              <g>
                <circle
                  cx={sx(state.guess.x)}
                  cy={sy(state.guess.y)}
                  r="8"
                  fill="#d99e21"
                  stroke="#143b68"
                  strokeWidth="2"
                />
                <text x={sx(state.guess.x) + 10} y={sy(state.guess.y) - 10}>
                  my centre
                </text>
              </g>
            )}
            {state.reveal && (
              <g>
                <circle cx="230" cy="185" r="5" fill="#143b68" />
                <text x="213" y="207">
                  <MathText svg notation>
                    O
                  </MathText>
                </text>
              </g>
            )}
          </svg>
          <details>
            <summary>Place the marker with keyboard controls</summary>
            <div className={s.controls}>
              {(["x", "y"] as const).map((axis) => (
                <label key={axis}>
                  Marker <MathText>{axis}</MathText>
                  <input
                    aria-label={`Centre marker ${axis}`}
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={state.guess?.[axis] ?? 2}
                    onChange={(e) =>
                      setState((v) => ({
                        ...v,
                        guess: {
                          ...(v.guess ?? { x: 2, y: 2 }),
                          [axis]: Number(e.target.value),
                        },
                        check: false,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </details>
          <div className={s.choices}>
            <button
              className={s.primary}
              type="button"
              onClick={() => setState((v) => ({ ...v, check: true }))}
            >
              Check my centre
            </button>
            <button
              type="button"
              aria-expanded={state.reveal}
              onClick={() => setState((v) => ({ ...v, reveal: !v.reveal }))}
            >
              <MathText>
                {state.reveal ? "Hide O" : "Reveal O and the reason"}
              </MathText>
            </button>
          </div>
          {state.check && (
            <p className={s.feedback} role="status">
              {!state.guess
                ? "Place a marker first by tapping the circle or using the keyboard controls."
                : locatedCentre(state.guess)
                  ? "Your marker is close to the intersection (within 0.35 cm). The exact centre is where the two perpendicular bisectors intersect."
                  : "Your marker is away from the intersection. Each perpendicular bisector contains the centre; find the point they share."}
            </p>
          )}
          {state.reveal && (
            <p className={s.feedback}>
              A chord’s perpendicular bisector passes through the centre. Two
              non-parallel perpendicular bisectors locate one common point. A
              single bisector only identifies a line containing the centre.
            </p>
          )}
        </>
      )}
      {failed && (
        <p role="status">
          This browser could not save this experiment. Keep the page open to
          retain your work.
        </p>
      )}
    </section>
  );
}
