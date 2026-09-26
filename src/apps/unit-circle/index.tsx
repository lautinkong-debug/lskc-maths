"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";

const CENTER = 250;
const RADIUS = 178;
const EPS = 1e-8;
const tidy = (value: number) => {
  const rounded = Number(value.toFixed(3));
  return Object.is(rounded, -0) ? 0 : rounded;
};

function quadrant(angle: number): string {
  if (angle % 90 === 0) return copy.apps.unitCircle.onAxis;
  return `${copy.apps.unitCircle.quadrant} ${Math.floor(angle / 90) + 1}`;
}

function sign(value: number): string {
  if (Math.abs(value) < EPS) return "0";
  return value > 0 ? "+" : "−";
}

export default function UnitCircle() {
  const presenting = usePresentation();
  const [angle, setAngle] = useState(40);
  const [dragging, setDragging] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const radians = (angle * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const tangent = Math.abs(cosine) < EPS ? null : sine / cosine;
  const x = CENTER + RADIUS * cosine;
  const y = CENTER - RADIUS * sine;
  const arcX = CENTER + 43 * cosine;
  const arcY = CENTER - 43 * sine;

  function movePoint(event: PointerEvent<SVGSVGElement>) {
    const element = svg.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const xPosition = ((event.clientX - rect.left) / rect.width) * 500;
    const yPosition = ((event.clientY - rect.top) / rect.height) * 500;
    const degrees =
      (Math.atan2(CENTER - yPosition, xPosition - CENTER) * 180) / Math.PI;
    setAngle(Math.round((degrees + 360) % 360));
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <div className="min-w-0">
        <div className="border-grid mx-auto max-w-[700px] border bg-white p-3 sm:p-5">
          <svg
            ref={svg}
            viewBox="0 0 500 500"
            role="img"
            aria-label={copy.apps.unitCircle.graphLabel}
            className="h-auto w-full cursor-crosshair touch-none"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(true);
              movePoint(event);
            }}
            onPointerMove={(event) => {
              if (dragging) movePoint(event);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
              setDragging(false);
            }}
            onPointerCancel={() => setDragging(false)}
          >
            <path
              d="M20 250H480M250 20V480"
              className="stroke-grid-strong"
              strokeWidth="2"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              className="stroke-navy"
              strokeWidth="3"
              fill="none"
            />
            <path
              d={`M${CENTER} ${CENTER}L${x} ${CENTER}L${x} ${y}Z`}
              className="fill-navy-wash"
            />
            <line
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              className="stroke-navy"
              strokeWidth={presenting ? 4 : 3}
            />
            <line
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={CENTER}
              className="stroke-navy"
              strokeWidth="4"
            />
            <line
              x1={x}
              y1={CENTER}
              x2={x}
              y2={y}
              className="stroke-navy"
              strokeWidth="4"
              strokeDasharray="8 5"
            />
            {angle > 0 && angle < 360 && (
              <path
                d={`M${CENTER + 43} ${CENTER}A43 43 0 ${angle > 180 ? 1 : 0} 0 ${arcX} ${arcY}`}
                className="stroke-navy"
                strokeWidth="2"
                fill="none"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={presenting ? 13 : 11}
              className="fill-highlight stroke-navy"
              strokeWidth="3"
            />
            <text x="438" y="240" className="fill-pencil text-[20px]">
              1
            </text>
            <text x="53" y="240" className="fill-pencil text-[20px]">
              −1
            </text>
            <text x="263" y="64" className="fill-pencil text-[20px]">
              1
            </text>
            <text x="263" y="444" className="fill-pencil text-[20px]">
              −1
            </text>
          </svg>
        </div>
      </div>
      <div className="space-y-6">
        <p>{copy.apps.unitCircle.intro}</p>
        <label className="border-grid block border bg-white p-5 font-semibold">
          <span className="flex justify-between gap-3">
            <span>{copy.apps.unitCircle.angle}</span>
            <output className="text-navy tabular-nums">{angle}°</output>
          </span>
          <input
            type="range"
            aria-label={copy.apps.unitCircle.angle}
            min="0"
            max="360"
            step="1"
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
            className="accent-navy mt-3 w-full"
          />
        </label>
        <div
          className={`border-grid border bg-white p-5 ${presenting ? "text-2xl" : "text-xl"}`}
        >
          <Tex>{`(\\cos ${angle}^{\\circ},\\; \\sin ${angle}^{\\circ})`}</Tex>
        </div>
        <dl className="border-grid divide-grid divide-y border bg-white px-5">
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.unitCircle.sine}</dt>
            <dd className="font-semibold tabular-nums">{tidy(sine)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.unitCircle.cosine}</dt>
            <dd className="font-semibold tabular-nums">{tidy(cosine)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.unitCircle.tangent}</dt>
            <dd className="font-semibold tabular-nums">
              {tangent === null
                ? copy.apps.unitCircle.undefined
                : tidy(tangent)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.unitCircle.quadrant}</dt>
            <dd className="font-semibold">{quadrant(angle)}</dd>
          </div>
        </dl>
        <p className="text-pencil text-sm">
          {copy.apps.unitCircle.signs}: {copy.apps.unitCircle.sine} {sign(sine)}
          , {copy.apps.unitCircle.cosine} {sign(cosine)},{" "}
          {copy.apps.unitCircle.tangent}{" "}
          {tangent === null ? copy.apps.unitCircle.undefined : sign(tangent)}
        </p>
      </div>
    </div>
  );
}
