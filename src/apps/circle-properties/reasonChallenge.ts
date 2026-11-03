import { labs, reasons, type LabId } from "./content";
import { circleReasonGameCopy as c } from "@/lib/copy";
import {
  gradeTransfer,
  transferQuestion,
  type TransferQuestion,
} from "./transfer";

export type ChallengeGroupId =
  `topic-${LabId}` | "chords" | "angles" | "arcs" | "ratios" | "mixed";
export type ChallengeGroup = {
  id: ChallengeGroupId;
  title: string;
  reasonIds: string[];
};
export const challengeGroups: ChallengeGroup[] = [
  ...labs.map((lab, index): ChallengeGroup => ({
    id: `topic-${lab.id}`,
    title: c.topicTitle(index + 1, lab.id),
    reasonIds: lab.reasonIds,
  })),
  {
    id: "mixed",
    title: c.mixedTopic,
    reasonIds: reasons.map((reason) => reason.id),
  },
];

/** Original saved levels remain reviewable after introducing the seven topic groups. */
export const savedChallengeGroups: ChallengeGroup[] = [
  ...challengeGroups,
  {
    id: "chords",
    title: "Level 1 · Chords and mid-points",
    reasonIds: ["r1", "r2", "r3", "r4", "r5"],
  },
  {
    id: "angles",
    title: "Level 2 · Circle angles",
    reasonIds: ["r6", "r7", "r8", "r9"],
  },
  {
    id: "arcs",
    title: "Level 3 · Arcs, chords and angles",
    reasonIds: ["r10", "r11", "r12", "r13", "r14", "r15"],
  },
  { id: "ratios", title: "Level 4 · Arc ratios", reasonIds: ["r16", "r17"] },
];

export function challengeGroup(id: string | undefined): ChallengeGroup {
  return (
    savedChallengeGroups.find((group) => group.id === id) ?? challengeGroups[0]
  );
}

export type ReasonChallenge = {
  q: TransferQuestion;
  target: string;
  wrongTargets: [string, string];
  reasonChoices: string[];
  feedbackByReasonId: Record<string, string>;
};
export type ReasonChallengeResponse = {
  value: string;
  condition: string;
  target: string;
  reason: string;
};
export type ReasonChallengeGrade = {
  value: boolean;
  condition: boolean;
  target: boolean;
  reason: boolean;
  correct: boolean;
  score: number;
  messages: string[];
};

type TargetDefinition = { target: string; wrongTargets: [string, string] };
/** Relations use the labels in CheckDiagram, including P for the semicircle tasks and Q for the second ratio angle. */
const targets: Record<string, TargetDefinition> = {
  r1: {
    target: "AN = NB",
    wrongTargets: ["ON ⊥ AB", "AN = ON"],
  },
  r2: {
    target: "ON ⊥ AB",
    wrongTargets: ["AN = NB", "The centre O lies on AB."],
  },
  r3: {
    target: "The centre O lies on the perpendicular bisector of AB.",
    wrongTargets: [
      "Every line perpendicular to AB passes through O.",
      "O is the mid-point of AB.",
    ],
  },
  r4: {
    target: "OM = ON",
    wrongTargets: ["AB = CD", "OM = AB"],
  },
  r5: {
    target: "AB = CD",
    wrongTargets: ["OM = ON", "AB = OM"],
  },
  r6: {
    target: "∠AOB = 2 × ∠APB",
    wrongTargets: ["∠AOB = ∠APB", "∠APB = 2 × ∠AOB"],
  },
  r7: {
    target: "∠APB = ∠AQB",
    wrongTargets: ["∠APB = 2 × ∠AQB", "∠APB + ∠AQB = 180°"],
  },
  r8: {
    target: "∠APB = 90°",
    wrongTargets: ["AB is a diameter.", "AP = PB"],
  },
  r9: {
    target: "AB is a diameter.",
    wrongTargets: ["∠APB = 90°", "AP is a diameter."],
  },
  r10: {
    target: "Minor arc AB = minor arc CD",
    wrongTargets: ["AB = CD", "∠AOB = ∠COD"],
  },
  r11: {
    target: "Minor centre angle ∠AOB = minor centre angle ∠COD",
    wrongTargets: ["Minor arc AB = minor arc CD", "∠AOB = 2 × ∠COD"],
  },
  r12: {
    target: "AB = CD",
    wrongTargets: ["Minor arc AB = minor arc CD", "∠AOB = ∠COD"],
  },
  r13: {
    target: "Minor centre angle ∠AOB = minor centre angle ∠COD",
    wrongTargets: ["AB = CD", "Minor arc AB = minor arc CD"],
  },
  r14: {
    target: "Minor arc AB = minor arc CD",
    wrongTargets: ["AB = CD", "Minor arc AB = major arc CD"],
  },
  r15: {
    target: "AB = CD",
    wrongTargets: [
      "Minor arc AB = minor arc CD",
      "Chord AB has the same length as minor arc AB.",
    ],
  },
  r16: {
    target: "\\frac{arc AB}{arc CD} = \\frac{∠AOB}{∠COD}",
    wrongTargets: [
      "\\frac{AB}{CD} = \\frac{∠AOB}{∠COD}",
      "\\frac{arc AB}{arc CD} = \\frac{∠COD}{∠AOB}",
    ],
  },
  r17: {
    target: "\\frac{arc AB}{arc CD} = \\frac{∠APB}{∠CQD}",
    wrongTargets: [
      "\\frac{AB}{CD} = \\frac{∠APB}{∠CQD}",
      "\\frac{arc AB}{arc CD} = \\frac{∠CQD}{∠APB}",
    ],
  },
};

