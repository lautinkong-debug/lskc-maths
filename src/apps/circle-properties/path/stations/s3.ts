/**
 * Station 3: the angle at the centre is twice the angle at the circumference (16.6).
 * The proof follows Book 5A p. 16.16, with x and y for the two base angles;
 * the reflex example is its Example 16.6(b).
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
import { rng, shuffle, whole } from "../random";
import type { NumberQuestion, Question, Script, Station } from "../types";
import { asQuestion, fill, label, reasonOptions, sound } from "./kit";

const A = on(210),
  B = on(330),
  P = on(110),
  T = on(290);

const proofEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "triA", t: "tri", pts: [O, A, P] },
  { id: "triB", t: "tri", pts: [O, B, P] },
  { id: "arcAB", t: "arc", from: 210, to: 330 },
  { id: "PA", t: "seg", a: P, b: A },
  { id: "PB", t: "seg", a: P, b: B },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "PO", t: "seg", a: P, b: O },
  { id: "OT", t: "seg", a: O, b: T },
  { id: "tOA", t: "tick", a: O, b: A },
  { id: "tOP", t: "tick", a: O, b: P },
  { id: "tOB", t: "tick", a: O, b: B },
  { id: "xP", t: "ang", a: A, v: P, b: O, r: 40, label: "x", lr: 54 },
  { id: "xA", t: "ang", a: O, v: A, b: P, r: 34, label: "x", lr: 48 },
  {
    id: "yP",
    t: "ang",
    a: O,
    v: P,
    b: B,
    r: 46,
    label: "y",
    lr: 60,
    twice: true,
  },
  {
    id: "yB",
    t: "ang",
    a: P,
    v: B,
    b: O,
    r: 40,
    label: "y",
    lr: 56,
    twice: true,
  },
  { id: "aO", t: "ang", a: A, v: O, b: T, r: 26, label: "2x", lr: 44 },
  {
    id: "bO",
    t: "ang",
    a: T,
    v: O,
    b: B,
    r: 32,
    label: "2y",
    lr: 50,
    twice: true,
  },
  ...point("O", O, 18, -8),
  ...point("A", A),
  ...point("B", B),
  ...point("P", P),
  ...point("T", T),
];
const proofFrame = [
  "circle",
  "PA",
  "PB",
  "OA",
  "OB",
  ...pts("O", "A", "B", "P"),
];

const proof166: Script = {
  kind: "proof",
  title: "Why is 16.6 always true?",
  reasonId: "r6",
  know: "O is the centre. ∠AOB and ∠APB stand on the same arc AB.",
  want: "∠AOB = 2 × ∠APB",
  figure: {
    els: proofEls,
    tones: { ...tone(proofFrame, "base"), ...tone(["arcAB"], "given") },
    alt: "Angle AOB at the centre and angle APB at the circumference stand on the same arc AB.",
  },
  steps: [
    {
      say: "Join P to the centre O and carry on to T. The line cuts each angle into two parts.",
      line: "Join PO and produce it to T.",
      show: { ...tone(["PO", "OT"], "aux"), ...tone(pts("T"), "base") },
      focus: ["PO", "OT"],
    },
    {
      say: "Look at the left triangle OAP. Two of its sides run from the centre to the circle.",
      line: "OP = OA (___)",
      blank: fill("radii", ["given", "common side"], {
        given:
          "The question did not say this. Look where both lines start and end.",
        "common side": "They are two different sides of the triangle.",
      }),
      show: tone(["triA", "tOA", "tOP"], "base"),
      focus: ["PO", "OA"],
      tool: "radii",
    },
    {
      say: "So triangle OAP is isosceles. Its two base angles are equal. Call each one x.",
      line: "∠OAP = ∠OPA = x (___)",
      blank: fill("base ∠s, isos. △", ["ext. ∠ of △", "corr. ∠s, ≅ △s"], {
        "ext. ∠ of △":
          "These two angles are inside the triangle, at the ends of its base.",
        "corr. ∠s, ≅ △s":
          "There is only one triangle here. It has two equal sides.",
      }),
      show: tone(["xP", "xA"], "given"),
      focus: ["xP", "xA"],
      tool: "isos",
    },
    {
      say: "∠AOT is an outside angle of triangle OAP. It equals the two far inside angles added together.",
      line: "∠AOT = x + x = ___ (ext. ∠ of △)",
      blank: fill("2x", ["x", "x²"], {
        x: "Add both base angles: x and x.",
        "x²": "Add, do not multiply: x + x.",
      }),
      show: tone(["aO"], "get"),
      focus: ["aO"],
      tool: "ext",
    },
    {
      say: "Do the same on the right with triangle OBP. Its base angles are y.",
      line: "∠BOT = y + y = ___ (ext. ∠ of △)",
      blank: fill("2y", ["y", "2x"], {
        y: "Add both base angles: y and y.",
        "2x": "On this side the base angles are y.",
      }),
      show: {
        ...tone(["triB", "tOB"], "base"),
        ...tone(["yP", "yB"], "given"),
        ...tone(["bO"], "get"),
      },
      focus: ["bO"],
      tool: "ext",
    },
    {
      say: "Add the two parts. The angle at P is x + y. The angle at O is 2x + 2y.",
      line: "∠AOB = 2x + 2y = 2(x + y) = 2 × ___",
      blank: fill("∠APB", ["∠AOB", "∠OAP"], {
        "∠AOB": "x + y is the whole angle at P.",
        "∠OAP": "∠OAP is only x. We need x + y, the whole angle at P.",
      }),
      focus: ["xP", "yP", "aO", "bO"],
    },
  ],
  moral:
    "Two radii make an isosceles triangle. Its outside angle at the centre is double its base angle. Do that on both sides, and the whole centre angle is double the angle at the circumference.",
};

/* ---------- One figure for most questions ---------- */

