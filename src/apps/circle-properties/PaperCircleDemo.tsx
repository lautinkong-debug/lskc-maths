"use client";

import { useRef } from "react";
import { circleLessonCopy } from "@/lib/copy";
import { CENTRE, RADIUS } from "./geometry";
import InkLayer from "./InkLayer";
import MathText from "./MathText";
import {
  foldStage,
  mirrorStage,
  PAPER_RADIUS,
  paperAction,
  paperLastStage,
  paperTask,
  wordProgress,
  type PaperChord,
  type PaperStep,
} from "./paperCircle";
import type { InkBoardController } from "./useInkBoard";
import { useTouchDrag } from "./useTouchDrag";
import s from "./paper-circle.module.css";

const c = circleLessonCopy.paper;
type P = { x: number; y: number };
const { x: cx, y: cy } = CENTRE;
const CM = RADIUS / PAPER_RADIUS;

const onCircle = (degrees: number, radius = RADIUS): P => ({
  x: cx + radius * Math.cos((degrees * Math.PI) / 180),
  y: cy + radius * Math.sin((degrees * Math.PI) / 180),
});
const midpoint = (a: P, b: P): P => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
const halfDisc = (side: "left" | "right") =>
  `M ${cx} ${cy - RADIUS} A ${RADIUS} ${RADIUS} 0 0 ${side === "left" ? 0 : 1} ${cx} ${cy + RADIUS} Z`;
/** The same three steps in both states, so a CSS transition can turn the paper over. */
const flip = (flipped: boolean) => ({
  transform: `translateX(${cx}px) scaleX(${flipped ? -1 : 1}) translateX(${-cx}px)`,
});

/** The chord in its own upright frame, and the way to place upright words beside it. */
function layout(chord: PaperChord) {
  const distance = chord.distance * CM,
    half = chord.half * CM;
  const turn = (chord.tilt * Math.PI) / 180;
  const N = { x: cx, y: cy + distance };
  return {
    O: CENTRE,
    N,
    A: { x: cx - half, y: N.y },
    B: { x: cx + half, y: N.y },
    world: ({ x, y }: P): P => ({
      x: cx + (x - cx) * Math.cos(turn) - (y - cy) * Math.sin(turn),
      y: cy + (x - cx) * Math.sin(turn) + (y - cy) * Math.cos(turn),
    }),
  };
}

function Label({
  at,
  children,
  className = s.label,
}: {
  at: P;
  children: string;
  className?: string;
}) {
  return (
    <text
      className={className}
      x={at.x}
      y={at.y}
      textAnchor="middle"
      dominantBaseline="central"
    >
      <MathText svg notation>
        {children}
      </MathText>
    </text>
  );
}

function Segment({
  from,
  to,
  className,
}: {
  from: P;
  to: P;
  className: string;
}) {
  return (
    <line
      className={className}
      pathLength={1}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
    />
  );
}

function Tick({ from, to }: { from: P; to: P }) {
  const middle = midpoint(from, to);
  return (
    <line
      className={s.tick}
      x1={middle.x}
      y1={middle.y - 9}
      x2={middle.x}
      y2={middle.y + 9}
    />
  );
}

/** Words on a chord that may lean: the end labels sit just outside the circle. */
function endLabels(place: ReturnType<typeof layout>) {
  const outside = (point: P) => {
    const world = place.world(point);
    const length = Math.hypot(world.x - cx, world.y - cy);
    return {
      x: cx + ((world.x - cx) * (RADIUS + 18)) / length,
      y: cy + ((world.y - cy) * (RADIUS + 18)) / length,
    };
  };
  return (
    <>
      <Label at={outside(place.A)}>A</Label>
      <Label at={outside(place.B)}>B</Label>
    </>
  );
}

function WordsScene({ stage }: { stage: number }) {
  const { tags, words, link } = wordProgress(stage);
  const radiusEnd = onCircle(38);
  const chordEnds = [onCircle(196), onCircle(292)];
  const diameterEnds = [onCircle(160), onCircle(340)];
  const named = (index: number) =>
    `(${index + 1})${words > index ? ` ${c.words.tags[index].word}` : ""}`;
  return (
    <>
      <circle className={s.paper} cx={cx} cy={cy} r={RADIUS} />
      {tags >= 3 && (
        <Segment
          from={chordEnds[0]}
          to={chordEnds[1]}
          className={`${s.draw} ${s.chordPart}`}
        />
      )}
      {tags >= 4 && (
        <Segment
          from={diameterEnds[0]}
          to={diameterEnds[1]}
          className={`${s.draw} ${s.diameterPart}`}
        />
      )}
      {tags >= 2 && !link && (
        <Segment
          from={CENTRE}
          to={radiusEnd}
          className={`${s.draw} ${s.radiusPart}`}
        />
      )}
      {link && (
        <>
          <Segment
            from={CENTRE}
            to={diameterEnds[0]}
            className={`${s.draw} ${s.radiusPart}`}
          />
          <Segment
            from={CENTRE}
            to={diameterEnds[1]}
            className={`${s.draw} ${s.radiusPart}`}
          />
          <Label at={{ x: cx - 84, y: cy + 56 }} className={s.radiusWord}>
            radius
          </Label>
          <Label at={{ x: cx + 84, y: cy - 56 }} className={s.radiusWord}>
            radius
          </Label>
        </>
      )}
      <circle className={s.point} cx={cx} cy={cy} r={tags >= 1 ? 6 : 4} />
      {tags === 1 && (
        <circle className={s.pulse} cx={cx} cy={cy} r={16} aria-hidden="true" />
      )}
      {tags >= 1 && (
        <Label at={{ x: cx + 8, y: cy + 26 }} className={s.tag}>
          {named(0)}
        </Label>
      )}
      {tags >= 2 && !link && (
        <Label at={{ x: cx + 96, y: cy + 88 }} className={s.tag}>
          {named(1)}
        </Label>
      )}
      {tags >= 3 && (
        <Label at={{ x: cx - 18, y: cy - 124 }} className={s.tag}>
          {named(2)}
        </Label>
      )}
      {tags >= 4 && !link && (
        <Label at={{ x: cx - 92, y: cy - 8 }} className={s.tag}>
          {named(3)}
        </Label>
      )}
    </>
  );
}

