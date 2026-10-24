import { useId, type Ref } from "react";
import { copy } from "@/lib/copy";
import { PILOT, unfoldChain, workingLines, type Point } from "./model";

const c = copy.surfaceArea;
const palette = [
  "var(--color-navy-soft)",
  "var(--color-grid)",
  "var(--color-navy-wash)",
  "var(--color-silver)",
];
const navy = "var(--color-navy)";
const ink = "var(--color-graphite)";
type Box = { x: number; y: number; w: number; h: number };
export type DiagramProps = {
  stage: number;
  unfold: number;
  selectedFace: number | null;
  showDimensions: boolean;
  showFaces: boolean;
  showWorking?: boolean;
  comparison?: boolean;
  onSelectFace?: (index: number) => void;
  svgRef?: Ref<SVGSVGElement>;
};

function Shape({
  progress,
  box,
  selected,
  dimensions,
  labels,
  caps,
  onSelect,
  id,
}: {
  progress: number;
  box: Box;
  selected: number | null;
  dimensions: boolean;
  labels: boolean;
  caps: boolean;
  onSelect?: (i: number) => void;
  id: string;
}) {
  const chain = unfoldChain(progress);
  const project = (p: Point, z: number) => ({
    x: p.x + 0.7 * (1 - progress) * z,
    y: -p.y - (0.55 + 0.45 * progress) * z,
  });
  const bottom = chain.map((p) => project(p, 0));
  const top = chain.map((p) => project(p, PILOT.height));
  const points = [...bottom, ...top];
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const scale = Math.min(box.w / (maxX - minX), box.h / (maxY - minY));
  const tx = box.x + (box.w - (maxX - minX) * scale) / 2;
  const ty = box.y + (box.h - (maxY - minY) * scale) / 2;
  const at = (p: Point) => ({
    x: tx + (p.x - minX) * scale,
    y: ty + (p.y - minY) * scale,
  });
  const b = bottom.map(at),
    t = top.map(at);
  const poly = (ps: Point[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
  const faceOrder = progress < 0.01 ? [1, 2, 0, 3] : [0, 1, 2, 3];
  const endpoint = progress < 0.01 || progress > 0.99;
  const heightIndex = b.reduce(
    (best, p, i) => (p.x + t[i].x > b[best].x + t[best].x ? i : best),
    0,
  );
  const hb = b[heightIndex],
    ht = t[heightIndex];
  const hdx = ht.x - hb.x,
    hdy = ht.y - hb.y,
    hlen = Math.hypot(hdx, hdy);
  const hn = { x: -hdy / hlen, y: hdx / hlen };
  const hm = {
    x: (hb.x + ht.x) / 2 + hn.x * 46,
    y: (hb.y + ht.y) / 2 + hn.y * 46,
  };
  return (
    <g>
      {caps && (
        <polygon
          points={poly(t.slice(0, 4))}
          fill="var(--color-highlight)"
          fillOpacity=".25"
          stroke={navy}
          strokeWidth="2"
          strokeDasharray="6 5"
        />
      )}
      {faceOrder.map((i) => {
        const face = [b[i], b[i + 1], t[i + 1], t[i]],
          mid = {
            x: face.reduce((s, p) => s + p.x, 0) / 4,
            y: face.reduce((s, p) => s + p.y, 0) / 4,
          };
        const active = selected === i;
        return (
          <g key={i} data-face={i}>
            <polygon
              points={poly(face)}
              fill={active ? "var(--color-highlight)" : palette[i]}
              fillOpacity={
                progress < 0.01 && (i === 1 || i === 2) ? 0.25 : 0.92
              }
              stroke={navy}
              strokeWidth={active ? 3 : 1.7}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${c.face} ${i + 1}: ${PILOT.edgeNames[i]}, ${PILOT.edges[i]} × 13 cm`}
              aria-pressed={onSelect ? active : undefined}
              onClick={() => onSelect?.(i)}
              onKeyDown={(e) => {
                if (onSelect && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
              style={{ cursor: onSelect ? "pointer" : undefined }}
            />
            {labels &&
              (endpoint || selected === i) &&
              (progress > 0.03 || i === 0 || i === 3) && (
                <text
                  x={mid.x}
                  y={mid.y + 7}
                  textAnchor="middle"
                  fontSize="23"
                  fontWeight="700"
                  fill={ink}
                  pointerEvents="none"
                >
                  {i + 1}
                </text>
              )}
          </g>
        );
      })}
      {caps && (
        <polygon
          points={poly(b.slice(0, 4))}
          fill="var(--color-highlight)"
          fillOpacity=".58"
          stroke={navy}
          strokeWidth="2.5"
        />
      )}
      {caps && (
        <polygon
          points={poly(t.slice(0, 4))}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="3"
          strokeDasharray="7 5"
          pointerEvents="none"
        />
      )}
      {caps &&
        labels &&
        b.slice(0, 4).map((p, i) => (
          <text
            key={`vertex-${i}`}
            x={p.x + [12, -14, -14, 16][i]}
            y={p.y + [-12, -10, 20, 20][i]}
            fill={navy}
            fontSize="21"
            fontStyle="italic"
            stroke="white"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {PILOT.vertexNames[i]}
          </text>
        ))}
      {selected !== null && (
        <line
          x1={b[selected].x}
          y1={b[selected].y}
          x2={b[selected + 1].x}
          y2={b[selected + 1].y}
          stroke="var(--color-gold)"
          strokeWidth="7"
          pointerEvents="none"
        />
      )}
      {dimensions &&
        b.slice(0, 4).map((p, i) => {
          if (!endpoint && selected !== i) return null;
          const q = b[i + 1];
          const dx = q.x - p.x,
            dy = q.y - p.y,
            len = Math.hypot(dx, dy);
          const nx = progress > 0.99 ? 0 : -dy / len,
            ny = progress > 0.99 ? 1 : dx / len;
          return (
            <text
              key={i}
              x={(p.x + q.x) / 2 + nx * 24}
              y={(p.y + q.y) / 2 + ny * 24 + 7}
              textAnchor="middle"
              fontSize="23"
              fontWeight="600"
              fill={ink}
              stroke="white"
              strokeWidth="6"
              paintOrder="stroke"
            >
              {PILOT.edges[i]} cm
            </text>
          );
        })}
      {dimensions && (
        <g fill={navy} fontSize="23" fontWeight="600">
          <line
            x1={hb.x + hn.x * 25}
            y1={hb.y + hn.y * 25}
            x2={ht.x + hn.x * 25}
            y2={ht.y + hn.y * 25}
            stroke={navy}
            strokeWidth="1.7"
          />
          <text
            x={hm.x}
            y={hm.y}
            textAnchor="middle"
            transform={`rotate(${(Math.atan2(hdy, hdx) * 180) / Math.PI},${hm.x},${hm.y})`}
            fontSize="23"
            stroke="white"
            strokeWidth="6"
            paintOrder="stroke"
          >
            {c.heightLabel}
          </text>
        </g>
      )}
      {progress === 0 && !caps && (
        <line
          x1={b[0].x}
          y1={b[0].y}
          x2={t[0].x}
          y2={t[0].y}
          stroke="var(--color-crimson)"
          strokeWidth="4"
          strokeDasharray="8 5"
        />
      )}
      {progress > 0.99 && dimensions && (
        <g fill={navy}>
          <path
            d={`M${t[0].x},${t[0].y - 12} v-12 H${t[4].x} v12`}
            fill="none"
            stroke={navy}
            strokeWidth="2"
          />
          <text
            x={(t[0].x + t[4].x) / 2}
            y={t[0].y - 36}
            textAnchor="middle"
            fontSize="24"
            fontWeight="600"
          >
            {c.perimeterLabel}
          </text>
        </g>
      )}
      <desc id={id}>{c.diagramLabel}</desc>
    </g>
  );
}

export function OriginalPrism({
  selectedFace,
  showDimensions,
  showFaces,
  onSelectFace,
}: Pick<
  DiagramProps,
  "selectedFace" | "showDimensions" | "showFaces" | "onSelectFace"
>) {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 300"
      role="group"
      aria-label={c.original}
      style={{
        display: "block",
        width: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Shape
        progress={0}
        box={{ x: 65, y: 45, w: 270, h: 195 }}
        selected={selectedFace}
        dimensions={showDimensions}
        labels={showFaces}
        caps
        onSelect={onSelectFace}
        id={id}
      />
    </svg>
  );
}

function Base({
  x,
  y,
  dimensions,
}: {
  x: number;
  y: number;
  dimensions: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon
        points="0,0 110,0 176,88 0,88"
        fill="var(--color-highlight)"
        fillOpacity=".42"
        stroke={navy}
        strokeWidth="2"
      />
      <path
        d="M0,14 h14 v-14 M0,74 h14 v14"
        fill="none"
        stroke={navy}
        strokeWidth="1.5"
      />
      <text
        x="68"
        y="54"
        textAnchor="middle"
        fontSize="25"
        fontStyle="italic"
        fill={ink}
      >
        B
      </text>
      {dimensions && (
        <g fontSize="21" fill={ink}>
          <text x="55" y="-10" textAnchor="middle">
            5 cm
          </text>
          <text x="88" y="115" textAnchor="middle">
            8 cm
          </text>
          <text x="-10" y="48" textAnchor="end">
            4 cm
          </text>
        </g>
      )}
    </g>
  );
}

export default function Diagram(props: DiagramProps) {
  const {
    stage,
    unfold,
    selectedFace,
    showDimensions,
    showFaces,
    showWorking = false,
    comparison = false,
    onSelectFace,
    svgRef,
  } = props;
  const id = useId();
  const working = showWorking ? workingLines(stage) : [];
  const baseY = comparison ? 950 : 510;
  const bodyHeight = stage === 4 ? baseY + 155 : comparison ? 905 : 515;
  const height =
    bodyHeight + (working.length ? working.length * 33 + 46 : 0) + 30;
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={onSelectFace ? `0 110 800 ${height - 110}` : `0 0 800 ${height}`}
      width="800"
      height={onSelectFace ? height - 110 : height}
      aria-label={c.diagramLabel}
      role="group"
      data-testid="surface-diagram"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <rect width="800" height={height} fill="white" />
      <text x="40" y="40" fill={navy} fontSize="23" fontWeight="700">
        {c.example} · {c.source}
      </text>
      {comparison ? (
        <>
          <text x="40" y="85" fill={ink} fontSize="26">
            {c.original}
          </text>
          <Shape
            progress={0}
            box={{ x: 90, y: 115, w: 570, h: 270 }}
            selected={selectedFace}
            dimensions={showDimensions}
            labels={showFaces}
            caps
            id={`${id}-original`}
          />
          <path d="M40 455 H760" stroke="var(--color-grid)" />
          <text x="40" y="500" fill={ink} fontSize="26">
            {c.strip}
          </text>
          <Shape
            progress={1}
            box={{ x: 75, y: 590, w: 590, h: 250 }}
            selected={selectedFace}
            dimensions={showDimensions}
            labels={showFaces}
            caps={false}
            id={`${id}-strip`}
          />
        </>
      ) : (
        <>
          <text x="40" y="87" fill={ink} fontSize="27" fontWeight="600">
            {c.steps[stage].title}
          </text>
          <Shape
            progress={unfold}
            box={{ x: 90, y: 175, w: 580, h: 270 }}
            selected={selectedFace}
            dimensions={showDimensions}
            labels={showFaces}
            caps={stage < 2}
            onSelect={onSelectFace}
            id={id}
          />
          {stage === 2 && (
            <text x="400" y="495" textAnchor="middle" fontSize="21" fill={navy}>
              {c.detached}
              {unfold === 0 ? ` · ${c.seam}` : ""}
            </text>
          )}
        </>
      )}
      {stage === 4 && (
        <g>
          <Base x={155} y={baseY} dimensions={showDimensions} />
          <Base x={495} y={baseY} dimensions={showDimensions} />
          <text
            x="400"
            y={baseY + 50}
            fontSize="32"
            fill={navy}
            textAnchor="middle"
          >
            +
          </text>
        </g>
      )}
      {working.length > 0 && (
        <g data-export-working="true" fill={ink} fontSize="25">
          <path d={`M40 ${bodyHeight} H760`} stroke="var(--color-grid)" />
          {working.map((line, i) => (
            <text key={line} x="40" y={bodyHeight + 43 + i * 33}>
              {line}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
