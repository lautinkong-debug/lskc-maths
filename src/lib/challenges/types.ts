import { type Skill } from "@/apps/directed-numbers/lib/setCode";
import { type Scoring } from "./scoring";

export type ChallengeKind = "live" | "homework";
export type ChallengeStatus = "lobby" | "live" | "closed";
export type NameDisplay = "all" | "top10" | "avatars";
export type QuestionOrder = "same" | "shuffled";
export type ChallengeSettings = {
  skills: Skill[];
  level: 1 | 2;
  questionCount: 5 | 10 | 15 | 20;
  timeLimitSec: number | null;
  scoring: Scoring;
  order: QuestionOrder;
  maxAttempts: number;
  showNames: NameDisplay;
};
export type ChallengeRoom = {
  id: string;
  code: string;
  appSlug: "directed-numbers";
  title: string;
  kind: ChallengeKind;
  settings: ChallengeSettings;
  seed: number;
  classTag: string | null;
  season: string;
  status: ChallengeStatus;
  opensAt: Date;
  closesAt: Date;
  createdBy: string;
  createdAt: Date;
  expireAt: Date;
  playerCount: number;
};
export type ChallengeEntry = {
  uid: string;
  nickname: string;
  avatar: string;
  frame: number;
  joinedAt: Date;
  attempts: number;
  firstScore: number | null;
  bestScore: number | null;
  bestAccuracy: number | null;
  bestElapsedMs: number | null;
  improvement: number;
  sortKey: number | null;
  lastSubmittedAt: Date | null;
  expireAt: Date;
};
export type ClassBoard = {
  id: string;
  classes: Record<string,{players:number;totalBest:number}>;
  updatedAt: Date;
  expireAt: Date;
};
