export type Skill =
  | "indices"
  | "terms"
  | "simplify"
  | "substitute"
  | "vertical"
  | "expand"
  | "applications";
export type Bank = "10A" | "10B" | "10C" | "10D" | "REV";
export type Distribution = {
  left: string[];
  right: string[];
  products: string[];
};
export type LessonStep = {
  title: string;
  reason: string;
  math?: string;
  tex?: string;
  target?: string;
  label?: string;
  focus?: { before: string[]; after?: string[] };
  distribution?: Distribution;
};
export type Lesson = {
  id: string;
  bank: Bank;
  number: number;
  part: string;
  page: number;
  skill: Skill;
  prompt: string;
  expression?: string;
  givenTex?: string;
  answer?: string;
  answerTex?: string;
  nonzero?: string[];
  sourceRect: number[];
  steps: LessonStep[];
  vertical?: { rows: string[][]; operator: string };
  diagram?: string;
  diagramLabels?: string[];
};
export type LessonFrame = {
  step: number;
  kind: "read" | "working" | "pair" | "product" | "focus" | "change";
  activeProduct?: number;
  revealedProducts?: number;
};
export function lessonFrames(lesson: Lesson): LessonFrame[] {
  const frames: LessonFrame[] = [{ step: -1, kind: "read" }];
  lesson.steps.forEach((step, i) => {
    if (step.distribution) {
      frames.push({ step: i, kind: "working", revealedProducts: 0 });
      step.distribution.products.forEach((_, p) => {
        frames.push({
          step: i,
          kind: "pair",
          activeProduct: p,
          revealedProducts: p,
        });
        frames.push({
          step: i,
          kind: "product",
          activeProduct: p,
          revealedProducts: p + 1,
        });
      });
    } else if (step.focus?.after) {
      frames.push({ step: i, kind: "focus" });
      frames.push({ step: i, kind: "change" });
    } else frames.push({ step: i, kind: "working" });
  });
  return frames;
}
