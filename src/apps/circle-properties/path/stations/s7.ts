/**
 * Station 7: arcs in proportion to their angles (16.16, 16.17).
 * 16.16 is shown with equal slices; 16.17 follows Book 5A p. 16.38 by doubling
 * each angle at the circumference. The worked examples follow its Examples
 * 16.15(a) and 16.17.
 */
import {
  CENTRE as O,
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
import { asQuestion, fill, label, note, reasonOptions, sound } from "./kit";

/* ---------- 16.16: angles at the centre ---------- */

const A = on(170),
  B = on(140),
  C = on(70),
  D = on(20);
const slices = [160, 150, 60, 50, 40, 30];
const centreEls = (atAOB: string, atCOD: string): El[] => [
  { id: "circle", t: "circle" },
  { id: "arcAB", t: "arc", from: 140, to: 170 },
  { id: "arcCD", t: "arc", from: 20, to: 70 },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "OC", t: "seg", a: O, b: C },
  { id: "OD", t: "seg", a: O, b: D },
  { id: "AB", t: "seg", a: A, b: B },
  { id: "CD", t: "seg", a: C, b: D },
  ...slices.map((at, i): El => ({
    id: `slice${i}`,
    t: "seg",
    a: O,
    b: on(at),
  })),
  { id: "angAOB", t: "ang", a: A, v: O, b: B, r: 40, label: atAOB, lr: 158 },
  { id: "angCOD", t: "ang", a: C, v: O, b: D, r: 40, label: atCOD, lr: 158 },
  ...point("O", O, 0, 22),
  ...point("A", A),
  ...point("B", B),
  ...point("C", C),
  ...point("D", D),
];
const centreFrame = [
  "circle",
  "OA",
  "OB",
  "OC",
  "OD",
  ...pts("O", "A", "B", "C", "D"),
];
const atCentre = (
  atAOB: string,
  atCOD: string,
  tones: Tones,
  alt: string,
  extra: El[] = [],
): Figure => ({
  els: [...centreEls(atAOB, atCOD), ...extra],
  tones: { ...tone(centreFrame, "base"), ...tones },
  alt,
});
const sliceIds = slices.map((_, i) => `slice${i}`);

const proof1616: Script = {
  kind: "proof",
  title: "Why is 16.16 true? Count the slices.",
  reasonId: "r16",
  know: "∠AOB = 30° and ∠COD = 50° at the centre.",
  want: "\\frac{arc AB}{arc CD} = \\frac{∠AOB}{∠COD}",
  figure: atCentre(
    "30°",
    "50°",
    {
      ...tone(["angAOB", "angCOD"], "given"),
      ...tone(["arcAB", "arcCD"], "base"),
    },
    "Sector AOB has an angle of 30 degrees and sector COD an angle of 50 degrees.",
  ),
  steps: [
    {
      say: "Cut both sectors into thin slices of 10° each.",
      line: "∠AOB = 3 slices and ∠COD = ___ slices.",
      blank: fill("5", ["3", "50"], {
        "3": "50° is five lots of 10°.",
        "50": "Each slice is 10°, so count in tens.",
      }),
      show: tone(sliceIds, "aux"),
      focus: sliceIds,
    },
    {
      say: "Every slice has the same angle at the centre. So every slice cuts off the same length of arc.",
      line: "Each slice has an equal arc (___)",
      blank: fill(label("r10"), [label("r11"), label("r12")], {
        [label("r11")]:
          "We start from the equal angles of the slices, and get equal arcs.",
        [label("r12")]: "We want equal arcs, not equal chords.",
      }),
      focus: ["arcAB", "arcCD"],
    },
    {
      say: "So arc AB is made of 3 small equal arcs. Count the small arcs in arc CD.",
      line: "arc AB is 3 small arcs and arc CD is ___ small arcs.",
      blank: fill("5", ["3", "8"], {
        "3": "Count the slices in sector COD.",
        "8": "Count only the slices in sector COD.",
      }),
      show: tone(["arcAB", "arcCD"], "get"),
      focus: ["arcCD"],
    },
    {
      say: "Three small arcs to five small arcs: the same ratio as the angles.",
      line: "∴ \\frac{arc AB}{arc CD} = \\frac{3}{5} = \\frac{30°}{50°}",
    },
  ],
  moral:
    "Equal angles cut equal arcs. So a bigger angle cuts a longer arc, in the same ratio. Arcs are proportional to the angles at the centre.",
};