function FoldScene({ stage, chord }: { stage: number; chord: PaperChord }) {
  const place = layout(chord);
  const { O, N, A, B, world } = place;
  const folded = stage === foldStage.folded;
  const opened = stage >= foldStage.opened;
  const halves = stage >= foldStage.halves;
  const below = 26;
  return (
    <>
      <g transform={`rotate(${chord.tilt} ${cx} ${cy})`}>
        {folded && <circle className={s.outline} cx={cx} cy={cy} r={RADIUS} />}
        <path className={s.paperHalf} d={halfDisc("right")} />
        <line className={s.chord} x1={N.x} y1={N.y} x2={B.x} y2={B.y} />
        <circle className={s.end} cx={B.x} cy={B.y} r={6} />
        <g className={s.flap} data-flipped={folded} style={flip(folded)}>
          <path className={s.paperHalf} d={halfDisc("left")} />
          <line className={s.chord} x1={A.x} y1={A.y} x2={N.x} y2={N.y} />
          <circle className={s.end} cx={A.x} cy={A.y} r={6} />
        </g>
        {opened && (
          <line
            className={
              stage === foldStage.throughCentre ? s.creaseHot : s.crease
            }
            x1={cx}
            y1={cy - RADIUS}
            x2={cx}
            y2={cy + RADIUS}
          />
        )}
        {stage >= foldStage.rightAngle && (
          <path
            className={s.square}
            d={`M ${cx + 18} ${N.y} v -18 h -18`}
            data-paper-square
          />
        )}
        {halves && (
          <>
            <Tick from={A} to={N} />
            <Tick from={N} to={B} />
            <Segment
              from={{ x: A.x, y: N.y + 12 }}
              to={{ x: N.x - 3, y: N.y + 12 }}
              className={`${s.draw} ${s.ruler}`}
            />
            <Segment
              from={{ x: N.x + 3, y: N.y + 12 }}
              to={{ x: B.x, y: N.y + 12 }}
              className={`${s.draw} ${s.ruler}`}
            />
          </>
        )}
        {stage >= foldStage.pythagoras && (
          <>
            <path
              className={s.triangle}
              d={`M ${O.x} ${O.y} L ${A.x} ${A.y} L ${N.x} ${N.y} Z`}
            />
            <Segment from={O} to={N} className={`${s.draw} ${s.height}`} />
            <Segment from={O} to={A} className={`${s.draw} ${s.ruler}`} />
          </>
        )}
        <circle className={s.point} cx={O.x} cy={O.y} r={5} />
        {stage === foldStage.throughCentre && (
          <circle
            className={s.pulse}
            cx={O.x}
            cy={O.y}
            r={16}
            aria-hidden="true"
          />
        )}
      </g>
      <Label at={world({ x: cx + 18, y: cy - 16 })}>O</Label>
      {!folded && endLabels(place)}
      {folded && (
        <Label at={world({ x: B.x - 24, y: B.y - 34 })} className={s.landed}>
          {c.fold.lands}
        </Label>
      )}
      {opened && <Label at={world({ x: cx - 18, y: N.y - 18 })}>N</Label>}
      {halves && (
        <>
          <Label
            at={world({ x: (A.x + N.x) / 2, y: N.y + below + 6 })}
            className={s.measure}
          >
            {`${chord.half} cm`}
          </Label>
          <Label
            at={world({ x: (N.x + B.x) / 2, y: N.y + below + 6 })}
            className={s.measure}
          >
            {`${chord.half} cm`}
          </Label>
        </>
      )}
      {stage >= foldStage.rightAngle && (
        <Label at={world({ x: cx + 44, y: N.y - 28 })} className={s.measure}>
          90°
        </Label>
      )}
      {stage >= foldStage.pythagoras && (
        <>
          <Label
            at={world({ x: cx + 36, y: (O.y + N.y) / 2 })}
            className={s.measure}
          >
            {`${chord.distance} cm`}
          </Label>
          <Label
            at={world({
              x: (O.x + A.x) / 2 - 22,
              y: (O.y + A.y) / 2 - 16,
            })}
            className={s.measure}
          >
            {`${PAPER_RADIUS} cm`}
          </Label>
        </>
      )}
    </>
  );
}

