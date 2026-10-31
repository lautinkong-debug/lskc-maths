"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  MAX_STROKE_POINTS,
  inkPath,
  strokeAlongSegment,
  type InkPoint,
  type InkStroke,
} from "./ink";
import type { InkBoardController, InkMode } from "./useInkBoard";
import s from "./ink.module.css";

type Bounds = { x: number; y: number; width: number; height: number };
type Gesture = {
  pointerId: number;
  mode: Exclude<InkMode, "move">;
  stroke: InkStroke;
  erased: Set<string>;
  previous: InkPoint;
  target: SVGGElement;
};

/** Sits inside the same SVG coordinate system as the geometric construction. */
export default function InkLayer({
  board,
  svgRef,
}: {
  board: InkBoardController;
  svgRef: RefObject<SVGSVGElement | null>;
}) {
  const id = useId();
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [draft, setDraft] = useState<InkStroke | null>(null);
  const [erased, setErased] = useState<string[]>([]);
  const gesture = useRef<Gesture | null>(null);

  function visibleBounds(): Bounds | null {
    const svg = svgRef.current,
      matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const rect = svg.getBoundingClientRect();
    const inverse = matrix.inverse();
    const start = new DOMPoint(rect.left, rect.top).matrixTransform(inverse);
    const end = new DOMPoint(rect.right, rect.bottom).matrixTransform(inverse);
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const update = () => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const rect = svg.getBoundingClientRect(),
        inverse = matrix.inverse();
      const a = new DOMPoint(rect.left, rect.top).matrixTransform(inverse);
      const b = new DOMPoint(rect.right, rect.bottom).matrixTransform(inverse);
      setBounds({
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(svg);
    const frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [svgRef]);

  useEffect(() => {
    const active = gesture.current;
    if (!active || active.mode === board.mode) return;
    gesture.current = null;
    if (active.target.hasPointerCapture(active.pointerId))
      active.target.releasePointerCapture(active.pointerId);
    // Cancelling an external pointer gesture (e.g. Escape) discards its preview.
    setDraft(null);
    setErased([]);
  }, [board.mode]);

  function locate(clientX: number, clientY: number): InkPoint | null {
    const matrix = svgRef.current?.getScreenCTM(),
      viewport = visibleBounds();
    if (!matrix || !viewport) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return {
      x: Math.max(viewport.x, Math.min(viewport.x + viewport.width, p.x)),
      y: Math.max(viewport.y, Math.min(viewport.y + viewport.height, p.y)),
    };
  }
  function eraseNear(active: Gesture, point: InkPoint) {
    for (const stroke of board.strokes)
      if (strokeAlongSegment(stroke, active.previous, point, 8))
        active.erased.add(stroke.id);
    active.previous = point;
    setErased([...active.erased]);
  }
  function begin(event: PointerEvent<SVGGElement>) {
    if (
      board.mode === "move" ||
      gesture.current ||
      event.button !== 0 ||
      !event.isPrimary
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    const point = locate(event.clientX, event.clientY);
    if (!point || (board.mode === "pen" && board.limitReached)) return;
    const active: Gesture = {
      pointerId: event.pointerId,
      mode: board.mode,
      stroke: {
        id: `ink-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        colour: board.colour,
        width: board.width,
        points: [point],
      },
      erased: new Set(),
      previous: point,
      target: event.currentTarget,
    };
    gesture.current = active;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (active.mode === "pen") setDraft({ ...active.stroke });
    else eraseNear(active, point);
  }
  function move(event: PointerEvent<SVGGElement>) {
    if (board.mode !== "move") event.stopPropagation();
    const active = gesture.current;
    if (!active || event.pointerId !== active.pointerId) return;
    event.preventDefault();
    const events = event.nativeEvent.getCoalescedEvents?.();
    for (const sample of events?.length ? events : [event.nativeEvent]) {
      const point = locate(sample.clientX, sample.clientY);
      if (!point) continue;
      if (active.mode === "erase") eraseNear(active, point);
      else {
        const previous = active.stroke.points[active.stroke.points.length - 1];
        if (Math.hypot(point.x - previous.x, point.y - previous.y) < 0.6)
          continue;
        if (active.stroke.points.length >= MAX_STROKE_POINTS) {
          // Retain the entire long gesture by reducing sampling density, not its end.
          active.stroke.points = active.stroke.points.filter(
            (_, index) => index % 2 === 0,
          );
        }
        active.stroke.points.push(point);
      }
    }
    if (active.mode === "pen")
      setDraft({ ...active.stroke, points: [...active.stroke.points] });
  }
  function finish(event: PointerEvent<SVGGElement>, commit: boolean) {
    if (board.mode !== "move") event.stopPropagation();
    const active = gesture.current;
    if (!active || event.pointerId !== active.pointerId) return;
    gesture.current = null;
    if (commit) {
      const point = locate(event.clientX, event.clientY);
      if (point && active.mode === "pen") active.stroke.points.push(point);
      if (point && active.mode === "erase") eraseNear(active, point);
      if (active.mode === "pen") board.addStroke(active.stroke);
      else board.eraseStrokes([...active.erased]);
    }
    setDraft(null);
    setErased([]);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  const path = (stroke: InkStroke) => (
    <path
      key={stroke.id}
      data-ink-stroke={stroke.id}
      d={inkPath(stroke.points)}
      fill="none"
      stroke={stroke.colour}
      strokeWidth={stroke.width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  return (
    <g
      className={s.layer}
      data-ink-mode={board.mode}
      clipPath={bounds ? `url(#${id}-clip)` : undefined}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={(event) => finish(event, true)}
      onPointerCancel={(event) => finish(event, false)}
      onLostPointerCapture={(event) => finish(event, false)}
    >
      {bounds && (
        <defs>
          <clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse">
            <rect {...bounds} />
          </clipPath>
        </defs>
      )}
      <g className={s.inkPaths} aria-label="Teacher annotations">
        {board.strokes
          .filter((stroke) => !erased.includes(stroke.id))
          .map(path)}
        {draft && path(draft)}
      </g>
      {board.mode !== "move" && bounds && (
        <rect
          {...bounds}
          fill="transparent"
          className={s.capture}
          role="presentation"
          aria-label={
            board.mode === "pen"
              ? "Draw on the circle and whiteboard"
              : "Erase annotations"
          }
        />
      )}
    </g>
  );
}