/* ---------- 16.17: angles at the circumference ---------- */

const eA = on(210),
  eB = on(250),
  eC = on(280),
  eD = on(360),
  eP = on(70),
  eQ = on(125);
const edgeEls = (atP: string, atQ: string): El[] => [
  { id: "circle", t: "circle" },
  { id: "arcAB", t: "arc", from: 210, to: 250 },
  { id: "arcCD", t: "arc", from: 280, to: 360 },
  { id: "PA", t: "seg", a: eP, b: eA },
  { id: "PB", t: "seg", a: eP, b: eB },
  { id: "QC", t: "seg", a: eQ, b: eC },
  { id: "QD", t: "seg", a: eQ, b: eD },
  { id: "OA", t: "seg", a: O, b: eA },
  { id: "OB", t: "seg", a: O, b: eB },
  { id: "OC", t: "seg", a: O, b: eC },
  { id: "OD", t: "seg", a: O, b: eD },
  { id: "angP", t: "ang", a: eA, v: eP, b: eB, r: 44, label: atP, lr: 62 },
  { id: "angQ", t: "ang", a: eC, v: eQ, b: eD, r: 36, label: atQ, lr: 56 },
  { id: "angAOB", t: "ang", a: eA, v: O, b: eB, r: 30, label: "2θ", lr: 52 },
  { id: "angCOD", t: "ang", a: eC, v: O, b: eD, r: 26, label: "2φ", lr: 48 },
  ...point("O", O, -18, -8),
  ...point("A", eA),
  ...point("B", eB),
  ...point("C", eC),
  ...point("D", eD),
  ...point("P", eP),
  ...point("Q", eQ),
];
const edgeFrame = [
  "circle",
  "PA",
  "PB",
  "QC",
  "QD",
  ...pts("A", "B", "C", "D", "P", "Q"),
];
const atEdge = (
  atP: string,
  atQ: string,
  tones: Tones,
  alt: string,
): Figure => ({
  els: edgeEls(atP, atQ),
  tones: { ...tone(edgeFrame, "base"), ...tones },
  alt,
});

const proof1617: Script = {
  kind: "proof",
  title: "Why is 16.17 always true?",
  reasonId: "r17",
  know: "∠APB = θ and ∠CQD = φ at the circumference.",
  want: "\\frac{arc AB}{arc CD} = \\frac{θ}{φ}",
  figure: atEdge(
    "θ",
    "φ",
    { ...tone(["angP", "angQ"], "given"), ...tone(["arcAB", "arcCD"], "base") },
    "Angle APB stands on arc AB and angle CQD stands on arc CD.",
  ),
  steps: [
    {
      say: "Join the ends of each arc to the centre. Each angle at the centre is double its angle at the circumference.",
      line: "∠AOB = 2θ and ∠COD = 2φ (___)",
      blank: fill(label("r6"), [label("r7"), label("r16")], {
        [label("r7")]:
          "That compares two angles on the circle. Here one is at the centre.",
        [label("r16")]:
          "That compares two arcs. This line compares an angle at the centre with one at the circumference.",
      }),
      show: {
        ...tone(["OA", "OB", "OC", "OD"], "aux"),
        ...tone(["angAOB", "angCOD", ...pts("O")], "base"),
      },
      focus: ["angAOB", "angCOD"],
    },
    {
      say: "Now the angles are at the centre. Use the reason you have just proved.",
      line: "\\frac{arc AB}{arc CD} = \\frac{2θ}{2φ} (___)",
      blank: fill(label("r16"), [label("r17"), label("r10")], {
        [label("r17")]:
          "That is the reason we are proving now. Use the one about angles at the centre.",
        [label("r10")]: "The angles are not equal. We need a ratio.",
      }),
      show: tone(["arcAB", "arcCD"], "get"),
      focus: ["arcAB", "arcCD"],
    },
    {
      say: "Top and bottom are both doubled, so the 2s cancel.",
      line: "\\frac{2θ}{2φ} = ___",
      blank: fill("\\frac{θ}{φ}", ["\\frac{φ}{θ}", "\\frac{2}{2}"], {
        "\\frac{φ}{θ}": "Keep θ on top: it goes with arc AB.",
        "\\frac{2}{2}": "Cancel the 2s. θ and φ stay.",
      }),
      focus: ["angP", "angQ"],
    },
  ],
  moral:
    "Double both angles and their ratio does not change. So arcs are also proportional to the angles at the circumference.",
};

