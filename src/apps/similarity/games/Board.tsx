"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { copy } from "@/lib/copy";
import { centre, transform, type Pose } from "../geometry";
import { placeVertexLabels } from "../vertexLabels";
import { placeAngleLabels } from "../angleLabels";
import type { Point } from "../types";
import type { Round } from "./model";
import styles from "./games.module.css";

const c = copy.similarityGames;
const colours = ["var(--color-navy)", "var(--color-crimson)"];
const angleName = (names: string[], i: number) =>
  names[(i + 2) % 3] + names[i] + names[(i + 1) % 3];
export const evidenceName = (round: Round, id: string, member: number) => {
  const e = round.evidence.find((item) => item.id === id)!;
  const names = round.triangles[member].names;
  return e.kind === "angle"
    ? `∠${angleName(names, e.index)}`
    : names[e.index] + names[(e.index + 1) % 3];
};
const initial = () => [
  { x: 0, y: 0, angle: -12, flipX: 1, flipY: 1, scale: 1 },
  { x: 0, y: 0, angle: 22, flipX: 1, flipY: 1, scale: 1 },
];
const pretty = (n: number) => String(Number(n.toFixed(2)));

export function Board({
  round,
  selected,
  focus,
  focusMembers,
  onSelect,
  thirdKnown = true,
}: {
  round: Round;
  selected: string[];
  focus: string[] | null;
  focusMembers?: number[];
  onSelect: (id: string) => void;
  thirdKnown?: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [poses, setPoses] = useState<Pose[]>(initial);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{
    index: number;
    point: Point;
    pose: Pose;
    centre: Point;
    kind: "move" | "turn";
    pointer: number;
  } | null>(null);
  useEffect(() => {
    if (!wrapper.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setNarrow(entry.contentRect.width < 560),
    );
    observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);
  const width = narrow ? 440 : 840,
    height = narrow ? 700 : 420;
  const anchors = narrow
    ? [
        [220, 175],
        [220, 515],
      ]
    : [
        [220, 220],
        [620, 220],
      ];
  const base = round.triangles.map((t) => {
    const mid = centre(t.points);
    const radius = Math.max(
      ...t.points.map((p) => Math.hypot(p.x - mid.x, p.y - mid.y)),
    );
    return t.points.map((p) => ({
      ...p,
      x: ((p.x - mid.x) * 110) / radius,
      y: ((p.y - mid.y) * 110) / radius,
    }));
  });
  const polygons = base.map((ps, i) =>
    transform(ps, {
      ...poses[i],
      x: anchors[i][0] + poses[i].x,
      y: anchors[i][1] + poses[i].y,
    }),
  );
  const evidence = round.evidence.filter(
    (e) =>
      (focus === null || focus.includes(e.id)) &&
      (thirdKnown || e.kind !== "angle" || e.index !== 2),
  );
  const sideLabels = polygons.flatMap((ps, member) => {
    if (focusMembers && !focusMembers.includes(member)) return [];
    const mid = centre(ps);
    return evidence
      .filter((e) => e.kind === "side")
      .map((e) => {
        const a = ps[e.index],
          b = ps[(e.index + 1) % 3];
        const x = (a.x + b.x) / 2,
          y = (a.y + b.y) / 2;
        const dx = x - mid.x,
          dy = y - mid.y,
          length = Math.hypot(dx, dy) || 1;
        const text = `${evidenceName(round, e.id, member)} = ${pretty(e.values[member])}`;
        const tx = x + (dx / length) * 28,
          ty = y + (dy / length) * 28;
        return {
          id: e.id,
          member,
          text,
          textX: tx,
          textY: ty,
          x: tx - text.length * 5.8,
          y: ty - 13,
          width: text.length * 11.6,
          height: 26,
        };
      });
  });
  const vertices = placeVertexLabels(
    polygons.flatMap((ps, i) => {
      const mid = centre(ps);
      return ps.map((p) => ({
        key: `${i}-${p.label}`,
        text: p.label,
        point: p,
        fontSize: 26,
        preferred: { x: p.x - mid.x, y: p.y - mid.y },
      }));
    }),
    polygons,
    sideLabels,
  );
  function location(
    event: PointerEvent<SVGSVGElement | SVGGElement | SVGCircleElement>,
  ): Point {
    const matrix = svg.current?.getScreenCTM()?.inverse();
    if (!matrix) return { x: 0, y: 0, label: "" };
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix,
    );
    return { x: p.x, y: p.y, label: "" };
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
      pose: poses[index],
      centre: { ...centre(polygons[index]), label: "" },
      kind,
      pointer: event.pointerId,
    };
    svg.current?.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d || d.pointer !== event.pointerId) return;
    const p = location(event);
    const next = { ...d.pose };
    if (d.kind === "move") {
      next.x += p.x - d.point.x;
      next.y += p.y - d.point.y;
      next.x = Math.max(
        -anchors[d.index][0] + 100,
        Math.min(width - anchors[d.index][0] - 100, next.x),
      );
      next.y = Math.max(
        -anchors[d.index][1] + 100,
        Math.min(height - anchors[d.index][1] - 100, next.y),
      );
    } else {
      const original = Math.atan2(
        d.point.y - d.centre.y,
        d.point.x - d.centre.x,
      );
      const current = Math.atan2(p.y - d.centre.y, p.x - d.centre.x);
      next.angle += ((current - original) * 180) / Math.PI;
      next.scale = Math.max(
        0.55,
        Math.min(
          1.4,
          (d.pose.scale * Math.hypot(p.x - d.centre.x, p.y - d.centre.y)) /
            Math.max(
              1,
              Math.hypot(d.point.x - d.centre.x, d.point.y - d.centre.y),
            ),
        ),
      );
    }
    setPoses((old) => old.map((pose, i) => (i === d.index ? next : pose)));
  }
  function change(patch: Partial<Pose>, index = active) {
    setPoses((old) =>
      old.map((pose, i) => (i === index ? { ...pose, ...patch } : pose)),
    );
  }
  return (
    <div className={styles.board} ref={wrapper}>
      <div
        className={styles.boardTools}
        role="group"
        aria-label={c.chooseTriangle}
      >
        {round.triangles.map((t, i) => (
          <button
            key={i}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            <i>△{t.names.join("")}</i>
          </button>
        ))}
        <button onClick={() => change({ angle: poses[active].angle - 15 })}>
          {c.turnLeft}
        </button>
        <button onClick={() => change({ angle: poses[active].angle + 15 })}>
          {c.turnRight}
        </button>
        <button onClick={() => change({ flipX: -poses[active].flipX })}>
          {c.flip}
        </button>
        <button
          aria-label={c.zoomOut}
          disabled={zoom <= 0.75}
          onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
        >
          −
        </button>
        <button
          aria-label={c.zoomIn}
          disabled={zoom >= 1.5}
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.25))}
        >
          +
        </button>
        <button
          onClick={() => {
            setPoses(initial());
            setZoom(1);
          }}
        >
          {c.resetView}
        </button>
      </div>
      <p className={styles.boardHint}>{c.boardHint}</p>
      <svg
        ref={svg}
        className={styles.canvas}
        data-testid="game-board"
        data-narrow={narrow}
        role="img"
        aria-label={c.board}
        viewBox={`${(width * (1 - 1 / zoom)) / 2} ${(height * (1 - 1 / zoom)) / 2} ${width / zoom} ${height / zoom}`}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {polygons.map((ps, member) => {
          const memberEvidence =
            focusMembers && !focusMembers.includes(member) ? [] : evidence;
          const angles = placeAngleLabels(
            memberEvidence
              .filter((e) => e.kind === "angle")
              .map((e) => ({
                key: e.id,
                vertex: ps[e.index],
                first: ps[(e.index + 2) % 3],
                last: ps[(e.index + 1) % 3],
                text: `${pretty(e.values[member])}°`,
                arcCount:
                  Math.abs(e.values[0] - e.values[1]) < 1e-9 ? e.index + 1 : 1,
                right: Math.abs(e.values[member] - 90) < 1e-6,
              })),
            {
              fontSize: 22,
              vertices: ps,
              polygons: [ps],
              reserved: [...vertices.values(), ...sideLabels],
            },
          );
          return (
            <g
              key={member}
              data-testid={`game-triangle-${member}`}
              data-angle={poses[member].angle}
              data-scale={poses[member].scale}
              data-x={poses[member].x}
            >
              <g
                role="button"
                tabIndex={0}
                aria-label={`${c.moveTriangle} ${round.triangles[member].names.join("")}`}
                className={styles.dragTriangle}
                onPointerDown={(e) => begin(e, member, "move")}
                onKeyDown={(e) => {
                  const p = poses[member];
                  const patch =
                    e.key === "ArrowLeft"
                      ? { x: p.x - 8 }
                      : e.key === "ArrowRight"
                        ? { x: p.x + 8 }
                        : e.key === "ArrowUp"
                          ? { y: p.y - 8 }
                          : e.key === "ArrowDown"
                            ? { y: p.y + 8 }
                            : e.key.toLowerCase() === "r"
                              ? { angle: p.angle + 15 }
                              : e.key.toLowerCase() === "h"
                                ? { flipX: -p.flipX }
                                : null;
                  if (patch) {
                    e.preventDefault();
                    setActive(member);
                    change(patch, member);
                  }
                }}
              >
                <polygon
                  points={ps.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={colours[member]}
                  fillOpacity=".1"
                  stroke={colours[member]}
                  strokeWidth={3}
                />
              </g>
              {memberEvidence.map((e) => {
                const lit = focus !== null || selected.includes(e.id);
                const stroke = lit
                  ? "var(--color-crimson)"
                  : "var(--color-navy)";
                const event = () => {
                  if (focus === null) onSelect(e.id);
                };
                if (e.kind === "side") {
                  const a = ps[e.index],
                    b = ps[(e.index + 1) % 3];
                  return (
                    <g
                      key={e.id}
                      data-game-mark={e.id}
                      data-lit={lit}
                      onClick={event}
                      className={styles.clueMark}
                    >
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="transparent"
                        strokeWidth="22"
                      />
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={stroke}
                        strokeWidth={lit ? 7 : 3}
                        strokeDasharray={e.index === 1 ? "9 4" : undefined}
                        pointerEvents="none"
                      />
                    </g>
                  );
                }
                const label = angles.get(e.id)!;
                const vertex = ps[e.index],
                  r = label.radius;
                const at = (a: number) => [
                  vertex.x + r * Math.cos(a),
                  vertex.y + r * Math.sin(a),
                ];
                const a = at(label.start),
                  b = at(label.start + label.turn);
                const right = Math.abs(e.values[member] - 90) < 1e-6;
                const equal = Math.abs(e.values[0] - e.values[1]) < 1e-9;
                const path = right
                  ? `M${a} L${a[0] + b[0] - vertex.x},${a[1] + b[1] - vertex.y} L${b}`
                  : Array.from({ length: equal ? e.index + 1 : 1 }, (_, i) => {
                      const radius = r + i * label.arcGap;
                      const start = [
                        vertex.x + radius * Math.cos(label.start),
                        vertex.y + radius * Math.sin(label.start),
                      ];
                      const end = [
                        vertex.x + radius * Math.cos(label.start + label.turn),
                        vertex.y + radius * Math.sin(label.start + label.turn),
                      ];
                      return `M${start} A${radius},${radius} 0 ${Math.abs(label.turn) > Math.PI ? 1 : 0} ${label.turn > 0 ? 1 : 0} ${end}`;
                    }).join(" ");
                return (
                  <g
                    key={e.id}
                    data-game-mark={e.id}
                    data-lit={lit}
                    onClick={event}
                    className={styles.clueMark}
                  >
                    <path
                      d={path}
                      stroke="transparent"
                      strokeWidth="20"
                      fill="none"
                    />
                    <path
                      data-testid={
                        equal ? "equality-angle-mark" : "measurement-angle-mark"
                      }
                      d={path}
                      stroke={equal ? stroke : "var(--color-pencil)"}
                      strokeWidth={equal && lit ? 3 : 2}
                      strokeDasharray={equal ? undefined : "3 4"}
                      fill="none"
                    />
                    {label.leader && (
                      <line
                        x1={label.leader.from.x}
                        y1={label.leader.from.y}
                        x2={label.leader.to.x}
                        y2={label.leader.to.y}
                        stroke={stroke}
                      />
                    )}
                    <text
                      data-testid="game-angle-label"
                      x={label.textX}
                      y={label.textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="22"
                      fill={stroke}
                      className={styles.mathLabel}
                    >
                      {pretty(e.values[member])}°
                    </text>
                  </g>
                );
              })}
              {sideLabels
                .filter((l) => l.member === member)
                .map((l) => (
                  <text
                    key={l.id}
                    x={l.textX}
                    y={l.textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    className={styles.mathLabel}
                    fill={colours[member]}
                    onClick={() => focus === null && onSelect(l.id)}
                  >
                    {l.text}
                  </text>
                ))}
              {ps.map((p) => {
                const label = vertices.get(`${member}-${p.label}`)!;
                return (
                  <g key={p.label}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={8}
                      fill="var(--color-paper)"
                      stroke={colours[member]}
                      strokeWidth="2.5"
                      role="button"
                      tabIndex={0}
                      aria-label={`${c.handle} ${p.label}`}
                      className={styles.vertexHandle}
                      onPointerDown={(e) => begin(e, member, "turn")}
                      onKeyDown={(e) => {
                        const pose = poses[member];
                        const patch =
                          e.key === "ArrowLeft"
                            ? { angle: pose.angle - 5 }
                            : e.key === "ArrowRight"
                              ? { angle: pose.angle + 5 }
                              : e.key === "ArrowUp"
                                ? { scale: Math.min(1.4, pose.scale + 0.05) }
                                : e.key === "ArrowDown"
                                  ? { scale: Math.max(0.55, pose.scale - 0.05) }
                                  : null;
                        if (patch) {
                          e.preventDefault();
                          change(patch, member);
                        }
                      }}
                    />
                    <text
                      data-testid="game-vertex-label"
                      x={label.textX}
                      y={label.textY}
                      fontSize="26"
                      textAnchor="middle"
                      fill={colours[member]}
                      className={styles.vertexName}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className={styles.boardHint}>
        {c.schematic} {c.originalLengths}
      </p>
    </div>
  );
}
