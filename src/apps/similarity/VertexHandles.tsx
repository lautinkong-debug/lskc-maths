import type { PointerEvent } from "react";
import { copy } from "@/lib/copy";
import { centre, type Pose } from "./geometry";
import type { Point } from "./types";
import styles from "./similarity.module.css";

export function VertexHandles({
  points,
  colour,
  size = 1,
  prefix,
  onStart,
  pose,
  onChange,
}: {
  points: Point[];
  colour: string;
  size?: number;
  prefix: string;
  onStart: (event: PointerEvent<SVGGElement>, point: Point) => void;
  pose: Pose;
  onChange: (patch: Partial<Pose>) => void;
}) {
  const mid = centre(points);
  return (
    <g>
      <path
        d={`M${mid.x - 5 * size} ${mid.y}h${10 * size}M${mid.x} ${mid.y - 5 * size}v${10 * size}`}
        stroke={colour}
        strokeWidth={size}
        pointerEvents="none"
        opacity=".6"
      />
      {points.map((p) => (
        <g
          key={p.label}
          role="button"
          tabIndex={0}
          aria-label={`${copy.similarity.vertexHandle} ${p.label}`}
          className={styles.vertexHandle}
          data-testid={`${prefix}-vertex-${p.label}`}
          onPointerDown={(event) => {
            event.stopPropagation();
            onStart(event, p);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            const changes: Record<string, Partial<Pose>> = {
              ArrowLeft: { angle: pose.angle - 5 },
              ArrowRight: { angle: pose.angle + 5 },
              ArrowUp: { scale: Math.min(3, pose.scale * 1.05) },
              ArrowDown: { scale: Math.max(0.25, pose.scale / 1.05) },
            };
            if (changes[event.key]) {
              event.preventDefault();
              onChange(changes[event.key]);
            }
          }}
        >
          <title>{copy.similarity.vertexHelp}</title>
          <circle cx={p.x} cy={p.y} r={16 * size} fill="transparent" />
          <circle
            cx={p.x}
            cy={p.y}
            r={6 * size}
            fill="var(--color-paper)"
            stroke={colour}
            strokeWidth={2 * size}
            pointerEvents="none"
          />
          <circle
            cx={p.x}
            cy={p.y}
            r={2 * size}
            fill={colour}
            pointerEvents="none"
          />
        </g>
      ))}
    </g>
  );
}
