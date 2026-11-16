/**
 * Station 2: equal chords and their distances from the centre (16.4, 16.5).
 * Proofs follow Book 5A p. 16.6; the worked example is its Example 16.4.
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
import {
  asQuestion,
  fill,
  label,
  note,
  reasonOptions,
  sound,
  tidy,
  triples,
} from "./kit";

const A = on(220),
  B = on(100),
  C = on(70),
  D = on(-50),
  M = on(160, RADIUS / 2),
  N = on(10, RADIUS / 2);

const twoChordEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "triA", t: "tri", pts: [O, A, M] },
  { id: "triD", t: "tri", pts: [O, D, N] },
  { id: "AB", t: "seg", a: A, b: B },
  { id: "CD", t: "seg", a: C, b: D },
  { id: "AM", t: "seg", a: A, b: M },
  { id: "DN", t: "seg", a: D, b: N },
  { id: "OM", t: "seg", a: O, b: M },
  { id: "ON", t: "seg", a: O, b: N },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OD", t: "seg", a: O, b: D },
  { id: "sqM", t: "sq", a: O, v: M, b: B },
  { id: "sqN", t: "sq", a: O, v: N, b: C },
  { id: "tAB", t: "tick", a: M, b: B },
  { id: "tCD", t: "tick", a: N, b: C },
  { id: "tOM", t: "tick", a: O, b: M, n: 2 },
  { id: "tON", t: "tick", a: O, b: N, n: 2 },
  { id: "tOA", t: "tick", a: O, b: A, n: 3 },
  { id: "tOD", t: "tick", a: O, b: D, n: 3 },
  ...point("O", O, 0, 22),
  ...point("A", A),
  ...point("B", B),
  ...point("C", C),
  ...point("D", D),
  ...point("M", M),
  ...point("N", N),
];
const frame = [
  "circle",
  "AB",
  "CD",
  "OM",
  "ON",
  "sqM",
  "sqN",
  ...pts("O", "A", "B", "C", "D", "M", "N"),
];
const twoChords = (tones: Tones, alt: string, extra: El[] = []): Figure => ({
  els: [...twoChordEls, ...extra],
  tones: { ...tone(frame, "base"), ...tones },
  alt,
});
const perp = tone(["sqM", "sqN"], "given");

/* ---------- Proofs ---------- */

const proof164: Script = {
  kind: "proof",
  title: "Why is 16.4 always true?",
  reasonId: "r4",
  know: "AB = CD. OM ⊥ AB and ON ⊥ CD.",
  want: "OM = ON",
  figure: twoChords(
    { ...perp, ...tone(["tAB", "tCD", "AB", "CD"], "given") },
    "Two equal chords AB and CD, with perpendiculars OM and ON from the centre.",
  ),
  steps: [
    {
      say: "Join OA and OD. Look at the two triangles OAM and ODN.",
      line: "Join OA and OD.",
      show: { ...tone(["OA", "OD"], "aux"), ...tone(["triA", "triD"], "base") },
      focus: ["OA", "OD"],
    },
    {
      say: "OM comes from the centre and is perpendicular to AB, so it cuts AB in half. ON does the same to CD.",
      line: "AM = ½AB and DN = ½CD (___)",
      blank: fill(label("r1"), [label("r2"), "given"], {
        [label("r2")]:
          "That reason starts from the mid-point. Here the right angles are given.",
        given:
          "The question gives the right angles. The halves follow from a reason you know.",
      }),
      focus: ["AM", "DN"],
    },
    {
      say: "The chords are equal, so their halves are equal.",
      line: "AB = CD (given), so AM = ___",
      blank: fill("DN", ["ON", "OM"], {
        ON: "ON is a distance from the centre. We want half of chord CD.",
        OM: "OM is a distance from the centre. We want half of chord CD.",
      }),
      show: tone(["AM", "DN"], "given"),
      focus: ["AM", "DN"],
    },
    {
      say: "OA and OD both run from the centre to the circle.",
      line: "OA = OD (___)",
      blank: fill("radii", ["given", "common side"], {
        given:
          "The question did not say this. Look where both lines start and end.",
        "common side": "They are two different lines.",
      }),
      show: tone(["tOA", "tOD"], "base"),
      focus: ["OA", "OD"],
      tool: "radii",
    },
    {
      say: "A right angle, equal longest sides and one more equal side. Which test?",
      line: "∠OMA = ∠OND = 90° (given), so △OAM ≅ △ODN (___)",
      blank: fill("RHS", ["SSS", "SAS"], {
        SSS: "We know only two pairs of equal sides, and a right angle.",
        SAS: "The right angle is not between the two equal sides.",
      }),
      focus: ["triA", "triD"],
      tool: "rhs",
    },
    {
      say: "Matching sides of congruent triangles are equal.",
      line: "∴ OM = ON (___)",
      blank: fill("corr. sides, ≅ △s", ["corr. ∠s, ≅ △s", "given"], {
        "corr. ∠s, ≅ △s": "OM and ON are sides, not angles.",
        given: "It was not given. We have just proved it.",
      }),
      show: tone(["tOM", "tON", "OM", "ON"], "get"),
      focus: ["OM", "ON"],
      tool: "corrSides",
    },
  ],
  moral:
    "Equal chords have equal halves. With equal radii, the two right-angled triangles match, so the two distances match.",
};

