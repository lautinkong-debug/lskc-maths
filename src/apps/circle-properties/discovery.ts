import type { LabId } from "./content";
import { defaults, normalise, type Parameters } from "./geometry";
import type { Mission } from "./missions";

export type ChallengeLevel = "support" | "core" | "stretch";
export type DiscoveryChoice = { id: string; label: string; feedback: string };
export type DiscoveryChallenge = {
  id: string;
  lab: LabId;
  level: ChallengeLevel;
  kind: "Predict" | "Keep it unchanged" | "Test a condition";
  prompt: string;
  answer: number | string;
  unit?: string;
  choices?: DiscoveryChoice[];
  hint: string;
  explanation: string;
  wrongFeedback: string;
  experiment?: Parameters;
};

const shape = (lab: LabId, changes: Partial<Parameters>) =>
  normalise(lab, { ...defaults[lab], ...changes });
const choice = (
  id: string,
  label: string,
  feedback: string,
): DiscoveryChoice => ({ id, label, feedback });

/** These questions refer to a NEW case, not a number visible on the live board. */
export function discoveryChallenge(
  lab: LabId,
  level: ChallengeLevel,
  missionIndex = 0,
): DiscoveryChallenge {
  const variant = Math.max(0, Math.min(2, Math.trunc(missionIndex)));
  const base = {
    id: `${lab}-${level}-${variant}`,
    lab,
    level,
    kind: "Predict" as const,
  };
  switch (lab) {
    case "bisector": {
      const length = [14, 18, 12][variant];
      if (level === "support")
        return {
          ...base,
          prompt: `New case: O is the centre, ON ⊥ AB, and AB = ${length} cm. Predict AN before changing the picture.`,
          answer: length / 2,
          unit: "cm",
          hint: "Compare the two right-angled triangles that share ON.",
          explanation: `The perpendicular from the centre bisects AB, so AN = ${length} ÷ 2 = ${length / 2} cm.`,
          wrongFeedback:
            "AB is the whole chord. Identify the equal parts before doing the calculation.",
          experiment: shape(lab, {
            primary: Math.sqrt(100 - (length / 2) ** 2),
            secondary: 0,
            rotation: 35,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: O is the centre and N is the mid-point of a non-diameter chord AB. Predict ∠ONB, even if AB slopes downwards.",
          answer: 90,
          unit: "°",
          hint: "This time equal halves are GIVEN. What can you conclude about the line from O?",
          explanation:
            "A line from the centre to the mid-point of a non-diameter chord is perpendicular to the chord. The orientation does not matter.",
          wrongFeedback:
            "Use the mid-point as the starting condition. A sloping diagram does not change the angle between ON and AB.",
          experiment: shape(lab, { primary: 6, secondary: 0, rotation: 135 }),
        };
      return {
        ...base,
        kind: "Test a condition",
        prompt:
          "A line is perpendicular to AB but does NOT pass through the centre. Must it bisect AB?",
        answer: "no",
        choices: [
          choice(
            "yes",
            "Yes, a right angle is enough",
            "Perpendicular alone is not enough. The perpendicular line may meet AB away from its mid-point.",
          ),
          choice(
            "no",
            "No, the centre condition is missing",
            "Correct: choose a point on AB away from the mid-point and draw a perpendicular there.",
          ),
        ],
        hint: "Imagine drawing a perpendicular through a point very close to A.",
        explanation:
          "A perpendicular through an off-centre point of AB is a counterexample. The original reason needs a perpendicular FROM THE CENTRE.",
        wrongFeedback:
          "Check where the perpendicular starts, not just its angle.",
      };
    }
    case "chords": {
      const offset = [3, 5, 7][variant];
      if (level === "support")
        return {
          ...base,
          prompt: `New case: AB = CD in one circle. OM and ON are perpendicular distances to the chords, and OM = ${offset} cm. Predict ON.`,
          answer: offset,
          unit: "cm",
          hint: "Keep the radius fixed and compare the half-chord right triangles.",
          explanation: `Equal chords in one circle are equidistant from the centre, so ON = ${offset} cm.`,
          wrongFeedback:
            "Both distances are perpendicular, and the chords are equal. A different drawing direction does not make one distance larger.",
          experiment: shape(lab, {
            primary: offset,
            secondary: -offset,
            rotation: 30,
            rotation2: 100,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: in one circle, AB is 6 cm from O and CD is 2 cm from O. Both distances are perpendicular. Which chord is longer?",
          answer: "cd",
          choices: [
            choice(
              "ab",
              "AB",
              "The farther chord uses more of the radius in the perpendicular direction, leaving a shorter half-chord.",
            ),
            choice(
              "cd",
              "CD",
              "Correct: CD is closer to the centre, so it is longer.",
            ),
            choice(
              "equal",
              "They are equal",
              "Equal chords require equal perpendicular distances in this circle. Here the distances differ.",
            ),
          ],
          hint: "A diameter passes through the centre and is the longest chord.",
          explanation:
            "CD is closer to O. With fixed radius r, half-chord² = r² − distance², so CD is longer.",
          wrongFeedback:
            "Compare the perpendicular distances, rather than which chord looks higher.",
          experiment: shape(lab, { primary: 6, secondary: 2, rotation2: 65 }),
        };
      return {
        ...base,
        kind: "Test a condition",
        prompt:
          "Two circles have radii 5 cm and 10 cm. A chord in each circle is 3 cm from its centre. Must the chords have equal lengths?",
        answer: "no",
        choices: [
          choice(
            "yes",
            "Yes, the distances are equal",
            "The radii are different. Equal perpendicular distances only force equal chords when the circles have equal radii.",
          ),
          choice(
            "no",
            "No, the circles have different radii",
            "Correct: the chord lengths are 8 cm and approximately 19.1 cm.",
          ),
        ],
        hint: "Use radius² − distance² to compare the two half-chords.",
        explanation:
          "The half-chords are √(25 − 9) = 4 cm and √(100 − 9) = √91 cm. Equal radii are a necessary condition for this inference.",
        wrongFeedback: "Check the radius condition before applying the reason.",
      };
    }
    case "centre": {
      const small = [55, 35, 70][variant];
      if (level === "support")
        return {
          ...base,
          prompt: `New case: the angle at P is ${small}°. What is the centre angle standing on the SAME intercepted arc?`,
          answer: small * 2,
          unit: "°",
          hint: "Compare the matching angles in the cases you explored.",
          explanation: `For the same intercepted arc, the centre angle is 2 × ${small}° = ${small * 2}°.`,
          wrongFeedback:
            "The requested angle is at the centre. Check whether you should double or halve the circumference angle.",
          experiment: shape(lab, {
            primary: small * 2,
            secondary: 35,
            rotation: 25,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: a highlighted major arc corresponds to a reflex centre angle of 250°. Predict the circumference angle intercepting that major arc.",
          answer: 125,
          unit: "°",
          hint: "Use the angle following the highlighted arc, not the remaining 110°.",
          explanation:
            "The circumference angle is 250° ÷ 2 = 125°. Halving 110° would use the wrong arc.",
          wrongFeedback:
            "Follow the major arc first. Its matching centre angle is 250°, and the circumference angle is half of it.",
          experiment: shape(lab, { primary: 250, secondary: 45, rotation: 40 }),
        };
      return {
        ...base,
        kind: "Keep it unchanged",
        prompt:
          "Keep A and B fixed. Move P along the same arc without crossing A or B. What happens to ∠APB?",
        answer: "same",
        choices: [
          choice(
            "same",
            "It stays the same",
            "Correct: the intercepted arc stays fixed.",
          ),
          choice(
            "larger",
            "It always becomes larger",
            "The sides AP and BP can change length while their angle remains unchanged.",
          ),
          choice(
            "zero",
            "It eventually becomes zero",
            "P cannot cross or coincide with A or B. On the same arc, the intercepted arc remains fixed.",
          ),
        ],
        hint: "Which intercepted arc does ∠APB face before and after the move?",
        explanation:
          "Its centre angle is fixed, so the matching circumference angle remains fixed. Try moving only P after loading the case.",
        wrongFeedback:
          "Track the intercepted arc, rather than the side lengths.",
        experiment: shape(lab, { primary: 150, secondary: 20, rotation: 15 }),
      };
    }
    case "segment": {
      const angle = [42, 53, 68][variant];
      if (level === "support")
        return {
          ...base,
          prompt: `New case: P and Q are on the same arc of AB, and ∠APB = ${angle}°. Predict ∠AQB.`,
          answer: angle,
          unit: "°",
          hint: "Both angles stand on the same chord and have vertices on the same side.",
          explanation: `Angles in the same segment are equal, so ∠AQB = ${angle}°.`,
          wrongFeedback:
            "Moving a vertex along the same arc does not change the intercepted chord or arc.",
          experiment: shape(lab, {
            primary: angle * 2,
            tertiary: 22,
            secondary: 80,
            rotation: 30,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: ∠APB = 70°. Q moves to the opposite arc of AB. Predict ∠AQB.",
          answer: 110,
          unit: "°",
          hint: "The two intercepted arcs complete 360°; each circumference angle is half its own arc angle.",
          explanation:
            "The intercepted arcs total 360°, so the two circumference angles total 180°. Thus ∠AQB = 180° − 70° = 110°.",
          wrongFeedback:
            "Q is no longer in the same segment as P. The equal-angle reason no longer applies.",
          experiment: shape(lab, {
            primary: 140,
            tertiary: 30,
            secondary: 55,
            alternate: true,
            rotation: 20,
          }),
        };
      return {
        ...base,
        kind: "Test a condition",
        prompt:
          "P is on the circumference. Q is inside the circle, on the same side of AB as P. Can you conclude ∠APB = ∠AQB from ‘same segment’?",
        answer: "no",
        choices: [
          choice(
            "yes",
            "Yes, they are on the same side",
            "Same side is only one condition. Q must also lie on the circumference.",
          ),
          choice(
            "no",
            "No, Q must also be on the circumference",
            "Correct: an interior point does not satisfy the angle-in-the-same-segment conditions.",
          ),
        ],
        hint: "Check both the side of the chord and the location of each vertex.",
        explanation:
          "The reason applies to two circumference angles in the same segment. Being on the same side alone is insufficient.",
        wrongFeedback: "Check whether both vertices are on the circle.",
      };
    }
    case "semicircle": {
      if (level === "support")
        return {
          ...base,
          prompt:
            "New case: AB is a diameter sloping at 35°. P is another point on the circumference. Predict ∠APB.",
          answer: 90,
          unit: "°",
          hint: "Is the direction of the diameter a condition of the theorem?",
          explanation:
            "The angle in a semicircle is 90°. Rotating the diameter does not change that condition.",
          wrongFeedback: "35° describes the drawing's orientation, not ∠APB.",
          experiment: shape(lab, { primary: 180, secondary: 30, rotation: 35 }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: A, P and B lie on a circle of radius 7 cm, and ∠APB = 90°. Predict AB.",
          answer: 14,
          unit: "cm",
          hint: "Use the converse first; then use the given radius.",
          explanation:
            "By the converse of the angle in a semicircle, AB is a diameter. Hence AB = 2 × 7 = 14 cm.",
          wrongFeedback:
            "The given 7 cm is a radius. First decide what the right angle tells you about AB.",
        };
      return {
        ...base,
        kind: "Keep it unchanged",
        prompt:
          "A and B are fixed and AB is not a diameter. Can moving only P on the circumference produce ∠APB = 90°?",
        answer: "no",
        choices: [
          choice(
            "yes",
            "Yes, slide P until it looks square",
            "A right circumference angle would imply AB is a diameter, contradicting the fixed condition.",
          ),
          choice(
            "no",
            "No, A or B must change as well",
            "Correct: moving P alone cannot turn a fixed non-diameter chord into a diameter.",
          ),
        ],
        hint: "Think backwards: what would a right angle at P imply about AB?",
        explanation:
          "The converse requires AB to be a diameter whenever ∠APB = 90°. With this non-diameter AB fixed, moving P alone cannot achieve it.",
        wrongFeedback: "Use the converse to test whether the goal is possible.",
        experiment: shape(lab, { primary: 120, secondary: 30, rotation: 25 }),
      };
    }
    case "equal-arcs": {
      const length = [12, 16, 14][variant];
      if (level === "support")
        return {
          ...base,
          prompt: `New case: two minor arcs in one circle are equal. Their chords are AB and CD, with AB = ${length} cm. Predict CD.`,
          answer: length,
          unit: "cm",
          hint: "Start with equal arcs. Which corresponding straight lengths can you compare?",
          explanation: `Equal arcs subtend equal chords, so CD = ${length} cm.`,
          wrongFeedback:
            "The arc and chord are different objects, but equal corresponding arcs in one circle give equal chord lengths.",
          experiment: shape(lab, {
            primary: (2 * Math.asin(length / 20) * 180) / Math.PI,
            secondary: (2 * Math.asin(length / 20) * 180) / Math.PI,
            rotation: 20,
            rotation2: 195,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: AB = CD in one circle. The minor centre angle subtended by AB is 75°. Predict the minor centre angle subtended by CD.",
          answer: 75,
          unit: "°",
          hint: "Match minor centre angle with minor centre angle.",
          explanation:
            "Equal chords subtend equal corresponding angles. The minor centre angle for CD is also 75°.",
          wrongFeedback:
            "You are asked for the minor angle. Do not switch to its reflex partner.",
          experiment: shape(lab, {
            primary: 75,
            secondary: 75,
            rotation: 55,
            rotation2: 220,
          }),
        };
      return {
        ...base,
        kind: "Test a condition",
        prompt:
          "Two equal chords in one circle have chosen arcs of 60° (minor) and 300° (major). What is major-arc length ÷ minor-arc length?",
        answer: 5,
        unit: "",
        hint: "Use the two corresponding centre angles; do not infer equal arcs when their types differ.",
        explanation:
          "The arc-length ratio is 300 ÷ 60 = 5. Compare minor with minor, or major with major, when using equal-chord reasons.",
        wrongFeedback:
          "Equal chords do not make a chosen major arc equal to a chosen minor arc.",
        experiment: shape(lab, {
          primary: 60,
          secondary: 300,
          rotation: 10,
          rotation2: 70,
        }),
      };
    }
    case "ratios": {
      if (level === "support")
        return {
          ...base,
          prompt:
            "New case: two arcs in one circle subtend centre angles of 90° and 30°. Predict first arc length ÷ second arc length.",
          answer: 3,
          unit: "",
          hint: "Both arcs are fractions of the same circumference.",
          explanation:
            "The arc-length ratio equals the centre-angle ratio, 90 ÷ 30 = 3.",
          wrongFeedback:
            "Use a quotient, not the difference between the angles.",
          experiment: shape(lab, {
            primary: 90,
            secondary: 30,
            rotation: 20,
            rotation2: 180,
          }),
        };
      if (level === "core")
        return {
          ...base,
          prompt:
            "New case: two arcs in one circle subtend circumference angles of 28° and 70°. Predict first arc length ÷ second arc length. Enter a decimal.",
          answer: 0.4,
          unit: "",
          hint: "Doubling both circumference angles does not change their ratio.",
          explanation:
            "The ratio is 28 ÷ 70 = 0.4. The matching centre angles 56° and 140° give the same ratio.",
          wrongFeedback:
            "Keep the requested order: first arc divided by second arc.",
          experiment: shape(lab, {
            primary: 56,
            secondary: 140,
            alternate: true,
            rotation: 20,
            rotation2: 190,
          }),
        };
      return {
        ...base,
        kind: "Test a condition",
        prompt:
          "A circle has radius 10 cm. Chords subtend centre angles of 60° and 180°. Predict the longer chord length ÷ the shorter chord length.",
        answer: 2,
        unit: "",
        hint: "A 60° centre angle makes an equilateral triangle with the two radii; the other chord is a diameter.",
        explanation:
          "The chords are 10 cm and 20 cm, so the ratio is 2. Their arc ratio is 3: angle/arc ratios do not generally equal chord ratios.",
        wrongFeedback:
          "3 is the angle and arc ratio. Use the straight chord lengths here.",
        experiment: shape(lab, {
          primary: 180,
          secondary: 60,
          rotation: 20,
          rotation2: 150,
        }),
      };
    }
  }
}

export function checkDiscovery(
  challenge: DiscoveryChallenge,
  answer: string,
): { correct: boolean; feedback: string } {
  if (typeof challenge.answer === "number") {
    const trimmed = answer.trim();
    if (!trimmed || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed))
      return {
        correct: false,
        feedback: "Enter a number for this new case, without its unit.",
      };
    const correct = Math.abs(Number(trimmed) - challenge.answer) < 0.001;
    return {
      correct,
      feedback: correct ? challenge.explanation : challenge.wrongFeedback,
    };
  }
  const selected = challenge.choices?.find((item) => item.id === answer);
  if (!selected)
    return {
      correct: false,
      feedback: "Choose a prediction for the new case.",
    };
  const correct = selected.id === challenge.answer;
  return {
    correct,
    feedback: correct ? challenge.explanation : selected.feedback,
  };
}

export const missionPrompt = (mission: Mission) => mission.target;

const noticeHints: Record<LabId, string> = {
  bisector:
    "Move N first. Watch the angle and compare the two lengths separately.",
  chords:
    "Move one chord at a time. Distance from O means a perpendicular distance.",
  centre:
    "Identify the highlighted arc before comparing its centre and circumference angles.",
  segment:
    "Keep A and B fixed briefly. Track which side contains each circumference vertex.",
  semicircle:
    "Move A or B to change the chord; moving P alone explores a different question.",
  "equal-arcs":
    "Match one pair of quantities first. Then inspect the other two pairs.",
  ratios: "Keep the order of each quotient the same: AB divided by CD.",
};
export function missionHints(mission: Mission): string[] {
  return [
    noticeHints[mission.lab],
    mission.hint,
    "Use the fine-tune controls below the circle if dragging is difficult. The displayed measurements are approximate.",
  ];
}

export type DiscoveryCheckState = {
  draft: string;
  checked: boolean;
  revealed: boolean;
  tried?: boolean;
};
export type DiscoverySession = {
  level: ChallengeLevel;
  hints: Record<string, number>;
  open: Record<string, boolean>;
  checks: Record<string, DiscoveryCheckState>;
};
export const emptyDiscoverySession = (): DiscoverySession => ({
  level: "core",
  hints: {},
  open: {},
  checks: {},
});
export function parseDiscoverySession(
  value: unknown,
): DiscoverySession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<DiscoverySession>;
  const result = emptyDiscoverySession();
  if (["support", "core", "stretch"].includes(raw.level ?? ""))
    result.level = raw.level!;
  const labs: LabId[] = [
    "bisector",
    "chords",
    "centre",
    "segment",
    "semicircle",
    "equal-arcs",
    "ratios",
  ];
  for (const lab of labs)
    for (let i = 0; i < 3; i++) {
      const missionId = `${lab}-${i + 1}`;
      const hint = raw.hints?.[missionId];
      if (typeof hint === "number" && Number.isFinite(hint))
        result.hints[missionId] = Math.max(0, Math.min(3, Math.trunc(hint)));
      if (raw.open?.[missionId] === true) result.open[missionId] = true;
      for (const level of ["support", "core", "stretch"] as const) {
        const id = `${lab}-${level}-${i}`;
        const check = raw.checks?.[id];
        if (!check || typeof check !== "object") continue;
        result.checks[id] = {
          draft:
            typeof check.draft === "string" ? check.draft.slice(0, 48) : "",
          checked: check.checked === true,
          revealed: check.revealed === true,
          tried: check.tried === true,
        };
      }
    }
  return result;
}
