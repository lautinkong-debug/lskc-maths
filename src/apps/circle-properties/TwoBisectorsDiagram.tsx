"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { circleBisectorsDiagramCopy as c } from "@/lib/circleBisectorsDiagramCopy";
import { placeDiagramLabel, type LayoutBox } from "./diagramLayout";
import { clamp, distance, type Point } from "./geometry";
import InkLayer from "./InkLayer";
import MathText, { MathSvgText } from "./MathText";
import {
  FLOW_CENTRE as O,
  FLOW_RADIUS,
  type ReasonParameters,
} from "./reasonExploration";
import {
  chordConstruction,
  distinctlyTurned,
  moveMidpoint,
  shift,
  startingChords,
  turnChord,
  turnLimits,
  type ChordId,
  type ChordPair,
} from "./twoBisectors";
import type { InkBoardController } from "./useInkBoard";
import { useTouchDrag } from "./useTouchDrag";
import s from "./two-bisectors.module.css";

const ids: readonly ChordId[] = ["AB", "CD"];
const midpoint = { AB: "N", CD: "M" } as const;
const radial = (point: Point) => {
  const d = distance(point, O);
  return { x: (point.x - O.x) / d, y: (point.y - O.y) / d };
};
const segment = (a: Point, b: Point) => ({
  x1: a.x,
  y1: a.y,
  x2: b.x,
  y2: b.y,
});

type Props = {
  first: ReasonParameters;
  other?: ReasonParameters;
  reveal: boolean;
  ink?: InkBoardController;
  onMove?: (first: ReasonParameters, second: ReasonParameters) => void;
};

