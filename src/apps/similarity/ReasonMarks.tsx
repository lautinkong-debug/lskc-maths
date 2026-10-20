import { centre, signedArea } from "./geometry";
import type { Point } from "./types";
import type { Condition } from "./reasons";
import styles from "./similarity.module.css";
import { copy } from "@/lib/copy";
import type { PointerEvent } from "react";
import { useMarkAction } from "./useMarkAction";
import { placeAngleLabels } from "./angleLabels";
import type { LabelBox } from "./vertexLabels";

export const markColours = [
  "var(--color-navy)",
  "var(--color-crimson)",
  "var(--color-graphite)",
];
const letters = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ"];

/** Shared with canvas fitting so external labels stay inside the visible frame. */
export function layoutReasonAngles(
  points: Point[],
  rows: Condition[],
  size = 1,
  reserved?: LabelBox[],
) {
  const n = points.length;
  const direction = signedArea(points) >= 0 ? -1 : 1;
  return placeAngleLabels(
    rows
      .filter((row) => row.kind === "angle")
      .map((row) => {
        const vertex = points[row.index],
          first = points[(row.index + n - 1) % n],
          last = points[(row.index + 1) % n];
        const start = Math.atan2(first.y - vertex.y, first.x - vertex.x);
        const turn = Math.atan2(last.y - vertex.y, last.x - vertex.x) - start;
        return {
          key: row.id,
          vertex,
          first,
          last,
          text:
            row.degrees !== undefined
              ? `${row.degrees}°`
              : String(letters[row.index] ?? row.index + 1),
          arcCount: (row.index % 3) + 1,
          right: row.degrees === 90,
          turn:
            direction < 0
              ? -(((-turn % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
              : ((turn % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
        };
      }),
    { size, vertices: points, polygons: [points], reserved },
  );
}

/** Proof marks move with the vertices, but their labels remain upright. */
export function ReasonMarks({
  points,
  rows,
  member,
  size = 1,
  showSideLabels = true,
  reserved,
  onHide,
  onMoveStart,
}: {
  points: Point[];
  rows: Condition[];
  member: number;
  size?: number;
  showSideLabels?: boolean;
  reserved?: LabelBox[];
  onHide?: (id: string) => void;
  onMoveStart?: (event: PointerEvent<SVGGElement>) => void;
}) {
  const action = useMarkAction(onHide, onMoveStart);
  const mid = centre(points);
  const direction = signedArea(points) >= 0 ? -1 : 1;
  const angleLabels = layoutReasonAngles(points, rows, size, reserved);
  return (
    <g pointerEvents="none" data-testid="reason-marks">
      {rows.map((row) => {
        const colour = markColours[row.index % 3];
        if (row.kind === "side" && row.edge) {
          const a = points[row.edge[0]],
            b = points[row.edge[1]];
          const dx = (a.x + b.x) / 2 - mid.x,
            dy = (a.y + b.y) / 2 - mid.y;
          const d = Math.hypot(dx, dy) || 1;
          const x = (a.x + b.x) / 2 + (dx / d) * 19 * size;
          const y = (a.y + b.y) / 2 + (dy / d) * 19 * size;
          return (
            <g key={row.id} data-condition={row.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-paper)"
                strokeWidth={8 * size}
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={colour}
                strokeWidth={4 * size}
                strokeDasharray={
                  row.index % 3 === 1 ? `${8 * size} ${3 * size}` : undefined
                }
              />
              {showSideLabels && (
                <g
                  pointerEvents="auto"
                  {...action(
                    row.id,
                    `${copy.similarity.hideSide} ${a.label}${b.label}`,
                  )}
                >
                  <rect
                    x={x - 29 * size}
                    y={y - 12 * size}
                    width={58 * size}
                    height={24 * size}
                    fill="transparent"
                  />
                  <text
                    x={x}
                    y={y}
                    dy=".35em"
                    textAnchor="middle"
                    fill={colour}
                    fontSize={15 * size}
                    className={styles.markLabel}
                  >
                    {`${a.label}${b.label}${row.values?.[member] ? `=${row.values[member]}` : ""}`}
                  </text>
                </g>
              )}
            </g>
          );
        }
        const p = points[row.index],
          label = angleLabels.get(row.id);
        if (!label) return null;
        const { start, turn, radius, arcGap } = label;
        const at = (angle: number, r: number) => ({
          x: p.x + Math.cos(angle) * r,
          y: p.y + Math.sin(angle) * r,
        });
        const u = at(start, radius),
          v = at(start + turn, radius);
        const cornerRadius = radius * 0.65;
        const cornerA = at(start, cornerRadius),
          cornerB = at(start + turn, cornerRadius);
        const corner = {
          x: cornerA.x + cornerB.x - p.x,
          y: cornerA.y + cornerB.y - p.y,
        };
        return (
          <g
            key={row.id}
            data-condition={row.id}
            data-vertex={p.label}
            data-degrees={row.degrees}
            pointerEvents="auto"
            {...action(row.id, `${copy.similarity.hideAngleAt} ${p.label}`)}
          >
            <rect
              x={label.x}
              y={label.y}
              width={label.width}
              height={label.height}
              fill="transparent"
            />
            {label.leader && (
              <line
                data-testid="angle-label-leader"
                x1={label.leader.from.x}
                y1={label.leader.from.y}
                x2={label.leader.to.x}
                y2={label.leader.to.y}
                stroke={colour}
                strokeWidth={1.25 * size}
                strokeOpacity={0.7}
              />
            )}
            {row.degrees === 90 ? (
              <path
                data-testid="right-angle-mark"
                d={`M${cornerA.x},${cornerA.y} L${corner.x},${corner.y} L${cornerB.x},${cornerB.y}`}
                fill="none"
                stroke={colour}
                strokeWidth={2.4 * size}
              />
            ) : (
              Array.from({ length: (row.index % 3) + 1 }, (_, arc) => {
                const r = radius + arc * arcGap,
                  from = arc ? at(start, r) : u,
                  to = arc ? at(start + turn, r) : v;
                return (
                  <path
                    key={arc}
                    data-testid="matching-angle-arc"
                    d={`M${from.x},${from.y} A${r},${r} 0 ${Math.abs(turn) > Math.PI ? 1 : 0} ${direction > 0 ? 1 : 0} ${to.x},${to.y}`}
                    fill="none"
                    stroke={colour}
                    strokeWidth={1.8 * size}
                  />
                );
              })
            )}
            <text
              data-testid="angle-label"
              data-label-x={label.x}
              data-label-y={label.y}
              data-label-width={label.width}
              data-label-height={label.height}
              x={label.textX}
              y={label.textY}
              dominantBaseline="middle"
              textAnchor="middle"
              fill={colour}
              fontSize={label.fontSize}
              style={{ strokeWidth: 4 * size }}
              className={styles.markLabel}
            >
              {row.degrees !== undefined
                ? `${row.degrees}°`
                : (letters[row.index] ?? row.index + 1)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
