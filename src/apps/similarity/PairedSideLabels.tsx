import { Fragment, useState, type PointerEvent } from "react";
import { copy } from "@/lib/copy";
import { markColours } from "./ReasonMarks";
import { useMarkAction } from "./useMarkAction";
import type { PairedSideLabel } from "./pairedSides";
import styles from "./similarity.module.css";

export function PairedSideLabels({
  labels,
  onHide,
  onMoveStart,
}: {
  labels: PairedSideLabel[];
  onHide: (id: string) => void;
  onMoveStart: (event: PointerEvent<SVGGElement>) => void;
}) {
  // Keep the captured element mounted until release when moving apart removes the overlay.
  const [dragLabels, setDragLabels] = useState<PairedSideLabel[]>([]);
  const action = useMarkAction(onHide, (event) => {
    setDragLabels(labels);
    onMoveStart(event);
  });
  const release = () => setDragLabels([]);
  return (
    <g
      data-testid="paired-side-labels"
      opacity={labels.length ? 1 : 0}
      pointerEvents={labels.length ? "auto" : "none"}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {(labels.length ? labels : dragLabels).map((l) => (
        <g
          key={l.row.id}
          data-testid="paired-side-label"
          data-side={l.row.id}
          {...action(l.row.id, `${copy.similarity.hideSide} ${l.text}`)}
        >
          <line
            x1={l.mid.x}
            y1={l.mid.y}
            x2={Math.max(l.x, Math.min(l.x + l.width, l.mid.x))}
            y2={Math.max(l.y, Math.min(l.y + l.height, l.mid.y))}
            stroke={markColours[l.row.index % 3]}
            strokeWidth={1.4 * l.size}
          />
          <rect
            x={l.x}
            y={l.y}
            width={l.width}
            height={l.height}
            rx={6 * l.size}
            fill="var(--color-paper)"
            stroke="var(--color-grid)"
            strokeWidth={l.size}
          />
          <text
            x={l.x + l.width / 2}
            y={l.y + 21 * l.size}
            textAnchor="middle"
            fontSize={17 * l.size}
            className={styles.pairedSideText}
          >
            {l.names.map((name, i) => (
              <Fragment key={i}>
                {i > 0 && <tspan fill="var(--color-graphite)"> ↔ </tspan>}
                <tspan fill={l.colours[i]}>
                  <tspan fontStyle="italic">{name}</tspan>
                  {l.values?.[i] ? ` = ${l.values[i]}` : ""}
                </tspan>
              </Fragment>
            ))}
            <tspan
              x={l.x + l.width / 2}
              dy={21 * l.size}
              fontSize={15 * l.size}
              fill={markColours[l.row.index % 3]}
            >
              {copy.similarity.sideRatio} {l.ratio}
            </tspan>
          </text>
        </g>
      ))}
    </g>
  );
}
