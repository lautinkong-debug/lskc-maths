import { reasonQuestions, type ReasonQuestion } from "./content";
import { feedbackFor, questionFor } from "./practice";
import {
  chordComparisonChecks,
  theoremLessons,
  type GuidedReasonId,
} from "./theoremLessonData";

type ReasonId = GuidedReasonId | "r1" | "r2";
type MissingCase =
  | "missing-chord"
  | "missing-distance"
  | "missing-angle"
  | "missing-arc"
  | "missing-ratio";
export type GuideCaseKey = ReasonId | MissingCase;

type Check = {
  given: string;
  target: string;
  options: string[];
  answer: number;
  feedback: string[];
};

const families: GuideCaseKey[][] = [
  ["r1", "r2", "missing-chord", "r3"],
  ["r4", "missing-distance", "r5"],
  ["r6", "r7", "missing-angle", "r8", "r9"],
  ["r10", "r11", "r12", "missing-arc", "r13", "r14", "r15"],
  ["r16", "missing-ratio", "r17"],
];

export function getCaseFamily(id: GuidedReasonId): GuideCaseKey[] {
  return families.find((family) => family.includes(id))!;
}

// The fourth choice appears on *every* comparison, including valid cases.
const sufficient: Record<ReasonId, string> = {
  r1: "The perpendicular starts at the centre and meets the chord. That is enough to determine its two halves.",
  r2: "The join connects the centre to the mid-point of a non-diameter chord. That determines its angle to the chord.",
  r3: "The line goes through the mid-point at 90°. Together those facts locate the centre on the line.",
  r4: "The chords are equal and their distances are measured perpendicularly from the centre.",
  r5: "Both chords have the same perpendicular distance from the centre of this circle.",
  r6: "One angle is at the centre and one is at the circumference. They intercept the same arc.",
  r7: "The vertices are on the same side of the same chord and both angles stand on that chord.",
  r8: "The angle has its vertex on the circle and its arms end at opposite ends of a diameter.",
  r9: "The given right angle has its vertex on the circumference. Its opposite chord is determined.",
  r10: "The corresponding angles are equal and the arc lengths are compared in one circle or in equal circles.",
  r11: "The given arcs have equal lengths in the same circle and the angles intercept the matching arcs.",
  r12: "The given equal angles are of the same kind and stand on the two chords in one circle.",
  r13: "The chords are equal in the same circle, and the required angles correspond to matching arcs.",
  r14: "The chords are equal in one circle and you are comparing corresponding arcs of the same kind.",
  r15: "The equal arcs belong to the same circle. Their endpoints identify the two chords.",
  r16: "The respective centre angles and arcs are matched in the same circle.",
  r17: "The given circumference angles intercept the respective arcs in one circle.",
};

// Each correct explanation refers specifically to the givens in the separate written case.
const writtenFeedback: Record<GuidedReasonId, string> = {
  r3: "The centre lies on the perpendicular bisector of each chord. Their unique intersection P is therefore the centre.",
  r4: "AB and CD are equal chords. Their perpendicular distances OM and ON are equal, so ON is 3.5 cm.",
  r5: "The equal perpendicular distances are given. They make CD equal to the 13 cm chord AB.",
  r6: "The 112° angle and the reflex turn at O stand on the same major arc. The turn at O is twice 112°.",
  r7: "C and D see chord AB from the same segment. Their circumference angles are equal.",
  r8: "The arms of ∠BAC end at B and C, the endpoints of the diameter. The right angle is at A.",
  r9: "The given right angle is at B on the circumference. The chord opposite B is AC.",
  r10: "The two 84° centre angles give equal minor arc lengths. The second arc is also 7.5 cm.",
  r11: "The circumference angles at P and Q intercept the two given equal minor arcs. They have the same measure.",
  r12: "The equal centre angles stand on the straight chords CD and AB. Their lengths are equal.",
  r13: "The equal chords AB and CD subtend equal circumference angles because the angles at P and Q intercept the corresponding minor arcs.",
  r14: "The equal chords have equal corresponding major arcs. Both major arcs are 18 cm long.",
  r15: "The equal minor arcs have equal straight chords. CD has the same length as AB.",
  r16: "The 48° and 120° angles are at O. The length of arc AB is 48/120 of the length of arc CD.",
  r17: "The 30° and 45° angles are on the circumference. Arc CD is 45/30 of the length of arc AB.",
};

const baseQuestion = (id: ReasonId) =>
  reasonQuestions.find((q) => q.reasonId === id)!;
const originalCheck = (id: ReasonId) =>
  id === "r1" || id === "r2"
    ? chordComparisonChecks[id]
    : theoremLessons[id].check;