const proof165: Script = {
  kind: "proof",
  title: "Why is 16.5 always true?",
  reasonId: "r5",
  know: "OM ⊥ AB and ON ⊥ CD. OM = ON.",
  want: "AB = CD",
  figure: twoChords(
    { ...perp, ...tone(["tOM", "tON", "OM", "ON"], "given") },
    "Two chords AB and CD at equal perpendicular distances OM and ON from the centre.",
  ),
  steps: [
    {
      say: "Same picture, different start. Join OA and OD again.",
      line: "Join OA and OD.",
      show: { ...tone(["OA", "OD"], "aux"), ...tone(["triA", "triD"], "base") },
      focus: ["OA", "OD"],
    },
    {
      say: "This time the equal distances are given.",
      line: "OM = ON (___)",
      blank: fill("given", ["radii", "common side"], {
        radii: "M and N are not on the circle, so these are not radii.",
        "common side": "They are two different lines.",
      }),
      focus: ["OM", "ON"],
      tool: "given",
    },
    {
      say: "The radii are equal and both triangles have a right angle. Which test?",
      line: "OA = OD (radii), ∠OMA = ∠OND = 90° (given), so △OAM ≅ △ODN (___)",
      blank: fill("RHS", ["SAS", "SSS"], {
        SSS: "We know only two pairs of equal sides, and a right angle.",
        SAS: "The right angle is not between the two equal sides.",
      }),
      show: tone(["tOA", "tOD"], "base"),
      focus: ["triA", "triD"],
      tool: "rhs",
    },
    {
      say: "Matching sides are equal. These are the two half chords.",
      line: "AM = DN (___)",
      blank: fill("corr. sides, ≅ △s", ["corr. ∠s, ≅ △s", "radii"], {
        "corr. ∠s, ≅ △s": "AM and DN are sides, not angles.",
        radii: "M and N are not the centre.",
      }),
      show: tone(["AM", "DN"], "get"),
      focus: ["AM", "DN"],
      tool: "corrSides",
    },
    {
      say: "Each perpendicular from the centre cuts its chord in half. So each chord is two of these halves.",
      line: "AB = 2AM and CD = 2DN (line from centre ⊥ chord bisects chord), so AB = ___",
      blank: fill("CD", ["DN", "2CD"], {
        DN: "DN is only half of chord CD.",
        "2CD": "AB = 2AM = 2DN, and 2DN is the whole of CD.",
      }),
      show: tone(["AB", "CD", "tAB", "tCD"], "get"),
      focus: ["AB", "CD"],
    },
  ],
  moral:
    "This time the equal distances are given and the equal chords are what we get. 16.5 is 16.4 backwards.",
};

