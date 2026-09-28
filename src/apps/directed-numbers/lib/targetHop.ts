import { moveFor, type Operation } from "./moves";

export type HopCard = { id: number; op: Operation; operand: number; delta: number };
export type HopPuzzle = {
  start: number;
  target: number;
  cards: HopCard[];
  minimum: number;
  par: number;
  solution: number[];
  requiresSubtractNegative: boolean;
};
const integer = (random: () => number, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));
function card(id: number, op: Operation, operand: number): HopCard {
  const move = moveFor(op, operand);
  return { id, op, operand, delta: move.direction === "left" ? -move.distance : move.direction === "right" ? move.distance : 0 };
}
function randomCard(id: number, random: () => number): HopCard {
  return card(id, random() < .5 ? "+" : "-", integer(random, 1, 5) * (random() < .5 ? -1 : 1));
}

/** Breadth-first search gives the fewest cards, with every intermediate hop on the line. */
export function solveHop(start: number, target: number, cards: readonly HopCard[]): number[] | null {
  const queue = [{ position: start, used: 0, path: [] as number[] }];
  const seen = new Set<string>([start + ":0"]);
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    if (state.position === target && state.path.length) return state.path;
    for (let i = 0; i < cards.length; i++) {
      if (state.used & (1 << i)) continue;
      const position = state.position + cards[i].delta;
      if (position < -12 || position > 12) continue;
      const used = state.used | (1 << i), key = position + ":" + used;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ position, used, path: [...state.path, cards[i].id] });
    }
  }
  return null;
}

export function makeHopPuzzle(random: () => number, level: 1 | 2 | 3, index: number): HopPuzzle {
  if (level === 3 && index % 2 === 0) {
    const start = integer(random, -6, 4), right = integer(random, 3, 6), left = integer(random, 1, right - 1);
    const cards = [
      card(0, "-", -right),
      card(1, "+", -left),
      card(2, "-", integer(random, 1, 5)),
      card(3, "+", -integer(random, 1, 5)),
      card(4, "-", integer(random, 1, 5)),
    ];
    const target = start + right - left, solution = solveHop(start, target, cards);
    if (!solution) throw new Error("A required-move puzzle was unsolvable");
    return { start, target, cards, minimum: solution.length, par: solution.length + 1, solution, requiresSubtractNegative: true };
  }
  for (let attempt = 0; attempt < 1000; attempt++) {
    const start = integer(random, -7, 7), cards = Array.from({ length: level === 1 ? 4 : 5 }, (_, i) => randomCard(i, random));
    let target = start;
    const chosen = new Set<number>();
    for (let step = 0; step < (level === 1 ? 2 : 3); step++) {
      const choices = cards.filter((item) => !chosen.has(item.id) && target + item.delta >= -12 && target + item.delta <= 12);
      if (!choices.length) break;
      const selected = choices[integer(random, 0, choices.length - 1)];
      chosen.add(selected.id); target += selected.delta;
    }
    if (target === start || target < -12 || target > 12) continue;
    const solution = solveHop(start, target, cards);
    if (solution && solution.length >= 2) return {
      start, target, cards, minimum: solution.length, par: solution.length + 1, solution, requiresSubtractNegative: false,
    };
  }
  throw new Error("Could not make a solvable Target Hop puzzle");
}

export function makeHopSet(random: () => number, level: 1 | 2 | 3): HopPuzzle[] {
  const puzzles: HopPuzzle[] = [], seen = new Set<string>();
  for (let index = 0; index < 10; index++) {
    let made = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const puzzle = makeHopPuzzle(random, level, index);
      const key = [puzzle.start, puzzle.target, ...puzzle.cards.map((item) => item.op + item.operand)].join("|");
      if (seen.has(key)) continue;
      seen.add(key); puzzles.push(puzzle); made = true; break;
    }
    if (!made) throw new Error("Could not make ten distinct puzzles");
  }
  return puzzles;
}

export function hopStars(used: number, puzzle: HopPuzzle): number {
  return used <= puzzle.minimum ? 3 : used <= puzzle.par ? 2 : 1;
}
