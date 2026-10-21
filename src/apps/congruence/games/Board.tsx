"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { centre } from "../../similarity/geometry";
import {
  edgeCrossesLabel,
  placeVertexLabels,
  type LabelBox,
} from "../../similarity/vertexLabels";
import { placeAngleLabels } from "../../similarity/angleLabels";
import { PairedVertexLabels } from "../../similarity/PairedVertexLabels";
import {
  alignPose,
  overlappingGroups,
  reflectPose,
  rigidTransform,
  snapPose,
  turnAtVertex,
  type RigidPose,
} from "../geometry";
import { congruenceGamesCopy as c } from "./copy";
import {
  evidenceName,
  pretty,
  same,
  sharedDrawingPoints,
  type Evidence,
  type Round,
} from "./model";
import styles from "./games.module.css";

const colours = ["var(--color-navy)", "var(--color-crimson)"];
const initial = (): RigidPose[] => [
  { x: 0, y: 0, angle: -12, reflected: false },
  { x: 0, y: 0, angle: 24, reflected: false },
];

export function Board({
  round,
  selected,
  focus,
  onSelect,
  controlsHost,
}: {
  round: Round;
  selected: string[];
  focus: string[] | null;
  onSelect: (id: string) => void;
  controlsHost: HTMLElement | null;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 900, height: 540 });
  const [poses, setPoses] = useState(initial);
  const [active, setActive] = useState(1);
  const [zoom, setZoom] = useState(0.85);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    index: number;
    point: { x: number; y: number };
    pose: RigidPose;
    kind: "move" | "turn";
    pointer: number;
  } | null>(null);
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width && entry.contentRect.height)
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const narrow = size.width < 620 && size.height > size.width * 1.1;
  const width = Math.max(360, size.width);
  const height = Math.max(160, (size.height * width) / size.width);
  const anchors = narrow
    ? [
        { x: width / 2, y: height * 0.26 },
        { x: width / 2, y: height * 0.75 },
      ]
    : [
        { x: width * 0.25, y: height / 2 },
        { x: width * 0.75, y: height / 2 },
      ];
  const longest = narrow
    ? Math.min(width * 0.64, height * 0.37)
    : Math.min(width * 0.35, height * 0.75);
  const base = sharedDrawingPoints(round, longest);
  const absolutePose = (index: number): RigidPose => ({
    ...poses[index],
    x: anchors[index].x + poses[index].x,
    y: anchors[index].y + poses[index].y,
  });
  const polygons = base.map((points, i) =>
    rigidTransform(points, absolutePose(i)),
  );
  // A close visual fit must never turn unequal measurements into equality labels.
  const congruent = round.triangles[0].sides.every((side, index) =>
    same(side, round.triangles[1].sides[index]),
  );
  const overlap = congruent
    ? overlappingGroups(
        polygons.map((points, id) => ({ points, id })),
        5,
      )
    : [];
  const merged = overlap.length > 0;
  const camera = {
    x: (width * (1 - 1 / zoom)) / 2 + cameraOffset.x,
    y: (height * (1 - 1 / zoom)) / 2 + cameraOffset.y,
    width: width / zoom,
    height: height / zoom,
  };
  const frame = {
    x: camera.x + 8,
    y: camera.y + 8,
    width: camera.width - 16,
    height: camera.height - 16,
  };
  const visible = round.evidence;
  const occupied: LabelBox[] = [];
  const sideLabels = polygons.flatMap((points, member) => {
    if (merged && member === 1) return [];
    const mid = centre(points);
    return visible
      .filter((e) => e.kind === "side")
      .map((e) => {
        const a = points[e.index],
          b = points[(e.index + 1) % 3];
        const mx = (a.x + b.x) / 2,
          my = (a.y + b.y) / 2;
        // The outward normal stays perpendicular to the side after any rigid move.
        let nx = -(b.y - a.y),
          ny = b.x - a.x;
        if (nx * (mx - mid.x) + ny * (my - mid.y) < 0) {
          nx *= -1;
          ny *= -1;
        }
        const length = Math.hypot(nx, ny) || 1;
        const text = merged
          ? `${evidenceName(round, e, 0)} = ${evidenceName(round, e, 1)} = ${pretty(e.values[member])}`
          : pretty(e.values[member]);
        const candidates = [25, 40, 58, 78]
          .flatMap((offset) =>
            [0, -0.15, 0.15].map((slide) => {
              const tx = mx + (nx / length) * offset + (b.x - a.x) * slide,
                ty = my + (ny / length) * offset + (b.y - a.y) * slide;
              const box = {
                x: tx - text.length * 6.2 - 5,
                y: ty - 15,
                width: text.length * 12.4 + 10,
                height: 30,
              };
              const edgeHits = polygons.reduce(
                (sum, polygon) =>
                  sum +
                  polygon.filter((p, index) =>
                    edgeCrossesLabel(p, polygon[(index + 1) % 3], box),
                  ).length,
                0,
              );
              const vertexHits = polygons
                .flat()
                .filter(
                  (p) =>
                    p.x + 22 > box.x &&
                    p.x - 22 < box.x + box.width &&
                    p.y + 26 > box.y &&
                    p.y - 26 < box.y + box.height,
                ).length;
              const labelHits = occupied.filter(
                (p) =>
                  p.x + p.width > box.x &&
                  p.x < box.x + box.width &&
                  p.y + p.height > box.y &&
                  p.y < box.y + box.height,
              ).length;
              const outside =
                box.x < frame.x ||
                box.y < frame.y ||
                box.x + box.width > frame.x + frame.width ||
                box.y + box.height > frame.y + frame.height;
              return {
                ...box,
                textX: tx,
                textY: ty,
                score:
                  (edgeHits + vertexHits + labelHits) * 1000 +
                  (outside ? 2000 : 0) +
                  offset +
                  Math.abs(slide) * 50,
              };
            }),
          )
          .sort((a, b) => a.score - b.score);
        const chosen = candidates[0];
        occupied.push(chosen);
        return { id: e.id, member, text, ...chosen };
      });
  });
  const labels = placeVertexLabels(
    polygons.flatMap((points, member) => {
      if (merged) return [];
      const mid = centre(points);
      return points.map((point) => ({
        key: `${member}-${point.label}`,
        text: point.label,
        point,
        fontSize: 27,
        preferred: { x: point.x - mid.x, y: point.y - mid.y },
      }));
    }),
    polygons,
    sideLabels,
    frame,
  );
  const angleLabels = polygons.map((points, member) =>
    placeAngleLabels(
      visible
        .filter((e) => e.kind === "angle")
        .map((e) => ({
          key: e.id,
          text: `${pretty(e.values[member])}°`,
          vertex: points[e.index],
          first: points[(e.index + 2) % 3],
          last: points[(e.index + 1) % 3],
          right: same(e.values[member], 90),
          arcCount: same(...e.values) ? e.index + 1 : 1,
        })),
      {
        fontSize: 23,
        size: 1.05,
        vertices: points,
        polygons,
        reserved: [...labels.values(), ...sideLabels],
      },
    ),
  );
  function fitView() {
    const boxes = [
      ...labels.values(),
      ...sideLabels,
      ...angleLabels.flatMap((set) => [...set.values()]),
    ];
    const content = [
      ...polygons.flat(),
      ...boxes.flatMap((box) => [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
      ]),
    ];
    const left = Math.min(...content.map((p) => p.x)) - 22;
    const top = Math.min(...content.map((p) => p.y)) - 22;
    const right = Math.max(...content.map((p) => p.x)) + 22;
    const bottom = Math.max(...content.map((p) => p.y)) + 22;
    setZoom(Math.min(2, width / (right - left), height / (bottom - top)));
    setCameraOffset({
      x: (left + right - width) / 2,
      y: (top + bottom - height) / 2,
    });
  }
  function location(event: PointerEvent) {
    const inverse = svg.current?.getScreenCTM()?.inverse();
    return inverse
      ? new DOMPoint(event.clientX, event.clientY).matrixTransform(inverse)
      : { x: 0, y: 0 };
  }
  function storeAbsolute(index: number, pose: RigidPose) {
    setPoses((old) =>
      old.map((item, i) =>
        i === index
          ? {
              ...pose,
              x: pose.x - anchors[index].x,
              y: pose.y - anchors[index].y,
            }
          : item,
      ),
    );
  }
  function change(patch: Partial<RigidPose>, index = active) {
    setPoses((old) =>
      old.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  function begin(
    event: PointerEvent<SVGGElement | SVGCircleElement>,
    index: number,
    kind: "move" | "turn",
  ) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setActive(index);
    drag.current = {
      index,
      point: location(event),
      pose: absolutePose(index),
      kind,
      pointer: event.pointerId,
    };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    const point = location(event);
    const pose =
      current.kind === "turn"
        ? turnAtVertex(current.pose, current.point, point)
        : {
            ...current.pose,
            x: Math.max(
              55,
              Math.min(width - 55, current.pose.x + point.x - current.point.x),
            ),
            y: Math.max(
              55,
              Math.min(height - 55, current.pose.y + point.y - current.point.y),
            ),
          };
    storeAbsolute(current.index, pose);
  }
  function end() {
    const current = drag.current;
    if (current) {
      const snapped = snapPose(
        base[current.index],
        polygons[1 - current.index],
        absolutePose(current.index),
        45,
      );
      if (snapped) storeAbsolute(current.index, snapped);
    }
    drag.current = null;
  }
  function select(evidence: Evidence) {
    if (focus === null) onSelect(evidence.id);
  }
  return (
    <div className={styles.board}>
      <div className={styles.legend}>
        <span>{c.navyTriangle}</span>
        <span>{c.redTriangle}</span>
      </div>
      <div ref={viewport} className={styles.drawing}>
        <svg
          ref={svg}
          viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`}
          className={styles.canvas}
          aria-label={c.diagram}
          data-testid="congruence-game-board"
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <title>{c.diagram}</title>
          {polygons.map((points, member) => {
            const angles = angleLabels[member];
            return (
              <g
                key={member}
                data-testid={`congruence-game-triangle-${member}`}
                data-angle={poses[member].angle}
                data-reflected={poses[member].reflected}
                data-scale="1"
              >
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={member ? c.redTriangle : c.navyTriangle}
                  className={styles.draggable}
                  onPointerDown={(event) => begin(event, member, "move")}
                  onKeyDown={(event) => {
                    const pose = poses[member];
                    const patch =
                      event.key === "ArrowLeft"
                        ? { x: pose.x - 10 }
                        : event.key === "ArrowRight"
                          ? { x: pose.x + 10 }
                          : event.key === "ArrowUp"
                            ? { y: pose.y - 10 }
                            : event.key === "ArrowDown"
                              ? { y: pose.y + 10 }
                              : event.key.toLowerCase() === "r"
                                ? { angle: pose.angle + 15 }
                                : null;
                    if (patch) {
                      event.preventDefault();
                      setActive(member);
                      change(patch, member);
                    }
                  }}
                >
                  <polygon
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill={colours[member]}
                    fillOpacity=".07"
                    stroke={colours[member]}
                    strokeWidth={active === member ? 3.8 : 2.6}
                  />
                </g>
                {visible.map((e) => {
                  const lit = focus
                    ? focus.includes(e.id)
                    : selected.includes(e.id);
                  const opacity = focus !== null && !lit ? 0.18 : 1;
                  const equal = same(...e.values);
                  if (e.kind === "side") {
                    const a = points[e.index],
                      b = points[(e.index + 1) % 3];
                    const length = Math.hypot(b.x - a.x, b.y - a.y);
                    const dx = (b.x - a.x) / length,
                      dy = (b.y - a.y) / length;
                    return (
                      <g
                        key={e.id}
                        opacity={opacity}
                        data-game-mark={e.id}
                        data-lit={lit}
                        className={styles.clue}
                        onClick={() => select(e)}
                      >
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke="transparent"
                          strokeWidth="24"
                        />
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={colours[member]}
                          strokeWidth={lit ? 7 : 3}
                        />
                        {equal &&
                          Array.from({ length: e.index + 1 }, (_, index) => {
                            const offset = (index - e.index / 2) * 8;
                            const x = (a.x + b.x) / 2 + dx * offset,
                              y = (a.y + b.y) / 2 + dy * offset;
                            return (
                              <line
                                key={index}
                                x1={x - dy * 8}
                                y1={y + dx * 8}
                                x2={x + dy * 8}
                                y2={y - dx * 8}
                                stroke={colours[member]}
                                strokeWidth="2.5"
                              />
                            );
                          })}
                      </g>
                    );
                  }
                  if (merged && member === 1) return null;
                  const label = angles.get(e.id)!;
                  const vertex = points[e.index];
                  const right = same(e.values[member], 90);
                  const paths = Array.from(
                    { length: right || !equal ? 1 : e.index + 1 },
                    (_, index) => {
                      const r = label.radius + index * label.arcGap;
                      const a = {
                        x: vertex.x + r * Math.cos(label.start),
                        y: vertex.y + r * Math.sin(label.start),
                      };
                      const b = {
                        x: vertex.x + r * Math.cos(label.start + label.turn),
                        y: vertex.y + r * Math.sin(label.start + label.turn),
                      };
                      return right
                        ? `M${a.x},${a.y} L${a.x + b.x - vertex.x},${a.y + b.y - vertex.y} L${b.x},${b.y}`
                        : `M${a.x},${a.y} A${r},${r} 0 0 ${label.turn > 0 ? 1 : 0} ${b.x},${b.y}`;
                    },
                  ).join(" ");
                  return (
                    <g
                      key={e.id}
                      opacity={opacity}
                      data-game-mark={e.id}
                      data-lit={lit}
                      className={styles.clue}
                      onClick={() => select(e)}
                    >
                      <path
                        d={paths}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="23"
                      />
                      <path
                        d={paths}
                        fill="none"
                        stroke={colours[member]}
                        strokeWidth={lit ? 4 : 2.5}
                        strokeDasharray={equal ? undefined : "4 3"}
                      />
                      {label.leader && (
                        <line
                          x1={label.leader.from.x}
                          y1={label.leader.from.y}
                          x2={label.leader.to.x}
                          y2={label.leader.to.y}
                          stroke={colours[member]}
                        />
                      )}
                      <text
                        x={label.textX}
                        y={label.textY}
                        fontSize="23"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={colours[member]}
                        className={styles.mathLabel}
                      >
                        {pretty(e.values[member])}°
                      </text>
                    </g>
                  );
                })}
                {sideLabels
                  .filter((label) => label.member === member)
                  .map((label) => (
                    <text
                      key={label.id}
                      x={label.textX}
                      y={label.textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="23"
                      fill={colours[member]}
                      className={styles.mathLabel}
                      onClick={() => focus === null && onSelect(label.id)}
                      opacity={
                        focus !== null && !focus.includes(label.id) ? 0.18 : 1
                      }
                    >
                      {label.text}
                    </text>
                  ))}
                {points.map((point) => {
                  const label = labels.get(`${member}-${point.label}`);
                  return (
                    <g key={point.label}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        role="button"
                        tabIndex={0}
                        aria-label={`${point.label}: ${c.turnVertex}`}
                        fill="transparent"
                        stroke={active === member ? colours[member] : "none"}
                        strokeOpacity=".3"
                        onPointerDown={(event) => begin(event, member, "turn")}
                        onKeyDown={(event) => {
                          if (
                            [
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                            ].includes(event.key)
                          ) {
                            event.preventDefault();
                            setActive(member);
                            change(
                              {
                                angle:
                                  poses[member].angle +
                                  (["ArrowLeft", "ArrowDown"].includes(
                                    event.key,
                                  )
                                    ? -15
                                    : 15),
                              },
                              member,
                            );
                          }
                        }}
                        className={styles.turnHandle}
                      >
                        <title>{c.turnVertex}</title>
                      </circle>
                      {label && (
                        <text
                          x={label.textX}
                          y={label.textY}
                          textAnchor="middle"
                          fontSize="27"
                          fill={colours[member]}
                          className={styles.vertexLabel}
                        >
                          {point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <PairedVertexLabels
            groups={overlap}
            shapes={polygons.map((points, id) => ({
              id,
              points,
              colour: colours[id],
            }))}
            frame={frame}
            obstacles={sideLabels}
            fontSize={26}
          />
        </svg>
      </div>
      <div className={styles.controlsStrip}>
        <div className={styles.cameraTools} role="group" aria-label={c.diagram}>
          <button
            aria-label={c.zoomOut}
            disabled={zoom <= 0.65}
            onClick={() => setZoom((old) => Math.max(0.65, old / 1.2))}
          >
            −
          </button>
          <button
            aria-label={c.zoomIn}
            disabled={zoom >= 2}
            onClick={() => setZoom((old) => Math.min(2, old * 1.2))}
          >
            +
          </button>
          <button onClick={fitView}>{c.fit}</button>
          <button
            onClick={() => {
              setCameraOffset({ x: 0, y: 0 });
              setZoom(0.85);
            }}
          >
            {c.resetView}
          </button>
        </div>
      </div>
      <p className={styles.diagramNote}>{c.diagramNote}</p>
      {controlsHost &&
        createPortal(
          <>
            <div className={styles.boardTools}>
              <div
                role="group"
                aria-label={c.activeTriangle}
                className={styles.trianglePicker}
              >
                {[c.navyTriangle, c.redTriangle].map((name, member) => (
                  <button
                    key={member}
                    aria-pressed={active === member}
                    onClick={() => setActive(member)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className={styles.transformTools}>
                <button
                  onClick={() => change({ angle: poses[active].angle - 15 })}
                >
                  ↶ {c.rotateLeft}
                </button>
                <button
                  onClick={() => change({ angle: poses[active].angle + 15 })}
                >
                  ↷ {c.rotateRight}
                </button>
                <button
                  onClick={() =>
                    change(reflectPose(poses[active], "horizontal"))
                  }
                >
                  ↔ {c.flipHorizontal}
                </button>
                <button
                  onClick={() => change(reflectPose(poses[active], "vertical"))}
                >
                  ↕ {c.flipVertical}
                </button>
                <button
                  onClick={() => {
                    const target = polygons[1 - active];
                    const current = absolutePose(active);
                    const fitted =
                      snapPose(
                        base[active],
                        target,
                        { ...current, ...centre(target) },
                        Infinity,
                      ) ?? alignPose(base[active], target, current);
                    storeAbsolute(active, fitted);
                  }}
                >
                  {c.snap}
                </button>
                <button onClick={() => setPoses(initial())}>
                  {c.separate}
                </button>
              </div>
            </div>
            <details className={styles.boardHelp}>
              <summary>{c.moveHint}</summary>
              <p>{c.transformNote}</p>
              <div className={styles.moveTools}>
                {[
                  [c.moveLeft, -12, 0],
                  [c.moveRight, 12, 0],
                  [c.moveUp, 0, -12],
                  [c.moveDown, 0, 12],
                ].map(([name, x, y]) => (
                  <button
                    key={name}
                    onClick={() =>
                      change({
                        x: poses[active].x + Number(x),
                        y: poses[active].y + Number(y),
                      })
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>
            </details>
          </>,
          controlsHost,
        )}
    </div>
  );
}
