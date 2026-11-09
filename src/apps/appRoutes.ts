import { circleCopy, classroomGamesCopy, copy } from "@/lib/copy";

/**
 * The slug and page title of every app, for the server side of /apps/[slug].
 *
 * That route must not import registry.ts. Each registry entry has a
 * `load: () => import(...)`, and on the server those imports make every app's
 * code part of the page, so opening one app downloads all of them. A unit test
 * keeps this list the same as the registry.
 */
export const appTitles: Readonly<Record<string, string>> = {
  "classroom-games": classroomGamesCopy.title,
  "circle-properties": circleCopy.title,
  "linear-equations": copy.linearEquations.title,
  "equation-village": copy.equationVillage.title,
  "algebra-simplification": copy.algebraSimplification.title,
  polynomials: copy.polynomials.title,
  "surface-area": copy.surfaceArea.title,
  congruence: copy.congruence.title,
  similarity: copy.similarity.title,
  "statistical-charts": copy.statisticalCharts.title,
  "directed-numbers": copy.apps.directedNumbers.title,
  "quadratic-explorer": copy.apps.quadratic.title,
  "unit-circle": copy.apps.unitCircle.title,
  "inequality-number-line": copy.apps.inequality.title,
};
