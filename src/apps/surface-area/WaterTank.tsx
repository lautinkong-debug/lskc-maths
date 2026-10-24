import { copy } from "@/lib/copy";
import { number } from "./geometry";
import type { Point, SurfaceVariant } from "./types";

const c = copy.surfaceArea;
const outline = "#164e78";
const wet = "#46a9d4";
const band = "#f2ce50";
type Box = { x: number; y: number; w: number; h: number };
type Props = {
  variant: SurfaceVariant;
  box: Box;
  dimensions: boolean;
  solved: boolean;
  selected: number | null;
  labels?: boolean;
  onSelect?: (index: number) => void;
};

/** The full tank supplies context; only its submerged material contributes area. */
export function WaterTank({
  variant,
  box,
  dimensions,
  solved,
  selected,
  onSelect,
}: Props) {
  const g = variant.geometry;
  if (g.kind !== "prism" || !g.water) return null;
  const increasing = variant.target === "increase";
  // MC11 supplies only the rise. These illustrative levels never become givens.
  const oldDepth = g.water.initialDepth ?? (increasing ? g.height * 2 : 0);
  const waterDepth = increasing ? oldDepth + g.height : g.height;
  const tankHeight = g.water.tankHeight ?? waterDepth + g.height;
  const project = (p: Point, z: number): Point => ({
    x: p.x - p.y * 0.55,
    y: -p.y * 0.45 - z,
  });
  const raw = g.outer.points.flatMap((p) => [
    project(p, 0),
    project(p, tankHeight),
  ]);
  const x0 = Math.min(...raw.map((p) => p.x)),
    x1 = Math.max(...raw.map((p) => p.x));
  const y0 = Math.min(...raw.map((p) => p.y)),
    y1 = Math.max(...raw.map((p) => p.y));
  const area = dimensions
    ? {
        x: box.x + 16,
        y: box.y + 38,
        w: box.w - 50,
        h: box.h - (g.water.contents ? 137 : 112),
      }
    : box;
  const scale = Math.min(area.w / (x1 - x0), area.h / (y1 - y0));
  const at = (index: number, z: number): Point => {
    const p = project(g.outer.points[index], z);
    return {
      x: area.x + (area.w - (x1 - x0) * scale) / 2 + (p.x - x0) * scale,
      y: area.y + (area.h - (y1 - y0) * scale) / 2 + (p.y - y0) * scale,
    };
  };
  const points = (ps: Point[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
  const plane = (z: number) => g.outer.points.map((_, i) => at(i, z));
  const side = (i: number, low: number, high: number) => [
    at(i, low),
    at((i + 1) % 4, low),
    at((i + 1) % 4, high),
    at(i, high),
  ];
  const text = (
    x: number,
    y: number,
    value: string,
    anchor: "start" | "middle" | "end" = "middle",
    size = 18,
  ) => (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fill="#252a2e"
      stroke="white"
      strokeWidth={4}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      {value}
    </text>
  );
  const wall = (i: number) => (
    <polygon
      key={i}
      data-wet-wall={i}
      data-counted="true"
      points={points(side(i, increasing ? oldDepth : 0, waterDepth))}
      fill={selected === i ? "#ffe276" : increasing ? band : wet}
      fillOpacity={0.72}
      stroke={selected === i ? "#ab7100" : outline}
      strokeWidth={selected === i ? 3 : 1.4}
      onClick={onSelect ? () => onSelect(i) : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(i);
              }
            }
          : undefined
      }
      aria-label={`${c.face} ${i + 1}`}
      style={onSelect ? { cursor: "pointer" } : undefined}
    />
  );
  const frontRight = at(1, 0),
    waterRight = at(1, waterDepth),
    oldRight = at(1, oldDepth);
  const top = at(3, tankHeight),
    leftBottom = at(3, 0);
  const tankLeft =
    at(0, tankHeight).x - (at(0, tankHeight).x - at(3, tankHeight).x) - 13;
  const depthX = frontRight.x + 13;
  const bottomY = frontRight.y;
  const captionX = box.x + box.w / 2;
  const dimensionValue = increasing
    ? solved
      ? `Δd = ${number(g.height)} ${variant.unit}`
      : "Δd"
    : solved
      ? `d = ${number(g.height)} ${variant.unit}`
      : "d";
  return (
    <g
      data-water-tank={increasing ? "increase" : "wetted"}
      data-tank-height={g.water.tankHeight ?? "schematic"}
      data-water-depth={waterDepth}
      data-closed-tank={g.water.closed ? "true" : "false"}
    >
      {/* Rear tank walls, then submerged rear walls and the bottom. */}
      {[1, 2].map((i) => (
        <polygon
          key={i}
          points={points(side(i, 0, tankHeight))}
          fill="#eef3f6"
          fillOpacity={0.65}
          stroke={outline}
          strokeDasharray="4 4"
          strokeWidth={1.3}
        />
      ))}
      {[1, 2].map(wall)}
      <polygon
        data-tank-bottom="true"
        data-counted={increasing ? "false" : "true"}
        points={points(plane(0))}
        fill={increasing ? "#d9e2e8" : "#2b92bf"}
        fillOpacity={0.8}
        stroke={outline}
        strokeWidth={1.5}
      />
      {/* The water volume is translucent so the bottom and submerged objects remain visible. */}
      {[0, 3].map((i) => (
        <polygon
          key={i}
          points={points(side(i, 0, waterDepth))}
          fill="#bce7f4"
          fillOpacity={0.35}
          stroke="none"
        />
      ))}
      {g.water.contents && (
        <g data-submerged-objects={g.water.contents}>
          {(g.water.contents === "balls"
            ? [0.33, 0.67]
            : [0.27, 0.52, 0.73]
          ).map((fraction, i) => {
            const a = at(0, 0),
              b = at(1, 0),
              back = at(3, 0);
            const radius = Math.min(
              12,
              (waterDepth - (increasing ? g.height : 0)) * scale * 0.29,
            );
            const x = a.x + (b.x - a.x) * fraction + (back.x - a.x) * 0.38;
            const y = a.y + (back.y - a.y) * 0.38 - radius;
            return g.water?.contents === "balls" ? (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={radius}
                fill="#7d8c98"
                stroke="#4e616f"
              />
            ) : (
              <path
                key={i}
                d={`M${x - radius},${y + radius * 0.6} l${radius * 0.2},${-radius * 1.2} l${radius},${-radius * 0.35} l${radius * 0.8},${radius} l${-radius * 0.45},${radius * 0.65} Z`}
                fill="#7d8c98"
                stroke="#4e616f"
              />
            );
          })}
        </g>
      )}
      <polygon
        data-free-water-surface="true"
        data-counted="false"
        points={points(plane(waterDepth))}
        fill="#d8f5fc"
        fillOpacity={0.75}
        stroke="#1688b5"
        strokeWidth={2}
      />
      {[0, 3].map(wall)}
      {oldDepth > 0 && (
        <polyline
          data-old-waterline="true"
          points={points([...plane(oldDepth), at(0, oldDepth)])}
          fill="none"
          stroke="#526778"
          strokeWidth={1.8}
          strokeDasharray="6 4"
        />
      )}
      <polyline
        data-waterline="true"
        points={points([...plane(waterDepth), at(0, waterDepth)])}
        fill="none"
        stroke="#057ca9"
        strokeWidth={2.6}
      />
      {/* A clear dry outline continues above the water; no opaque front hides the interior. */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={at(i, 0).x}
          y1={at(i, 0).y}
          x2={at(i, tankHeight).x}
          y2={at(i, tankHeight).y}
          stroke={outline}
          strokeWidth={1.4}
          strokeDasharray={i === 2 ? "4 4" : undefined}
        />
      ))}
      <polygon
        points={points(plane(tankHeight))}
        fill={g.water.closed ? "#eef3f6" : "none"}
        fillOpacity={0.1}
        stroke={outline}
        strokeWidth={1.6}
      />
      {dimensions && (
        <g data-water-annotations="true">
          <path
            d={`M${depthX - 6},${waterRight.y} H${depthX} V${increasing ? oldRight.y : bottomY} H${depthX - 6}`}
            fill="none"
            stroke={outline}
            strokeWidth={1.7}
            data-depth-bracket="true"
          />
          {text(
            depthX + 9,
            (waterRight.y + (increasing ? oldRight.y : bottomY)) / 2 - 5,
            increasing ? c.waterRise : c.waterDepth,
            "start",
            17,
          )}
          <g data-depth-value="true">
            {text(
              depthX + 9,
              (waterRight.y + (increasing ? oldRight.y : bottomY)) / 2 + 17,
              dimensionValue,
              "start",
              19,
            )}
          </g>
          {g.water.tankHeight && (
            <g data-full-tank-height="true">
              <path
                d={`M${tankLeft + 5},${top.y} H${tankLeft} V${leftBottom.y} H${tankLeft + 5}`}
                fill="none"
                stroke="#6e7f8d"
                strokeWidth={1.2}
              />
              <text
                transform={`translate(${tankLeft - 9} ${(top.y + leftBottom.y) / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize={17}
                fill="#344653"
              >
                {c.tankHeight} {number(tankHeight)} {variant.unit}
              </text>
            </g>
          )}
          <g data-water-surface-note="true">
            {text(captionX, box.y + 14, c.waterSurface, "middle", 17)}
            <path
              d={`M${captionX},${box.y + 21} L${at(2, waterDepth).x - 12},${at(2, waterDepth).y + 5}`}
              fill="none"
              stroke="#057ca9"
              strokeWidth={1.1}
            />
          </g>
          {oldDepth > 0 && (
            <g data-old-level-note="true">
              {text(
                captionX,
                box.y + box.h - 37,
                `${c.oldWaterline}${g.water.initialLabel ? `: ${g.water.initialLabel}` : ""}`,
                "middle",
                16,
              )}
            </g>
          )}
          <g data-tank-base-dimensions="true">
            {text(
              (at(0, 0).x + frontRight.x) / 2,
              bottomY + 25,
              `${number(g.outer.points[1].x - g.outer.points[0].x)} ${variant.unit}`,
            )}
            {text(
              (at(0, 0).x + at(3, 0).x) / 2 - 12,
              bottomY + 25,
              `${number(g.outer.points[3].y - g.outer.points[0].y)} ${variant.unit}`,
              "end",
              17,
            )}
          </g>
          {g.water.contents &&
            text(
              captionX,
              box.y + box.h - 14,
              g.water.contents === "stones" ? c.waterStones : c.waterBalls,
              "middle",
              16,
            )}
          <g data-water-count-note="true">
            {text(
              captionX,
              box.y + box.h + 10,
              increasing ? c.newWetCount : c.wetCount,
              "middle",
              18,
            )}
          </g>
          {increasing &&
            text(captionX, box.y + box.h + 32, c.tankSchematic, "middle", 13)}
          {g.water.afterRotation &&
            text(captionX, box.y + box.h + 34, c.afterRotation, "middle", 16)}
        </g>
      )}
    </g>
  );
}
