import { reasons, type LabId } from "./content";
import {
  CENTRE,
  RADIUS,
  UNIT,
  angleAt,
  circlePoint,
  clamp,
  defaults,
  distance,
  dragParameter,
  getControls,
  getScene,
  normalise,
  wrapAngle,
  type Control,
  type DragKey,
  type Parameters,
  type Point,
  type Scene,
} from "./geometry";

export type ReasonParameters = Parameters & { qPosition?: number };
export const FLOW_CENTRE = { x: 210, y: 180 };
export const FLOW_RADIUS = 125;
export const toFlowPoint = (p: Point): Point => ({
  x: FLOW_CENTRE.x + ((p.x - CENTRE.x) * FLOW_RADIUS) / RADIUS,
  y: FLOW_CENTRE.y + ((p.y - CENTRE.y) * FLOW_RADIUS) / RADIUS,
});
export const fromFlowPoint = (p: Point): Point => ({
  x: CENTRE.x + ((p.x - FLOW_CENTRE.x) * RADIUS) / FLOW_RADIUS,
  y: CENTRE.y + ((p.y - FLOW_CENTRE.y) * RADIUS) / FLOW_RADIUS,
});
export const reasonLab = (id: string): LabId =>
  reasons.find((r) => r.id === id)?.lab ?? "bisector";
const boundedOffset = (value: number) =>
  (value < 0 ? -1 : 1) * clamp(Math.abs(value), 0.5, 9.2);
const finite = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) ? value! : fallback;

export function initialReasonParameters(id: string): ReasonParameters {
  const p: ReasonParameters = { ...defaults[reasonLab(id)] };
  if (["r1", "r2", "r3"].includes(id))
    Object.assign(p, { primary: 5, secondary: 0 });
  else if (id === "r4" || id === "r5")
    Object.assign(p, { primary: 5, secondary: 5 });
  else if (id === "r6")
    Object.assign(p, { primary: 120, secondary: 50, rotation: 180 });
  else if (id === "r7")
    Object.assign(p, {
      primary: 120,
      tertiary: 95 / 2.4,
      secondary: 165 / 2.4,
      rotation: 180,
    });
  else if (id === "r8" || id === "r9")
    Object.assign(p, {
      primary: 180,
      secondary: 110 / 1.8,
      rotation: 180,
      alternate: true,
    });
  else if (id === "r16" || id === "r17")
    Object.assign(p, {
      primary: 60,
      secondary: 100,
      alternate: id === "r17",
      tertiary: 80,
      qPosition: 220 / 2.6,
    });
  else Object.assign(p, { primary: 70, secondary: 70 });
  return normaliseReasonParameters(id, p);
}

/** Only the stated givens are locked. Equal derived quantities are never imposed separately. */
export function normaliseReasonParameters(
  id: string,
  input: ReasonParameters,
): ReasonParameters {
  const lab = reasonLab(id);
  let p: ReasonParameters = normalise(lab, input);
  if (lab === "bisector")
    p = { ...p, primary: boundedOffset(p.primary), secondary: 0 };
  else if (lab === "chords") {
    const offset = boundedOffset(p.primary);
    p = {
      ...p,
      primary: offset,
      secondary: (p.secondary < 0 ? -1 : 1) * Math.abs(offset),
    };
  } else if (lab === "segment") {
    p = { ...p, primary: clamp(p.primary, 20, 300), alternate: false };
  } else if (lab === "semicircle") p = { ...p, primary: 180 };
  else if (lab === "equal-arcs") {
    const sweep = clamp(p.primary, 20, 170);
    p = { ...p, primary: sweep, secondary: sweep, alternate: false };
  } else if (lab === "ratios") p = { ...p, alternate: id === "r17" };
  p = normalise(lab, p);
  if (id === "r17") {
    const marginP = Math.max(8, 800 / (360 - p.primary));
    const marginQ = Math.max(8, 800 / (360 - p.secondary));
    p = {
      ...p,
      tertiary: clamp(finite(input.tertiary, 80), marginP, 100 - marginP),
      qPosition: clamp(
        finite(input.qPosition, 220 / 2.6),
        marginQ,
        100 - marginQ,
      ),
    };
  }
  return p;
}

/** Circumference vertices stay on the allowed arc, a safe distance from endpoints. */
function fractionOnArc(angle: number, start: number, sweep: number) {
  const relative = wrapAngle(angle - start);
  const margin = Math.max(8, sweep * 0.05);
  if (relative <= sweep)
    return (clamp(relative, margin, sweep - margin) / sweep) * 100;
  return (
    ((relative - sweep < 360 - relative ? sweep - margin : margin) / sweep) *
    100
  );
}

