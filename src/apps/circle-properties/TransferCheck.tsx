"use client";

import { useRef, useState } from "react";
import { reasons, type LabId } from "./content";
import { useLocalSession } from "./useLocalSession";
import MathText, { MathSvgText } from "./MathText";
import {
  transferRoutes,
  transferQuestion,
  gradeTransfer,
  initialTransfer,
  parseTransfer,
  blankTransferResponse,
  transferSummary,
  transferReport,
  transferArcConstruction,
  type TransferQuestion,
  type TransferResponse,
} from "./transfer";
import s from "./transfer.module.css";

type P = { x: number; y: number };
const C = { x: 240, y: 180 },
  R = 126;
const polar = (a: number): P => ({
  x: C.x + R * Math.cos((a * Math.PI) / 180),
  y: C.y + R * Math.sin((a * Math.PI) / 180),
});
const rotate = (p: P, a: number): P => {
  const t = (a * Math.PI) / 180;
  return {
    x: C.x + (p.x - C.x) * Math.cos(t) - (p.y - C.y) * Math.sin(t),
    y: C.y + (p.x - C.x) * Math.sin(t) + (p.y - C.y) * Math.cos(t),
  };
};
const line = (a: P, b: P) => `${a.x},${a.y} ${b.x},${b.y}`;
const angleText = (at: P, a: P, b: P, distance = 39) => {
  const av = { x: a.x - at.x, y: a.y - at.y },
    bv = { x: b.x - at.x, y: b.y - at.y },
    al = Math.hypot(av.x, av.y),
    bl = Math.hypot(bv.x, bv.y),
    sum = { x: av.x / al + bv.x / bl, y: av.y / al + bv.y / bl },
    l = Math.hypot(sum.x, sum.y);
  return { x: at.x + (distance * sum.x) / l, y: at.y + (distance * sum.y) / l };
};
function rightAngleCorner(vertex: P, a: P, b: P) {
  const along = (end: P) => {
    const dx = end.x - vertex.x,
      dy = end.y - vertex.y,
      scale = 16 / Math.hypot(dx, dy);
    return { x: dx * scale, y: dy * scale };
  };
  const u = along(a),
    v = along(b);
  return `M ${vertex.x + u.x} ${vertex.y + u.y} l ${v.x} ${v.y} l ${-u.x} ${-u.y}`;
}
function Arc({
  start,
  sweep,
  colour,
  focus = true,
}: {
  start: number;
  sweep: number;
  colour: string;
  focus?: boolean;
}) {
  const a = polar(start),
    b = polar(start + sweep);
  return (
    <path
      className={focus ? s.focusFeature : undefined}
      d={`M ${a.x} ${a.y} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`}
      fill="none"
      stroke={colour}
      strokeWidth="5"
    />
  );
}
function Label({
  p,
  text,
  dx = 0,
  dy = 0,
  angle = false,
}: {
  p: P;
  text: string;
  dx?: number;
  dy?: number;
  angle?: boolean;
}) {
  return (
    <MathSvgText
      x={p.x + dx}
      y={p.y + dy}
      textAnchor="middle"
      dominantBaseline="middle"
      className={angle ? s.angle : undefined}
    >
      {text}
    </MathSvgText>
  );
}
function Point({ p, label }: { p: P; label: string }) {
  const dx = ((p.x - C.x) / R) * 18,
    dy = ((p.y - C.y) / R) * 18;
  return (
    <g>
      <circle cx={p.x} cy={p.y} r="3" fill="#143b68" />
      <Label p={p} text={label} dx={dx} dy={dy} />
    </g>
  );
}

const diagramCues: Record<string, string> = {
  r1: "Follow ON through O: it meets AB at 90°.",
  r2: "Compare AN and NB, then follow the line from O.",
  r3: "The perpendicular bisector passes through both the midpoint and O.",
  r4: "Compare the two perpendicular distances OM and ON.",
  r5: "The equal perpendicular distances connect the two highlighted chords.",
  r6: "Both highlighted angles meet the same arc AB.",
  r7: "Follow both circumference angles to the same chord AB.",
  r8: "Check that AB passes through O: it is a diameter.",
  r9: "The right angle at P points to AB as a diameter.",
  r10: "Compare each centre angle with its highlighted arc.",
  r11: "Follow the equal arcs back to their centre angles.",
  r12: "Follow each centre angle to its highlighted chord.",
  r13: "Follow the equal chords back to their centre angles.",
  r14: "Each highlighted chord matches the arc between its endpoints.",
  r15: "Each highlighted arc matches the chord between its endpoints.",
  r16: "Match each centre angle to its highlighted arc before comparing ratios.",
  r17: "Match each circumference angle to the arc that excludes its vertex.",
};

