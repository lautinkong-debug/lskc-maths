/**
 * One small drawing language for every static diagram in the Learn path.
 * Angles are in degrees, anticlockwise from east, as in a maths lesson.
 * A figure lists its parts once; each lesson step only changes their tones.
 */
export type Pt = { x: number; y: number };

export const CENTRE: Pt = { x: 200, y: 180 };
export const RADIUS = 130;
export const VIEW_BOX = "0 0 400 360";

const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** A point on the circle (or on a circle of another radius about O). */
export const on = (degrees: number, radius = RADIUS): Pt => ({
  x: CENTRE.x + radius * Math.cos(rad(degrees)),
  y: CENTRE.y - radius * Math.sin(rad(degrees)),
});
export const mid = (a: Pt, b: Pt): Pt => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
/** The point a fraction t of the way from a to b; t may lie outside 0–1. */
export const along = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
/** Foot of the perpendicular from p to the line through a and b. */
export function foot(p: Pt, a: Pt, b: Pt): Pt {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  return along(a, b, t);
}
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
/** Direction of b seen from a, in the same degrees as `on`. */
export const bearing = (a: Pt, b: Pt) =>
  (Math.atan2(-(b.y - a.y), b.x - a.x) * 180) / Math.PI;
/** The angle at v between the rays to a and b, from 0° to 180°. */
export function angleAt(a: Pt, v: Pt, b: Pt) {
  const turn = Math.abs(bearing(v, a) - bearing(v, b)) % 360;
  return turn > 180 ? 360 - turn : turn;
}
/** Rotate p about the centre, anticlockwise. */
export function spin(p: Pt, degrees: number): Pt {
  const dx = p.x - CENTRE.x,
    dy = -(p.y - CENTRE.y);
  const c = Math.cos(rad(degrees)),
    s = Math.sin(rad(degrees));
  return { x: CENTRE.x + dx * c - dy * s, y: CENTRE.y - (dx * s + dy * c) };
}

/** off: hidden. base: pencil. given: blue. get: green. aux: a dashed helper line. */
export type Tone = "off" | "base" | "given" | "get" | "aux";

type Common = {
  id: string;
  /** Parts in the turning group rotate together when a step sets `turn`. */
  turning?: boolean;
};
export type El = Common &
  (
    | { t: "circle"; r?: number }
    | { t: "seg"; a: Pt; b: Pt; dash?: boolean }
    | { t: "arc"; from: number; to: number; r?: number }
    | {
        t: "ang";
        a: Pt;
        v: Pt;
        b: Pt;
        r?: number;
        label?: string;
        /** Distance of the label from the vertex. */
        lr?: number;
        reflex?: boolean;
        /** Draw two arcs, to tell a second pair of equal angles apart. */
        twice?: boolean;
      }
    | { t: "sq"; a: Pt; v: Pt; b: Pt }
    | { t: "tick"; a: Pt; b: Pt; n?: 1 | 2 | 3 }
    | { t: "tri"; pts: Pt[] }
    | { t: "dot"; p: Pt }
    | {
        t: "txt";
        p: Pt;
        text: string;
        dx?: number;
        dy?: number;
        size?: number;
      }
  );

export type Tones = Record<string, Tone>;
export type Figure = {
  els: El[];
  /** Tones before any step. Parts not listed are hidden. */
  tones: Tones;
  /** One sentence for screen readers. */
  alt: string;
};

/** A point with its dot and its name, the commonest pair of parts. */
export function point(
  name: string,
  p: Pt,
  dx = 0,
  dy = 0,
  turning = false,
): El[] {
  // Push the name away from the centre unless the caller places it.
  const away = dist(p, CENTRE) || 1;
  const ox = dx || dy ? dx : ((p.x - CENTRE.x) / away) * 18;
  const oy = dx || dy ? dy : ((p.y - CENTRE.y) / away) * 18;
  return [
    { id: `pt-${name}`, t: "dot", p, turning },
    { id: `nm-${name}`, t: "txt", p, text: name, dx: ox, dy: oy + 7, turning },
  ];
}
/** The centre O with its name just below-right. */
export const centre = (dx = 12, dy = 14): El[] => point("O", CENTRE, dx, dy);

/** Every listed id at one tone. */
export const tone = (ids: string[], value: Tone): Tones =>
  Object.fromEntries(ids.map((id) => [id, value]));

/** Names for `pt-X` and `nm-X` together. */
export const pts = (...names: string[]) =>
  names.flatMap((name) => [`pt-${name}`, `nm-${name}`]);

/** The ids that a figure can show. Used by the content tests. */
export const figureIds = (figure: Figure) =>
  new Set(figure.els.map((el) => el.id));
