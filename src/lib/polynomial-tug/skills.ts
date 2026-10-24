import type { Skill } from "./types";
export const ENERGY_CAP = 6;
export const SKILLS: {
  id: Skill;
  level: number;
  cost: number;
  symbol: string;
}[] = [
  { id: "boost", level: 2, cost: 2, symbol: "↯" },
  { id: "shield", level: 3, cost: 2, symbol: "◇" },
  { id: "surge", level: 4, cost: 4, symbol: "✦" },
];
