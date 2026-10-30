import {
  applyOperation,
  BRIDGE_EQUATION,
  isolatedSolution,
  parseRational,
  TRANSFER_EQUATIONS,
  verifySolution,
  type Equation,
  type Operation,
} from "./model";

export const STORAGE_KEY = "lskc-equation-village-v1";
export type SavedMove = { kind: Operation["kind"]; amount: string };
export type Session = {
  version: 1;
  started: boolean;
  moves: SavedMove[];
  hints: number;
  mistakes: number;
  checkedValue: string;
  transferOpen: boolean;
  transferIndex: 0 | 1;
  transferMistakes: number;
  transferAnswer: string;
};
export function newSession(): Session {
  return {
    version: 1,
    started: false,
    moves: [],
    hints: 0,
    mistakes: 0,
    checkedValue: "",
    transferOpen: false,
    transferIndex: 0,
    transferMistakes: 0,
    transferAnswer: "",
  };
}
export function buildWorking(moves: SavedMove[]): Equation[] {
  const working = [BRIDGE_EQUATION];
  for (const move of moves) {
    const amount = parseRational(move.amount);
    if (!amount) break;
    const result = applyOperation(working[working.length - 1], {
      kind: move.kind,
      amount,
    });
    if (!result.ok || !result.changed) break;
    working.push(result.equation);
  }
  return working;
}
export function bridgeRestored(session: Session): boolean {
  const value = parseRational(session.checkedValue);
  const working = buildWorking(session.moves);
  return (
    session.started &&
    working.length === session.moves.length + 1 &&
    !!value &&
    isolatedSolution(working[working.length - 1]) !== null &&
    verifySolution(BRIDGE_EQUATION, value)
  );
}
export function transferComplete(session: Session): boolean {
  if (session.transferIndex === 1 && session.transferMistakes === 0)
    return false;
  const value = parseRational(session.transferAnswer);
  return (
    bridgeRestored(session) &&
    session.transferOpen &&
    !!value &&
    verifySolution(TRANSFER_EQUATIONS[session.transferIndex], value)
  );
}
export function restoreSession(raw: string | null): Session | null {
  if (!raw) return newSession();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const s = value as Record<string, unknown>;
    if (
      s.version !== 1 ||
      typeof s.started !== "boolean" ||
      !Array.isArray(s.moves) ||
      s.moves.length > 20
    )
      return null;
    const moves: SavedMove[] = [];
    for (const item of s.moves) {
      if (!item || typeof item !== "object") return null;
      if (
        !["add", "subtract", "multiply", "divide"].includes(item.kind) ||
        typeof item.amount !== "string" ||
        !parseRational(item.amount)
      )
        return null;
      moves.push({ kind: item.kind, amount: item.amount });
    }
    if (buildWorking(moves).length !== moves.length + 1) return null;
    for (const key of ["hints", "mistakes", "transferMistakes"]) {
      if (
        !Number.isSafeInteger(s[key]) ||
        (s[key] as number) < 0 ||
        (s[key] as number) > 10000
      )
        return null;
    }
    if (
      typeof s.checkedValue !== "string" ||
      typeof s.transferAnswer !== "string" ||
      typeof s.transferOpen !== "boolean" ||
      (s.transferIndex !== 0 && s.transferIndex !== 1)
    )
      return null;
    const session: Session = {
      version: 1,
      started: s.started,
      moves,
      hints: s.hints as number,
      mistakes: s.mistakes as number,
      checkedValue: s.checkedValue,
      transferOpen: s.transferOpen,
      transferIndex: s.transferIndex,
      transferMistakes: s.transferMistakes as number,
      transferAnswer: s.transferAnswer,
    };
    if (!session.started && moves.length) return null;
    if (session.checkedValue && !bridgeRestored(session)) return null;
    const hasTransferState =
      session.transferOpen ||
      session.transferIndex === 1 ||
      session.transferMistakes > 0 ||
      !!session.transferAnswer;
    if (hasTransferState && (!session.transferOpen || !bridgeRestored(session)))
      return null;
    if (session.transferIndex === 1 && session.transferMistakes === 0)
      return null;
    if (session.transferAnswer && !transferComplete(session)) return null;
    return session;
  } catch {
    return null;
  }
}