export function getReasonScene(id: string, input: ReasonParameters): Scene {
  const p = normaliseReasonParameters(id, input);
  const scene = getScene(reasonLab(id), p);
  if (id === "r17") {
    const a = scene.arcs[0],
      b = scene.arcs[1];
    scene.points.P = {
      ...scene.points.P,
      ...circlePoint(a.start + a.sweep + ((360 - a.sweep) * p.tertiary!) / 100),
      drag: "P",
    };
    scene.points.Q = {
      ...scene.points.Q,
      ...circlePoint(
        b.start + b.sweep + ((360 - b.sweep) * p.qPosition!) / 100,
      ),
      drag: "Q",
    };
  }
  return scene;
}

export function dragReasonPoint(
  id: string,
  input: ReasonParameters,
  key: DragKey,
  point: Point,
): ReasonParameters {
  const p = normaliseReasonParameters(id, input),
    lab = reasonLab(id),
    target = fromFlowPoint(point);
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return p;
  const bearing = wrapAngle(
    (Math.atan2(target.y - CENTRE.y, target.x - CENTRE.x) * 180) / Math.PI,
  );
  if (lab === "semicircle" && (key === "A" || key === "B"))
    return normaliseReasonParameters(id, {
      ...p,
      rotation: wrapAngle(bearing - (key === "B" ? 180 : 0)),
    });
  if (lab === "segment" && (key === "P" || key === "Q")) {
    const end = 90 + p.primary / 2 + p.rotation!;
    return normaliseReasonParameters(id, {
      ...p,
      [key === "P" ? "tertiary" : "secondary"]: fractionOnArc(
        bearing,
        end,
        360 - p.primary,
      ),
    });
  }
  if (id === "r17" && (key === "P" || key === "Q")) {
    const arc = getReasonScene(id, p).arcs[key === "P" ? 0 : 1];
    return normaliseReasonParameters(id, {
      ...p,
      [key === "P" ? "tertiary" : "qPosition"]: fractionOnArc(
        bearing,
        arc.start + arc.sweep,
        360 - arc.sweep,
      ),
    });
  }
  const next: ReasonParameters = {
    ...p,
    ...dragParameter(
      lab,
      p,
      lab === "bisector" && key === "N" ? "primary" : key,
      target,
    ),
  };
  if (lab === "chords" && ["C", "D", "N", "secondary"].includes(key))
    next.primary = (p.primary < 0 ? -1 : 1) * Math.abs(next.secondary);
  if (lab === "equal-arcs" && ["C", "D", "secondary"].includes(key))
    next.primary = next.secondary;
  return normaliseReasonParameters(id, next);
}

export function reasonControls(id: string): Control[] {
  const lab = reasonLab(id),
    controls = getControls(lab);
  if (lab === "bisector")
    return controls
      .filter((c) => c.key !== "secondary")
      .map((c) =>
        c.key === "primary"
          ? { ...c, label: "Move the chord", min: -9.2, max: 9.2 }
          : c,
      );
  if (lab === "chords")
    return controls
      .filter((c) => c.key !== "secondary")
      .map((c) =>
        c.key === "primary"
          ? { ...c, label: "Shared chord offset from O", min: -9.2, max: 9.2 }
          : c,
      );
  if (lab === "semicircle")
    return controls
      .filter((c) => c.key !== "primary")
      .map((c) =>
        c.key === "secondary" ? { ...c, label: "Move C along its arc" } : c,
      );
  if (lab === "equal-arcs")
    return controls
      .filter((c) => c.key !== "secondary")
      .map((c) =>
        c.key === "primary"
          ? { ...c, label: "Change the matching arcs", max: 170 }
          : c,
      );
  if (lab === "segment")
    return controls.map((c) => (c.key === "primary" ? { ...c, max: 300 } : c));
  if (id === "r17")
    return [
      ...controls,
      {
        key: "tertiary",
        label: "Move P along its arc",
        min: 8,
        max: 92,
        step: 1,
        unit: "%",
      },
    ];
  return controls;
}

