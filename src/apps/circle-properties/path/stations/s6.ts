/**
 * Station 6: equal angles, equal arcs and equal chords (16.10 – 16.15).
 * Proofs follow Book 5A pp. 16.32–16.34: rotation for arcs, SAS and SSS for
 * chords, and two-reason chains for 16.14 and 16.15. The worked example is its
 * Example 16.13.
 */
import {
  CENTRE as O,
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
import { asQuestion, fill, label, reasonOptions, sound } from "./kit";

const A = on(150),
  B = on(100),
  C = on(40),
  D = on(-10);
/** Turning the copy of sector AOB by this much lays OA on OC. */
const TURN = -110;

const sectorEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "triA", t: "tri", pts: [O, A, B] },
  { id: "triC", t: "tri", pts: [O, C, D] },
  { id: "arcAB", t: "arc", from: 100, to: 150 },
  { id: "arcCD", t: "arc", from: -10, to: 40 },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "OC", t: "seg", a: O, b: C },
  { id: "OD", t: "seg", a: O, b: D },
  { id: "AB", t: "seg", a: A, b: B },
  { id: "CD", t: "seg", a: C, b: D },
  { id: "tAB", t: "tick", a: A, b: B },
  { id: "tCD", t: "tick", a: C, b: D },
  { id: "angAOB", t: "ang", a: A, v: O, b: B, r: 30 },
  { id: "angCOD", t: "ang", a: C, v: O, b: D, r: 30 },
  { id: "copyOA", t: "seg", a: O, b: A, turning: true },
  { id: "copyOB", t: "seg", a: O, b: B, turning: true },
  { id: "copyArc", t: "arc", from: 100, to: 150, turning: true },
  ...point("O", O, 0, 22),
  ...point("A", A),
  ...point("B", B),
  ...point("C", C),
  ...point("D", D),
];
const frame = [
  "circle",
  "OA",
  "OB",
  "OC",
  "OD",
  ...pts("O", "A", "B", "C", "D"),
];
const sectors = (tones: Tones, alt: string): Figure => ({
  els: sectorEls,
  tones: { ...tone(frame, "base"), ...tones },
  alt,
});
const angles = ["angAOB", "angCOD"],
  arcs = ["arcAB", "arcCD"],
  chords = ["AB", "CD", "tAB", "tCD"],
  copy = ["copyOA", "copyOB", "copyArc"];

/* ---------- Proofs ---------- */

const proof1610: Script = {
  kind: "proof",
  title: "Why is 16.10 true? Spin it.",
  reasonId: "r10",
  know: "∠AOB = ∠COD at the centre.",
  want: "arc AB = arc CD",
  figure: sectors(
    tone(angles, "given"),
    "Two sectors AOB and COD with equal angles at the centre.",
  ),
  steps: [
    {
      say: "Trace sector AOB onto clear plastic. We are going to turn the copy about O.",
      line: "Copy sector AOB.",
      show: tone(copy, "get"),
      focus: ["copyArc"],
      turn: 0,
    },
    {
      say: "Turn the copy until OA lies on OC. Both are radii, so A lands exactly on C.",
      line: "OA = OC (___), so A lands on C.",
      blank: fill("radii", ["given", "common side"], {
        given:
          "The question gives the angles. Look where OA and OC start and end.",
        "common side": "They are two different lines.",
      }),
      turn: TURN,
      tool: "radii",
    },
    {
      say: "The two angles are equal, so the other edge of the copy lies on OD. OB = OD, so B lands on D.",
      line: "∠AOB = ∠COD (___), so B lands on D.",
      blank: fill("given", ["radii", "common side"], {
        radii: "Radii are lengths. This line is about the two angles.",
        "common side": "This line is about the two angles.",
      }),
      focus: angles,
      turn: TURN,
    },
    {
      say: "The copy of arc AB now lies exactly on arc CD. So the two arcs are equal.",
      line: "∴ arc AB = arc CD",
      show: tone(arcs, "get"),
      focus: arcs,
      turn: TURN,
    },
  ],
  moral:
    "Spin one sector onto the other. Equal angles at the centre make the two arcs fit exactly.",
};

