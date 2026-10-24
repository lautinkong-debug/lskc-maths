import type { Hint, Question } from "@/apps/polynomials/quest/questions";

export type Phase = "answering" | "correct" | "wrong";
export type Pair = {
  round: number;
  pulls: number;
  resolved: boolean;
  next: boolean[];
  lastPower: number;
};
export type Pupil = {
  attempt: number;
  phase: Phase;
  choice: number | null;
  previousSource: string | null;
};
export type Match = {
  seed: number;
  secret: string;
  revision: number;
  members: (string | null)[];
  pairs: Pair[];
  pupils: Pupil[];
  position: number;
  winner: number | null;
};
export type Move = {
  action: "answer" | "retry" | "next";
  questionId: string;
  option?: number;
};
export type MatchSummary = {
  revision: number;
  occupied: boolean[];
  position: number;
  winner: number | null;
  pairs: {
    level: number;
    power: number;
    pulls: number;
    ready: boolean[];
    advancing: boolean[];
    resolved: boolean;
    lastPower: number;
  }[];
};
export type PlayerView = {
  phase: Phase;
  question: { id: string; source: string; choices: string[]; hint: Hint };
  feedback: {
    correct: boolean;
    selected: number;
    correctOption: number;
    question: Question;
  } | null;
};
export type RoomStatus = "lobby" | "live" | "paused" | "closed";
export type Room = {
  code: string;
  owner: string;
  groupCount: number;
  status: RoomStatus;
  revision: number;
  expiresAt: number;
};
export type RoomView = {
  code: string;
  groupCount: number;
  status: RoomStatus;
  revision: number;
  expiresAt: number;
  role: "teacher" | "student";
  groups: MatchSummary[];
  you: { group: number; seat: number } | null;
  player: PlayerView | null;
};