const qA = on(215),
  qB = on(325),
  qP = on(95);
function standard(
  atCentre: string,
  atEdge: string,
  tones: Tones = {},
  extra: El[] = [],
): Figure {
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "arcAB", t: "arc", from: 215, to: 325 },
      { id: "AB", t: "seg", a: qA, b: qB },
      { id: "PA", t: "seg", a: qP, b: qA },
      { id: "PB", t: "seg", a: qP, b: qB },
      { id: "OA", t: "seg", a: O, b: qA },
      { id: "OB", t: "seg", a: O, b: qB },
      {
        id: "angO",
        t: "ang",
        a: qA,
        v: O,
        b: qB,
        r: 26,
        label: atCentre,
        lr: 46,
      },
      {
        id: "angP",
        t: "ang",
        a: qA,
        v: qP,
        b: qB,
        r: 40,
        label: atEdge,
        lr: 60,
      },
      ...point("O", O, 0, -20),
      ...point("A", qA),
      ...point("B", qB),
      ...point("P", qP),
      ...extra,
    ],
    tones: {
      ...tone(
        [
          "circle",
          "PA",
          "PB",
          "OA",
          "OB",
          "angO",
          "angP",
          ...pts("O", "A", "B", "P"),
        ],
        "base",
      ),
      ...tones,
    },
    alt: "Angle AOB at the centre and angle APB at the circumference, both on arc AB.",
  };
}

const rA = on(200),
  rB = on(340),
  rP = on(270);
function reflexFigure(atEdge: string, reflex: string, minor = ""): Figure {
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "PA", t: "seg", a: rP, b: rA },
      { id: "PB", t: "seg", a: rP, b: rB },
      { id: "OA", t: "seg", a: O, b: rA },
      { id: "OB", t: "seg", a: O, b: rB },
      {
        id: "angP",
        t: "ang",
        a: rA,
        v: rP,
        b: rB,
        r: 28,
        label: atEdge,
        lr: 48,
      },
      {
        id: "angR",
        t: "ang",
        a: rB,
        v: O,
        b: rA,
        r: 30,
        label: reflex,
        lr: 50,
        reflex: true,
      },
      { id: "angM", t: "ang", a: rA, v: O, b: rB, r: 20, label: minor, lr: 38 },
      ...point("O", O, 24, -4),
      ...point("A", rA),
      ...point("B", rB),
      ...point("P", rP),
    ],
    tones: {
      ...tone(
        ["circle", "PA", "PB", "OA", "OB", "angP", ...pts("O", "A", "B", "P")],
        "base",
      ),
      ...(reflex ? tone(["angR"], "base") : {}),
      ...(minor ? tone(["angM"], "base") : {}),
    },
    alt: "P is on the minor arc AB. The angle at P stands on the major arc, which has a reflex angle at the centre.",
  };
}

/* ---------- Worked examples ---------- */