/* ---------- Worked example ---------- */

const worked: Script = {
  kind: "worked",
  title: "Example: two reasons in a row",
  reasonId: "r5",
  know: "OM ⊥ AB, ON ⊥ CD, OM = ON and MB = 8 cm.",
  want: "CD",
  figure: twoChords(
    { ...perp, ...tone(["tOM", "tON", "OM", "ON", "lenMB"], "given") },
    "Chords AB and CD at equal distances from the centre. MB is 8 cm.",
    [note("lenMB", 132, 96, "8 cm")],
  ),
  steps: [
    {
      say: "MB is half of AB. Which reason lets us double it?",
      line: "∵ OM ⊥ AB (given) ∴ AB = 2MB (___)",
      blank: fill(label("r1"), [label("r4"), label("r5")], {
        [label("r4")]:
          "That reason compares two chords. Here we look at one chord and its half.",
        [label("r5")]:
          "That reason compares two chords. Here we look at one chord and its half.",
      }),
      focus: ["sqM"],
    },
    {
      say: "So how long is AB?",
      line: "AB = 2 × 8 = ___ cm",
      blank: fill("16", ["8", "4"]),
      focus: ["AB"],
    },
    {
      say: "Now the two chords. The equal distances are given. What do we get?",
      line: "∵ OM = ON (given) ∴ CD = AB (___)",
      blank: fill(label("r5"), [label("r4"), label("r1")], {
        [label("r4")]:
          "That reason starts from equal chords. Here we start from equal distances.",
        [label("r1")]: "That reason is about one chord and its halves.",
      }),
      show: tone(["CD", "tCD", "AB", "tAB"], "get"),
      focus: ["CD"],
    },
    { say: "So CD is the same length as AB.", line: "CD = 16 cm" },
  ],
  moral:
    "Read what is given before each line. Equal distances were given, so the reason is 'chords equidistant from centre are equal'.",
};

/* ---------- Numbers ---------- */

/** Equal chords: find the distance to one from the length of the other. */
function rawChordsToDistance(seed: number): NumberQuestion {
  const [half, d, radius] = pick(rng(seed), triples);
  return {
    given: `O is the centre and the radius is ${radius} cm. AB = CD = ${2 * half} cm. OM ⊥ AB and ON ⊥ CD.`,
    prompt: "ON = x cm. Find x.",
    figure: twoChords(
      {
        ...perp,
        ...tone(["AB", "CD", "tAB", "tCD", "OA", "lenOA"], "given"),
        ...tone(["lenON"], "base"),
      },
      "Two equal chords with their perpendicular distances from the centre.",
      [
        note("lenOA", 136, 232, `${radius} cm`),
        note("lenON", 250, 152, "x cm"),
      ],
    ),
    answer: d,
    unit: "cm",
    hints: [
      "Start with chord AB. OM ⊥ AB, so AM is half of AB.",
      `In △OAM: OM² + ${half}² = ${radius}².`,
      "The chords are equal. What does that tell you about OM and ON?",
    ],
    solution: [
      `AM = ${2 * half} ÷ 2 = ${half} cm (line from centre ⊥ chord bisects chord)`,
      `OM = √(${radius}² − ${half}²) = ${d} cm (Pyth. theorem)`,
      "∵ AB = CD (given)",
      `∴ x = ON = OM = ${d} (equal chords, equidistant from centre)`,
    ],
    slips: [
      {
        value: half,
        why: "That is AM, half of the chord. Now use Pythagoras to find OM.",
      },
      {
        value: Math.sqrt(Math.abs((2 * half) ** 2 - radius ** 2)),
        why: "You used the whole chord. Use half of it in the triangle.",
      },
    ],
  };
}

