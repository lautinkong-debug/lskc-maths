import { reasons, type LabId } from "./content";

export type TransferQuestion = {
  id: string;
  reasonId: string;
  lab: LabId;
  title: string;
  given: string;
  ask: string;
  answer: number;
  unit: string;
  condition: string;
  wrongConditions: [string, string];
  reasonChoices: string[];
  explanation: string;
  diagram: { angle: number; value: number; other: number; variant: number };
};
const variants = <T>(items: readonly T[], variant: number) =>
  items[((variant % items.length) + items.length) % items.length];
const definition = (id: string) => reasons.find((r) => r.id === id)!;
export const transferRoutes: Record<string, string[]> = {
  "Seven-topic check": ["r1", "r4", "r6", "r7", "r8", "r12", "r16"],
  "Reverse the reasoning": ["r2", "r3", "r5", "r9", "r11", "r13", "r17"],
  "Arcs and chords": ["r10", "r11", "r12", "r13", "r14", "r15", "r17"],
};
export function transferQuestion(
  reasonId: string,
  variant = 0,
): TransferQuestion {
  const r = definition(reasonId) ?? definition("r1");
  const v = Math.max(0, Math.floor(Number.isFinite(variant) ? variant : 0)) % 3;
  const base: TransferQuestion = {
    id: `${r.id}-${v}`,
    reasonId: r.id,
    lab: r.lab,
    title: "Find the missing value and justify your step",
    given: "",
    ask: "Find x.",
    answer: 0,
    unit: "cm",
    condition: "The chords belong to the same circle.",
    wrongConditions: [
      "The diagram looks symmetrical.",
      "The chords have the same direction.",
    ],
    reasonChoices: [],
    explanation: "",
    diagram: { angle: 70, value: 0, other: 0, variant: v },
  };
  switch (r.id) {
    case "r1": {
      const ab = variants([14, 22, 18], v);
      Object.assign(base, {
        given: `O is the centre. N is on chord AB, ON ⊥ AB and AB = ${ab} cm.`,
        ask: "Find AN = x.",
        answer: ab / 2,
        condition: "The perpendicular to AB passes through the centre O.",
        wrongConditions: [
          "Any perpendicular to AB is sufficient.",
          "N only needs to lie somewhere on AB.",
        ],
        explanation: `The perpendicular from O bisects AB, so AN = AB ÷ 2 = ${ab / 2} cm.`,
      });
      base.diagram.value = ab;
      break;
    }
    case "r2": {
      const half = variants([6, 8, 7], v);
      Object.assign(base, {
        given: `O is the centre. N is on non-diameter chord AB and AN = NB = ${half} cm.`,
        ask: "Find ∠ONB = x.",
        answer: 90,
        unit: "°",
        condition:
          "N is the mid-point of a non-diameter chord and ON joins it to the centre.",
        wrongConditions: [
          "N can be any point on the chord.",
          "AB must be horizontal.",
        ],
        explanation:
          "The line from the centre to the mid-point of a non-diameter chord is perpendicular to the chord.",
      });
      base.diagram.value = half;
      break;
    }
    case "r3": {
      const a = variants([2, -4, 1], v),
        b = variants([10, 6, 13], v);
      Object.assign(base, {
        given: `A and B lie on the circle, with A = (${a}, 0) and B = (${b}, 0). The dashed line is the perpendicular bisector of AB. O is the centre.`,
        ask: "Find the horizontal coordinate x of O.",
        answer: (a + b) / 2,
        unit: "",
        condition: "The line is perpendicular to AB at its mid-point.",
        wrongConditions: [
          "Any perpendicular to AB contains O.",
          "Any line through A contains O.",
        ],
        explanation: `The perpendicular bisector passes through O. Its horizontal coordinate is (${a} + ${b}) ÷ 2 = ${(a + b) / 2}.`,
      });
      base.diagram.value = a;
      base.diagram.other = b;
      break;
    }
    case "r4": {
      const d = variants([3, 5, 4], v);
      Object.assign(base, {
        given: `O is the centre. AB and CD are equal chords of this circle. OM ⊥ AB, ON ⊥ CD and OM = ${d} cm.`,
        ask: "Find ON = x.",
        answer: d,
        condition:
          "OM and ON are perpendicular distances from the same centre.",
        wrongConditions: [
          "Any distances to points on the chords can be compared.",
          "The chords need only look parallel.",
        ],
        explanation: `Equal chords are equidistant from the centre, so ON = OM = ${d} cm.`,
      });
      base.diagram.value = d;
      break;
    }
    case "r5": {
      const length = variants([12, 16, 14], v);
      Object.assign(base, {
        given: `O is the centre, and AB and CD are chords of this circle. OM ⊥ AB and ON ⊥ CD. OM = ON and AB = ${length} cm.`,
        ask: "Find CD = x.",
        answer: length,
        condition:
          "The chords have equal perpendicular distances from the centre of the same circle.",
        wrongConditions: [
          "The distances may be measured along any slanting line.",
          "The chords must have the same direction.",
        ],
        explanation: `Chords equidistant from the centre are equal, so CD = AB = ${length} cm.`,
      });
      base.diagram.value = length;
      break;
    }
    case "r6": {
      const a = variants([86, 118, 142], v);
      Object.assign(base, {
        given: `O is the centre and ∠AOB = ${a}°. P lies on the major arc AB.`,
        ask: "Find ∠APB = x.",
        answer: a / 2,
        unit: "°",
        condition:
          "The centre angle and circumference angle stand on the same arc AB not containing P.",
        wrongConditions: [
          "Any centre angle can be paired with any circumference angle.",
          "P is allowed to lie inside the circle.",
        ],
        explanation: `The centre angle is twice the circumference angle on the same arc. x = ${a} ÷ 2 = ${a / 2}°.`,
      });
      base.diagram.angle = a;
      break;
    }
    case "r7": {
      const a = variants([47, 62, 38], v);
      Object.assign(base, {
        given: `A, B, P and Q lie on this circle. P and Q are on the same side of AB, and ∠APB = ${a}°.`,
        ask: "Find ∠AQB = x.",
        answer: a,
        unit: "°",
        condition:
          "P and Q are on the circumference, on the same side of chord AB.",
        wrongConditions: [
          "P and Q can be on opposite sides of AB.",
          "P and Q can be any points inside the circle.",
        ],
        explanation: `The two angles stand on AB in the same segment, so x = ${a}°.`,
      });
      base.diagram.angle = 2 * a;
      base.diagram.value = a;
      break;
    }
    case "r8": {
      Object.assign(base, {
        given:
          "AB is a diameter. P is a point on the circumference, distinct from A and B.",
        ask: "Find ∠APB = x.",
        answer: 90,
        unit: "°",
        condition:
          "AB is a diameter and the angle vertex P is on the circumference.",
        wrongConditions: [
          "AB only needs to look horizontal.",
          "P can be any point inside the circle.",
        ],
        explanation:
          "An angle in a semicircle is 90°. The direction of the diameter does not matter.",
      });
      base.diagram.angle = 180;
      break;
    }
    case "r9": {
      const radius = variants([7, 9, 6], v);
      Object.assign(base, {
        given: `A, B and P lie on the circle, ∠APB = 90°, and the radius is ${radius} cm.`,
        ask: "Find AB = x.",
        answer: radius * 2,
        condition:
          "The right-angle vertex P and endpoints A and B all lie on the circle.",
        wrongConditions: [
          "The right-angle vertex may lie anywhere inside the circle.",
          "AB only needs to look like the longest side.",
        ],
        explanation: `By the converse of the angle in a semicircle, AB is a diameter. Hence AB = 2 × ${radius} = ${radius * 2} cm.`,
      });
      base.diagram.angle = 180;
      base.diagram.value = radius;
      break;
    }
    case "r10":
    case "r12": {
      const value =
          r.id === "r10" ? variants([9, 12, 7], v) : variants([8, 11, 9], v),
        a = variants([64, 88, 108], v),
        arc = r.id === "r10";
      Object.assign(base, {
        given: `O is the centre. ∠AOB = ∠COD = ${a}°. The ${arc ? "minor arc" : "chord"} AB has length ${value} cm.`,
        ask: `Find the length x of ${arc ? "minor arc" : "chord"} CD.`,
        answer: value,
        condition:
          "The corresponding angles and lengths belong to the same circle.",
        wrongConditions: [
          "Equal angles guarantee equal lengths in circles of any radii.",
          "Equal angles imply the chords must be parallel.",
        ],
        explanation: `Equal centre angles in the same circle give equal ${arc ? "corresponding arcs" : "chords"}. Therefore x = ${value} cm.`,
      });
      base.diagram.angle = a;
      base.diagram.value = value;
      break;
    }
    case "r11":
    case "r13": {
      const a = variants([72, 104, 126], v),
        arc = r.id === "r11";
      Object.assign(base, {
        given: `The ${arc ? "minor arcs" : "chords"} AB and CD are equal in this circle. ∠AOB = ${a}° and O is the centre.`,
        ask: "Find the minor centre angle ∠COD = x.",
        answer: a,
        unit: "°",
        condition: arc
          ? "Compare the centre angles corresponding to the equal minor arcs."
          : "Compare minor centre angles subtended by equal chords in the same circle.",
        wrongConditions: [
          "A minor angle may be compared with a reflex angle without adjustment.",
          "The circles may have different radii.",
        ],
        explanation: `Equal ${arc ? "arcs" : "chords"} in the same circle subtend equal corresponding centre angles. Thus x = ${a}°.`,
      });
      base.diagram.angle = a;
      break;
    }
    case "r14":
    case "r15": {
      const value = variants([8, 10, 13], v),
        toArc = r.id === "r14";
      Object.assign(base, {
        given: `The ${toArc ? "chords" : "minor arcs"} AB and CD are equal in this circle. The ${toArc ? "minor arc" : "chord"} AB has length ${value} cm.`,
        ask: `Find the length x of ${toArc ? "minor arc" : "chord"} CD.`,
        answer: value,
        condition: toArc
          ? "The chords are in the same circle; compare minor arc with minor arc."
          : "The equal arcs belong to the same circle.",
        wrongConditions: [
          "Compare a minor arc with a major arc of an equal chord.",
          "The lengths can be compared across circles with different radii.",
        ],
        explanation: `Equal ${toArc ? "chords give equal corresponding minor arcs" : "arcs give equal chords"} in the same circle, so x = ${value} cm.`,
      });
      base.diagram.angle = variants([64, 80, 106], v);
      base.diagram.value = value;
      break;
    }
    case "r16":
    case "r17": {
      const small = variants([30, 35, 40], v),
        ratio = variants([2, 3, 2.5], v),
        length = variants([6, 4, 8], v),
        circ = r.id === "r17",
        large = small * ratio;
      Object.assign(base, {
        given: `The highlighted arcs AB and CD subtend ${circ ? "circumference" : "centre"} angles ${large}° and ${small}° respectively in the same circle. Arc CD = ${length} cm.`,
        ask: "Find the length x of arc AB.",
        answer: ratio * length,
        condition: circ
          ? "Each circumference angle stands on its own highlighted arc, which excludes its vertex."
          : "Each centre angle corresponds to its highlighted arc in the same circle.",
        wrongConditions: [
          "The same proportion must also hold for chord lengths.",
          "The angles can refer to unrelated arcs.",
        ],
        explanation: `Arc AB ÷ arc CD = ${large} ÷ ${small} = ${ratio}. Therefore x = ${length} × ${ratio} = ${ratio * length} cm. This proportion is for arcs, not chords.`,
      });
      base.diagram.angle = large;
      base.diagram.value = small;
      base.diagram.other = length;
      break;
    }
  }
  const distractors: Record<string, string[]> = {
    r1: ["r2", "r3"],
    r2: ["r1", "r3"],
    r3: ["r1", "r2"],
    r4: ["r5", "r1"],
    r5: ["r4", "r2"],
    r6: ["r7", "r8"],
    r7: ["r6", "r8"],
    r8: ["r9", "r7"],
    r9: ["r8", "r6"],
    r10: ["r11", "r12"],
    r11: ["r10", "r13"],
    r12: ["r13", "r10"],
    r13: ["r12", "r11"],
    r14: ["r15", "r12"],
    r15: ["r14", "r10"],
    r16: ["r17", "r12"],
    r17: ["r16", "r7"],
  };
  const choices = [r.id, ...distractors[r.id]],
    offset = (v + Number(r.id.slice(1))) % 3;
  base.reasonChoices = choices.slice(offset).concat(choices.slice(0, offset));
  return base;
}
export type TransferResponse = {
  value: string;
  reason: string;
  condition: string;
};
export type TransferGrade = {
  value: boolean;
  reason: boolean;
  condition: boolean;
  correct: boolean;
  messages: string[];
};
export function gradeTransfer(
  q: TransferQuestion,
  response: TransferResponse,
): TransferGrade {
  const number = Number(response.value.trim());
  const value =
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(response.value.trim()) &&
    Number.isFinite(number) &&
    Math.abs(number - q.answer) < 0.001;
  const reason = response.reason === q.reasonId,
    condition = response.condition === q.condition;
  const messages: string[] = [];
  if (!value)
    messages.push(`Check the quantity asked for (${q.ask}). ${q.explanation}`);
  if (!reason) {
    const selected = definition(response.reason);
    messages.push(
      selected
        ? `Your chosen reason starts with: ${selected.given} It concludes: ${selected.conclusion} Compare that direction with this question's given information.`
        : "Choose the reason that connects these givens to the quantity asked for.",
    );
  }
  if (!condition) messages.push(`The condition needed here is: ${q.condition}`);
  if (value && reason && condition)
    messages.push(`All three parts agree. ${q.explanation}`);
  return {
    value,
    reason,
    condition,
    correct: value && reason && condition,
    messages,
  };
}
/** Arc positions keep the two highlighted arcs disjoint; each circumference vertex is on its own complementary arc. */
export function transferArcConstruction(q: TransferQuestion) {
  const d = q.diagram,
    ratio = q.lab === "ratios",
    circumference = q.reasonId === "r17";
  const firstSweep = circumference ? 2 * d.angle : d.angle;
  const secondSweep = ratio ? (circumference ? 2 * d.value : d.value) : d.angle;
  const start = -90 - firstSweep / 2;
  const secondStart = start + firstSweep + (360 - firstSweep - secondSweep) / 2;
  return {
    firstSweep,
    secondSweep,
    start,
    secondStart,
    pAngle: start + firstSweep + (360 - firstSweep) * 0.45,
    qAngle: secondStart + secondSweep + (360 - secondSweep) * 0.62,
  };
}
export type TransferAttempt = {
  questionId: string;
  reasonId: string;
  variant: number;
  response: TransferResponse;
  grade: TransferGrade;
  at: string;
};
export type TransferSession = {
  route: string;
  index: number;
  variant: number;
  response: TransferResponse;
  submitted: boolean;
  attempts: TransferAttempt[];
};
export const blankTransferResponse = (): TransferResponse => ({
  value: "",
  reason: "",
  condition: "",
});
export const initialTransfer = (): TransferSession => ({
  route: "Seven-topic check",
  index: 0,
  variant: 0,
  response: blankTransferResponse(),
  submitted: false,
  attempts: [],
});
export function parseTransfer(value: unknown): TransferSession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Partial<TransferSession>;
  if (typeof v.route !== "string" || !Object.hasOwn(transferRoutes, v.route))
    return undefined;
  const index = Number.isInteger(v.index)
    ? Math.max(0, Math.min(7, v.index!))
    : 0;
  const variant = Number.isInteger(v.variant) ? Math.max(0, v.variant!) % 3 : 0;
  const parseResponse = (r: unknown): TransferResponse => {
    const a =
      r && typeof r === "object" ? (r as Partial<TransferResponse>) : {};
    return {
      value: typeof a.value === "string" ? a.value.slice(0, 30) : "",
      reason:
        typeof a.reason === "string" && reasons.some((x) => x.id === a.reason)
          ? a.reason
          : "",
      condition:
        typeof a.condition === "string" ? a.condition.slice(0, 250) : "",
    };
  };
  const attempts: TransferAttempt[] = Array.isArray(v.attempts)
    ? v.attempts.slice(-150).flatMap((a) => {
        if (
          !a ||
          typeof a !== "object" ||
          !reasons.some((r) => r.id === a.reasonId) ||
          !Number.isInteger(a.variant) ||
          a.variant < 0 ||
          a.variant > 2
        )
          return [];
        const q = transferQuestion(a.reasonId, a.variant),
          response = parseResponse(a.response);
        return [
          {
            questionId: q.id,
            reasonId: q.reasonId,
            variant: a.variant,
            response,
            grade: gradeTransfer(q, response),
            at:
              typeof a.at === "string" && Number.isFinite(Date.parse(a.at))
                ? a.at
                : "",
          },
        ];
      })
    : [];
  return {
    route: v.route,
    index,
    variant,
    response: parseResponse(v.response),
    submitted: v.submitted === true,
    attempts,
  };
}
export function transferSummary(attempts: TransferAttempt[]) {
  const distinct = new Set(attempts.map((a) => a.reasonId));
  return {
    attempts: attempts.length,
    sampled: distinct.size,
    correct: attempts.filter((a) => a.grade.correct).length,
    valueErrors: attempts.filter((a) => !a.grade.value).length,
    reasonErrors: attempts.filter((a) => !a.grade.reason).length,
    conditionErrors: attempts.filter((a) => !a.grade.condition).length,
  };
}
export function transferReport(session: TransferSession) {
  const summary = transferSummary(session.attempts);
  return [
    "Circle Lab — new-diagram check",
    "Local record; no name or account collected.",
    `${summary.sampled}/17 reasons sampled; ${summary.correct}/${summary.attempts} attempts had all three parts correct.`,
    `Value errors: ${summary.valueErrors}; reason errors: ${summary.reasonErrors}; condition errors: ${summary.conditionErrors}.`,
    "These results are evidence from this question sample, not a mastery judgement.",
    "",
    ...session.attempts.map((a) => {
      const q = transferQuestion(a.reasonId, a.variant);
      return `${a.at}\n${q.id}: ${q.given}\n${q.ask}\nResponse: ${a.response.value} ${q.unit}; reason ${a.response.reason}; condition: ${a.response.condition}\nValue ${a.grade.value ? "correct" : "review"}; reason ${a.grade.reason ? "correct" : "review"}; condition ${a.grade.condition ? "correct" : "review"}.\n`;
    }),
  ].join("\n");
}