export function reasonMeasurements(
  id: string,
  input: ReasonParameters,
): { label: string; value: number; unit: string }[] {
  const p = normaliseReasonParameters(id, input),
    lab = reasonLab(id),
    scene = getReasonScene(id, p),
    s = scene.points;
  const length = (label: string, a: string, b: string) => ({
    label,
    value: distance(s[a], s[b]) / UNIT,
    unit: "cm",
  });
  const angle = (label: string, a: string, at: string, b: string) => ({
    label,
    value: angleAt(s[a], s[at], s[b]),
    unit: "°",
  });
  if (lab === "bisector")
    return [
      length("AN", "A", "N"),
      length("NB", "N", "B"),
      id === "r3"
        ? { label: "Angle between ℓ and AB", value: 90, unit: "°" }
        : angle("∠ONB", "O", "N", "B"),
    ];
  if (lab === "chords")
    return [
      length("AB", "A", "B"),
      length("CD", "C", "D"),
      length("OM", "O", "M"),
      length("ON", "O", "N"),
    ];
  if (lab === "centre")
    return [
      angle("∠APB", "A", "P", "B"),
      {
        label: "Matching ∠AOB",
        value: scene.arcs[0].sweep,
        unit: "°",
      },
    ];
  if (lab === "segment")
    return [angle("∠APB", "A", "P", "B"), angle("∠AQB", "A", "Q", "B")];
  if (lab === "semicircle")
    return [
      angle("∠ACB", "A", "P", "B"),
      length("AB", "A", "B"),
      { label: "Circle diameter", value: 20, unit: "cm" },
    ];
  const readings = [
    {
      label: id === "r17" ? "∠APB" : "∠AOB",
      value: id === "r17" ? angleAt(s.A, s.P, s.B) : p.primary,
      unit: "°",
    },
    {
      label: id === "r17" ? "∠CQD" : "∠COD",
      value: id === "r17" ? angleAt(s.C, s.Q, s.D) : p.secondary,
      unit: "°",
    },
    { label: "Arc AB", value: (Math.PI * p.primary) / 18, unit: "cm" },
    { label: "Arc CD", value: (Math.PI * p.secondary) / 18, unit: "cm" },
  ];
  if (lab === "equal-arcs")
    readings.push(length("AB", "A", "B"), length("CD", "C", "D"));
  if (lab === "ratios")
    readings.push(
      { label: "Arc ratio", value: p.primary / p.secondary, unit: "" },
      {
        label: "Angle ratio",
        value: readings[0].value / readings[1].value,
        unit: "",
      },
    );
  return readings;
}

export function reasonDragHint(id: string): string {
  const lab = reasonLab(id);
  if (lab === "bisector")
    return "Drag A or B to turn and resize the chord. Drag N to move the whole chord. Compare what changes and what stays unchanged.";
  if (lab === "chords")
    return "Drag a chord endpoint or its mid-point. The other chord adjusts to keep the given equality. Try different directions.";
  if (lab === "semicircle")
    return "Drag A or B to turn the construction; drag C around the circle. Watch the angle and the chord length.";
  if (lab === "segment")
    return "Drag A, B, P or Q. P and Q stay on the same side of AB. Compare their angles as you move them.";
  if (lab === "centre")
    return "Drag A, B or P. Move P to the other arc too, and follow the matching centre angle.";
  if (id === "r17")
    return "Drag A, B, C or D to change the arcs. Move P or Q along its allowed arc and compare the ratios.";
  return "Drag any endpoint to turn or resize its arc. Compare the angle and length measurements.";
}

export function reasonConstraint(id: string): string {
  return (
    (
      {
        r1: "Held: O is the centre and ON stays perpendicular to AB.",
        r2: "Held: O is the centre and N stays the mid-point of AB.",
        r3: "Held: line ℓ stays perpendicular to AB at its mid-point. The centre remains hidden until you reveal it.",
        r4: "Held: AB = CD in this circle; OM and ON are perpendicular distances.",
        r5: "Held: OM = ON and both distances are perpendicular to their chords.",
        r6: "Held: both angles stand on the same intercepted arc, which excludes P.",
        r7: "Held: P and Q stay on the circumference on the same side of AB.",
        r8: "Held: AB stays a diameter and C stays on the circumference.",
        r9: "Held: A, B and C stay on the circle and ∠ACB stays 90°. The centre remains hidden until you reveal it.",
        r10: "Held: the two minor centre angles are equal in this circle.",
        r11: "Held: the two minor arcs are equal in this circle.",
        r12: "Held: the two minor centre angles are equal in this circle.",
        r13: "Held: AB = CD in this circle; compare matching minor angles.",
        r14: "Held: AB = CD in this circle; compare minor arcs with minor arcs.",
        r15: "Held: the two minor arcs are equal in this circle.",
        r16: "Held: each centre angle follows its own selected arc in this circle.",
        r17: "Held: each circumference angle intercepts its own selected arc, excluding its vertex.",
      } as Record<string, string>
    )[id] ?? ""
  );
}