const proof1611: Script = {
  kind: "proof",
  title: "Why is 16.11 true? Spin it back.",
  reasonId: "r11",
  know: "arc AB = arc CD",
  want: "∠AOB = ∠COD",
  figure: sectors(
    tone(arcs, "given"),
    "Two sectors AOB and COD with equal arcs.",
  ),
  steps: [
    {
      say: "Copy sector AOB again. Turn the copy until A lands on C.",
      line: "Turn the copy of sector AOB until A lands on C.",
      show: tone(copy, "get"),
      focus: ["copyArc"],
      turn: TURN,
    },
    {
      say: "The two arcs have the same length, so the copy fits arc CD exactly. B lands on D.",
      line: "arc AB = arc CD (___), so B lands on D.",
      blank: fill("given", ["radii", "common side"], {
        radii: "Radii are straight. This line is about the two arcs.",
        "common side": "This line is about the two arcs.",
      }),
      focus: arcs,
      turn: TURN,
    },
    {
      say: "Now OA lies on OC and OB lies on OD. The two angles fit exactly.",
      line: "∴ ∠AOB = ___",
      blank: fill("∠COD", ["∠OCD", "∠AOD"], {
        "∠OCD": "The angle at the centre has O as its middle letter.",
        "∠AOD": "The copy of ∠AOB now lies on the angle between OC and OD.",
      }),
      show: tone(angles, "get"),
      focus: angles,
      turn: TURN,
    },
  ],
  moral:
    "Equal arcs fit each other when you spin one onto the other. So their angles at the centre fit too.",
};

const proof1612: Script = {
  kind: "proof",
  title: "Why is 16.12 always true?",
  reasonId: "r12",
  know: "∠AOB = ∠COD at the centre.",
  want: "AB = CD",
  figure: sectors(
    tone(angles, "given"),
    "Two sectors AOB and COD with equal angles at the centre.",
  ),
  steps: [
    {
      say: "Join AB and CD. Look at the two triangles OAB and OCD.",
      line: "Join AB and CD.",
      show: tone(["AB", "CD", "triA", "triC"], "base"),
      focus: ["AB", "CD"],
    },
    {
      say: "All four of these sides run from the centre to the circle.",
      line: "OA = OC and OB = OD (___)",
      blank: fill("radii", ["given", "common side"], {
        given: "The question gives the angles, not the sides.",
        "common side": "They are four different lines.",
      }),
      focus: ["OA", "OB", "OC", "OD"],
      tool: "radii",
    },
    {
      say: "Two pairs of equal sides, and the equal angles lie between them. Which test?",
      line: "∠AOB = ∠COD (given), so △OAB ≅ △OCD (___)",
      blank: fill("SAS", ["SSS", "RHS"], {
        SSS: "We know only two pairs of equal sides. The third pair is what we want.",
        RHS: "There is no right angle here.",
      }),
      focus: ["triA", "triC"],
      tool: "sas",
    },
    {
      say: "Matching sides of congruent triangles are equal.",
      line: "∴ AB = CD (___)",
      blank: fill("corr. sides, ≅ △s", ["corr. ∠s, ≅ △s", "radii"], {
        "corr. ∠s, ≅ △s": "AB and CD are sides, not angles.",
        radii: "A chord joins two points on the circle. It is not a radius.",
      }),
      show: tone(chords, "get"),
      focus: ["AB", "CD"],
      tool: "corrSides",
    },
  ],
  moral:
    "Four radii and two equal angles at the centre make two matching triangles. So the chords match.",
};

const proof1613: Script = {
  kind: "proof",
  title: "Why is 16.13 always true?",
  reasonId: "r13",
  know: "AB = CD",
  want: "∠AOB = ∠COD",
  figure: sectors(
    { ...tone(chords, "given"), ...tone(["triA", "triC"], "base") },
    "Two equal chords AB and CD, each joined to the centre.",
  ),
  steps: [
    {
      say: "Same triangles, different start. This time the chords are given.",
      line: "AB = CD (___)",
      blank: fill("given", ["radii", "common side"], {
        radii: "A chord joins two points on the circle. It is not a radius.",
        "common side": "They are two different chords.",
      }),
      focus: ["AB", "CD"],
      tool: "given",
    },
    {
      say: "The other four sides are radii. Now all three pairs of sides are equal.",
      line: "OA = OC, OB = OD (radii), so △OAB ≅ △OCD (___)",
      blank: fill("SSS", ["SAS", "RHS"], {
        SAS: "No equal angles are given. The angles are what we want.",
        RHS: "There is no right angle here.",
      }),
      focus: ["triA", "triC"],
      tool: "sss",
    },
    {
      say: "Matching angles of congruent triangles are equal.",
      line: "∴ ∠AOB = ∠COD (___)",
      blank: fill("corr. ∠s, ≅ △s", ["corr. sides, ≅ △s", "given"], {
        "corr. sides, ≅ △s": "These are angles, not sides.",
        given: "It was not given. We have just proved it.",
      }),
      show: tone(angles, "get"),
      focus: angles,
      tool: "corrAngles",
    },
  ],
  moral:
    "Equal chords and four radii make two matching triangles. So the angles at the centre match.",
};

