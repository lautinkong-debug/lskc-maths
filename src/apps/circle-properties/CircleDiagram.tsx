"use client";

import { useId, useRef, type PointerEvent } from "react";
import type { LabId } from "./content";
import {
  CENTRE,
  RADIUS,
  circlePoint,
  dragParameter,
  getScene,
  type Parameters,
  type Point,
  type Scene,
  type Tone,
  type DragKey,
} from "./geometry";
import styles from "./diagram.module.css";
import MathText from "./MathText";
import DiagramMeasurements from "./DiagramMeasurements";
import {
  getAngleLayout,
  getPointLabelOffset,
  rightAngleSize,
} from "./diagramLayout";
import InkLayer from "./InkLayer";
import type { InkBoardController } from "./useInkBoard";

const focusNotes: Record<LabId, string> = {
  bisector: "Compare AN and NB, then inspect the angle where ON meets AB.",
  chords: "Match each chord with its perpendicular distance from O.",
  centre: "Follow the same arc from the angle at O to the angle at P.",
  segment:
    "Compare the angles at P and Q. Are both vertices on the same side of AB?",
  semicircle: "Inspect AB and O, then compare AB with the angle at P.",
  "equal-arcs": "Match each coloured arc with its angle and chord.",
  ratios:
    "Compare the two arcs and their angles. Compare the chords separately.",
};