/* ---------- Worked examples ---------- */

const wA = on(180),
  wB = on(105),
  wC = on(0);
const straight = (
  atAOB: string,
  atBOC: string,
  arcAB: string,
  arcBC: string,
  tones: Tones = {},
): Figure => ({
  els: [
    { id: "circle", t: "circle" },
    { id: "arcAB", t: "arc", from: 105, to: 180 },
    { id: "arcBC", t: "arc", from: 0, to: 105 },
    { id: "AC", t: "seg", a: wA, b: wC },
    { id: "OB", t: "seg", a: O, b: wB },
    { id: "angAOB", t: "ang", a: wA, v: O, b: wB, r: 30, label: atAOB, lr: 54 },
    { id: "angBOC", t: "ang", a: wB, v: O, b: wC, r: 24, label: atBOC, lr: 50 },
    ...point("O", O, 0, 22),
    ...point("A", wA),
    ...point("B", wB),
    ...point("C", wC),
    note("lenAB", 82, 52, arcAB),
    note("lenBC", 318, 52, arcBC),
  ],
  tones: {
    ...tone(
      [
        "circle",
        "AC",
        "OB",
        "arcAB",
        "arcBC",
        "lenAB",
        "lenBC",
        ...pts("O", "A", "B", "C"),
      ],
      "base",
    ),
    ...tone(["angAOB", "angBOC"], "given"),
    ...tones,
  },
  alt: "AOC is a diameter. OB divides the top half into arc AB and arc BC.",
});

const workedCentre: Script = {
  kind: "worked",
  title: "Example 1: angles at the centre",
  reasonId: "r16",
  know: "O is the centre. ∠AOB = 75° and ∠BOC = 105°. Arc BC is 21 cm long.",
  want: "x, the length of arc AB in cm",
  figure: straight("75°", "105°", "x cm", "21 cm"),
  steps: [
    {
      say: "Both angles are at the centre O. So the arcs are in the same ratio as the angles.",
      line: "\\frac{x}{21} = \\frac{75°}{105°} (___)",
      blank: fill(label("r16"), [label("r17"), label("r10")], {
        [label("r17")]: "These angles have their corners at O, the centre.",
        [label("r10")]: "The angles are not equal. We need a ratio.",
      }),
      focus: ["angAOB", "angBOC"],
    },
    {
      say: "Multiply both sides by 21.",
      line: "x = \\frac{75}{105} × 21 = ___",
      blank: fill("15", ["29.4", "5"], {
        "29.4":
          "Arc AB has the smaller angle, so it is shorter than 21 cm. Put 75 on top.",
        "5": "75 ÷ 105 × 21: work it out again.",
      }),
      show: tone(["arcAB"], "get"),
    },
  ],
  moral:
    "Match each arc to its own angle. Then write arc over arc equals angle over angle.",
};

const tA = on(130),
  tB = on(210),
  tC = on(330);
const triangle = (atC: string, tones: Tones = {}): Figure => ({
  els: [
    { id: "circle", t: "circle" },
    { id: "arcAB", t: "arc", from: 130, to: 210 },
    { id: "arcBC", t: "arc", from: 210, to: 330 },
    { id: "arcCA", t: "arc", from: 330, to: 490 },
    { id: "AB", t: "seg", a: tA, b: tB },
    { id: "BC", t: "seg", a: tB, b: tC },
    { id: "CA", t: "seg", a: tC, b: tA },
    { id: "angC", t: "ang", a: tA, v: tC, b: tB, r: 40, label: atC, lr: 62 },
    { id: "angA", t: "ang", a: tB, v: tA, b: tC, r: 30 },
    { id: "angB", t: "ang", a: tC, v: tB, b: tA, r: 30 },
    ...point("A", tA),
    ...point("B", tB),
    ...point("C", tC),
  ],
  tones: {
    ...tone(
      ["circle", "AB", "BC", "CA", "angC", ...pts("A", "B", "C")],
      "base",
    ),
    ...tones,
  },
  alt: "Triangle ABC with all three corners on a circle.",
});