const proof1614: Script = {
  kind: "proof",
  title: "Why is 16.14 true? Two steps.",
  reasonId: "r14",
  know: "AB = CD",
  want: "arc AB = arc CD",
  figure: sectors(tone(chords, "given"), "Two equal chords AB and CD."),
  steps: [
    {
      say: "Go from chords to angles first. You have equal chords. What do you get at the centre?",
      line: "∵ AB = CD (given) ∴ ∠AOB = ∠COD (___)",
      blank: fill(label("r13"), [label("r12"), label("r10")], {
        [label("r12")]: "That starts with equal angles. We have equal chords.",
        [label("r10")]: "That starts with equal angles. We have equal chords.",
      }),
      show: tone(angles, "get"),
      focus: angles,
    },
    {
      say: "Now go from angles to arcs. You have equal angles. What do you get?",
      line: "∴ arc AB = arc CD (___)",
      blank: fill(label("r10"), [label("r11"), label("r12")], {
        [label("r11")]:
          "That starts with equal arcs. We now have equal angles.",
        [label("r12")]: "That gives equal chords. We want equal arcs.",
      }),
      show: tone(arcs, "get"),
      focus: arcs,
    },
  ],
  moral:
    "The angle at the centre is the bridge: chords to angles, then angles to arcs.",
};

const proof1615: Script = {
  kind: "proof",
  title: "Why is 16.15 true? Two steps back.",
  reasonId: "r15",
  know: "arc AB = arc CD",
  want: "AB = CD",
  figure: sectors(tone(arcs, "given"), "Two equal arcs AB and CD."),
  steps: [
    {
      say: "Go from arcs to angles first. You have equal arcs. What do you get at the centre?",
      line: "∵ arc AB = arc CD (given) ∴ ∠AOB = ∠COD (___)",
      blank: fill(label("r11"), [label("r10"), label("r13")], {
        [label("r10")]: "That starts with equal angles. We have equal arcs.",
        [label("r13")]: "That starts with equal chords. We have equal arcs.",
      }),
      show: tone(angles, "get"),
      focus: angles,
    },
    {
      say: "Now go from angles to chords. You have equal angles. What do you get?",
      line: "∴ AB = CD (___)",
      blank: fill(label("r12"), [label("r13"), label("r10")], {
        [label("r13")]:
          "That starts with equal chords. We now have equal angles.",
        [label("r10")]: "That gives equal arcs. We want equal chords.",
      }),
      show: tone(chords, "get"),
      focus: ["AB", "CD"],
    },
  ],
  moral:
    "Again the angle at the centre is the bridge: arcs to angles, then angles to chords.",
};

/* ---------- Worked example and number ---------- */

const hA = on(180),
  hB = on(130),
  hC = on(50),
  hD = on(0);
function half(atA: string, atO: string, tones: Tones = {}): Figure {
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "AD", t: "seg", a: hA, b: hD },
      { id: "AB", t: "seg", a: hA, b: hB },
      { id: "CD", t: "seg", a: hC, b: hD },
      { id: "OB", t: "seg", a: O, b: hB },
      { id: "OC", t: "seg", a: O, b: hC },
      { id: "tAB", t: "tick", a: hA, b: hB },
      { id: "tCD", t: "tick", a: hC, b: hD },
      { id: "angA", t: "ang", a: O, v: hA, b: hB, r: 32, label: atA, lr: 54 },
      { id: "angAOB", t: "ang", a: hA, v: O, b: hB, r: 34 },
      { id: "angCOD", t: "ang", a: hC, v: O, b: hD, r: 34 },
      { id: "angBOC", t: "ang", a: hB, v: O, b: hC, r: 24, label: atO, lr: 44 },
      ...point("O", O, 0, 22),
      ...point("A", hA),
      ...point("B", hB),
      ...point("C", hC),
      ...point("D", hD),
    ],
    tones: {
      ...tone(
        ["circle", "AD", "OB", "OC", "angBOC", ...pts("O", "A", "B", "C", "D")],
        "base",
      ),
      ...tone(["AB", "CD", "tAB", "tCD", "angA"], "given"),
      ...tones,
    },
    alt: "AOD is a diameter. AB and CD are equal chords, joined to the centre O.",
  };
}

