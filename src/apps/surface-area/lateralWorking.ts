import { copy } from "@/lib/copy";
import { baseCalculations } from "./baseWorking";
import { boundaries, geometryMetrics, number } from "./geometry";
import type { SurfaceVariant } from "./types";

export type AreaReveals = {
  revealBasePerimeter?: boolean;
  revealWaterDepth?: boolean;
  revealBaseArea?: boolean;
};

/** Lateral faces only. Full-solution state and base areas are deliberately absent. */
export function prismFactors(v: SurfaceVariant, reveals: AreaReveals = {}) {
  const g = v.geometry;
  if (g.kind !== "prism") return null;
  const metrics = geometryMetrics(g);
  const omitted = Boolean(g.omittedEdges?.length);
  const symbolicBoundary = boundaries(g).some((b) =>
    b.edgeLabels?.some(
      (label) => label && /[a-z]/i.test(label.replace(/\b(cm|mm|m)\b/g, "")),
    ),
  );
  // The last equality in the dedicated perimeter calculation is its simplified
  // expression. Never extract anything from the full surface-area solution.
  const symbolicPerimeter = baseCalculations(v)
    .perimeter.findLast((line) => line.startsWith("P ="))
    ?.split("=")
    .at(-1)
    ?.replace(/\s+(cm|mm|m)\.?$/, "")
    .trim();
  const p =
    symbolicBoundary && !omitted && !reveals.revealBasePerimeter
      ? (symbolicPerimeter ?? "P")
      : number(metrics.includedPerimeter);
  const unknownHeight = g.heightLabel?.replace(/\s+(cm|mm|m)$/, "").trim();
  const heightSymbol =
    unknownHeight && /^[A-Za-z]{1,2}$/.test(unknownHeight)
      ? unknownHeight
      : "H";
  const h = g.water
    ? reveals.revealWaterDepth
      ? number(g.height)
      : v.target === "increase"
        ? "Δd"
        : "d"
    : unknownHeight
      ? heightSymbol
      : number(g.height);
  const numeric = /^\d+(?:\.\d+)?$/;
  const bothKnown = numeric.test(p) && numeric.test(h);
  const perimeterFactor =
    numeric.test(p) || /^[A-Za-z]+$/.test(p) ? p : `(${p})`;
  return {
    g,
    metrics,
    omitted,
    p,
    h,
    perimeterFactor,
    bothKnown,
    unknownHeight,
    heightSymbol,
  };
}

export function lateralCalculation(
  v: SurfaceVariant,
  reveals: AreaReveals = {},
) {
  const c = copy.surfaceArea;
  const factors = prismFactors(v, reveals);
  if (!factors) return { title: c.lateralWorking, lines: [] };
  const {
    g,
    metrics,
    omitted,
    h,
    perimeterFactor,
    bothKnown,
    unknownHeight,
    heightSymbol,
  } = factors;
  const result = number(metrics.lateralArea);
  const relation =
    Math.abs(metrics.lateralArea - Number(result)) > 1e-8 ? "≈" : "=";
  return {
    title: g.water
      ? v.target === "increase"
        ? c.newWetWallWorking
        : c.wetWallWorking
      : c.lateralWorking,
    lines: [
      g.water
        ? v.target === "increase"
          ? c.wetBandFormula
          : c.wetWallFormula
        : omitted
          ? c.retainedLateralFormula
          : c.lateralFormula,
      `= ${perimeterFactor} × ${h}${bothKnown ? ` ${relation} ${result}` : ""} ${v.unit}²`,
      ...(!g.water &&
      unknownHeight &&
      heightSymbol === "H" &&
      unknownHeight.toLowerCase() !== "height"
        ? [`H = ${unknownHeight}`]
        : []),
    ],
  };
}
