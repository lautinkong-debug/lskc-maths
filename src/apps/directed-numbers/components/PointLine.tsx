import { useEffect, useRef, useState, type PointerEvent } from "react";
import { copy } from "@/lib/copy";
import { signed } from "../lib/moves";
import { pointRange, type Point } from "../lib/points";
const c = copy.apps.directedNumbers,
  p = c.numberLesson;
export function PointLine({
  points,
  selected,
  onSelect,
  onMove,
  opposites,
  vertical,
  skin,
  presenting,
}: {
  points: Point[];
  selected: string;
  onSelect: (id: string) => void;
  onMove: (id: string, value: number) => void;
  opposites: boolean;
  vertical: boolean;
  skin: "plain" | "thermometer" | "lift";
  presenting: boolean;
}) {
  const active = points.find((point) => point.id === selected)!;
  const range = pointRange(points, opposites ? -active.value : undefined);
  const [dragRange, setDragRange] = useState<[number, number] | null>(null);
  const [min, max] = dragRange ?? range;
  const surface = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const pos = (v: number) => 8 + (84 * (v - min)) / (max - min);
  const label = (v: number) =>
    skin === "lift"
      ? c.floor(v)
      : skin === "thermometer"
        ? `${signed(v)} °C`
        : signed(v);
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const stride = Math.max(1, Math.ceil((max - min) / 20));
  function drag(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (
      !event.currentTarget.hasPointerCapture(event.pointerId) ||
      !surface.current
    )
      return;
    const rect = surface.current.getBoundingClientRect();
    const ratio = vertical
      ? 1 - (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width;
    const v = Math.round(min + ((ratio * 100 - 8) / 84) * (max - min));
    onMove(id, Math.max(-100, Math.min(100, v)));
  }
  const width = vertical ? 480 : 800,
    height = vertical ? 460 : 430;
  const lanes: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const occupied = points
      .slice(0, i)
      .flatMap((other, j) =>
        (Math.abs(other.value - points[i].value) / (max - min)) *
          0.84 *
          (vertical ? height : width) <
        80
          ? [lanes[j]]
          : [],
      );
    lanes.push([0, 1, 2, 3, 4, 5].find((lane) => !occupied.includes(lane))!);
  }
  const offsets = vertical
    ? [42, 104, 166, -72, -134, -196]
    : [-42, -98, -154, 72, 128, 184];
  const xy = (v: number, offset = 0) =>
    vertical
      ? [240 + offset, height * (1 - pos(v) / 100)]
      : [(width * pos(v)) / 100, 180 + offset];
  const zero = xy(0),
    opposite = xy(-active.value),
    here = xy(active.value);
  useEffect(() => {
    if (dragRange || !viewport.current || !surface.current) return;
    const button = surface.current.querySelector<HTMLButtonElement>(
      `[data-point="${selected}"]`,
    );
    if (button)
      viewport.current.scrollLeft =
        button.offsetLeft - viewport.current.clientWidth / 2;
  }, [selected, active.value, min, max, vertical, dragRange]);
  return (
    <div
      ref={viewport}
      className="overflow-x-auto rounded"
      tabIndex={0}
      aria-label={c.scrollLine}
    >
      <div
        ref={surface}
        className={`relative mx-auto ${vertical ? "w-[480px]" : "w-full max-w-[900px] min-w-[700px]"}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="text-navy absolute inset-0 h-full w-full"
          role="img"
          aria-label={p.picture(
            points.map((v) => `${v.id}: ${signed(v.value)}`).join(", "),
            vertical,
          )}
        >
          <path
            d={
              vertical
                ? "M240 25V435 M234 35L240 25L246 35 M234 425L240 435L246 425"
                : "M25 180H775 M35 174L25 180L35 186 M765 174L775 180L765 186"
            }
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          />
          {ticks.map((v) => {
            const [x, y] = xy(v);
            return (
              <g key={v}>
                <path
                  d={vertical ? `M${x - 5} ${y}h10` : `M${x} ${y - 5}v10`}
                  stroke="currentColor"
                  opacity={v % stride === 0 ? 1 : 0.3}
                />
                {(v % stride === 0 || v === 0) && (
                  <text
                    x={vertical ? x - 14 : x}
                    y={vertical ? y + 5 : y + 30}
                    textAnchor={vertical ? "end" : "middle"}
                    fontSize={presenting ? 19 : 16}
                    fill="currentColor"
                  >
                    {label(v)}
                  </text>
                )}
              </g>
            );
          })}
          {opposites && (
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <circle
                cx={opposite[0]}
                cy={opposite[1]}
                r="12"
                strokeDasharray="4 3"
              />
              {[here, opposite].map(([x, y], i) => (
                <g key={i}>
                  <path
                    d={
                      vertical
                        ? `M${x + 195} ${y}h12 M${x + 201} ${y}V${zero[1]} M${x + 195} ${zero[1]}h12`
                        : `M${x} 395v12 M${x} 401H${zero[0]} M${zero[0]} 395v12`
                    }
                  />
                  <text
                    x={vertical ? 463 : (x + zero[0]) / 2}
                    y={vertical ? (y + zero[1]) / 2 : 425}
                    fontSize="18"
                    fill="currentColor"
                    stroke="none"
                    textAnchor="middle"
                  >
                    {Math.abs(active.value)}
                  </text>
                </g>
              ))}
            </g>
          )}
          {points.map((point, index) => {
            const [x, y] = xy(point.value),
              [bx, by] = xy(point.value, offsets[lanes[index]]);
            return (
              <g key={point.id} stroke="currentColor">
                <path d={`M${x} ${y}L${bx} ${by}`} strokeDasharray="3 3" />
                <circle cx={x} cy={y} r="5" fill="currentColor" />
              </g>
            );
          })}
        </svg>
        {points.map((point, index) => {
          const offset = offsets[lanes[index]];
          return (
            <button
              key={point.id}
              data-point={point.id}
              type="button"
              role="slider"
              aria-label={p.point(point.id)}
              aria-valuemin={-100}
              aria-valuemax={100}
              aria-valuenow={point.value}
              aria-valuetext={p.pointValue(point.id, label(point.value))}
              aria-orientation={vertical ? "vertical" : "horizontal"}
              className={`absolute flex min-h-12 min-w-12 touch-none flex-col items-center justify-center rounded border-2 px-1 text-sm font-semibold select-none ${point.id === selected ? "bg-highlight border-navy text-navy" : "bg-paper border-navy text-navy"}`}
              style={{
                left: vertical
                  ? `${((240 + offset) / width) * 100}%`
                  : `${pos(point.value)}%`,
                top: vertical
                  ? `${100 - pos(point.value)}%`
                  : `${((180 + offset) / height) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onFocus={() => onSelect(point.id)}
              onPointerDown={(e) => {
                onSelect(point.id);
                setDragRange(range);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => drag(e, point.id)}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setDragRange(null);
              }}
              onPointerCancel={() => setDragRange(null)}
              onKeyDown={(e) => {
                if (
                  ![
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Home",
                    "End",
                  ].includes(e.key)
                )
                  return;
                e.preventDefault();
                e.stopPropagation();
                const delta =
                  (e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 1) *
                  (e.shiftKey ? 5 : 1);
                onMove(
                  point.id,
                  e.key === "Home"
                    ? -100
                    : e.key === "End"
                      ? 100
                      : Math.max(-100, Math.min(100, point.value + delta)),
                );
              }}
            >
              <span>{point.id}</span>
              <span>{label(point.value)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