const workedDouble: Script = {
  kind: "worked",
  title: "Example 1: find the angle at the centre",
  reasonId: "r6",
  know: "O is the centre. ∠APB = 42°.",
  want: "x = ∠AOB",
  figure: standard("x", "42°", {
    ...tone(["angP"], "given"),
    ...tone(["arcAB"], "base"),
  }),
  steps: [
    {
      say: "Both angles stand on arc AB. Which one is at the centre, so the bigger one?",
      line: "The angle at the centre is ___.",
      blank: fill("x", ["42°", "neither"], {
        "42°": "42° has its corner at P, on the circle.",
        neither: "x has its corner at O, the centre.",
      }),
      focus: ["angO"],
    },
    {
      say: "The angle at the centre is twice the angle at the circumference.",
      line: "x = 2 × ∠APB (___)",
      blank: fill(label("r6"), [label("r7"), label("r8")], {
        [label("r7")]:
          "That reason compares two angles on the circle. Here one angle is at the centre.",
        [label("r8")]: "That reason needs a diameter.",
      }),
      focus: ["angO", "angP"],
    },
    {
      say: "So double it.",
      line: "x = 2 × 42° = ___",
      blank: fill("84°", ["21°", "42°"], {
        "21°": "The centre angle is the bigger one. Double, do not halve.",
        "42°": "The two angles are not equal: one is at the centre.",
      }),
      show: tone(["angO"], "get"),
    },
  ],
  moral:
    "Find the angle at the centre first. It is the big one: centre = 2 × circumference.",
};

const workedReflex: Script = {
  kind: "worked",
  title: "Example 2: the point is on the small arc",
  reasonId: "r6",
  know: "O is the centre. P is on the minor arc AB. The small angle AOB is 132°.",
  want: "x = ∠APB",
  figure: reflexFigure("x", "", "132°"),
  steps: [
    {
      say: "Follow the arms of x from P to A and B. x stands on the big arc, the one that does not contain P.",
      line: "x stands on the ___ arc AB.",
      blank: fill("major", ["minor"], {
        minor:
          "P itself is on the minor arc. An angle stands on the arc opposite its corner.",
      }),
      focus: ["angP"],
    },
    {
      say: "The angle at the centre on the big arc is the reflex angle. All the way round O is 360°.",
      line: "reflex ∠AOB = 360° − 132° = ___ (∠s at a pt.)",
      blank: fill("228°", ["132°", "48°"], {
        "132°": "132° faces the small arc. Take it away from 360°.",
        "48°": "A full turn is 360°, not 180°.",
      }),
      show: tone(["angR"], "given"),
      focus: ["angR"],
    },
    {
      say: "Now use the reason. x is at the circumference, so it is half.",
      line: "x = 228° ÷ 2 = ___ (∠ at centre twice ∠ at ⊙ce)",
      blank: fill("114°", ["66°", "456°"], {
        "66°": "That is half of 132°. But x stands on the big arc: use 228°.",
        "456°": "x is at the circumference, the smaller one. Halve.",
      }),
      show: tone(["angP"], "get"),
    },
  ],
  moral:
    "Always ask which arc the angle stands on. If the point is on the small arc, use the reflex angle at the centre.",
};

/* ---------- Numbers ---------- */

/** One step: double or halve. */
function rawDoubleOrHalf(seed: number): NumberQuestion {
  const r = rng(seed);
  const edge = whole(r, 24, 72);
  const findCentre = r() < 0.5;
  return findCentre
    ? {
        given: `O is the centre. ∠APB = ${edge}°.`,
        prompt: "∠AOB = x°. Find x.",
        figure: standard("x°", `${edge}°`, tone(["angP"], "given")),
        answer: 2 * edge,
        unit: "°",
        hints: [
          "Both angles stand on arc AB. Which one is at the centre?",
          "The angle at the centre is the bigger one: double.",
        ],
        solution: [
          `x = 2 × ${edge} = ${2 * edge} (∠ at centre twice ∠ at ⊙ce)`,
        ],
        slips: [
          {
            value: edge / 2,
            why: "The angle at the centre is the bigger one. Double, do not halve.",
          },
          {
            value: edge,
            why: "The two angles are not equal: one is at the centre.",
          },
        ],
      }
    : {
        given: `O is the centre. ∠AOB = ${2 * edge}°.`,
        prompt: "∠APB = x°. Find x.",
        figure: standard(`${2 * edge}°`, "x°", tone(["angO"], "given")),
        answer: edge,
        unit: "°",
        hints: [
          "Both angles stand on arc AB. Which one is on the circle?",
          "The angle at the circumference is the smaller one: halve.",
        ],
        solution: [
          `x = ${2 * edge} ÷ 2 = ${edge} (∠ at centre twice ∠ at ⊙ce)`,
        ],
        slips: [
          {
            value: 4 * edge,
            why: "The angle at the circumference is the smaller one. Halve, do not double.",
          },
          {
            value: 2 * edge,
            why: "The two angles are not equal: one is at the centre.",
          },
        ],
      };
}