const worked: Script = {
  kind: "worked",
  title: "Example: equal chords in a semi-circle",
  reasonId: "r13",
  know: "AOD is a diameter. AB = CD and ∠BAO = 65°.",
  want: "x = ∠BOC",
  figure: half("65°", "x"),
  steps: [
    {
      say: "OA and OB are radii, so triangle OAB is isosceles. Its base angles are equal.",
      line: "OA = OB (radii), so ∠ABO = ∠BAO = 65° (___)",
      blank: fill("base ∠s, isos. △", ["ext. ∠ of △", label("r13")], {
        "ext. ∠ of △": "Both angles are inside triangle OAB.",
        [label("r13")]:
          "Not yet. First find the angle at O inside triangle OAB.",
      }),
      tool: "isos",
    },
    {
      say: "Find the angle at the centre in triangle OAB.",
      line: "∠AOB = 180° − 65° − 65° = ___ (∠ sum of △)",
      blank: fill("50°", ["115°", "65°"], {
        "115°": "Take away both base angles.",
        "65°": "The three angles must make 180°.",
      }),
      show: tone(["angAOB"], "get"),
      focus: ["angAOB"],
      tool: "sum",
    },
    {
      say: "Now the two chords. Equal chords are given. What do you get at the centre?",
      line: "∵ AB = CD (given) ∴ ∠COD = ∠AOB = 50° (___)",
      blank: fill(label("r13"), [label("r12"), label("r14")], {
        [label("r12")]:
          "That starts with equal angles. Here equal chords are given.",
        [label("r14")]: "That gives equal arcs. Here we want an angle.",
      }),
      show: tone(["angCOD"], "get"),
      focus: ["angCOD", "AB", "CD"],
    },
    {
      say: "The three angles at O sit on the straight line AOD.",
      line: "x = 180° − 50° − 50° = ___ (adj. ∠s on st. line)",
      blank: fill("80°", ["100°", "130°"], {
        "100°": "Take away both 50° angles.",
        "130°": "Take away both 50° angles.",
      }),
      show: tone(["angBOC"], "get"),
      tool: "adj",
    },
  ],
  moral:
    "Read what is given before each line. Equal chords were given, so the reason is 'equal chords, equal ∠s'.",
};

function rawSemiChase(seed: number): NumberQuestion {
  const a = pick(rng(seed), [55, 60, 70, 75, 80]);
  const centre = 180 - 2 * a;
  return {
    given: `AOD is a diameter. AB = CD and ∠BAO = ${a}°.`,
    prompt: "∠BOC = x°. Find x.",
    figure: half(`${a}°`, "x°"),
    answer: 180 - 2 * centre,
    unit: "°",
    hints: [
      "OA = OB (radii), so triangle OAB is isosceles. Find ∠AOB.",
      `∠AOB = 180° − ${a}° − ${a}° = ${centre}°. Equal chords: what is ∠COD?`,
      `∠COD = ${centre}° too. The three angles at O make 180°.`,
    ],
    solution: [
      `OA = OB (radii), so ∠ABO = ∠BAO = ${a}° (base ∠s, isos. △)`,
      `∠AOB = 180° − ${a}° − ${a}° = ${centre}° (∠ sum of △)`,
      `∵ AB = CD (given) ∴ ∠COD = ∠AOB = ${centre}° (equal chords, equal ∠s)`,
      `x = 180 − ${centre} − ${centre} = ${180 - 2 * centre} (adj. ∠s on st. line)`,
    ],
    slips: [
      {
        value: centre,
        why: "That is ∠AOB. Now use the equal chords, then the straight line AOD.",
      },
      {
        value: 180 - centre,
        why: "Take away ∠COD as well. Equal chords make it equal to ∠AOB.",
      },
    ],
  };
}

