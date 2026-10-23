import {
  placeAngleLabels,
  type AngleLabelPlacement,
} from "../similarity/angleLabels";
import {
  placeVertexLabels,
  type LabelBox,
  type VertexLabel,
} from "../similarity/vertexLabels";
import type { Point } from "../similarity/types";
import {
  evidenceGeometry,
  evidenceSymbol,
  type EvidenceMark,
  type EvidenceRow,
} from "./evidence";

export type EvidencePlacement = {
  id: string | number;
  points: Point[];
  /** Full source point inventory, which may contain disconnected figures. */
  sourceOnly?: boolean;
};
export type EvidenceLayoutMark = EvidenceMark & {
  layoutKey: string;
  names: string[];
  text: string;
  shape: Point[];
};
export type EvidenceLayout = {
  marks: EvidenceLayoutMark[];
  angles: Map<string, AngleLabelPlacement>;
  sides: Map<string, VertexLabel>;
  boxes: LabelBox[];
};

const centre = (points: Point[]) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const sideLabel = (names: string[], value?: string) =>
  `${names.join(" = ")}${value ? ` = ${value}` : ""}`;

/** One board-wide layout lets overlapping corresponding sides share a label
 * containing both names. Only members of an explicit equality can be merged. */
export function layoutEvidenceMarks(
  rows: readonly EvidenceRow[],
  source: readonly Point[],
  placements: readonly EvidencePlacement[],
  size = 1,
  reserved: LabelBox[] = [],
  angleNames = false,
): EvidenceLayout {
  const marks: EvidenceLayoutMark[] = [];
  for (const placement of placements)
    for (const mark of evidenceGeometry(rows, source, placement.points)) {
      const matching = marks.find((other) => {
        if (other.key !== mark.key || other.kind !== mark.kind) return false;
        const tolerance = mark.kind === "side" ? 11 * size : 1.5 * size;
        if (mark.kind === "angle")
          return (
            distance(other.points[1], mark.points[1]) < tolerance &&
            ((distance(other.points[0], mark.points[0]) < tolerance &&
              distance(other.points[2], mark.points[2]) < tolerance) ||
              (distance(other.points[0], mark.points[2]) < tolerance &&
                distance(other.points[2], mark.points[0]) < tolerance))
          );
        return (
          (distance(other.points[0], mark.points[0]) < tolerance &&
            distance(other.points[1], mark.points[1]) < tolerance) ||
          (distance(other.points[0], mark.points[1]) < tolerance &&
            distance(other.points[1], mark.points[0]) < tolerance)
        );
      });
      if (matching) {
        if (!matching.names.includes(mark.name)) matching.names.push(mark.name);
        if (matching.kind === "side")
          matching.text = sideLabel(matching.names, matching.value);
        continue;
      }
      marks.push({
        ...mark,
        layoutKey: `${placement.id}:${mark.memberKey}`,
        names: [mark.name],
        text:
          mark.kind === "angle"
            ? (mark.value ??
              (angleNames ? `∠${mark.name}` : evidenceSymbol(mark)))
            : sideLabel([mark.name], mark.value),
        shape: placement.points,
      });
    }
  // A later exact-value row may describe a corner/side already carrying its
  // earlier equality mark. Prefer the equality without stacking duplicate text.
  const visible = marks.filter(
    (mark) =>
      !marks.some((other) => {
        if (
          mark === other ||
          mark.kind !== other.kind ||
          mark.key === other.key
        )
          return false;
        const row = rows.find((row) => row.key === mark.key)!,
          otherRow = rows.find((row) => row.key === other.key)!;
        if (row.members.length !== 1 || otherRow.members.length <= 1)
          return false;
        if (mark.points.length !== other.points.length) return false;
        return (
          mark.points.every(
            (point, i) => distance(point, other.points[i]) < 0.1,
          ) ||
          mark.points.every(
            (point, i) =>
              distance(point, other.points[other.points.length - 1 - i]) < 0.1,
          )
        );
      }),
  );
  const polygons = placements
    .filter((placement) => !placement.sourceOnly)
    .map((placement) => placement.points);
  const vertices = placements.flatMap((placement) => placement.points);
  // Raster/clean source labels stay fixed when the movable overlays change.
  // Reserve their immediate neighbourhood before placing new value labels.
  const fixedSourceLabels = placements
    .filter((placement) => placement.sourceOnly)
    .flatMap((placement) =>
      placement.points.map((point) => ({
        x: point.x - 25 * size,
        y: point.y - 25 * size,
        width: 50 * size,
        height: 50 * size,
      })),
    );
  const obstacles = [...reserved, ...fixedSourceLabels];
  const sides = placeVertexLabels(
    visible
      .filter((mark) => mark.kind === "side")
      .map((mark) => {
        const mid = centre(mark.points),
          shapeMid = centre(mark.shape);
        return {
          key: mark.layoutKey,
          text: mark.text,
          point: { ...mid, label: "" },
          fontSize: 15 * size,
          preferred: { x: mid.x - shapeMid.x, y: mid.y - shapeMid.y },
        };
      }),
    polygons,
    obstacles,
  );
  const angles = placeAngleLabels(
    visible
      .filter((mark) => mark.kind === "angle")
      .map((mark) => ({
        key: mark.layoutKey,
        text: mark.text,
        vertex: mark.points[1],
        first: mark.points[0],
        last: mark.points[2],
        arcCount: ((mark.marker - 1) % 3) + 1,
        right: mark.degrees === 90,
      })),
    {
      size,
      fontSize: 17 * size,
      vertexFontSize: 23 * size,
      vertices,
      polygons,
      reserved: [...obstacles, ...sides.values()],
    },
  );
  return {
    marks: visible,
    angles,
    sides,
    boxes: [...sides.values(), ...angles.values()],
  };
}

