import { useId, type Ref } from "react";
import { copy } from "@/lib/copy";
import { stepsFor } from "./lesson";
import { WaterTank } from "./WaterTank";
import { baseCalculations } from "./baseWorking";
import { lateralCalculation } from "./lateralWorking";
import { totalCalculation } from "./totalWorking";
import {
  boundaries,
  boundaryEdges,
  edgeScale,
  faces,
  givenFacts,
  geometryMetrics,
  number,
  teachingLines,
  unfoldBoundary,
} from "./geometry";
import type {
  CubeGeometry,
  Boundary,
  Point,
  PrismGeometry,
  SurfaceQuestion,
  SurfaceVariant,
} from "./types";

const c = copy.surfaceArea;
const navy = "var(--color-navy)",
  ink = "var(--color-graphite)",
  gold = "var(--color-highlight)";
const palette = [
  "var(--color-navy-soft)",
  "var(--color-grid)",
  "var(--color-navy-wash)",
  "var(--color-silver)",
];
type Box = { x: number; y: number; w: number; h: number };
type ShapeProps = {
  variant: SurfaceVariant;
  progress: number;
  box: Box;
  selected: number | null;
  dimensions: boolean;
  labels: boolean;
  caps: boolean;
  solved: boolean;
  revealWaterDepth?: boolean;
  labelBounds?: Box;
  onSelect?: (i: number) => void;
};
type LabelSpec = {
  p: Point;
  text: string;
  size?: number;
  anchor?: "middle" | "start" | "end";
};
function labelBox({ p, text, size = 21, anchor = "middle" }: LabelSpec): Box {
  const w = text.length * size * 0.66 + 6;
  return {
    x: p.x - (anchor === "start" ? 3 : anchor === "end" ? w - 3 : w / 2),
    y: p.y - size - 3,
    w,
    h: size * 1.3 + 6,
  };
}
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
type FlatWidthLabel = { face: number; x: number; text: string };
function dimensionLanes(items: FlatWidthLabel[]) {
  const ordered = [...items].sort((a, b) => a.x - b.x);
  for (let rows = 1; rows <= Math.max(1, ordered.length); rows++) {
    const ends = Array(rows).fill(-Infinity) as number[];
    const placements = ordered.map((item, i) => ({ ...item, row: i % rows }));
    const fits = placements.every((item) => {
      const box = labelBox({ p: { x: item.x, y: 0 }, text: item.text });
      if (box.x < ends[item.row] + 8) return false;
      ends[item.row] = box.x + box.w;
      return true;
    });
    if (fits) return { rows, placements };
  }
  return {
    rows: ordered.length,
    placements: ordered.map((item, row) => ({ ...item, row })),
  };
}
const poly = (points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(" ");
export function needsLegend(variant: SurfaceVariant) {
  if (variant.geometry.kind === "cubes") return false;
  const fs = faces(variant);
  const scale = Math.min(
    580 / fs.reduce((s, f) => s + f.length, 0),
    250 / variant.geometry.height,
  );
  return fs.length > 6 || Math.min(...fs.map((f) => f.length)) * scale < 55;
}
function fitter(points: Point[], box: Box) {
  const x0 = Math.min(...points.map((p) => p.x)),
    x1 = Math.max(...points.map((p) => p.x));
  const y0 = Math.min(...points.map((p) => p.y)),
    y1 = Math.max(...points.map((p) => p.y));
  const s = Math.min(
    box.w / Math.max(x1 - x0, 0.001),
    box.h / Math.max(y1 - y0, 0.001),
  );
  return (p: Point) => ({
    x: box.x + (box.w - (x1 - x0) * s) / 2 + (p.x - x0) * s,
    y: box.y + (box.h - (y1 - y0) * s) / 2 + (p.y - y0) * s,
  });
}
function Label({
  p,
  text,
  size = 21,
  anchor = "middle",
}: {
  p: Point;
  text: string;
  size?: number;
  anchor?: "middle" | "start" | "end";
}) {
  return (
    <text
      x={p.x}
      y={p.y}
      textAnchor={anchor}
      fontSize={size}
      fill={ink}
      stroke="white"
      strokeWidth="5"
      paintOrder="stroke"
      pointerEvents="none"
    >
      {text}
    </text>
  );
}
/** Mark genuine convex right angles, never angles in schematic bases. */
function RightAngles({
  boundary,
  at,
}: {
  boundary: Boundary;
  at: (p: Point) => Point;
}) {
  const ps = boundary.points;
  const orientation = Math.sign(
    ps.reduce((sum, p, i) => {
      const q = ps[(i + 1) % ps.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0),
  );
  return (
    <g fill="none" stroke={navy} strokeWidth="1.3" pointerEvents="none">
      {ps.map((p, i) => {
        const prev = ps[(i + ps.length - 1) % ps.length],
          next = ps[(i + 1) % ps.length];
        const a = { x: prev.x - p.x, y: prev.y - p.y },
          b = { x: next.x - p.x, y: next.y - p.y };
        if (
          Math.abs(a.x * b.x + a.y * b.y) > 1e-7 ||
          (a.x * b.y - a.y * b.x) * orientation >= 0
        )
          return null;
        const q = at(p),
          ap = at(prev),
          bp = at(next),
          al = Math.hypot(ap.x - q.x, ap.y - q.y),
          bl = Math.hypot(bp.x - q.x, bp.y - q.y);
        const size = Math.min(9, al / 5, bl / 5),
          u = { x: ((ap.x - q.x) / al) * size, y: ((ap.y - q.y) / al) * size },
          v = { x: ((bp.x - q.x) / bl) * size, y: ((bp.y - q.y) / bl) * size };
        return (
          <path
            key={i}
            d={`M${q.x + u.x},${q.y + u.y} l${v.x},${v.y} l${-u.x},${-u.y}`}
          />
        );
      })}
    </g>
  );
}
function Prism({
  variant,
  progress,
  box,
  selected,
  dimensions,
  labels,
  caps,
  solved,
  revealWaterDepth = false,
  labelBounds,
  onSelect,
}: ShapeProps) {
  const g = variant.geometry as PrismGeometry;
  const scale = edgeScale(g),
    fs = faces(variant, solved),
    bs = boundaries(g);
  // Keep the projection direction consistent as the boundary hinges open.
  // Fit each view uniformly inside the stationary teaching canvas.
  // At the endpoint the width is horizontal and H is vertical: a rectangle.
  const project = (p: Point, z: number) => ({
    x: p.x - 0.55 * p.y,
    y: -0.45 * p.y - z,
  });
  const loopsAt = (amount: number) =>
    bs.map((boundary, ring) => {
      const offset = bs
        .slice(0, ring)
        .reduce(
          (sum, previous) =>
            sum +
            boundaryEdges(previous).reduce(
              (total, length) => total + length,
              0,
            ) *
              scale +
            Math.max(g.height * 0.3, 2),
          0,
        );
      const chain = unfoldBoundary(boundary, amount, scale).map((p) => ({
        x: p.x + boundary.points[0].x * scale * (1 - amount) + offset * amount,
        y: p.y + boundary.points[0].y * scale * (1 - amount),
      }));
      return {
        chain,
        b: chain.map((p) => project(p, 0)),
        t: chain.map((p) => project(p, g.height)),
      };
    });
  const loops = loopsAt(progress);
  // Make room for individual widths below the strip, without changing its
  // proportions or jumping in size at the final slider position.
  const bounds = labelBounds ?? {
    x: Math.max(10, box.x - 40),
    y: Math.max(70, box.y - 35),
    w: box.w + 150,
    h: box.h + 80,
  };
  const flatLoops = loopsAt(1);
  const flatPoints = flatLoops.flatMap((loop) => [...loop.b, ...loop.t]);
  const lanePlan = (at: (p: Point) => Point) =>
    dimensionLanes(
      fs
        .filter((face) => face.label)
        .map((face) => {
          const loop = flatLoops[face.ring].b,
            a = at(loop[face.edge]),
            b = at(loop[face.edge + 1]);
          return { face: face.index, x: (a.x + b.x) / 2, text: face.label };
        }),
    );
  let flatHeight = box.h;
  for (let attempt = 0; attempt < 6; attempt++) {
    const at = fitter(flatPoints, { ...box, h: flatHeight });
    const rows = lanePlan(at).rows;
    const bottom = Math.max(...flatPoints.map((p) => at(p).y));
    const band = rows * 34 + 20;
    if (!fs.some((face) => face.label) || bottom + band <= bounds.y + bounds.h)
      break;
    const next = Math.max(
      45,
      Math.min(flatHeight, bounds.y + bounds.h - box.y - band),
    );
    if (next === flatHeight) break;
    flatHeight = next;
  }
  const fit = fitter(
    loops.flatMap((loop) => [...loop.b, ...loop.t]),
    { ...box, h: box.h + (flatHeight - box.h) * progress },
  );
  const mapped = loops.map((loop) => ({
    b: loop.b.map(fit),
    t: loop.t.map(fit),
  }));
  const capPath = (top: boolean) =>
    mapped
      .map((loop) => `M${poly((top ? loop.t : loop.b).slice(0, -1))}Z`)
      .join(" ");
  const folded = progress < 0.001,
    flat = progress > 0.999;
  const capCount = g.baseCount || (variant.target === "lateral" ? 2 : 0);
  const faceViews = fs
    .map((face) => {
      const loop = mapped[face.ring],
        i = face.edge;
      const points = [loop.b[i], loop.b[i + 1], loop.t[i + 1], loop.t[i]];
      const a = loops[face.ring].chain[i],
        b = loops[face.ring].chain[i + 1];
      const visible = loop.b[i + 1].x - loop.b[i].x > 0.1;
      return {
        face,
        points,
        visible,
        depth: (-0.55 * (a.x + b.x)) / 2 - (a.y + b.y) / 2,
      };
    })
    .sort((a, b) => a.depth - b.depth);
  const all = mapped.flatMap((loop) =>
    loop.b.map((b, i) => ({ b, t: loop.t[i] })),
  );
  const heightEdge = all.reduce(
    (best, edge) => (edge.b.x > best.b.x ? edge : best),
    all[0],
  );
  const heightName = g.water
    ? "H"
    : (g.heightName?.length ?? 0) <= 3
      ? (g.heightName ?? "H")
      : "H";
  const revealHeight = solved || Boolean(g.water && revealWaterDepth);
  const heightValue =
    !revealHeight && g.water
      ? variant.target === "increase"
        ? "Δd"
        : "d"
      : !revealHeight && g.heightLabel
        ? g.heightLabel
        : `${number(g.height)} ${variant.unit}`;
  const heightText =
    heightValue === heightName ? heightName : `${heightName} = ${heightValue}`;
  const occupied: Box[] = [];
  const reserve = (label: LabelSpec) => occupied.push(labelBox(label));
  // Dimensions stay outside the flat faces so small panels remain visible.
  if (flat) {
    faceViews.forEach(({ points }) => {
      const xs = points.map((p) => p.x),
        ys = points.map((p) => p.y);
      occupied.push({
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      });
    });
  }
  if (labels) {
    faceViews.forEach(({ points, visible, face }) => {
      if (
        (folded && !visible) ||
        Math.abs(points[1].x - points[0].x) <= 24 ||
        Math.abs(points[3].y - points[0].y) <= 32
      )
        return;
      reserve({
        p: {
          x: points.reduce((sum, p) => sum + p.x, 0) / 4,
          y: points.reduce((sum, p) => sum + p.y, 0) / 4 + 7,
        },
        text: face.omitted ? "×" : String(face.index + 1),
        size: 22,
      });
    });
    if (folded)
      bs.forEach((boundary, ring) => {
        if (!boundary.vertexNames) return;
        const vertices = mapped[ring].t.slice(0, -1);
        const centre = {
          x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
          y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length,
        };
        vertices.forEach((point, i) =>
          reserve({
            p: {
              x: point.x + (point.x < centre.x ? -15 : 15),
              y: point.y + (point.y < centre.y ? -12 : 22),
            },
            text: boundary.vertexNames![i],
            size: 19,
          }),
        );
      });
  }
  if (folded && caps && dimensions && !g.schematic)
    bs.forEach((boundary) => {
      boundary.measurements?.forEach((measurement) => {
        const a = fit(
            project(
              { x: measurement.a.x * scale, y: measurement.a.y * scale },
              g.height,
            ),
          ),
          b = fit(
            project(
              { x: measurement.b.x * scale, y: measurement.b.y * scale },
              g.height,
            ),
          );
        reserve({
          p: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 10 },
          text: measurement.label,
          size: 18,
        });
      });
    });
  if (dimensions) {
    wrap(heightText, box.w < 350 ? 12 : 16).forEach((text, i, lines) =>
      reserve({
        p: {
          x: heightEdge.b.x + 38,
          y:
            (heightEdge.b.y + heightEdge.t.y) / 2 +
            7 +
            (i - (lines.length - 1) / 2) * 24,
        },
        text,
        anchor: "start",
      }),
    );
    if (flat)
      mapped.forEach((loop, ring) => {
        const p = loop.t[0],
          q = loop.t.at(-1)!;
        const text = g.omittedEdges?.length
          ? c.missingStrip
          : g.perimeterGiven !== undefined
            ? `P = ${number(g.perimeterGiven)} ${variant.unit}`
            : ring
              ? c.innerBoundary
              : g.holes?.length
                ? c.outerBoundary
                : c.basePerimeter;
        const lines = wrap(
          text,
          Math.max(8, Math.floor(Math.abs(q.x - p.x) / 12)),
        );
        lines.forEach((text, i) =>
          reserve({
            p: {
              x: (p.x + q.x) / 2,
              y: p.y - 34 - (lines.length - 1 - i) * 26,
            },
            text,
            size: 22,
          }),
        );
      });
  }
  // Width labels belong below the flat panels, never above the P bracket.
  const labelTop = flat
    ? Math.max(
        bounds.y,
        ...mapped.flatMap((loop) => loop.b.map((p) => p.y + 8)),
      )
    : bounds.y;
  const annotationBounds = {
    ...bounds,
    y: labelTop,
    h: bounds.y + bounds.h - labelTop,
  };
  const annotationPoints = mapped.map((loop) => (flat ? loop.b : loop.t));
  const annotations: { p: Point; from: Point; text: string; face: number }[] =
    [];
  const flatLanePlan = flat ? lanePlan(fit) : null;
  const stripBottom = Math.max(
    ...mapped.flatMap((loop) => loop.b.map((p) => p.y)),
  );
  fs.forEach((face) => {
    if (!dimensions || !face.label) return;
    const loop = annotationPoints[face.ring],
      p = loop[face.edge],
      q = loop[face.edge + 1];
    const d = { x: q.x - p.x, y: q.y - p.y },
      length = Math.hypot(d.x, d.y);
    if (length < 0.01) return;
    const from = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    if (flatLanePlan) {
      const lane = flatLanePlan.placements.find(
        (item) => item.face === face.index,
      )!;
      annotations.push({
        from,
        p: { x: from.x, y: stripBottom + 32 + lane.row * 34 },
        text: face.label,
        face: face.index,
      });
      return;
    }
    const preferred = {
      x: from.x + (flat ? 0 : -d.y / length) * 28,
      y: from.y + (flat ? 1 : d.x / length) * 28 + 7,
    };
    const fits = (p: Point) => {
      const rect = labelBox({ p, text: face.label });
      return (
        rect.x >= annotationBounds.x &&
        rect.y >= annotationBounds.y &&
        rect.x + rect.w <= annotationBounds.x + annotationBounds.w &&
        rect.y + rect.h <= annotationBounds.y + annotationBounds.h &&
        !occupied.some((other) => overlaps(rect, other))
      );
    };
    let position = preferred;
    if (!fits(position)) {
      let best = Infinity;
      for (
        let y = annotationBounds.y + 25;
        y < annotationBounds.y + annotationBounds.h - 8;
        y += 12
      )
        for (
          let x = annotationBounds.x + 25;
          x < annotationBounds.x + annotationBounds.w - 25;
          x += 12
        ) {
          const p = { x, y };
          if (!fits(p)) continue;
          const score = Math.hypot(x - preferred.x, y - preferred.y);
          if (score < best) {
            best = score;
            position = p;
          }
        }
    }
    reserve({ p: position, text: face.label });
    annotations.push({ p: position, from, text: face.label, face: face.index });
  });
  return (
    <g data-projection="parallel" data-unfold={progress}>
      {folded && caps && capCount > 0 && (
        <path
          d={capPath(false)}
          fill={gold}
          fillRule="evenodd"
          stroke={navy}
          strokeWidth="1.4"
          strokeDasharray="6 5"
        />
      )}
      {faceViews.map(({ face, points, visible }) => {
        const active = selected === face.index;
        const mid = {
          x: points.reduce((sum, p) => sum + p.x, 0) / 4,
          y: points.reduce((sum, p) => sum + p.y, 0) / 4 + 7,
        };
        const width = Math.abs(points[1].x - points[0].x);
        const height = Math.abs(points[3].y - points[0].y);
        return (
          <g
            key={face.index}
            data-face={face.index}
            data-omitted={face.omitted || undefined}
            data-visible={!folded || visible}
          >
            <polygon
              points={poly(points)}
              fill={
                face.omitted
                  ? "none"
                  : active
                    ? gold
                    : g.water
                      ? variant.target === "increase"
                        ? "#f2ce50"
                        : "#46a9d4"
                      : palette[face.index % palette.length]
              }
              fillOpacity="1"
              stroke={face.omitted ? "var(--color-pencil)" : navy}
              strokeWidth={active ? 3 : 1.7}
              strokeDasharray={
                face.omitted || (folded && !visible) ? "6 5" : undefined
              }
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${face.name}${face.label ? `: ${face.label}` : ""}${face.omitted ? ` · ${c.opening}` : ""}`}
              aria-pressed={onSelect ? active : undefined}
              onClick={() => onSelect?.(face.index)}
              onKeyDown={(event) => {
                if (onSelect && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelect(face.index);
                }
              }}
              style={{ cursor: onSelect ? "pointer" : undefined }}
            />
            {labels && (!folded || visible) && width > 24 && height > 32 && (
              <Label
                p={mid}
                text={face.omitted ? "×" : String(face.index + 1)}
                size={22}
              />
            )}
          </g>
        );
      })}
      {folded && caps && capCount > 1 && (
        <path
          d={capPath(true)}
          fill={gold}
          fillRule="evenodd"
          stroke={navy}
          strokeWidth="2"
        />
      )}
      {folded &&
        labels &&
        bs.map((boundary, ring) => {
          if (!boundary.vertexNames) return null;
          const vertices = mapped[ring].t.slice(0, -1);
          const centre = {
            x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
            y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length,
          };
          return vertices.map((point, index) => (
            <Label
              key={`${ring}-vertex-${index}`}
              p={{
                x: point.x + (point.x < centre.x ? -15 : 15),
                y: point.y + (point.y < centre.y ? -12 : 22),
              }}
              text={boundary.vertexNames![index]}
              size={19}
            />
          ));
        })}
      {folded &&
        caps &&
        dimensions &&
        !g.schematic &&
        bs.map((boundary, ring) => {
          const at = (p: Point) =>
            fit(project({ x: p.x * scale, y: p.y * scale }, g.height));
          return (
            <g key={ring}>
              {boundary.measurements?.map((measurement, i) => {
                const a = at(measurement.a),
                  b = at(measurement.b);
                return (
                  <g key={i}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={navy}
                      strokeDasharray="4 3"
                    />
                    <Label
                      p={{ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 10 }}
                      text={measurement.label}
                      size={18}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      {selected !== null &&
        fs[selected] &&
        (() => {
          const face = fs[selected],
            loop = annotationPoints[face.ring],
            p = loop[face.edge],
            q = loop[face.edge + 1];
          const view = faceViews.find((item) => item.face.index === selected)!;
          return (
            <g pointerEvents="none">
              {folded && !view.visible && (
                <polygon
                  points={poly(view.points)}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="3"
                  strokeDasharray="7 5"
                />
              )}
              <line
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="var(--color-gold)"
                strokeWidth="5"
              />
            </g>
          );
        })()}
      {annotations.map((annotation, i) => {
        // Keep leaders vertical and leave gaps around text on earlier lanes.
        const end = annotation.p.y - (flat ? 25 : 7);
        const segments: [number, number][] = [];
        if (flat) {
          let cursor = annotation.from.y;
          const blockers = annotations
            .filter((other) => other !== annotation)
            .map(labelBox)
            .filter(
              (rect) =>
                annotation.from.x >= rect.x - 2 &&
                annotation.from.x <= rect.x + rect.w + 2,
            )
            .sort((a, b) => a.y - b.y);
          blockers.forEach((rect) => {
            const top = Math.max(annotation.from.y, rect.y - 2),
              bottom = Math.min(end, rect.y + rect.h + 2);
            if (bottom <= cursor || top >= end) return;
            if (top > cursor) segments.push([cursor, top]);
            cursor = Math.max(cursor, bottom);
          });
          if (cursor < end) segments.push([cursor, end]);
        } else segments.push([annotation.from.y, end]);
        return (
          <g
            key={`dimension-${i}`}
            data-dimension-label="true"
            data-dimension-face={annotation.face}
          >
            {segments.map(([start, end], j) => (
              <line
                key={j}
                x1={annotation.from.x}
                y1={start}
                x2={annotation.p.x}
                y2={end}
                stroke="var(--color-pencil)"
                strokeWidth="1"
              />
            ))}
            <Label p={annotation.p} text={annotation.text} size={21} />
          </g>
        );
      })}
      {dimensions && (
        <g>
          <path
            d={`M${heightEdge.b.x + 14},${heightEdge.b.y} h10 V${heightEdge.t.y} h-10`}
            fill="none"
            stroke={navy}
            strokeWidth="1.5"
          />
          {wrap(heightText, box.w < 350 ? 12 : 16).map((line, i, lines) => (
            <Label
              key={i}
              p={{
                x: heightEdge.b.x + 38,
                y:
                  (heightEdge.b.y + heightEdge.t.y) / 2 +
                  7 +
                  (i - (lines.length - 1) / 2) * 24,
              }}
              text={line}
              size={21}
              anchor="start"
            />
          ))}
        </g>
      )}
      {flat &&
        dimensions &&
        mapped.map((loop, ring) => {
          const p = loop.t[0],
            q = loop.t.at(-1)!;
          const text = g.omittedEdges?.length
            ? c.missingStrip
            : g.perimeterGiven !== undefined
              ? `P = ${number(g.perimeterGiven)} ${variant.unit}`
              : ring
                ? c.innerBoundary
                : g.holes?.length
                  ? c.outerBoundary
                  : c.basePerimeter;
          const captionLines = wrap(
            text,
            Math.max(8, Math.floor(Math.abs(q.x - p.x) / 12)),
          );
          return (
            <g key={ring} data-boundary-caption={ring}>
              <path
                d={`M${p.x},${p.y - 12} v-10 H${q.x} v10`}
                fill="none"
                stroke={navy}
                strokeWidth="1.7"
              />
              {captionLines.map((line, i) => (
                <Label
                  key={i}
                  p={{
                    x: (p.x + q.x) / 2,
                    y: p.y - 34 - (captionLines.length - 1 - i) * 26,
                  }}
                  text={line}
                  size={22}
                />
              ))}
            </g>
          );
        })}
      {folded && !caps && (
        <line
          x1={mapped[0].b[0].x}
          y1={mapped[0].b[0].y}
          x2={mapped[0].t[0].x}
          y2={mapped[0].t[0].y}
          stroke="var(--color-crimson)"
          strokeWidth="3"
          strokeDasharray="7 5"
        />
      )}
    </g>
  );
}
function Cubes({
  variant,
  progress,
  box,
  selected,
  dimensions,
  labels,
  onSelect,
}: ShapeProps) {
  const g = variant.geometry as CubeGeometry;
  if (progress > 0.99) {
    const nets = g.cubes.map((cube, i) => ({
      x: g.cubes.slice(0, i).reduce((sum, c) => sum + c.side * 4 + 3, 0),
      side: cube.side,
    }));
    const cursor = g.cubes.reduce((sum, cube) => sum + cube.side * 4 + 3, 0);
    const maxSide = Math.max(...g.cubes.map((c) => c.side));
    const fit = fitter(
      [
        { x: 0, y: 0 },
        { x: cursor - 3, y: maxSide * 3 },
      ],
      box,
    );
    return (
      <g>
        {nets.map((n, ci) => {
          const cells = [
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
            [1, 0],
            [1, 2],
          ];
          return (
            <g key={ci}>
              {cells.map(([x, y], j) => {
                const a = fit({ x: n.x + x * n.side, y: y * n.side }),
                  b = fit({ x: n.x + (x + 1) * n.side, y: (y + 1) * n.side }),
                  i = ci * 6 + j;
                const contact = g.contacts.filter(
                  (c) =>
                    c.cubes[j === 4 ? 0 : 1] === ci && (j === 4 || j === 5),
                );
                return (
                  <g key={j} data-face={i}>
                    <rect
                      x={a.x}
                      y={a.y}
                      width={b.x - a.x}
                      height={b.y - a.y}
                      fill={selected === i ? gold : palette[ci % 4]}
                      stroke={navy}
                      role={onSelect ? "button" : undefined}
                      tabIndex={onSelect ? 0 : undefined}
                      aria-label={`${number(n.side)} ${variant.unit} cube, face ${j + 1}`}
                      aria-pressed={onSelect ? selected === i : undefined}
                      onClick={() => onSelect?.(i)}
                      onKeyDown={(e) => {
                        if (onSelect && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelect(i);
                        }
                      }}
                    />
                    {contact.map((c, k) => {
                      const width = ((b.x - a.x) * Math.sqrt(c.area)) / n.side;
                      return (
                        <rect
                          key={k}
                          x={a.x + (b.x - a.x - width) / 2}
                          y={a.y + (b.y - a.y - width) / 2}
                          width={width}
                          height={width}
                          fill="white"
                          stroke="var(--color-crimson)"
                          strokeDasharray="4 3"
                        />
                      );
                    })}
                    {labels && (
                      <Label
                        p={{ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 5 }}
                        text={String(j + 1)}
                        size={15}
                      />
                    )}
                  </g>
                );
              })}
              {dimensions && (
                <Label
                  p={{ x: fit({ x: n.x + 2 * n.side, y: 0 }).x, y: box.y - 20 }}
                  text={`${number(n.side)} ${variant.unit} ${c.cube}`}
                  size={21}
                />
              )}
            </g>
          );
        })}
      </g>
    );
  }
  const project = ([x, y, z]: number[]) => ({
    x: x - 0.55 * y,
    y: -0.28 * (x + y) - z,
  });
  const cubes = g.cubes.map((cube, ci) => {
    const separate = g.cubes
      .slice(0, ci)
      .reduce((sum, previous) => sum + previous.side + 3, 0);
    const s = cube.side,
      [ox, oy, oz] = cube.origin;
    const x = ox * (1 - progress) + separate * progress,
      y = oy * (1 - progress),
      z = oz * (1 - progress);
    const vertices = [
      [x, y, z],
      [x + s, y, z],
      [x + s, y + s, z],
      [x, y + s, z],
      [x, y, z + s],
      [x + s, y, z + s],
      [x + s, y + s, z + s],
      [x, y + s, z + s],
    ].map(project);
    return { vertices, side: s };
  });
  const fit = fitter(
    cubes.flatMap((c) => c.vertices),
    box,
  );
  return (
    <g>
      {cubes.map((cube, ci) => {
        const points = cube.vertices.map(fit);
        return (
          <g key={ci}>
            {[
              [0, 1, 5, 4],
              [3, 0, 4, 7],
              [4, 5, 6, 7],
            ].map((ids, j) => {
              const i = ci * 6 + [0, 3, 4][j];
              return (
                <polygon
                  key={j}
                  data-face={i}
                  points={poly(ids.map((k) => points[k]))}
                  fill={selected === i ? gold : palette[(ci + j) % 4]}
                  stroke={navy}
                  strokeWidth="1.8"
                  role={onSelect ? "button" : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-label={`${number(cube.side)} ${variant.unit} cube, face ${[1, 4, 5][j]}`}
                  aria-pressed={onSelect ? selected === i : undefined}
                  onClick={() => onSelect?.(i)}
                  onKeyDown={(e) => {
                    if (onSelect && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSelect(i);
                    }
                  }}
                />
              );
            })}
            {dimensions && (
              <Label
                p={{
                  x: (points[0].x + points[1].x) / 2,
                  y: (points[0].y + points[1].y) / 2 + 25,
                }}
                text={`${number(cube.side)} ${variant.unit}`}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
function Shape(props: ShapeProps) {
  if (
    props.variant.geometry.kind === "prism" &&
    props.variant.geometry.water &&
    props.progress < 0.001 &&
    props.caps
  )
    return <WaterTank {...props} />;
  return props.variant.geometry.kind === "cubes" ? (
    <Cubes {...props} />
  ) : (
    <Prism {...props} />
  );
}

function Base({
  variant,
  box,
  dimensions,
  solved,
}: {
  variant: SurfaceVariant;
  box: Box;
  dimensions: boolean;
  solved: boolean;
}) {
  const g = variant.geometry as PrismGeometry,
    bs = boundaries(g),
    fit = fitter(
      bs.flatMap((b) => b.points.map((p) => ({ x: p.x, y: -p.y }))),
      box,
    ),
    at = (p: Point) => fit({ x: p.x, y: -p.y });
  const path = bs.map((b) => `M${poly(b.points.map(at))}Z`).join(" ");
  return (
    <g>
      <path
        d={path}
        fill={g.water ? "#46a9d4" : gold}
        fillOpacity=".5"
        fillRule="evenodd"
        stroke={navy}
        strokeWidth="2"
      />
      <g data-base-caption="true">
        <Label
          p={{ x: box.x + box.w / 2, y: box.y + box.h + 60 }}
          text={"B"}
          size={24}
        />
      </g>
      {dimensions &&
        !g.schematic &&
        bs.map((b, i) => <RightAngles key={i} boundary={b} at={at} />)}
      {dimensions &&
        bs.map((b, ri) => (
          <g key={ri}>
            {b.points.length <= 6 &&
              !g.schematic &&
              b.points.map((p, i) => {
                if (g.holes?.length && i !== 0) return null;
                const q = b.points[(i + 1) % b.points.length],
                  a = at(p),
                  z = at(q),
                  d = { x: z.x - a.x, y: z.y - a.y },
                  length = Math.hypot(d.x, d.y);
                const provided = b.edgeLabels?.[i];
                const text =
                  provided === "" && (!solved || g.omittedEdges?.includes(i))
                    ? ""
                    : !solved && provided
                      ? provided
                      : `${number(Math.hypot(q.x - p.x, q.y - p.y))} ${variant.unit}`;
                return text ? (
                  <Label
                    key={i}
                    p={{
                      x: (a.x + z.x) / 2 - (d.y / length) * 21,
                      y: (a.y + z.y) / 2 + (d.x / length) * 21 + 5,
                    }}
                    text={text}
                    size={18}
                  />
                ) : null;
              })}
            {b.measurements?.map((m, i) => {
              const a = at(m.a),
                z = at(m.b);
              return (
                <g key={`m-${i}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={z.x}
                    y2={z.y}
                    stroke={navy}
                    strokeDasharray="4 3"
                  />
                  <Label
                    p={{ x: (a.x + z.x) / 2 + 8, y: (a.y + z.y) / 2 - 6 }}
                    text={m.label}
                    size={18}
                  />
                </g>
              );
            })}
          </g>
        ))}
    </g>
  );
}

