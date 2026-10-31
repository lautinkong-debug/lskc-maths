import {
  labs,
  reasons,
  reasonQuestions,
  type LabId,
  type ReasonQuestion,
} from "./content";

export const PRACTICE_KEY = "reason-practice-v3";
export const DAY = 86_400_000;
export type PracticeCard = { questionId: string; variant: number };
export type ReasonHistory = {
  seen: number;
  correct: number;
  mistakes: number;
  reviewedLater: number;
  firstCorrectAt: number | null;
  lastCorrectAt: number | null;
  lastCorrectCard: string | null;
  dueAt: number | null;
};
export type PracticeHistory = Record<string, ReasonHistory>;
export type PracticeState = {
  version: 3;
  queue: PracticeCard[];
  remaining: PracticeCard[];
  index: number;
  answer: string | null;
  revealed: boolean;
  recall: boolean;
  round: number;
  roundCorrect: number;
  answeredCount: number;
  missed: (PracticeCard & { after: number })[];
  history: PracticeHistory;
  focusLab: LabId | null;
  lastFocusToken: number;
  lastActivity: number;
};

const byId = new Map(reasonQuestions.map((q) => [q.id, q]));
const reasonById = new Map(reasons.map((r) => [r.id, r]));
export const cardKey = (card: PracticeCard) =>
  `${card.questionId}:${card.variant}`;
export const blankHistory = (): ReasonHistory => ({
  seen: 0,
  correct: 0,
  mistakes: 0,
  reviewedLater: 0,
  firstCorrectAt: null,
  lastCorrectAt: null,
  lastCorrectCard: null,
  dueAt: null,
});