/** Ends an embedded given, conclusion or relation so the next feedback sentence starts cleanly. */
const sentence = (text: string) =>
  /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;

/** The target is the direct relation used to find x, not every other true consequence of the givens. */
export function getReasonChallenge(
  reasonId: string,
  variant = 0,
): ReasonChallenge {
  const q = transferQuestion(reasonId, variant);
  const definition = targets[q.reasonId];
  const feedbackByReasonId: Record<string, string> = {};
  for (const choiceId of q.reasonChoices) {
    if (choiceId === q.reasonId) continue;
    const choice = reasons.find((reason) => reason.id === choiceId)!;
    feedbackByReasonId[choiceId] = c.reasonMessage(
      sentence(choice.given),
      sentence(choice.conclusion),
      sentence(definition.target),
    );
  }
  return {
    q,
    ...definition,
    reasonChoices: [...q.reasonChoices],
    feedbackByReasonId,
  };
}

export const blankReasonChallengeResponse = (): ReasonChallengeResponse => ({
  value: "",
  condition: "",
  target: "",
  reason: "",
});

/** Reason selection and the target relation carry 60% of the score. */
export function gradeReasonChallenge(
  challenge: ReasonChallenge,
  response: ReasonChallengeResponse,
): ReasonChallengeGrade {
  const base = gradeTransfer(challenge.q, response);
  const target = response.target === challenge.target;
  const messages: string[] = [];
  if (!base.value) messages.push(c.valueMessage(challenge.q.explanation));
  if (!base.condition) messages.push(c.conditionMessage(challenge.q.condition));
  if (!target) messages.push(c.targetMessage(sentence(challenge.target)));
  if (!base.reason)
    messages.push(
      challenge.feedbackByReasonId[response.reason] ?? c.reasonFallback,
    );
  const correct = base.value && base.condition && target && base.reason;
  // The worked lines under a correct answer already give the explanation.
  if (correct) messages.push(c.allCorrect);
  return {
    value: base.value,
    condition: base.condition,
    target,
    reason: base.reason,
    correct,
    score:
      Number(base.value) * 20 +
      Number(base.condition) * 20 +
      Number(target) * 30 +
      Number(base.reason) * 30,
    messages,
  };
}

/** Stable per-round shuffling prevents choices from moving while a student answers. */
export function shuffleChallengeChoices<T>(
  values: readonly T[],
  seed: number,
): T[] {
  const result = [...values];
  let state = Math.imul(Math.floor(seed), 0x9e3779b1) >>> 0 || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const target = (state >>> 0) % (i + 1);
    [result[i], result[target]] = [result[target], result[i]];
  }
  return result;
}

export function createChallengeQueue(
  groupId: ChallengeGroupId,
  seed: number,
): string[] {
  const group = challengeGroup(groupId);
  return shuffleChallengeChoices(group.reasonIds, seed);
}
