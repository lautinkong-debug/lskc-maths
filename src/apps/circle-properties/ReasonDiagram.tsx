import { useEffect, useRef } from "react";
import type { ReasonQuestion } from "./content";
import styles from "./practice.module.css";
import MathText from "./MathText";

type Pt = { x: number; y: number };
const O = { x: 200, y: 140 },
  R = 103;
const point = (degrees: number, centre = O, radius = R): Pt => ({
  x: centre.x + radius * Math.cos((degrees * Math.PI) / 180),
  y: centre.y + radius * Math.sin((degrees * Math.PI) / 180),
});
function line(a: Pt, b: Pt, key: string, marked = false) {
  return (
    <line
      key={key}
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      className={marked ? styles.givenLine : styles.figureLine}
    />
  );
}
function label(name: string, p: Pt, centre = O) {
  const norm = Math.hypot(p.x - centre.x, p.y - centre.y) || 1;
  return (
    <g key={`point-${name}`}>
      <circle cx={p.x} cy={p.y} r="3" className={styles.vertex} />
      <text
        x={p.x + ((p.x - centre.x) / norm) * 16}
        y={p.y + ((p.y - centre.y) / norm) * 16 + 5}
        className={styles.vertexLabel}
        textAnchor="middle"
      >
        <MathText svg notation>
          {name}
        </MathText>
      </text>
    </g>
  );
}
function arc(start: number, sweep: number, radius = R, centre = O) {
  const a = point(start, centre, radius),
    b = point(start + sweep, centre, radius);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}
function tick(a: Pt, b: Pt, double = false) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy);
  const cx = (a.x + b.x) / 2,
    cy = (a.y + b.y) / 2;
  return (
    <g className={styles.givenLine}>
      {(double ? [-3, 3] : [0]).map((offset) => (
        <line
          key={offset}
          x1={cx + (dx / length) * offset - (dy / length) * 5}
          y1={cy + (dy / length) * offset + (dx / length) * 5}
          x2={cx + (dx / length) * offset + (dy / length) * 5}
          y2={cy + (dy / length) * offset - (dx / length) * 5}
        />
      ))}
    </g>
  );
}
function square(at: Pt, a: Pt, b: Pt) {
  const la = Math.hypot(a.x - at.x, a.y - at.y),
    lb = Math.hypot(b.x - at.x, b.y - at.y);
  const u = { x: ((a.x - at.x) / la) * 12, y: ((a.y - at.y) / la) * 12 },
    v = { x: ((b.x - at.x) / lb) * 12, y: ((b.y - at.y) / lb) * 12 };
  return (
    <path
      d={`M ${at.x + u.x} ${at.y + u.y} l ${v.x} ${v.y} l ${-u.x} ${-u.y}`}
      className={styles.givenLine}
      fill="none"
    />
  );
}
function angleText(at: Pt, value: string, centre = O) {
  const len = Math.hypot(at.x - centre.x, at.y - centre.y) || 1;
  return (
    <text
      x={at.x - ((at.x - centre.x) / len) * 38}
      y={at.y - ((at.y - centre.y) / len) * 38 + 5}
      textAnchor="middle"
      className={styles.givenText}
    >
      <MathText svg notation>
        {value}
      </MathText>
    </text>
  );
}
const captions: Record<string, string> = {
  r1: "Given: the line from O is perpendicular to AB.",
  r2: "Given: the two parts of AB are equal.",
  r3: "Given: ℓ is perpendicular to AB and bisects AB. O is not shown.",
  r4: "Given: equal chords; both distances are perpendicular.",
  r5: "Given: equal perpendicular distances from O.",
  r6: "Follow the highlighted arc: it excludes P.",
  r7: "P and Q lie on the same side of AB, on the circle.",
  r8: "Given: AB passes through the centre O.",
  r9: "Given: the angle at C is 90° and C is on the circle.",
  r10: "Given angles are highlighted. Compare their corresponding arcs.",
  r11: "Given equal arcs are highlighted; match each to its angle.",
  r12: "Given equal angles are highlighted; AB and CD are chords.",
  r13: "Given equal chords are ticked; compare matching angles.",
  r14: "Given equal chords are ticked; match minor with minor or major with major.",
  r15: "Given equal arcs are highlighted; AB and CD are chords.",
  r16: "The given angles are at O. Follow the two selected arcs.",
  r17: "The given angles are at P and Q. Each selected arc excludes its vertex.",
};
const connections: Record<string, string> = {
  r1: "Follow ON from the centre to the right angle on AB, then compare AN and NB.",
  r2: "The ticked halves meet at N; ON joins N to the centre O.",
  r3: "The marked line both bisects AB and meets AB at a right angle.",
  r4: "Pair each ticked chord with its perpendicular distance from O.",
  r5: "The ticked perpendicular distances belong to chords AB and CD.",
  r6: "Trace the selected arc AB; the matching angles are at O and P.",
  r7: "Both angles meet the same endpoints A and B; check the side containing P and Q.",
  r8: "AB goes through O; follow its endpoints to the circumference angle.",
  r9: "The right angle is at C on the circle; follow CA and CB to chord AB.",
  r10: "Match each marked angle with the selected arc between its endpoints.",
  r11: "Follow each marked arc to its matching angle.",
  r12: "Match the marked angles with chords AB and CD.",
  r13: "Follow the ticked chords to their matching angles.",
  r14: "Match the ticked chords with the same type of arc: minor with minor, major with major.",
  r15: "Each marked arc has a chord joining its endpoints.",
  r16: "Compare the two selected arcs with their angles at O.",
  r17: "Compare each selected arc with its angle at P or Q; the arc excludes that vertex.",
};