export const semiChase = (seed: number) => sound(rawSemiChase(seed));

/* ---------- Discover figures ---------- */

const vA = on(160),
  vB = on(60);
const arcOrChord: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "arcAB", t: "arc", from: 60, to: 160 },
    { id: "AB", t: "seg", a: vA, b: vB },
    { id: "OA", t: "seg", a: O, b: vA },
    { id: "OB", t: "seg", a: O, b: vB },
    ...point("O", O, 0, 22),
    ...point("A", vA),
    ...point("B", vB),
  ],
  tones: tone(
    ["circle", "arcAB", "AB", "OA", "OB", ...pts("O", "A", "B")],
    "base",
  ),
  alt: "Points A and B on a circle, with the chord AB, the arc AB and the radii OA and OB.",
};

const small = 72;
const twoSizes: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "inner", t: "circle", r: small },
    { id: "OA", t: "seg", a: O, b: on(150, small) },
    { id: "OB", t: "seg", a: O, b: on(100, small) },
    { id: "OC", t: "seg", a: O, b: C },
    { id: "OD", t: "seg", a: O, b: D },
    { id: "arcAB", t: "arc", from: 100, to: 150, r: small },
    { id: "arcCD", t: "arc", from: -10, to: 40 },
    { id: "angAOB", t: "ang", a: A, v: O, b: B, r: 30 },
    { id: "angCOD", t: "ang", a: C, v: O, b: D, r: 30 },
    ...point("O", O, 0, 22),
    ...point("A", on(150, small), -14, -4),
    ...point("B", on(100, small), 0, -20),
    ...point("C", C),
    ...point("D", D),
  ],
  tones: {
    ...tone(
      [
        "circle",
        "inner",
        "OA",
        "OB",
        "OC",
        "OD",
        "arcAB",
        "arcCD",
        ...pts("O", "A", "B", "C", "D"),
      ],
      "base",
    ),
    ...tone(angles, "given"),
  },
  alt: "Two circles with the same centre. Arc AB is on the small circle and arc CD on the large one. Their angles at the centre are equal.",
};

/* ---------- Check ---------- */

type Item = {
  id: string;
  given: string;
  want: string;
  others: [string, string];
  have: string[];
  why: string;
};
const directionItems: Item[] = [
  {
    id: "r10",
    given: "∠AOB = ∠COD at the centre O.",
    want: "arc AB = arc CD",
    others: ["r11", "r12"],
    have: angles,
    why: "You have equal angles. You get equal arcs.",
  },
  {
    id: "r11",
    given: "arc AB = arc CD in a circle with centre O.",
    want: "∠AOB = ∠COD",
    others: ["r10", "r15"],
    have: arcs,
    why: "You have equal arcs. You get equal angles.",
  },
  {
    id: "r12",
    given: "∠AOB = ∠COD at the centre O.",
    want: "AB = CD",
    others: ["r13", "r10"],
    have: angles,
    why: "You have equal angles. You get equal chords.",
  },
  {
    id: "r13",
    given: "AB = CD in a circle with centre O.",
    want: "∠AOB = ∠COD",
    others: ["r12", "r14"],
    have: chords,
    why: "You have equal chords. You get equal angles.",
  },
  {
    id: "r14",
    given: "AB = CD in a circle.",
    want: "arc AB = arc CD",
    others: ["r15", "r13"],
    have: chords,
    why: "You have equal chords. You get equal arcs.",
  },
  {
    id: "r15",
    given: "arc AB = arc CD in a circle.",
    want: "AB = CD",
    others: ["r14", "r11"],
    have: arcs,
    why: "You have equal arcs. You get equal chords.",
  },
];

