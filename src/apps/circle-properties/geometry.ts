import type { LabId } from "./content";
export type { LabId } from "./content";

export type ParamKey =
  "primary" | "secondary" | "rotation" | "rotation2" | "tertiary";
export type DragKey = ParamKey | "A" | "B" | "C" | "D" | "M" | "N" | "P" | "Q";
export type Parameters = {
  primary: number;
  secondary: number;
  alternate: boolean;
  rotation?: number;
  rotation2?: number;
  tertiary?: number;
};
export type Point = { x: number; y: number };
export type Control = {
  key: ParamKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};
export type Model = {
  measurements: { label: string; value: number; unit: string }[];
  signature: string;
  controls: Control[];
  toggleLabel?: string;
  description: string;
};
export type Tone = "navy" | "red" | "muted";
export type ScenePoint = Point & {
  label: string;
  drag?: DragKey;
  labelDx?: number;
  labelDy?: number;
};
export type Scene = {
  points: Record<string, ScenePoint>;
  lines: {
    from: string;
    to: string;
    tone: Tone;
    dashed?: boolean;
    width?: number;
  }[];
  arcs: { start: number; sweep: number; tone: Tone }[];
  angles: {
    at: string;
    from: string;
    to: string;
    tone: Tone;
    reflex?: boolean;
    radius?: number;
    sweepDegrees?: number;
  }[];
  rightAngles: { at: string; from: string; to: string }[];
  caption: string;
};

export const CENTRE = { x: 280, y: 220 };
export const RADIUS = 160;
export const UNIT = 16;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const wrapAngle = (value: number) => ((value % 360) + 360) % 360;
export function circlePoint(degrees: number, radius = RADIUS): Point {
  return {
    x: CENTRE.x + radius * Math.cos(radians(degrees)),
    y: CENTRE.y + radius * Math.sin(radians(degrees)),
  };
}
export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function angleAt(a: Point, vertex: Point, b: Point) {
  const u = { x: a.x - vertex.x, y: a.y - vertex.y },
    v = { x: b.x - vertex.x, y: b.y - vertex.y };
  const denominator = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  if (denominator < 1e-10) return 0;
  return (
    (Math.acos(clamp((u.x * v.x + u.y * v.y) / denominator, -1, 1)) * 180) /
    Math.PI
  );
}
const bearing = (p: Point) =>
  wrapAngle((Math.atan2(p.y - CENTRE.y, p.x - CENTRE.x) * 180) / Math.PI);
const interpolate = (a: Point, b: Point, fraction: number): Point => ({
  x: a.x + fraction * (b.x - a.x),
  y: a.y + fraction * (b.y - a.y),
});
const midpoint = (a: Point, b: Point) => interpolate(a, b, 0.5);
const arcFraction = (fraction: number, sweep: number) => {
  const margin = Math.max(5, 800 / sweep); // Keep circumference vertices at least 8 degrees from chord endpoints.
  return clamp(fraction, margin, 100 - margin);
};

