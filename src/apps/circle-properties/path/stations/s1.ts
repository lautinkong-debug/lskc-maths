/**
 * Station 1: a line from the centre to a chord (16.1, 16.2, 16.3).
 * Proofs follow Book 5A pp. 16.2 and 16.4; the first worked example is its
 * Example 16.1.
 */
import {
  CENTRE as O,
  RADIUS,
  along,
  on,
  point,
  pts,
  tone,
  type El,
  type Figure,
  type Tones,
} from "../figureModel";
import { pick, rng, shuffle, whole } from "../random";
import type { NumberQuestion, Question, Script, Station } from "../types";
import { label, reasonOptions, sound, tidy, triples } from "./kit";

const A = on(215),
  B = on(325),
  N = { x: O.x, y: A.y };

const chordEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "triA", t: "tri", pts: [A, O, N] },
  { id: "triB", t: "tri", pts: [B, O, N] },
  { id: "AB", t: "seg", a: A, b: B },
  { id: "ON", t: "seg", a: O, b: N },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "sqN", t: "sq", a: O, v: N, b: B },
  { id: "tAN", t: "tick", a: A, b: N },
  { id: "tNB", t: "tick", a: N, b: B },
  { id: "tOA", t: "tick", a: O, b: A, n: 2 },
  { id: "tOB", t: "tick", a: O, b: B, n: 2 },
  ...point("O", O, 0, -21),
  ...point("A", A),
  ...point("B", B),
  ...point("N", N, 0, 20),
];
const frame = ["circle", "AB", "ON", ...pts("O", "A", "B", "N")];
const chordFigure = (tones: Tones, alt: string, extra: El[] = []): Figure => ({
  els: [...chordEls, ...extra],
  tones: { ...tone(frame, "base"), ...tones },
  alt,
});
const text = (id: string, x: number, y: number, value: string): El => ({
  id,
  t: "txt",
  p: { x, y },
  text: value,
  size: 18,
});

/* ---------- Proofs ---------- */

const proof161: Script = {
  kind: "proof",
  title: "Why is 16.1 always true?",
  reasonId: "r1",
  know: "O is the centre. ON ⊥ AB.",
  want: "AN = BN",
  figure: chordFigure(
    tone(["sqN", "ON"], "given"),
    "Circle with centre O. ON meets chord AB at a right angle at N.",
  ),
  steps: [
    {
      say: "Join O to A and to B. Now we have two triangles.",
      line: "Join OA and OB.",
      show: { ...tone(["OA", "OB"], "aux"), ...tone(["triA", "triB"], "base") },
      focus: ["OA", "OB"],
    },
    {
      say: "The question tells us that ON meets AB at 90°.",
      line: "∠ONA = ∠ONB = 90° (___)",
      blank: {
        options: ["given", "radii", "common side"],
        answer: 0,
        why: [
          undefined,
          "Radii are lines from the centre to the circle. This line is about an angle.",
          "A common side is a side. This line is about an angle.",
        ],
      },
      focus: ["sqN"],
      tool: "given",
    },
    {
      say: "OA and OB both run from the centre to the circle.",
      line: "OA = OB (___)",
      blank: {
        options: ["given", "radii", "common side"],
        answer: 1,
        why: [
          "The question did not say OA = OB. Look where both lines start and end.",
          undefined,
          "OA and OB are two different sides.",
        ],
      },
      show: tone(["tOA", "tOB"], "base"),
      focus: ["OA", "OB"],
      tool: "radii",
    },
    {
      say: "ON is a side of both triangles.",
      line: "ON = ON (___)",
      blank: {
        options: ["radii", "given", "common side"],
        answer: 2,
        why: [
          "N is not on the circle, so ON is not a radius.",
          "Look: the same side is in both triangles.",
          undefined,
        ],
      },
      focus: ["ON"],
      tool: "common",
    },
    {
      say: "A right angle, the longest sides and one more side match. Which test is that?",
      line: "△AON ≅ △BON (___)",
      blank: {
        options: ["SSS", "RHS", "SAS"],
        answer: 1,
        why: [
          "We have only two pairs of equal sides. We also have a right angle.",
          undefined,
          "The right angle is not between the two equal sides.",
        ],
      },
      focus: ["triA", "triB"],
      tool: "rhs",
    },
    {
      say: "Matching sides of congruent triangles are equal. So N cuts AB into two equal halves.",
      line: "∴ AN = BN (___)",
      blank: {
        options: ["corr. ∠s, ≅ △s", "given", "corr. sides, ≅ △s"],
        answer: 2,
        why: [
          "AN and BN are sides, not angles.",
          "It was not given. We have just proved it.",
          undefined,
        ],
      },
      show: tone(["tAN", "tNB"], "get"),
      focus: ["tAN", "tNB"],
      tool: "corrSides",
    },
  ],
  moral:
    "Two radii and a shared side make two matching right-angled triangles. So the two halves of the chord are equal, in every circle.",
};

