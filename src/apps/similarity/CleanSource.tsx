import { bounds, centre } from "./geometry";
import type { Point, Shape } from "./types";
import styles from "./similarity.module.css";

/** These source diagrams overlap the printed footer. Rebuild their geometry and givens. */
export const cleanSourceIds = new Set(["qp8-2", "qp8-5", "ex8b-23"]);
export function CleanSource({
  id,
  points,
  shapes,
}: {
  id: string;
  points: Point[];
  shapes: Shape[];
}) {
  const mid = centre(points),
    box = bounds(points),
    size = Math.max(box.width, box.height) / 25;
  const at = (label: string) => points.find((p) => p.label === label)!;
  const edges = new Map<string, [Point, Point]>();
  for (const s of shapes)
    s.vertices.forEach((v, i) => {
      const w = s.vertices[(i + 1) % s.vertices.length];
      edges.set([v, w].sort().join("-"), [at(v), at(w)]);
    });
  const length = (
    a: string,
    b: string,
    text: string,
    dx: number,
    dy: number,
  ) => {
    const p = at(a),
      q = at(b);
    return (
      <text
        key={a + b}
        x={(p.x + q.x) / 2 + dx * size}
        y={(p.y + q.y) / 2 + dy * size}
        textAnchor="middle"
        fontSize={size * 1.3}
        className={styles.cleanGiven}
      >
        {text}
      </text>
    );
  };
  const angle = (a: string, v: string, b: string, text: string) => {
    const p = at(v),
      u = at(a),
      w = at(b);
    const d1 = Math.hypot(u.x - p.x, u.y - p.y),
      d2 = Math.hypot(w.x - p.x, w.y - p.y);
    const dx = (u.x - p.x) / d1 + (w.x - p.x) / d2,
      dy = (u.y - p.y) / d1 + (w.y - p.y) / d2;
    const d = Math.hypot(dx, dy) || 1;
    return (
      <text
        key={a + v + b}
        x={p.x + (dx / d) * size * 3}
        y={p.y + (dy / d) * size * 3}
        dy=".3em"
        textAnchor="middle"
        fontSize={size * 1.2}
        className={styles.cleanGiven}
      >
        {text}
      </text>
    );
  };
  return (
    <g data-testid="clean-source">
      {[...edges].map(([key, [a, b]]) => (
        <line
          key={key}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="var(--color-graphite)"
          strokeWidth={size * 0.15}
        />
      ))}
      {points.map((p) => {
        const dx = p.x - mid.x,
          dy = p.y - mid.y,
          d = Math.hypot(dx, dy) || 1;
        return (
          <text
            key={p.label}
            x={p.x + (dx / d) * size * 1.5}
            y={p.y + (dy / d) * size * 1.5}
            dy=".3em"
            textAnchor="middle"
            fontSize={size * 1.5}
            className={styles.cleanLetter}
          >
            {p.label}
          </text>
        );
      })}
      {id === "qp8-2" && (
        <>
          {angle("A", "E", "D", "108°")}
          {angle("B", "A", "C", "47°")}
        </>
      )}
      {id === "qp8-5" && (
        <>
          {angle("Q", "P", "R", "56°")}
          {angle("P", "R", "Q", "64°")}
          {angle("P", "S", "R", "64°")}
          {angle("P", "R", "S", "60°")}
        </>
      )}
      {id === "ex8b-23" && (
        <>
          {length("A", "E", "3 cm", -1.5, -1)}
          {length("E", "D", "5 cm", -1.5, -1)}
          {length("A", "B", "4 cm", 0, 2)}
          {length("B", "C", "2 cm", 0, 2)}
        </>
      )}
    </g>
  );
}
