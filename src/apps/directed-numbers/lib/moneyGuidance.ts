import { magnitudeModel, type SimpleMove } from "./textbook";

/** Describe what happens to the money before naming the magnitude operation.
 * Crossing zero is distinct: the final magnitude may be smaller OR larger.
 */
export function moneyGuidance(move: SimpleMove) {
  const m = magnitudeModel(move);
  if (m.kind === "noMove") return "unchanged";
  if (m.kind === "fromZero")
    return m.sign === "positive" ? "startCredit" : "startDebt";
  if (m.kind === "same")
    return m.sign === "positive" ? "moreCredit" : "moreDebt";
  if (m.kind === "cancel") return "settled";
  if (m.exact.start.n < 0)
    return m.sign === "negative" ? "lessDebt" : "debtToCredit";
  return m.sign === "positive" ? "lessCredit" : "creditToDebt";
}
