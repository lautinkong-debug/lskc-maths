export type Point = { x: number; y: number };

/** D → A → B → C → D, using the dimensions printed in Example 9.11. */
export const PILOT = {
  vertices: [
    { x: 5, y: 4 },
    { x: 0, y: 4 },
    { x: 0, y: 0 },
    { x: 8, y: 0 },
  ],
  edges: [5, 4, 8, 5],
  edgeNames: ["DA", "AB", "BC", "CD"],
  vertexNames: ["D", "A", "B", "C"],
  height: 13,
} as const;

export function surfaceMetrics() {
  const perimeter = PILOT.edges.reduce((sum, value) => sum + value, 0);
  const twiceArea = PILOT.vertices.reduce((sum, point, i) => {
    const next = PILOT.vertices[(i + 1) % 4];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  const baseArea = Math.abs(twiceArea) / 2;
  const lateralArea = perimeter * PILOT.height;
  return {
    perimeter,
    height: PILOT.height,
    baseArea,
    lateralArea,
    totalArea: lateralArea + 2 * baseArea,
  };
}

/** A chain of fixed-length segments. Changing hinge angles never stretches a face. */
export function unfoldChain(progress: number): Point[] {
  const t = Math.max(0, Math.min(1, progress));
  const angles = [
    Math.PI,
    Math.PI * 1.5,
    Math.PI * 2,
    Math.PI * 2 + Math.atan2(4, -3),
  ];
  const points: Point[] = [{ x: 0, y: 0 }];
  PILOT.edges.forEach((length, i) => {
    const angle = angles[i] * (1 - t);
    const last = points[i];
    points.push({
      x: last.x + length * Math.cos(angle),
      y: last.y + length * Math.sin(angle),
    });
  });
  return points;
}

/** Plain SVG-safe working; the lesson also renders these expressions through KaTeX. */
export function workingLines(stage: number): string[] {
  if (stage === 0) return [];
  if (stage <= 2) return ["P = 5 + 4 + 8 + 5 = 22 cm"];
  const lateral = [
    "P = 5 + 4 + 8 + 5 = 22 cm",
    "Lateral area = P × H",
    "= 22 × 13 = 286 cm²",
  ];
  return stage === 3
    ? lateral
    : [
        ...lateral,
        "B = ½ × (5 + 8) × 4 = 26 cm²",
        "Total area = PH + 2B",
        "= 286 + 2 × 26 = 338 cm²",
      ];
}
