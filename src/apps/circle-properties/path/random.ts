/** A small seeded generator, so a reload shows the same numbers and a retry shows new ones. */
export type Rng = () => number;

export function rng(seed: number): Rng {
  let a = (Math.floor(seed) >>> 0) + 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T>(r: Rng, items: readonly T[]): T =>
  items[Math.floor(r() * items.length)];
export const whole = (r: Rng, min: number, max: number) =>
  min + Math.floor(r() * (max - min + 1));
export function shuffle<T>(r: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/** A fresh seed for a new attempt. */
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