const proof162: Script = {
  kind: "proof",
  title: "Why is 16.2 always true?",
  reasonId: "r2",
  know: "O is the centre. AN = BN.",
  want: "ON ⊥ AB",
  figure: chordFigure(
    tone(["tAN", "tNB"], "given"),
    "Circle with centre O. N is the mid-point of chord AB.",
  ),
  steps: [
    {
      say: "Same picture, different start. Join O to A and to B again.",
      line: "Join OA and OB.",
      show: { ...tone(["OA", "OB"], "aux"), ...tone(["triA", "triB"], "base") },
      focus: ["OA", "OB"],
    },
    {
      say: "This time the question tells us that N is the mid-point.",
      line: "AN = BN (___)",
      blank: {
        options: ["radii", "given", "common side"],
        answer: 1,
        why: [
          "A and N are not both on the circle and at the centre. Read the blue marks.",
          undefined,
          "AN and BN are two different sides.",
        ],
      },
      focus: ["tAN", "tNB"],
      tool: "given",
    },
    {
      say: "OA and OB are both radii, and ON is in both triangles.",
      line: "OA = OB (radii), ON = ON (common side)",
      show: tone(["tOA", "tOB"], "base"),
      focus: ["OA", "OB", "ON"],
    },
    {
      say: "Three pairs of equal sides. Which test is that?",
      line: "△AON ≅ △BON (___)",
      blank: {
        options: ["RHS", "SAS", "SSS"],
        answer: 2,
        why: [
          "No right angle is given this time. The right angle is what we want.",
          "We have no equal angles yet.",
          undefined,
        ],
      },
      focus: ["triA", "triB"],
      tool: "sss",
    },
    {
      say: "Matching angles of congruent triangles are equal.",
      line: "∠ONA = ∠ONB (___)",
      blank: {
        options: ["corr. ∠s, ≅ △s", "corr. sides, ≅ △s", "given"],
        answer: 0,
        why: [
          undefined,
          "These are angles, not sides.",
          "It was not given. It follows from the congruent triangles.",
        ],
      },
      tool: "corrAngles",
    },
    {
      say: "The two angles sit side by side on the straight line AB. So they add up to 180°. Two equal angles that make 180° are 90° each.",
      line: "∠ONA + ∠ONB = 180° (adj. ∠s on st. line), so ∠ONA = ___",
      blank: {
        options: ["45°", "90°", "180°"],
        answer: 1,
        why: [
          "Two of them must make 180°.",
          undefined,
          "That is both angles together.",
        ],
      },
      show: tone(["sqN"], "get"),
      focus: ["sqN"],
      tool: "adj",
    },
  ],
  moral:
    "This time the equal halves are given and the right angle is what we get. 16.2 is 16.1 backwards.",
};

const bisTop = along(O, N, -0.75),
  bisBottom = along(O, N, 1.55);
const bisectorEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "AB", t: "seg", a: A, b: B },
  { id: "ell", t: "seg", a: bisTop, b: bisBottom },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "sqN", t: "sq", a: O, v: N, b: B },
  { id: "tAN", t: "tick", a: A, b: N },
  { id: "tNB", t: "tick", a: N, b: B },
  { id: "tOA", t: "tick", a: O, b: A, n: 2 },
  { id: "tOB", t: "tick", a: O, b: B, n: 2 },
  ...point("O", O, 16, -6),
  ...point("A", A),
  ...point("B", B),
  ...point("N", N, 14, 22),
  { id: "nm-ell", t: "txt", p: bisTop, text: "ℓ", dx: 14, dy: 12 },
];
const bisectorFigure = (tones: Tones, alt: string): Figure => ({
  els: bisectorEls,
  tones: {
    ...tone(["circle", "AB", ...pts("A", "B", "N")], "base"),
    ...tone(["ell", "nm-ell", "sqN", "tAN", "tNB"], "given"),
    ...tones,
  },
  alt,
});

const proof163: Script = {
  kind: "proof",
  title: "Why is 16.3 always true?",
  reasonId: "r3",
  know: "Line ℓ is the perpendicular bisector of chord AB.",
  want: "ℓ passes through the centre O.",
  figure: bisectorFigure(
    {},
    "Chord AB of a circle with its perpendicular bisector ℓ.",
  ),
  steps: [
    {
      say: "Think about the centre O, wherever it is. Join it to A and to B.",
      line: "Join OA and OB.",
      show: { ...tone(pts("O"), "base"), ...tone(["OA", "OB"], "aux") },
      focus: ["OA", "OB"],
    },
    {
      say: "Both lines run from the centre to the circle.",
      line: "OA = OB (___)",
      blank: {
        options: ["radii", "given", "common side"],
        answer: 0,
        why: [
          undefined,
          "The question only tells us about line ℓ.",
          "They are two different lines.",
        ],
      },
      show: tone(["tOA", "tOB"], "base"),
      focus: ["OA", "OB"],
      tool: "radii",
    },
    {
      say: "So O is equally far from A and from B. Every point like that lies on one special line.",
      line: "O is equally far from A and B, so O lies on ___.",
      blank: {
        options: ["the chord AB", "the ⊥ bisector of AB", "the circle"],
        answer: 1,
        why: [
          "If O were on AB, then AB would be a diameter. Most chords are not.",
          undefined,
          "The centre is inside the circle, not on it.",
        ],
      },
      focus: ["ell"],
      tool: "bisector",
    },
    {
      say: "That special line is ℓ. So ℓ must pass through the centre.",
      line: "∴ The ⊥ bisector of chord AB passes through O.",
      show: tone(pts("O"), "get"),
      focus: ["pt-O"],
    },
  ],
  moral:
    "The centre is equally far from both ends of every chord. So it sits on the perpendicular bisector of every chord.",
};

