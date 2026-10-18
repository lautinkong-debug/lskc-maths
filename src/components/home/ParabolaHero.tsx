"use client";

import { useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { CanvasGrid } from "./CanvasGrid";
import { copy } from "@/lib/copy";

const A = 0.5;
const X_MIN = -6;
const X_MAX = 6;
const Y_MIN = -4;
const Y_MAX = 5;
const UNIT = 40;
const STEP = 0.5;

const H_RANGE = { min: -4, max: 4 };
const K_RANGE = { min: -3, max: 3 };

const WIDTH = (X_MAX - X_MIN) * UNIT;
const HEIGHT = (Y_MAX - Y_MIN) * UNIT;

const toSvgX = (x: number) => (x - X_MIN) * UNIT;
const toSvgY = (y: number) => (Y_MAX - y) * UNIT;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const snap = (v: number) => Math.round(v / STEP) * STEP;

/** Tidy number for display: 2, -3, 1.5 - never "2.0" or "-0". */
const num = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return r === 0 ? 0 : r;
};

function curvePath(h: number, k: number) {
  const points: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / 240;
    const y = A * (x - h) * (x - h) + k;
    points.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}

/** `y = 0.5(x - 2)^2 - 3`, with the awkward cases spelled properly. */
function vertexFormTex(h: number, k: number) {
  const inner =
    h === 0 ? "x" : h > 0 ? `x - ${num(h)}` : `x + ${num(Math.abs(h))}`;
  const tail = k === 0 ? "" : k > 0 ? ` + ${num(k)}` : ` - ${num(Math.abs(k))}`;
  return `y = ${A}(${inner})^{2}${tail}`;
}

export function ParabolaHero() {
  const [h, setH] = useState(1);
  const [k, setK] = useState(-2);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  // y = 0 when (x - h)^2 = -k / A. Real roots need -k / A >= 0.
  const rootOffsetSquared = -k / A;
  const hasRoots = rootOffsetSquared >= 0;
  const rootOffset = hasRoots ? Math.sqrt(rootOffsetSquared) : 0;
  const roots = hasRoots ? [h - rootOffset, h + rootOffset] : [];
  const distinctRoots = rootOffset === 0 ? roots.slice(0, 1) : roots;

  function moveTo(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const userX = ((clientX - rect.left) / rect.width) * WIDTH;
    const userY = ((clientY - rect.top) / rect.height) * HEIGHT;
    setH(clamp(snap(userX / UNIT + X_MIN), H_RANGE.min, H_RANGE.max));
    setK(clamp(snap(Y_MAX - userY / UNIT), K_RANGE.min, K_RANGE.max));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, STEP],
      ArrowDown: [0, -STEP],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setH((v) => clamp(v + move[0], H_RANGE.min, H_RANGE.max));
    setK((v) => clamp(v + move[1], K_RANGE.min, K_RANGE.max));
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 lg:max-w-none">
      <div className="studio-plot">
        <CanvasGrid />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="relative h-auto w-full touch-none"
          role="img"
          aria-label={copy.home.heroGraphLabel}
          onPointerMove={(e) => dragging && moveTo(e.clientX, e.clientY)}
        >
          <clipPath id="hero-plot">
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} />
          </clipPath>

          <line
            x1="0"
            y1={toSvgY(0)}
            x2={WIDTH}
            y2={toSvgY(0)}
            className="stroke-grid-strong"
            strokeWidth="1.5"
          />
          <line
            x1={toSvgX(0)}
            y1="0"
            x2={toSvgX(0)}
            y2={HEIGHT}
            className="stroke-grid-strong"
            strokeWidth="1.5"
          />

          <g clipPath="url(#hero-plot)">
            <line
              x1={toSvgX(h)}
              y1="0"
              x2={toSvgX(h)}
              y2={HEIGHT}
              className="stroke-crimson"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
            <path
              d={curvePath(h, k)}
              fill="none"
              className="stroke-navy"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {distinctRoots.map((r) => (
              <circle
                key={r}
                cx={toSvgX(r)}
                cy={toSvgY(0)}
                r="6"
                className="fill-crimson"
              />
            ))}
          </g>

          <circle
            cx={toSvgX(h)}
            cy={toSvgY(k)}
            r="11"
            className="fill-highlight stroke-graphite cursor-grab"
            strokeWidth="2.5"
            tabIndex={0}
            role="slider"
            aria-label={`Vertex. Currently at ${num(h)}, ${num(k)}. Use the arrow keys to move it.`}
            aria-valuemin={H_RANGE.min}
            aria-valuemax={H_RANGE.max}
            aria-valuenow={h}
            aria-valuetext={`${num(h)}, ${num(k)}`}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
              moveTo(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              setDragging(false);
            }}
            onPointerCancel={() => setDragging(false)}
          />
        </svg>
      </div>
      <div className="studio-graph-readout">
        <Tex className="text-lg">{vertexFormTex(h, k)}</Tex>
        <span className="text-pencil text-meta">
          Vertex ({num(h)}, {num(k)})
        </span>
        <span className="text-pencil text-meta">
          {hasRoots ? (
            <>Roots {distinctRoots.map((r) => num(r)).join(", ")}</>
          ) : (
            "No real roots"
          )}
        </span>
        <button
          type="button"
          className="studio-reset"
          onClick={() => {
            setH(1);
            setK(-2);
          }}
        >
          {copy.studio.graphReset}
          <span aria-hidden="true"> ↺</span>
        </button>
      </div>
    </div>
  );
}
