import { parse, type Ast, type ParseResult } from "./parse";
import { copy } from "@/lib/copy";
export type Operation = "+" | "-";
export type Direction = "left" | "right" | "none";
export interface Move {
  op: Operation;
  b: number;
}
export interface Journey {
  start: number;
  moves: Move[];
}
export function moveFor(op: Operation, b: number) {
  const delta = op === "+" ? b : -b;
  return {
    direction: (delta > 0 ? "right" : delta < 0 ? "left" : "none") as Direction,
    distance: Math.abs(b),
    cell: `${op === "+" ? "add" : "sub"}-${b < 0 ? "neg" : "pos"}` as
      "add-pos" | "add-neg" | "sub-pos" | "sub-neg",
  };
}
/** The bird faces according to the operation, then follows the second number. */
export function birdFor(op: Operation, b: number) {
  return {
    facing: op === "+" ? "right" : "left",
    step: b > 0 ? "forward" : b < 0 ? "backward" : "stay",
    distance: Math.abs(b),
    travel: moveFor(op, b).direction,
  } as const;
}
export interface Hop {
  from: number;
  to: number;
  moveIndex: number;
  step: number;
  total: number;
}
export function hops(a: number, op: Operation, b: number): Hop[] {
  const { distance, direction } = moveFor(op, b);
  const count = distance === 0 || distance > 10 ? 1 : distance;
  const delta = direction === "left" ? -distance : distance;
  return Array.from({ length: count }, (_, i) => ({
    from: a + (delta * i) / count,
    to: a + (delta * (i + 1)) / count,
    moveIndex: 0,
    step: i + 1,
    total: count,
  }));
}
export function journeyHops(journey: Journey): Hop[] {
  let a = journey.start;
  return journey.moves.flatMap((move, moveIndex) => {
    const frames = hops(a, move.op, move.b).map((frame) => ({
      ...frame,
      moveIndex,
    }));
    a = frames.at(-1)!.to;
    return frames;
  });
}
export function autoRange(values: number[]) {
  const min = Math.min(0, ...values) - 1,
    max = Math.max(0, ...values) + 1;
  const desired = (max - min) / 16;
  const power = 10 ** Math.floor(Math.log10(Math.max(1, desired)));
  const step =
    [1, 2, 5, 10].map((n) => n * power).find((n) => n >= desired) ?? power * 10;
  return {
    min: Math.floor(min / step) * step,
    max: Math.ceil(max / step) * step,
    step,
  };
}
function integer(ast: Ast): number | null {
  if (ast.kind === "group") return integer(ast.child);
  return ast.kind === "number" && ast.value.d === 1 ? ast.value.n : null;
}
export function parseJourney(source: string): ParseResult<Journey> {
  const result = parse(source);
  if (!result.ok) return result;
  const moves: Move[] = [];
  function collect(ast: Ast): number | null {
    if (ast.kind === "binary" && (ast.op === "+" || ast.op === "-")) {
      const a = collect(ast.left),
        b = integer(ast.right);
      if (a === null || b === null || Math.abs(b) > 20) return null;
      moves.push({ op: ast.op, b });
      return a;
    }
    return integer(ast);
  }
  const start = collect(result.value);
  if (
    start === null ||
    Math.abs(start) > 20 ||
    moves.length < 1 ||
    moves.length > 4
  )
    return {
      ok: false,
      code: "journey",
      message: copy.apps.directedNumbers.errors.journey,
      span: { start: 0, end: source.length },
    };
  return { ok: true, value: { start, moves } };
}
export const signed = (n: number) =>
  n > 0 ? `+${n}` : String(n).replace("-", "−");
export const moveText = (move: Move) =>
  `${move.op === "-" ? "−" : "+"} (${signed(move.b)})`;
export const journeyText = (journey: Journey) =>
  `(${signed(journey.start)}) ${journey.moves.map(moveText).join(" ")}`;
