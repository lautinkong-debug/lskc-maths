import { equalAngleReference, stepGeometry } from "./stepGeometry";
import type { Point } from "./types";
import type { TextbookStep } from "./textbook-types";
import {
  correspondenceHighlights,
  correspondenceLabelKey,
  layoutCorrespondenceLabels,
  matchesTriangle,
  type CorrespondencePair,
} from "./correspondence";
import type { AngleLabelPlacement } from "./angleLabels";

/** Focus overlays never receive pointer input or alter a triangle's pose. */
export function StepHighlights({
  step,
  source,
  placed,
  size = 1,
  context = "copy",
  rightAngles = [],
  correspondencePair,
  hiddenTriangles,
  angleLabels,
}: {
  step?: TextbookStep;
  source: Point[];
  placed?: Point[];
  size?: number;
  context?: string;
  rightAngles?: string[];
  correspondencePair?: CorrespondencePair;
  hiddenTriangles?: string[];
  angleLabels?: Map<string, AngleLabelPlacement>;
}) {
  if (!step) return null;
  const highlights = correspondencePair
    ? correspondenceHighlights(
        correspondencePair,
        placed?.map((p) => p.label),
        hiddenTriangles,
      )
    : step.highlights;
  const geometry = stepGeometry(highlights, source, placed);
  const labels = correspondencePair
    ? (angleLabels ??
      layoutCorrespondenceLabels(
        correspondencePair,
        source,
        placed
          ? [placed]
          : correspondencePair.members.map((m) =>
              [...m.triangle].map((v) => source.find((p) => p.label === v)!),
            ),
        size,
        undefined,
        rightAngles,
      ))
    : undefined;
  const path = (ps: Point[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
  const colour = "#a65d00";
  return (
    <g
      pointerEvents="none"
      data-testid="step-highlights"
      data-context={context}
      stroke={colour}
      strokeWidth={3 * size}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {geometry.figures.map(({ name, points }) => (
        <polygon
          key={`f-${name}`}
          data-highlight-figure={name}
          points={path(points)}
          fill="#ffcb62"
          fillOpacity=".2"
          strokeDasharray={`${7 * size} ${4 * size}`}
        />
      ))}
      {geometry.sides.map(({ name, points }) => (
        <g key={`s-${name}`} data-highlight-side={name}>
          <polyline
            points={path(points)}
            fill="none"
            stroke="#ffcb62"
            strokeWidth={10 * size}
            strokeOpacity=".6"
          />
          <polyline points={path(points)} fill="none" />
        </g>
      ))}
      {geometry.angles.map(({ name, points: [a, v, b] }) => {
        const member = correspondencePair?.members.find(
          (m) =>
            m.name === name &&
            (!placed ||
              matchesTriangle(
                m.triangle,
                placed.map((p) => p.label),
              )),
        );
        const label = member
          ? labels?.get(correspondenceLabelKey(member.triangle, name))
          : undefined;
        const right = rightAngles.some((other) =>
          equalAngleReference(name, other, source),
        );
        let start = Math.atan2(a.y - v.y, a.x - v.x);
        let delta = Math.atan2(b.y - v.y, b.x - v.x) - start;
        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        if (delta < 0) {
          start += delta;
          delta = -delta;
        }
        const radius = Math.min(
          28 * size,
          Math.hypot(a.x - v.x, a.y - v.y) * 0.3,
          Math.hypot(b.x - v.x, b.y - v.y) * 0.3,
        );
        const x1 = v.x + radius * Math.cos(start),
          y1 = v.y + radius * Math.sin(start);
        const x2 = v.x + radius * Math.cos(start + delta),
          y2 = v.y + radius * Math.sin(start + delta);
        const corner = { x: x1 + x2 - v.x, y: y1 + y2 - v.y };
        return (
          <g key={`a-${name}`} data-highlight-angle={name}>
            <path
              d={`M${v.x},${v.y} L${x1},${y1} A${radius},${radius} 0 0 1 ${x2},${y2} Z`}
              fill="#ffcb62"
              fillOpacity=".65"
              stroke="none"
            />
            <path
              data-testid={right ? "step-right-angle" : undefined}
              d={
                right
                  ? `M${x1},${y1} L${corner.x},${corner.y} L${x2},${y2}`
                  : `M${x1},${y1} A${radius},${radius} 0 0 1 ${x2},${y2}`
              }
              fill="none"
            />
            {label?.leader && (
              <line
                x1={label.leader.from.x}
                y1={label.leader.from.y}
                x2={label.leader.to.x}
                y2={label.leader.to.y}
                strokeWidth={size}
              />
            )}
            {label && (
              <text
                data-correspondence-angle-label={name}
                x={label.textX}
                y={label.textY}
                fontSize={label.fontSize}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colour}
                stroke="var(--color-paper)"
                strokeWidth={3 * size}
                paintOrder="stroke"
              >
                {`∠${name}`}
              </text>
            )}
            {right && !label && (
              <text
                x={v.x + (radius + 11 * size) * Math.cos(start + delta / 2)}
                y={v.y + (radius + 11 * size) * Math.sin(start + delta / 2)}
                fontSize={14 * size}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colour}
                stroke="var(--color-paper)"
                strokeWidth={3 * size}
                paintOrder="stroke"
              >
                90°
              </text>
            )}
          </g>
        );
      })}
      {geometry.points.map((p) => (
        <circle
          key={p.label}
          data-highlight-point={p.label}
          cx={p.x}
          cy={p.y}
          r={9 * size}
          fill="#ffcb62"
          fillOpacity=".5"
        />
      ))}
    </g>
  );
}
