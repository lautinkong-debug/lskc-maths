import { CODE_ALPHABET, normaliseCode } from "@/lib/challenges/codes";

export const SKILLS = ["numberLine", "addSubtract", "brackets", "signs", "mixed", "wordProblems", "mistakes"] as const;
export type Skill = typeof SKILLS[number];
export type SetSettings = { skills: Skill[]; level: 1 | 2; questionCount: 5 | 10 | 15 | 20; seed: number };
const BASE = CODE_ALPHABET.length;
const COUNTS = [5, 10, 20, 15] as const;
const SEED_MAX = 2 ** 24;
export function encodeSetCode(settings: SetSettings): string {
  if (!Number.isInteger(settings.seed) || settings.seed < 0 || settings.seed >= SEED_MAX || ![1,2].includes(settings.level) || !COUNTS.includes(settings.questionCount) || !settings.skills.length || settings.skills.some((skill) => !SKILLS.includes(skill))) throw new Error("Invalid set settings");
  const mask = settings.skills.reduce((value, skill) => value | (1 << SKILLS.indexOf(skill)), 0);
  const count = COUNTS.indexOf(settings.questionCount);
  const payload = settings.seed + mask * 2**24 + (settings.level - 1) * 2**31 + count * 2**32;
  const checksum = (settings.seed ^ mask ^ count ^ settings.level) & 15;
  let packed = payload + checksum * 2**34;
  let code = "";
  for (let index = 0; index < 8; index++) { code = CODE_ALPHABET[packed % BASE] + code; packed = Math.floor(packed / BASE); }
  if (packed) throw new Error("Set code overflow");
  return code;
}
export function decodeSetCode(input: string): SetSettings | null {
  const code = normaliseCode(input);
  if (code.length !== 8 || [...code].some((letter) => !CODE_ALPHABET.includes(letter))) return null;
  let packed = 0;
  for (const letter of code) packed = packed * BASE + CODE_ALPHABET.indexOf(letter);
  if (packed >= 2**38) return null;
  const seed = packed % 2**24;
  const mask = Math.floor(packed / 2**24) % 128;
  const level = (Math.floor(packed / 2**31) % 2 + 1) as 1 | 2;
  const count = Math.floor(packed / 2**32) % 4;
  const checksum = Math.floor(packed / 2**34) % 16;
  if (!mask || count > 3 || checksum !== ((seed ^ mask ^ count ^ level) & 15)) return null;
  return { seed, level, questionCount: COUNTS[count], skills: SKILLS.filter((_, index) => mask & (1 << index)) };
}
export function hashSeed(text: string): number {
  let hash = 2166136261;
  for (const char of text) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0) % SEED_MAX;
}