export function writtenReasonQuestion(id: GuidedReasonId) {
  const { options, answer } = theoremLessons[id].check;
  const context = baseQuestion(id);
  return {
    options,
    answer,
    feedback: options.map((option) =>
      option === id ? writtenFeedback[id] : feedbackFor(context, option),
    ),
  };
}

function validCheck(id: ReasonId, question: Check): Check {
  return {
    ...question,
    options: [...question.options, "insufficient"],
    feedback: [...question.feedback, sufficient[id]],
  };
}

type InsufficientExample = {
  given: string;
  target: string;
  distractors: [ReasonId, ReasonId, ReasonId];
  feedback: [string, string, string, string];
};

// The missing condition must allow *both* outcomes: the target could hold or fail.
function missingExample(id: MissingCase, variant: number): InsufficientExample {
  const turn = 32 + ((variant * 7) % 43);
  const length = 4 + (variant % 8);
  const alternate = variant % 2 === 1;
  switch (id) {
    case "missing-chord":
      return alternate
        ? {
            given: `In one circle, line ℓ meets chord CD at M and CM = MD = ${length} cm.`,
            target: "Must the centre of the circle lie on ℓ?",
            distractors: ["r3", "r2", "r1"],
            feedback: [
              "The mid-point is given. The angle between ℓ and CD is still unknown.",
              "The line in 16.2 must join the centre to the mid-point. This line is only known to pass through M.",
              "16.1 begins with a perpendicular from the centre.",
              "Through M you could draw the perpendicular bisector or an oblique line. Only the former is guaranteed to contain the centre.",
            ],
          }
        : {
            given: `A line ℓ meets a non-diameter chord AB at N at 90°. AB = ${2 * length} cm.`,
            target: `Must AN = NB = ${length} cm?`,
            distractors: ["r1", "r3", "r2"],
            feedback: [
              "Check whether ℓ passes through the centre. The right-angle mark at N gives only its angle to AB.",
              "To use the perpendicular bisector you would already need N to be the mid-point.",
              "The mid-point is the proposed conclusion, rather than a given fact.",
              "A perpendicular can meet AB at many points. The line must also pass through O to guarantee equal halves.",
            ],
          };
    case "missing-distance":
      return alternate
        ? {
            given: `AB and CD are chords in a circle with centre O. M lies on AB and N lies on CD. OM = ON = ${length} cm.`,
            target: "Must chords AB and CD be equal?",
            distractors: ["r5", "r4", "r3"],
            feedback: [
              "The distances to the chords must follow perpendiculars. M and N are only points on the chords.",
              "This reason starts with equal chords. Their equality is the target.",
              "Neither line is known to be a perpendicular bisector.",
              "Equal distances to two chosen points do not fix the shortest distances to the chords. Check for perpendiculars.",
            ],
          }
        : {
            given: `AB and CD are equal chords of one circle with centre O. M and N lie on AB and CD respectively. OM = ${length} cm.`,
            target: `Must ON = ${length} cm?`,
            distractors: ["r4", "r5", "r1"],
            feedback: [
              "Equal chords give equal perpendicular distances from O. Are M and N the perpendicular feet?",
              "This statement runs from equal perpendicular distances to equal chords. The distances are what you need.",
              "The case does not give a perpendicular from O to either chord.",
              "M and N could be the perpendicular feet or other positions on their chords. ON cannot be fixed from these givens.",
            ],
          };
    case "missing-angle":
      return alternate
        ? {
            given: `Points A, B and C lie on one circle. Chord AB is ${2 * length} cm long.`,
            target: "Must ∠ACB be 90°?",
            distractors: ["r8", "r9", "r6"],
            feedback: [
              "For a semicircle, you must establish that the chord is a diameter.",
              "The converse requires a known right angle at C.",
              "The angle at O on the matching arc is unknown.",
              "The chord might pass through the centre or miss it. Its length alone cannot settle that question.",
            ],
          }
        : {
            given: `A, B, P and Q are four distinct points on one circle. ∠APB = ${turn}°.`,
            target: `Must ∠AQB = ${turn}°?`,
            distractors: ["r7", "r6", "r8"],
            feedback: [
              "The angles see AB, but which side of AB contains Q?",
              "Both vertices P and Q are on the circumference.",
              "There is no diameter given.",
              `On the same side of AB the angle would be ${turn}°. On the opposite side it would be ${180 - turn}°. Either position fits the givens.`,
            ],
          };
    case "missing-arc":
      return alternate
        ? {
            given: `Chord AB in one circle and chord CD in another are both ${length} cm long.`,
            target: "Must their minor arcs have equal lengths?",
            distractors: ["r14", "r15", "r13"],
            feedback: [
              "Equal chords give equal arcs in the same circle or in circles of equal radius. Compare the circles.",
              "Equal arcs would have to be given for this direction.",
              "The target compares curved lengths, and the circle sizes are unknown.",
              "The two circles can have equal or different radii. Equal chord lengths alone do not guarantee equal arc lengths.",
            ],
          }
        : {
            given: `In one circle, a minor centre angle of ${turn}° intercepts arc AB. A centre angle of ${turn}° in another circle intercepts arc CD.`,
            target: "Must arcs AB and CD have equal lengths?",
            distractors: ["r10", "r11", "r12"],
            feedback: [
              "For equal arc lengths across circles, check whether the radii are equal.",
              "Equal arc lengths are the proposed conclusion, not part of the givens.",
              "The required comparison is between the curved arcs.",
              "The two turns sweep the same fraction of their circles. The circumferences may differ, so the lengths can differ too.",
            ],
          };
    case "missing-ratio":
      return alternate
        ? {
            given: `In one circle, ∠APB = ${turn}° and ∠CQD = ${turn + 12}° are circumference angles. A pupil colours one of the two arcs from A to B and one of the two arcs from C to D.`,
            target: `Must the coloured arc lengths, AB first, be in the ratio ${turn} to ${turn + 12}?`,
            distractors: ["r17", "r16", "r7"],
            feedback: [
              "Match each angle with the arc between its endpoints that excludes its own vertex.",
              "The angles given here have vertices on the circumference.",
              "The angles stand on different chords.",
              "Find out which arcs were coloured. The pupil could have chosen the intercepted arcs, or coloured one of the other arcs instead.",
            ],
          }
        : {
            given: `The minor centre angles for arcs AB and CD in two different circles measure ${turn}° and ${2 * turn}° respectively.`,
            target: "Can you conclude that arc CD is twice as long as arc AB?",
            distractors: ["r16", "r17", "r10"],
            feedback: [
              "The centre-angle ratio gives the arc-length ratio only when the circles have the same radius.",
              "The given angles have their vertices at the centres.",
              "The two turns are different, and no common radius is given.",
              "Arc length also depends on the radius. The 1 to 2 angle ratio alone cannot fix the length ratio across the two circles.",
            ],
          };
  }
}

