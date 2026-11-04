import type { ChordSketchData } from "./chordLessonData";
import MathText from "./MathText";
import s from "./chord-sketch.module.css";

type P = { x: number; y: number };

const centre: P = { x: 75, y: 58 },
  R = 46;
const at = (p: P, v: P, distance: number): P => ({
  x: p.x + distance * v.x,
  y: p.y + distance * v.y,
});
const towards = (from: P, to: P): P => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
};
const between = (a: P, b: P): P =>
  towards(
    { x: 0, y: 0 },
    {
      x: a.x + b.x,
      y: a.y + b.y,
    },
  );
const point = (p: P) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

/** A spot beside the middle of a radius, on the side away from the chord's foot. */
function besideRadius(end: P, foot: P): P {
  const direction = towards(centre, end);
  const middle = at(centre, direction, R / 2);
  const side = { x: -direction.y, y: direction.x };
  const facesFoot =
    side.x * (foot.x - middle.x) + side.y * (foot.y - middle.y) > 0;
  return at(middle, side, facesFoot ? -9 : 9);
}

/** A small arc at a vertex from one direction to another, turning anticlockwise on screen. */
function AngleArc({
  vertex,
  from,
  to,
  radius,
  className,
}: {
  vertex: P;
  from: P;
  to: P;
  radius: number;
  className: string;
}) {
  return (
    <path
      className={className}
      d={`M ${point(at(vertex, from, radius))} A ${radius} ${radius} 0 0 0 ${point(at(vertex, to, radius))}`}
    />
  );
}

function Label({
  p,
  children,
  className,
}: {
  p: P;
  children: string;
  className?: string;
}) {
  return (
    <text
      className={className}
      x={p.x}
      y={p.y}
      textAnchor="middle"
      dominantBaseline="central"
    >
      <MathText svg notation>
        {children}
      </MathText>
    </text>
  );
}

/**
 * The question's diagram, drawn from what is GIVEN: a right-angle mark for 16.1
 * and equal-length ticks for 16.2. The result is never marked, so the picture
 * helps a student read the question without giving the choice away.
 */
export default function ChordSketch({
  sketch,
  label,
}: {
  sketch: ChordSketchData;
  label: string;
}) {
  const turn = (sketch.tilt * Math.PI) / 180;
  const along: P = { x: Math.cos(turn), y: Math.sin(turn) };
  // Points away from the centre, whichever way the chord leans.
  const away: P = { x: -along.y, y: along.x };
  const distance = (sketch.depth ?? 0.48) * R;
  const half = Math.sqrt(R * R - distance * distance);
  const foot = at(centre, away, distance);
  const ends = [at(foot, along, -half), at(foot, along, half)];
  const halves = [at(foot, along, -half / 2), at(foot, along, half / 2)];
  const back: P = { x: -along.x, y: -along.y };
  const up: P = { x: -away.x, y: -away.y };
  const spoke = sketch.radius ? ends[sketch.radius.to] : undefined;
  const toCentre = towards(ends[0], centre);
  const toEnd = towards(centre, ends[0]);
  const toFoot = towards(centre, foot);

  return (
    <svg
      className={s.sketch}
      viewBox="0 0 150 132"
      role="img"
      aria-label={label}
      data-chord-sketch={sketch.given}
    >
      <circle className={s.circle} cx={centre.x} cy={centre.y} r={R} />
      <line
        className={s.chord}
        x1={ends[0].x}
        y1={ends[0].y}
        x2={ends[1].x}
        y2={ends[1].y}
      />
      <line
        className={s.fromCentre}
        x1={centre.x}
        y1={centre.y}
        x2={foot.x}
        y2={foot.y}
      />
      {spoke && (
        <line
          className={s.radius}
          x1={centre.x}
          y1={centre.y}
          x2={spoke.x}
          y2={spoke.y}
        />
      )}
      {sketch.given === "perpendicular" ? (
        <path
          className={s.given}
          data-given-mark="right-angle"
          d={`M ${point(at(foot, along, 7))} L ${point(at(at(foot, along, 7), up, 7))} L ${point(at(foot, up, 7))}`}
        />
      ) : (
        halves.map((middle, index) => (
          <line
            key={index}
            className={s.given}
            data-given-mark="equal-tick"
            x1={at(middle, away, -4.5).x}
            y1={at(middle, away, -4.5).y}
            x2={at(middle, away, 4.5).x}
            y2={at(middle, away, 4.5).y}
          />
        ))
      )}
      {sketch.angle && (
        <>
          <AngleArc
            className={s.givenArc}
            vertex={ends[0]}
            from={along}
            to={toCentre}
            radius={11}
          />
          <Label
            className={s.givenText}
            p={at(ends[0], between(along, toCentre), 19)}
          >
            {sketch.angle}
          </Label>
        </>
      )}
      {sketch.ask === "footAngle" && (
        <AngleArc
          className={s.askArc}
          vertex={foot}
          from={up}
          to={back}
          radius={11}
        />
      )}
      {sketch.ask === "centreAngle" && (
        <AngleArc
          className={s.askArc}
          vertex={centre}
          from={toEnd}
          to={toFoot}
          radius={9}
        />
      )}

      <circle className={s.dot} cx={centre.x} cy={centre.y} r={1.9} />
      <Label p={at(centre, up, 9)}>O</Label>
      {ends.map((end, index) => (
        <Label key={index} p={at(centre, towards(centre, end), R + 9)}>
          {sketch.ends[index]}
        </Label>
      ))}
      <Label p={at(foot, away, 11)}>{sketch.foot}</Label>
      {sketch.halfLabels?.map(
        (text, index) =>
          text && (
            <Label
              key={index}
              className={s.givenText}
              p={at(halves[index], away, 10)}
            >
              {text}
            </Label>
          ),
      )}
      {sketch.radius?.label && spoke && (
        <Label className={s.givenText} p={besideRadius(spoke, foot)}>
          {sketch.radius.label}
        </Label>
      )}
      {sketch.caption && (
        <Label className={s.givenText} p={{ x: centre.x, y: 124 }}>
          {sketch.caption}
        </Label>
      )}

      {sketch.ask === "half" && (
        <Label className={s.ask} p={at(halves[0], away, 10)}>
          ?
        </Label>
      )}
      {sketch.ask === "distance" && (
        <Label
          className={s.ask}
          // Beside the line from O, on the side the radius does not use.
          p={at(
            at(centre, away, distance / 2),
            sketch.radius?.to === 0 ? along : back,
            8,
          )}
        >
          ?
        </Label>
      )}
      {sketch.ask === "footAngle" && (
        <Label className={s.ask} p={at(foot, between(up, back), 19)}>
          ?
        </Label>
      )}
      {sketch.ask === "centreAngle" && (
        <Label className={s.ask} p={at(centre, between(toFoot, toEnd), 13)}>
          ?
        </Label>
      )}
    </svg>
  );
}