/* ---------- Worked examples ---------- */

const r123 = [label("r1"), label("r2"), label("r3")];

const workedHalf: Script = {
  kind: "worked",
  title: "Example 1: one step",
  reasonId: "r1",
  know: "O is the centre. ON ⊥ AB and AB = 16 cm.",
  want: "AN",
  figure: chordFigure(
    tone(["sqN", "ON", "lenAB"], "given"),
    "ON is perpendicular to chord AB. AB is 16 cm.",
    [text("lenAB", 262, 284, "16 cm")],
  ),
  steps: [
    {
      say: "First read what is given. Copy the fact you will use.",
      line: "∵ ON ⊥ AB (given)",
      focus: ["sqN"],
    },
    {
      say: "A line from the centre, perpendicular to the chord. What do we get, and which reason says so?",
      line: "∴ AN = NB (___)",
      blank: {
        options: r123,
        answer: 0,
        why: [
          undefined,
          "That reason needs the mid-point to be given. Here the right angle is given.",
          "That reason finds the centre. Here we already have a line from the centre.",
        ],
      },
      show: tone(["tAN", "tNB"], "get"),
      focus: ["tAN", "tNB"],
    },
    {
      say: "So AN is half of AB.",
      line: "AN = 16 ÷ 2 = ___ cm",
      blank: {
        options: ["16", "32", "8"],
        answer: 2,
        why: ["16 cm is the whole chord.", "Half, not double.", undefined],
      },
    },
  ],
  moral:
    "Write ∵ with what is given. Then write ∴ with what you get, and put the reason in brackets.",
};

const workedPythagoras: Script = {
  kind: "worked",
  title: "Example 2: two steps",
  reasonId: "r1",
  know: "O is the centre. The radius is 10 cm. ON ⊥ AB and AB = 16 cm.",
  want: "ON, the distance from O to AB",
  figure: chordFigure(
    tone(["sqN", "ON", "lenAB", "lenOA", "OA"], "given"),
    "Radius OA is 10 cm. ON is perpendicular to chord AB, which is 16 cm.",
    [
      text("lenAB", 262, 284, "16 cm"),
      text("lenOA", 122, 208, "10 cm"),
      text("lenON", 214, 226, "x"),
      text("lenAN", 146, 247, "8 cm"),
    ],
  ),
  steps: [
    {
      say: "Start the same way: the right angle is given, so the chord is cut in half.",
      line: "∵ ON ⊥ AB (given) ∴ AN = NB (line from centre ⊥ chord bisects chord)",
      show: tone(["tAN", "tNB"], "get"),
      focus: ["sqN"],
    },
    {
      say: "How long is AN?",
      line: "AN = ___ cm",
      blank: {
        options: ["16", "8", "10"],
        answer: 1,
        why: [
          "16 cm is the whole chord AB. AN is half of it.",
          undefined,
          "10 cm is the radius OA.",
        ],
      },
      show: tone(["lenAN"], "get"),
      focus: ["tAN"],
    },
    {
      say: "Now look at the right-angled triangle ONA. Which side is its longest side?",
      line: "In △ONA, the hypotenuse is ___.",
      blank: {
        options: ["AN = 8 cm", "ON", "OA = 10 cm"],
        answer: 2,
        why: [
          "The longest side is opposite the right angle.",
          "The longest side is opposite the right angle at N.",
          undefined,
        ],
      },
      show: { ...tone(["triA"], "given"), ...tone(["lenON"], "base") },
      focus: ["OA"],
    },
    {
      say: "Use Pythagoras. The hypotenuse is 10, so subtract.",
      line: "ON = √(10² − 8²) = ___ cm (Pyth. theorem)",
      blank: {
        options: ["6", "12.8", "2"],
        answer: 0,
        why: [
          undefined,
          "That adds the squares. The hypotenuse is already 10, so 100 − 64.",
          "Square first: 100 − 64 = 36. Then take the square root.",
        ],
      },
      focus: ["ON"],
      tool: "pyth",
    },
  ],
  moral:
    "Half the chord, the distance and the radius make a right-angled triangle. Always use half the chord, never the whole chord.",
};

/* ---------- Mei's plate: 16.3 at work ---------- */

const pA = on(150),
  pB = on(98),
  pC = on(42),
  pM = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 },
  pN = { x: (pB.x + pC.x) / 2, y: (pB.y + pC.y) / 2 };
