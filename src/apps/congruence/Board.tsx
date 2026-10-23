"use client";

import { useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { copy } from "@/lib/copy";
import { GeometryName } from "../similarity/Notation";
import { bounds, centre } from "../similarity/geometry";
import { useDiagramView } from "../similarity/DiagramView";
import { placeVertexLabels } from "../similarity/vertexLabels";
import { StepHighlights } from "../similarity/StepHighlights";
import { PairedVertexLabels } from "../similarity/PairedVertexLabels";
import type { Shape, Point } from "../similarity/types";
import type { TextbookStep } from "../similarity/textbook-types";
import {
  alignPose,
  comparisonShapes,
  rigidTransform,
  separatePoses,
  turnAtVertex,
  reflectPose,
  snapPose,
  overlappingGroups,
  type RigidPose,
} from "./geometry";
import type { CongruenceQuestion } from "./types";
import styles from "./congruence.module.css";
import { CleanDiagram, cleanDiagramIds } from "./CleanDiagram";
import { EvidenceMarks, layoutEvidenceMarks } from "./EvidenceMarks";
import {
  filterStepEvidence,
  withoutEvidenceHighlights,
  type EvidenceRow,
} from "./evidence";

const c = copy.congruence,
  shared = copy.similarity;
const colours = [
  "var(--color-navy)",
  "var(--color-crimson)",
  "var(--color-graphite)",
];
const outline = (points: Point[]) =>
  points.map((p) => `${p.x},${p.y}`).join(" ");

export function Board({
  question,
  shapes,
  selected,
  source,
  visible,
  step,
  comparing = false,
  marks,
  controlsHost,
  evidence,
  knownEvidence,
  currentKeys,
  hiddenEvidence,
  showAngles,
  showSides,
  onHideEvidence,
}: {
  question: CongruenceQuestion;
  shapes: Shape[];
  selected: number[];
  source: boolean;
  visible: boolean;
  step?: TextbookStep;
  comparing?: boolean;
  marks: boolean;
  controlsHost: HTMLElement | null;
  evidence: EvidenceRow[];
  knownEvidence: EvidenceRow[];
  currentKeys: ReadonlySet<string>;
  hiddenEvidence: ReadonlySet<string>;
  showAngles: boolean;
  showSides: boolean;
  onHideEvidence: (key: string) => void;
}) {
  const [poses, setPoses] = useState<Record<number, RigidPose>>({});
  const [activeChoice, setActive] = useState(0);
  const [opacity, setOpacity] = useState(0.14);
  const [snapping, setSnapping] = useState(true);
  const [snapped, setSnapped] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const diagramClip = useId();
  const drag = useRef<{
    id: number;
    pointer: number;
    start: Point;
    pose: RigidPose;
    vertex: boolean;
  } | null>(null);
  const allSets = useMemo(
    () =>
      source
        ? shapes.map((shape) =>
            shape.vertices.map((label) =>
              question.points.find((p) => p.label === label)!,
            ),
          )
        : comparisonShapes(
            question.points,
            shapes.map((s) => s.vertices),
            question.shapes.map((s) => s.vertices),
          ),
    [source, shapes, question.points, question.shapes],
  );
  const defaults = separatePoses(Math.min(3, question.shapes.length));
  const getPose = (id: number): RigidPose =>
    poses[id] ??
    (source
      ? { ...centre(allSets[id]), angle: 0, reflected: false }
      : id < question.shapes.length
        ? defaults[id % defaults.length]
        : { x: 420, y: 230, angle: 0, reflected: false });
  const placed = selected.map((id) => ({
    id,
    points: rigidTransform(allSets[id], getPose(id)),
  }));
  const frame = source
    ? bounds(question.points, 70)
    : { x: 0, y: 0, width: 840, height: 460 };
  const fontSize = source
    ? Math.min(28, Math.max(comparing ? 20 : 11, frame.width / 32))
    : 23;
  const visibleEvidence = marks
    ? evidence.filter(
        (row) =>
          !hiddenEvidence.has(row.key) &&
          (row.kind === "angle" ? showAngles : showSides),
      )
    : [];
  const evidencePlacements = source
    ? [{ id: -1, points: question.points, sourceOnly: true }, ...placed]
    : placed;
  const evidenceLayout = layoutEvidenceMarks(
    visibleEvidence,
    question.points,
    evidencePlacements,
    fontSize / 23,
    [],
    comparing,
  );
  const annotationBounds = evidenceLayout.boxes.flatMap((box) => [
    { label: "", x: box.x, y: box.y },
    { label: "", x: box.x + box.width, y: box.y + box.height },
  ]);
  const focusStep = withoutEvidenceHighlights(
    filterStepEvidence(
      comparing && step ? { ...step, highlights: {} } : step,
      knownEvidence,
      hiddenEvidence,
      showAngles,
      showSides,
      question.points,
    ),
    visibleEvidence,
    question.points,
  );
  const content = source
    ? [
        ...question.points,
        ...placed.flatMap((s) => s.points),
        ...annotationBounds,
      ]
    : [...placed.flatMap((s) => s.points), ...annotationBounds];
  const view = useDiagramView(frame, content, 65, svg);
  const overlap = overlappingGroups(placed, fontSize * 0.75);
  const merged = new Set(overlap.flat());
  const labels = placeVertexLabels(
    placed.flatMap((shape) => {
      const middle = centre(shape.points);
      return shape.points.map((p) => ({
        key: `${shape.id}-${p.label}`,
        text: p.label,
        point: p,
        fontSize,
        preferred: { x: p.x - middle.x, y: p.y - middle.y },
      }));
    }),
    placed.map((s) => s.points),
    evidenceLayout.boxes,
    view.frame,
  );
  const active = selected.includes(activeChoice) ? activeChoice : selected[0];
  const pose = active === undefined ? undefined : getPose(active);
  function update(id: number, next: RigidPose) {
    setPoses((prev) => ({ ...prev, [id]: next }));
  }
  function position(event: PointerEvent<SVGElement>): Point {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { label: "", x: 0, y: 0 };
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { label: "", x: p.x, y: p.y };
  }
  function start(event: PointerEvent<SVGElement>, id: number, vertex = false) {
    if (event.button !== 0 || drag.current) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    setActive(id);
    setSnapped(false);
    drag.current = {
      id,
      pointer: event.pointerId,
      start: position(event),
      pose: getPose(id),
      vertex,
    };
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d) {
      view.movePan(event);
      return;
    }
    if (d.pointer !== event.pointerId) return;
    const p = position(event);
    update(
      d.id,
      d.vertex
        ? turnAtVertex(d.pose, d.start, p)
        : {
            ...d.pose,
            x: Math.min(
              view.frame.x + view.frame.width,
              Math.max(view.frame.x, d.pose.x + p.x - d.start.x),
            ),
            y: Math.min(
              view.frame.y + view.frame.height,
              Math.max(view.frame.y, d.pose.y + p.y - d.start.y),
            ),
          },
    );
  }
  function stop(trySnap = false) {
    const d = drag.current;
    if (trySnap && d && snapping) {
      for (const target of placed.filter((shape) => shape.id !== d.id)) {
        const fit = snapPose(
          allSets[d.id],
          target.points,
          getPose(d.id),
          fontSize * 1.5,
        );
        if (fit) {
          update(d.id, fit);
          setSnapped(true);
          break;
        }
      }
    }
    drag.current = null;
    view.endPan();
  }
  const title = source ? shared.showOriginal : shared.showExtracted;
  const toolbar = (
    <div
      hidden={!visible}
      className={styles.controls}
      data-testid={source ? "source-controls" : "copy-controls"}
    >
      <p className={styles.lock}>{c.sizeLocked}</p>
      <div className={styles.shapeButtons} role="group" aria-label={c.selected}>
        {selected.map((id, i) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            aria-pressed={id === active}
            style={{ color: colours[i] }}
          >
            <GeometryName>{shapes[id].name}</GeometryName>
          </button>
        ))}
      </div>
      {pose ? (
        <>
          <div className={styles.toolRow}>
            <button
              onClick={() =>
                update(active, { ...pose, angle: pose.angle - 15 })
              }
            >
              {shared.rotateLeft}
            </button>
            <button
              onClick={() =>
                update(active, { ...pose, angle: pose.angle + 15 })
              }
            >
              {shared.rotateRight}
            </button>
            <button
              onClick={() => update(active, reflectPose(pose, "horizontal"))}
            >
              {c.flipHorizontal}
            </button>
            <button
              onClick={() => update(active, reflectPose(pose, "vertical"))}
            >
              {c.flipVertical}
            </button>
          </div>
          <label className={styles.slider}>
            {shared.angle} <output>{Math.round(pose.angle)}°</output>
            <input
              aria-label={shared.angle}
              type="range"
              min="-180"
              max="180"
              value={((pose.angle + 540) % 360) - 180}
              onChange={(e) =>
                update(active, { ...pose, angle: Number(e.target.value) })
              }
            />
          </label>
          <div className={styles.toolRow}>
            {(
              [
                ["←", shared.left, -15, 0],
                ["↑", shared.up, 0, -15],
                ["↓", shared.down, 0, 15],
                ["→", shared.right, 15, 0],
              ] as const
            ).map(([symbol, label, dx, dy]) => (
              <button
                key={label}
                aria-label={label}
                onClick={() =>
                  update(active, { ...pose, x: pose.x + dx, y: pose.y + dy })
                }
              >
                {symbol}
              </button>
            ))}
          </div>
          <button
            disabled={selected.length < 2}
            onClick={() => {
              const targetId = selected.find((id) => id !== active)!;
              update(
                active,
                alignPose(
                  allSets[active],
                  rigidTransform(allSets[targetId], getPose(targetId)),
                  pose,
                ),
              );
            }}
          >
            {c.align}
          </button>
          <p className={styles.micro}>{c.alignHint}</p>
        </>
      ) : (
        <p>{c.noSelection}</p>
      )}
      <label className={styles.slider}>
        {shared.opacity} <output>{Math.round(opacity * 100)}%</output>
        <input
          aria-label={shared.opacity}
          type="range"
          min="0.05"
          max="0.6"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
      </label>
      <label className={styles.markToggle}>
        <input
          type="checkbox"
          checked={snapping}
          onChange={(e) => setSnapping(e.target.checked)}
        />
        {c.snap}
      </label>
      <p className={styles.micro}>{c.snapHint}</p>
      <button
        onClick={() => {
          setPoses({});
          setSnapped(false);
          view.reset();
        }}
      >
        {c.restore}
      </button>
      <p className={styles.micro}>{c.keyboardHint}</p>
    </div>
  );
  return (
    <>
      <section className={styles.board} hidden={!visible} aria-label={title}>
        <svg
          ref={svg}
          className={styles.canvas}
          viewBox={`${view.frame.x} ${view.frame.y} ${view.frame.width} ${view.frame.height}`}
          aria-label={title}
          data-testid={
            source ? "congruence-source-board" : "congruence-copy-board"
          }
          onPointerDown={view.startPan}
          onPointerMove={move}
          onPointerUp={() => stop(true)}
          onPointerCancel={() => stop()}
          onLostPointerCapture={() => stop()}
        >
          <title>{title}</title>
          {question.diagramCrop && (
            <defs>
              <clipPath id={diagramClip}>
                <rect
                  x={question.diagramCrop[0]}
                  y={question.diagramCrop[1]}
                  width={question.diagramCrop[2] - question.diagramCrop[0]}
                  height={question.diagramCrop[3] - question.diagramCrop[1]}
                />
              </clipPath>
            </defs>
          )}
          <rect
            data-pan-background
            x={view.frame.x}
            y={view.frame.y}
            width={view.frame.width}
            height={view.frame.height}
            fill="var(--color-paper)"
          />
          {source &&
            !question.constructed &&
            !cleanDiagramIds.has(question.id) && (
              <image
                className={styles.sourceDiagram}
                href={`/congruence/questions/${question.id}.webp`}
                x={question.crop[0]}
                y={question.crop[1]}
                width={question.crop[2] - question.crop[0]}
                height={question.crop[3] - question.crop[1]}
                pointerEvents="none"
                opacity="1"
                clipPath={
                  question.diagramCrop ? `url(#${diagramClip})` : undefined
                }
              />
            )}
          {source && <CleanDiagram question={question} />}
          {source && marks && (
            <StepHighlights
              step={focusStep}
              source={question.points}
              size={fontSize / 23}
              rightAngles={question.rightAngles}
              context="source"
            />
          )}
          {placed.map(({ id, points }, i) => {
            const currentPose = getPose(id);
            const originalCentre = centre(allSets[id]);
            const unchangedSource =
              source &&
              !question.constructed &&
              currentPose.angle === 0 &&
              !currentPose.reflected &&
              Math.hypot(
                currentPose.x - originalCentre.x,
                currentPose.y - originalCentre.y,
              ) < 0.01;
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`${shared.move} ${shapes[id].name}`}
                className={styles.movable}
                data-testid={`congruence-shape-${i}`}
                data-shape={shapes[id].name}
                data-x={currentPose.x}
                data-y={currentPose.y}
                data-angle={currentPose.angle}
                data-reflected={currentPose.reflected}
                onPointerDown={(event) => start(event, id)}
                onKeyDown={(e) => {
                  const key = e.key.toLowerCase();
                  if (
                    ![
                      "arrowleft",
                      "arrowright",
                      "arrowup",
                      "arrowdown",
                      "r",
                      "h",
                      "enter",
                      " ",
                    ].includes(key)
                  )
                    return;
                  e.preventDefault();
                  e.stopPropagation();
                  setActive(id);
                  const distance =
                    (source ? frame.width / 60 : 12) * (e.shiftKey ? 3 : 1);
                  update(id, {
                    ...currentPose,
                    x:
                      currentPose.x +
                      (key === "arrowright"
                        ? distance
                        : key === "arrowleft"
                          ? -distance
                          : 0),
                    y:
                      currentPose.y +
                      (key === "arrowdown"
                        ? distance
                        : key === "arrowup"
                          ? -distance
                          : 0),
                    angle: currentPose.angle + (key === "r" ? 15 : 0),
                    reflected:
                      key === "h"
                        ? !currentPose.reflected
                        : currentPose.reflected,
                  });
                }}
              >
                <polygon
                  points={outline(points)}
                  fill={colours[i]}
                  fillOpacity={opacity}
                  stroke={colours[i]}
                  strokeWidth={((id === active ? 3 : 2) * fontSize) / 23}
                  strokeDasharray={
                    i === 1
                      ? `${(8 * fontSize) / 23} ${(4 * fontSize) / 23}`
                      : undefined
                  }
                />
                {marks && (
                  <StepHighlights
                    step={focusStep}
                    source={question.points}
                    placed={points}
                    rightAngles={question.rightAngles}
                    size={fontSize / 23}
                  />
                )}
                {points.map((p) => {
                  const label = labels.get(`${id}-${p.label}`)!;
                  return (
                    <g key={p.label}>
                      {!unchangedSource && !merged.has(id) && (
                        <text
                          x={label.textX}
                          y={label.textY}
                          textAnchor="middle"
                          fontSize={fontSize}
                          className={styles.vertex}
                          fill={colours[i]}
                        >
                          {p.label}
                        </text>
                      )}
                      {id === active && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={fontSize * 0.48}
                          fill="var(--color-paper)"
                          fillOpacity=".8"
                          stroke={colours[i]}
                          strokeWidth={fontSize / 12}
                          role="button"
                          tabIndex={0}
                          aria-label={`${c.vertexHandle} ${p.label}`}
                          className={styles.handle}
                          onPointerDown={(event) => start(event, id, true)}
                          onKeyDown={(e) => {
                            if (
                              ![
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                              ].includes(e.key)
                            )
                              return;
                            e.preventDefault();
                            e.stopPropagation();
                            update(id, {
                              ...currentPose,
                              angle:
                                currentPose.angle +
                                (["ArrowLeft", "ArrowDown"].includes(e.key)
                                  ? -5
                                  : 5),
                            });
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <EvidenceMarks
            rows={visibleEvidence}
            source={question.points}
            placements={evidencePlacements}
            layout={evidenceLayout}
            size={fontSize / 23}
            currentKeys={currentKeys}
            onToggle={onHideEvidence}
            hideLabel={(row) =>
              `${c.hideEvidence}: ${row.members.map((member) => `${row.kind === "angle" ? "∠" : ""}${member.name}`).join(" = ")}`
            }
          />
          <PairedVertexLabels
            groups={overlap}
            shapes={placed.map((shape, i) => ({
              ...shape,
              colour: colours[i],
            }))}
            frame={view.frame}
            fontSize={fontSize}
            obstacles={evidenceLayout.boxes}
          />
        </svg>
        <div className={styles.camera}>
          <button
            aria-label={shared.zoomOut}
            disabled={view.zoom <= 0.5}
            onClick={() => view.setZoom(view.zoom / 1.25)}
          >
            −
          </button>
          <output aria-label={shared.diagramZoom}>
            {Math.round(view.zoom * 100)}%
          </output>
          <button
            aria-label={shared.zoomIn}
            disabled={view.zoom >= 4}
            onClick={() => view.setZoom(view.zoom * 1.25)}
          >
            +
          </button>
          <button onClick={() => view.fit()}>{shared.fitTriangles}</button>
          <button onClick={view.reset}>{shared.resetView}</button>
          <span role="status">{snapped ? c.snapped : c.sizeLocked}</span>
        </div>
      </section>
      {controlsHost && createPortal(toolbar, controlsHost)}
    </>
  );
}