function arcPath(start: number, sweep: number, radius = RADIUS) {
  const a = circlePoint(start, radius),
    b = circlePoint(start + sweep, radius);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${Math.abs(sweep) > 180 ? 1 : 0} ${sweep >= 0 ? 1 : 0} ${b.x} ${b.y}`;
}
function AngleMark({
  angle,
  scene,
  showMeasurements,
}: {
  angle: Scene["angles"][number];
  scene: Scene;
  showMeasurements: boolean;
}) {
  const { right, label, value, wedge, squarePath, leader } = getAngleLayout(
    scene,
    angle,
  );
  return (
    <g className={styles[angle.tone]}>
      {showMeasurements && leader && (
        <line
          x1={leader.x}
          y1={leader.y}
          x2={label.x}
          y2={label.y}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.6}
          pointerEvents="none"
          aria-hidden="true"
          data-angle-label-leader={angle.at}
        />
      )}
      {right ? (
        <g>
          <path
            d={squarePath}
            className={styles.squareHalo}
            aria-hidden="true"
          />
          <path
            d={squarePath}
            className={styles.angleSquare}
            data-angle-square={angle.at}
          />
        </g>
      ) : (
        <path d={wedge} className={styles.angleWedge} />
      )}
      {showMeasurements && (
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.angleLabel}
        >
          {Number(value.toFixed(1))}°
        </text>
      )}
    </g>
  );
}

export default function CircleDiagram({
  lab,
  parameters,
  onChange,
  showMeasurements = true,
  showAngles = showMeasurements,
  highlightKey = 0,
  showInstructions = true,
  missionIndex,
  ink,
}: {
  lab: LabId;
  parameters: Parameters;
  onChange: (next: Parameters, key: DragKey) => void;
  showMeasurements?: boolean;
  showAngles?: boolean;
  /** Increment to replay a brief emphasis without remounting the draggable SVG. */
  highlightKey?: number;
  showInstructions?: boolean;
  missionIndex?: number;
  ink?: InkBoardController;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    key: DragKey;
    pointerId: number;
  } | null>(null);
  const id = useId();
  const scene = getScene(lab, parameters);
  const focusLines =
    lab === "bisector"
      ? [
          { from: "A", to: "N", tone: "navy" as const },
          { from: "N", to: "B", tone: "red" as const },
          { from: "O", to: "N", tone: "red" as const },
        ]
      : lab === "chords"
        ? scene.lines.filter((line) => !line.dashed)
        : lab === "semicircle" || lab === "equal-arcs"
          ? scene.lines.filter((line) =>
              ["AB", "CD"].includes(`${line.from}${line.to}`),
            )
          : [];
  function position(event: PointerEvent<SVGSVGElement>): Point | null {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (!drag.current || event.pointerId !== drag.current.pointerId) return;
    const point = position(event);
    if (point)
      onChange(
        dragParameter(lab, parameters, drag.current.key, point),
        drag.current.key,
      );
  }
  function stop(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }
  return (
    <div className={styles.diagram}>
      <svg
        ref={svgRef}
        viewBox="80 20 400 400"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        data-testid="circle-diagram"
      >
        <title id={`${id}-title`}>Interactive circle construction</title>
        <desc id={`${id}-description`}>
          {scene.caption} Drag the ringed points, or use the labelled sliders
          below the diagram.
        </desc>
        <defs>
          <pattern
            id={`${id}-grid`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".8" fill="currentColor" />
          </pattern>
        </defs>
        <rect
          x="8"
          y="8"
          width="544"
          height="424"
          rx="16"
          fill={`url(#${id}-grid)`}
          className={styles.grid}
        />
        <circle
          cx={CENTRE.x}
          cy={CENTRE.y}
          r={RADIUS}
          className={styles.circumference}
        />
        {scene.arcs.map((arc, i) => (
          <path
            key={`arc-${i}`}
            d={arcPath(arc.start, arc.sweep)}
            className={`${styles.arc} ${styles[arc.tone]}`}
          />
        ))}
        {scene.lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={scene.points[line.from].x}
            y1={scene.points[line.from].y}
            x2={scene.points[line.to].x}
            y2={scene.points[line.to].y}
            className={`${styles.line} ${styles[line.tone]}`}
            strokeWidth={line.width ?? 2.2}
            strokeDasharray={line.dashed ? "6 5" : undefined}
          />
        ))}
        {scene.angles.map((angle, i) => (
          <AngleMark
            key={`angle-${i}`}
            angle={angle}
            scene={scene}
            showMeasurements={showAngles}
          />
        ))}
        {scene.rightAngles
          .filter((mark) => !scene.angles.some((angle) => angle.at === mark.at))
          .map((mark, i) => {
            const at = scene.points[mark.at],
              first = scene.points[mark.from],
              second = scene.points[mark.to];
            const firstLength = Math.hypot(first.x - at.x, first.y - at.y),
              secondLength = Math.hypot(second.x - at.x, second.y - at.y);
            if (firstLength < 0.001 || secondLength < 0.001) return null;
            const u = {
              x: (rightAngleSize * (first.x - at.x)) / firstLength,
              y: (rightAngleSize * (first.y - at.y)) / firstLength,
            };
            const v = {
              x: (rightAngleSize * (second.x - at.x)) / secondLength,
              y: (rightAngleSize * (second.y - at.y)) / secondLength,
            };
            const squarePath = `M ${at.x + u.x} ${at.y + u.y} L ${at.x + u.x + v.x} ${at.y + u.y + v.y} L ${at.x + v.x} ${at.y + v.y}`;
            return (
              <g key={`right-${i}`}>
                <path
                  d={squarePath}
                  className={styles.squareHalo}
                  aria-hidden="true"
                />
                <path
                  d={squarePath}
                  className={styles.rightAngle}
                  data-angle-square={mark.at}
                />
              </g>
            );
          })}
        {highlightKey > 0 && (
          <g
            key={highlightKey}
            className={styles.focusPulse}
            aria-hidden="true"
          >
            {focusLines.map((line, i) => (
              <line
                key={`focus-line-${i}`}
                x1={scene.points[line.from].x}
                y1={scene.points[line.from].y}
                x2={scene.points[line.to].x}
                y2={scene.points[line.to].y}
                className={`${styles.focusLine} ${styles[line.tone]}`}
              />
            ))}
            {scene.arcs.map((arc, i) => (
              <path
                key={`focus-arc-${i}`}
                d={arcPath(arc.start, arc.sweep)}
                className={`${styles.focusArc} ${styles[arc.tone]}`}
              />
            ))}
            {scene.angles.map((angle, i) => (
              <AngleMark
                key={`focus-angle-${i}`}
                angle={angle}
                scene={scene}
                showMeasurements={false}
              />
            ))}
          </g>
        )}
        {showMeasurements && (
          <DiagramMeasurements
            lab={lab}
            parameters={parameters}
            missionIndex={missionIndex}
          />
        )}
        {Object.values(scene.points).map((point) => {
          const { x: dx, y: dy, leader } = getPointLabelOffset(scene, point);
          const tone: Tone =
            (point.label === "P" && lab !== "ratios") ||
            (point.label === "Q" && lab === "ratios") ||
            point.label === "N" ||
            point.label === "C" ||
            point.label === "D"
              ? "red"
              : "navy";
          return (
            <g
              key={point.label}
              className={`${styles.point} ${styles[tone]} ${point.drag ? styles.draggable : ""}`}
              onPointerDown={
                point.drag
                  ? (event) => {
                      event.preventDefault();
                      drag.current = {
                        key: point.drag!,
                        pointerId: event.pointerId,
                      };
                      svgRef.current?.setPointerCapture(event.pointerId);
                    }
                  : undefined
              }
              data-point={point.label}
              data-draggable={point.drag ? "true" : undefined}
            >
              {leader && (
                <line
                  x1={leader.x}
                  y1={leader.y}
                  x2={point.x + dx}
                  y2={point.y + dy}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={0.6}
                  pointerEvents="none"
                  aria-hidden="true"
                  data-point-label-leader={point.label}
                />
              )}
              {point.drag && <title>Drag {point.label}</title>}
              {point.drag && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="22"
                    className={styles.hitTarget}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="16"
                    className={styles.handleRing}
                  />
                </>
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={point.label === "O" ? 4 : 7}
                className={styles.pointDot}
              />
              <text
                x={point.x + dx}
                y={point.y + dy}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.pointLabel}
              >
                <MathText svg notation>
                  {point.label}
                </MathText>
              </text>
            </g>
          );
        })}
        {ink && <InkLayer board={ink} svgRef={svgRef} />}
      </svg>
      {highlightKey > 0 && (
        <p className={styles.focusNote} role="status">
          <MathText>{focusNotes[lab]}</MathText>
        </p>
      )}
      {showInstructions && (
        <p className={styles.instruction}>
          <span className={styles.legendHandle} aria-hidden="true" /> Drag a
          ringed point. You can also use the sliders.
        </p>
      )}
    </div>
  );
}
