import { useId, type KeyboardEvent } from "react";
import { MathSvgText } from "../MathText";
import {
  CENTRE,
  RADIUS,
  VIEW_BOX,
  bearing,
  on,
  type El,
  type Figure as FigureModel,
  type Pt,
  type Tone,
  type Tones,
} from "./figureModel";
import s from "./figure.module.css";

const stroke: Record<Exclude<Tone, "off">, string> = {
  base: "#3d5068",
  given: "#2454c6",
  get: "#18764b",
  aux: "#6b5d8a",
};
const ink: Record<Exclude<Tone, "off">, string> = {
  base: "#17304f",
  given: "#1b3f9c",
  get: "#0f5a38",
  aux: "#4f436b",
};
const HALO = "#ffce63";
const order: Record<El["t"], number> = {
  tri: 0,
  circle: 1,
  arc: 2,
  seg: 3,
  tick: 4,
  sq: 4,
  ang: 4,
  dot: 5,
  txt: 6,
};

const unit = (from: Pt, to: Pt) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
};
const polar = (v: Pt, degrees: number, r: number): Pt => ({
  x: v.x + r * Math.cos((degrees * Math.PI) / 180),
  y: v.y - r * Math.sin((degrees * Math.PI) / 180),
});

/** The turn from ray va to ray vb: the short way, or the long way for a reflex angle. */
function turnBetween(el: Extract<El, { t: "ang" }>) {
  const start = bearing(el.v, el.a);
  let turn = ((bearing(el.v, el.b) - start + 540) % 360) - 180;
  if (el.reflex) turn = turn > 0 ? turn - 360 : turn + 360;
  return { start, turn };
}

