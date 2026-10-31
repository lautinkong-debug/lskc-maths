import type { LabId } from "./content";
import {
  CENTRE,
  RADIUS,
  UNIT,
  angleAt,
  circlePoint,
  clamp,
  distance,
  getScene,
  type Parameters,
  type Point,
  type Scene,
  type ScenePoint,
  type Tone,
} from "./geometry";

export const rightAngleSize = 24;
const bearing = (from: Point, to: Point) =>
  Math.atan2(to.y - from.y, to.x - from.x);

/** The rendered angle and its reserved space must use exactly the same layout. */
function rawAngleLayout(scene: Scene, angle: Scene["angles"][number]) {
  const at = scene.points[angle.at],
    a = scene.points[angle.from],
    b = scene.points[angle.to];
  const start = bearing(at, a);
  let sweep =
    ((bearing(at, b) - start + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  if (angle.reflex) sweep += sweep > 0 ? -Math.PI * 2 : Math.PI * 2;
  if (angle.sweepDegrees !== undefined)
    sweep = (angle.sweepDegrees * Math.PI) / 180;
  const radius = angle.radius ?? 32;
  const value = angle.reflex ? 360 - angleAt(a, at, b) : angleAt(a, at, b);
  const right = Math.abs(value - 90) < 0.01;
  const point = (theta: number, r: number): Point => ({
    x: at.x + r * Math.cos(theta),
    y: at.y + r * Math.sin(theta),
  });
  const begin = point(start, radius),
    end = point(start + sweep, radius);
  let labelRadius = radius + 17;
  if (right)
    labelRadius = Math.max(labelRadius, rightAngleSize * Math.SQRT2 + 30);
  // Wide central angles bring their chords close to the usual text position.
  if (
    angle.at === "O" &&
    !angle.reflex &&
    scene.lines.some(
      (line) =>
        !line.dashed &&
        ((line.from === angle.from && line.to === angle.to) ||
          (line.to === angle.from && line.from === angle.to)),
    )
  ) {
    const chordDistance = RADIUS * Math.cos((value * Math.PI) / 360);
    if (Math.abs(labelRadius - chordDistance) < 22)
      labelRadius = chordDistance + 25;
  }
  const label = point(start + sweep / 2, labelRadius);
  const wedge = `M ${at.x} ${at.y} L ${begin.x} ${begin.y} A ${radius} ${radius} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${sweep > 0 ? 1 : 0} ${end.x} ${end.y} Z`;
  const u = point(start, rightAngleSize),
    v = point(start + sweep, rightAngleSize);
  const corner = { x: u.x + v.x - at.x, y: u.y + v.y - at.y };
  const squarePath = `M ${u.x} ${u.y} L ${corner.x} ${corner.y} L ${v.x} ${v.y}`;
  return {
    start,
    sweep,
    radius,
    value,
    right,
    label,
    wedge,
    squarePath,
    leader: undefined as Point | undefined,
  };
}

/** Keep M/N names outside the quadrant occupied by a right-angle square. */
type PointLabelOffset = Point & { leader?: Point };
function rawPointLabelOffset(
  scene: Scene,
  point: ScenePoint,
): PointLabelOffset {
  const name = point.label;
  const mark =
    name === "M" || name === "N"
      ? (scene.rightAngles.find((item) => item.at === name) ??
        scene.angles.find(
          (item) =>
            item.at === name &&
            !item.reflex &&
            Math.abs(
              angleAt(scene.points[item.from], point, scene.points[item.to]) -
                90,
            ) < 0.01,
        ))
      : undefined;
  if (mark) {
    const first = scene.points[mark.from],
      second = scene.points[mark.to];
    const a = distance(first, point),
      b = distance(second, point);
    if (a >= 0.001 && b >= 0.001) {
      const x = (first.x - point.x) / a + (second.x - point.x) / b,
        y = (first.y - point.y) / a + (second.y - point.y) / b;
      const length = Math.hypot(x, y);
      if (length >= 0.001)
        return { x: (-29 * x) / length, y: (-29 * y) / length };
    }
  }
  const radial = bearing(CENTRE, point);
  return {
    x: point.labelDx ?? Math.cos(radial) * 23,
    y: point.labelDy ?? Math.sin(radial) * 23,
  };
}

export type LayoutBox = Point & { width: number; height: number };
type LabelBounds = { left: number; right: number; top: number; bottom: number };

/** Resolve text only; point positions and geometric marks are never adjusted. */
export function placeDiagramLabel(
  preferred: LayoutBox,
  occupied: LayoutBox[],
  bounds: LabelBounds,
  alternatives: Point[] = [],
): LayoutBox {
  const nearby = [preferred, ...alternatives];
  // Nearby choices also handle coincident labelled vertices without moving them.
  for (const radius of [12, 24, 36, 48, 64, 80, 104, 128])
    for (let direction = 0; direction < 16; direction++) {
      const angle = (direction * Math.PI) / 8;
      nearby.push({
        x: preferred.x + radius * Math.cos(angle),
        y: preferred.y + radius * Math.sin(angle),
      });
    }
  let best = preferred;
  let bestScore = Infinity;
  for (const candidate of nearby) {
    const box = {
      ...preferred,
      x: clamp(
        candidate.x,
        bounds.left + preferred.width / 2,
        bounds.right - preferred.width / 2,
      ),
      y: clamp(
        candidate.y,
        bounds.top + preferred.height / 2,
        bounds.bottom - preferred.height / 2,
      ),
    };
    const collision = occupied.reduce((sum, other) => {
      const x = Math.max(
        0,
        (box.width + other.width) / 2 + 2 - Math.abs(box.x - other.x),
      );
      const y = Math.max(
        0,
        (box.height + other.height) / 2 + 2 - Math.abs(box.y - other.y),
      );
      return sum + x * y;
    }, 0);
    const score = collision * 100000 + distance(preferred, box);
    if (score < bestScore) {
      best = box;
      bestScore = score;
    }
    if (score === 0) break;
  }
  return best;
}

type AnnotationLayout = {
  points: Record<string, PointLabelOffset>;
  angles: ReturnType<typeof rawAngleLayout>[];
};
const annotations = new WeakMap<Scene, AnnotationLayout>();

function sceneAnnotations(scene: Scene): AnnotationLayout {
  const cached = annotations.get(scene);
  if (cached) return cached;
  // Two units inside the construction's 80 20 400 400 viewBox.
  const bounds = { left: 82, right: 478, top: 22, bottom: 418 };
  const names: LayoutBox[] = [];
  const points: Record<string, PointLabelOffset> = {};
  const vertices = Object.values(scene.points);
  for (const point of vertices) {
    const offset = rawPointLabelOffset(scene, point);
    const preferred = {
      x: point.x + offset.x,
      y: point.y + offset.y,
      width: 24,
      height: 26,
    };
    const otherPoints = vertices
      .filter((other) => other !== point)
      .map((other) => ({
        ...other,
        width: other.drag ? 32 : 10,
        height: other.drag ? 32 : 10,
      }));
    const label = placeDiagramLabel(
      preferred,
      [...names, ...otherPoints],
      bounds,
    );
    points[point.label] = {
      x: label.x - point.x,
      y: label.y - point.y,
      ...(distance(preferred, label) > 4
        ? { leader: { x: point.x, y: point.y } }
        : {}),
    };
    names.push(label);
  }
  const occupied = [
    ...names,
    ...vertices.map((point) => ({
      ...point,
      width: point.drag ? 38 : 10,
      height: point.drag ? 38 : 10,
    })),
  ];
  const angles = scene.angles.map((angle) => {
    const layout = rawAngleLayout(scene, angle);
    const at = scene.points[angle.at];
    const direction = layout.start + layout.sweep / 2;
    const radius = distance(at, layout.label);
    const alternatives = [20, 40, 60, 80].map((extra) => ({
      x: at.x + (radius + extra) * Math.cos(direction),
      y: at.y + (radius + extra) * Math.sin(direction),
    }));
    const label = placeDiagramLabel(
      { ...layout.label, width: 84, height: 30 },
      occupied,
      bounds,
      alternatives,
    );
    occupied.push(label);
    const leaderRadius = layout.right
      ? rightAngleSize * Math.SQRT2
      : layout.radius;
    return {
      ...layout,
      label: { x: label.x, y: label.y },
      leader:
        distance(layout.label, label) > 4
          ? {
              x: at.x + leaderRadius * Math.cos(direction),
              y: at.y + leaderRadius * Math.sin(direction),
            }
          : undefined,
    };
  });
  const result = { points, angles };
  annotations.set(scene, result);
  return result;
}

export function getAngleLayout(scene: Scene, angle: Scene["angles"][number]) {
  return (
    sceneAnnotations(scene).angles[scene.angles.indexOf(angle)] ??
    rawAngleLayout(scene, angle)
  );
}

export function getPointLabelOffset(
  scene: Scene,
  point: ScenePoint,
): PointLabelOffset {
  return (
    sceneAnnotations(scene).points[point.label] ??
    rawPointLabelOffset(scene, point)
  );
}

type Measurement = {
  name: string;
  value: number;
  tone: Tone;
  anchor: Point;
  candidates: Point[];
  guide?: { from: Point; to: Point };
};

const midway = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

function segmentMeasurement(
  scene: Scene,
  from: string,
  to: string,
  tone: Tone,
  guide = false,
): Measurement {
  const a = scene.points[from],
    b = scene.points[to],
    anchor = midway(a, b),
    length = distance(a, b);
  let nx = length > 0.001 ? -(b.y - a.y) / length : 1,
    ny = length > 0.001 ? (b.x - a.x) / length : 0;
  // Prefer the side away from the centre, keeping the construction unobscured.
  if ((anchor.x - CENTRE.x) * nx + (anchor.y - CENTRE.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const candidates: Point[] = [];
  for (const offset of [26, 42, -26, -42, 60, -60]) {
    for (const fraction of [0.5, 0.35, 0.65]) {
      candidates.push({
        x: a.x + fraction * (b.x - a.x) + nx * offset,
        y: a.y + fraction * (b.y - a.y) + ny * offset,
      });
    }
  }
  return {
    name: from + to,
    value: length / UNIT,
    tone,
    anchor,
    candidates,
    ...(guide ? { guide: { from: a, to: b } } : {}),
  };
}

export function getDiagramBlockers(scene: Scene): LayoutBox[] {
  const result: LayoutBox[] = [];
  for (const point of Object.values(scene.points)) {
    const offset = getPointLabelOffset(scene, point);
    result.push({ ...point, width: 38, height: 38 });
    result.push({
      x: point.x + offset.x,
      y: point.y + offset.y,
      width: 24,
      height: 26,
    });
  }
  for (const angle of scene.angles) {
    result.push({
      ...getAngleLayout(scene, angle).label,
      width: 84,
      height: 30,
    });
  }
  return result;
}

function place(
  measurement: Measurement,
  width: number,
  occupied: LayoutBox[],
): LayoutBox {
  const height = measurement.name.startsWith("Arc ") ? 32 : 27;
  const candidates = measurement.candidates.map((point) => ({
    x: clamp(point.x, 86 + width / 2, 474 - width / 2),
    y: clamp(point.y, 36, 404),
    width,
    height,
  }));
  const overlap = (box: LayoutBox) =>
    occupied.reduce((sum, other) => {
      const x = Math.max(
        0,
        (box.width + other.width) / 2 + 3 - Math.abs(box.x - other.x),
      );
      const y = Math.max(
        0,
        (box.height + other.height) / 2 + 3 - Math.abs(box.y - other.y),
      );
      return sum + x * y;
    }, 0);
  let best = candidates[0],
    score = Infinity;
  candidates.forEach((box, index) => {
    const next = overlap(box) * 100 + index;
    if (next < score) {
      best = box;
      score = next;
    }
  });
  // Rotated short chords and dense reflex constructions can exhaust every
  // nearby candidate. Use the nearest clear space instead of covering a value.
  if (overlap(best) > 0) {
    let fallback: LayoutBox | undefined;
    let nearest = Infinity;
    for (let y = 36; y <= 404; y += 16) {
      for (let x = 86 + width / 2; x <= 474 - width / 2; x += 16) {
        const box = { x, y, width, height };
        if (overlap(box) > 0) continue;
        const proximity = distance(box, measurement.anchor);
        if (proximity < nearest) {
          fallback = box;
          nearest = proximity;
        }
      }
    }
    if (fallback) best = fallback;
  }
  occupied.push(best);
  return best;
}

export function getMeasurementLayout(
  lab: LabId,
  parameters: Parameters,
  missionIndex?: number,
) {
  const scene = getScene(lab, parameters),
    measurements: Measurement[] = [];
  const add = (from: string, to: string, tone: Tone, guide = false) =>
    measurements.push(segmentMeasurement(scene, from, to, tone, guide));
  if (lab === "bisector") {
    add("A", "N", "navy");
    add("N", "B", "red");
    if (missionIndex === 1) add("A", "B", "muted");
  } else if (lab === "chords") {
    add("A", "B", "navy");
    add("C", "D", "red");
    add("O", "M", "navy");
    add("O", "N", "red");
  } else if (lab === "semicircle") {
    add("A", "B", "navy");
  } else if (lab === "segment" && missionIndex === 2) {
    add("P", "Q", "muted", true);
  } else if (lab === "equal-arcs" || lab === "ratios") {
    add("A", "B", "navy");
    add("C", "D", "red");
    scene.arcs.forEach((arc, index) => {
      const middle = arc.start + arc.sweep / 2;
      measurements.push({
        name: `Arc ${index === 0 ? "AB" : "CD"}`,
        value: (Math.abs(arc.sweep) * Math.PI * RADIUS) / (180 * UNIT),
        tone: arc.tone,
        anchor: circlePoint(middle),
        candidates: [0, -12, 12, -24, 24].flatMap((shift) =>
          [RADIUS + 25, RADIUS - 25, RADIUS - 45].map((radius) =>
            circlePoint(middle + shift, radius),
          ),
        ),
      });
    });
  }
  const occupied = getDiagramBlockers(scene);
  return measurements.map((measurement) => {
    const value = Number(measurement.value.toFixed(1));
    const label = `${measurement.name} = ${value} cm`;
    const box = place(measurement, label.length * 8.3 + 12, occupied);
    return { ...measurement, label, box };
  });
}