const missingIds = new Set<GuideCaseKey>([
  "missing-chord",
  "missing-distance",
  "missing-angle",
  "missing-arc",
  "missing-ratio",
]);
function isMissing(key: GuideCaseKey): key is MissingCase {
  return missingIds.has(key);
}

/** Diameter retries rotate which side is given and which vertex the pupil must examine. */
function diameterRetry(id: "r8" | "r9", cycle: number): ReasonQuestion {
  const vertices = ["ABC", "BCD", "CDA", "DAB", "BCA", "CAB"];
  const [a, b, c] = vertices[cycle % vertices.length];
  const diameter = a + b;
  const angle = "∠" + a + c + b;
  const base = baseQuestion(id);
  return id === "r8"
    ? {
        ...base,
        given: `O is the centre, ${diameter} is a diameter, and ${c} is a third point on the circle.`,
        statement: `${angle} = 90°`,
        explanation: `The diameter is ${diameter}. The angle standing on it at ${c} is a right angle.`,
      }
    : {
        ...base,
        given: `Triangle ${a + b + c} is inscribed in a circle and ${angle} = 90°.`,
        statement: `${diameter} passes through the centre.`,
        explanation: `The right angle is at ${c}. Its opposite chord, ${diameter}, must be a diameter.`,
      };
}

/** Reconstruct a card from its saved key and variant, including the positions of its choices. */
export function getGuideCase(key: GuideCaseKey, variant = 0): Check {
  const index = Number.isSafeInteger(variant) && variant >= 0 ? variant : 0;
  if (isMissing(key)) {
    const example = missingExample(key, index);
    return {
      given: example.given,
      target: example.target,
      options: [...example.distractors, "insufficient"],
      answer: 3,
      feedback: example.feedback,
    };
  }
  const base = originalCheck(key);
  if (index === 0) return validCheck(key, base);
  const templates = reasonQuestions.filter((q) => q.reasonId === key);
  const cycle = index - 1;
  // Try a different context (e.g. circumference versus centre) before reusing one with new numbers.
  const template = templates[cycle % templates.length];
  const fresh =
    key === "r8" || key === "r9"
      ? diameterRetry(key, cycle + 1)
      : questionFor({
          questionId: template.id,
          variant: (1 + Math.floor(cycle / templates.length)) % 3,
        });
  const rotation = index % base.options.length;
  const options = [
    ...base.options.slice(rotation),
    ...base.options.slice(0, rotation),
  ];
  return validCheck(key, {
    given: fresh.given,
    target: fresh.statement,
    options,
    answer: options.indexOf(key),
    feedback: options.map((option) => feedbackFor(fresh, option)),
  });
}
