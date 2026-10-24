import { copy } from "@/lib/copy";
import type { SurfaceVariant } from "./types";
const c = copy.surfaceArea;
export function stepsFor(variant: SurfaceVariant) {
  const g = variant.geometry;
  return g.kind === "cubes"
    ? c.compositeSteps
    : c.steps.map((s, i) => {
        if (i === 0 && variant.target === "wetted")
          return {
            title: c.wettedTitle,
            hint: c.wettedHint,
            prompt: c.wettedPrompt,
          };
        if (i === 0 && variant.target === "increase")
          return {
            title: c.increaseTitle,
            hint: c.increaseHint,
            prompt: c.increasePrompt,
          };
        if (i === 0 && g.baseCount === 1)
          return {
            title: c.openBaseTitle,
            hint: c.openBaseHint,
            prompt: c.openPrompt,
          };
        if (i === 1 && g.holes?.length) return { ...s, hint: c.hollowHint };
        if (i === 3 && (g.holes?.length || g.omittedEdges?.length))
          return {
            ...s,
            title: c.multipleStrips,
            hint: g.holes?.length ? c.hollowHint : c.openHint,
          };
        if (i !== 4) return s;
        if (variant.target === "wetted")
          return {
            title: c.wettedTitle,
            hint: c.wettedHint,
            prompt: c.wettedPrompt,
          };
        if (variant.target === "increase")
          return {
            title: c.increaseTitle,
            hint: c.increaseHint,
            prompt: c.increasePrompt,
          };
        if (variant.target === "lateral")
          return {
            title: c.lateralOnly,
            hint: c.lateralOnlyHint,
            prompt: c.lateralPrompt,
          };
        if (g.baseCount < 2 || g.omittedEdges?.length)
          return {
            title: c.remainingBases,
            hint: c.openHint,
            prompt: c.openPrompt,
          };
        return s;
      });
}
export function shapeGroup(v: SurfaceVariant) {
  const g = v.geometry;
  if (g.kind === "cubes") return c.shapeGroups.composite;
  if (v.target === "wetted" || v.target === "increase")
    return c.shapeGroups.water;
  if (g.holes?.length) return c.shapeGroups.hollow;
  if (g.baseCount === 1 || g.omittedEdges?.length) return c.shapeGroups.open;
  if (g.outer.points.length === 3) return c.shapeGroups.triangle;
  if (g.outer.points.length === 4) return c.shapeGroups.quadrilateral;
  return c.shapeGroups.polygon;
}