const jag = [
  on(164),
  { x: 128, y: 172 },
  { x: 170, y: 142 },
  { x: 226, y: 168 },
  { x: 276, y: 140 },
  on(16),
];
const plateEls: El[] = [
  { id: "whole", t: "circle" },
  { id: "rim", t: "arc", from: 16, to: 164 },
  ...jag
    .slice(1)
    .map((p, i): El => ({ id: `jag${i}`, t: "seg", a: jag[i], b: p })),
  { id: "cAB", t: "seg", a: pA, b: pB },
  { id: "cBC", t: "seg", a: pB, b: pC },
  { id: "l1", t: "seg", a: along(O, pM, 1.22), b: along(O, pM, -0.45) },
  { id: "l2", t: "seg", a: along(O, pN, 1.22), b: along(O, pN, -0.45) },
  { id: "sq1", t: "sq", a: O, v: pM, b: pB },
  { id: "sq2", t: "sq", a: O, v: pN, b: pC },
  { id: "t1a", t: "tick", a: pA, b: pM },
  { id: "t1b", t: "tick", a: pM, b: pB },
  { id: "t2a", t: "tick", a: pB, b: pN, n: 2 },
  { id: "t2b", t: "tick", a: pN, b: pC, n: 2 },
  ...point("A", pA),
  ...point("B", pB),
  ...point("C", pC),
  ...point("O", O, 16, 18),
];
const plateBase = ["rim", "jag0", "jag1", "jag2", "jag3", "jag4"];
const plateFigure = (tones: Tones = {}): Figure => ({
  els: plateEls,
  tones: { ...tone(plateBase, "base"), ...tones },
  alt: "A broken piece of a round plate: part of the edge, with the centre missing.",
});

const platePuzzle: Script = {
  kind: "worked",
  title: "Solve Mei's puzzle",
  reasonId: "r3",
  know: "A piece of the edge of a round plate.",
  want: "The centre of the plate",
  figure: plateFigure(),
  steps: [
    {
      say: "Mark three points A, B and C on the edge. Join AB and BC. Each one is a chord of the plate.",
      line: "Draw chords AB and BC.",
      show: tone(["cAB", "cBC", ...pts("A", "B", "C")], "base"),
      focus: ["cAB", "cBC"],
    },
    {
      say: "Find the mid-point of AB. Draw the line through it at 90° to AB.",
      line: "Draw the ⊥ bisector of AB.",
      show: tone(["l1", "sq1", "t1a", "t1b"], "given"),
      focus: ["l1"],
    },
    {
      say: "The centre is somewhere on this line. Which reason says so?",
      line: "The centre lies on this line (___)",
      blank: {
        options: [label("r1"), label("r3"), label("r2")],
        answer: 1,
        why: [
          "That reason starts with a line from the centre. We do not know where the centre is yet.",
          undefined,
          "That reason starts with a line from the centre. We do not know where the centre is yet.",
        ],
      },
      focus: ["l1"],
    },
    {
      say: "One line is not enough: the centre could be anywhere on it. Do the same for chord BC.",
      line: "Draw the ⊥ bisector of BC.",
      show: tone(["l2", "sq2", "t2a", "t2b"], "given"),
      focus: ["l2"],
    },
    {
      say: "The centre is on both lines. So it must be…",
      line: "The centre O is ___.",
      blank: {
        options: ["at B", "the mid-point of AB", "where the two lines cross"],
        answer: 2,
        why: [
          "B is on the edge of the plate.",
          "That point is on only one of the lines.",
          undefined,
        ],
      },
      show: tone(pts("O"), "get"),
      focus: ["pt-O"],
    },
    {
      say: "Now Mei can draw the whole plate and measure its radius.",
      line: "Draw the circle with centre O through A.",
      show: tone(["whole"], "aux"),
      focus: ["whole"],
    },
  ],
  moral:
    "Two chords and their perpendicular bisectors find the centre of any circle, even a broken one. That is reason 16.3 at work.",
};

/* ---------- Numbers ---------- */

const cm = (value: number) => `${tidy(value)} cm`;