export function OriginalPrism({
  variant,
  selectedFace,
  showFaces,
  onSelectFace,
  solved = false,
}: {
  variant: SurfaceVariant;
  selectedFace: number | null;
  showDimensions: boolean;
  showFaces: boolean;
  onSelectFace?: (i: number) => void;
  solved?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 440 310"
      role="group"
      aria-label={c.original}
      style={{
        display: "block",
        width: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Shape
        variant={variant}
        progress={0}
        box={{ x: 70, y: 45, w: 270, h: 195 }}
        selected={selectedFace}
        dimensions={false}
        labels={showFaces}
        caps
        solved={solved}
        onSelect={onSelectFace}
      />
    </svg>
  );
}

export type BankDiagramProps = {
  question: SurfaceQuestion;
  variant: SurfaceVariant;
  stage: number;
  unfold: number;
  selectedFace: number | null;
  showDimensions: boolean;
  showFaces: boolean;
  showWorking?: boolean;
  revealDimensions?: boolean;
  revealWaterDepth?: boolean;
  comparison?: boolean;
  revealBasePerimeter?: boolean;
  revealBaseArea?: boolean;
  showPerimeterWorking?: boolean;
  showBaseAreaWorking?: boolean;
  showLateralWorking?: boolean;
  showTotalWorking?: boolean;
  showFinalAnswer?: boolean;
  compact?: boolean;
  onSelectFace?: (i: number) => void;
  svgRef?: Ref<SVGSVGElement>;
};
const wrap = (line: string, max = 65) => {
  const words = line
      .replace(/(\d+(?:\.\d+)?)\s+(cm|mm|m)(?=[^a-zA-Z]|$)/g, "$1\u0000$2")
      .split(/\s+/)
      .map((word) => word.replaceAll("\u0000", " ")),
    lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    if (current.length + word.length + 1 > max) {
      lines.push(current);
      current = word;
    } else current += (current ? " " : "") + word;
  });
  if (current) lines.push(current);
  return lines;
};
export default function BankDiagram({
  question,
  variant,
  stage,
  unfold,
  selectedFace,
  showDimensions,
  showFaces,
  showWorking = false,
  revealDimensions = false,
  revealWaterDepth = false,
  revealBasePerimeter = false,
  revealBaseArea = false,
  showPerimeterWorking = false,
  showBaseAreaWorking = false,
  showLateralWorking = false,
  showTotalWorking = false,
  showFinalAnswer = false,
  comparison = false,
  compact = false,
  onSelectFace,
  svgRef,
}: BankDiagramProps) {
  const id = useId(),
    g = variant.geometry,
    solved =
      showFinalAnswer && (revealDimensions || (showWorking && stage === 4));
  const total = totalCalculation(variant, {
    revealBasePerimeter,
    revealBaseArea,
    revealWaterDepth,
  });
  const lines = (
    showWorking
      ? stage === 4 && !showFinalAnswer
        ? total.lines
        : teachingLines(variant, stage)
      : []
  ).flatMap((s) => wrap(s));
  const notes = showWorking && solved && variant.note ? wrap(variant.note) : [];
  const facts = [
    ...(showDimensions ? givenFacts(variant) : []),
    ...(g.kind === "prism" && g.schematic ? [c.schematic] : []),
    ...(question.id === "activity-9-3" ? [c.illustrative] : []),
  ].flatMap((fact) => wrap(fact));
  const baseCount = g.kind === "prism" ? g.baseCount : 0;
  const live = Boolean(onSelectFace);
  const baseY = comparison ? 1010 : live ? (compact ? 390 : 90) : 470;
  const diagramHeight = comparison
    ? (stage === 2 || stage === 4) && baseCount
      ? 1230
      : 970
    : live
      ? compact
        ? 620
        : 450
      : 690;
  const width = live && compact ? 500 : 800;
  const stackedWorking = live && compact;
  const calculationWidth = stackedWorking ? width - 40 : width / 2 - 40;
  const calculations = baseCalculations(variant);
  const workingCards = [
    {
      key: "perimeter",
      title: c.perimeterWorking,
      show: showPerimeterWorking,
      lines: calculations.perimeter,
    },
    {
      key: "area",
      title: c.baseAreaWorking,
      show: showBaseAreaWorking,
      lines: calculations.area,
    },
  ].map((item) => {
    const lines = item.lines.flatMap((line) =>
      wrap(line, Math.floor((calculationWidth - 24) / 12.4)),
    );
    return { ...item, lines, height: 42 + lines.length * 25 };
  });
  // Reserve both calculations while hidden to keep the shape and controls stationary.
  const valuesBottom =
    diagramHeight +
    (g.kind === "prism" ? (g.omittedEdges?.length ? 108 : 80) : 0);
  const lateralY =
    valuesBottom +
    (g.kind === "prism"
      ? stackedWorking
        ? workingCards.reduce((sum, card) => sum + card.height + 12, 0)
        : Math.max(...workingCards.map((card) => card.height)) + 12
      : 0);
  const lateral = lateralCalculation(variant, {
    revealBasePerimeter,
    revealWaterDepth,
  });
  const wrapLateral = (lines: string[]) =>
    lines.flatMap((line) => wrap(line, Math.floor((width - 64) / 12.4)));
  const lateralLines = wrapLateral(lateral.lines);
  // A value reveal can change the formula's length, so reserve the largest state.
  const lateralHeight =
    42 +
    25 *
      Math.max(
        ...[false, true].flatMap((perimeter) =>
          [false, true].map(
            (depth) =>
              wrapLateral(
                lateralCalculation(variant, {
                  revealBasePerimeter: perimeter,
                  revealWaterDepth: depth,
                }).lines,
              ).length,
          ),
        ),
      );
  const totalY = lateralY + (g.kind === "prism" ? lateralHeight + 12 : 0);
  const totalLines = wrapLateral(total.lines);
  const totalHeight =
    72 +
    25 *
      Math.max(
        ...[false, true].flatMap((perimeter) =>
          [false, true].flatMap((area) =>
            [false, true].map(
              (depth) =>
                wrapLateral(
                  totalCalculation(variant, {
                    revealBasePerimeter: perimeter,
                    revealBaseArea: area,
                    revealWaterDepth: depth,
                  }).lines,
                ).length,
            ),
          ),
        ),
      );
  const bodyHeight = totalY + totalHeight + 12;
  const metrics = g.kind === "prism" ? geometryMetrics(g) : null;
  const perimeterValue = metrics ? number(metrics.perimeter) : "";
  const perimeterRelation =
    metrics && Math.abs(metrics.perimeter - Number(perimeterValue)) > 1e-8
      ? "≈"
      : "=";
  const legend =
    showDimensions && needsLegend(variant)
      ? wrap(
          faces(variant, solved)
            .filter((f) => f.label)
            .map(
              (f) =>
                `${f.index + 1}: ${f.label}${f.omitted ? " (opening)" : ""}`,
            )
            .join(" · "),
          70,
        )
      : [];
  const figureBottom =
    bodyHeight +
    (live ? 0 : (legend.length + facts.length) * 25 + (facts.length ? 12 : 0));
  const height =
    figureBottom +
    (lines.length ? lines.length * 31 + 45 : 0) +
    (notes.length ? notes.length * 25 + 28 : 0) +
    (live ? 0 : 35);
  const baseWidth = live && !compact ? 100 : compact && live ? 130 : 180;
  const baseHeight = live && !compact ? 85 : 105;
  const firstBaseX =
    live && !compact
      ? 650
      : baseCount === 1
        ? (width - baseWidth) / 2
        : compact && live
          ? 60
          : 140;
  const secondBaseX = live && !compact ? 650 : compact && live ? 310 : 490;
  const secondBaseY = live && !compact ? 290 : baseY;
  const shapeProps = {
    variant,
    selected: selectedFace,
    dimensions: showDimensions,
    labels: showFaces,
    solved,
    revealWaterDepth,
  };
  const title = stepsFor(variant)[stage].title;
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="group"
      aria-label={`${question.label}, ${variant.label}`}
      data-testid="surface-diagram"
      data-question={question.id}
      data-solved={solved || undefined}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <title id={id}>
        {question.label}: {variant.label}
      </title>
      <rect width={width} height={height} fill="white" />
      {!live && (
        <text x="35" y="38" fill={navy} fontSize="23" fontWeight="700">
          {/^Q\d/.test(question.label)
            ? `${question.section} · ${question.label}`
            : question.label}{" "}
          · p. 9.{question.page}
        </text>
      )}
      {comparison ? (
        <>
          <text x="35" y="82" fill={ink} fontSize="25">
            {g.kind === "cubes" ? c.originalSolid : c.original}
          </text>
          <Shape
            {...shapeProps}
            progress={0}
            box={{ x: 75, y: 150, w: 510, h: 245 }}
            labelBounds={{ x: 20, y: 110, w: 760, h: 325 }}
            caps
          />
          <path d="M35 465 H765" stroke="var(--color-grid)" />
          <text x="35" y="510" fill={ink} fontSize="25">
            {g.kind === "cubes" ? c.separateFaces : c.strip}
          </text>
          <Shape
            {...shapeProps}
            progress={1}
            box={{ x: 70, y: 620, w: 510, h: 240 }}
            labelBounds={{ x: 20, y: 550, w: 760, h: 370 }}
            caps={false}
          />
        </>
      ) : (
        <>
          <text
            x="35"
            y={live ? 45 : 85}
            fill={ink}
            fontSize="26"
            fontWeight="600"
          >
            {title}
          </text>
          <Shape
            {...shapeProps}
            progress={unfold}
            labelBounds={{
              x: 20,
              y: live ? 70 : 110,
              w:
                live && !compact && (stage === 2 || stage === 4)
                  ? 590
                  : width - 40,
              h: live
                ? compact
                  ? stage === 2 || stage === 4
                    ? 250
                    : 500
                  : stage === 2
                    ? 325
                    : 360
                : stage === 2
                  ? 305
                  : 325,
            }}
            box={{
              x: live && compact ? 50 : 60,
              y: live ? 105 : 150,
              w: live
                ? compact
                  ? 290
                  : stage === 2 || stage === 4
                    ? 400
                    : 510
                : 510,
              h: live
                ? compact
                  ? stage < 2
                    ? 350
                    : stage === 3
                      ? 280
                      : 190
                  : stage < 2
                    ? 290
                    : 230
                : 235,
            }}
            caps={stage < 2}
            onSelect={onSelectFace}
          />
          {stage === 2 &&
            g.kind === "prism" &&
            !g.schematic &&
            question.id !== "activity-9-3" && (
              <text
                x={live && compact ? 250 : 400}
                y={live ? (compact ? 345 : 425) : 440}
                textAnchor="middle"
                fontSize="20"
                fill={navy}
              >
                {c.detached}
                {unfold === 0 ? ` · ${c.seam}` : ""}
              </text>
            )}
        </>
      )}
      {(stage === 2 || stage === 4) && baseCount > 0 && (
        <g>
          {stage === 4 && (
            <text
              data-base-operator="true"
              x={
                live && !compact
                  ? 620
                  : compact && live
                    ? 30
                    : baseCount === 1
                      ? 245
                      : 80
              }
              y={live && !compact ? 250 : baseY + 65}
              textAnchor="middle"
              fontSize="30"
              fill={navy}
            >
              +
            </text>
          )}
          <Base
            variant={variant}
            box={{ x: firstBaseX, y: baseY, w: baseWidth, h: baseHeight }}
            dimensions={showDimensions && stage === 4}
            solved={solved}
          />
          {baseCount === 2 && (
            <>
              <text
                data-base-operator="true"
                x={live && !compact ? 705 : compact && live ? 250 : 400}
                y={live && !compact ? 278 : baseY + 65}
                textAnchor="middle"
                fontSize="30"
                fill={navy}
              >
                +
              </text>
              <Base
                variant={variant}
                box={{
                  x: secondBaseX,
                  y: secondBaseY,
                  w: baseWidth,
                  h: baseHeight,
                }}
                dimensions={showDimensions && stage === 4}
                solved={solved}
              />
            </>
          )}
        </g>
      )}
      {g.kind === "prism" && metrics && showDimensions && (
        <g data-base-values="true">
          {[
            {
              show: revealBasePerimeter,
              key: "perimeter",
              label: g.holes?.length ? c.allBaseBoundaries : c.basePerimeter,
              value: `P ${perimeterRelation} ${perimeterValue} ${variant.unit}`,
            },
            {
              show: revealBaseArea,
              key: "area",
              label: g.baseCount === 0 ? c.excludedBaseArea : c.oneBaseArea,
              value: variant.baseWorking
                ? `B = ${number(g.baseArea)} ${variant.unit}²`
                : c.baseAreaNotGiven,
            },
          ].map((item, i) =>
            item.show ? (
              <g key={item.key} data-base-value={item.key}>
                <rect
                  x={20 + (i * width) / 2}
                  y={diagramHeight + 4}
                  width={width / 2 - 40}
                  height={56}
                  rx={5}
                  fill="var(--color-navy-wash)"
                />
                <text
                  x={32 + (i * width) / 2}
                  y={diagramHeight + 23}
                  fontSize={15}
                  fill={navy}
                >
                  {item.label}
                </text>
                <text
                  x={32 + (i * width) / 2}
                  y={diagramHeight + 48}
                  fontSize={22}
                  fontWeight={600}
                  fill={navy}
                >
                  {item.value}
                </text>
              </g>
            ) : null,
          )}
          {revealBasePerimeter && Boolean(g.omittedEdges?.length) && (
            <text
              data-retained-widths="true"
              x={32}
              y={diagramHeight + 78}
              fontSize={14}
              fill={navy}
            >
              {c.retainedWidths} = {number(metrics.includedPerimeter)}{" "}
              {variant.unit} ({c.openingExcluded})
            </text>
          )}
        </g>
      )}
      {g.kind === "prism" &&
        showDimensions &&
        workingCards.map((card, i) => {
          const x = stackedWorking ? 20 : 20 + (i * width) / 2;
          const y =
            valuesBottom +
            (stackedWorking && i ? workingCards[0].height + 12 : 0);
          return card.show ? (
            <g key={card.key} data-base-working={card.key} fill={ink}>
              <rect
                x={x}
                y={y}
                width={calculationWidth}
                height={card.height}
                rx={5}
                fill="var(--color-navy-wash)"
              />
              <text x={x + 12} y={y + 22} fontSize={15} fill={navy}>
                {card.title}
              </text>
              {card.lines.map((line, j) => (
                <text key={j} x={x + 12} y={y + 49 + j * 25} fontSize={20}>
                  {line}{" "}
                </text>
              ))}
            </g>
          ) : null;
        })}
      {g.kind === "prism" && showDimensions && showLateralWorking && (
        <g data-lateral-working="true" fill={ink}>
          <rect
            x={20}
            y={lateralY}
            width={width - 40}
            height={lateralHeight}
            rx={5}
            fill="var(--color-navy-wash)"
          />
          <text x={32} y={lateralY + 22} fontSize={15} fill={navy}>
            {lateral.title}
          </text>
          {lateralLines.map((line, i) => (
            <text key={i} x={32} y={lateralY + 49 + i * 25} fontSize={20}>
              {line}{" "}
            </text>
          ))}
        </g>
      )}
      {showTotalWorking && showDimensions && (
        <g data-total-working="true" fill={ink}>
          <rect
            x={20}
            y={totalY}
            width={width - 40}
            height={totalHeight}
            rx={5}
            fill="var(--color-navy-wash)"
          />
          <text x={32} y={totalY + 22} fontSize={15} fill={navy}>
            {total.title}
          </text>
          {totalLines.map((line, i) => (
            <text key={i} x={32} y={totalY + 49 + i * 25} fontSize={20}>
              {line}{" "}
            </text>
          ))}
        </g>
      )}
      {showFinalAnswer && (
        <g data-final-answer="true" fill={navy}>
          <rect
            x={20}
            y={totalY + totalHeight - 40}
            width={width - 40}
            height={40}
            rx={5}
            fill="var(--color-navy-wash)"
          />
          <text
            x={32}
            y={totalY + totalHeight - 12}
            fontSize={22}
            fontWeight={600}
          >
            {c.finalAnswer}: {total.answer}
          </text>
        </g>
      )}
      {!live &&
        legend.map((line, i) => (
          <text
            key={`legend-${i}`}
            x="35"
            y={bodyHeight + i * 25}
            fontSize="18"
            fill={ink}
          >
            {line}
          </text>
        ))}
      {!live &&
        facts.map((line, i) => (
          <text
            key={`given-${i}`}
            x="35"
            y={bodyHeight + legend.length * 25 + 12 + i * 25}
            fontSize="18"
            fill={ink}
          >
            {line}
          </text>
        ))}
      {lines.length > 0 && (
        <g data-export-working="true" fill={ink} fontSize="23">
          <path d={`M35 ${figureBottom + 5} H765`} stroke="var(--color-grid)" />
          {lines.map((line, i) => (
            <text key={`${i}-${line}`} x="35" y={figureBottom + 43 + i * 31}>
              {line}
            </text>
          ))}
        </g>
      )}
      {notes.map((line, i) => (
        <text
          key={`note-${i}`}
          x="35"
          y={figureBottom + lines.length * 31 + 65 + i * 25}
          fontSize="18"
          fill={ink}
        >
          {line}
        </text>
      ))}
    </svg>
  );
}
