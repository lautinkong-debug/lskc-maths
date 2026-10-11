import { copy } from "@/lib/copy";
import { useEffect, useRef, useState } from "react";
import {
  axisStep,
  cumulativePoints,
  curvePath,
  format,
  frequencyPoints,
  type ChartType,
  type Row,
} from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts;
export const chartTypes: ChartType[] = [
  "histogram",
  "polygon",
  "curve",
  "cumulativePolygon",
  "cumulativeCurve",
];
export type Display = {
  grid: boolean;
  points: boolean;
  labels: boolean;
  boundaries: boolean;
  marks: boolean;
  overlay: boolean;
  both: boolean;
  guides: boolean;
};
export const defaultDisplay: Display = {
  grid: true,
  points: true,
  labels: false,
  boundaries: false,
  marks: true,
  overlay: false,
  both: false,
  guides: false,
};
export function interval(row: Row, continuous: boolean) {
  return continuous
    ? `${format(row.low)} ≤ x < ${format(row.high)}`
    : `${format(row.lower)}–${format(row.upper)}`;
}
export function Chart({
  rows,
  type,
  title,
  axisLabel,
  display,
  selected,
  onSelect,
  sharedScale,
  fullText = false,
  secondRows,
  guide,
  verticalLabel,
}: {
  rows: Row[];
  type: ChartType;
  title: string;
  axisLabel: string;
  display: Display;
  selected: number | null;
  onSelect: (i: number) => void;
  sharedScale?: { min: number; max: number; peak: number };
  fullText?: boolean;
  secondRows?: Row[];
  guide?: { low: number; high: number; target: number; label: string };
  verticalLabel?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(300, Math.min(760, entry.contentRect.width))),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const narrow = width < 520,
    left = narrow ? 62 : 84,
    right = width - 40,
    bottom = narrow ? 300 : 370,
    height = narrow ? 435 : 490;
  const rotateTicks = rows.length > (narrow ? 5 : 10);
  const tickEvery = Math.max(1, Math.ceil(rows.length / (narrow ? 6 : 12)));
  const cumulative = type.startsWith("cumulative");
  const smooth = type === "curve" || type === "cumulativeCurve";
  const points = cumulative ? cumulativePoints(rows) : frequencyPoints(rows);
  const first = rows[0],
    last = rows.at(-1)!;
  const xmin =
    sharedScale?.min ?? (type === "histogram" ? first.low : points[0].x);
  const xmax =
    sharedScale?.max ?? (type === "histogram" ? last.high : points.at(-1)!.x);
  const peak =
    sharedScale?.peak ??
    (cumulative ? last.cumulative : Math.max(...rows.map((r) => r.frequency)));
  const step = axisStep(peak);
  const ymax = Math.max(step, Math.ceil(peak / step) * step);
  const x = (v: number) => left + ((v - xmin) / (xmax - xmin)) * (right - left);
  const y = (v: number) => bottom - (v / ymax) * (bottom - 90);
  const yticks = Array.from(
    { length: Math.round(ymax / step) + 1 },
    (_, i) => i * step,
  );
  const markTicks =
    type === "histogram" || cumulative
      ? rows.map((r) => r.mark)
      : points.map((p) => p.x);
  const boundaryTicks = [first.low, ...rows.map((r) => r.high)];
  const line = points.map((p) => `${x(p.x)},${y(p.y)}`).join(" ");
  const pointLabel = (i: number) =>
    cumulative
      ? i === 0
        ? c.initial
        : `${c.upperBoundary}: ${format(points[i].x)}`
      : i === 0 || i === points.length - 1
        ? c.zero
        : `${c.mark}: ${format(points[i].x)}`;
  return (
    <div className={s.graphScroll} ref={container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={s.graph}
        aria-label={`${c.chartNames[chartTypes.indexOf(type)]}: ${title}`}
        role="group"
        data-scale={`${xmin},${xmax},${ymax}`}
      >
        <title>{title}</title>
        <desc>{c.chartNotes[chartTypes.indexOf(type)]}</desc>
        <rect width={width} height={height} fill="white" />
        <text
          x={width / 2}
          y="32"
          textAnchor="middle"
          className={s.chartTitle}
          data-export-text={title}
          textLength={
            fullText && title.length > (narrow ? 32 : 65)
              ? width - 100
              : undefined
          }
          lengthAdjust="spacingAndGlyphs"
          style={{ fontSize: narrow ? 16 : 20 }}
        >
          {!fullText && title.length > (narrow ? 32 : 65)
            ? title.slice(0, narrow ? 29 : 62) + "…"
            : title}
        </text>
        <text
          x={width / 2}
          y="58"
          textAnchor="middle"
          className={s.chartSubtitle}
        >
          {c.chartNames[chartTypes.indexOf(type)]}
        </text>
        {display.grid && (
          <g className={s.gridLines}>
            {Array.from({ length: 21 }, (_, i) => (
              <line
                key={i}
                x1={left + (i * (right - left)) / 20}
                x2={left + (i * (right - left)) / 20}
                y1="90"
                y2={bottom}
              />
            ))}
            {yticks.flatMap((v, i) => [
              <line
                key={`major-${i}`}
                x1={left}
                x2={right}
                y1={y(v)}
                y2={y(v)}
              />,
              ...(i
                ? [
                    <line
                      key={`minor-${i}`}
                      x1={left}
                      x2={right}
                      y1={y(v - step / 2)}
                      y2={y(v - step / 2)}
                      opacity="0.5"
                    />,
                  ]
                : []),
            ])}
          </g>
        )}
        {(type === "histogram" || (!cumulative && display.overlay)) &&
          rows.map((r, i) => (
            <g key={i}>
              <rect
                data-bar={i}
                data-low={r.low}
                data-high={r.high}
                data-frequency={r.frequency}
                x={x(r.low)}
                y={y(r.frequency)}
                width={x(r.high) - x(r.low)}
                height={y(0) - y(r.frequency)}
                className={selected === i ? s.selectedBar : s.bar}
              />
              <rect
                x={x(r.low)}
                y={y(r.frequency) - 5}
                width={x(r.high) - x(r.low)}
                height={Math.max(10, y(0) - y(r.frequency) + 5)}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${c.select} ${format(r.lower)}–${format(r.upper)}, ${c.frequency} ${r.frequency}`}
                onClick={() => onSelect(i)}
                onFocus={() => onSelect(i)}
                onPointerEnter={() => onSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(i);
                  }
                }}
              >
                <title>{`${c.interval}: ${r.lower}–${r.upper}\n${c.boundaries}: ${r.low}–${r.high}\n${c.mark}: ${r.mark}\n${c.frequency}: ${r.frequency}`}</title>
              </rect>
              {display.labels && (
                <text
                  x={x(r.mark)}
                  y={y(r.frequency) - 10}
                  textAnchor="middle"
                  className={s.tick}
                >
                  {r.frequency}
                </text>
              )}
            </g>
          ))}
        {type !== "histogram" && (
          <>
            {(!smooth || display.both) && (
              <polyline
                data-chart-line="polygon"
                points={line}
                className={smooth ? s.construction : s.line}
              />
            )}
            {smooth && (
              <path
                data-chart-line="curve"
                d={curvePath(points, x, y)}
                className={s.line}
              />
            )}
            {points.map((p, i) => {
              const rowIndex = i - 1;
              const active = rowIndex >= 0 && rowIndex < rows.length;
              return (
                <g key={i}>
                  {display.guides && (
                    <path
                      d={`M ${left} ${y(p.y)} H ${x(p.x)} V ${bottom}`}
                      className={s.construction}
                    />
                  )}
                  {display.points && (
                    <circle
                      data-point={`${format(p.x)},${format(p.y)}`}
                      cx={x(p.x)}
                      cy={y(p.y)}
                      r={selected === rowIndex && active ? 7 : 4.5}
                      className={
                        selected === rowIndex && active
                          ? s.selectedPoint
                          : s.point
                      }
                    />
                  )}
                  <circle
                    cx={x(p.x)}
                    cy={y(p.y)}
                    r="12"
                    fill="transparent"
                    tabIndex={0}
                    role="button"
                    aria-label={`${pointLabel(i)}, ${cumulative ? c.cumulative : c.frequency}: ${p.y}`}
                    onPointerEnter={() => active && onSelect(rowIndex)}
                    onClick={() => active && onSelect(rowIndex)}
                    onFocus={() => active && onSelect(rowIndex)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (active) onSelect(rowIndex);
                      }
                    }}
                  >
                    <title>{`${pointLabel(i)}\n(${format(p.x)}, ${p.y})`}</title>
                  </circle>
                  {display.labels && (
                    <text
                      x={x(p.x)}
                      y={y(p.y) - 13}
                      textAnchor="middle"
                      className={s.tick}
                    >
                      {p.y}
                    </text>
                  )}
                </g>
              );
            })}
          </>
        )}
        <path
          d={`M ${left} 84 V ${bottom} H ${right + 9}`}
          className={s.axis}
        />
        {yticks.map((t) => (
          <g key={t}>
            <line
              x1={left - 6}
              x2={left}
              y1={y(t)}
              y2={y(t)}
              className={s.axis}
            />
            <text
              x={left - 11}
              y={y(t) + 5}
              textAnchor="end"
              className={s.tick}
            >
              {format(t)}
            </text>
          </g>
        ))}
        {(display.boundaries || cumulative) &&
          boundaryTicks.map((t, i) => (
            <g key={`b${i}`} data-axis-boundary={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={bottom}
                y2={bottom + 7}
                className={s.axis}
              />
              {(i % tickEvery === 0 || i === boundaryTicks.length - 1) && (
                <text
                  x={x(t)}
                  y={bottom + 25}
                  textAnchor={rotateTicks ? "end" : "middle"}
                  transform={
                    rotateTicks
                      ? `rotate(-45 ${x(t)} ${bottom + 25})`
                      : undefined
                  }
                  className={s.tick}
                >
                  {format(t)}
                </text>
              )}
            </g>
          ))}
        {display.marks &&
          !cumulative &&
          markTicks.map((t, i) => (
            <g key={`m${i}`} data-axis-mark={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={bottom}
                y2={bottom + 7}
                className={s.axis}
              />
              {(i % tickEvery === 0 || i === markTicks.length - 1) && (
                <text
                  x={x(t)}
                  y={bottom + (display.boundaries ? 65 : 25)}
                  textAnchor={rotateTicks ? "end" : "middle"}
                  transform={
                    rotateTicks
                      ? `rotate(-45 ${x(t)} ${bottom + (display.boundaries ? 65 : 25)})`
                      : undefined
                  }
                  className={s.tick}
                >
                  {format(t)}
                </text>
              )}
            </g>
          ))}
        <text
          x={width / 2}
          y={height - 21}
          textAnchor="middle"
          className={s.axisLabel}
          data-export-text={axisLabel}
          textLength={
            fullText && axisLabel.length > (narrow ? 32 : 60)
              ? width - 100
              : undefined
          }
          lengthAdjust="spacingAndGlyphs"
        >
          {!fullText && axisLabel.length > (narrow ? 32 : 60)
            ? axisLabel.slice(0, narrow ? 29 : 57) + "…"
            : axisLabel}
        </text>
        <text
          transform={`translate(18 ${(bottom + 90) / 2}) rotate(-90)`}
          textAnchor="middle"
          className={s.axisLabel}
        >
          {verticalLabel ?? (cumulative ? c.cumulative : c.frequency)}
        </text>
        {secondRows &&
          (() => {
            const other = cumulative
              ? cumulativePoints(secondRows)
              : frequencyPoints(secondRows);
            return (
              <g data-second-series="true">
                <path
                  d={
                    smooth
                      ? curvePath(other, x, y)
                      : other
                          .map((p, i) => `${i ? "L" : "M"} ${x(p.x)} ${y(p.y)}`)
                          .join(" ")
                  }
                  className={s.secondLine}
                />
                {other.map((p, i) => (
                  <rect
                    key={i}
                    x={x(p.x) - 4}
                    y={y(p.y) - 4}
                    width={8}
                    height={8}
                    className={s.secondPoint}
                  />
                ))}
              </g>
            );
          })()}
        {secondRows && (
          <g className={s.seriesLegend}>
            <line
              x1={left}
              x2={left + 20}
              y1={height - 6}
              y2={height - 6}
              className={s.line}
            />
            <text x={left + 26} y={height - 2} className={s.tick}>
              {c.advanced.groupA}
            </text>
            <line
              x1={right - 95}
              x2={right - 75}
              y1={height - 6}
              y2={height - 6}
              className={s.secondLine}
            />
            <text x={right - 69} y={height - 2} className={s.tick}>
              {c.advanced.groupB}
            </text>
          </g>
        )}
        {guide && (
          <g
            data-percentile-guide={`${guide.low},${guide.high},${guide.target}`}
          >
            <path
              d={`M ${left} ${y(guide.target)} H ${x(guide.high)} V ${bottom} M ${x(guide.low)} ${y(guide.target)} V ${bottom}`}
              className={s.readingGuide}
            />
            <circle
              cx={x(guide.low)}
              cy={y(guide.target)}
              r={6}
              className={s.selectedPoint}
            />
            {guide.high > guide.low && (
              <line
                x1={x(guide.low)}
                x2={x(guide.high)}
                y1={y(guide.target)}
                y2={y(guide.target)}
                className={s.readingPlateau}
              />
            )}
            <text x={right} y={79} textAnchor="end" className={s.tick}>
              {guide.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function ChartControls({
  value,
  onChange,
  type,
}: {
  value: Display;
  onChange: (d: Display) => void;
  type: ChartType;
}) {
  const keys: (keyof Display)[] = [
    "grid",
    "labels",
    ...(type !== "histogram" ? (["points", "guides"] as const) : []),
    ...(type.startsWith("cumulative")
      ? []
      : (["boundaries", "marks"] as const)),
    ...(!type.startsWith("cumulative") && type !== "histogram"
      ? (["overlay"] as const)
      : []),
    ...(type === "curve" || type === "cumulativeCurve"
      ? (["both"] as const)
      : []),
  ];
  return (
    <details className={s.controls}>
      <summary>{c.controls}</summary>
      <div className={s.checks}>
        {keys.map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
            />
            {c[key]}
          </label>
        ))}
      </div>
      <button onClick={() => onChange(defaultDisplay)}>{c.reset}</button>
    </details>
  );
}