/** Two radii make an isosceles triangle; then halve the angle at the centre. */
function rawIsoscelesThenHalf(seed: number): NumberQuestion {
  const a = whole(rng(seed), 18, 44);
  const centre = 180 - 2 * a;
  return {
    given: `O is the centre. ∠OAB = ${a}°.`,
    prompt: "∠APB = x°. Find x.",
    figure: standard(
      "",
      "x°",
      {
        ...tone(["AB", "angA"], "base"),
        ...tone(["angA"], "given"),
        angO: "off",
      },
      [
        {
          id: "angA",
          t: "ang",
          a: O,
          v: qA,
          b: qB,
          r: 34,
          label: `${a}°`,
          lr: 56,
        },
      ],
    ),
    answer: centre / 2,
    unit: "°",
    hints: [
      "OA and OB are radii. So triangle OAB is isosceles.",
      `∠OBA = ${a}° too. Find ∠AOB from the angle sum.`,
      `∠AOB = ${centre}°. x is at the circumference, so halve it.`,
    ],
    solution: [
      "OA = OB (radii)",
      `∠OBA = ∠OAB = ${a}° (base ∠s, isos. △)`,
      `∠AOB = 180° − ${a}° − ${a}° = ${centre}° (∠ sum of △)`,
      `x = ${centre} ÷ 2 = ${centre / 2} (∠ at centre twice ∠ at ⊙ce)`,
    ],
    slips: [
      {
        value: centre,
        why: "That is ∠AOB, at the centre. ∠APB is half of it.",
      },
      {
        value: a,
        why: "∠APB is not equal to ∠OAB. Find ∠AOB first, then halve.",
      },
      { value: 2 * a, why: "Use the angle sum of △OAB to find ∠AOB first." },
    ],
  };
}

/** P on the minor arc: the reflex angle at the centre is the one to halve. */
function rawReflexCase(seed: number): NumberQuestion {
  const minor = 2 * whole(rng(seed), 50, 78);
  const reflex = 360 - minor;
  return {
    given: `O is the centre. P is on the minor arc AB. The smaller angle AOB is ${minor}°.`,
    prompt: "∠APB = x°. Find x.",
    figure: reflexFigure("x°", "", `${minor}°`),
    answer: reflex / 2,
    unit: "°",
    hints: [
      "Which arc does x stand on? The one that does not contain P.",
      `The angle at the centre on the major arc is reflex: 360° − ${minor}°.`,
      `Halve ${reflex}°.`,
    ],
    solution: [
      `reflex ∠AOB = 360° − ${minor}° = ${reflex}° (∠s at a pt.)`,
      `x = ${reflex} ÷ 2 = ${reflex / 2} (∠ at centre twice ∠ at ⊙ce)`,
    ],
    slips: [
      {
        value: minor / 2,
        why: "x stands on the major arc. Use the reflex angle at the centre.",
      },
      {
        value: reflex,
        why: "That is the reflex angle at the centre. x is half of it.",
      },
    ],
  };
}

export const doubleOrHalf = (seed: number) => sound(rawDoubleOrHalf(seed));
export const isoscelesThenHalf = (seed: number) =>
  sound(rawIsoscelesThenHalf(seed));
export const reflexCase = (seed: number) => sound(rawReflexCase(seed));

/* ---------- Wonder and Discover figures ---------- */

const sA = on(220),
  sB = on(320),
  sP = on(90);
const hallEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "arcAB", t: "arc", from: 220, to: 320 },
  { id: "OA", t: "seg", a: O, b: sA },
  { id: "OB", t: "seg", a: O, b: sB },
  { id: "PA", t: "seg", a: sP, b: sA },
  { id: "PB", t: "seg", a: sP, b: sB },
  { id: "angO", t: "ang", a: sA, v: O, b: sB, r: 26, label: "100°", lr: 50 },
  { id: "angP", t: "ang", a: sA, v: sP, b: sB, r: 44, label: "?", lr: 62 },
  ...point("O", O, 22, -8),
  ...point("A", sA),
  ...point("B", sB),
  ...point("P", sP),
];
const hall = (tones: Tones = {}): Figure => ({
  els: hallEls,
  tones: {
    ...tone(
      ["circle", "OA", "OB", "PA", "PB", "angP", ...pts("O", "A", "B", "P")],
      "base",
    ),
    ...tone(["arcAB", "angO"], "given"),
    ...tones,
  },
  alt: "A round hall. The stage is arc AB. One spotlight is at the centre O with a 100° beam; another is on the wall at P.",
});