export function pairedDiagramGeometry(question: ReasonQuestion) {
  const number = Number(question.id.slice(1));
  const circumference = number === 17 || number >= 20;
  const degrees = Array.from(question.given.matchAll(/(\d+)°/g), (m) =>
    Number(m[1]),
  );
  let thetaA = degrees[0] ?? (/major arc/i.test(question.given) ? 240 : 70);
  let thetaB = degrees[1] ?? thetaA;
  if (circumference) {
    thetaA = 2 * (degrees[0] ?? 40);
    thetaB = 2 * (degrees[1] ?? degrees[0] ?? 40);
  }
  const startA = 270 - thetaA / 2;
  // Offset the second arc so supplementary sweeps cannot make A=D and B=C.
  const startB = 110 - thetaB / 2;
  const endpoints = [startA, startA + thetaA, startB, startB + thetaB, 0];
  const angularDistance = (a: number, b: number) =>
    Math.abs(((a - b + 540) % 360) - 180);
  const clearance = (a: number) =>
    Math.min(...endpoints.map((b) => angularDistance(a, b)));
  const pBearing =
    [180, 200, 160, 140, 220]
      .filter((a) => (a - startA + 720) % 360 > thetaA)
      .sort((a, b) => clearance(b) - clearance(a))[0] ?? 180;
  return {
    thetaA,
    thetaB,
    startA,
    startB,
    pBearing,
    qBearing: 0,
    points: {
      A: point(startA),
      B: point(startA + thetaA),
      C: point(startB),
      D: point(startB + thetaB),
      P: point(pBearing),
      Q: point(0),
    },
  };
}