// Each alternate is authored as a complete mathematical example. No blind text substitution.
const alternatives: Record<string, [string, string, string, string]> = {
  q1: [
    "O is the centre. N lies on non-diameter chord AB, ON ⊥ AB and AB = 14 cm.",
    "AN = NB = 7 cm",
    "O is the centre. ON ⊥ chord AB at N and NB = 6 cm; AB is not a diameter.",
    "AB = 2 × 6 = 12 cm",
  ],
  q2: [
    "O is the centre. N lies on non-diameter chord AB and AN = NB = 6 cm.",
    "ON ⊥ AB",
    "O is the centre. AB is a non-diameter chord, AB = 16 cm and AN = 8 cm.",
    "ON ⊥ AB",
  ],
  q3: [
    "Line ℓ meets chord AB at N. AN = NB = 5 cm and ℓ ⊥ AB.",
    "The centre O lies on ℓ.",
    "AB = 14 cm, AN = 7 cm, and line ℓ meets AB perpendicularly at N.",
    "The centre O lies on ℓ.",
  ],
  q4: [
    "In a circle centred at O, AB = CD, OM ⊥ AB, ON ⊥ CD and OM = 3 cm.",
    "ON = 3 cm",
    "In a circle centred at O, AB = CD, OM ⊥ AB, ON ⊥ CD and ON = 5 cm.",
    "OM = 5 cm",
  ],
  q5: [
    "In a circle centred at O, OM ⊥ AB, ON ⊥ CD, OM = ON and AB = 10 cm.",
    "CD = 10 cm",
    "In a circle centred at O, OM ⊥ AB, ON ⊥ CD, OM = ON and CD = 14 cm.",
    "AB = 14 cm",
  ],
  q6: [
    "O is the centre. P lies on major arc AB and ∠APB = 53°.",
    "Minor ∠AOB = 106°",
    "O is the centre. P lies on major arc AB and minor ∠AOB = 124°.",
    "∠APB = 62°",
  ],
  q7: [
    "A, B, P and Q lie on one circle. P and Q are on the same side of AB; ∠APB = 58°.",
    "∠AQB = 58°",
    "A, B, P and Q lie on one circle. P and Q are on the same side of AB; ∠AQB = 63°.",
    "∠APB = 63°",
  ],
  q8: [
    "A and B are on a circle and AB passes through its centre O. C is another point on the circumference.",
    "∠ACB = 90°",
    "AB is a diameter of a circle of radius 7 cm. C is another point on the circumference.",
    "∠ACB = 90°",
  ],
  q9: [
    "A, B and C are on a circle of radius 6 cm and ∠ACB = 90°.",
    "AB is a diameter.",
    "A, B and C lie on a circle. AC ⊥ BC.",
    "AB is a diameter.",
  ],
  q10: [
    "In a circle centred at O, minor ∠AOB = minor ∠COD = 82°.",
    "Minor arc AB = minor arc CD",
    "In a circle centred at O, reflex ∠AOB = reflex ∠COD = 240°.",
    "Major arc AB = major arc CD",
  ],
  q11: [
    "In a circle centred at O, minor arcs AB and CD each have length 5 cm.",
    "Minor ∠AOB = minor ∠COD",
    "In a circle centred at O, major arc AB = major arc CD.",
    "Reflex ∠AOB = reflex ∠COD",
  ],
  q12: [
    "In a circle centred at O, minor ∠AOB = minor ∠COD and AB = 9 cm.",
    "CD = 9 cm",
    "In a circle centred at O, minor ∠AOB = minor ∠COD and CD = 13 cm.",
    "AB = 13 cm",
  ],
  q13: [
    "In a circle centred at O, AB = CD and minor ∠AOB = 86°.",
    "Minor ∠COD = 86°",
    "In a circle centred at O, AB = CD and reflex ∠AOB = 250°.",
    "Reflex ∠COD = 250°",
  ],
  q14: [
    "AB and CD are chords of one circle, each 9 cm long.",
    "Minor arc AB = minor arc CD",
    "AB and CD are equal chords of one circle.",
    "Major arc AB = major arc CD",
  ],
  q15: [
    "In one circle, minor arc AB = minor arc CD and AB = 13 cm.",
    "CD = 13 cm",
    "In one circle, major arc AB = major arc CD and CD = 9 cm.",
    "AB = 9 cm",
  ],
  q16: [
    "In a circle centred at O, minor ∠AOB = 45° and minor ∠COD = 135°.",
    "Minor arc AB : minor arc CD = 1 : 3",
    "In a circle centred at O, the selected centre angles for arcs AB and CD are 240° and 120° respectively.",
    "Arc AB : arc CD = 2 : 1",
  ],
  q17: [
    "In one circle, arc AB not containing P subtends ∠APB = 30°. Arc CD not containing Q subtends ∠CQD = 75°.",
    "Arc AB : arc CD = 2 : 5",
    "In one circle, arc AB not containing P subtends ∠APB = 48°. Arc CD not containing Q subtends ∠CQD = 32°.",
    "Arc AB : arc CD = 3 : 2",
  ],
  q18: [
    "O is the centre. P lies on minor arc AB and ∠APB = 125°.",
    "Reflex ∠AOB = 250°",
    "O is the centre. P lies on minor arc AB and reflex ∠AOB = 230°.",
    "∠APB = 115°",
  ],
  q19: [
    "Circles centred at O and T have equal radii of 5 cm. Minor angles AOB and CTD are both 50°.",
    "Minor arc AB = minor arc CD",
    "Circles centred at O and T have equal radii of 8 cm. Minor angles AOB and CTD are both 75°.",
    "Minor arc AB = minor arc CD",
  ],
  q20: [
    "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 46°.",
    "Arc AB not containing P = arc CD not containing Q",
    "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 54°.",
    "Arc AB not containing P = arc CD not containing Q",
  ],
  q21: [
    "In one circle, arcs AB and CD are each 6 cm long and exclude P and Q respectively. P and Q are on the circumference.",
    "∠APB = ∠CQD",
    "In one circle, arcs AB and CD are each 8 cm long and exclude P and Q respectively. P and Q are on the circumference.",
    "∠APB = ∠CQD",
  ],
  q22: [
    "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 52° and AB = 10 cm.",
    "CD = 10 cm",
    "A, B, C, D, P and Q lie on one circle. ∠APB = ∠CQD = 35° and CD = 12 cm.",
    "AB = 12 cm",
  ],
  q23: [
    "AB = CD in one circle. P lies on major arc AB and Q lies on major arc CD; ∠APB = 42°.",
    "∠CQD = 42°",
    "AB = CD in one circle. P lies on major arc AB and Q lies on major arc CD; ∠CQD = 57°.",
    "∠APB = 57°",
  ],
};

