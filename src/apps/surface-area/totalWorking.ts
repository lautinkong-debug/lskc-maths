import { copy } from "@/lib/copy";
import { geometryMetrics, number } from "./geometry";
import { prismFactors, type AreaReveals } from "./lateralWorking";
import type { SurfaceVariant } from "./types";

/** Formula and unevaluated substitution are separate from the revealable result. */
export function totalCalculation(v: SurfaceVariant, reveals: AreaReveals = {}) {
  const c = copy.surfaceArea,
    g = v.geometry;
  const quantity = v.quantity ?? 1;
  const metric = geometryMetrics(g);
  const value = metric.totalArea * quantity;
  const rounded = number(value);
  const answer = `A ${Math.abs(value - Number(rounded)) > 1e-8 ? "≈" : "="} ${rounded} ${v.unit}²`;
  if (g.kind === "cubes")
    return {
      toggle: c.showTotalWorking,
      title: c.totalWorking,
      answer,
      lines: [
        c.compositeFormula,
        `= 6 × (${g.cubes.map((cube) => `${number(cube.side)}²`).join(" + ")}) − 2 × (${g.contacts.map((contact) => number(contact.area)).join(" + ")}) ${v.unit}²`,
        `= ${number(g.cubes.reduce((sum, cube) => sum + 6 * cube.side ** 2, 0))} − ${number(metric.removedArea)} ${v.unit}²`,
      ],
    };
  const factors = prismFactors(v, reveals)!;
  const baseExpression = v.baseWorking
    ?.split("=")
    .at(-1)
    ?.replace(/\s*(cm|mm|m)²\.?$/, "")
    .trim();
  const b =
    !reveals.revealBaseArea &&
    !g.areaIsGiven &&
    baseExpression &&
    /[a-z]/i.test(baseExpression)
      ? baseExpression
      : number(g.baseArea);
  const bFactor = /^\d+(?:\.\d+)?$/.test(b) ? b : `(${b})`;
  const baseTerm =
    g.baseCount === 2
      ? ` + 2 × ${bFactor}`
      : g.baseCount === 1
        ? ` + ${bFactor}`
        : "";
  const expression = `${factors.perimeterFactor} × ${factors.h}${baseTerm}`;
  const formula =
    quantity > 1
      ? c.quantityFormula(quantity)
      : v.target === "wetted"
        ? c.totalFormulaWet
        : v.target === "increase"
          ? c.wetBandFormula
          : factors.omitted
            ? c.totalFormulaRetained
            : g.baseCount === 2
              ? c.totalFormulaTwo
              : g.baseCount === 1
                ? c.totalFormulaOne
                : c.lateralFormula;
  const lines = [
    formula,
    `= ${quantity > 1 ? `${quantity} × (${expression})` : expression} ${v.unit}²`,
  ];
  // Evaluate the separate contributions, but never their final sum.
  if (factors.bothKnown && /^\d+(?:\.\d+)?$/.test(b) && g.baseCount) {
    const contributions = `${number(metric.lateralArea)} + ${number(g.baseCount * g.baseArea)}`;
    lines.push(
      `= ${quantity > 1 ? `${quantity} × (${contributions})` : contributions} ${v.unit}²`,
    );
  }
  if (
    !g.water &&
    factors.unknownHeight &&
    factors.heightSymbol === "H" &&
    factors.unknownHeight.toLowerCase() !== "height"
  )
    lines.push(`H = ${factors.unknownHeight}`);
  return {
    toggle:
      v.target === "wetted"
        ? c.showWettedWorking
        : v.target === "increase"
          ? c.showIncreaseWorking
          : v.target === "lateral"
            ? c.showLateralFormula
            : c.showTotalWorking,
    title:
      v.target === "wetted"
        ? c.wettedWorking
        : v.target === "increase"
          ? c.increaseWorking
          : v.target === "lateral"
            ? c.lateralWorking
            : c.totalWorking,
    lines,
    answer,
  };
}
