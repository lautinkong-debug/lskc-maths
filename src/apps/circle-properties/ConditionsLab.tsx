"use client";

import { useRef, type PointerEvent } from "react";
import { reasons, type LabId } from "./content";
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
import ReasonLabel from "./ReasonLabel";
import ReasonEvidencePanel from "./ReasonEvidencePanel";

const format = (n: number) => Number(n.toFixed(2));
const sx = (x: number) => 230 + 14 * x;
const sy = (y: number) => 185 + 14 * y;
const chordBisection = reasons.find((item) => item.id === "r1")!;
const chordMidpoint = reasons.find((item) => item.id === "r2")!;

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
  const fromMidpoint = state.experiment === "midpoint";
  const chordReason = fromMidpoint ? chordMidpoint : chordBisection;
  const bisectors = Number(state.firstBisector) + Number(state.secondBisector);
  const squareSide = state.offset > 0 ? -13 : 13;
  function selectExperiment(experiment: Experiment) {
    setState((v) => ({
      ...v,
      experiment,
      reveal: false,
      check: false,
      firstBisector:
        v.firstBisector || (experiment === "centre" && !v.secondBisector),
    }));
  }
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
            onChange={(e) => selectExperiment(e.target.value as Experiment)}
          >
            <option value="radii">Unequal radii</option>
            <option value="perpendicular">
              16.1 · Start with a perpendicular from the centre
            </option>
            <option value="midpoint">
              16.2 · Join the centre to the mid-point
            </option>
            <option value="centre">16.3 · Find a hidden centre</option>
          </select>
        </label>
      ) : (
        <div className={s.tabs} aria-label="Condition experiments">
          {(
            [
              ["radii", "Do the circles need equal radii?"],
              ["perpendicular", "16.1 · Is any perpendicular enough?"],
              ["midpoint", "16.2 · Join the centre to the mid-point"],
              ["centre", "16.3 · Find a hidden centre"],
            ] as [Experiment, string][]
          ).map(([id, title]) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.experiment === id}
              onClick={() => selectExperiment(id)}
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
          <div className={s.perpendicularLayout}>
            <div className={s.perpendicularBoard}>
              <div className={s.circlePair}>
                {[
                  {
                    cx: 125,
                    r: 6,
                    label: "O",
                    a: "A",
                    b: "B",
                    colour: "#3769f4",
                  },
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
                      <path
                        data-given="centre-angle"
                        d={`M ${c.cx + 24 * Math.cos(half)} ${140 - 24 * Math.sin(half)} A 24 24 0 0 1 ${c.cx + 24 * Math.cos(half)} ${140 + 24 * Math.sin(half)}`}
                        fill="none"
                        stroke="#2454c6"
                        strokeWidth="4"
                      />
                      {state.reveal && circles.equal && (
                        <g
                          stroke="#18764b"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                        >
                          <path
                            data-result="equal-chords"
                            d={`M ${x - 5} ${140 - radius * Math.sin(half) * 0.48 + 2} l 10 -4`}
                          />
                          <path
                            data-result="equal-arcs"
                            transform={`rotate(${state.angle / 4} ${c.cx} 140)`}
                            d={`M ${c.cx + radius - 5} 137 h 10 m -10 6 h 10`}
                          />
                        </g>
                      )}
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
                      setState((v) => ({
                        ...v,
                        radius: Number(e.target.value),
                      }))
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
            </div>
            <aside
              className={s.chordReason}
              aria-label="Reasons for comparing arcs and chords"
            >
              <h3>Equal angles in two circles</h3>
              <p>
                <b>Given</b>
                <br />
                <MathText>∠AOB = ∠CTD</MathText> = {state.angle}°.{" "}
                {circles.equal
                  ? "Both radii are 6 cm."
                  : "The circles have different radii."}
              </p>
              {state.reveal ? (
                circles.equal ? (
                  <>
                    <p>
                      <b>Conclusion</b>
                      <br />
                      <MathText>Arc AB = arc CD</MathText> · <b>16.10</b>
                      <br />
                      <ReasonLabel
                        reason={reasons.find((r) => r.id === "r10")!}
                      />
                    </p>
                    <p>
                      <MathText>AB = CD</MathText> · <b>16.12</b>
                      <br />
                      <ReasonLabel
                        reason={reasons.find((r) => r.id === "r12")!}
                      />
                    </p>
                  </>
                ) : (
                  <p>
                    <b>Check the condition</b>
                    <br />
                    The angles match but the lengths differ. Reasons 16.10 and
                    16.12 require the same circle or equal circles.
                  </p>
                )
              ) : (
                <p>
                  Compare the curved arcs and the straight chords. Reveal the
                  lengths to check your prediction.
                </p>
              )}
            </aside>
          </div>
        </>
      )}
      {(state.experiment === "perpendicular" || fromMidpoint) && (
        <>
          <p>
            <MathText>
              {fromMidpoint
                ? "O is the known centre. Move N until AN = NB. What happens to the angle between ON and the chord?"
                : "The pink line is always perpendicular to AB. Move its foot N. Does a 90° angle alone force AN = NB?"}
            </MathText>
          </p>
          <div className={s.perpendicularLayout}>
            <div className={s.perpendicularBoard}>
              <svg
                className={s.diagram}
                data-testid={
                  fromMidpoint
                    ? "midpoint-chord-diagram"
                    : "perpendicular-chord-diagram"
                }
                viewBox="0 0 460 370"
                role="img"
                aria-label={
                  fromMidpoint
                    ? perpendicular.throughCentre
                      ? "O is the known centre. Blue ticks mark the given equal halves; the green square marks the deduced right angle at N."
                      : "The line from O meets chord AB away from its mid-point."
                    : perpendicular.throughCentre
                      ? "The pink perpendicular passes through centre O. Matching ticks on AN and NB show that N bisects chord AB."
                      : "The pink line meets chord AB at a right angle at N and misses centre O. AN and NB are unequal."
                }
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
                {fromMidpoint ? (
                  <line
                    x1="230"
                    y1="185"
                    x2={sx(state.offset)}
                    y2={sy(-5)}
                    stroke="#2454c6"
                    strokeWidth="4"
                  />
                ) : (
                  <line
                    x1={sx(state.offset)}
                    y1="30"
                    x2={sx(state.offset)}
                    y2="335"
                    stroke="#bc2e59"
                    strokeWidth="3"
                  />
                )}
                {!fromMidpoint && !perpendicular.throughCentre && (
                  <line
                    x1="230"
                    y1="185"
                    x2={sx(state.offset)}
                    y2={sy(-5)}
                    stroke="#667e95"
                    strokeDasharray="6 5"
                  />
                )}
                {perpendicular.throughCentre && (
                  <g
                    className={s.halfTicks}
                    data-role={fromMidpoint ? "given" : "conclusion"}
                  >
                    {(["AN", "NB"] as const).map((half) => {
                      const x = sx(
                        ((half === "AN" ? -1 : 1) * perpendicular.half) / 2,
                      );
                      return (
                        <path
                          key={half}
                          data-equal-half={half}
                          d={`M ${x - 2} ${sy(-5) + 7} l 4 -14`}
                        />
                      );
                    })}
                  </g>
                )}
                {(!fromMidpoint || perpendicular.throughCentre) && (
                  <path
                    data-right-angle={fromMidpoint ? "conclusion" : "given"}
                    d={`M ${sx(state.offset) + squareSide} ${sy(-5)} v 13 h ${-squareSide}`}
                    fill="none"
                    stroke={fromMidpoint ? "#147044" : "#bc2e59"}
                    strokeWidth={fromMidpoint ? 4 : 2.8}
                  />
                )}
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
                <text
                  x={sx(state.offset) + (state.offset > 0 ? -7 : 7)}
                  y={sy(-5) - 10}
                  textAnchor={state.offset > 0 ? "end" : "start"}
                >
                  <MathText svg notation>
                    N
                  </MathText>
                </text>
                {!fromMidpoint && (
                  <text
                    x={sx(state.offset)}
                    y="20"
                    textAnchor="middle"
                    className={s.pink}
                  >
                    {perpendicular.throughCentre
                      ? "perpendicular bisector"
                      : "perpendicular line"}
                  </text>
                )}
              </svg>
              <div className={s.controls}>
                <label>
                  <span>
                    <MathText>Move N along AB</MathText>
                  </span>
                  <input
                    aria-label={
                      fromMidpoint
                        ? "Position of N on the chord"
                        : "Foot of perpendicular line"
                    }
                    type="range"
                    min="-8"
                    max="8"
                    step="0.25"
                    value={state.offset}
                    onChange={(e) =>
                      setState((v) => ({
                        ...v,
                        offset: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setState((v) => ({ ...v, offset: 0 }))}
              >
                <MathText>
                  {fromMidpoint
                    ? "Put N at the mid-point"
                    : "Put the perpendicular through O"}
                </MathText>
              </button>
            </div>
            <aside
              className={s.chordReason}
              aria-label={
                fromMidpoint
                  ? "Reason for the right angle"
                  : "Reason for the chord halves"
              }
              data-through-centre={perpendicular.throughCentre}
            >
              <h3>Reason {chordReason.number}</h3>
              <div className={s.working} aria-live="polite" aria-atomic="true">
                {perpendicular.throughCentre ? (
                  <>
                    <p>
                      <b>Given</b>
                      <br />
                      <span aria-label="Because">∵</span>
                      <MathText>
                        {fromMidpoint
                          ? "O is the centre and AN = NB."
                          : "O is the centre and ON ⊥ AB at N."}
                      </MathText>
                    </p>
                    <p>
                      <b>Conclusion</b>
                      <br />
                      <span aria-label="Therefore">∴</span>
                      <strong>
                        <MathText>
                          {fromMidpoint ? "ON ⊥ AB" : "AN = NB"}
                        </MathText>
                      </strong>
                    </p>
                    <p>
                      <MathText>
                        {fromMidpoint
                          ? "The ticks are given. The right-angle mark follows."
                          : "N is the mid-point of chord AB."}
                      </MathText>
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <MathText>
                        {fromMidpoint
                          ? "O is the centre, but N is not the mid-point of AB."
                          : "The pink line meets AB at 90° but misses O."}
                      </MathText>
                    </p>
                    <p>
                      <strong>
                        <MathText>AN ≠ NB</MathText>
                      </strong>
                    </p>
                    <p>
                      <MathText>
                        {fromMidpoint
                          ? "Move N to make the two halves equal before using 16.2."
                          : "Move the line through O to apply this reason."}
                      </MathText>
                    </p>
                  </>
                )}
              </div>
              <p className={s.reasonName}>
                <ReasonLabel reason={chordReason} arrow={false} />
              </p>
              <div className={s.readouts}>
                <div>
                  <strong>
                    <MathText notation>AN</MathText> ={" "}
                    {format(perpendicular.an)} cm
                  </strong>
                  <strong>
                    <MathText notation>NB</MathText> ={" "}
                    {format(perpendicular.nb)} cm
                  </strong>
                </div>
                <div>
                  {!fromMidpoint && (
                    <span>
                      <MathText>Pink line ⊥ AB</MathText>
                    </span>
                  )}
                  <span>
                    <MathText notation>∠ONB</MathText> ={" "}
                    {format(perpendicular.centreAngle)}°
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
      {state.experiment === "centre" && (
        <>
          <p>
            Follow the ticks and the right-angle mark on each chord. With one
            bisector, predict a line containing the centre. With both, tap the
            point they share.
          </p>
          <div className={s.perpendicularLayout}>
            <div className={s.perpendicularBoard}>
              <div className={s.choices}>
                <label>
                  <input
                    type="checkbox"
                    checked={state.firstBisector}
                    onChange={(e) =>
                      setState((v) => ({
                        ...v,
                        firstBisector: e.target.checked,
                        reveal: false,
                        check: false,
                      }))
                    }
                  />
                  First perpendicular bisector
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={state.secondBisector}
                    onChange={(e) =>
                      setState((v) => ({
                        ...v,
                        secondBisector: e.target.checked,
                        reveal: false,
                        check: false,
                      }))
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
                data-testid="hidden-centre-construction"
                aria-label={`Hidden centre construction: ${bisectors} perpendicular bisectors shown. ${state.reveal && bisectors === 2 ? "The green point O marks their intersection." : "Tap to place a guess; keyboard coordinate controls are below."}`}
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
                          <g
                            transform={`translate(${sx(chord.midpoint.x)} ${sy(chord.midpoint.y)}) rotate(${c.angle})`}
                            stroke={c.color}
                            fill="none"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          >
                            <path
                              data-given="right-angle"
                              d="M 0 -13 H 13 V 0"
                            />
                            {[-1, 1].map((side) => {
                              const x = side * 7 * Math.sqrt(100 - c.d ** 2);
                              return (
                                <g
                                  key={side}
                                  data-given="equal-half"
                                  transform={`translate(${x} 0)`}
                                >
                                  {c.labels[0] === "A" ? (
                                    <path d="M -2 6 L 2 -6" />
                                  ) : (
                                    <path d="M -5 6 L -1 -6 M 1 6 L 5 -6" />
                                  )}
                                </g>
                              );
                            })}
                          </g>
                          {state.reveal && bisectors === 1 && (
                            <line
                              data-result="locus"
                              x1={sx(-chord.normal.x * 12)}
                              y1={sy(-chord.normal.y * 12)}
                              x2={sx(chord.normal.x * 12)}
                              y2={sy(chord.normal.y * 12)}
                              stroke="#18764b"
                              strokeOpacity=".3"
                              strokeWidth="11"
                            />
                          )}
                          <line
                            x1={sx(-chord.normal.x * 12)}
                            y1={sy(-chord.normal.y * 12)}
                            x2={sx(chord.normal.x * 12)}
                            y2={sy(chord.normal.y * 12)}
                            stroke={c.color}
                            strokeDasharray={
                              c.labels[0] === "A" ? undefined : "9 4"
                            }
                            strokeWidth="3.5"
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
                {state.reveal && bisectors === 2 && (
                  <g data-result="centre">
                    <circle
                      cx="230"
                      cy="185"
                      r="10"
                      fill="white"
                      stroke="#18764b"
                      strokeWidth="3"
                    />
                    <circle cx="230" cy="185" r="5" fill="#18764b" />
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
                  disabled={bisectors !== 2}
                  onClick={() => setState((v) => ({ ...v, check: true }))}
                >
                  Check my centre
                </button>
                <button
                  type="button"
                  aria-expanded={state.reveal && bisectors > 0}
                  disabled={bisectors === 0}
                  onClick={() => setState((v) => ({ ...v, reveal: !v.reveal }))}
                >
                  <MathText>
                    {state.reveal
                      ? "Hide conclusion"
                      : bisectors === 1
                        ? "Show where O must lie"
                        : "Reveal O and the reason"}
                  </MathText>
                </button>
              </div>
              {state.check && bisectors === 2 && (
                <p className={s.feedback} role="status">
                  {!state.guess
                    ? "Place a marker first by tapping the circle or using the keyboard controls."
                    : locatedCentre(state.guess)
                      ? "Your marker is close to the intersection (within 0.35 cm). The exact centre is where the two perpendicular bisectors intersect."
                      : "Your marker is away from the intersection. Each perpendicular bisector contains the centre; find the point they share."}
                </p>
              )}
            </div>
            <div>
              <ReasonEvidencePanel
                reasonId="r3"
                revealed={state.reveal && bisectors > 0}
                given={
                  bisectors === 0
                    ? "AB and CD are two non-parallel chords. Show a bisector to see its given marks."
                    : bisectors === 2
                      ? "Both chords are bisected at right angles. Single ticks match on AB; double ticks match on CD."
                      : `The line meets chord ${state.firstBisector ? "AB" : "CD"} at its mid-point and at a right angle.`
                }
                hint={
                  bisectors === 2
                    ? "Use 16.3 once for each chord. The green ring marks the only point the two bisectors share."
                    : "Both the ticks and the square are given. The shaded line contains the centre; its exact position is still unknown."
                }
                conclusion={
                  bisectors === 2
                    ? "O lies on both perpendicular bisectors. Their unique intersection is the centre."
                    : "O lies somewhere on the marked perpendicular bisector. One line does not locate the exact point."
                }
              />
              {!state.reveal && (
                <p className={s.small}>
                  {bisectors === 0
                    ? "Select the first perpendicular bisector to start."
                    : bisectors === 1
                      ? "Can one line locate the exact centre? Try the second bisector."
                      : "Look for the point common to both lines."}
                </p>
              )}
            </div>
          </div>
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
