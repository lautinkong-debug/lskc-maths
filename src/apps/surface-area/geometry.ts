import type {
  Boundary,
  CubeGeometry,
  Point,
  PrismGeometry,
  SurfaceVariant,
} from "./types";

export const number = (n: number) =>
  Number(n.toFixed(5)).toLocaleString("en-GB", {
    maximumFractionDigits: 5,
    useGrouping: false,
  });
export function boundaryEdges(boundary: Boundary): number[] {
  return boundary.points.map((p, i, ps) =>
    Math.hypot(
      ps[(i + 1) % ps.length].x - p.x,
      ps[(i + 1) % ps.length].y - p.y,
    ),
  );
}
export function polygonArea(boundary: Boundary): number {
  return (
    Math.abs(
      boundary.points.reduce((sum, p, i, ps) => {
        const q = ps[(i + 1) % ps.length];
        return sum + p.x * q.y - q.x * p.y;
      }, 0),
    ) / 2
  );
}
export const boundaries = (g: PrismGeometry) => [g.outer, ...(g.holes ?? [])];
export function edgeScale(g: PrismGeometry): number {
  const p = boundaries(g)
    .flatMap(boundaryEdges)
    .reduce((s, x) => s + x, 0);
  return g.perimeterGiven === undefined ? 1 : g.perimeterGiven / p;
}
/** Rotate each hinge without changing the length of any boundary segment. */
export function unfoldBoundary(
  boundary: Boundary,
  progress: number,
  scale = 1,
): Point[] {
  const t = Math.max(0, Math.min(1, progress));
  const points: Point[] = [{ x: 0, y: 0 }];
  let angle = 0;
  boundaryEdges(boundary).forEach((length, i) => {
    const p = boundary.points[i],
      q = boundary.points[(i + 1) % boundary.points.length];
    const heading = Math.atan2(q.y - p.y, q.x - p.x);
    if (i === 0) angle = heading;
    else
      angle += Math.atan2(Math.sin(heading - angle), Math.cos(heading - angle));
    const previous = points[i];
    points.push({
      x: previous.x + length * scale * Math.cos(angle * (1 - t)),
      y: previous.y + length * scale * Math.sin(angle * (1 - t)),
    });
  });
  return points;
}
export function geometryMetrics(g: PrismGeometry | CubeGeometry) {
  if (g.kind === "cubes") {
    const sum = g.cubes.reduce((s, c) => s + 6 * c.side ** 2, 0);
    const contacts = g.contacts.reduce((s, c) => s + 2 * c.area, 0);
    return {
      perimeter: 0,
      includedPerimeter: 0,
      height: 0,
      baseArea: 0,
      geometricBaseArea: 0,
      lateralArea: 0,
      completeLateralArea: 0,
      totalArea: sum - contacts,
      removedArea: contacts,
    };
  }
  const edges = boundaries(g)
    .flatMap(boundaryEdges)
    .map((x) => x * edgeScale(g));
  const perimeter = edges.reduce((s, x) => s + x, 0);
  const includedPerimeter = edges.reduce(
    (s, x, i) => s + ((g.omittedEdges ?? []).includes(i) ? 0 : x),
    0,
  );
  const lateralArea = includedPerimeter * g.height;
  return {
    perimeter,
    includedPerimeter,
    height: g.height,
    baseArea: g.baseArea,
    geometricBaseArea:
      polygonArea(g.outer) -
      (g.holes ?? []).reduce((s, b) => s + polygonArea(b), 0),
    lateralArea,
    completeLateralArea: perimeter * g.height,
    totalArea: lateralArea + g.baseCount * g.baseArea,
    removedArea: (perimeter - includedPerimeter) * g.height,
  };
}
export type FaceInfo = {
  index: number;
  ring: number;
  edge: number;
  length: number;
  name: string;
  label: string;
  omitted: boolean;
};
export function faces(variant: SurfaceVariant, solved = false): FaceInfo[] {
  const g = variant.geometry;
  if (g.kind === "cubes")
    return g.cubes.flatMap((cube, ci) =>
      ["front", "right", "back", "left", "top", "bottom"].map((name, j) => ({
        index: ci * 6 + j,
        ring: ci,
        edge: j,
        length: cube.side,
        name: `${number(cube.side)} ${variant.unit} cube · ${name}`,
        label: `${number(cube.side)} ${variant.unit}`,
        omitted: false,
      })),
    );
  let index = 0;
  return boundaries(g).flatMap((b, ring) =>
    boundaryEdges(b).map((l, edge) => {
      const i = index++,
        length = l * edgeScale(g);
      const given = b.edgeLabels?.[edge];
      return {
        index: i,
        ring,
        edge,
        length,
        name: b.vertexNames
          ? `${b.vertexNames[edge]}${b.vertexNames[(edge + 1) % b.points.length]}`
          : `${ring ? "Inner edge" : "Edge"} ${edge + 1}`,
        label:
          given === "" &&
          (!solved || g.schematic || g.omittedEdges?.includes(i))
            ? ""
            : !solved && given != null
              ? given
              : `${number(length)} ${variant.unit}`,
        omitted: (g.omittedEdges ?? []).includes(i),
      };
    }),
  );
}
export function hasUnknowns(v: SurfaceVariant) {
  const g = v.geometry;
  if (g.kind === "cubes") return false;
  const symbolic = (s: string) =>
    /[a-z]/i.test(s.replace(/\b(cm|mm|m)\b/g, ""));
  return (
    Boolean(g.heightLabel && symbolic(g.heightLabel)) ||
    boundaries(g).some((b) => b.edgeLabels?.some((s) => s && symbolic(s)))
  );
}
export function teachingLines(v: SurfaceVariant, stage: number): string[] {
  if (stage === 0) return [];
  if (stage === 4) return v.working;
  const g = v.geometry;
  if (g.kind === "cubes")
    return stage < 3
      ? ["Find the two contact patches between adjacent cubes."]
      : [
          "Count six faces for each separate cube.",
          "Each contact patch is counted twice and must be removed.",
        ];
  const m = geometryMetrics(g),
    fs = faces(v);
  const unknownBoundary = boundaries(g).some((b) =>
    b.edgeLabels?.some(
      (s) => s && /[a-z]/i.test(s.replace(/\b(cm|mm|m)\b/g, "")),
    ),
  );
  const p = g.omittedEdges?.length
    ? `Retained widths = ${number(m.includedPerimeter)} ${v.unit}`
    : g.perimeterGiven !== undefined
      ? `P = ${number(g.perimeterGiven)} ${v.unit}`
      : unknownBoundary
        ? fs.some((f) => !f.label)
          ? "P = sum of all base boundary lengths"
          : `P = ${fs
              .filter((f) => f.ring === 0)
              .map((f) => f.label.replace(` ${v.unit}`, ""))
              .join(" + ")} ${v.unit}`
        : `P = ${number(m.perimeter)} ${v.unit}`;
  if (stage < 3)
    return [
      p,
      ...(g.holes?.length
        ? ["Include both the outer boundary and the hole boundary."]
        : []),
    ];
  if (hasUnknowns(v))
    return [
      p,
      `Lateral area = P × ${g.heightLabel ?? `${number(g.height)} ${v.unit}`}`,
      "Reveal the final working to solve the unknown.",
    ];
  const prefix = g.omittedEdges?.length
    ? `Retained widths = ${number(m.includedPerimeter)} ${v.unit}`
    : p;
  return [
    prefix,
    `Lateral area = ${number(m.includedPerimeter)} × ${number(g.height)} = ${number(m.lateralArea)} ${v.unit}²`,
    ...(g.omittedEdges?.length ? ["The opening contributes no material."] : []),
  ];
}

export function givenFacts(v: SurfaceVariant): string[] {
  const g = v.geometry;
  return [
    ...(v.givens ?? []),
    ...(g.kind === "prism" && g.areaIsGiven
      ? [`Given base area B = ${number(g.baseArea)} ${v.unit}²`]
      : []),
    ...(g.kind === "prism" && g.perimeterGiven !== undefined
      ? [`Given base perimeter P = ${number(g.perimeterGiven)} ${v.unit}`]
      : []),
    ...(g.kind === "prism" && g.heightName && g.heightName.length > 3
      ? [
          g.water
            ? v.target === "increase"
              ? "Unfolded strip height H = rise Δd."
              : "Unfolded strip height H = water depth d."
            : `H represents ${g.heightName.toLowerCase()}.`,
        ]
      : []),
  ];
}
