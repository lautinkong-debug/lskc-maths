export type Coefficients = [number, number, number];
export type Term = [number, number]; // coefficient, power

export function parseAnswer(values: string[]): Coefficients | null {
  if (values.length !== 3) return null;
  const normalized = values.map((v) => v.trim().replaceAll("−", "-"));
  if (normalized.some((v) => !/^[+-]?\d+$/.test(v))) return null;
  const numbers = normalized.map(Number);
  if (numbers.some((n) => !Number.isSafeInteger(n) || Math.abs(n) > 999))
    return null;
  return numbers.map((n) => (n === 0 ? 0 : n)) as Coefficients;
}

export function termSource([coefficient, power]: Term): string {
  if (power === 0 || coefficient === 0) return String(coefficient);
  const variable = power === 1 ? "x" : `x^${power}`;
  return `${coefficient === 1 ? "" : coefficient === -1 ? "-" : `${coefficient}*`}${variable}`;
}

export function sumSources(sources: string[]): string {
  return (
    sources
      .filter((s) => s !== "0")
      .map((s, i) => (i && !s.startsWith("-") ? `+${s}` : s))
      .join("") || "0"
  );
}
export function termsSource(terms: Term[]): string {
  return sumSources(terms.map(termSource));
}
export function polynomialTerms(c: Coefficients): Term[] {
  return c.map((v, i) => [v, 2 - i]);
}
export function polynomialSource(c: Coefficients): string {
  return termsSource(polynomialTerms(c));
}
export function collect(terms: Term[]): Coefficients {
  const result: Coefficients = [0, 0, 0];
  for (const [c, p] of terms) result[2 - p] += c;
  return result;
}
export function groupedSource(terms: Term[]): string {
  return sumSources(
    [2, 1, 0].map((p) => {
      const coefficients = terms
        .filter((t) => t[1] === p && t[0] !== 0)
        .map((t) => String(t[0]));
      if (!coefficients.length) return "0";
      return `(${sumSources(coefficients)})${p ? `*x${p === 2 ? "^2" : ""}` : ""}`;
    }),
  );
}
export function sameAnswer(a: Coefficients, b: Coefficients): boolean {
  return a.every((n, i) => n === b[i]);
}
