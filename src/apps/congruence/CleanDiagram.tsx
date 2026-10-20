import type { CongruenceQuestion } from "./types";
import type { Point } from "../similarity/types";

/** These source figures run into the publisher footer. Preserve the source
 * question crop in the Question tab, and draw the complete givens on the board.
 */
export const cleanDiagramIds = new Set(["ex5a-27", "ex5c-12"]);

export function CleanDiagram({ question }: { question: CongruenceQuestion }) {
  if (!cleanDiagramIds.has(question.id)) return null;
  const p = (name: string) => question.points.find((p) => p.label === name)!;
  const text = (value: string, x: number, y: number, italic = false) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="14"
      fontFamily={italic ? "Georgia, serif" : undefined}
      fontStyle={italic ? "italic" : undefined}
      fill="var(--color-graphite)"
    >
      {value}
    </text>
  );
  const arcFromDown = (vertex: string, towards: string, radius: number) => {
    const a = p(vertex),
      b = p(towards);
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    return (
      <path
        d={`M${a.x},${a.y + radius} A${radius},${radius} 0 0 1 ${a.x + ((b.x - a.x) * radius) / distance},${a.y + ((b.y - a.y) * radius) / distance}`}
        fill="none"
        stroke="var(--color-navy)"
        strokeWidth="1.2"
      />
    );
  };
  const tick = (a: Point, b: Point, twice = false) => {
    const length = Math.hypot(b.x - a.x, b.y - a.y),
      dx = (b.x - a.x) / length,
      dy = (b.y - a.y) / length;
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return (
      <g stroke="var(--color-navy)" strokeWidth="1.5">
        {(twice ? [-3, 3] : [0]).map((offset) => (
          <line
            key={offset}
            x1={mid.x + dx * offset - dy * 5}
            y1={mid.y + dy * offset + dx * 5}
            x2={mid.x + dx * offset + dy * 5}
            y2={mid.y + dy * offset - dx * 5}
          />
        ))}
      </g>
    );
  };
  return (
    <g pointerEvents="none" data-testid="clean-congruence-diagram">
      {question.shapes.map((shape) => (
        <polygon
          key={shape.name}
          fill="none"
          stroke="var(--color-graphite)"
          strokeWidth="1.7"
          points={shape.vertices
            .map((name) => `${p(name).x},${p(name).y}`)
            .join(" ")}
        />
      ))}
      {question.id === "ex5c-12" ? (
        <>
          {text("P", p("P").x, p("P").y - 13, true)}
          {["Q", "R", "S"].map((name) => (
            <g key={name}>{text(name, p(name).x, p(name).y + 21, true)}</g>
          ))}
          {tick(p("P"), p("Q"))}
          {tick(p("P"), p("R"))}
          {tick(p("Q"), p("S"), true)}
          {tick(p("S"), p("R"), true)}
        </>
      ) : (
        <>
          {text("A", p("A").x, p("A").y - 12, true)}
          {text("B", p("B").x + 17, p("B").y + 3, true)}
          {["C", "D", "E"].map((name) => (
            <g key={name}>{text(name, p(name).x, p(name).y + 30, true)}</g>
          ))}
          {text("2 cm", (p("E").x + p("D").x) / 2, p("C").y + 16)}
          {text("x cm", (p("D").x + p("C").x) / 2, p("C").y + 16)}
          {text("5 cm", p("C").x + 42, (p("A").y + p("C").y) / 2)}
          <line
            x1={p("C").x + 23}
            y1={p("A").y}
            x2={p("C").x + 23}
            y2={p("C").y}
            stroke="var(--color-graphite)"
          />
          {[p("A").y, p("C").y].map((y) => (
            <line
              key={y}
              x1={p("C").x + 19}
              y1={y}
              x2={p("C").x + 27}
              y2={y}
              stroke="var(--color-graphite)"
            />
          ))}
          {arcFromDown("A", "D", 32)}
          {text("31°", p("A").x - 17, p("A").y + 66)}
          {arcFromDown("B", "E", 21)}
          {text("y", p("B").x - 22, p("B").y + 27, true)}
          <path
            d={`M${p("C").x - 12},${p("C").y} v-12 h12`}
            fill="none"
            stroke="var(--color-navy)"
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}