export function questionFor(card: PracticeCard): ReasonQuestion {
  const base = byId.get(card.questionId) ?? reasonQuestions[0];
  if (card.variant % 3 === 0) return base;
  const values = alternatives[base.id],
    offset = card.variant % 3 === 1 ? 0 : 2;
  const explanation =
    card.variant % 3 === 2 && base.id === "q13"
      ? "Equal chords give equal matching angles. Compare reflex with reflex here: both stand on the corresponding major arcs."
      : card.variant % 3 === 2 && base.id === "q14"
        ? "Equal chords give equal corresponding arcs. Compare major with major here; do not pair a major arc with a minor arc."
        : base.explanation;
  return {
    ...base,
    given: values[offset],
    statement: values[offset + 1],
    explanation,
  };
}
type Flow = { input: string; output: string };
const flows: Record<string, Flow> = {
  r1: {
    input: "a perpendicular from the centre",
    output: "equal halves of a chord",
  },
  r2: {
    input: "the mid-point of a chord",
    output: "a perpendicular from the centre",
  },
  r3: {
    input: "a perpendicular bisector",
    output: "the location of the centre",
  },
  r4: { input: "equal chords", output: "equal perpendicular distances" },
  r5: { input: "equal perpendicular distances", output: "equal chords" },
  r6: {
    input: "centre and circumference angles on the same arc",
    output: "a two-to-one angle relationship",
  },
  r7: {
    input: "two circumference angles in the same segment",
    output: "equal circumference angles",
  },
  r8: { input: "a diameter", output: "a right angle at the circumference" },
  r9: { input: "a right angle at the circumference", output: "a diameter" },
  r10: { input: "equal angles", output: "equal corresponding arcs" },
  r11: { input: "equal corresponding arcs", output: "equal angles" },
  r12: { input: "equal angles", output: "equal chords" },
  r13: { input: "equal chords", output: "equal angles" },
  r14: { input: "equal chords", output: "equal corresponding arcs" },
  r15: { input: "equal corresponding arcs", output: "equal chords" },
  r16: {
    input: "angles at the centre",
    output: "the same ratio for the corresponding arcs",
  },
  r17: {
    input: "angles at the circumference",
    output: "the same ratio for their intercepted arcs",
  },
};
export function feedbackFor(q: ReasonQuestion, selected: string) {
  if (selected === q.reasonId) return q.explanation;
  const chosen = flows[selected],
    needed = flows[q.reasonId];
  if (!chosen || !needed) return "Choose one of the displayed reasons.";
  if (chosen.input === needed.output && chosen.output === needed.input)
    return `Your choice reverses this step: it starts with ${chosen.input} and concludes ${chosen.output}. Here you have ${needed.input} and need ${needed.output}.`;
  if (chosen.input === needed.input)
    return `Your choice starts with the right information (${chosen.input}), but it concludes ${chosen.output}. This step needs ${needed.output}.`;
  if (selected === "r16" && q.reasonId === "r17")
    return "Your choice uses angles at the centre. The marked vertices P and Q are on the circumference; match each angle to the arc that excludes its vertex.";
  if (selected === "r17" && q.reasonId === "r16")
    return "Your choice uses angles at the circumference. The given angles are at O, the centre. Match each selected centre angle to its own arc.";
  return `Your choice needs ${chosen.input} and gives ${chosen.output}. This step instead uses ${needed.input} to obtain ${needed.output}. Compare the highlighted given with your chosen reason.`;
}