/* ---------- Check ---------- */

function check(seed: number): Question[] {
  const r = rng(seed);
  return [
    {
      id: "s3-reason",
      kind: "choice",
      reasonIds: ["r6"],
      skill: "direction",
      given: "O is the centre. ∠AOB and ∠APB stand on the same arc AB.",
      prompt:
        "You want to write: ∠AOB = 2 × ∠APB. Which reason do you put in the brackets?",
      figure: standard("", "", tone(["arcAB"], "given")),
      options: reasonOptions(
        r,
        "r6",
        ["r7", "r8"],
        "One angle is at the centre and one is at the circumference, on the same arc.",
      ),
    },
    asQuestion("s3-double", ["r6"], "double", doubleOrHalf(whole(r, 1, 1e6))),
    {
      id: "s3-slip",
      kind: "choice",
      reasonIds: ["r6"],
      skill: "double",
      given:
        "O is the centre. The angle at the circumference is 50°. Tom writes: angle at the centre = 25°.",
      prompt: "What went wrong?",
      figure: standard("?", "50°", tone(["angP"], "given")),
      options: shuffle(r, [
        {
          text: "He halved. The angle at the centre is the bigger one: 100°.",
          good: true,
          why: "Centre = 2 × circumference. The centre angle is always the bigger one.",
        },
        {
          text: "Nothing. 25° is right.",
          why: "The angle at the centre is the bigger of the two.",
        },
        {
          text: "The two angles should be equal: 50°.",
          why: "Equal angles are both on the circle. Here one is at the centre.",
        },
      ]),
    },
    asQuestion("s3-reflex", ["r6"], "reflex", reflexCase(whole(r, 1, 1e6))),
    asQuestion(
      "s3-chase",
      ["r6"],
      "angleChase",
      isoscelesThenHalf(whole(r, 1, 1e6)),
    ),
  ];
}

/* ---------- The station ---------- */

const picture = standard("2θ", "θ", {
  ...tone(["arcAB", "angP"], "given"),
  ...tone(["angO"], "get"),
});