const workedK: Script = {
  kind: "worked",
  title: "Example 2: a ratio of arcs",
  reasonId: "r17",
  know: "A, B and C are on a circle. Arc AB, arc BC and arc CA are in the ratio 2 : 3 : 4.",
  want: "∠ACB",
  figure: triangle("?", tone(["arcAB", "arcBC", "arcCA"], "given")),
  steps: [
    {
      say: "The angle at C stands on arc AB. The angle at A stands on arc BC. The angle at B stands on arc CA. All three corners are on the circle.",
      line: "The angles at C, A and B are in the ratio 2 : 3 : 4 (___)",
      blank: fill(label("r17"), [label("r16"), label("r7")], {
        [label("r16")]: "These angles are on the circle, not at the centre.",
        [label("r7")]:
          "That gives equal angles. Here the angles are in a ratio.",
      }),
      show: tone(["angA", "angB"], "base"),
      focus: ["angC", "angA", "angB"],
    },
    {
      say: "Call the three angles 2k, 3k and 4k. They are the angles of triangle ABC.",
      line: "2k + 3k + 4k = ___ (∠ sum of △)",
      blank: fill("180°", ["360°", "90°"], {
        "360°":
          "360° is for angles round the centre. These are the three angles of a triangle.",
        "90°": "The three angles of a triangle make 180°.",
      }),
      tool: "sum",
    },
    {
      say: "Solve for k.",
      line: "9k = 180°, so k = ___",
      blank: fill("20°", ["40°", "9°"], {
        "40°": "180 ÷ 9.",
        "9°": "180 ÷ 9.",
      }),
    },
    {
      say: "The angle at C is the one that stands on arc AB, the part with 2.",
      line: "∠ACB = 2k = ___",
      blank: fill("40°", ["20°", "80°"], {
        "20°": "That is k. The angle is 2k.",
        "80°": "That is 4k, the angle at B.",
      }),
      show: tone(["angC"], "get"),
    },
  ],
  moral:
    "For a ratio of arcs, call the angles 2k, 3k, 4k. At the circumference of a triangle they add up to 180°.",
};

/* ---------- Numbers ---------- */

function rawArcFromAngles(seed: number): NumberQuestion {
  const r = rng(seed);
  const [p, q] = pick(r, [
    [2, 3],
    [3, 5],
    [2, 5],
    [3, 4],
    [4, 7],
    [1, 3],
  ] as const);
  const unit = pick(r, [10, 15, 20]),
    scale = whole(r, 2, 4);
  const big = r() < 0.5;
  const known = (big ? p : q) * scale,
    answer = (big ? q : p) * scale;
  return {
    given: `O is the centre. ∠AOB = ${p * unit}° and ∠COD = ${q * unit}°. Arc ${big ? "AB" : "CD"} is ${known} cm long.`,
    prompt: `Arc ${big ? "CD" : "AB"} is x cm long. Find x.`,
    figure: atCentre(
      `${p * unit}°`,
      `${q * unit}°`,
      {
        ...tone(["angAOB", "angCOD"], "given"),
        ...tone(["arcAB", "arcCD"], "base"),
      },
      "Two sectors AOB and COD with different angles at the centre.",
    ),
    answer,
    unit: "cm",
    hints: [
      "Both angles are at the centre. The arcs are in the same ratio as the angles.",
      `\\frac{arc AB}{arc CD} = \\frac{${p * unit}}{${q * unit}} = \\frac{${p}}{${q}}`,
      big ? `x = ${known} × ${q} ÷ ${p}.` : `x = ${known} × ${p} ÷ ${q}.`,
    ],
    solution: big
      ? [
          `\\frac{x}{${known}} = \\frac{${q * unit}°}{${p * unit}°} (arcs prop. to ∠s at centre)`,
          `x = \\frac{${q}}{${p}} × ${known} = ${answer}`,
        ]
      : [
          `\\frac{x}{${known}} = \\frac{${p * unit}°}{${q * unit}°} (arcs prop. to ∠s at centre)`,
          `x = \\frac{${p}}{${q}} × ${known} = ${answer}`,
        ],
    slips: [
      {
        value: big ? (known * p) / q : (known * q) / p,
        why: "The ratio is upside down. The bigger angle goes with the longer arc.",
      },
    ],
  };
}