export function CheckDiagram({
  q,
  reviewed = false,
}: {
  q: TransferQuestion;
  reviewed?: boolean;
}) {
  const d = q.diagram,
    turn = [0, 25, -28][d.variant],
    blue = "#3769f4",
    pink = "#bc2e59";
  let drawing: React.ReactNode;
  if (q.lab === "bisector") {
    const half = Math.sqrt(R * R - 58 * 58),
      rawA = { x: C.x - half, y: C.y - 58 },
      rawB = { x: C.x + half, y: C.y - 58 };
    const a = rotate(rawA, q.reasonId === "r3" ? 0 : turn),
      b = rotate(rawB, q.reasonId === "r3" ? 0 : turn),
      n = rotate({ x: C.x, y: C.y - 58 }, q.reasonId === "r3" ? 0 : turn);
    const mid = (a: P, b: P) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    drawing = (
      <>
        <polyline
          className={s.focusFeature}
          points={line(a, b)}
          fill="none"
          stroke={blue}
          strokeWidth="3"
        />
        {q.reasonId !== "r3" && (
          <polyline
            className={s.focusFeature}
            points={line(C, n)}
            stroke={pink}
            strokeWidth="2"
            fill="none"
          />
        )}
        {q.reasonId === "r3" && (
          <line
            className={s.focusFeature}
            x1="240"
            y1="40"
            x2="240"
            y2="325"
            stroke={pink}
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        )}
        <Point p={a} label="A" />
        <Point p={b} label="B" />
        <Label p={n} text="N" dy={-15} />
        {(q.reasonId !== "r3" || reviewed) && (
          <>
            <circle cx={C.x} cy={C.y} r="3" fill={pink} />
            <Label p={C} text="O" dy={20} />
          </>
        )}
        {q.reasonId === "r1" ? (
          <>
            <Label p={mid(a, n)} text="x cm" dy={-17} angle />
            <Label p={angleText(n, C, b, 27)} text="90°" angle />
          </>
        ) : q.reasonId === "r2" ? (
          <>
            <Label p={mid(a, n)} text={`${d.value} cm`} dy={-17} />
            <Label p={mid(n, b)} text={`${d.value} cm`} dy={-17} />
            <Label p={angleText(n, C, b, 29)} text="x°" angle />
          </>
        ) : (
          <>
            <Label p={a} text={`(${d.value}, 0)`} dy={30} />
            <Label p={b} text={`(${d.other}, 0)`} dy={30} />
            <Label
              p={{ x: C.x, y: 350 }}
              text="Horizontal coordinate of O = x"
            />
          </>
        )}
      </>
    );
  } else if (q.lab === "chords") {
    const a = polar(210),
      b = polar(330),
      c = polar(30 + turn),
      e = polar(150 + turn),
      m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      n = { x: (c.x + e.x) / 2, y: (c.y + e.y) / 2 };
    drawing = (
      <>
        <polyline
          className={q.reasonId === "r5" ? s.focusFeature : undefined}
          points={line(a, b)}
          stroke={blue}
          strokeWidth="3"
        />
        <polyline
          className={q.reasonId === "r5" ? s.focusFeature : undefined}
          points={line(c, e)}
          stroke={pink}
          strokeWidth="3"
        />
        <polyline
          className={q.reasonId === "r4" ? s.focusFeature : undefined}
          points={line(C, m)}
          stroke={blue}
          strokeWidth="2"
        />
        <polyline
          className={q.reasonId === "r4" ? s.focusFeature : undefined}
          points={line(C, n)}
          stroke={pink}
          strokeWidth="2"
        />
        <Point p={a} label="A" />
        <Point p={b} label="B" />
        <Point p={c} label="C" />
        <Point p={e} label="D" />
        <Label p={m} text="M" dx={14} dy={-13} />
        <Label p={n} text="N" dx={14} dy={13} />
        <Label p={C} text="O" dx={-15} />
        <Label p={angleText(m, C, b, 24)} text="90°" />
        <Label p={angleText(n, C, c, 24)} text="90°" />
        {q.reasonId === "r4" ? (
          <>
            <Label
              p={{ x: (C.x + m.x) / 2, y: (C.y + m.y) / 2 }}
              text={`${d.value} cm`}
              dx={-28}
            />
            <Label
              p={{ x: (C.x + n.x) / 2, y: (C.y + n.y) / 2 }}
              text="x cm"
              dx={32}
              angle
            />
          </>
        ) : (
          <>
            <Label p={m} text={`${d.value} cm`} dy={-30} />
            <Label p={n} text="x cm" dy={30} angle />
          </>
        )}
      </>
    );
  } else if (
    q.lab === "centre" ||
    q.lab === "segment" ||
    q.lab === "semicircle"
  ) {
    const sweep = q.lab === "semicircle" ? 180 : d.angle,
      start = -90 - sweep / 2 + turn,
      a = polar(start),
      b = polar(start + sweep),
      p = polar(start + sweep + (360 - sweep) * 0.38),
      z = polar(start + sweep + (360 - sweep) * 0.74);
    const showRightAngle =
      q.lab === "semicircle" && (q.reasonId === "r9" || reviewed);
    drawing = (
      <>
        {(q.reasonId !== "r9" || reviewed) && (
          <Arc start={start} sweep={sweep} colour={blue} />
        )}
        <polyline
          className={s.focusFeature}
          points={`${line(a, p)} ${b.x},${b.y}`}
          fill="none"
          stroke={blue}
          strokeWidth="2"
        />
        <polyline
          className={q.lab === "semicircle" ? s.focusFeature : undefined}
          points={line(a, b)}
          stroke="#72869c"
          strokeWidth="2"
        />
        {q.lab === "centre" && (
          <>
            <polyline
              className={s.focusFeature}
              points={`${line(a, C)} ${b.x},${b.y}`}
              fill="none"
              stroke={pink}
              strokeWidth="2"
            />
            <Label p={C} text="O" dy={20} />
            <Label p={angleText(C, a, b, 36)} text={`${d.angle}°`} angle />
          </>
        )}
        {q.lab === "segment" && (
          <>
            <polyline
              className={s.focusFeature}
              points={`${line(a, z)} ${b.x},${b.y}`}
              fill="none"
              stroke={pink}
              strokeWidth="2"
            />
            <Point p={z} label="Q" />
            <Label p={angleText(z, a, b, 44)} text="x°" angle />
          </>
        )}
        <Point p={a} label="A" />
        <Point p={b} label="B" />
        <Point p={p} label="P" />
        {showRightAngle && (
          <path
            aria-label="Right angle at P"
            d={rightAngleCorner(p, a, b)}
            fill="none"
            stroke={pink}
            strokeWidth="2.5"
          />
        )}
        <Label
          p={angleText(p, a, b, 46)}
          text={
            q.lab === "segment" ? `${d.value}°` : showRightAngle ? "90°" : "x°"
          }
          angle
        />
        {q.lab === "semicircle" && (
          <>
            {(q.reasonId !== "r9" || reviewed) && (
              <Label p={C} text="O" dy={-17} />
            )}
            {q.reasonId === "r9" && <Label p={C} text="AB = x cm" dy={25} />}
          </>
        )}
      </>
    );
  } else {
    const ratio = q.lab === "ratios",
      circ = q.reasonId === "r17";
    const { firstSweep, secondSweep, start, secondStart, pAngle, qAngle } =
        transferArcConstruction(q),
      a = polar(start),
      b = polar(start + firstSweep),
      c = polar(secondStart),
      e = polar(secondStart + secondSweep);
    const firstCentre = angleText(C, a, b, 40),
      secondCentre = angleText(C, c, e, 40);
    const vtext =
      q.reasonId === "r10" || q.reasonId === "r14"
        ? "Arc AB"
        : q.reasonId === "r12" || q.reasonId === "r15"
          ? "Chord AB"
          : "";
    drawing = (
      <>
        <Arc
          start={start}
          sweep={firstSweep}
          colour={blue}
          focus={!["r12", "r13"].includes(q.reasonId)}
        />
        <Arc
          start={secondStart}
          sweep={secondSweep}
          colour={pink}
          focus={!["r12", "r13"].includes(q.reasonId)}
        />
        <polyline
          className={
            ["r12", "r13", "r14", "r15"].includes(q.reasonId)
              ? s.focusFeature
              : undefined
          }
          points={line(a, b)}
          stroke={blue}
          strokeWidth="2"
        />
        <polyline
          className={
            ["r12", "r13", "r14", "r15"].includes(q.reasonId)
              ? s.focusFeature
              : undefined
          }
          points={line(c, e)}
          stroke={pink}
          strokeWidth="2"
        />
        {circ ? (
          (() => {
            const p = polar(pAngle),
              z = polar(qAngle);
            return (
              <>
                <polyline
                  className={s.focusFeature}
                  points={`${line(a, p)} ${b.x},${b.y}`}
                  fill="none"
                  stroke={blue}
                  strokeWidth="2"
                />
                <polyline
                  className={s.focusFeature}
                  points={`${line(c, z)} ${e.x},${e.y}`}
                  fill="none"
                  stroke={pink}
                  strokeWidth="2"
                />
                <Point p={p} label="P" />
                <Point p={z} label="Q" />
                <Label p={angleText(p, a, b, 42)} text={`${d.angle}°`} angle />
                <Label p={angleText(z, c, e, 42)} text={`${d.value}°`} angle />
              </>
            );
          })()
        ) : (
          <>
            <polyline
              className={
                !["r14", "r15"].includes(q.reasonId)
                  ? s.focusFeature
                  : undefined
              }
              points={`${line(a, C)} ${b.x},${b.y}`}
              fill="none"
              stroke={blue}
              strokeWidth="1.8"
            />
            <polyline
              className={
                !["r14", "r15"].includes(q.reasonId)
                  ? s.focusFeature
                  : undefined
              }
              points={`${line(c, C)} ${e.x},${e.y}`}
              fill="none"
              stroke={pink}
              strokeWidth="1.8"
            />
            <Label p={C} text="O" dy={18} />
            {!["r14", "r15"].includes(q.reasonId) && (
              <>
                <Label p={firstCentre} text={`${d.angle}°`} angle />
                <Label
                  p={secondCentre}
                  text={
                    q.reasonId === "r11" || q.reasonId === "r13"
                      ? "x°"
                      : `${secondSweep}°`
                  }
                  angle
                />
              </>
            )}
          </>
        )}
        <Point p={a} label="A" />
        <Point p={b} label="B" />
        <Point p={c} label="C" />
        <Point p={e} label="D" />
        {vtext && (
          <>
            <Label p={{ x: 110, y: 335 }} text={`${vtext} = ${d.value} cm`} />
            <Label
              p={{ x: 365, y: 335 }}
              text={`${vtext.replace("AB", "CD")} = x cm`}
              angle
            />
          </>
        )}
        {ratio && (
          <>
            <Label p={{ x: 120, y: 335 }} text="Arc AB = x cm" angle />
            <Label p={{ x: 360, y: 335 }} text={`Arc CD = ${d.other} cm`} />
          </>
        )}
        {["r11", "r15"].includes(q.reasonId) && (
          <Label
            p={{ x: 240, y: q.reasonId === "r15" ? 355 : 335 }}
            text="Minor arc AB = minor arc CD"
          />
        )}
        {["r13", "r14"].includes(q.reasonId) && (
          <Label p={{ x: 240, y: 355 }} text="AB = CD" />
        )}
      </>
    );
  }
  return (
    <svg
      className={s.diagram}
      data-reviewed={reviewed}
      viewBox="0 0 480 390"
      role="img"
      aria-label={`Question diagram. ${q.given} ${q.ask}`}
    >
      <circle
        cx={C.x}
        cy={C.y}
        r={R}
        fill="white"
        stroke="#8197ad"
        strokeWidth="2"
      />
      {drawing}
      <text x="240" y="380" textAnchor="middle" className={s.note}>
        Schematic diagram — use the given information.
      </text>
    </svg>
  );
}