/** Equal distances: find one chord from the radius and the distance. */
function rawDistanceToChords(seed: number): NumberQuestion {
  const [half, d, radius] = pick(rng(seed), triples);
  return {
    given: `O is the centre and the radius is ${radius} cm. OM ⊥ AB, ON ⊥ CD and OM = ON = ${d} cm.`,
    prompt: "CD = x cm. Find x.",
    figure: twoChords(
      { ...perp, ...tone(["OM", "ON", "tOM", "tON", "OA", "lenOA"], "given") },
      "Two chords at equal perpendicular distances from the centre.",
      [note("lenOA", 136, 232, `${radius} cm`)],
    ),
    answer: 2 * half,
    unit: "cm",
    hints: [
      `Start with chord AB. In △OAM: AM² + ${d}² = ${radius}².`,
      `AM = ${half} cm, so AB = ${2 * half} cm.`,
      "The distances are equal. What does that tell you about AB and CD?",
    ],
    solution: [
      `AM = √(${radius}² − ${d}²) = ${half} cm (Pyth. theorem)`,
      `AB = 2 × ${half} = ${2 * half} cm (line from centre ⊥ chord bisects chord)`,
      "∵ OM = ON (given)",
      `∴ x = CD = AB = ${2 * half} (chords equidistant from centre are equal)`,
    ],
    slips: [{ value: half, why: "That is half a chord. CD is a whole chord." }],
  };
}

export const chordsToDistance = (seed: number) =>
  sound(rawChordsToDistance(seed));
export const distanceToChords = (seed: number) =>
  sound(rawDistanceToChords(seed));

/* ---------- Figures for Wonder and Discover ---------- */

const near = [on(250 - 78.46), on(250 + 78.46)],
  far = [on(60 + 36.87), on(60 - 36.87)];
const park: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "AB", t: "seg", a: near[0], b: near[1] },
    { id: "CD", t: "seg", a: far[0], b: far[1] },
    ...point("O", O, 0, -20),
    ...point("A", near[0]),
    ...point("B", near[1]),
    ...point("C", far[0]),
    ...point("D", far[1]),
  ],
  tones: tone(["circle", "AB", "CD", ...pts("O", "A", "B", "C", "D")], "base"),
  alt: "A round park with a fountain at the centre O. Path AB passes near the fountain. Path CD is far from it.",
};

const CM = RADIUS / 10;
function slidingChord(d: number): Figure {
  const y = O.y + d * CM,
    half = Math.sqrt(Math.max(0, 100 - d * d)) * CM;
  const P = { x: O.x - half, y },
    Q = { x: O.x + half, y },
    foot = { x: O.x, y };
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "AB", t: "seg", a: P, b: Q },
      { id: "OM", t: "seg", a: O, b: foot },
      { id: "sq", t: "sq", a: O, v: foot, b: Q },
      ...point("O", O, -16, -6),
      ...point("A", P),
      ...point("B", Q),
      ...point("M", foot, 0, 20),
    ],
    tones: {
      ...tone(["circle", ...pts("O", "A", "B")], "base"),
      ...tone(["AB"], "get"),
      ...(d > 0.2 ? tone(["OM", "sq", ...pts("M")], "given") : {}),
    },
    alt: `A chord AB at a distance of ${d} cm from the centre of a circle of radius 10 cm.`,
  };
}

const pA = on(215),
  pB = on(325),
  pM = { x: O.x, y: pA.y },
  pP = { x: 292, y: pA.y };
const distancePick: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "AB", t: "seg", a: pA, b: pB },
    { id: "l1", t: "seg", a: O, b: pA },
    { id: "l2", t: "seg", a: O, b: pP },
    { id: "l3", t: "seg", a: O, b: pM },
    { id: "sq", t: "sq", a: O, v: pM, b: pB },
    ...point("O", O, 0, -20),
    ...point("A", pA),
    ...point("B", pB),
  ],
  tones: tone(
    ["circle", "AB", "l1", "l2", "l3", "sq", ...pts("O", "A", "B")],
    "base",
  ),
  alt: "Three lines from the centre O to chord AB: one to the end A, one slanted, and one that meets AB at a right angle.",
};