function rawRatioToAngle(seed: number): NumberQuestion {
  const r = rng(seed);
  const [a, b, c] = pick(r, [
    [1, 2, 3],
    [2, 3, 4],
    [1, 1, 2],
    [2, 3, 5],
    [3, 4, 5],
    [1, 3, 5],
    [1, 2, 2],
  ] as const);
  const sum = a + b + c,
    k = 180 / sum;
  return {
    given: `A, B and C are on a circle. Arc AB, arc BC and arc CA are in the ratio ${a} : ${b} : ${c}.`,
    prompt: "∠ACB = x°. Find x.",
    figure: triangle("x°", tone(["arcAB", "arcBC", "arcCA"], "given")),
    answer: a * k,
    unit: "°",
    hints: [
      "∠ACB stands on arc AB. The three angles of the triangle are in the same ratio as the arcs they stand on.",
      `Call the angles ${a}k, ${b}k and ${c}k. They add up to 180°.`,
      `${sum}k = 180, so k = ${k}.`,
    ],
    solution: [
      `The angles at C, A and B are in the ratio ${a} : ${b} : ${c} (arcs prop. to ∠s at ⊙ce)`,
      `${a}k + ${b}k + ${c}k = 180° (∠ sum of △), so k = ${k}°`,
      `x = ${a} × ${k} = ${a * k}`,
    ],
    slips: [
      {
        value: (a * 360) / sum,
        why: "You used 360°. The three angles are on the circle and make a triangle: 180°.",
      },
      { value: k, why: `That is k. ∠ACB is ${a}k.` },
    ],
  };
}

export const arcFromAngles = (seed: number) => sound(rawArcFromAngles(seed));
export const ratioToAngle = (seed: number) => sound(rawRatioToAngle(seed));

/* ---------- Discover: chords do not keep the ratio ---------- */

function doubled(angle: number): Figure {
  const a = on(100 + angle),
    b = on(100),
    c = on(80),
    d = on(80 - 2 * angle);
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "arcAB", t: "arc", from: 100, to: 100 + angle },
      { id: "arcCD", t: "arc", from: 80 - 2 * angle, to: 80 },
      { id: "OA", t: "seg", a: O, b: a },
      { id: "OB", t: "seg", a: O, b: b },
      { id: "OC", t: "seg", a: O, b: c },
      { id: "OD", t: "seg", a: O, b: d },
      { id: "AB", t: "seg", a, b },
      { id: "CD", t: "seg", a: c, b: d },
      { id: "angAOB", t: "ang", a, v: O, b, r: 30, label: `${angle}°`, lr: 52 },
      {
        id: "angCOD",
        t: "ang",
        a: c,
        v: O,
        b: d,
        r: 30,
        label: `${2 * angle}°`,
        lr: 52,
      },
      ...point("O", O, -14, 20),
      ...point("A", a),
      ...point("B", b),
      ...point("C", c),
      ...point("D", d),
    ],
    tones: {
      ...tone(
        ["circle", "OA", "OB", "OC", "OD", ...pts("O", "A", "B", "C", "D")],
        "base",
      ),
      ...tone(["angAOB", "angCOD"], "given"),
      ...tone(["arcAB", "arcCD"], "get"),
      ...tone(["AB", "CD"], "aux"),
    },
    alt: `Sector AOB has an angle of ${angle} degrees and sector COD has twice that.`,
  };
}
const chordRatio = (angle: number) =>
  Math.sin((angle * Math.PI) / 180) / Math.sin((angle * Math.PI) / 360);

/* ---------- Check ---------- */

