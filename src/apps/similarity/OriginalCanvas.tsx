"use client";

import { useRef, useState, type PointerEvent } from "react";
import { copy } from "@/lib/copy";
import {
  bounds,
  centre,
  identityPose,
  shapePoints,
  transform,
  poseFromVertex,
  fitPose,
  snapPose,
  overlappingShapeGroups,
  type VertexDragMode,
  type Pose,
} from "./geometry";
import type { Point, Shape, SourceQuestion } from "./types";
import styles from "./similarity.module.css";
import { GeometryName } from "./Notation";
import { VertexHandles } from "./VertexHandles";
import { ReasonMarks } from "./ReasonMarks";
import { PairedVertexLabels } from "./PairedVertexLabels";
import { PairedSideLabels } from "./PairedSideLabels";
import { pairedSideLabels, sideLabelPoints } from "./pairedSides";
import { DiagramViewControls, useDiagramView } from "./DiagramView";
import { ComparisonKey } from "./ComparisonKey";
import type { Condition, ReasonPair } from "./reasons";
import { CleanSource, cleanSourceIds } from "./CleanSource";
import { placeVertexLabels, vertexLabelPoints } from "./vertexLabels";

import { StepHighlights } from "./StepHighlights";
import type { TextbookStep } from "./textbook-types";
const c = copy.similarity;
const colours = [
  "var(--color-navy)",
  "var(--color-crimson)",
  "var(--color-graphite)",
];
const outline = (ps: Point[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
const contextOutlines: Record<string, string> = {
  "ex8c-19": "ACDEA",
  "rev8-27": "ABCA",
  "rev8-38": "ABCDA",
};

/** Independent rigid copies on the original diagram. The printed figure stays as a reference. */
export function OriginalCanvas({
  question,
  points,
  shapes,
  selected,
  active,
  onActivate,
  tracing,
  vertices,
  onVertex,
  expanded,
  onExpand,
  vertexMode,
  reasonPair,
  reasonRows,
  highlightStep,
  rightAngles,
  proofOnly,
  showAngles,
  showLengths,
  hiddenMarks,
  onHideMark,
  snapping,
  pairs,
  onSnap,
}: {
  question: SourceQuestion;
  points: Point[];
  shapes: Shape[];
  selected: number[];
  active: number;
  onActivate: (index: number) => void;
  tracing: boolean;
  vertices: string[];
  onVertex: (label: string) => void;
  expanded: boolean;
  onExpand: () => void;
  vertexMode: VertexDragMode;
  reasonPair?: ReasonPair;
  reasonRows: Condition[];
  highlightStep?: TextbookStep;
  rightAngles: string[];
  proofOnly: boolean;
  showAngles: boolean;
  showLengths: boolean;
  hiddenMarks: string[];
  onHideMark: (id: string) => void;
  snapping: boolean;
  pairs: ReasonPair[];
  onSnap: () => void;
}) {
  const [poses, setPoses] = useState<Record<number, Pose>>({});
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    index: number;
    x: number;
    y: number;
    pose: Pose;
    pointerId: number;
    vertex?: boolean;
    moved?: boolean;
  } | null>(null);
  const originalBox = bounds(points, 22);
  const padding = Math.max(originalBox.width, originalBox.height) * 0.2;
  const box = bounds(points, padding + 22);
  const pilot = question.id === "ex8c-19";
  const index = selected[active] ?? selected[0];
  const initial = (i: number): Pose => ({
    ...identityPose,
    ...centre(shapePoints(shapes[i], points)),
  });
  const poseAt = (i: number) => poses[i] ?? initial(i);
  const current = index === undefined ? null : poseAt(index);
  const unit = Math.max(originalBox.width, originalBox.height) / 32;
  const placedShapes = selected.map((id, i) => ({
    id,
    points: transform(shapePoints(shapes[id], points), poseAt(id)),
    colour: colours[i],
  }));
  const labelGroups = overlappingShapeGroups(placedShapes, pairs);
  const pairedShapes = new Set(labelGroups.flat());
  const sideLabels = pairedSideLabels(
    placedShapes,
    labelGroups,
    reasonPair,
    reasonRows,
    unit / 12,
  );
  const referencePolygons = question.shapes.map((s) => shapePoints(s, points));
  if (contextOutlines[question.id]) {
    referencePolygons.push(
      shapePoints(
        { name: "", vertices: [...contextOutlines[question.id]] },
        points,
      ),
    );
  }
  const referenceLabels = placeVertexLabels(
    points.map((p) => ({
      key: p.label,
      point: p,
      text: p.label,
      fontSize: 20,
    })),
    referencePolygons,
  );
  const movedLabels = placeVertexLabels(
    placedShapes
      .filter((s) => poses[s.id] && !pairedShapes.has(s.id))
      .flatMap((s) => {
        const mid = centre(s.points);
        return s.points.map((p) => ({
          key: `${s.id}-${p.label}`,
          point: p,
          text: p.label,
          fontSize: unit * 1.5,
          preferred: { x: p.x - mid.x, y: p.y - mid.y },
        }));
      }),
    [...referencePolygons, ...placedShapes.map((s) => s.points)],
    sideLabels,
  );
  const view = useDiagramView(
    box,
    [
      ...points,
      ...vertexLabelPoints(referenceLabels),
      ...placedShapes.flatMap((s) => s.points),
      ...sideLabelPoints(sideLabels),
      ...vertexLabelPoints(movedLabels),
    ],
    unit * 3.5,
    svg,
  );
  function update(i: number, patch: Partial<Pose>) {
    setPoses((prev) => {
      const next = fitPose(
        shapePoints(shapes[i], points),
        { ...(prev[i] ?? initial(i)), ...patch },
        box,
        unit * 1.2,
        patch.scale === undefined ||
          patch.scale === (prev[i] ?? initial(i)).scale,
      );
      return { ...prev, [i]: next };
    });
  }
  function position(event: PointerEvent<SVGElement>) {
    const matrix = svg.current!.getScreenCTM()!;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
  }
  function start(event: PointerEvent<SVGGElement>, i: number, vertex?: Point) {
    if (tracing || event.button !== 0 || drag.current) return;
    const p = vertex ?? position(event);
    onActivate(i);
    drag.current = {
      index: i,
      x: p.x,
      y: p.y,
      pose: poseAt(i),
      pointerId: event.pointerId,
      vertex: !!vertex,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    event.preventDefault();
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (view.movePan(event)) return;
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const p = position(event);
    const matrix = svg.current?.getScreenCTM();
    if (
      matrix &&
      Math.hypot(p.x - d.x, p.y - d.y) * Math.hypot(matrix.a, matrix.b) > 4
    )
      d.moved = true;
    update(
      d.index,
      d.vertex
        ? poseFromVertex(d.pose, d, p, vertexMode)
        : { x: d.pose.x + p.x - d.x, y: d.pose.y + p.y - d.y },
    );
  }
  function finish(event: PointerEvent<SVGSVGElement>) {
    if (view.endPan()) return;
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved || d.pointerId !== event.pointerId || !snapping) return;
    const targetIndices = new Set(
      pairs
        .filter(
          (p) => p.criterion !== "not-similar" && p.shapes.includes(d.index),
        )
        .flatMap((p) => p.shapes)
        .filter((i) => i !== d.index && selected.includes(i)),
    );
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return;
    const next = snapPose(
      shapePoints(shapes[d.index], points),
      poseAt(d.index),
      [...targetIndices].map((i) => ({
        points: shapePoints(shapes[i], points),
        pose: poseAt(i),
      })),
      {
        pixelsPerUnit: Math.hypot(matrix.a, matrix.b),
        mode: d.vertex ? vertexMode : "both",
      },
    );
    if (next) {
      setPoses((prev) => ({ ...prev, [d.index]: next }));
      const nextShapes = placedShapes.map((s) =>
        s.id === d.index
          ? { ...s, points: transform(shapePoints(shapes[s.id], points), next) }
          : s,
      );
      const labels = pairedSideLabels(
        nextShapes,
        overlappingShapeGroups(nextShapes, pairs),
        reasonPair,
        reasonRows,
        unit / 12,
      );
      view.fit([
        ...points,
        ...vertexLabelPoints(referenceLabels),
        ...nextShapes.flatMap((s) => s.points),
        ...sideLabelPoints(labels),
      ]);
      onSnap();
    }
  }
  const moved = Object.keys(poses).length > 0;
  const plainReference =
    proofOnly ||
    question.constructed ||
    !showAngles ||
    !showLengths ||
    hiddenMarks.length > 0;
  const order = shapes
    .map((_, i) => i)
    .sort(
      (a, b) =>
        (a === index ? 2 : selected.includes(a) ? 1 : 0) -
        (b === index ? 2 : selected.includes(b) ? 1 : 0),
    );
  return (
    <>
      <div className={styles.originalToolbar}>
        <p>{c.originalHint}</p>
        <button
          onClick={() => {
            if (!expanded) view.fit();
            onExpand();
          }}
        >
          {expanded ? c.bothBoards : c.originalFocus}
        </button>
      </div>
      <DiagramViewControls title={c.original} view={view} />
      <svg
        ref={svg}
        viewBox={`${view.frame.x} ${view.frame.y} ${view.frame.width} ${view.frame.height}`}
        className={styles.sourceSvg}
        aria-label={`${c.original}: ${question.group} ${question.number}`}
        data-testid="original-board"
        onPointerDown={view.startPan}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={() => {
          view.endPan();
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          view.endPan();
          drag.current = null;
        }}
      >
        <rect
          {...view.frame}
          fill="var(--color-paper)"
          data-pan-background="true"
        />
        <defs>
          <clipPath id={`source-clip-${question.id}`}>
            <rect {...originalBox} />
          </clipPath>
        </defs>
        <g opacity={moved ? 0.27 : 1} pointerEvents="none">
          {plainReference && (
            <>
              {contextOutlines[question.id] && (
                <polyline
                  data-testid="reference-context"
                  points={outline(
                    shapePoints(
                      { name: "", vertices: [...contextOutlines[question.id]] },
                      points,
                    ),
                  )}
                  fill="none"
                  stroke="var(--color-graphite)"
                  strokeWidth="2"
                />
              )}
              {question.shapes.map((shape, i) => (
                <polygon
                  key={i}
                  points={outline(shapePoints(shape, points))}
                  fill="none"
                  stroke="var(--color-graphite)"
                  strokeWidth="2"
                />
              ))}
              {points.map((p) => (
                <text
                  key={p.label}
                  x={referenceLabels.get(p.label)!.textX}
                  y={referenceLabels.get(p.label)!.textY}
                  textAnchor="middle"
                  data-testid="reference-vertex-name"
                  className={styles.sourceLabel}
                >
                  {p.label}
                </text>
              ))}
            </>
          )}
          {!plainReference && !pilot && !cleanSourceIds.has(question.id) && (
            <image
              clipPath={`url(#source-clip-${question.id})`}
              href={`/similarity/questions/${question.id}.webp`}
              x={question.crop[0] * 1000}
              y={question.crop[1] * 1320}
              width={(question.crop[2] - question.crop[0]) * 1000}
              height={(question.crop[3] - question.crop[1]) * 1320}
              preserveAspectRatio="none"
            />
          )}
          {!plainReference && cleanSourceIds.has(question.id) && (
            <CleanSource
              id={question.id}
              points={points}
              shapes={question.shapes}
            />
          )}
          {!plainReference && pilot && (
            <>
              <polyline
                points={outline(
                  shapePoints(
                    { name: "", vertices: ["A", "C", "D", "E", "A", "B", "C"] },
                    points,
                  ),
                )}
                fill="none"
                stroke="var(--color-graphite)"
                strokeWidth="2"
              />
              <polygon
                points={outline(shapePoints(shapes[0], points))}
                fill="none"
                stroke="var(--color-graphite)"
                strokeWidth="2"
              />
              <path
                d="M262 180v-12h12 M140 369h12v12 M140 192h12v-12"
                stroke="var(--color-pencil)"
                fill="none"
                strokeWidth="1.5"
              />
              <text x="195" y="402" className={styles.given}>
                3 cm
              </text>
              <text x="286" y="130" className={styles.given}>
                2 cm
              </text>
              <text x="370" y="345" className={styles.given}>
                3 cm
              </text>
              <path
                d="m192 176 8 4-8 4m-5 193 8 4-8 4"
                fill="none"
                stroke="var(--color-navy)"
                strokeWidth="2"
              />
              {points.map((p) => (
                <text
                  key={p.label}
                  x={referenceLabels.get(p.label)!.textX}
                  y={referenceLabels.get(p.label)!.textY}
                  textAnchor="middle"
                  data-testid="reference-vertex-name"
                  className={styles.sourceLabel}
                >
                  {p.label}
                </text>
              ))}
            </>
          )}
        </g>
        <StepHighlights
          step={highlightStep}
          rightAngles={rightAngles}
          source={points}
          size={unit / 12}
          context="source"
        />
        {order.map((i) => {
          const s = shapes[i],
            selectedIndex = selected.indexOf(i),
            ps = transform(shapePoints(s, points), poseAt(i));
          const colour =
            selectedIndex >= 0 ? colours[selectedIndex] : "transparent";
          return (
            <g
              key={`${s.name}-${i}`}
              role="button"
              tabIndex={tracing ? -1 : 0}
              aria-label={`${c.originalMove} ${s.name}`}
              aria-pressed={i === index}
              onPointerDown={(e) => start(e, i)}
              onFocus={() => {
                if (!tracing) onActivate(i);
              }}
              onKeyDown={(e) => {
                if (tracing) return;
                const p = poseAt(i),
                  d = unit * (e.shiftKey ? 2 : 0.5);
                const keys: Record<string, Partial<Pose>> = {
                  ArrowLeft: { x: p.x - d },
                  ArrowRight: { x: p.x + d },
                  ArrowUp: { y: p.y - d },
                  ArrowDown: { y: p.y + d },
                  r: { angle: p.angle + 15 },
                  h: { flipX: -p.flipX },
                  v: { flipY: -p.flipY },
                };
                const change = keys[e.key] ?? keys[e.key.toLowerCase()];
                if (change) {
                  e.preventDefault();
                  update(i, change);
                }
              }}
              className={styles.movable}
              data-testid={`original-shape-${i}`}
              data-x={poseAt(i).x}
              data-y={poseAt(i).y}
              data-angle={poseAt(i).angle}
              data-flip-x={poseAt(i).flipX}
              data-flip-y={poseAt(i).flipY}
              data-scale={poseAt(i).scale}
            >
              <polygon
                points={outline(ps)}
                fill={colour}
                fillOpacity={0.16}
                stroke={colour}
                strokeWidth={i === index ? 2.8 : 2}
                strokeDasharray={selectedIndex === 1 ? "7 3" : undefined}
              />
              {selectedIndex >= 0 && poses[i] && (
                <StepHighlights
                  step={highlightStep}
                  rightAngles={rightAngles}
                  source={points}
                  placed={ps}
                  size={unit / 12}
                />
              )}
              {selectedIndex >= 0 && reasonPair?.shapes.includes(i) && (
                <ReasonMarks
                  points={ps}
                  rows={reasonRows}
                  member={reasonPair.shapes.indexOf(i)}
                  size={unit / 12}
                  showSideLabels={
                    !sideLabels.length &&
                    (!!poses[i] || expanded || !!plainReference)
                  }
                  onHide={onHideMark}
                  onMoveStart={(event) => start(event, i)}
                />
              )}
              {poses[i] &&
                selectedIndex >= 0 &&
                !pairedShapes.has(i) &&
                ps.map((p) => {
                  const label = movedLabels.get(`${i}-${p.label}`)!;
                  return (
                    <text
                      key={p.label}
                      data-testid="vertex-name"
                      x={label.textX}
                      y={label.textY}
                      textAnchor="middle"
                      fill={colour}
                      className={styles.movedLabel}
                      fontSize={unit * 1.5}
                    >
                      {p.label}
                    </text>
                  );
                })}
              {i === index && !tracing && (
                <VertexHandles
                  points={ps}
                  colour={colour}
                  size={unit / 10}
                  prefix={`original-shape-${i}`}
                  onStart={(event, point) => start(event, i, point)}
                  pose={poseAt(i)}
                  onChange={(patch) => update(i, patch)}
                />
              )}
            </g>
          );
        })}
        <PairedSideLabels
          labels={sideLabels}
          onHide={onHideMark}
          onMoveStart={(event) =>
            start(
              event,
              reasonPair!.shapes.includes(index)
                ? index
                : reasonPair!.shapes[0],
            )
          }
        />
        <PairedVertexLabels
          groups={labelGroups}
          shapes={placedShapes}
          frame={view.frame}
          fontSize={unit * 1.5}
          obstacles={sideLabels}
        />
        {tracing &&
          points.map((p) => (
            <g
              key={p.label}
              className={styles.vertex}
              onClick={() => onVertex(p.label)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={unit * 0.9}
                fill={
                  vertices.includes(p.label)
                    ? "var(--color-highlight)"
                    : "var(--color-paper)"
                }
                stroke="var(--color-navy)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y + unit * 0.4}
                textAnchor="middle"
                fontSize={unit * 1.2}
              >
                {p.label}
              </text>
            </g>
          ))}
      </svg>
      {showLengths && reasonPair?.shapes.every((i) => selected.includes(i)) && (
        <ComparisonKey
          question={question}
          pair={reasonPair}
          visibleSides={reasonRows
            .filter((r) => r.kind === "side")
            .map((r) => r.id)}
          hiddenSides={hiddenMarks}
          showAngles={showAngles}
        />
      )}
      <div className={styles.sourceControls}>
        <div className={styles.activeShapes}>
          <span>{c.selected}</span>
          {selected.map((i, j) => (
            <button
              key={i}
              onClick={() => onActivate(i)}
              aria-pressed={index === i}
              aria-label={shapes[i].name}
              style={{ color: colours[j] }}
            >
              <GeometryName>{shapes[i].name}</GeometryName>
            </button>
          ))}
        </div>
        {current && (
          <div className={styles.tools}>
            <button
              aria-label={c.originalLeft}
              onClick={() => update(index, { angle: current.angle - 15 })}
            >
              −15°
            </button>
            <button
              aria-label={c.originalRight}
              onClick={() => update(index, { angle: current.angle + 15 })}
            >
              +15°
            </button>
            <button
              aria-label={c.originalTurn}
              onClick={() => update(index, { angle: current.angle + 90 })}
            >
              ↻ 90°
            </button>
            <button
              aria-label={c.originalFlipH}
              onClick={() => update(index, { flipX: -current.flipX })}
            >
              ↔ {c.flipShort}
            </button>
            <button
              aria-label={c.originalFlipV}
              onClick={() => update(index, { flipY: -current.flipY })}
            >
              ↕ {c.flipShort}
            </button>
          </div>
        )}
        <button className={styles.restore} onClick={() => setPoses({})}>
          {c.originalReset} ↺
        </button>
      </div>
    </>
  );
}
