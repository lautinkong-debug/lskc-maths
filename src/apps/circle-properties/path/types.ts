import type { LabId } from "../content";
import type { Figure, Pt, Tones } from "./figureModel";

export const stepIds = [
  "wonder",
  "discover",
  "prove",
  "remember",
  "use",
  "check",
] as const;
export type StepId = (typeof stepIds)[number];
export type LessonStepId = Exclude<StepId, "check">;

/**
 * Concrete, Pictorial, Abstract. Every station moves through the three in
 * order: handle a real object, read it as a diagram, then write it in symbols.
 */
export type CpaStage = "concrete" | "pictorial" | "abstract";
export const cpaStages: CpaStage[] = ["concrete", "pictorial", "abstract"];
export const cpaOf: Record<StepId, CpaStage> = {
  wonder: "concrete",
  discover: "concrete",
  prove: "pictorial",
  remember: "pictorial",
  use: "abstract",
  check: "abstract",
};

/** `why` is shown after the choice: what makes it right, or what to look at again. */
export type Option = {
  text: string;
  good?: boolean;
  why: string;
  /** Set when the option is a reason, so a wrong pick can be recorded as a mix-up. */
  reasonId?: string;
};

export type ToolId =
  | "given"
  | "radii"
  | "common"
  | "rhs"
  | "sss"
  | "sas"
  | "corrSides"
  | "corrAngles"
  | "isos"
  | "ext"
  | "adj"
  | "pyth"
  | "sum"
  | "bisector";

export type Blank = {
  options: string[];
  answer: number;
  /** A nudge for each wrong option, in the same order as `options`. */
  why?: (string | undefined)[];
};
export type ScriptStep = {
  /** The idea in plain words. Shown large. */
  say: string;
  /** The line as it is written in an exercise book; ___ marks the blank. */
  line?: string;
  blank?: Blank;
  show?: Tones;
  focus?: string[];
  tool?: ToolId;
  /** Rotate the turning group to this many degrees. */
  turn?: number;
};
/** A proof or a worked example, told one line at a time on one figure. */
export type Script = {
  kind: "proof" | "worked";
  title: string;
  reasonId?: string;
  know: string;
  want: string;
  figure: Figure;
  steps: ScriptStep[];
  /** The whole idea in one sentence, shown at the end. */
  moral: string;
};

export type NumberQuestion = {
  prompt: string;
  given: string;
  figure: Figure;
  answer: number;
  unit: string;
  /** Asked in order, one tap each. */
  hints: string[];
  /** The full written answer, one line each. */
  solution: string[];
  /** Typical wrong answers and what causes them. */
  slips?: { value: number; why: string }[];
};

export type Spot = { id: string; p: Pt; label: string };

type Base = {
  id: string;
  /** The id of a Wonder guess to show again once this activity is finished. */
  recall?: string;
};
export type Activity = Base &
  (
    | {
        kind: "story";
        title: string;
        text: string[];
        figure?: Figure;
      }
    | {
        /** Something to do with real objects, before any diagram appears. */
        kind: "hands";
        title: string;
        need: string[];
        todo: string[];
        /** What the student should be left wondering about. */
        look: string;
        figure?: Figure;
      }
    | {
        kind: "choice";
        prompt: string;
        note?: string;
        figure?: Figure;
        /** Tones to add once the student has answered. */
        reveal?: Tones;
        options: Option[];
        /** A prediction: any answer is accepted and the truth comes later. */
        guess?: boolean;
        after?: string;
      }
    | {
        kind: "explore";
        reasonId: string;
        title: string;
        todo: string;
        watch: string;
        options: Option[];
        after: string;
      }
    | {
        kind: "slide";
        title: string;
        todo: string;
        label: string;
        min: number;
        max: number;
        start: number;
        step: number;
        figure: (value: number) => Figure;
        readout: (value: number) => { label: string; value: string }[];
        options: Option[];
        after: string;
      }
    | { kind: "script"; script: Script }
    | {
        kind: "tiles";
        prompt: string;
        figure?: Figure;
        reasonId?: string;
        /** The wording, in order. */
        tiles: string[];
        /** Tempting tiles that do not belong. */
        extras: string[];
        hint: string;
        after?: string;
      }
    | {
        kind: "pick";
        prompt: string;
        figure: Figure;
        spots: Spot[];
        answer: string;
        why: Record<string, string>;
        after: string;
      }
    | { kind: "number"; make: (seed: number) => NumberQuestion }
    | {
        kind: "card";
        title: string;
        reasonIds: string[];
        body: string[];
        figure?: Figure;
      }
    | {
        kind: "maker";
        title: string;
        body: string[];
      }
  );
export type ActivityKind = Activity["kind"];

/** A quiz or test question. No hints; marked once. */
export type Question = {
  id: string;
  reasonIds: string[];
  /** The slip this question is built to catch, named in the report. */
  skill: SkillId;
  prompt: string;
  given?: string;
  figure?: Figure;
} & (
  | { kind: "choice"; options: Option[] }
  | {
      kind: "number";
      answer: number;
      unit: string;
      solution: string[];
      slips?: { value: number; why: string }[];
    }
);

export type SkillId =
  | "direction"
  | "halfChord"
  | "pythagoras"
  | "centreNeeded"
  | "distance"
  | "double"
  | "reflex"
  | "sameSegment"
  | "diameter"
  | "arcChord"
  | "ratio"
  | "angleChase";

export type FamilyId = "fold" | "double" | "spin";
export type Station = {
  id: LabId;
  n: number;
  title: string;
  family: FamilyId;
  reasonIds: string[];
  idea: string;
  /** One picture for each reason: blue for what is given, green for what follows. */
  pictures: Record<string, Figure>;
  steps: Record<LessonStepId, Activity[]>;
  check: (seed: number) => Question[];
  /** "What if…?" prompts for Explore, shown when the station is finished. */
  more: string[];
};