function MirrorScene({ stage, chord }: { stage: number; chord: PaperChord }) {
  const place = layout(chord);
  const { O, N, A, B, world } = place;
  const m = mirrorStage;
  const on = (...stages: number[]) => stages.includes(stage);
  const hot = (active: boolean, quiet: string) =>
    active ? `${quiet} ${s.hot}` : quiet;
  const triangle = (end: P) =>
    `M ${O.x} ${O.y} L ${end.x} ${end.y} L ${N.x} ${N.y} Z`;
  return (
    <>
      <g transform={`rotate(${chord.tilt} ${cx} ${cy})`}>
        <circle className={s.paper} cx={cx} cy={cy} r={RADIUS} />
        <path
          className={hot(on(m.congruent, m.congruentReason), s.blueTriangle)}
          d={triangle(A)}
        />
        <path
          className={hot(on(m.congruent, m.congruentReason), s.orangeTriangle)}
          d={triangle(B)}
        />
        {stage < m.rightAngles && (
          <g
            className={s.flap}
            data-flipped={stage === m.flipped}
            style={flip(stage === m.flipped)}
          >
            <path className={s.blueCopy} d={triangle(A)} />
          </g>
        )}
        <line
          className={s.mirror}
          x1={cx}
          y1={cy - RADIUS - 14}
          x2={cx}
          y2={cy + RADIUS + 14}
        />
        <line
          className={hot(on(m.halves, m.halvesValue), s.chord)}
          x1={A.x}
          y1={A.y}
          x2={B.x}
          y2={B.y}
        />
        <line
          className={hot(on(m.radii, m.radiiReason), s.side)}
          x1={O.x}
          y1={O.y}
          x2={A.x}
          y2={A.y}
        />
        <line
          className={hot(on(m.radii, m.radiiReason), s.side)}
          x1={O.x}
          y1={O.y}
          x2={B.x}
          y2={B.y}
        />
        <line
          className={hot(on(m.common), s.sideRed)}
          x1={O.x}
          y1={O.y}
          x2={N.x}
          y2={N.y}
        />
        {stage >= m.rightAngles && (
          <>
            <path
              className={hot(on(m.rightAngles), s.square)}
              d={`M ${cx + 18} ${N.y} v -18 h -18`}
              data-paper-square
            />
            <path
              className={hot(on(m.rightAngles), s.square)}
              d={`M ${cx - 18} ${N.y} v -18 h 18`}
              data-paper-square
            />
          </>
        )}
        {stage >= m.halvesValue && (
          <>
            <Tick from={A} to={N} />
            <Tick from={N} to={B} />
          </>
        )}
        <circle className={s.point} cx={O.x} cy={O.y} r={5} />
      </g>
      <Label at={world({ x: cx + 18, y: cy - 16 })}>O</Label>
      {endLabels(place)}
      <Label at={world({ x: cx - 20, y: N.y + 20 })}>N</Label>
      <Label
        at={world({ x: cx + 60, y: cy - RADIUS - 4 })}
        className={s.mirrorWord}
      >
        {c.mirror.line}
      </Label>
    </>
  );
}

/**
 * The worksheet's paper circle, moved on one stage per press so the teacher can ask
 * before showing. It shares the circle's coordinates, so the pen draws on it as usual.
 */
export default function PaperCircleDemo({
  step,
  stage,
  chord,
  ink,
  onAdvance,
  onRestart,
  onAnotherChord,
}: {
  step: PaperStep;
  stage: number;
  chord: PaperChord;
  ink: InkBoardController;
  onAdvance: () => void;
  onRestart: () => void;
  onAnotherChord: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  useTouchDrag(svgRef, "[data-ink-capture]");
  return (
    <div className={s.demo}>
      <svg
        ref={svgRef}
        className={s.scene}
        viewBox="80 20 400 400"
        role="img"
        aria-label={`${c.label}: ${paperTask(step, stage)}`}
        data-testid="paper-circle"
        data-stage={stage}
      >
        {step === 0 && <WordsScene stage={stage} />}
        {step === 1 && <FoldScene stage={stage} chord={chord} />}
        {step === 2 && <MirrorScene stage={stage} chord={chord} />}
        <InkLayer board={ink} svgRef={svgRef} />
      </svg>
      <div className={s.controls} role="group" aria-label={c.controls}>
        <button type="button" className={s.next} onClick={onAdvance}>
          {paperAction(step, stage)}
        </button>
        {stage > 0 && (
          <button type="button" onClick={onRestart}>
            {c.again}
          </button>
        )}
        {step > 0 && stage === paperLastStage[step] && (
          <button type="button" onClick={onAnotherChord}>
            {c.another}
          </button>
        )}
      </div>
    </div>
  );
}
