import { Fragment } from "react";
import { centre } from "./geometry";
import type { Point } from "./types";
import styles from "./similarity.module.css";
import { placeVertexLabels, type LabelBox } from "./vertexLabels";

/** One readable label above all overlapping copies, with each name in its shape's colour. */
export function PairedVertexLabels({
  groups,
  shapes,
  frame,
  fontSize = 24,
  showOrder = false,
  obstacles = [],
}: {
  groups: number[][];
  shapes: { id: number; points: Point[]; colour: string }[];
  frame: { x: number; y: number; width: number; height: number };
  fontSize?: number;
  showOrder?: boolean;
  obstacles?: LabelBox[];
}) {
  return groups.map((group) => {
    const members = group.map((id) => shapes.find((shape) => shape.id === id)!);
    const vertices = members[0].points.map((_, i) => ({
      ...centre(members.map((member) => member.points[i])),
      label: "",
    }));
    const mid = centre(vertices);
    const labels = placeVertexLabels(
      vertices.map((p, i) => ({
        key: String(i),
        point: p,
        text:
          members.map((member) => member.points[i].label).join(" ↔ ") +
          (showOrder ? "1" : ""),
        fontSize,
        preferred: { x: p.x - mid.x, y: p.y - mid.y },
      })),
      shapes.map((s) => s.points),
      obstacles,
      frame,
    );
    return (
      <g key={group.join("-")} className={styles.pairedVertexLabels}>
        {vertices.map((p, i) => {
          const names = members.map((member) => member.points[i].label);
          const label = labels.get(String(i))!;
          return (
            <text
              key={i}
              x={label.textX}
              y={label.textY}
              textAnchor="middle"
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
