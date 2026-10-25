import { copy } from "@/lib/copy";
import { boundaries, boundaryEdges, number } from "./geometry";
import type { SurfaceVariant } from "./types";

/** Only base calculations live here. Never select lines from the full solution. */
export function baseCalculations(v: SurfaceVariant) {
  const g = v.geometry;
  if (g.kind !== "prism") return { perimeter: [], area: [] };
  const c = copy.surfaceArea;
  const rings = boundaries(g).map(boundaryEdges);
  const totals = rings.map((edges) =>
    edges.reduce((sum, edge) => sum + edge, 0),
  );
  const sum = (edges: number[]) => edges.map(number).join(" + ");
  const perimeter =
    g.perimeterGiven !== undefined
      ? [`P = ${number(g.perimeterGiven)} ${v.unit} (${c.givenValue})`]
      : (v.perimeterWorking ??
        (rings.length > 1
          ? [
              ...rings.map(
                (edges, i) =>
                  `${i ? c.innerPerimeter : c.outerPerimeter} = ${sum(edges)} = ${number(totals[i])} ${v.unit}`,
              ),
              `P = ${sum(totals)} = ${number(totals.reduce((a, b) => a + b, 0))} ${v.unit}`,
            ]
          : [`P = ${sum(rings[0])} = ${number(totals[0])} ${v.unit}`]));
  const area = v.baseWorking
    ? /\b(?:cm|mm|m)²/.test(v.baseWorking)
      ? v.baseWorking
      : `${v.baseWorking} ${v.unit}²`
    : c.baseAreaUnavailable;
  return { perimeter, area: [area] };
}