function shape(el: El, tone: Exclude<Tone, "off">, halo: boolean) {
  const colour = halo ? HALO : stroke[tone];
  const line = {
    stroke: colour,
    strokeWidth: halo ? 11 : tone === "base" ? 2.6 : 3.4,
    strokeLinecap: "round" as const,
    fill: "none",
    opacity: halo ? 0.85 : 1,
  };
  switch (el.t) {
    case "circle":
      return (
        <circle
          cx={CENTRE.x}
          cy={CENTRE.y}
          r={el.r ?? RADIUS}
          {...line}
          strokeDasharray={!halo && tone === "aux" ? "7 6" : undefined}
        />
      );
    case "seg":
      return (
        <line
          x1={el.a.x}
          y1={el.a.y}
          x2={el.b.x}
          y2={el.b.y}
          {...line}
          strokeDasharray={
            !halo && (el.dash || tone === "aux") ? "7 6" : undefined
          }
        />
      );
    case "arc": {
      const r = el.r ?? RADIUS,
        a = on(el.from, r),
        b = on(el.to, r);
      return (
        <path
          d={`M ${a.x} ${a.y} A ${r} ${r} 0 ${el.to - el.from > 180 ? 1 : 0} 0 ${b.x} ${b.y}`}
          {...line}
          strokeWidth={halo ? 13 : tone === "base" ? 3.4 : 5}
        />
      );
    }
    case "ang": {
      const r = el.r ?? 26,
        { start, turn } = turnBetween(el);
      const a = polar(el.v, start, r),
        b = polar(el.v, start + turn, r);
      const flags = `${Math.abs(turn) > 180 ? 1 : 0} ${turn > 0 ? 0 : 1}`;
      const arc = `M ${a.x} ${a.y} A ${r} ${r} 0 ${flags} ${b.x} ${b.y}`;
      if (halo) return <path d={arc} {...line} strokeWidth={9} />;
      const inner = r - 5,
        a2 = polar(el.v, start, inner),
        b2 = polar(el.v, start + turn, inner);
      const label = polar(el.v, start + turn / 2, el.lr ?? r + 17);
      return (
        <>
          <path
            d={`M ${el.v.x} ${el.v.y} L ${a.x} ${a.y} A ${r} ${r} 0 ${flags} ${b.x} ${b.y} Z`}
            fill={colour}
            fillOpacity={0.18}
            stroke="none"
          />
          <path d={arc} {...line} strokeWidth={2.8} />
          {el.twice && (
            <path
              d={`M ${a2.x} ${a2.y} A ${inner} ${inner} 0 ${flags} ${b2.x} ${b2.y}`}
              {...line}
              strokeWidth={2}
            />
          )}
          {el.label && (
            <MathSvgText
              x={label.x}
              y={label.y + 6}
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              fill={ink[tone]}
              stroke="#fff"
              strokeWidth={4}
              style={{ paintOrder: "stroke" }}
            >
              {el.label}
            </MathSvgText>
          )}
        </>
      );
    }
    case "sq": {
      const u = unit(el.v, el.a),
        w = unit(el.v, el.b),
        k = 13;
      return (
        <path
          d={`M ${el.v.x + u.x * k} ${el.v.y + u.y * k} l ${w.x * k} ${w.y * k} l ${-u.x * k} ${-u.y * k}`}
          {...line}
          strokeWidth={halo ? 9 : 2.6}
          strokeLinejoin="round"
        />
      );
    }
    case "tick": {
      const u = unit(el.a, el.b),
        n = el.n ?? 1,
        m = { x: (el.a.x + el.b.x) / 2, y: (el.a.y + el.b.y) / 2 };
      return (
        <>
          {Array.from({ length: n }, (_, i) => {
            const shift = (i - (n - 1) / 2) * 7;
            const x = m.x + u.x * shift,
              y = m.y + u.y * shift;
            return (
              <line
                key={i}
                x1={x - u.y * 9}
                y1={y + u.x * 9}
                x2={x + u.y * 9}
                y2={y - u.x * 9}
                {...line}
                strokeWidth={halo ? 9 : 2.8}
              />
            );
          })}
        </>
      );
    }
    case "tri":
      return halo ? null : (
        <polygon
          points={el.pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={colour}
          fillOpacity={tone === "base" ? 0.1 : 0.2}
          stroke="none"
        />
      );
    case "dot":
      return halo ? (
        <circle cx={el.p.x} cy={el.p.y} r={11} fill={HALO} opacity={0.85} />
      ) : (
        <circle cx={el.p.x} cy={el.p.y} r={4.6} fill={ink[tone]} />
      );
    case "txt":
      return halo ? null : (
        <MathSvgText
          x={el.p.x + (el.dx ?? 0)}
          y={el.p.y + (el.dy ?? 0)}
          textAnchor="middle"
          fontSize={el.size ?? 21}
          fontWeight={tone === "base" ? 600 : 700}
          fill={ink[tone]}
          stroke="#fff"
          strokeWidth={4.5}
          style={{ paintOrder: "stroke" }}
        >
          {el.text}
        </MathSvgText>
      );
  }
}

export type Spot = { id: string; p: Pt; label: string };

/**
 * Draws a figure at the given tones. Parts in `focus` get a yellow halo, so a
 * student can see which part of the picture the current line talks about.
 */
export default function Figure({
  figure,
  tones,
  focus = [],
  turn = 0,
  spots,
  spotState = {},
  onSpot,
  small = false,
}: {
  figure: FigureModel;
  tones?: Tones;
  focus?: readonly string[];
  /** Degrees to rotate the turning group, anticlockwise. */
  turn?: number;
  spots?: Spot[];
  spotState?: Record<string, "right" | "wrong">;
  onSpot?: (id: string) => void;
  small?: boolean;
}) {
  const id = useId();
  const current = { ...figure.tones, ...tones };
  const lit = new Set(focus);
  const visible = figure.els
    .filter((el) => (current[el.id] ?? "off") !== "off")
    .sort((a, b) => order[a.t] - order[b.t]);
  const draw = (els: El[], halo: boolean) =>
    els
      .filter((el) => !halo || lit.has(el.id))
      .map((el) => (
        <g key={`${el.id}${halo ? "-halo" : ""}`} data-part={el.id}>
          {shape(el, current[el.id] as Exclude<Tone, "off">, halo)}
        </g>
      ));
  const fixed = visible.filter((el) => !el.turning),
    turning = visible.filter((el) => el.turning);
  const press = (event: KeyboardEvent<SVGGElement>, spot: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSpot?.(spot);
  };
  return (
    <svg
      className={small ? s.small : s.figure}
      viewBox={VIEW_BOX}
      role={spots ? "group" : "img"}
      aria-labelledby={`${id}-alt`}
    >
      <title id={`${id}-alt`}>{figure.alt}</title>
      {draw(fixed, true)}
      {draw(fixed, false)}
      {turning.length > 0 && (
        <g
          className={s.turning}
          style={{
            transform: `rotate(${-turn}deg)`,
            transformOrigin: `${CENTRE.x}px ${CENTRE.y}px`,
          }}
        >
          {draw(turning, true)}
          {draw(turning, false)}
        </g>
      )}
      {spots?.map((spot) => (
        <g
          key={spot.id}
          className={s.spot}
          role="button"
          tabIndex={0}
          aria-label={spot.label}
          data-state={spotState[spot.id]}
          data-spot={spot.id}
          onClick={() => onSpot?.(spot.id)}
          onKeyDown={(event) => press(event, spot.id)}
        >
          <circle cx={spot.p.x} cy={spot.p.y} r={25} />
          <text x={spot.p.x} y={spot.p.y + 7} textAnchor="middle">
            {spot.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