/* ---------- Check ---------- */

const directionItems = [
  {
    id: "r4",
    other: "r5",
    given: "AB = CD. OM ⊥ AB and ON ⊥ CD.",
    want: "OM = ON",
    figure: twoChords(
      { ...perp, ...tone(["AB", "CD", "tAB", "tCD"], "given") },
      "Two equal chords and their distances from the centre.",
    ),
    why: "Equal chords are given. Equal distances are what you get.",
  },
  {
    id: "r5",
    other: "r4",
    given: "OM ⊥ AB, ON ⊥ CD and OM = ON.",
    want: "AB = CD",
    figure: twoChords(
      { ...perp, ...tone(["OM", "ON", "tOM", "tON"], "given") },
      "Two chords at equal distances from the centre.",
    ),
    why: "Equal distances are given. Equal chords are what you get.",
  },
];

const slant = { x: along(A, B, 0.3), y: along(C, D, 0.75) };
function check(seed: number): Question[] {
  const r = rng(seed);
  const [first, second] = shuffle(r, directionItems);
  const direction = (
    item: (typeof directionItems)[number],
    n: number,
  ): Question => ({
    id: `s2-direction-${n}`,
    kind: "choice",
    reasonIds: [item.id],
    skill: "direction",
    given: item.given,
    prompt: `You want to write: ${item.want} Which reason do you put in the brackets?`,
    figure: item.figure,
    options: reasonOptions(r, item.id, [item.other, "r1"], item.why),
  });
  const length = 2 * whole(r, 4, 12);
  return [
    direction(first, 1),
    direction(second, 2),
    {
      id: "s2-direct",
      kind: "number",
      reasonIds: ["r5"],
      skill: "distance",
      given: `O is the centre. OM ⊥ AB, ON ⊥ CD and OM = ON. AB = ${length} cm.`,
      prompt: "CD = x cm. Find x.",
      figure: twoChords(
        { ...perp, ...tone(["OM", "ON", "tOM", "tON"], "given") },
        "Two chords at equal distances from the centre.",
      ),
      answer: length,
      unit: "cm",
      solution: [
        "∵ OM = ON (given)",
        `∴ x = CD = AB = ${length} (chords equidistant from centre are equal)`,
      ],
      slips: [
        {
          value: length / 2,
          why: "Equal distances give equal whole chords. Do not halve.",
        },
        {
          value: length * 2,
          why: "Equal distances give equal chords. Do not double.",
        },
      ],
    },
    r() < 0.5
      ? asQuestion(
          "s2-two-step",
          ["r4", "r1"],
          "pythagoras",
          chordsToDistance(whole(r, 1, 1e6)),
        )
      : asQuestion(
          "s2-two-step",
          ["r5", "r1"],
          "pythagoras",
          distanceToChords(whole(r, 1, 1e6)),
        ),
    {
      id: "s2-trap",
      kind: "choice",
      reasonIds: ["r5"],
      skill: "distance",
      given:
        "P is a point on chord AB and Q is a point on chord CD. OP = OQ, but OP and OQ are not perpendicular to the chords.",
      prompt: "Can you write AB = CD?",
      figure: {
        els: [
          { id: "circle", t: "circle" },
          { id: "AB", t: "seg", a: A, b: B },
          { id: "CD", t: "seg", a: C, b: D },
          { id: "OP", t: "seg", a: O, b: slant.x },
          { id: "OQ", t: "seg", a: O, b: slant.y },
          ...point("O", O, 0, 22),
          ...point("A", A),
          ...point("B", B),
          ...point("C", C),
          ...point("D", D),
          ...point("P", slant.x, -16, 4),
          ...point("Q", slant.y, 18, 6),
        ],
        tones: {
          ...tone(
            ["circle", "AB", "CD", ...pts("O", "A", "B", "C", "D", "P", "Q")],
            "base",
          ),
          ...tone(["OP", "OQ"], "given"),
        },
        alt: "Two chords AB and CD. Slanted lines OP and OQ join the centre to points on the chords.",
      },
      options: shuffle(r, [
        {
          text: "No. The distance from the centre must be the perpendicular distance.",
          good: true,
          why: "Reason 16.5 needs OM ⊥ AB and ON ⊥ CD. Slanted lines do not count.",
        },
        {
          text: "Yes. Chords equidistant from the centre are equal.",
          why: "Distance means perpendicular distance. OP and OQ are slanted.",
        },
        {
          text: "Yes, because OP and OQ are radii.",
          why: "P and Q are on the chords, not on the circle.",
        },
      ]),
    },
  ];
}