/** Radius, half chord and distance: find any one from the other two. */
function rawChordTriangle(seed: number): NumberQuestion {
  const r = rng(seed);
  const [half, d, radius] = pick(r, triples);
  const kind = pick(r, ["distance", "radius", "chord"] as const);
  const chord = 2 * half;
  const extra: El[] = [
    text("lenAB", 262, 284, kind === "chord" ? "x cm" : cm(chord)),
    text("lenOA", 118, 208, kind === "radius" ? "x cm" : cm(radius)),
    text("lenON", 226, 226, kind === "distance" ? "x cm" : cm(d)),
  ];
  const figure = chordFigure(
    {
      ...tone(["sqN", "ON", "OA"], "given"),
      ...tone(["lenAB", "lenOA", "lenON"], "base"),
    },
    "A chord AB, the perpendicular ON from the centre and the radius OA.",
    extra,
  );
  const first = [
    "∵ ON ⊥ AB (given)",
    `∴ AN = NB (line from centre ⊥ chord bisects chord)`,
  ];
  if (kind === "distance")
    return {
      given: `O is the centre. The radius is ${cm(radius)}. ON ⊥ AB and AB = ${cm(chord)}.`,
      prompt: "ON = x cm. Find x.",
      figure,
      answer: d,
      unit: "cm",
      hints: [
        "What is given? A line from the centre, perpendicular to the chord.",
        `So AN is half of AB: ${cm(half)}.`,
        `In △ONA: x² + ${half}² = ${radius}².`,
      ],
      solution: [
        ...first,
        `AN = ${chord} ÷ 2 = ${cm(half)}`,
        `x = √(${radius}² − ${half}²) = ${tidy(d)} (Pyth. theorem)`,
      ],
      slips: [
        {
          value: Math.sqrt(radius ** 2 + half ** 2),
          why: "You added the squares. The radius is the longest side, so subtract.",
        },
        {
          value: Math.sqrt(Math.abs(chord ** 2 - radius ** 2)),
          why: "You used the whole chord. Use half of it in the triangle.",
        },
        {
          value: half,
          why: "That is AN. Now use Pythagoras in △ONA to find ON.",
        },
      ],
    };
  if (kind === "radius")
    return {
      given: `O is the centre. ON ⊥ AB, AB = ${cm(chord)} and ON = ${cm(d)}.`,
      prompt: "The radius is x cm. Find x.",
      figure,
      answer: radius,
      unit: "cm",
      hints: [
        "What is given? A line from the centre, perpendicular to the chord.",
        `So AN is half of AB: ${cm(half)}.`,
        `In △ONA: x² = ${d}² + ${half}².`,
      ],
      solution: [
        ...first,
        `AN = ${chord} ÷ 2 = ${cm(half)}`,
        `x = √(${d}² + ${half}²) = ${tidy(radius)} (Pyth. theorem)`,
      ],
      slips: [
        {
          value: Math.sqrt(d ** 2 + chord ** 2),
          why: "You used the whole chord. Use half of it in the triangle.",
        },
      ],
    };
  return {
    given: `O is the centre. The radius is ${cm(radius)}. ON ⊥ AB and ON = ${cm(d)}.`,
    prompt: "AB = x cm. Find x.",
    figure,
    answer: chord,
    unit: "cm",
    hints: [
      `In △ONA: AN² + ${d}² = ${radius}².`,
      `AN = ${cm(half)}.`,
      "ON ⊥ AB, so AN = NB. AB is two of them.",
    ],
    solution: [
      `AN = √(${radius}² − ${d}²) = ${cm(half)} (Pyth. theorem)`,
      ...first,
      `x = 2 × ${half} = ${chord}`,
    ],
    slips: [
      { value: half, why: "That is AN, half of the chord. AB = 2 × AN." },
    ],
  };
}

/** 16.2, then the angle sum of a triangle. */
function rawMidpointAngle(seed: number): NumberQuestion {
  const a = whole(rng(seed), 20, 62);
  return {
    given: `O is the centre. N is the mid-point of chord AB. ∠OAN = ${a}°.`,
    prompt: "∠AON = x°. Find x.",
    figure: chordFigure(
      {
        ...tone(["tAN", "tNB", "OA", "angA", "angO"], "given"),
        ...tone(["angO"], "base"),
      },
      "N is the mid-point of chord AB. Angle OAN is marked.",
      [
        {
          id: "angA",
          t: "ang",
          a: O,
          v: A,
          b: N,
          label: `${a}°`,
          r: 30,
          lr: 50,
        },
        { id: "angO", t: "ang", a: A, v: O, b: N, label: "x°", r: 24, lr: 42 },
      ],
    ),
    answer: 90 - a,
    unit: "°",
    hints: [
      "What is given? The mid-point. So which angle is 90°?",
      "∠ONA = 90° (line from centre to mid-pt. of chord ⊥ chord).",
      `The angles of △AON add up to 180°: x + 90 + ${a} = 180.`,
    ],
    solution: [
      "∵ AN = NB (given)",
      "∴ ON ⊥ AB (line from centre to mid-pt. of chord ⊥ chord)",
      `x = 180 − 90 − ${a} = ${90 - a} (∠ sum of △)`,
    ],
    slips: [
      {
        value: 180 - a,
        why: "You forgot the right angle at N. The mid-point gives ∠ONA = 90°.",
      },
      { value: a, why: "∠AON is at the centre. It is not the same as ∠OAN." },
    ],
  };
}

const tA = on(196.26),
  tB = on(343.74),
  tN = { x: O.x, y: tA.y },
  tTop = on(90);
