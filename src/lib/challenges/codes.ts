export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function normaliseCode(value: string): string {
  return value.toUpperCase().replace(/\s/g, "");
}
export function validJoinCode(value: string): boolean {
  const code = normaliseCode(value);
  return code.length === 6 && [...code].every((letter) => CODE_ALPHABET.includes(letter));
}
export function displayCode(value: string): string {
  const code = normaliseCode(value).slice(0, 6);
  return code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}
export function randomJoinCode(random: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join("");
}
