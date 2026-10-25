import { sameAnswer, type Coefficients } from "./algebra";
import { generateQuestion, type Question, type Stage } from "./questions";

export type Session = {
  id: string;
  stage: Stage;
  seed: number;
  round: number;
  question: Question;
  phase: "answering" | "correct" | "correction" | "complete";
  supported: boolean;
  hint: boolean;
  recovery: number;
  seen: string[];
  cleared: number;
  unaided: number;
  combo: number;
  submitted?: Coefficients;
};
export type Action =
  | { type: "submit"; id: string; answer: Coefficients }
  | { type: "hint" | "next" | "retry"; id: string };
export function starsFor(unaided: number): number {
  return unaided === 6 ? 3 : unaided >= 4 ? 2 : 1;
}
export function newSession(stage: Stage, seed: number, id: string): Session {
  const question = generateQuestion(stage, 0, seed);
  return {
    id,
    stage,
    seed,
    round: 0,
    question,
    phase: "answering",
    supported: false,
    hint: false,
    recovery: 0,
    seen: [question.source],
    cleared: 0,
    unaided: 0,
    combo: 0,
  };
}
export function transition(s: Session, action: Action): Session {
  if (action.id !== s.question.id || s.phase === "complete") return s;
  if (action.type === "hint")
    return s.phase === "answering"
      ? { ...s, supported: true, hint: true, combo: 0 }
      : s;
  if (action.type === "submit") {
    if (
      s.phase !== "answering" ||
      action.answer.length !== 3 ||
      action.answer.some((n) => !Number.isSafeInteger(n) || Math.abs(n) > 999)
    )
      return s;
    if (!sameAnswer(action.answer, s.question.answer))
      return {
        ...s,
        phase: "correction",
        supported: true,
        combo: 0,
        submitted: action.answer,
      };
    return {
      ...s,
      phase: "correct",
      cleared: s.cleared + 1,
      unaided: s.unaided + (s.supported ? 0 : 1),
      combo: s.supported ? 0 : s.combo + 1,
      submitted: action.answer,
    };
  }
  if (action.type === "next" && s.phase === "correct") {
    if (s.round === 5) return { ...s, phase: "complete" };
    const question = generateQuestion(s.stage, s.round + 1, s.seed);
    return {
      ...s,
      round: s.round + 1,
      question,
      phase: "answering",
      supported: false,
      hint: false,
      recovery: 0,
      seen: [question.source],
      submitted: undefined,
    };
  }
  if (action.type === "retry" && s.phase === "correction") {
    let recovery = s.recovery,
      question = s.question;
    // A template has a finite pool (only 100 sources for a square). Prefer an
    // unseen source, but bound the search so repeated mistakes cannot freeze UI.
    for (let candidate = 0; candidate < 128; candidate++) {
      recovery++;
      question = generateQuestion(
        s.stage,
        s.round,
        (s.seed + recovery * 104729) >>> 0,
        s.question.source,
      );
      if (!s.seen.includes(question.source)) break;
    }
    const seen = s.seen.includes(question.source)
      ? [s.question.source, question.source]
      : [...s.seen, question.source];
    return {
      ...s,
      phase: "answering",
      question,
      supported: true,
      hint: false,
      recovery,
      seen,
      submitted: undefined,
    };
  }
  return s;
}
