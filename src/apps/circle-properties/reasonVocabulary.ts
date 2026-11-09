import type { FlowMark, FlowPoint, ReasonFlowModel } from "./reasonFlow";
import { FLOW_CENTRE, FLOW_RADIUS } from "./reasonExploration";

const point = (id: string, at: FlowPoint): FlowMark => ({
  id,
  kind: "dot",
  stage: "base",
  at,
});
const line = (id: string, a: FlowPoint, b: FlowPoint): FlowMark => ({
  id,
  kind: "line",
  stage: "base",
  a,
  b,
});
const label = (id: string, at: FlowPoint, text: string): FlowMark => ({
  id,
  kind: "text",
  stage: "base",
  at,
  text,
});
const circle = (id: string, at: FlowPoint, radius: number): FlowMark => ({
  id,
  kind: "circle",
  stage: "base",
  at,
  radius,
});

/** Use distinct letters in the definition so it cannot identify the unknown diameter in 16.9. */
function diameterExample(): FlowMark[] {
  const K = FLOW_CENTRE;
  const E = { x: K.x - 100, y: K.y + 75 };
  const F = { x: K.x + 100, y: K.y - 75 };
  return [
    circle("example-circle", K, 125),
    line("example-diameter-EF", E, F),
    point("example-point-K", K),
    point("example-point-E", E),
    point("example-point-F", F),
    label("example-label-K", { x: K.x + 12, y: K.y + 22 }, "K"),
    label("example-label-E", { x: E.x - 15, y: E.y + 15 }, "E"),
    label("example-label-F", { x: F.x + 15, y: F.y - 7 }, "F"),
  ];
}

function equalCircleExample(): FlowMark[] {
  const radius = 70;
  return [105, 315].flatMap((x, i) => {
    const n = i + 1;
    const centre = { x, y: 180 };
    const end = { x: x + (i ? -radius : radius), y: centre.y };
    return [
      circle(`example-rim-${n}`, centre, radius),
      line(`example-radius-${n}`, centre, end),
      point(`example-point-${n}`, centre),
      label(
        `example-length-${n}`,
        { x: (x + end.x) / 2, y: end.y - 12 },
        "4 cm",
      ),
    ];
  });
}

const tau = 2 * Math.PI;
const direction = (origin: FlowPoint, p: FlowPoint) =>
  Math.atan2(p.y - origin.y, p.x - origin.x);
const positiveTurn = (radians: number) => ((radians % tau) + tau) % tau;

/** Choose the arc by its endpoints and the side where the named vertex actually lies. */
function arcOnSide(
  id: string,
  a: FlowPoint,
  b: FlowPoint,
  vertex: FlowPoint,
  includeVertex: boolean,
): FlowMark {
  const from = direction(FLOW_CENTRE, a);
  const clockwise = positiveTurn(direction(FLOW_CENTRE, b) - from);
  const contains =
    positiveTurn(direction(FLOW_CENTRE, vertex) - from) < clockwise;
  const forward = contains === includeVertex;
  const sweep = forward ? clockwise : tau - clockwise;
  return {
    id,
    kind: "path",
    stage: "base",
    d: `M ${a.x} ${a.y} A ${FLOW_RADIUS} ${FLOW_RADIUS} 0 ${sweep > Math.PI ? 1 : 0} ${forward ? 1 : 0} ${b.x} ${b.y}`,
  };
}

function cornerAtC(a: FlowPoint, c: FlowPoint, b: FlowPoint): FlowMark {
  const from = direction(c, a),
    to = direction(c, b);
  const radius = Math.min(
    25,
    Math.hypot(a.x - c.x, a.y - c.y) / 2,
    Math.hypot(b.x - c.x, b.y - c.y) / 2,
  );
  const ends = [from, to].map(
    (t) => `${c.x + radius * Math.cos(t)} ${c.y + radius * Math.sin(t)}`,
  );
  return {
    id: "turn-at-C",
    kind: "path",
    stage: "base",
    vertex: c,
    d: `M ${ends[0]} A ${radius} ${radius} 0 0 ${positiveTurn(to - from) < Math.PI ? 1 : 0} ${ends[1]}`,
  };
}

/** A word can identify one curved path or one turn before its equality or size is proved. */
export function vocabularyView(
  model: ReasonFlowModel,
  focusIds: readonly string[],
) {
  const selected = new Set(focusIds);
  if (selected.has("example-diameter-EF"))
    return { marks: diameterExample(), selected };
  if (selected.has("example-rim-1"))
    return { marks: equalCircleExample(), selected };
  const marks: FlowMark[] = [];
  for (const mark of model.marks) {
    // Greek values belong to the investigation. Words asks for a geometric feature.
    if (mark.id.endsWith("-value") && !selected.has(mark.id)) continue;
    if (mark.stage !== "result") marks.push(mark);
    else if (selected.has(mark.id) && mark.kind === "path") {
      // Never lift conclusion labels (2θ), equal ticks, or the centre into Words.
      marks.push({ ...mark, stage: "base" });
    }
  }
  const { A, B, C, P, N } = model.points;
  if (selected.has("half-AN")) marks.push(line("half-AN", A, N));
  if (selected.has("half-NB")) marks.push(line("half-NB", N, B));
  if (selected.has("same-segment-boundary"))
    marks.push(arcOnSide("same-segment-boundary", A, B, P, true));
  if (selected.has("semicircular-arc"))
    marks.push(arcOnSide("semicircular-arc", A, B, C, false));
  if (selected.has("turn-at-C")) marks.push(cornerAtC(A, C, B));
  return { marks, selected };
}