/** A schematic of the givens only: no unknown angle values or conclusion marks. */
export default function ReasonDiagram({
  question,
  emphasise = false,
  highlightKey = 0,
}: {
  question: ReasonQuestion;
  emphasise?: boolean;
  highlightKey?: number;
}) {
  const figureRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (highlightKey > 0)
      figureRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [highlightKey]);
  const number = Number(question.id.slice(1)),
    reason = question.reasonId;
  const degrees = Array.from(question.given.matchAll(/(\d+)°/g), (m) =>
    Number(m[1]),
  );
  const circumference = number === 17 || number >= 20;
  let drawing;
  if (number <= 3) {
    const A = point(210),
      B = point(330),
      N = { x: 200, y: A.y };
    drawing = (
      <>
        <circle cx={O.x} cy={O.y} r={R} className={styles.circle} />
        {line(A, B, "AB")}
        {number === 3 ? (
          <>
            {line({ x: 200, y: 25 }, { x: 200, y: 253 }, "ell", true)}
            <text x="214" y="40" className={styles.givenText}>
              <MathText svg notation>
                ℓ
              </MathText>
            </text>
          </>
        ) : (
          <>
            {line(O, N, "ON", number === 1)}
            {label("O", O, { x: 190, y: 130 })}
          </>
        )}
        {number !== 2 && square(N, B, O)}
        {number !== 1 && (
          <>
            {tick(A, N)}
            {tick(N, B)}
          </>
        )}
        {label("A", A)}
        {label("B", B)}
        {label("N", N, { x: 200, y: 120 })}
      </>
    );
  } else if (number <= 5) {
    const A = point(215),
      B = point(325),
      C = point(35),
      D = point(145),
      M = { x: 200, y: A.y },
      N = { x: 200, y: C.y };
    drawing = (
      <>
        <circle cx={O.x} cy={O.y} r={R} className={styles.circle} />
        {line(A, B, "AB")}
        {line(C, D, "CD")}
        {line(O, M, "OM", number === 5)}
        {line(O, N, "ON", number === 5)}
        {square(M, B, O)}
        {square(N, C, O)}
        {number === 4 ? (
          <>
            {tick(A, B)}
            {tick(C, D)}
          </>
        ) : (
          <>
            {tick(O, M, true)}
            {tick(O, N, true)}
          </>
        )}
        {Object.entries({ A, B, C, D, M, N, O }).map(([name, p]) =>
          label(name, p, name === "M" || name === "N" ? { x: 180, y: p.y } : O),
        )}
      </>
    );
  } else if (number === 8 || number === 9) {
    const A = point(180),
      B = point(0),
      C = point(285);
    drawing = (
      <>
        <circle cx={O.x} cy={O.y} r={R} className={styles.circle} />
        {line(A, B, "AB", number === 8)}
        {line(A, C, "AC")}
        {line(B, C, "BC")}
        {number === 8 && label("O", O, { x: 190, y: 130 })}
        {number === 9 && square(C, A, B)}
        {Object.entries({ A, B, C }).map(([name, p]) => label(name, p))}
      </>
    );
  } else if (number === 6 || number === 18 || number === 7) {
    const centreGiven = /(?:Minor|minor|reflex) ∠AOB =/.test(question.given);
    const theta =
      number === 7
        ? 2 * (degrees[0] ?? 47)
        : centreGiven
          ? (degrees[0] ?? 80)
          : 2 * (degrees[0] ?? 38);
    const start = 90 - theta / 2,
      A = point(start),
      B = point(start + theta),
      P = point(270),
      Q = point(205);
    drawing = (
      <>
        <circle cx={O.x} cy={O.y} r={R} className={styles.circle} />
        {line(A, B, "AB")}
        {line(A, P, "AP")}
        {line(B, P, "BP")}
        {number === 7 ? (
          <>
            {line(A, Q, "AQ")}
            {line(B, Q, "BQ")}
            {label("Q", Q)}
            {angleText(
              question.given.includes("∠AQB =") ? Q : P,
              `${degrees[0]}°`,
            )}
          </>
        ) : (
          <>
            {line(O, A, "OA", centreGiven)}
            {line(O, B, "OB", centreGiven)}
            <path d={arc(start, theta)} className={styles.selectedArc} />
            {label("O", O, { x: 190, y: 130 })}
            {centreGiven ? (
              <text
                x="200"
                y="175"
                className={styles.givenText}
                textAnchor="middle"
              >
                {degrees[0]}°{theta > 180 ? " reflex" : ""}
              </text>
            ) : (
              angleText(P, `${degrees[0]}°`)
            )}
          </>
        )}
        {Object.entries({ A, B, P }).map(([name, p]) => label(name, p))}
      </>
    );
  } else if (number === 19) {
    drawing = (
      <>
        {[110, 290].map((x, i) => {
          const centre = { x, y: 140 },
            theta = degrees[0] ?? 70,
            A = point(270 - theta / 2, centre, 64),
            B = point(270 + theta / 2, centre, 64);
          return (
            <g key={x}>
              <circle cx={x} cy="140" r="64" className={styles.circle} />
              {line(centre, A, `${i}-a`, true)}
              {line(centre, B, `${i}-b`, true)}
              {label(i ? "C" : "A", A, centre)}
              {label(i ? "D" : "B", B, centre)}
              {label(i ? "T" : "O", centre, { x: x - 10, y: 130 })}
              <path
                d={arc(270 - theta / 2, theta, 23, centre)}
                className={styles.selectedArc}
              />
            </g>
          );
        })}
        <text x="200" y="245" textAnchor="middle" className={styles.givenText}>
          Equal radii · equal minor centre angles
        </text>
      </>
    );
  } else {
    const {
      thetaA,
      thetaB,
      startA,
      startB,
      points: { A, B, C, D, P, Q },
    } = pairedDiagramGeometry(question);
    const arcGiven = ["r11", "r15"].includes(reason),
      chordGiven = ["r13", "r14"].includes(reason),
      angleGiven = ["r10", "r12", "r16", "r17"].includes(reason);
    drawing = (
      <>
        <circle cx={O.x} cy={O.y} r={R} className={styles.circle} />
        {line(A, B, "AB")}
        {line(C, D, "CD")}
        {chordGiven && (
          <>
            {tick(A, B)}
            {tick(C, D)}
          </>
        )}
        {(arcGiven || reason === "r16" || reason === "r17") && (
          <>
            <path d={arc(startA, thetaA)} className={styles.selectedArc} />
            <path d={arc(startB, thetaB)} className={styles.secondArc} />
            {arcGiven && (
              <>
                <text
                  x="205"
                  y="21"
                  className={styles.givenText}
                  textAnchor="middle"
                >
                  Equal selected arcs
                </text>
              </>
            )}
          </>
        )}
        {circumference ? (
          <>
            {line(P, A, "PA", angleGiven)}
            {line(P, B, "PB", angleGiven)}
            {line(Q, C, "QC", angleGiven)}
            {line(Q, D, "QD", angleGiven)}
            {label("P", P)}
            {label("Q", Q)}
            {degrees.length > 0 && (
              <>
                {angleText(
                  question.given.includes("∠CQD =") &&
                    !question.given.includes("∠APB =")
                    ? Q
                    : P,
                  `${degrees[0]}°`,
                )}
                {(reason === "r17" || reason === "r10" || reason === "r12") &&
                  angleText(Q, `${degrees[1] ?? degrees[0]}°`)}
              </>
            )}
          </>
        ) : (
          <>
            {line(O, A, "OA", angleGiven)}
            {line(O, B, "OB", angleGiven)}
            {line(O, C, "OC", angleGiven)}
            {line(O, D, "OD", angleGiven)}
            {label("O", O, { x: 190, y: 130 })}
            {angleGiven && (
              <>
                <path
                  d={arc(startA, thetaA, 27)}
                  className={styles.selectedArc}
                />
                <path
                  d={arc(startB, thetaB, 36)}
                  className={styles.secondArc}
                />
              </>
            )}
            {degrees.length > 0 && (
              <>
                <text
                  x="200"
                  y="88"
                  textAnchor="middle"
                  className={styles.givenText}
                >
                  {degrees[0]}°{thetaA > 180 ? " reflex" : ""}
                </text>
                {reason === "r16" && (
                  <text
                    x="200"
                    y="208"
                    textAnchor="middle"
                    className={styles.givenText}
                  >
                    {degrees[1]}°
                  </text>
                )}
              </>
            )}
          </>
        )}
        {Object.entries({ A, B, C, D }).map(([name, p]) => label(name, p))}
      </>
    );
  }
  return (
    <figure
      ref={figureRef}
      className={`${styles.diagram} ${emphasise ? styles.emphasised : ""}`}
    >
      <svg
        viewBox="0 0 400 275"
        role="img"
        aria-label={`Given diagram. ${captions[reason]} ${question.given}`}
      >
        <title>Diagram of the given conditions</title>
        <g
          key={`${emphasise}-${highlightKey}`}
          className={emphasise ? styles.givenPulse : undefined}
        >
          {drawing}
        </g>
      </svg>
      <figcaption>
        <strong>
          <MathText>
            {emphasise ? connections[reason] : captions[reason]}
          </MathText>
        </strong>
        <span>Not to scale — use the givens.</span>
      </figcaption>
    </figure>
  );
}