export const s3: Station = {
  id: "centre",
  n: 3,
  title: "Angle at the centre",
  family: "double",
  reasonIds: ["r6"],
  idea: "Same arc: the centre angle is double.",
  pictures: { r6: picture },
  steps: {
    wonder: [
      {
        id: "hall",
        kind: "story",
        title: "Two spotlights, one stage",
        text: [
          "A round hall has a stage along the wall from A to B.",
          "A spotlight at the centre O needs a beam 100° wide to light the whole stage.",
          "A second spotlight is fixed on the wall at P. It must light the same stage.",
        ],
        figure: hall(),
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "How wide must the beam at P be?",
        figure: hall(),
        options: [
          { text: "100°, the same.", why: "" },
          { text: "50°, half as wide.", why: "" },
          { text: "200°, twice as wide.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "copies",
        kind: "hands",
        title: "Two copies of one angle",
        need: ["a paper circle", "thin paper to trace on", "a pencil"],
        todo: [
          "Fold the circle in half twice to find the centre O.",
          "Mark A and B on the edge. Join OA and OB: this is the angle at the centre.",
          "Mark P on the big arc. Join PA and PB: this is the angle at the circumference.",
          "Trace the angle at P twice on thin paper. Cut out the two copies.",
          "Lay both copies side by side with their corners at O.",
        ],
        look: "Do the two copies fill the angle at the centre exactly?",
      },
      {
        id: "name",
        kind: "pick",
        prompt: "Two angles stand on arc AB. Tap the angle at the centre.",
        figure: hall({ angO: "base", angP: "base" }),
        spots: [
          { id: "edge", p: { x: 200, y: 108 }, label: "1" },
          { id: "centre", p: { x: 200, y: 222 }, label: "2" },
          { id: "arc", p: { x: 200, y: 310 }, label: "3" },
        ],
        answer: "centre",
        why: {
          edge: "This angle has its corner at P, on the circle. It is the angle at the circumference.",
          arc: "This is arc AB. Both angles stand on it.",
          centre: "Its corner is at O, the centre.",
        },
        after:
          "The angle at the centre has its corner at O. The angle at the circumference has its corner on the circle. Follow the arms of each: both end at A and B, so both stand on arc AB.",
      },
      {
        id: "drag",
        kind: "explore",
        recall: "guess",
        reasonId: "r6",
        title: "Compare the two angles",
        todo: "Drag P along the big arc. A and B stay still.",
        watch: "Watch ∠APB and ∠AOB under the circle.",
        options: [
          {
            text: "The two angles are always equal.",
            why: "Read the two numbers. One is bigger.",
          },
          {
            text: "∠AOB is always double ∠APB.",
            good: true,
            why: "On the same arc, the angle at the centre is twice the angle at the circumference.",
          },
          {
            text: "∠AOB is always 60° more than ∠APB.",
            why: "Drag A to change the arc, then compare again.",
          },
        ],
        after:
          "Same arc: the angle at the centre is twice the angle at the circumference. This will be reason 16.6.",
      },
      {
        id: "reflex",
        kind: "choice",
        prompt:
          "Now P is on the small arc, and ∠APB = 110°. Which angle at O is double it?",
        figure: reflexFigure("110°", "?", ""),
        options: [
          {
            text: "The reflex angle at O, 220°.",
            good: true,
            why: "∠APB stands on the big arc, so its centre angle is the reflex one.",
          },
          {
            text: "The small angle at O.",
            why: "The small angle faces the small arc, where P is. An angle stands on the arc opposite its corner.",
          },
          {
            text: "No angle at O is double it.",
            why: "Go all the way round the outside of O.",
          },
        ],
        after:
          "Always check which arc the angle stands on: the arc that does not contain its corner.",
      },
    ],
    prove: [{ id: "p166", kind: "script", script: proof166 }],
    remember: [
      {
        id: "card",
        kind: "card",
        title: "The centre is the big one",
        reasonIds: ["r6"],
        body: [
          "Two angles on the same arc: one at the centre, one at the circumference.",
          "To find the angle at the centre, double. To find the angle at the circumference, halve.",
          "In the reason, ⊙ce is short for circumference.",
        ],
        figure: picture,
      },
      {
        id: "build",
        kind: "tiles",
        reasonId: "r6",
        prompt: "Build the reason for this picture.",
        figure: picture,
        tiles: ["∠ at centre", "twice", "∠ at ⊙ce"],
        extras: ["half", "equal to"],
        hint: "Start with the big one: the ∠ at centre is twice the ∠ at ⊙ce.",
      },
      {
        id: "double",
        kind: "choice",
        prompt:
          "The angle at the circumference is 35°. The angle at the centre on the same arc is…",
        figure: standard("?", "35°", tone(["angP"], "given")),
        options: [
          { text: "17.5°", why: "The centre angle is the bigger one. Double." },
          {
            text: "35°",
            why: "They are equal only if both are on the circle.",
          },
          { text: "70°", good: true, why: "Centre = 2 × circumference." },
        ],
      },
      {
        id: "half",
        kind: "choice",
        prompt:
          "The angle at the centre is 130°. The angle at the circumference on the same arc is…",
        figure: standard("130°", "?", tone(["angO"], "given")),
        options: [
          { text: "65°", good: true, why: "Circumference = centre ÷ 2." },
          {
            text: "260°",
            why: "The angle on the circle is the smaller one. Halve.",
          },
          { text: "130°", why: "They are not equal: one is at the centre." },
        ],
      },
      {
        id: "pen",
        kind: "story",
        title: "Pen and paper",
        text: [
          "Cover the screen and say the reason.",
          "Write it in your exercise book, with the symbol ⊙ce.",
          "Check it, then tap Next.",
        ],
      },
    ],
    use: [
      { id: "w1", kind: "script", script: workedDouble },
      { id: "n1", kind: "number", make: doubleOrHalf },
      { id: "w2", kind: "script", script: workedReflex },
      { id: "n2", kind: "number", make: reflexCase },
      { id: "n3", kind: "number", make: isoscelesThenHalf },
    ],
  },
  check,
  more: [
    "Move P very close to A. Is the angle at the centre still double? Try it in Explore with 'Centre and circumference angles'.",
    "What happens to the angle at P when AB becomes a diameter? You will meet this in Station 5.",
  ],
};