/** Marks are computed from the placed points, so they follow rigid transforms;
 * SVG text remains upright. Pass a shared layout to include its boxes in Fit. */
export function EvidenceMarks({
  rows,
  source,
  placed,
  placements,
  hiddenKeys = new Set(),
  showAngles = true,
  showSides = true,
  size = 1,
  reserved,
  onToggle,
  hideLabel,
  current = false,
  currentKeys,
  layout: suppliedLayout,
}: {
  rows: readonly EvidenceRow[];
  source: readonly Point[];
  placed?: Point[];
  placements?: readonly EvidencePlacement[];
  hiddenKeys?: ReadonlySet<string>;
  showAngles?: boolean;
  showSides?: boolean;
  size?: number;
  reserved?: LabelBox[];
  onToggle?: (key: string) => void;
  hideLabel?: (row: EvidenceRow) => string;
  current?: boolean;
  currentKeys?: ReadonlySet<string>;
  layout?: EvidenceLayout;
}) {
  const visibleRows = rows.filter(
    (row) =>
      !hiddenKeys.has(row.key) &&
      (row.kind === "angle" ? showAngles : showSides),
  );
  const layout =
    suppliedLayout ??
    layoutEvidenceMarks(
      visibleRows,
      source,
      placements ?? [{ id: "figure", points: placed ?? [...source] }],
      size,
      reserved,
    );
  const visibleKeys = new Set(visibleRows.map((row) => row.key));
  return (
    <g pointerEvents="none" data-testid="congruence-evidence-marks">
      {layout.marks
        .filter((mark) => visibleKeys.has(mark.key))
        .map((mark) => {
          const highlighted = currentKeys ? currentKeys.has(mark.key) : current;
          const colour = highlighted ? "#a65d00" : "var(--color-graphite)";
          const row = visibleRows.find((row) => row.key === mark.key)!;
          const action = onToggle
            ? {
                role: "button" as const,
                tabIndex: 0,
                "aria-label": hideLabel?.(row),
                style: { cursor: "pointer" },
                onPointerDown: (event: React.PointerEvent<SVGGElement>) => {
                  event.stopPropagation();
                },
                onClick: (event: React.MouseEvent<SVGGElement>) => {
                  event.stopPropagation();
                  onToggle(mark.key);
                },
                onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggle(mark.key);
                  }
                },
              }
            : {};
          const label =
            mark.kind === "angle"
              ? layout.angles.get(mark.layoutKey)
              : layout.sides.get(mark.layoutKey);
          if (!label) return null;
          const shared = {
            fill: colour,
            stroke: "var(--color-paper)",
            strokeWidth: 4 * size,
            paintOrder: "stroke" as const,
            strokeLinejoin: "round" as const,
            textAnchor: "middle" as const,
          };
          if (mark.kind === "side") {
            const [a, b] = mark.points,
              mid = centre(mark.points);
            const length = Math.hypot(b.x - a.x, b.y - a.y) || 1,
              ux = (b.x - a.x) / length,
              uy = (b.y - a.y) / length;
            const count = ((mark.marker - 1) % 3) + 1;
            return (
              <g
                key={mark.layoutKey}
                data-evidence-key={mark.key}
                data-evidence-side={mark.names.join("=")}
                data-highlight-side={highlighted ? mark.name : undefined}
                pointerEvents="auto"
                {...action}
              >
                <title>{mark.text}</title>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={colour}
                  strokeWidth={highlighted ? 5 * size : 2.5 * size}
                  strokeOpacity={highlighted ? 0.7 : 0.4}
                />
                {Array.from({ length: count }, (_, i) => {
                  const offset = (i - (count - 1) / 2) * 5 * size;
                  const x = mid.x + ux * offset,
                    y = mid.y + uy * offset;
                  return (
                    <line
                      key={i}
                      data-testid="matching-side-tick"
                      x1={x - uy * 7 * size}
                      y1={y + ux * 7 * size}
                      x2={x + uy * 7 * size}
                      y2={y - ux * 7 * size}
                      stroke={colour}
                      strokeWidth={2.2 * size}
                    />
                  );
                })}
                <rect
                  x={label.x}
                  y={label.y}
                  width={label.width}
                  height={label.height}
                  fill="transparent"
                />
                <text
                  data-testid="evidence-side-label"
                  x={label.textX}
                  y={label.textY}
                  fontSize={15 * size}
                  {...shared}
                >
                  {mark.text}
                </text>
              </g>
            );
          }
          const angle = label as AngleLabelPlacement,
            vertex = mark.points[1];
          const at = (direction: number, r: number) => ({
            x: vertex.x + Math.cos(direction) * r,
            y: vertex.y + Math.sin(direction) * r,
          });
          const count = ((mark.marker - 1) % 3) + 1;
          const r = angle.radius * 0.65;
          const first = at(angle.start, r);
          // A true square establishes a stated right angle even when the source's
          // rounded tracing is not precisely perpendicular. Never draw a rhombus.
          const last = at(
            angle.start + (Math.sign(angle.turn || 1) * Math.PI) / 2,
            r,
          );
          const corner = {
            x: first.x + last.x - vertex.x,
            y: first.y + last.y - vertex.y,
          };
          return (
            <g
              key={mark.layoutKey}
              data-evidence-key={mark.key}
              data-evidence-angle={mark.names.join("=")}
              data-highlight-angle={highlighted ? mark.name : undefined}
              data-degrees={mark.degrees}
              pointerEvents="auto"
              {...action}
            >
              <title>{`${mark.names.map((name) => `∠${name}`).join(" = ")}${mark.value ? ` = ${mark.value}` : ""}`}</title>
              <rect
                x={label.x}
                y={label.y}
                width={label.width}
                height={label.height}
                fill="transparent"
              />
              {angle.leader && (
                <line
                  x1={angle.leader.from.x}
                  y1={angle.leader.from.y}
                  x2={angle.leader.to.x}
                  y2={angle.leader.to.y}
                  stroke={colour}
                  strokeWidth={size}
                />
              )}
              {mark.degrees === 90 ? (
                <path
                  data-testid="right-angle-mark"
                  d={`M${first.x},${first.y} L${corner.x},${corner.y} L${last.x},${last.y}`}
                  fill="none"
                  stroke={colour}
                  strokeWidth={2.4 * size}
                />
              ) : (
                Array.from({ length: count }, (_, i) => {
                  const radius = angle.radius + i * angle.arcGap,
                    from = at(angle.start, radius),
                    to = at(angle.start + angle.turn, radius);
                  return (
                    <path
                      key={i}
                      data-testid="matching-angle-arc"
                      d={`M${from.x},${from.y} A${radius},${radius} 0 0 ${angle.turn > 0 ? 1 : 0} ${to.x},${to.y}`}
                      fill="none"
                      stroke={colour}
                      strokeWidth={(highlighted ? 2.6 : 1.8) * size}
                    />
                  );
                })
              )}
              <text
                data-testid="evidence-angle-label"
                x={angle.textX}
                y={angle.textY}
                dominantBaseline="middle"
                fontSize={angle.fontSize}
                {...shared}
              >
                {mark.text}
              </text>
            </g>
          );
        })}
    </g>
  );
}
