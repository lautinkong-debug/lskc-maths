import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { copy } from "@/lib/copy";
import {
  axisStep,
  curvePath,
  format,
  type ChartType,
  type Row,
} from "./statistics";
import {
  targets,
  snapCoordinate,
  type Connection,
  type ConstructionItem,
} from "./learning";
import s from "./lab.module.css";
const c = copy.statisticalCharts,
  l = c.learning;

export function ConstructionGraph({
  rows,
  type,
  title,
  axisLabel,
  items,
  connection,
  precision,
  onPlace,
  onSelect,
  selected,
  animate = false,
  showCoordinates = false,
  model = false,
}: {
  rows: Row[];
  type: ChartType;
  title: string;
  axisLabel: string;
  items: ConstructionItem[];
  connection: Connection;
  precision: number;
  onPlace?: (x: number, y: number) => void;
  onSelect?: (index: number) => void;
  selected?: number;
  animate?: boolean;
  showCoordinates?: boolean;
  model?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null),
    clipId = useId();
  const [width, setWidth] = useState(720);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const o = new ResizeObserver(([e]) =>
      setWidth(Math.max(300, Math.min(800, e.contentRect.width))),
    );
    if (holder.current) o.observe(holder.current);
    return () => o.disconnect();
  }, []);
  const expected = targets(rows, type),
    histogram = type === "histogram";
  const min = expected[0].x - rows[0].width / 2,
    max =
      (histogram ? expected.at(-1)!.end! : expected.at(-1)!.x) +
      rows[0].width / 2;
  const tick = axisStep(Math.max(...expected.map((p) => p.y))),
    ymax =
      Math.max(
        tick,
        Math.ceil(Math.max(...expected.map((p) => p.y)) / tick) * tick,
      ) + tick;
  const left = Math.max(64, String(ymax).length * 8 + 28),
    right = width - 38,
    top = 86,
    bottom = width < 520 ? 306 : 360,
    height = bottom + 102;
  const x = (v: number) => left + ((v - min) / (max - min)) * (right - left),
    y = (v: number) => bottom - (v / ymax) * (bottom - top);
  const xStep = precision > 0 ? precision / 2 : rows[0].width / 20;
  const visible = (p: ConstructionItem) =>
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    p.x >= min &&
    p.x <= max &&
    p.y >= 0 &&
    p.y <= ymax &&
    (!histogram || (p.end !== undefined && p.end > p.x && p.end <= max));
  const ordered = items
    .filter(visible)
    .map((p) => p)
    .sort((a, b) => a.x - b.x);
  const mayJoin =
    ordered.length === items.length &&
    ordered.every((p, i) => i === 0 || p.x > ordered[i - 1].x);
  const xticks = Array.from(
    { length: expected.length + (histogram ? 1 : 0) },
    (_, i) => expected[0].x + i * rows[0].width,
  );
  const stride = Math.max(1, Math.ceil(xticks.length / (width < 520 ? 5 : 10)));
  function place(e: PointerEvent<SVGRectElement>) {
    if (!onPlace) return;
    const svg = e.currentTarget.ownerSVGElement!,
      matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const local = point.matrixTransform(matrix.inverse());
    onPlace(
      snapCoordinate(
        min + ((local.x - left) / (right - left)) * (max - min),
        xStep,
      ),
      Math.max(
        0,
        Math.min(
          ymax,
          Math.round(((bottom - local.y) / (bottom - top)) * ymax),
        ),
      ),
    );
  }
  return (
    <div ref={holder} className={s.constructionGraph}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={model ? l.model : l.graph}
      >
        <title>{title}</title>
        <rect width={width} height={height} fill="white" />
        <text
          x={width / 2}
          y="28"
          textAnchor="middle"
          className={s.chartTitle}
          style={{ fontSize: width < 520 ? 16 : 20 }}
        >
          {title.length > 34 ? title.slice(0, 31) + "…" : title}
        </text>
        <text
          x={width / 2}
          y="53"
          textAnchor="middle"
          className={s.chartSubtitle}
        >
          {
            c.chartNames[
              [
                "histogram",
                "polygon",
                "curve",
                "cumulativePolygon",
                "cumulativeCurve",
              ].indexOf(type)
            ]
          }
        </text>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={left - 8}
              y={top - 8}
              width={right - left + 16}
              height={bottom - top + 16}
            />
          </clipPath>
        </defs>
        <g className={s.gridLines}>
          {Array.from({ length: 21 }, (_, i) => (
            <line
              key={`x${i}`}
              x1={left + (i * (right - left)) / 20}
              x2={left + (i * (right - left)) / 20}
              y1={top}
              y2={bottom}
            />
          ))}
          {Array.from({ length: Math.round(ymax / tick) * 2 + 1 }, (_, i) => (
            <line
              key={`y${i}`}
              x1={left}
              x2={right}
              y1={y((i * tick) / 2)}
              y2={y((i * tick) / 2)}
            />
          ))}
        </g>
        {onPlace && (
          <rect
            data-plot-surface="true"
            x={left}
            y={top}
            width={right - left}
            height={bottom - top}
            fill="transparent"
            role="button"
            aria-label={l.graph}
            tabIndex={0}
            className={s.plotSurface}
            onPointerDown={place}
            onKeyDown={(e) => {
              const p = cursor ?? { x: min, y: 0 };
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlace(p.x, p.y);
                return;
              }
              if (
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              )
                return;
              e.preventDefault();
              setCursor({
                x: snapCoordinate(
                  Math.max(
                    min,
                    Math.min(
                      max,
                      p.x +
                        (e.key === "ArrowRight"
                          ? xStep
                          : e.key === "ArrowLeft"
                            ? -xStep
                            : 0),
                    ),
                  ),
                  xStep,
                ),
                y: Math.max(
                  0,
                  Math.min(
                    ymax,
                    p.y +
                      (e.key === "ArrowUp"
                        ? 1
                        : e.key === "ArrowDown"
                          ? -1
                          : 0),
                  ),
                ),
              });
            }}
          />
        )}
        <g clipPath={`url(#${clipId})`}>
          {!histogram &&
            connection === "straight" &&
            mayJoin &&
            ordered
              .slice(1)
              .map((p, i) => (
                <line
                  key={`${p.x}-${p.y}-${i}`}
                  data-construction-line="straight"
                  x1={x(ordered[i].x)}
                  y1={y(ordered[i].y)}
                  x2={x(p.x)}
                  y2={y(p.y)}
                  className={`${s.line} ${animate ? s.drawLine : ""}`}
                  pathLength="1"
                  style={
                    animate ? { animationDelay: `${i * 100}ms` } : undefined
                  }
                />
              ))}
          {!histogram &&
            connection === "smooth" &&
            mayJoin &&
            ordered.length > 1 && (
              <path
                data-construction-line="smooth"
                d={curvePath(ordered, x, y)}
                className={`${s.line} ${animate ? s.drawLine : ""}`}
                pathLength="1"
              />
            )}
          {items.map((p, i) =>
            visible(p) ? (
              <g key={i}>
                {histogram ? (
                  <rect
                    data-construction-bar={i}
                    x={x(p.x)}
                    y={y(p.y)}
                    width={x(p.end!) - x(p.x)}
                    height={bottom - y(p.y)}
                    className={selected === i ? s.selectedBar : s.bar}
                  />
                ) : (
                  <circle
                    data-construction-point={`${format(p.x)},${format(p.y)}`}
                    cx={x(p.x)}
                    cy={y(p.y)}
                    r={selected === i ? 7 : 5}
                    className={selected === i ? s.selectedPoint : s.point}
                  />
                )}
                {onSelect && (
                  <rect
                    x={histogram ? x(p.x) : x(p.x) - 12}
                    y={histogram ? y(p.y) - 6 : y(p.y) - 12}
                    width={histogram ? x(p.end!) - x(p.x) : 24}
                    height={histogram ? Math.max(12, bottom - y(p.y) + 6) : 24}
                    fill="transparent"
                    role="button"
                    tabIndex={0}
                    aria-label={`${l.editItem} ${i + 1}`}
                    onClick={() => onSelect(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(i);
                      }
                    }}
                  >
                    <title>
                      {histogram
                        ? `${p.x}–${p.end}: ${p.y}`
                        : `(${p.x}, ${p.y})`}
                    </title>
                  </rect>
                )}
              </g>
            ) : null,
          )}
          {cursor && onPlace && (
            <g className={s.cursor} pointerEvents="none">
              <path
                d={`M ${x(cursor.x) - 7} ${y(cursor.y)} h 14 M ${x(cursor.x)} ${y(cursor.y) - 7} v 14`}
              />
            </g>
          )}
        </g>
        <path
          d={`M ${left} ${top - 6} V ${bottom} H ${right + 8}`}
          className={s.axis}
        />
        {Array.from({ length: Math.round(ymax / tick) + 1 }, (_, i) => (
          <text
            key={i}
            x={left - 10}
            y={y(i * tick) + 5}
            textAnchor="end"
            className={s.tick}
          >
            {i * tick}
          </text>
        ))}
        {xticks.map((t, i) => (
          <g key={i}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={bottom}
              y2={bottom + 6}
              className={s.axis}
            />
            {(i % stride === 0 || i === xticks.length - 1) && (
              <text
                x={x(t)}
                y={bottom + 24}
                textAnchor="end"
                transform={`rotate(-35 ${x(t)} ${bottom + 24})`}
                className={s.tick}
              >
                {format(t)}
              </text>
            )}
          </g>
        ))}
        <text
          x={width / 2}
          y={height - 15}
          textAnchor="middle"
          className={s.axisLabel}
        >
          {axisLabel.length > 32 ? axisLabel.slice(0, 29) + "…" : axisLabel}
        </text>
        <text
          transform={`translate(18 ${(top + bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          className={s.axisLabel}
        >
          {type.startsWith("cumulative") ? c.cumulative : c.frequency}
        </text>
      </svg>
      {onPlace && (
        <p className={s.small}>
          {l.snap}: x = {format(xStep)}, y = 1
          {cursor ? ` · (${format(cursor.x)}, ${cursor.y})` : ""}
        </p>
      )}
      {items.some((p) => !visible(p)) && <p className={s.error}>{l.outside}</p>}
      {showCoordinates && (
        <ol className={s.coordinateList}>
          {items.map((p, i) => (
            <li key={i}>
              {histogram
                ? `${format(p.x)}–${format(p.end!)}: ${format(p.y)}`
                : `(${format(p.x)}, ${format(p.y)})`}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