export function initialPractice(collected: string[] = []): PracticeState {
  const deck = [
    ...reasonQuestions.filter((q) => !collected.includes(q.reasonId)),
    ...reasonQuestions.filter((q) => collected.includes(q.reasonId)),
  ].map((q) => ({ questionId: q.id, variant: 0 }));
  const history = Object.fromEntries(
    reasons
      .filter((r) => collected.includes(r.id))
      .map((r) => [r.id, { ...blankHistory(), seen: 1, correct: 1 }]),
  );
  return {
    version: 3,
    queue: deck.slice(0, 5),
    remaining: deck.slice(5),
    index: 0,
    answer: null,
    revealed: false,
    recall: true,
    round: 1,
    roundCorrect: 0,
    answeredCount: 0,
    missed: [],
    history,
    focusLab: null,
    lastFocusToken: 0,
    lastActivity: 0,
  };
}
export function focusPractice(
  state: PracticeState,
  lab: LabId,
  token: number,
): PracticeState {
  const ids = labs.find((l) => l.id === lab)!.reasonIds;
  const toCard = (q: ReasonQuestion) => ({
    questionId: q.id,
    variant: state.history[q.reasonId]?.seen ? 1 : 0,
  });
  const related = reasonQuestions
    .filter((q) => ids.includes(q.reasonId))
    .map(toCard);
  const others = reasonQuestions
    .filter((q) => !ids.includes(q.reasonId))
    .map(toCard);
  return {
    ...state,
    queue: related.slice(0, 5),
    remaining: [...related.slice(5), ...others],
    index: 0,
    answer: null,
    revealed: false,
    roundCorrect: 0,
    focusLab: lab,
    lastFocusToken: token,
  };
}
export function answerCard(
  state: PracticeState,
  selected: string,
  now: number,
): PracticeState {
  const card = state.queue[state.index];
  if (!card || state.answer !== null) return state;
  const q = questionFor(card);
  if (![q.reasonId, ...q.distractorIds].includes(selected)) return state;
  const previous = state.history[q.reasonId] ?? blankHistory(),
    correct = selected === q.reasonId;
  const later =
    correct &&
    previous.lastCorrectAt !== null &&
    now - previous.lastCorrectAt >= DAY &&
    previous.lastCorrectCard !== cardKey(card);
  const history: ReasonHistory = {
    ...previous,
    seen: previous.seen + 1,
    correct: previous.correct + Number(correct),
    mistakes: previous.mistakes + Number(!correct),
    reviewedLater: previous.reviewedLater + Number(later),
    firstCorrectAt: correct
      ? (previous.firstCorrectAt ?? now)
      : previous.firstCorrectAt,
    lastCorrectAt: correct ? now : previous.lastCorrectAt,
    lastCorrectCard: correct ? cardKey(card) : previous.lastCorrectCard,
    dueAt: correct ? now + (later ? 3 : 1) * DAY : now,
  };
  const answeredCount = state.answeredCount + 1;
  return {
    ...state,
    answer: selected,
    answeredCount,
    roundCorrect: state.roundCorrect + Number(correct),
    history: { ...state.history, [q.reasonId]: history },
    missed: correct
      ? state.missed.filter((m) => m.questionId !== card.questionId)
      : [
          ...state.missed.filter((m) => m.questionId !== card.questionId),
          {
            ...card,
            variant: (card.variant + 1) % 3,
            after: answeredCount + 3,
          },
        ],
    lastActivity: now,
  };
}
export const nextCard = (state: PracticeState): PracticeState => ({
  ...state,
  index: Math.min(state.queue.length, state.index + 1),
  answer: null,
  revealed: false,
});

export function nextRound(
  state: PracticeState,
  now: number,
  review = false,
): PracticeState {
  const eligible = state.missed.filter((m) => m.after <= state.answeredCount);
  const due = reasons
    .filter((r) => {
      const h = state.history[r.id];
      return (
        h?.lastCorrectAt !== null &&
        h?.dueAt !== null &&
        h?.dueAt !== undefined &&
        h.dueAt <= now
      );
    })
    .map((r) => {
      const h = state.history[r.id],
        candidates = reasonQuestions.filter((q) => q.reasonId === r.id);
      const old = h.lastCorrectCard?.split(":");
      const question =
        candidates.find((q) => q.id !== old?.[0]) ?? candidates[0];
      return {
        questionId: question.id,
        variant: question.id === old?.[0] ? (Number(old[1]) + 1) % 3 : 0,
      };
    });
  const blocked = new Set(
    state.missed
      .filter((m) => m.after > state.answeredCount)
      .map((m) => m.questionId),
  );
  const freshDeck = reasonQuestions.map((q) => ({
    questionId: q.id,
    variant: state.round % 3,
  }));
  const pool = state.remaining.length ? state.remaining : freshDeck;
  const priority = review ? [...due, ...eligible] : [...eligible, ...due];
  const queue: PracticeCard[] = [];
  for (const card of [...priority, ...pool]) {
    if (queue.length === 5) break;
    if (
      !blocked.has(card.questionId) &&
      !queue.some((c) => c.questionId === card.questionId)
    )
      queue.push({ questionId: card.questionId, variant: card.variant });
  }
  // A nonempty remainder can contain only recently missed, blocked cards.
  // Give other questions while those wait; an empty round cannot advance the
  // answer count and would also be rejected by the saved-session parser.
  if (!queue.length)
    for (const card of freshDeck) {
      if (queue.length === 5) break;
      if (!blocked.has(card.questionId)) queue.push(card);
    }
  return {
    ...state,
    queue,
    remaining: pool.filter(
      (c) => !queue.some((chosen) => cardKey(chosen) === cardKey(c)),
    ),
    index: 0,
    answer: null,
    revealed: false,
    round: state.round + 1,
    roundCorrect: 0,
    focusLab:
      !review &&
      state.focusLab &&
      queue.every(
        (card) =>
          reasonById.get(questionFor(card).reasonId)?.lab === state.focusLab,
      )
        ? state.focusLab
        : null,
    lastActivity: now,
  };
}
export function practiceSummary(history: PracticeHistory, now = Date.now()) {
  const values = Object.values(history);
  return {
    seen: values.filter((h) => h.seen > 0).length,
    correctOnce: values.filter((h) => h.correct > 0).length,
    reviewedLater: values.filter((h) => h.reviewedLater > 0).length,
    due: values.filter((h) => h.dueAt !== null && h.dueAt <= now).length,
    mistakes: values.reduce((a, h) => a + h.mistakes, 0),
  };
}