function check(seed: number): Question[] {
  const r = rng(seed);
  const three = shuffle(r, directionItems).slice(0, 3);
  const direction = (item: Item, n: number): Question => ({
    id: `s6-direction-${n}`,
    kind: "choice",
    reasonIds: [item.id],
    skill: "arcChord",
    given: item.given,
    prompt: `You want to write: ${item.want} Which reason do you put in the brackets?`,
    figure: sectors(
      {
        ...tone(item.have, "given"),
        ...(item.have === chords ? {} : tone(["AB", "CD"], "base")),
      },
      "Two sectors AOB and COD of one circle.",
    ),
    options: reasonOptions(r, item.id, item.others, item.why),
  });
  return [
    direction(three[0], 1),
    direction(three[1], 2),
    {
      id: "s6-trap",
      kind: "choice",
      reasonIds: ["r10"],
      skill: "arcChord",
      given:
        "Two circles have the same centre O but different sizes. ∠AOB = ∠COD.",
      prompt: "Can you write arc AB = arc CD (equal ∠s, equal arcs)?",
      figure: twoSizes,
      options: shuffle(r, [
        {
          text: "No. The arcs are on circles of different sizes.",
          good: true,
          why: "These reasons work only in the same circle, or in equal circles.",
        },
        {
          text: "Yes. Equal angles always give equal arcs.",
          why: "Look at the picture: arc CD is clearly longer.",
        },
        {
          text: "Yes, because both angles are at the centre.",
          why: "The circles must also be the same size.",
        },
      ]),
    },
    direction(three[2], 3),
    asQuestion("s6-chase", ["r13"], "angleChase", semiChase(whole(r, 1, 1e6))),
  ];
}

/* ---------- The station ---------- */

const picture = (have: string[], get: string[], alt: string) =>
  sectors(
    {
      ...tone(["AB", "CD"], "base"),
      ...tone(have, "given"),
      ...tone(get, "get"),
    },
    alt,
  );
const pictures = {
  r10: picture(
    angles,
    arcs,
    "16.10: equal angles at the centre give equal arcs.",
  ),
  r11: picture(
    arcs,
    angles,
    "16.11: equal arcs give equal angles at the centre.",
  ),
  r12: picture(
    angles,
    chords,
    "16.12: equal angles at the centre give equal chords.",
  ),
  r13: picture(
    chords,
    angles,
    "16.13: equal chords give equal angles at the centre.",
  ),
  r14: picture(chords, arcs, "16.14: equal chords give equal arcs."),
  r15: picture(arcs, chords, "16.15: equal arcs give equal chords."),
};