function check(seed: number): Question[] {
  const r = rng(seed);
  const centreFirst = r() < 0.5;
  const whichCentre: Question = {
    id: "s7-centre",
    kind: "choice",
    reasonIds: ["r16"],
    skill: "ratio",
    given: "∠AOB = 30° and ∠COD = 50°. O is the centre.",
    prompt:
      "You want to write: \\frac{arc AB}{arc CD} = \\frac{30}{50} Which reason do you put in the brackets?",
    figure: atCentre(
      "30°",
      "50°",
      tone(["angAOB", "angCOD"], "given"),
      "Two sectors with angles at the centre.",
    ),
    options: reasonOptions(
      r,
      "r16",
      ["r17", "r10"],
      "The two angles have their corners at the centre O.",
    ),
  };
  const whichEdge: Question = {
    id: "s7-edge",
    kind: "choice",
    reasonIds: ["r17"],
    skill: "ratio",
    given: "P and Q are on the circle. ∠APB = 20° and ∠CQD = 40°.",
    prompt:
      "You want to write: \\frac{arc AB}{arc CD} = \\frac{20}{40} Which reason do you put in the brackets?",
    figure: atEdge(
      "20°",
      "40°",
      tone(["angP", "angQ"], "given"),
      "Two angles at the circumference, standing on arcs AB and CD.",
    ),
    options: reasonOptions(
      r,
      "r17",
      ["r16", "r7"],
      "The two angles have their corners on the circle.",
    ),
  };
  return [
    centreFirst ? whichCentre : whichEdge,
    asQuestion("s7-arc", ["r16"], "ratio", arcFromAngles(whole(r, 1, 1e6))),
    centreFirst ? whichEdge : whichCentre,
    {
      id: "s7-trap",
      kind: "choice",
      reasonIds: ["r16"],
      skill: "ratio",
      given:
        "O is the centre. ∠AOB = 40° and ∠COD = 80°. Chord AB = 5 cm. Tom writes: CD = 10 cm (arcs prop. to ∠s at centre).",
      prompt: "What is wrong?",
      figure: doubled(40),
      options: shuffle(r, [
        {
          text: "The reason is about arcs. Chords are not proportional to angles.",
          good: true,
          why: "Double the angle doubles the arc, but not the straight chord.",
        },
        {
          text: "Nothing. Double the angle, double the chord.",
          why: "Look at the picture: CD is less than twice AB.",
        },
        {
          text: "He should have halved: CD = 2.5 cm.",
          why: "The bigger angle has the longer chord, but not in the same ratio.",
        },
      ]),
    },
    asQuestion("s7-k", ["r17"], "ratio", ratioToAngle(whole(r, 1, 1e6))),
  ];
}

/* ---------- The station ---------- */

const picture1616 = atCentre(
  "θ",
  "φ",
  {
    ...tone(["angAOB", "angCOD"], "given"),
    ...tone(["arcAB", "arcCD"], "get"),
  },
  "16.16: arcs are in the same ratio as their angles at the centre.",
);
const picture1617 = atEdge(
  "θ",
  "φ",
  { ...tone(["angP", "angQ"], "given"), ...tone(["arcAB", "arcCD"], "get") },
  "16.17: arcs are in the same ratio as their angles at the circumference.",
);