/** The teacher's opening question: the height of a round tunnel above its floor. */
export function tunnel(): NumberQuestion {
  return {
    given:
      "A train tunnel is a circle with centre O and radius 2.5 m. Its floor AB is a chord 4.8 m wide. T is the top of the tunnel and TON is a straight line.",
    prompt: "The roof is x m above the middle of the floor (TN = x m). Find x.",
    figure: {
      els: [
        { id: "circle", t: "circle" },
        { id: "AB", t: "seg", a: tA, b: tB },
        { id: "TN", t: "seg", a: tTop, b: tN },
        { id: "OB", t: "seg", a: O, b: tB },
        { id: "sqN", t: "sq", a: O, v: tN, b: tB },
        ...point("O", O, -16, 4),
        ...point("A", tA),
        ...point("B", tB),
        ...point("N", tN, 0, 20),
        ...point("T", tTop),
        text("lenOB", 280, 190, "2.5 m"),
        text("lenAB", 270, 246, "4.8 m"),
        text("lenTN", 218, 120, "x m"),
      ],
      tones: {
        ...tone(
          [
            "circle",
            "AB",
            "TN",
            "sqN",
            ...pts("O", "A", "B", "N", "T"),
            "lenTN",
          ],
          "base",
        ),
        ...tone(["OB", "lenOB", "lenAB"], "given"),
      },
      alt: "A round tunnel with a flat floor AB near the bottom. The height TN passes through the centre O.",
    },
    answer: 3.2,
    unit: "m",
    hints: [
      "The height is TO + ON. TO is a radius.",
      "N is the mid-point of the floor, so AN = 2.4 m and ON ⊥ AB.",
      "In △ONB: ON² + 2.4² = 2.5².",
    ],
    solution: [
      "N is the mid-point of AB, so ON ⊥ AB (line from centre to mid-pt. of chord ⊥ chord)",
      "NB = 4.8 ÷ 2 = 2.4 m",
      "ON = √(2.5² − 2.4²) = 0.7 m (Pyth. theorem)",
      "x = 2.5 + 0.7 = 3.2",
    ],
    slips: [
      {
        value: 0.7,
        why: "That is ON, from the centre down to the floor. Add the radius TO above it.",
      },
      {
        value: 1.8,
        why: "The centre is above the floor. Add ON to the radius: do not subtract.",
      },
      {
        value: 5,
        why: "That is the diameter. The floor cuts off the bottom part.",
      },
    ],
  };
}

export const chordTriangle = (seed: number) => sound(rawChordTriangle(seed));
export const midpointAngle = (seed: number) => sound(rawMidpointAngle(seed));

/* ---------- The line that misses the centre ---------- */

const UNIT = (B.x - A.x) / 16;
function offCentre(offset: number): Figure {
  const P = { x: N.x + offset * UNIT, y: N.y };
  const reach = Math.sqrt(Math.max(0, RADIUS ** 2 - (P.x - O.x) ** 2));
  const top = { x: P.x, y: O.y - reach };
  const through = Math.abs(offset) < 0.01;
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "AB", t: "seg", a: A, b: B },
      { id: "line", t: "seg", a: top, b: { x: P.x, y: P.y + 26 } },
      { id: "sqP", t: "sq", a: top, v: P, b: B },
      ...point("O", O, -16, 4),
      ...point("A", A),
      ...point("B", B),
      ...point("P", P, 12, 22),
    ],
    tones: {
      ...tone(["circle", "AB", ...pts("A", "B", "P")], "base"),
      ...tone(["line", "sqP"], "given"),
      ...tone(pts("O"), through ? "get" : "base"),
    },
    alt: `A line perpendicular to chord AB at P. ${through ? "It passes through the centre O." : "It misses the centre O."}`,
  };
}

/* ---------- Check ---------- */

const directionItems = [
  {
    id: "r1",
    given: "O is the centre. ON ⊥ AB.",
    want: "AN = NB",
    figure: chordFigure(
      tone(["sqN", "ON"], "given"),
      "ON is perpendicular to chord AB.",
    ),
    why: "The right angle is given. Equal halves are what you get.",
  },
  {
    id: "r2",
    given: "O is the centre. N is the mid-point of chord AB.",
    want: "ON ⊥ AB",
    figure: chordFigure(
      tone(["tAN", "tNB"], "given"),
      "N is the mid-point of chord AB.",
    ),
    why: "The mid-point is given. The right angle is what you get.",
  },
  {
    id: "r3",
    given: "Line ℓ is the perpendicular bisector of chord AB.",
    want: "ℓ passes through the centre of the circle.",
    figure: bisectorFigure(
      {},
      "Line ℓ is the perpendicular bisector of chord AB.",
    ),
    why: "Perpendicular and mid-point are both given. The centre is what you get.",
  },
];

