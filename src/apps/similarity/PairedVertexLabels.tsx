import { Fragment } from "react";
import { centre } from "./geometry";
import type { Point } from "./types";
import styles from "./similarity.module.css";

/** One readable label above all overlapping copies, with each name in its shape's colour. */
export function PairedVertexLabels({
  groups,
  shapes,
  frame,
  fontSize = 24,
  showOrder = false,
}: {
  groups: number[][];
  shapes: { id: number; points: Point[]; colour: string }[];
  frame: { x: number; y: number; width: number; height: number };
  fontSize?: number;
  showOrder?: boolean;
}) {
  return groups.map((group) => {
    const members = group.map((id) => shapes.find((shape) => shape.id === id)!);
    const vertices = members[0].points.map((_, i) => ({
      ...centre(members.map((member) => member.points[i])),
      label: "",
    }));
    const mid = centre(vertices);
    return (
      <g key={group.join("-")} className={styles.pairedVertexLabels}>
        {vertices.map((p, i) => {
          const dx = p.x - mid.x,
            dy = p.y - mid.y;
          const length = Math.hypot(dx, dy) || 1;
          const names = members.map((member) => member.points[i].label);
          // Anchor the entire label outside the vertex, then keep it inside the board.
          const width =
            fontSize * (names.join(" ↔ ").length * 0.7 + (showOrder ? 0.5 : 0));
          const anchor =
            dx / length < -0.3 ? "end" : dx / length > 0.3 ? "start" : "middle";
          const left =
            anchor === "end" ? width : anchor === "middle" ? width / 2 : 0;
          const right = width - left;
          const x = Math.max(
            frame.x + left + 4,
            Math.min(
              frame.x + frame.width - right - 4,
              p.x + (fontSize * dx) / length,
            ),
          );
          const y = Math.max(
            frame.y + fontSize,
            Math.min(
              frame.y + frame.height - fontSize * 0.3,
              p.y + (fontSize * dy) / length + fontSize * 0.3,
            ),
          );
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              fontSize={fontSize}
              strokeWidth={fontSize / 5}
              data-testid="paired-vertex-label"
            >
              {members.map((member, j) => (
                <Fragment key={member.id}>
                  {j > 0 && (
                    <tspan fontStyle="normal" fill="var(--color-graphite)">
                      {" "}
                      ↔{" "}
                    </tspan>
                  )}
                  <tspan fill={member.colour}>{names[j]}</tspan>
                </Fragment>
              ))}
              {showOrder && (
                <tspan
                  fontSize={fontSize * 0.5}
                  baselineShift="super"
                  fill="var(--color-graphite)"
                >
                  {i + 1}
                </tspan>
              )}
            </text>
          );
        })}
      </g>
    );
  });
}