export default function TransferCheck({
  onExplore,
}: {
  onExplore: (lab: LabId) => void;
}) {
  const figureRef = useRef<HTMLDivElement>(null);
  const [reviewPulse, setReviewPulse] = useState(0);
  const [state, setState, failed] = useLocalSession(
    "transfer-check-v3",
    initialTransfer,
    parseTransfer,
  );
  const route = transferRoutes[state.route],
    id = route[state.index],
    q = id ? transferQuestion(id, state.variant) : null;
  const summary = transferSummary(state.attempts);
  const grade = q && state.submitted ? gradeTransfer(q, state.response) : null;
  function showGeometry() {
    setReviewPulse((value) => value + 1);
    figureRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    figureRef.current?.focus({ preventScroll: true });
  }
  function update(key: keyof TransferResponse, value: string) {
    setState((v) => ({ ...v, response: { ...v.response, [key]: value } }));
  }
  function changeRoute(name: string) {
    if (!Object.hasOwn(transferRoutes, name)) return;
    setState((v) =>
      v.route === name
        ? v
        : {
            ...v,
            route: name,
            index: 0,
            variant: (v.variant + 1) % 3,
            response: blankTransferResponse(),
            submitted: false,
          },
    );
  }
  function submit() {
    if (!q || state.submitted) return;
    const result = gradeTransfer(q, state.response);
    setState((v) => ({
      ...v,
      submitted: true,
      attempts: [
        ...v.attempts,
        {
          questionId: q.id,
          reasonId: q.reasonId,
          variant: v.variant,
          response: { ...v.response },
          grade: result,
          at: new Date().toISOString(),
        },
      ].slice(-150),
    }));
  }
  function download() {
    const blob = new Blob([transferReport(state)], {
        type: "text/plain;charset=utf-8",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "Circle-Lab-learning-check.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  const conditionOptions = q
    ? (() => {
        const items = [q.condition, ...q.wrongConditions],
          offset = (Number(q.reasonId.slice(1)) + state.variant) % 3;
        return items.slice(offset).concat(items.slice(0, offset));
      })()
    : [];
  return (
    <section className={s.check} aria-label="New diagram check">
      <div className={s.intro}>
        <div>
          <h2>Apply &amp; check</h2>
          <p>Use the givens to justify one step.</p>
        </div>
        <label className={s.route}>
          Check route
          <select
            value={state.route}
            onChange={(event) => changeRoute(event.target.value)}
          >
            {Object.keys(transferRoutes).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      {q ? (
        <>
          <div className={s.layout}>
            <div
              className={s.figure}
              ref={figureRef}
              tabIndex={-1}
              aria-label="Question and diagram"
            >
              <div className={s.questionTitle}>
                <span>
                  Question {state.index + 1} of {route.length}
                </span>
                <h3>
                  <MathText>{q.ask}</MathText>
                </h3>
              </div>
              <div className={s.given}>
                <b>Given</b>
                <p>
                  <MathText>{q.given}</MathText>
                </p>
              </div>
              <CheckDiagram
                key={`${q.id}-${state.submitted}-${reviewPulse}`}
                q={q}
                reviewed={state.submitted}
              />
              {state.submitted && (
                <p className={s.diagramCue}>
                  <MathText>{diagramCues[q.reasonId]}</MathText>
                </p>
              )}
            </div>
            <form
              className={s.form}
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <label className={s.field}>
                <span>
                  My value for <MathText>x</MathText> {q.unit && `(${q.unit})`}
                </span>
                <input
                  aria-label="Value of x"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  value={state.response.value}
                  disabled={state.submitted}
                  onChange={(e) => update("value", e.target.value)}
                />
              </label>
              <fieldset
                className={s.choices}
                aria-label="Reason for this step"
                disabled={state.submitted}
              >
                <legend>My reason</legend>
                {q.reasonChoices.map((r) => (
                  <label
                    key={r}
                    className={s.choice}
                    data-selected={state.response.reason === r}
                  >
                    <input
                      type="radio"
                      name="transfer-reason"
                      value={r}
                      required
                      checked={state.response.reason === r}
                      onChange={() => update("reason", r)}
                    />
                    <span>
                      <MathText>
                        {reasons.find((x) => x.id === r)!.label}
                      </MathText>
                    </span>
                  </label>
                ))}
              </fieldset>
              <fieldset
                className={s.choices}
                aria-label="Necessary condition"
                disabled={state.submitted}
              >
                <legend>The condition I checked</legend>
                {conditionOptions.map((c) => (
                  <label
                    key={c}
                    className={s.choice}
                    data-selected={state.response.condition === c}
                  >
                    <input
                      type="radio"
                      name="transfer-condition"
                      value={c}
                      required
                      checked={state.response.condition === c}
                      onChange={() => update("condition", c)}
                    />
                    <span>
                      <MathText>{c}</MathText>
                    </span>
                  </label>
                ))}
              </fieldset>
              {!state.submitted && (
                <button className={s.primary} type="submit">
                  Check this step
                </button>
              )}
              {grade && (
                <div
                  className={s.status}
                  data-correct={grade.correct}
                  role="status"
                >
                  <span className={s.part}>
                    Value: {grade.value ? "✓" : "review"}
                  </span>
                  <span className={s.part}>
                    Reason: {grade.reason ? "✓" : "review"}
                  </span>
                  <span className={s.part}>
                    Condition: {grade.condition ? "✓" : "review"}
                  </span>
                  <p className={s.feedbackLead}>
                    <MathText>
                      {grade.correct
                        ? "All three parts agree."
                        : !grade.condition
                          ? `Check the condition: ${q.condition}`
                          : !grade.reason
                            ? "Check the direction of your reason: start from the givens, then reach the conclusion."
                            : "Recheck the requested value using the highlighted relationship."}
                    </MathText>
                  </p>
                  <button
                    type="button"
                    className={s.showGeometry}
                    onClick={showGeometry}
                  >
                    Show this on the diagram
                  </button>
                  <details className={s.explanation}>
                    <summary>Explain this step</summary>
                    {grade.messages.map((m) => (
                      <p key={m}>
                        <MathText>{m}</MathText>
                      </p>
                    ))}
                  </details>
                </div>
              )}
              <div className={s.actions}>
                {state.submitted && (
                  <>
                    <button
                      className={s.primary}
                      type="button"
                      onClick={() =>
                        setState((v) => ({
                          ...v,
                          index: v.index + 1,
                          response: blankTransferResponse(),
                          submitted: false,
                        }))
                      }
                    >
                      Next new diagram
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setState((v) => ({
                          ...v,
                          variant: (v.variant + 1) % 3,
                          response: blankTransferResponse(),
                          submitted: false,
                        }))
                      }
                    >
                      Try a different case of this reason
                    </button>
                  </>
                )}
                <button type="button" onClick={() => onExplore(q.lab)}>
                  Explore this property
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className={s.form}>
          <h3>This route is complete</h3>
          <p>
            Your evidence is below. Try another route to practise a different
            direction of reasoning, or revisit a property that needs attention.
          </p>
          <button
            type="button"
            onClick={() =>
              setState((v) => ({
                ...v,
                index: 0,
                variant: (v.variant + 1) % 3,
                response: blankTransferResponse(),
                submitted: false,
              }))
            }
          >
            Another set of diagrams
          </button>
        </div>
      )}
      <section className={s.summary} aria-label="Learning evidence">
        <details className={s.record}>
          <summary>
            <strong>Your check record</strong>
            <span>
              {summary.sampled}/17 reasons sampled; {summary.correct}/
              {summary.attempts} attempts have all three parts correct.
            </span>
          </summary>
          <div className={s.totals}>
            <div>
              <b>{summary.valueErrors}</b>
              <span>Values to revisit</span>
            </div>
            <div>
              <b>{summary.reasonErrors}</b>
              <span>Reason choices to revisit</span>
            </div>
            <div>
              <b>{summary.conditionErrors}</b>
              <span>Conditions to revisit</span>
            </div>
          </div>
          <p className={s.small}>
            An attempt can appear in more than one category. This is evidence
            from these questions, not a judgement of mastery. No student name is
            collected.
          </p>
          <details>
            <summary>Review the sampled reasons</summary>
            {reasons
              .filter((r) => state.attempts.some((a) => a.reasonId === r.id))
              .map((r) => {
                const attempts = state.attempts.filter(
                    (a) => a.reasonId === r.id,
                  ),
                  latest = attempts.at(-1)!;
                return (
                  <div className={s.reasonRow} key={r.id}>
                    <b>
                      {r.number} · {r.label}
                    </b>
                    <span>
                      Latest:{" "}
                      {latest.grade.correct
                        ? "all parts correct"
                        : `revisit ${[!latest.grade.value && "value", !latest.grade.reason && "reason", !latest.grade.condition && "condition"].filter(Boolean).join(", ")}`}{" "}
                      · {attempts.length} attempt(s)
                    </span>
                    <button type="button" onClick={() => onExplore(r.lab)}>
                      Explore this property
                    </button>
                  </div>
                );
              })}
          </details>
          <div className={s.actions}>
            <button
              type="button"
              onClick={download}
              disabled={state.attempts.length === 0}
            >
              Download this check record
            </button>
          </div>
          <p className={s.small}>
            The file stays on your device until you choose to share it with your
            teacher.
          </p>
        </details>
      </section>
      {failed && (
        <p role="status">
          This browser could not save your check. Download the record before
          closing this page.
        </p>
      )}
    </section>
  );
}