function check(seed: number): Question[] {
  const r = rng(seed);
  const [first, second] = shuffle(r, directionItems);
  const ids = ["r1", "r2", "r3"];
  const direction = (
    item: (typeof directionItems)[number],
    n: number,
  ): Question => ({
    id: `s1-direction-${n}`,
    kind: "choice",
    reasonIds: [item.id],
    skill: "direction",
    given: item.given,
    prompt: `You want to write: ${item.want} Which reason do you put in the brackets?`,
    figure: item.figure,
    options: reasonOptions(
      r,
      item.id,
      ids.filter((id) => id !== item.id),
      item.why,
    ),
  });
  const [half] = pick(r, triples);
  const askHalf = r() < 0.5;
  const triangle = chordTriangle(whole(r, 1, 1e6));
  return [
    direction(first, 1),
    direction(second, 2),
    {
      id: "s1-half",
      kind: "number",
      reasonIds: ["r1"],
      skill: "halfChord",
      given: askHalf
        ? `O is the centre. ON ⊥ AB and AB = ${2 * half} cm.`
        : `O is the centre. ON ⊥ AB and AN = ${half} cm.`,
      prompt: askHalf ? "AN = x cm. Find x." : "AB = x cm. Find x.",
      figure: chordFigure(
        tone(["sqN", "ON"], "given"),
        "ON is perpendicular to chord AB.",
      ),
      answer: askHalf ? half : 2 * half,
      unit: "cm",
      solution: [
        "∵ ON ⊥ AB (given)",
        "∴ AN = NB (line from centre ⊥ chord bisects chord)",
        askHalf
          ? `x = ${2 * half} ÷ 2 = ${half}`
          : `x = 2 × ${half} = ${2 * half}`,
      ],
    },
    {
      id: "s1-triangle",
      kind: "number",
      reasonIds: ["r1"],
      skill: "pythagoras",
      given: triangle.given,
      prompt: triangle.prompt,
      figure: triangle.figure,
      answer: triangle.answer,
      unit: triangle.unit,
      solution: triangle.solution,
      slips: triangle.slips,
    },
    {
      id: "s1-trap",
      kind: "choice",
      reasonIds: ["r1"],
      skill: "centreNeeded",
      given:
        "A line meets chord AB at P at 90°. The line does not pass through the centre O.",
      prompt: "Can you write AP = PB?",
      figure: offCentre(3),
      options: shuffle(r, [
        {
          text: "No. The perpendicular must come from the centre.",
          good: true,
          why: "Reason 16.1 starts with 'line from centre'. This line misses O.",
        },
        {
          text: "Yes, because the line is perpendicular to the chord.",
          why: "Perpendicular alone is not enough. Look at where O is.",
        },
        {
          text: "Yes, because P is on the chord.",
          why: "Every point of the chord is on the chord. Only one is the mid-point.",
        },
      ]),
    },
  ];
}

/* ---------- The station ---------- */

const given161 = chordFigure(
  { ...tone(["sqN", "ON"], "given"), ...tone(["tAN", "tNB"], "get") },
  "16.1: the right angle at N is given, and the equal halves follow.",
);
const given162 = chordFigure(
  { ...tone(["tAN", "tNB", "ON"], "given"), ...tone(["sqN"], "get") },
  "16.2: the mid-point N is given, and the right angle follows.",
);
const given163 = bisectorFigure(
  tone(pts("O"), "get"),
  "16.3: the perpendicular bisector is given, and the centre lies on it.",
);

