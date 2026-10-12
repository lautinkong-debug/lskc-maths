import { classVocabulary } from "./vocabularyModel";
import { format, tidy } from "./statistics";
export type VocabularyCalculationKind =
  | "markLimits"
  | "markBoundaries"
  | "upperLimit"
  | "upperBoundary"
  | "lowerLimit"
  | "lowerBoundary";
export function vocabularyCalculation(
  v: ReturnType<typeof classVocabulary>,
  precision: number,
  kind: VocabularyCalculationKind,
  step: number,
) {
  const mark = kind === "markLimits" || kind === "markBoundaries";
  if (mark) {
    const limits = kind === "markLimits",
      a = limits ? v.lower : v.low,
      b = limits ? v.upper : v.high;
    const fraction = `\\dfrac{${a}+${b}}{2}`;
    return {
      term: step === 3 ? 2 : limits ? 0 : 1,
      fields: step === 3 ? [4] : limits ? [0, 1] : [2, 3],
      latex:
        step === 0
          ? `${a}\\quad ${b}`
          : fraction +
            (step >= 2 ? `=\\dfrac{${format(tidy(a + b))}}{2}` : "") +
            (step === 3 ? `=${v.mark}` : ""),
    };
  }
  if (kind === "lowerLimit")
    return {
      term: step === 3 ? 1 : 0,
      fields: step === 3 ? [2] : [0],
      latex: [
        String(v.lower),
        `\\dfrac{${precision}}{2}=${format(v.halfStep)}`,
        `${v.lower}-${format(v.halfStep)}`,
        `${v.lower}-${format(v.halfStep)}=${v.low}`,
      ][step],
    };
  if (kind === "lowerBoundary")
    return {
      term: step === 1 ? 3 : 1,
      fields: step === 3 ? [2] : step === 0 ? [3] : step === 1 ? [5] : [3, 5],
      latex: [
        String(v.high),
        String(v.width),
        `${v.high}-${v.width}`,
        `${v.high}-${v.width}=${v.low}`,
      ][step],
    };
  if (kind === "upperLimit")
    return {
      term: step === 3 ? 1 : 0,
      fields: step === 3 ? [3] : [1],
      latex: [
        String(v.upper),
        `\\dfrac{${precision}}{2}=${format(v.halfStep)}`,
        `${v.upper}+${format(v.halfStep)}`,
        `${v.upper}+${format(v.halfStep)}=${v.high}`,
      ][step],
    };
  return {
    term: step === 1 ? 3 : 1,
    fields: step === 3 ? [3] : step === 0 ? [2] : step === 1 ? [5] : [2, 5],
    latex: [
      String(v.low),
      String(v.width),
      `${v.low}+${v.width}`,
      `${v.low}+${v.width}=${v.high}`,
    ][step],
  };
}
