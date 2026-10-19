import { useRef, useState, type PointerEvent, type RefObject } from "react";
import { copy } from "@/lib/copy";
import { bounds } from "./geometry";
import type { Point } from "./types";
import styles from "./similarity.module.css";

type Frame = { x: number; y: number; width: number; height: number };
type Camera = { frame: Frame; zoom: number };
/** Change the camera only: original lengths and shape transforms stay untouched. */
export function useDiagramView(
  defaultFrame: Frame,
  content: Point[],
  margin: number,
  svg: RefObject<SVGSVGElement | null>,
) {
  const [camera, setCamera] = useState<Camera | null>(null);
  const pan = useRef<{
    x: number;
    y: number;
    scale: number;
    camera: Camera;
    pointerId: number;
  } | null>(null);
  const base = camera?.frame ?? defaultFrame,
    zoom = camera?.zoom ?? 1;
  const frame = {
    x: base.x + (base.width * (1 - 1 / zoom)) / 2,
    y: base.y + (base.height * (1 - 1 / zoom)) / 2,
    width: base.width / zoom,
    height: base.height / zoom,
  };
  function setZoom(next: number) {
    setCamera((prev) => ({
      frame: prev?.frame ?? defaultFrame,
      zoom: Math.max(0.5, Math.min(4, next)),
    }));
  }
  function fit(points = content) {
    if (points.length) setCamera({ frame: bounds(points, margin), zoom: 1 });
  }
  function startPan(event: PointerEvent<SVGSVGElement>) {
    if (
      event.button !== 0 ||
      (event.target !== event.currentTarget &&
        !(event.target as Element).hasAttribute("data-pan-background"))
    )
      return;
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return;
    pan.current = {
      x: event.clientX,
      y: event.clientY,
      scale: Math.hypot(matrix.a, matrix.b),
      camera: camera ?? { frame: defaultFrame, zoom: 1 },
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function movePan(event: PointerEvent<SVGSVGElement>) {
    const p = pan.current;
    if (!p || p.pointerId !== event.pointerId) return false;
    setCamera({
      ...p.camera,
      frame: {
        ...p.camera.frame,
        x: p.camera.frame.x - (event.clientX - p.x) / p.scale,
        y: p.camera.frame.y - (event.clientY - p.y) / p.scale,
      },
    });
    return true;
  }
  function endPan() {
    const wasPanning = !!pan.current;
    pan.current = null;
    return wasPanning;
  }
  return {
    frame,
    zoom,
    setZoom,
    fit,
    reset: () => setCamera(null),
    startPan,
    movePan,
    endPan,
  };
}

export function DiagramViewControls({
  title,
  view,
}: {
  title: string;
  view: ReturnType<typeof useDiagramView>;
}) {
  const c = copy.similarity;
  return (
    <div
      className={styles.viewControls}
      role="group"
      aria-label={`${title} ${c.view}`}
    >
      <label>
        {c.diagramZoom} <output>{Math.round(view.zoom * 100)}%</output>
        <input
          type="range"
          min="50"
          max="400"
          step="10"
          value={Math.round(view.zoom * 100)}
          aria-label={`${c.diagramZoom} — ${title}`}
          onChange={(e) => view.setZoom(Number(e.target.value) / 100)}
        />
      </label>
      <button
        aria-label={`${c.zoomOut} — ${title}`}
        disabled={view.zoom <= 0.5}
        onClick={() => view.setZoom(view.zoom / 1.25)}
      >
        −
      </button>
      <button
        aria-label={`${c.zoomIn} — ${title}`}
        disabled={view.zoom >= 4}
        onClick={() => view.setZoom(view.zoom * 1.25)}
      >
        +
      </button>
      <button onClick={() => view.fit()}>{c.fitTriangles}</button>
      <button onClick={view.reset}>{c.resetView}</button>
      <small>{c.panHint}</small>
    </div>
  );
}