export const s1: Station = {
  id: "bisector",
  n: 1,
  title: "A line from the centre to a chord",
  family: "fold",
  reasonIds: ["r1", "r2", "r3"],
  idea: "Two facts give the third.",
  pictures: { r1: given161, r2: given162, r3: given163 },
  steps: {
    wonder: [
      {
        id: "plate",
        kind: "story",
        title: "Mei's broken plate",
        text: [
          "Mei found a piece of an old round plate.",
          "She wants to know how big the whole plate was. For that she must find its centre.",
          "All she has is a piece of the edge.",
        ],
        figure: plateFigure(),
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt:
          "Can Mei find the exact centre with only a ruler and a set square?",
        figure: plateFigure(),
        options: [
          { text: "Yes. There must be a way.", why: "" },
          { text: "No. The centre is missing, so it is impossible.", why: "" },
          { text: "Only roughly, by guessing.", why: "" },
        ],
        after:
          "You will solve Mei's puzzle yourself at the end of this station.",
      },
    ],
    discover: [
      {
        id: "fold",
        kind: "hands",
        title: "Fold a paper circle",
        need: ["a paper circle", "a pencil", "a ruler"],
        todo: [
          "Mark two points A and B on the edge. Join them with the ruler: AB is a chord.",
          "Fold the circle so that point A lands exactly on point B. Press the fold flat.",
          "Open the circle. Draw along the fold line.",
          "Measure the two parts of AB on each side of the fold.",
        ],
        look: "What do you notice about the two parts? And about the angle between the fold and AB?",
      },
      {
        id: "right-angle",
        kind: "explore",
        reasonId: "r1",
        title: "Start with a right angle",
        todo: "The blue marks are given: ON comes from the centre and meets AB at 90°. Drag A, B or N.",
        watch: "Watch the lengths AN and NB under the circle.",
        options: [
          {
            text: "AN is always longer than NB.",
            why: "Read the two numbers again after each drag.",
          },
          {
            text: "AN and NB are always equal.",
            good: true,
            why: "The line from the centre at 90° always cuts the chord in half.",
          },
          {
            text: "They are equal only when AB is level.",
            why: "Drag B to tilt the chord. Then read the numbers again.",
          },
        ],
        after:
          "A line from the centre that meets a chord at 90° cuts it into two equal halves. This will be reason 16.1.",
      },
      {
        id: "mid-point",
        kind: "explore",
        reasonId: "r2",
        title: "Start with the mid-point",
        todo: "Now the blue ticks are given: N is the mid-point of AB. Drag A, B or N.",
        watch: "Watch the angle ∠ONB under the circle.",
        options: [
          {
            text: "The angle is always 90°.",
            good: true,
            why: "Joining the centre to the mid-point always makes a right angle.",
          },
          {
            text: "The angle changes when the chord tilts.",
            why: "Tilt the chord and read the angle again.",
          },
          {
            text: "The angle is always 45°.",
            why: "Read the number under the circle.",
          },
        ],
        after:
          "Join the centre to the mid-point of a chord and you always get 90°. This will be reason 16.2. It is 16.1 backwards.",
      },
      {
        id: "off-centre",
        kind: "slide",
        title: "Does the centre matter?",
        todo: "The blue line is perpendicular to AB, but it can miss the centre. Slide it left and right.",
        label: "Move the line",
        min: -6,
        max: 6,
        start: 3.5,
        step: 0.5,
        figure: offCentre,
        readout: (value) => [
          { label: "AP", value: `${tidy(8 + value)} cm` },
          { label: "PB", value: `${tidy(8 - value)} cm` },
        ],
        options: [
          {
            text: "AP and PB are always equal.",
            why: "Slide the line to one side and read the numbers.",
          },
          {
            text: "AP and PB are never equal.",
            why: "Slide the line until it passes through O.",
          },
          {
            text: "AP = PB only when the line passes through O.",
            good: true,
            why: "Perpendicular is not enough. The line must come from the centre.",
          },
        ],
        after:
          "That is why the reason starts with the words 'line from centre'. If the line misses the centre, you cannot use it.",
      },
    ],
    prove: [
      { id: "p161", kind: "script", script: proof161 },
      { id: "p162", kind: "script", script: proof162 },
      { id: "p163", kind: "script", script: proof163 },
    ],
    remember: [
      {
        id: "three-facts",
        kind: "card",
        title: "Three facts. Any two give the third.",
        reasonIds: ["r1", "r2", "r3"],
        body: [
          "A line and a chord can have three facts: the line comes from the centre, it is perpendicular to the chord, and it bisects the chord.",
          "Each reason says the two facts you have (blue), then the fact you get (green).",
        ],
      },
      {
        id: "build-161",
        kind: "tiles",
        reasonId: "r1",
        prompt:
          "Build the reason for this picture. Say what you have first (blue), then what you get (green).",
        figure: given161,
        tiles: ["line from centre", "⊥ chord", "bisects chord"],
        extras: ["to mid-pt. of chord", "passes through centre"],
        hint: "Blue first: a line from the centre, ⊥ to the chord. Green last: it bisects the chord.",
      },
      {
        id: "build-162",
        kind: "tiles",
        reasonId: "r2",
        prompt: "Now the mid-point is given. Build the reason.",
        figure: given162,
        tiles: ["line from centre", "to mid-pt. of chord", "⊥ chord"],
        extras: ["bisects chord", "passes through centre"],
        hint: "Blue first: a line from the centre to the mid-point of the chord. Green last: it is ⊥ to the chord.",
      },
      {
        id: "build-163",
        kind: "tiles",
        reasonId: "r3",
        prompt: "Perpendicular and mid-point are both given. Build the reason.",
        figure: given163,
        tiles: ["⊥ bisector of chord", "passes through centre"],
        extras: ["line from centre", "bisects chord"],
        hint: "Blue first: the ⊥ bisector of the chord. Green last: it passes through the centre.",
      },
      {
        id: "which-162",
        kind: "choice",
        prompt:
          "A question says: 'N is the mid-point of chord AB.' You want a right angle at N. Which reason?",
        figure: chordFigure(
          tone(["tAN", "tNB"], "given"),
          "N is the mid-point of chord AB.",
        ),
        options: [
          {
            text: label("r1"),
            why: "That one starts with ⊥. Here the right angle is what you want, not what you have.",
          },
          {
            text: label("r2"),
            good: true,
            why: "You have the mid-point. You get ⊥.",
          },
          {
            text: label("r3"),
            why: "That one finds the centre. Here the centre is already given.",
          },
        ],
      },
      {
        id: "pen",
        kind: "story",
        title: "Pen and paper",
        text: [
          "Close your eyes and say the three reasons.",
          "Now write them in your exercise book without looking.",
          "Check them against the card, then tap Next.",
        ],
      },
    ],
    use: [
      { id: "w1", kind: "script", script: workedHalf },
      { id: "w2", kind: "script", script: workedPythagoras },
      { id: "n1", kind: "number", make: chordTriangle },
      { id: "n2", kind: "number", make: midpointAngle },
      { id: "plate", kind: "script", script: platePuzzle, recall: "guess" },
      { id: "tunnel", kind: "number", make: tunnel },
    ],
  },
  check,
  more: [
    "What happens to 16.1 when AB is a diameter? Open Explore, choose 'Perpendiculars and chord mid-points' and drag the chord through O.",
    "Draw a circle round a cup. Can you find its centre with a ruler and a set square, as Mei did?",
  ],
};