/* ---------- The station ---------- */

const picture164 = twoChords(
  {
    ...perp,
    ...tone(["AB", "CD", "tAB", "tCD"], "given"),
    ...tone(["OM", "ON", "tOM", "tON"], "get"),
  },
  "16.4: equal chords are given, and the equal distances follow.",
);
const picture165 = twoChords(
  {
    ...perp,
    ...tone(["OM", "ON", "tOM", "tON"], "given"),
    ...tone(["AB", "CD", "tAB", "tCD"], "get"),
  },
  "16.5: equal distances are given, and the equal chords follow.",
);

export const s2: Station = {
  id: "chords",
  n: 2,
  title: "Equal chords, equal distances",
  family: "fold",
  reasonIds: ["r4", "r5"],
  idea: "Equal chords ⇄ equal distances.",
  pictures: { r4: picture164, r5: picture165 },
  steps: {
    wonder: [
      {
        id: "park",
        kind: "story",
        title: "Two paths across a round park",
        text: [
          "A round park has a fountain at its centre O.",
          "Path AB passes near the fountain. Path CD is far from it.",
          "Both paths run straight from edge to edge.",
        ],
        figure: park,
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "Without measuring: which path is longer?",
        figure: park,
        options: [
          { text: "AB, the path near the fountain.", why: "" },
          { text: "CD, the path far from the fountain.", why: "" },
          { text: "You cannot tell from where they are.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "paper",
        kind: "hands",
        title: "Two chords of the same length",
        need: ["a paper circle", "a ruler", "a pencil"],
        todo: [
          "Fold the circle in half twice. The two folds cross at the centre O. Mark it.",
          "Draw a chord 6 cm long. Then draw another chord 6 cm long, somewhere else.",
          "For each chord, measure the shortest distance from O to the chord.",
        ],
        look: "Compare your two distances, and a friend's too. What do you notice?",
      },
      {
        id: "which-distance",
        kind: "pick",
        prompt:
          "Three lines go from O to chord AB. Which one shows the distance from O to AB?",
        figure: distancePick,
        spots: [
          { id: "end", p: along(O, pA, 0.6), label: "1" },
          { id: "perp", p: along(O, pM, 0.45), label: "2" },
          { id: "slant", p: along(O, pP, 0.62), label: "3" },
        ],
        answer: "perp",
        why: {
          end: "This line goes to the end of the chord. It is a radius.",
          slant: "This line is slanted, so it is longer than it needs to be.",
          perp: "The distance is the shortest line: the one that meets the chord at 90°.",
        },
        after:
          "Distance from the centre to a chord always means the perpendicular distance.",
      },
      {
        id: "slide",
        kind: "slide",
        recall: "guess",
        title: "Move a chord away from the centre",
        todo: "The radius of this circle is 10 cm. Slide the chord away from O, then back.",
        label: "Distance from O",
        min: 0,
        max: 9.5,
        start: 6,
        step: 0.5,
        figure: slidingChord,
        readout: (d) => [
          { label: "OM", value: `${tidy(d)} cm` },
          {
            label: "AB",
            value: `${tidy(2 * Math.sqrt(100 - d * d)).toFixed(1)} cm`,
          },
        ],
        options: [
          {
            text: "The chord gets longer as it moves away from O.",
            why: "Slide to 9 cm and read AB. Then slide to 1 cm.",
          },
          {
            text: "The nearer to O, the longer the chord.",
            good: true,
            why: "The longest chord passes through O: it is the diameter, 20 cm.",
          },
          {
            text: "The length does not depend on the distance.",
            why: "Read AB at 2 cm and at 8 cm.",
          },
        ],
        after:
          "The length of a chord depends only on its distance from the centre. So what if two chords are at the same distance?",
      },
      {
        id: "equal-distance",
        kind: "explore",
        reasonId: "r5",
        title: "Two chords at the same distance",
        todo: "The blue marks are given: OM = ON, and both are perpendicular distances. Drag M, or an end of a chord.",
        watch: "Watch the lengths AB and CD under the circle.",
        options: [
          {
            text: "AB and CD are always equal.",
            good: true,
            why: "Same distance from the centre, same length.",
          },
          {
            text: "The chord on the left is always longer.",
            why: "Read AB and CD after each drag.",
          },
          {
            text: "They are equal only when they are parallel.",
            why: "Turn one chord and read the lengths again.",
          },
        ],
        after:
          "Chords at equal distances from the centre are equal: reason 16.5. It also works backwards: equal chords are at equal distances, reason 16.4.",
      },
    ],
    prove: [
      { id: "p164", kind: "script", script: proof164 },
      { id: "p165", kind: "script", script: proof165 },
    ],
    remember: [
      {
        id: "pair",
        kind: "card",
        title: "One picture, two directions",
        reasonIds: ["r4", "r5"],
        body: [
          "Equal chords and equal distances always come together.",
          "The reason starts with the one you have (blue) and ends with the one you get (green).",
        ],
      },
      {
        id: "build-164",
        kind: "tiles",
        reasonId: "r4",
        prompt: "Equal chords are given. Build the reason.",
        figure: picture164,
        tiles: ["equal chords,", "equidistant from centre"],
        extras: ["chords equidistant from centre", "are equal"],
        hint: "Blue first: equal chords. Green last: equidistant from the centre.",
      },
      {
        id: "build-165",
        kind: "tiles",
        reasonId: "r5",
        prompt: "Now equal distances are given. Build the reason.",
        figure: picture165,
        tiles: ["chords equidistant from centre", "are equal"],
        extras: ["equal chords,", "equidistant from centre"],
        hint: "Blue first: chords equidistant from the centre. Green last: they are equal.",
      },
      {
        id: "which",
        kind: "choice",
        prompt:
          "A question says: 'OM = ON'. You want to write AB = CD. Which reason?",
        figure: twoChords(
          { ...perp, ...tone(["OM", "ON", "tOM", "tON"], "given") },
          "Two chords at equal distances from the centre.",
        ),
        options: [
          {
            text: label("r4"),
            why: "That one starts with equal chords. Equal chords are what you want here.",
          },
          {
            text: label("r5"),
            good: true,
            why: "You have equal distances. You get equal chords.",
          },
          {
            text: label("r1"),
            why: "That one is about one chord and its two halves.",
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
      { id: "w1", kind: "script", script: worked },
      { id: "n1", kind: "number", make: chordsToDistance },
      { id: "n2", kind: "number", make: distanceToChords },
    ],
  },
  check,
  more: [
    "Which chord of a circle is the longest, and how far is it from the centre? Test it in Explore with 'Equal chords and distances'.",
    "Three equal chords are drawn in one circle. What can you say about their mid-points?",
  ],
};