export const s7: Station = {
  id: "ratios",
  n: 7,
  title: "Arcs in proportion",
  family: "spin",
  reasonIds: ["r16", "r17"],
  idea: "Arcs share like angles. Chords do not.",
  pictures: { r16: picture1616, r17: picture1617 },
  steps: {
    wonder: [
      {
        id: "pizza",
        kind: "story",
        title: "A double slice",
        text: [
          "Slice COD has twice the angle of slice AOB.",
          "The crust is the curved arc. The chord is the straight line across the end.",
        ],
        figure: doubled(40),
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "What does the bigger slice have?",
        figure: doubled(40),
        options: [
          { text: "Twice the crust and twice the chord.", why: "" },
          { text: "Twice the crust, but not twice the chord.", why: "" },
          { text: "Twice the chord, but not twice the crust.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "string",
        kind: "hands",
        title: "One slice and a double slice",
        need: [
          "a paper circle folded into 8 slices",
          "a piece of string",
          "a ruler",
        ],
        todo: [
          "Shade one slice. Next to it, shade two slices together as one double slice.",
          "Lay the string along each curved edge. Compare the two lengths.",
          "Now measure the straight chord across the end of each shaded piece.",
        ],
        look: "The angle doubled. Which length doubled: the curved edge, the chord, or both?",
      },
      {
        id: "drag",
        kind: "explore",
        reasonId: "r16",
        title: "Compare two ratios",
        todo: "Drag B or D to change the two angles at the centre.",
        watch: "Under the circle, compare 'Arc ratio' with 'Angle ratio'.",
        options: [
          {
            text: "The arc ratio always equals the angle ratio.",
            good: true,
            why: "Arcs are proportional to their angles at the centre.",
          },
          {
            text: "The arc ratio is always 1.",
            why: "Make one angle much bigger than the other.",
          },
          {
            text: "The two ratios are never the same.",
            why: "Read both numbers after each drag.",
          },
        ],
        after:
          "In one circle, arcs are in the same ratio as their angles at the centre. This will be reason 16.16.",
      },
      {
        id: "chords",
        kind: "slide",
        recall: "guess",
        title: "Do chords double too?",
        todo: "The second angle is always double the first. Change the first angle.",
        label: "First angle",
        min: 20,
        max: 80,
        start: 40,
        step: 5,
        figure: doubled,
        readout: (angle) => [
          { label: "Arc CD ÷ arc AB", value: "2" },
          { label: "Chord CD ÷ chord AB", value: chordRatio(angle).toFixed(2) },
        ],
        options: [
          {
            text: "The arc doubles and the chord doubles.",
            why: "Read the chord number. Is it 2?",
          },
          {
            text: "The arc doubles, but the chord does not.",
            good: true,
            why: "A chord is a straight short cut, so it grows more slowly than the arc.",
          },
          { text: "Neither doubles.", why: "Read the arc number." },
        ],
        after:
          "Arcs are proportional to angles. Chords are not. Never write a chord ratio from an angle ratio.",
      },
    ],
    prove: [
      { id: "p1616", kind: "script", script: proof1616 },
      { id: "p1617", kind: "script", script: proof1617 },
    ],
    remember: [
      {
        id: "pair",
        kind: "card",
        title: "Where are the angles?",
        reasonIds: ["r16", "r17"],
        body: [
          "Both reasons say the same thing: arcs are in the same ratio as their angles.",
          "Look at where the corners of the angles are. At O: write 'at centre'. On the circle: write 'at ⊙ce'.",
          "The whole circle is 360° at the centre, and 180° at the circumference.",
        ],
      },
      {
        id: "build-1616",
        kind: "tiles",
        reasonId: "r16",
        prompt: "The angles are at the centre. Build the reason.",
        figure: picture1616,
        tiles: ["arcs", "prop. to", "∠s at centre"],
        extras: ["∠s at ⊙ce", "chords"],
        hint: "It starts with 'arcs'. The corners of the angles are at O.",
      },
      {
        id: "build-1617",
        kind: "tiles",
        reasonId: "r17",
        prompt: "Now the angles are on the circle. Build the reason.",
        figure: picture1617,
        tiles: ["arcs", "prop. to", "∠s at ⊙ce"],
        extras: ["∠s at centre", "chords"],
        hint: "It starts with 'arcs'. The corners of the angles are on the circle.",
      },
      {
        id: "which",
        kind: "choice",
        prompt: "The corners of both angles are on the circle. Which reason?",
        figure: picture1617,
        options: [
          { text: label("r16"), why: "That one needs the corners at O." },
          {
            text: label("r17"),
            good: true,
            why: "Corners on the circle: at ⊙ce.",
          },
          {
            text: label("r10"),
            why: "That one is for equal angles. Here the angles differ.",
          },
        ],
      },
      {
        id: "pen",
        kind: "story",
        title: "Pen and paper",
        text: [
          "Cover the screen and say both reasons.",
          "Write them in your exercise book without looking.",
          "Check them, then tap Next.",
        ],
      },
    ],
    use: [
      { id: "w1", kind: "script", script: workedCentre },
      { id: "n1", kind: "number", make: arcFromAngles },
      { id: "w2", kind: "script", script: workedK },
      { id: "n2", kind: "number", make: ratioToAngle },
    ],
  },
  check,
  more: [
    "A circle is cut into arcs in the ratio 1 : 2 : 3. What kind of triangle do the three cutting points make?",
    "In Explore, open 'Arc and angle ratios' and make the arc ratio exactly 1 : 3. What are the two angles?",
  ],
};