export const defaults: Record<LabId, Required<Parameters>> = {
  bisector: {
    primary: 5,
    secondary: 35,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  chords: {
    primary: 4,
    secondary: 7,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  centre: {
    primary: 100,
    secondary: 50,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  segment: {
    primary: 110,
    secondary: 74,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  semicircle: {
    primary: 150,
    secondary: 50,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  "equal-arcs": {
    primary: 70,
    secondary: 110,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
  ratios: {
    primary: 60,
    secondary: 120,
    alternate: false,
    rotation: 0,
    rotation2: 0,
    tertiary: 32,
  },
};
const control = (
  key: ParamKey,
  label: string,
  min: number,
  max: number,
  step = 1,
  unit = "°",
): Control => ({ key, label, min, max, step, unit });
export function getControls(lab: LabId): Control[] {
  const rotation = control(
    "rotation",
    lab === "chords" || lab === "equal-arcs" || lab === "ratios"
      ? "Rotate AB"
      : "Rotate the construction",
    0,
    360,
  );
  switch (lab) {
    case "bisector":
      return [
        control("primary", "Chord offset from O", -9.8, 9.8, 0.1, "cm"),
        control("secondary", "Position of N along AB", -90, 90, 1, "%"),
        rotation,
      ];
    case "chords":
      return [
        control("primary", "Offset of AB from O", -9.8, 9.8, 0.1, "cm"),
        control("secondary", "Offset of CD from O", -9.8, 9.8, 0.1, "cm"),
        rotation,
        control("rotation2", "Rotate CD", 0, 360),
      ];
    case "centre":
      return [
        control("primary", "Arc AB angle", 20, 340),
        control("secondary", "Position of P on its arc", 5, 95, 1, "%"),
        rotation,
      ];
    case "segment":
      return [
        control("primary", "Arc AB angle", 20, 340),
        control("secondary", "Position of Q on its arc", 5, 95, 1, "%"),
        rotation,
        control("tertiary", "Position of P on its arc", 5, 95, 1, "%"),
      ];
    case "semicircle":
      return [
        control("primary", "Angle swept from A to B", 20, 340),
        control("secondary", "Position of P on its arc", 5, 95, 1, "%"),
        rotation,
      ];
    default:
      return [
        control("primary", "Angle subtended by arc AB", 20, 340),
        control("secondary", "Angle subtended by arc CD", 20, 340),
        rotation,
        control("rotation2", "Rotate CD", 0, 360),
      ];
  }
}
export function normalise(
  lab: LabId,
  parameters: Parameters,
): Required<Parameters> {
  const result: Required<Parameters> = {
    ...defaults[lab],
    ...parameters,
    rotation: parameters.rotation ?? 0,
    rotation2: parameters.rotation2 ?? 0,
    tertiary: parameters.tertiary ?? 32,
  };
  for (const c of getControls(lab))
    result[c.key] = clamp(
      Number.isFinite(result[c.key]) ? result[c.key] : defaults[lab][c.key],
      c.min,
      c.max,
    );
  if (lab === "bisector" && Math.abs(result.primary) < 0.2)
    result.primary = result.primary < 0 ? -0.2 : 0.2;
  if (lab === "centre" || lab === "segment" || lab === "semicircle") {
    result.secondary = arcFraction(
      result.secondary,
      result.alternate ? result.primary : 360 - result.primary,
    );
    result.tertiary = arcFraction(result.tertiary, 360 - result.primary);
  }
  return result;
}
function arcEndpoints(lab: LabId, p: Required<Parameters>) {
  const start = (lab === "semicircle" ? 0 : 90 - p.primary / 2) + p.rotation;
  return { start, end: start + p.primary };
}
function chordEndpoints(offset: number, rotation: number, lower = false) {
  const centreBearing = (lower ? 90 : 270) + rotation;
  const half = (Math.acos(clamp(offset / 10, -0.98, 0.98)) * 180) / Math.PI;
  const orientation = lower ? -1 : 1;
  return {
    a: circlePoint(centreBearing - orientation * half),
    b: circlePoint(centreBearing + orientation * half),
  };
}

export function getScene(lab: LabId, parameters: Parameters): Scene {
  const p = normalise(lab, parameters);
  const scene: Scene = {
    points: { O: { ...CENTRE, label: "O", labelDx: 13, labelDy: 19 } },
    lines: [],
    arcs: [],
    angles: [],
    rightAngles: [],
    caption: "O is the centre. Radius = 10 cm.",
  };
  const point = (
    label: string,
    position: Point,
    drag?: DragKey,
    labelDx?: number,
    labelDy?: number,
  ) => {
    scene.points[label] = { ...position, label, drag, labelDx, labelDy };
  };
  const line = (
    from: string,
    to: string,
    tone: Tone = "navy",
    dashed = false,
    width?: number,
  ) => scene.lines.push({ from, to, tone, dashed, width });
  const angle = (
    at: string,
    from: string,
    to: string,
    tone: Tone,
    reflex = false,
    radius = 34,
    sweepDegrees?: number,
  ) => scene.angles.push({ at, from, to, tone, reflex, radius, sweepDegrees });
  if (lab === "bisector" || lab === "chords") {
    const ab = chordEndpoints(p.primary, p.rotation);
    point("A", ab.a, "A");
    point("B", ab.b, "B");
    line("A", "B", "navy", false, 4);
    if (lab === "bisector") {
      const n = interpolate(ab.a, ab.b, (p.secondary + 100) / 200);
      point(
        "N",
        n,
        "N",
        24 * Math.sin(radians(p.rotation)),
        -24 * Math.cos(radians(p.rotation)),
      );
      line("O", "N", "red", false, 3);
      line("O", "A", "muted", true);
      line("O", "B", "muted", true);
      angle("N", "O", "B", "red", false, 27);
      scene.caption =
        "Drag A and B independently around the circle. Slide N along AB. Radius = 10 cm; diameter positions are excluded here.";
    } else {
      const cd = chordEndpoints(p.secondary, p.rotation2, true);
      point("M", midpoint(ab.a, ab.b), "M", 16, -17);
      point("N", midpoint(cd.a, cd.b), "N", 16, 20);
      point("C", cd.a, "C");
      point("D", cd.b, "D");
      line("C", "D", "red", false, 4);
      line("O", "M", "navy");
      line("O", "N", "red");
      if (Math.abs(p.primary) > 0.001)
        scene.rightAngles.push({ at: "M", from: "B", to: "O" });
      if (Math.abs(p.secondary) > 0.001)
        scene.rightAngles.push({ at: "N", from: "D", to: "O" });
      scene.caption =
        "Drag any chord endpoint to turn and resize its chord. Distances OM and ON stay perpendicular. Radius = 10 cm.";
    }
    return scene;
  }
  if (lab === "centre" || lab === "segment" || lab === "semicircle") {
    const { start, end } = arcEndpoints(lab, p);
    point("A", circlePoint(start), "A");
    point("B", circlePoint(end), "B");
    const vertexDegrees =
      lab === "segment"
        ? end + (p.tertiary / 100) * (360 - p.primary)
        : p.alternate
          ? start + (p.secondary / 100) * p.primary
          : end + (p.secondary / 100) * (360 - p.primary);
    point("P", circlePoint(vertexDegrees), "P");
    line("A", "B", "muted", true);
    line("P", "A", "red");
    line("P", "B", "red");
    angle("P", "A", "B", "red");
    const selectedSweep =
      lab !== "segment" && p.alternate ? 360 - p.primary : p.primary;
    scene.arcs.push({
      start: lab !== "segment" && p.alternate ? end : start,
      sweep: selectedSweep,
      tone: "red",
    });
    if (lab === "centre") {
      line("O", "A", "navy");
      line("O", "B", "navy");
      angle(
        "O",
        "A",
        "B",
        "navy",
        selectedSweep > 180,
        43,
        p.alternate ? -selectedSweep : selectedSweep,
      );
      scene.caption =
        "A and B move independently. Drag P across either arc; the highlighted arc always excludes P. Radius = 10 cm.";
    } else if (lab === "segment") {
      const qDegrees = p.alternate
        ? start + (p.secondary / 100) * p.primary
        : end + (p.secondary / 100) * (360 - p.primary);
      point("Q", circlePoint(qDegrees), "Q");
      line("Q", "A", "navy");
      line("Q", "B", "navy");
      angle("Q", "A", "B", "navy");
      scene.caption = p.alternate
        ? "Q is on the opposite side of AB from P. Drag Q back across the chord to compare. Radius = 10 cm."
        : "Drag A, B, P or Q. P and Q are on the same side of AB; Q can cross to the other arc. Radius = 10 cm.";
    } else {
      line("O", "A", "muted", true);
      line("O", "B", "muted", true);
      scene.caption =
        "Drag either chord endpoint to make a diameter, then move P around the circle. Radius = 10 cm.";
    }
    return scene;
  }
  const a = 270 - p.primary / 2 + p.rotation,
    b = a + p.primary;
  const c = 90 - p.secondary / 2 + p.rotation2,
    d = c + p.secondary;
  point("A", circlePoint(a), "A");
  point("B", circlePoint(b), "B");
  point("C", circlePoint(c), "C");
  point("D", circlePoint(d), "D");
  line("A", "B", "navy", false, 4);
  line("C", "D", "red", false, 4);
  scene.arcs.push(
    { start: a, sweep: p.primary, tone: "navy" },
    { start: c, sweep: p.secondary, tone: "red" },
  );
  if (lab === "ratios" && p.alternate) {
    scene.points.O.labelDx = 15;
    scene.points.O.labelDy = 0;
    point("P", circlePoint(b + (360 - p.primary) / 2));
    point("Q", circlePoint(d + (360 - p.secondary) / 2));
    line("P", "A", "navy");
    line("P", "B", "navy");
    angle("P", "A", "B", "navy");
    line("Q", "C", "red");
    line("Q", "D", "red");
    angle("Q", "C", "D", "red");
    scene.caption =
      "Each circumference angle uses its highlighted arc, excluding its vertex. Drag A, B, C or D. Radius = 10 cm.";
  } else {
    line("O", "A", "navy");
    line("O", "B", "navy");
    angle("O", "A", "B", "navy", p.primary > 180, 42, p.primary);
    line("O", "C", "red");
    line("O", "D", "red");
    angle("O", "C", "D", "red", p.secondary > 180, 42, p.secondary);
    scene.caption =
      "Drag each endpoint to turn or resize either arc. Match the highlighted arcs to their centre angles. Radius = 10 cm.";
  }
  // Coincident endpoints belong to different constructions; offset both labels so neither name disappears.
  for (const [first, second] of [
    ["A", "C"],
    ["A", "D"],
    ["B", "C"],
    ["B", "D"],
  ]) {
    if (distance(scene.points[first], scene.points[second]) < 30) {
      scene.points[first].labelDx = -22;
      scene.points[first].labelDy = -22;
      scene.points[second].labelDx = 22;
      scene.points[second].labelDy = 22;
    }
  }
  return scene;
}

export function getModel(lab: LabId, parameters: Parameters): Model {
  const p = normalise(lab, parameters),
    scene = getScene(lab, p),
    s = scene.points;
  const measurements: Model["measurements"] = [];
  const length = (label: string, from: string, to: string) =>
    measurements.push({
      label,
      value: distance(s[from], s[to]) / UNIT,
      unit: "cm",
    });
  const angle = (
    label: string,
    from: string,
    at: string,
    to: string,
    reflex = false,
  ) => {
    const v = angleAt(s[from], s[at], s[to]);
    measurements.push({ label, value: reflex ? 360 - v : v, unit: "°" });
  };
  let toggleLabel: string | undefined;
  switch (lab) {
    case "bisector":
      length("AN", "A", "N");
      length("NB", "N", "B");
      angle("∠ONB", "O", "N", "B");
      break;
    case "chords":
      length("OM", "O", "M");
      length("ON", "O", "N");
      length("AB", "A", "B");
      length("CD", "C", "D");
      break;
    case "centre": {
      const reflex = (p.alternate ? 360 - p.primary : p.primary) > 180;
      angle(reflex ? "Reflex ∠AOB" : "∠AOB", "A", "O", "B", reflex);
      angle("∠APB", "A", "P", "B");
      toggleLabel = "Move P to the other arc";
      break;
    }
    case "segment":
      angle("∠APB", "A", "P", "B");
      angle("∠AQB", "A", "Q", "B");
      measurements.push({
        label: "Angle sum",
        value: angleAt(s.A, s.P, s.B) + angleAt(s.A, s.Q, s.B),
        unit: "°",
      });
      toggleLabel = "Move Q to the opposite side of AB";
      break;
    case "semicircle":
      angle("∠APB", "A", "P", "B");
      length("AB", "A", "B");
      measurements.push({ label: "Diameter", value: 20, unit: "cm" });
      toggleLabel = "Move P to the other arc";
      break;
    default: {
      const arcA = (p.primary * Math.PI) / 18,
        arcB = (p.secondary * Math.PI) / 18;
      if (lab === "ratios" && p.alternate) {
        angle("∠APB", "A", "P", "B");
        angle("∠CQD", "C", "Q", "D");
      } else {
        angle("∠AOB", "A", "O", "B", p.primary > 180);
        angle("∠COD", "C", "O", "D", p.secondary > 180);
      }
      measurements.push(
        { label: "Arc AB", value: arcA, unit: "cm" },
        { label: "Arc CD", value: arcB, unit: "cm" },
      );
      length("Chord AB", "A", "B");
      length("Chord CD", "C", "D");
      if (lab === "ratios") {
        measurements.push(
          { label: "Arc AB ÷ arc CD", value: arcA / arcB, unit: "" },
          {
            label: "Angle ratio",
            value: measurements[0].value / measurements[1].value,
            unit: "",
          },
          {
            label: "Chord AB ÷ CD",
            value: distance(s.A, s.B) / distance(s.C, s.D),
            unit: "",
          },
        );
        toggleLabel = "Use angles at the circumference";
      }
    }
  }
  return {
    measurements,
    signature: `${lab}:${Object.values(p).join(":")}`,
    controls: getControls(lab),
    toggleLabel,
    description: scene.caption,
  };
}

function moveChordEndpoint(
  p: Required<Parameters>,
  key: DragKey,
  position: Point,
  lower: boolean,
): Required<Parameters> {
  const offsetKey = lower ? "secondary" : "primary",
    rotationKey = lower ? "rotation2" : "rotation";
  const ends = chordEndpoints(p[offsetKey], p[rotationKey], lower);
  const first = key === "A" || key === "C",
    direction = lower ? -1 : 1;
  const a = first ? bearing(position) : bearing(ends.a),
    b = first ? bearing(ends.b) : bearing(position);
  const sweep = clamp(wrapAngle(direction * (b - a)), 23, 337);
  const half = sweep / 2,
    mid = first ? b - direction * half : a + direction * half;
  return {
    ...p,
    [offsetKey]: 10 * Math.cos(radians(half)),
    [rotationKey]: wrapAngle(mid - (lower ? 90 : 270)),
  };
}
function moveArcEndpoint(
  lab: LabId,
  p: Required<Parameters>,
  key: DragKey,
  position: Point,
): Required<Parameters> {
  const secondPair = key === "C" || key === "D",
    sweepKey = secondPair ? "secondary" : "primary",
    rotationKey = secondPair ? "rotation2" : "rotation";
  const arcBase = secondPair
    ? 90
    : lab === "ratios" || lab === "equal-arcs"
      ? 270
      : lab === "semicircle"
        ? p.primary / 2
        : 90;
  const start = arcBase - p[sweepKey] / 2 + p[rotationKey],
    end = start + p[sweepKey];
  const first = key === "A" || key === "C";
  const candidate = bearing(position);
  const sweep = clamp(
    wrapAngle(first ? end - candidate : candidate - start),
    20,
    340,
  );
  const newStart = first ? end - sweep : start;
  return {
    ...p,
    [sweepKey]: sweep,
    [rotationKey]: wrapAngle(
      newStart -
        (lab === "semicircle" && !secondPair ? 0 : arcBase - sweep / 2),
    ),
  };
}

/** Direct SVG drags are continuous; slider steps are keyboard conveniences only. */
export function dragParameter(
  lab: LabId,
  parameters: Parameters,
  key: DragKey,
  position: Point,
): Parameters {
  const p = normalise(lab, parameters);
  if (["A", "B", "C", "D"].includes(key)) {
    const next =
      lab === "bisector" || lab === "chords"
        ? moveChordEndpoint(p, key, position, key === "C" || key === "D")
        : moveArcEndpoint(lab, p, key, position);
    return normalise(lab, next);
  }
  if (lab === "bisector" && (key === "N" || key === "secondary")) {
    const ends = chordEndpoints(p.primary, p.rotation),
      dx = ends.b.x - ends.a.x,
      dy = ends.b.y - ends.a.y;
    const fraction =
      ((position.x - ends.a.x) * dx + (position.y - ends.a.y) * dy) /
      (dx * dx + dy * dy);
    return normalise(lab, { ...p, secondary: 200 * fraction - 100 });
  }
  if (lab === "chords" || lab === "bisector") {
    const lower = key === "N" || key === "secondary",
      rotation = lower ? p.rotation2 : p.rotation;
    const normal = circlePoint((lower ? 90 : 270) + rotation, 1);
    const value =
      ((position.x - CENTRE.x) * (normal.x - CENTRE.x) +
        (position.y - CENTRE.y) * (normal.y - CENTRE.y)) /
      UNIT;
    return normalise(lab, { ...p, [lower ? "secondary" : "primary"]: value });
  }
  if (
    key === "P" ||
    key === "Q" ||
    key === "tertiary" ||
    (key === "secondary" && lab !== "equal-arcs" && lab !== "ratios")
  ) {
    const { start, end } = arcEndpoints(lab, p);
    const relative = wrapAngle(bearing(position) - start);
    const segmentP = lab === "segment" && (key === "P" || key === "tertiary");
    const alternate = segmentP ? false : relative < p.primary;
    const sweep = alternate ? p.primary : 360 - p.primary,
      arcStart = alternate ? start : end;
    const mid = arcStart + sweep / 2;
    const displacement = ((bearing(position) - mid + 540) % 360) - 180;
    const fraction = ((displacement + sweep / 2) / sweep) * 100;
    return normalise(lab, {
      ...p,
      ...(segmentP
        ? { tertiary: fraction }
        : { secondary: fraction, alternate }),
    });
  }
  // Compatibility with keyboard/test callers that address the original two arc controls directly.
  if (key === "primary" || key === "secondary") {
    const endpoint = key === "primary" ? "B" : "D";
    return normalise(lab, moveArcEndpoint(lab, p, endpoint, position));
  }
  return p;
}
