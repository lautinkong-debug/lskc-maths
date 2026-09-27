import { copy } from "@/lib/copy";
export interface Rational {
  n: number;
  d: number;
}
export type NumberError = "divisionByZero" | "overflow" | "invalidNumber";
export class RationalError extends Error {
  constructor(public readonly code: NumberError) {
    super(code);
  }
}
const ZERO = BigInt(0),
  ONE = BigInt(1),
  TEN = BigInt(10);
const MAX = BigInt(Number.MAX_SAFE_INTEGER);
function absolute(n: bigint) {
  return n < ZERO ? -n : n;
}
function gcd(a: bigint, b: bigint): bigint {
  while (b !== ZERO) {
    const next = a % b;
    a = b;
    b = next;
  }
  return absolute(a);
}
function normalise(n: bigint, d: bigint): Rational {
  if (d === ZERO) throw new RationalError("divisionByZero");
  if (n === ZERO) return { n: 0, d: 1 };
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  const factor = gcd(n, d);
  n /= factor;
  d /= factor;
  if (absolute(n) > MAX || d > MAX) throw new RationalError("overflow");
  return { n: Number(n), d: Number(d) };
}
export function rational(n: number, d = 1): Rational {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d))
    throw new RationalError("overflow");
  return normalise(BigInt(n), BigInt(d));
}
export function readNumber(raw: string): Rational {
  if (raw.length > 80) throw new RationalError("overflow");
  const text = raw
    .trim()
    .replace(/[−–]/g, "-")
    .replace(/\s*\/\s*/g, "/");
  const match =
    /^([+-]?)(?:(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\d+(?:\.\d+)?|\.\d+))$/.exec(
      text,
    );
  if (!match) throw new RationalError("invalidNumber");
  const s = match[1] === "-" ? -ONE : ONE;
  if (match[2])
    return normalise(
      s * (BigInt(match[2]) * BigInt(match[4]) + BigInt(match[3])),
      BigInt(match[4]),
    );
  if (match[5]) return normalise(s * BigInt(match[5]), BigInt(match[6]));
  const [whole, fraction = ""] = match[7].split(".");
  return normalise(
    s * BigInt((whole || "0") + fraction),
    TEN ** BigInt(fraction.length),
  );
}
export const add = (a: Rational, b: Rational) =>
  normalise(
    BigInt(a.n) * BigInt(b.d) + BigInt(b.n) * BigInt(a.d),
    BigInt(a.d) * BigInt(b.d),
  );
export const neg = (a: Rational): Rational => ({
  n: a.n === 0 ? 0 : -a.n,
  d: a.d,
});
export const sub = (a: Rational, b: Rational) => add(a, neg(b));
export const mul = (a: Rational, b: Rational) =>
  normalise(BigInt(a.n) * BigInt(b.n), BigInt(a.d) * BigInt(b.d));
export function div(
  a: Rational,
  b: Rational,
): { ok: true; value: Rational } | { ok: false; code: NumberError } {
  try {
    return {
      ok: true,
      value: normalise(BigInt(a.n) * BigInt(b.d), BigInt(a.d) * BigInt(b.n)),
    };
  } catch (error) {
    if (error instanceof RationalError) return { ok: false, code: error.code };
    throw error;
  }
}
export const abs = (a: Rational): Rational => ({ n: Math.abs(a.n), d: a.d });
export const sign = (a: Rational) => Math.sign(a.n);
export function compare(a: Rational, b: Rational): -1 | 0 | 1 {
  const difference = BigInt(a.n) * BigInt(b.d) - BigInt(b.n) * BigInt(a.d);
  return difference < ZERO ? -1 : difference > ZERO ? 1 : 0;
}
export const equals = (a: Rational, b: Rational) => compare(a, b) === 0;
export function terminates(a: Rational) {
  let d = a.d;
  for (const prime of [2, 5]) while (d % prime === 0) d /= prime;
  return d === 1;
}
function decimal(a: Rational) {
  if (!terminates(a)) return null;
  const d = BigInt(a.d);
  let remainder = BigInt(Math.abs(a.n)) % d;
  let text = String(BigInt(Math.abs(a.n)) / d);
  if (remainder !== ZERO) text += ".";
  while (remainder !== ZERO) {
    remainder *= TEN;
    text += String(remainder / d);
    remainder %= d;
  }
  return text;
}
type FormatOptions = {
  signed?: boolean;
  style?: "improper" | "mixed" | "decimal";
};
export function toText(
  a: Rational,
  { signed = false, style = "improper" }: FormatOptions = {},
) {
  const prefix = a.n < 0 ? "−" : signed && a.n > 0 ? "+" : "";
  const n = Math.abs(a.n);
  if (style === "decimal" && terminates(a)) return prefix + decimal(a);
  if (a.d === 1) return prefix + n;
  if (style === "mixed" && n >= a.d)
    return `${prefix}${Math.floor(n / a.d)} ${n % a.d}/${a.d}`;
  return `${prefix}${n}/${a.d}`;
}
export function toTex(a: Rational, options: FormatOptions = {}) {
  return toText(a, options)
    .replace(/(\d+)\/(\d+)/, "\\frac{$1}{$2}")
    .replace("−", "-");
}
export function toSpeech(a: Rational) {
  return copy.apps.directedNumbers.speechNumber(a.n, a.d);
}