export const s6: Station = {
  id: "equal-arcs",
  n: 6,
  title: "Equal angles, arcs and chords",
  family: "spin",
  reasonIds: ["r10", "r11", "r12", "r13", "r14", "r15"],
  idea: "Say what you have, then what you get.",
  pictures,
  steps: {
    wonder: [
      {
        id: "pizza",
        kind: "story",
        title: "Two slices of pizza",
        text: [
          "Two slices are cut from one round pizza, each from the centre.",
          "Both slices have the same angle at the centre.",
          "The crust is the curved edge. The straight line across the end of a slice is the chord.",
        ],
        figure: sectors(
          { ...tone(angles, "given"), ...tone(["AB", "CD", ...arcs], "base") },
          "Two slices AOB and COD with equal angles at the centre.",
        ),
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "Which is true for the two slices?",
        figure: sectors(
          { ...tone(angles, "given"), ...tone(["AB", "CD", ...arcs], "base") },
          "Two slices AOB and COD with equal angles at the centre.",
        ),
        options: [
          { text: "Same crust and same chord.", why: "" },
          { text: "Same crust, but the chords can differ.", why: "" },
          { text: "Neither has to be the same.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "slices",
        kind: "hands",
        title: "Eight equal slices",
        need: ["a paper circle", "scissors"],
        todo: [
          "Fold the circle in half three times. Open it: the folds make 8 slices.",
          "All 8 slices have the same angle at the centre, because the folds match.",
          "Cut out two of the slices.",
          "Put one slice on top of the other.",
        ],
        look: "Do the curved edges match? Do the straight lines across the ends match?",
      },
      {
        id: "arc-or-chord",
        kind: "pick",
        prompt: "A and B are joined in two ways. Tap arc AB, the curved one.",
        figure: arcOrChord,
        spots: [
          { id: "arc", p: on(110, 146), label: "1" },
          { id: "chord", p: along(O, on(110), 0.46), label: "2" },
          { id: "radius", p: along(O, vB, 0.5), label: "3" },
        ],
        answer: "arc",
        why: {
          arc: "An arc is part of the circle itself, so it is curved.",
          chord: "This straight line is chord AB.",
          radius: "This is a radius, from the centre to the circle.",
        },
        after:
          "An arc is curved and a chord is straight. Their lengths are different, so always say which one you mean.",
      },
      {
        id: "drag",
        kind: "explore",
        recall: "guess",
        reasonId: "r12",
        title: "Equal angles at the centre",
        todo: "The two blue angles at O are equal. Drag A or B to change them both.",
        watch:
          "Under the circle, compare chord AB with chord CD, and arc AB with arc CD.",
        options: [
          {
            text: "Only the arcs stay equal.",
            why: "Read the two chord lengths as well.",
          },
          {
            text: "The chords stay equal and the arcs stay equal.",
            good: true,
            why: "Equal angles at the centre give equal arcs and equal chords.",
          },
          {
            text: "Only the chords stay equal.",
            why: "Read the two arc lengths as well.",
          },
        ],
        after:
          "Angles at the centre, arcs and chords are three friends. If one pair is equal, the other two pairs are equal.",
      },
      {
        id: "sizes",
        kind: "choice",
        prompt:
          "Two circles of different sizes, with equal angles at the centre. Is arc AB equal to arc CD?",
        figure: twoSizes,
        options: [
          {
            text: "Yes. Equal angles always give equal arcs.",
            why: "Look at the picture: arc CD is clearly longer.",
          },
          {
            text: "No. The circles are different sizes.",
            good: true,
            why: "The reasons work only in the same circle, or in circles of the same size.",
          },
        ],
        after: "Use these reasons in one circle, or in equal circles.",
      },
    ],
    prove: [
      { id: "p1610", kind: "script", script: proof1610 },
      { id: "p1611", kind: "script", script: proof1611 },
      { id: "p1612", kind: "script", script: proof1612 },
      { id: "p1613", kind: "script", script: proof1613 },
      { id: "p1614", kind: "script", script: proof1614 },
      { id: "p1615", kind: "script", script: proof1615 },
    ],
    remember: [
      {
        id: "maker",
        kind: "maker",
        title: "Six reasons from one rule",
        body: [
          "You do not need to memorise six reasons. Say what you have, then what you get.",
          "Make all six: tap what you have, then what you get.",
        ],
      },
      {
        id: "card",
        kind: "card",
        title: "Have first, get second",
        reasonIds: ["r10", "r11", "r12", "r13", "r14", "r15"],
        body: [
          "Here are the six you made. Read each one aloud: blue first, then green.",
        ],
      },
      {
        id: "build-1614",
        kind: "tiles",
        reasonId: "r14",
        prompt:
          "Equal chords are given. You want equal arcs. Build the reason.",
        figure: pictures.r14,
        tiles: ["equal chords,", "equal arcs"],
        extras: ["equal ∠s,", "equal arcs,"],
        hint: "Blue first: equal chords. Green last: equal arcs.",
      },
      {
        id: "build-1611",
        kind: "tiles",
        reasonId: "r11",
        prompt:
          "Equal arcs are given. You want equal angles. Build the reason.",
        figure: pictures.r11,
        tiles: ["equal arcs,", "equal ∠s"],
        extras: ["equal chords,", "equal ∠s,"],
        hint: "Blue first: equal arcs. Green last: equal ∠s.",
      },
      {
        id: "which",
        kind: "choice",
        prompt:
          "A question says: '∠AOB = ∠COD'. You want to write AB = CD. Which reason?",
        figure: pictures.r12,
        options: [
          {
            text: label("r13"),
            why: "That starts with equal chords. Equal chords are what you want here.",
          },
          {
            text: label("r10"),
            why: "That gives equal arcs. AB = CD is about the straight chords.",
          },
          {
            text: label("r12"),
            good: true,
            why: "You have equal angles. You get equal chords.",
          },
        ],
      },
      {
        id: "pen",
        kind: "story",
        title: "Pen and paper",
        text: [
          "Draw a triangle with the words ∠s, arcs and chords at its corners.",
          "Point to two corners and say the reason: have first, get second. Do all six.",
          "Then tap Next.",
        ],
      },
    ],
    use: [
      { id: "w1", kind: "script", script: worked },
      { id: "n1", kind: "number", make: semiChase },
    ],
  },
  check,
  more: [
    "The same six ideas work for angles at the circumference. Equal arcs give equal angles at the circumference too. Test it in Explore with 'Angles, arcs and chords'.",
    "A regular hexagon is drawn inside a circle. What can you say about its six sides, six arcs and six angles at the centre?",
  ],
};