export default function TwoBisectorsDiagram({
  first,
  other,
  reveal,
  ink,
  onMove,
}: Props) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ chord: ChordId; pointerId: number } | null>(null);
  const [pair, setPair] = useState(() => startingChords(first, other));
  const [trace, setTrace] = useState(0);
  function change(next: ChordPair) {
    setTrace(0);
    setPair(next);
    onMove?.(next.AB, next.CD);
  }
  useTouchDrag(svgRef, "[data-midpoint]");
  const chords = {
    AB: chordConstruction(pair.AB),
    CD: chordConstruction(pair.CD),
  };
  const points: Record<string, Point> = {};
  const positions: Record<string, Point> = {};
  const occupied: LayoutBox[] = [];
  for (const key of ids) {
    const { a, b, mid, corner } = chords[key];
    points[key[0]] = a;
    points[key[1]] = b;
    points[midpoint[key]] = mid;
    for (const point of [a, b, mid, corner]) {
      const size = point === mid ? 24 : 9;
      occupied.push({ ...point, width: size, height: size });
    }
  }
  if (reveal) occupied.push({ ...O, width: 30, height: 30 });
  function label(name: string, preferred: Point) {
    const box = placeDiagramLabel(
      { ...preferred, width: 18, height: 23 },
      occupied,
      { left: 12, right: 408, top: 8, bottom: 352 },
    );
    occupied.push(box);
    positions[name] = box;
  }
  for (const key of ids) {
    const ch = chords[key];
    label(key[0], shift(ch.a, radial(ch.a), 17));
    label(key[1], shift(ch.b, radial(ch.b), 17));
    label(midpoint[key], {
      x: 2 * ch.mid.x - ch.corner.x,
      y: 2 * ch.mid.y - ch.corner.y,
    });
  }
  let badge: LayoutBox | undefined;
  if (reveal) {
    // Keep the result badge clear of the diagram lines as well as the point names.
    for (const key of ids) {
      const ch = chords[key];
      for (const [start, end] of [[ch.a, ch.b], ch.line]) {
        for (let t = 0; t <= 1; t += 1 / 32) {
          occupied.push({
            x: start.x + t * (end.x - start.x),
            y: start.y + t * (end.y - start.y),
            width: 6,
            height: 6,
          });
        }
      }
    }
    for (let degrees = 0; degrees < 360; degrees += 6) {
      const a = (degrees * Math.PI) / 180;
      occupied.push({
        x: O.x + FLOW_RADIUS * Math.cos(a),
        y: O.y + FLOW_RADIUS * Math.sin(a),
        width: 8,
        height: 8,
      });
    }
    const a = chords.AB.normal,
      b = chords.CD.normal;
    const sign = a.x * b.x + a.y * b.y > 0 ? -1 : 1;
    const gap = { x: a.x + sign * b.x, y: a.y + sign * b.y };
    const space = shift(O, gap, 70 / Math.hypot(gap.x, gap.y));
    badge = placeDiagramLabel(
      { ...space, width: 98, height: 32 },
      occupied,
      { left: 4, right: 416, top: 5, bottom: 355 },
      [{ x: 2 * O.x - space.x, y: 2 * O.y - space.y }],
    );
  }

  function move(event: PointerEvent<SVGSVGElement>) {
    const active = drag.current,
      matrix = svgRef.current?.getScreenCTM();
    if (!active || active.pointerId !== event.pointerId || !matrix) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    change(moveMidpoint(pair, active.chord, p));
  }
  function stop(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboard(event: KeyboardEvent<SVGGElement>, key: ChordId) {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const direction = event.key;
    const chord = pair[key];
    if (direction === "ArrowLeft" || direction === "ArrowRight") {
      return change(
        turnChord(
          pair,
          key,
          (chord.rotation ?? 0) + (direction === "ArrowLeft" ? -step : step),
        ),
      );
    }
    const offset = clamp(
      Math.abs(chord.primary) + (direction === "ArrowUp" ? -0.25 : 0.25) * step,
      0.5,
      9.2,
    );
    change({
      ...pair,
      [key]: { ...chord, primary: Math.sign(chord.primary) * offset },
    });
  }
  return (
    <div
      className={s.construction}
      data-testid="two-bisectors"
      data-revealed={reveal}
    >
      <ul className={s.legend}>
        {ids.map((key) => (
          <li className={key === "AB" ? s.first : s.second} key={key}>
            <span
              aria-hidden="true"
              className={key === "AB" ? s.solidKey : s.dashedKey}
            />
            <span>
              <MathText>{c.bisectorOf(key)}</MathText>
            </span>
          </li>
        ))}
      </ul>
      <svg
        ref={svgRef}
        className={s.diagram}
        viewBox="0 0 420 360"
        role="group"
        aria-labelledby={id + "-title"}
        aria-describedby={id + "-description"}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      >
        <title id={id + "-title"}>{c.title}</title>
        <desc id={id + "-description"}>
          {c.given} {reveal && c.result} {c.keys}
        </desc>
        <circle
          cx={O.x}
          cy={O.y}
          r={FLOW_RADIUS}
          fill="none"
          stroke="#65788e"
          strokeWidth="2"
        />
        {ids.map((key) => (
          <line
            key={key}
            data-chord={key}
            {...segment(chords[key].a, chords[key].b)}
            className={s.chord}
          />
        ))}
        {ids.map((key) => {
          const ch = chords[key],
            name = midpoint[key];
          return (
            <g key={key} className={key === "AB" ? s.first : s.second}>
              <line
                data-bisector={key}
                {...segment(ch.line[0], ch.line[1])}
                className={s.bisector}
                pathLength={100}
                strokeDasharray={key === "CD" ? "6 4" : undefined}
                strokeDashoffset={key === "CD" ? 3 : undefined}
              />
              {[-0.5, 0.5].map((side) => (
                <g key={side} data-equal-half={key}>
                  {(key === "AB" ? [0] : [-3, 3]).map((gap) => {
                    const tick = shift(ch.mid, ch.along, ch.half * side + gap);
                    return (
                      <line
                        key={gap}
                        {...segment(
                          shift(tick, ch.normal, -5),
                          shift(tick, ch.normal, 5),
                        )}
                        className={s.tick}
                      />
                    );
                  })}
                </g>
              ))}
              <polyline points={ch.square} className={s.halo} />
              <polyline
                data-right-angle={name}
                points={ch.square}
                className={s.square}
              />
            </g>
          );
        })}
        {badge && trace > 0 && (
          <g key={trace} className={s.trace} aria-hidden="true">
            {ids.map((key) => (
              <g
                key={key}
                className={key === "AB" ? s.traceFirst : s.traceSecond}
                style={
                  {
                    "--from-x": chords[key].mid.x - O.x + "px",
                    "--from-y": chords[key].mid.y - O.y + "px",
                  } as CSSProperties
                }
              >
                <line
                  {...segment(chords[key].mid, O)}
                  pathLength={1}
                  data-trace={key}
                />
                <circle cx={O.x} cy={O.y} r={5.5} className={s.traveller} />
              </g>
            ))}
            <circle cx={O.x} cy={O.y} r={16} className={s.traceFinish} />
          </g>
        )}
        {Object.entries(points).map(([name, p]) => (
          <g key={name} data-point={name} className={s.point}>
            <circle cx={p.x} cy={p.y} r={2.8} />
            <MathSvgText
              x={positions[name].x}
              y={positions[name].y}
              textAnchor="middle"
              dominantBaseline="central"
              className={s.letter}
            >
              {name}
            </MathSvgText>
          </g>
        ))}
        {badge && (
          <g className={s.answer} data-point="O">
            <line {...segment(O, badge)} className={s.leader} />
            <circle cx={O.x} cy={O.y} r={11} className={s.haloOutline} />
            <circle cx={O.x} cy={O.y} r={11} className={s.centreHalo} />
            <circle cx={O.x} cy={O.y} r={4} className={s.centreDot} />
            <rect
              x={badge.x - badge.width / 2}
              y={badge.y - badge.height / 2}
              width={badge.width}
              height={badge.height}
              rx={8}
              className={s.badge}
            />
            <MathSvgText
              x={badge.x}
              y={badge.y}
              dominantBaseline="central"
              textAnchor="middle"
              className={s.badgeText}
            >
              {c.centreLabel}
            </MathSvgText>
          </g>
        )}
        {ids.map((key) => {
          const p = chords[key].mid;
          return (
            <g
              key={key}
              role="button"
              tabIndex={0}
              aria-label={c.handle(midpoint[key])}
              aria-describedby={id + "-description"}
              aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
              data-midpoint={midpoint[key]}
              className={s.handle}
              onKeyDown={(event) => keyboard(event, key)}
              onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0 || drag.current)
                  return;
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
                drag.current = { chord: key, pointerId: event.pointerId };
                svgRef.current?.setPointerCapture(event.pointerId);
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={24}
                fill="transparent"
                className={s.hit}
              />
              <circle cx={p.x} cy={p.y} r={8} className={s.ring} />
            </g>
          );
        })}
        {ink && <InkLayer board={ink} svgRef={svgRef} />}
      </svg>
      {reveal && (
        <div className={s.replay}>
          <button type="button" onClick={() => setTrace((n) => n + 1)}>
            {c.traceAction}
          </button>
          {trace > 0 && (
            <p role="status">
              <MathText>{c.traceSummary}</MathText>
            </p>
          )}
        </div>
      )}
      <p className={s.hint}>
        {other && !distinctlyTurned(first, other) && (
          <>
            <MathText>{c.savedTurn}</MathText>{" "}
          </>
        )}
        <MathText>{c.move}</MathText>
      </p>
      <div className={s.sliders}>
        {ids.map((key) => {
          const { min, max } = turnLimits(pair, key);
          return (
            <label key={key} className={key === "AB" ? s.first : s.second}>
              <span>
                <MathText>{c.rotate(key)}</MathText>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step="any"
                value={pair[key].rotation ?? 0}
                onChange={(e) => {
                  const angle = e.currentTarget.valueAsNumber;
                  change(turnChord(pair, key, angle));
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
