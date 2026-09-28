export const ADJECTIVES = ["Brave", "Bright", "Calm", "Clever", "Cosy", "Daring", "Eager", "Gentle", "Happy", "Jolly", "Keen", "Kind", "Lively", "Lucky", "Mighty", "Nimble", "Plucky", "Quick", "Quiet", "Smart", "Speedy", "Steady", "Sunny", "Swift"] as const;
export const ANIMALS = [
  ["Fox", "🦊"], ["Panda", "🐼"], ["Owl", "🦉"], ["Penguin", "🐧"],
  ["Tiger", "🐯"], ["Koala", "🐨"], ["Dolphin", "🐬"], ["Turtle", "🐢"],
  ["Rabbit", "🐰"], ["Lion", "🦁"], ["Frog", "🐸"], ["Octopus", "🐙"],
  ["Whale", "🐳"], ["Cat", "🐱"], ["Dog", "🐶"], ["Unicorn", "🦄"],
] as const;
export type NicknameIndex = readonly [number, number];
export function validNicknameIndex(value: readonly number[]): value is NicknameIndex {
  return value.length === 2 && Number.isInteger(value[0]) && Number.isInteger(value[1]) && value[0] >= 0 && value[0] < ADJECTIVES.length && value[1] >= 0 && value[1] < ANIMALS.length;
}
export function nickname(value: NicknameIndex): string {
  if (!validNicknameIndex(value)) throw new Error("Invalid nickname choice");
  return `${ADJECTIVES[value[0]]} ${ANIMALS[value[1]][0]}`;
}
export function avatar(value: NicknameIndex): string {
  if (!validNicknameIndex(value)) throw new Error("Invalid avatar choice");
  return ANIMALS[value[1]][1];
}
export function randomNickname(random: () => number = Math.random): NicknameIndex {
  return [Math.floor(random() * ADJECTIVES.length), Math.floor(random() * ANIMALS.length)];
}
