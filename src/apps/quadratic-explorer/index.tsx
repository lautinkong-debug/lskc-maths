"use client";

import { useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";

const LEFT = 42;
const TOP = 24;
const PLOT_WIDTH = 636;
const PLOT_HEIGHT = 372;
const X_MIN = -6;
const X_MAX = 6;
const Y_MIN = -10;
const Y_MAX = 10;
const EPS = 1e-9;

const px = (x: number) => LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_WIDTH;
const py = (y: number) => TOP + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;
const tidy = (value: number) => {
  const rounded = Number(value.toFixed(3));
  return Object.is(rounded, -0) ? 0 : rounded;
};

function equationTex(a: number, b: number, c: number): string {
  const first = a === 1 ? "x^{2}" : a === -1 ? "-x^{2}" : `${tidy(a)}x^{2}`;
  const term = (value: number, variable: string) => {
    if (value === 0) return "";
    const absolute = Math.abs(value);
    const magnitude = absolute === 1 && variable ? "" : tidy(absolute);
    return ` ${value > 0 ? "+" : "-"} ${magnitude}${variable}`;
  };
  return `y = ${first}${term(b, "x")}${term(c, "")}`;
}

function Control({
  id,
  letter,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  letter: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3 font-semibold">
        <span>{copy.apps.quadratic.coefficient(letter)}</span>
        <output htmlFor={id} className="text-navy tabular-nums">
          {tidy(value)}
        </output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-navy mt-2 w-full"
      />
    </label>
  );
}

export default function QuadraticExplorer() {
  const presenting = usePresentation();
  const [a, setA] = useState(0.5);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const discriminant = b * b - 4 * a * c;
  const roots =
    discriminant < -EPS
      ? []
      : Math.abs(discriminant) <= EPS
        ? [vertexX]
        : [
            (-b - Math.sqrt(discriminant)) / (2 * a),
            (-b + Math.sqrt(discriminant)) / (2 * a),
          ].sort((left, right) => left - right);
  const curve = Array.from({ length: 321 }, (_, index) => {
    const x = X_MIN + (index / 320) * (X_MAX - X_MIN);
    const y = a * x * x + b * x + c;
    return `${index === 0 ? "M" : "L"}${px(x).toFixed(1)},${py(y).toFixed(1)}`;
  }).join("");

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
      <div className="min-w-0">
        <div className="border-grid overflow-hidden border bg-white p-2 sm:p-4">
          <svg
            viewBox="0 0 720 420"
            className="h-auto w-full"
            role="img"
            aria-label={copy.apps.quadratic.graphLabel}
          >
            <defs>
              <clipPath id="quadratic-plot">
                <rect
                  x={LEFT}
                  y={TOP}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                />
              </clipPath>
            </defs>
            {Array.from({ length: 13 }, (_, index) => index - 6).map((x) => (
              <g key={`x-${x}`}>
                <line
                  x1={px(x)}
                  x2={px(x)}
                  y1={TOP}
                  y2={TOP + PLOT_HEIGHT}
                  className="stroke-grid"
                />
                {x % 2 === 0 && (
                  <text
                    x={px(x)}
                    y={TOP + PLOT_HEIGHT + 17}
                    textAnchor="middle"
                    className="fill-pencil text-[11px]"
                  >
                    {x}
                  </text>
                )}
              </g>
            ))}
            {Array.from({ length: 11 }, (_, index) => index * 2 - 10).map(
              (y) => (
                <g key={`y-${y}`}>
                  <line
                    x1={LEFT}
                    x2={LEFT + PLOT_WIDTH}
                    y1={py(y)}
                    y2={py(y)}
                    className="stroke-grid"
                  />
                  {y !== 0 && (
                    <text
                      x={LEFT - 7}
                      y={py(y) + 4}
                      textAnchor="end"
                      className="fill-pencil text-[11px]"
                    >
                      {y}
                    </text>
                  )}
                </g>
              ),
            )}
            <line
              x1={LEFT}
              x2={LEFT + PLOT_WIDTH}
              y1={py(0)}
              y2={py(0)}
              className="stroke-grid-strong"
              strokeWidth="2"
            />
            <line
              x1={px(0)}
              x2={px(0)}
              y1={TOP}
              y2={TOP + PLOT_HEIGHT}
              className="stroke-grid-strong"
              strokeWidth="2"
            />
            <g clipPath="url(#quadratic-plot)">
              <line
                x1={px(vertexX)}
                x2={px(vertexX)}
                y1={TOP}
                y2={TOP + PLOT_HEIGHT}
                className="stroke-navy"
                strokeDasharray="6 5"
                opacity="0.55"
              />
              <path
                d={curve}
                fill="none"
                className="stroke-navy"
                strokeWidth={presenting ? 4 : 3}
              />
              <circle
                cx={px(vertexX)}
                cy={py(vertexY)}
                r={presenting ? 8 : 6}
                className="fill-highlight stroke-navy"
                strokeWidth="2"
              />
              {roots
                .filter((root) => root >= X_MIN && root <= X_MAX)
                .map((root) => (
                  <circle
                    key={root}
                    cx={px(root)}
                    cy={py(0)}
                    r={presenting ? 6 : 5}
                    className="fill-navy"
                  />
                ))}
            </g>
          </svg>
        </div>
        <div
          className={`border-grid mt-3 overflow-x-auto border bg-white px-4 py-3 ${presenting ? "text-2xl" : "text-xl"}`}
        >
          <Tex>{equationTex(a, b, c)}</Tex>
        </div>
      </div>
      <div className="space-y-6">
        <p>{copy.apps.quadratic.intro}</p>
        <div className="border-grid space-y-5 border bg-white p-5">
          <Control
            id="coefficient-a"
            letter="a"
            value={a}
            min={-3}
            max={3}
            step={0.25}
            onChange={(next) =>
              setA(next === 0 ? (a < 0 ? -0.25 : 0.25) : next)
            }
          />
          <Control
            id="coefficient-b"
            letter="b"
            value={b}
            min={-6}
            max={6}
            step={0.5}
            onChange={setB}
          />
          <Control
            id="coefficient-c"
            letter="c"
            value={c}
            min={-8}
            max={8}
            step={0.5}
            onChange={setC}
          />
        </div>
        <dl className="border-grid divide-grid divide-y border bg-white px-5">
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.quadratic.vertex}</dt>
            <dd className="font-semibold tabular-nums">
              ({tidy(vertexX)}, {tidy(vertexY)})
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.quadratic.axis}</dt>
            <dd className="font-semibold tabular-nums">x = {tidy(vertexX)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.quadratic.discriminant}</dt>
            <dd className="font-semibold tabular-nums">{tidy(discriminant)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt>{copy.apps.quadratic.roots}</dt>
            <dd className="text-right font-semibold tabular-nums">
              {roots.length === 0
                ? copy.apps.quadratic.noRealRoots
                : roots.length === 1
                  ? `${copy.apps.quadratic.oneRoot}: ${tidy(roots[0])}`
                  : roots.map(tidy).join(", ")}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