export function parsePractice(value: unknown): PracticeState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Partial<PracticeState>;
  if (v.version !== 3 || !Array.isArray(v.queue) || !Array.isArray(v.remaining))
    return undefined;
  const isCard = (c: unknown): c is PracticeCard =>
    !!c &&
    typeof c === "object" &&
    byId.has((c as PracticeCard).questionId) &&
    Number.isInteger((c as PracticeCard).variant) &&
    (c as PracticeCard).variant >= 0 &&
    (c as PracticeCard).variant < 3;
  const queue = v.queue.filter(isCard).slice(0, 5);
  if (!queue.length) return undefined;
  const bounded = (n: unknown, max = 1_000_000) =>
    typeof n === "number" && Number.isFinite(n)
      ? Math.max(0, Math.min(max, Math.floor(n)))
      : 0;
  const time = (n: unknown) =>
    typeof n === "number" &&
    Number.isFinite(n) &&
    n >= 0 &&
    n < 20_000_000_000_000
      ? n
      : null;
  const history: PracticeHistory = {};
  if (v.history && typeof v.history === "object")
    for (const r of reasons) {
      const h = v.history[r.id];
      if (h && typeof h === "object")
        history[r.id] = {
          seen: bounded(h.seen),
          correct: bounded(h.correct),
          mistakes: bounded(h.mistakes),
          reviewedLater: bounded(h.reviewedLater),
          firstCorrectAt: time(h.firstCorrectAt),
          lastCorrectAt: time(h.lastCorrectAt),
          dueAt: time(h.dueAt),
          lastCorrectCard:
            typeof h.lastCorrectCard === "string" &&
            /^q(?:[1-9]|1[0-9]|2[0-3]):[0-2]$/.test(h.lastCorrectCard)
              ? h.lastCorrectCard
              : null,
        };
    }
  const index = bounded(v.index, queue.length),
    current = queue[index] && questionFor(queue[index]);
  const answer =
    typeof v.answer === "string" &&
    current &&
    [current.reasonId, ...current.distractorIds].includes(v.answer)
      ? v.answer
      : null;
  return {
    ...initialPractice(),
    queue,
    remaining: v.remaining.filter(isCard).slice(0, 23),
    index,
    answer,
    revealed: v.revealed === true,
    recall: v.recall !== false,
    round: Math.max(1, bounded(v.round)),
    roundCorrect: bounded(v.roundCorrect, 5),
    answeredCount: bounded(v.answeredCount),
    history,
    missed: Array.isArray(v.missed)
      ? v.missed
          .filter(isCard)
          .slice(0, 23)
          .map((c) => ({
            ...c,
            after: bounded((c as { after?: unknown }).after),
          }))
      : [],
    focusLab: labs.some((l) => l.id === v.focusLab) ? v.focusLab! : null,
    lastFocusToken: bounded(v.lastFocusToken, Number.MAX_SAFE_INTEGER),
    lastActivity: time(v.lastActivity) ?? 0,
  };
}
export function readPracticeHistory(): PracticeHistory {
  try {
    return (
      parsePractice(
        JSON.parse(
          localStorage.getItem(`lskc-circle-workspace-v3:${PRACTICE_KEY}`) ??
            "null",
        ),
      )?.history ?? {}
    );
  } catch {
    return {};
  }
}
export const reasonLabel = (id: string) => reasonById.get(id)?.label ?? "";
