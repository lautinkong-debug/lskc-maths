/**
 * Station 4: angles in the same segment (16.7).
 * The proof follows Book 5A p. 16.19: each angle is half of the same angle at
 * the centre.
 */
import {
  CENTRE as O,
  on,
  point,
  pts,
  tone,
  type El,
  type Figure,
  type Pt,
  type Tones,
} from "../figureModel";
import { rng, shuffle, whole } from "../random";
import type { NumberQuestion, Question, Script, Station } from "../types";
import { asQuestion, fill, label, reasonOptions, sound } from "./kit";

/** A point inside the angle at v, on its bisector. Used to place tap targets. */
function inside(v: Pt, a: Pt, b: Pt, d: number): Pt {
  const u = (p: Pt) => {
    const length = Math.hypot(p.x - v.x, p.y - v.y) || 1;
    return { x: (p.x - v.x) / length, y: (p.y - v.y) / length };
  };
  const ua = u(a),
    ub = u(b);
  const length = Math.hypot(ua.x + ub.x, ua.y + ub.y) || 1;
  return {
    x: v.x + ((ua.x + ub.x) / length) * d,
    y: v.y + ((ua.y + ub.y) / length) * d,
  };
}
/** Where lines ab and cd cross. */
function cross(a: Pt, b: Pt, c: Pt, d: Pt): Pt {
  const t =
    ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) /
    ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/* ---------- Two points on the same arc ---------- */

const A = on(205),
  B = on(335),
  P = on(125),
  Q = on(60);
const twoEls: El[] = [
  { id: "circle", t: "circle" },
  { id: "arcAB", t: "arc", from: 205, to: 335 },
  { id: "AB", t: "seg", a: A, b: B, dash: true },
  { id: "PA", t: "seg", a: P, b: A },
  { id: "PB", t: "seg", a: P, b: B },
  { id: "QA", t: "seg", a: Q, b: A },
  { id: "QB", t: "seg", a: Q, b: B },
  { id: "OA", t: "seg", a: O, b: A },
  { id: "OB", t: "seg", a: O, b: B },
  { id: "angP", t: "ang", a: A, v: P, b: B, r: 34 },
  { id: "angQ", t: "ang", a: A, v: Q, b: B, r: 34 },
  { id: "angO", t: "ang", a: A, v: O, b: B, r: 24 },
  ...point("O", O, 0, -20),
  ...point("A", A),
  ...point("B", B),
  ...point("P", P),
  ...point("Q", Q),
];
const twoFrame = [
  "circle",
  "AB",
  "PA",
  "PB",
  "QA",
  "QB",
  ...pts("A", "B", "P", "Q"),
];
const two = (tones: Tones, alt: string): Figure => ({
  els: twoEls,
  tones: { ...tone(twoFrame, "base"), ...tones },
  alt,
});

const proof167: Script = {
  kind: "proof",
  title: "Why is 16.7 always true?",
  reasonId: "r7",
  know: "P and Q are on the circle, on the same side of AB.",
  want: "∠APB = ∠AQB",
  figure: two(
    { ...tone(["arcAB"], "given"), ...tone(["angP", "angQ"], "base") },
    "Angles APB and AQB both stand on arc AB.",
  ),
  steps: [
    {
      say: "Join OA and OB. Now there is an angle at the centre on the same arc AB.",
      line: "Join OA and OB.",
      show: {
        ...tone(["OA", "OB"], "aux"),
        ...tone(["angO", ...pts("O")], "base"),
      },
      focus: ["angO"],
    },
    {
      say: "∠APB stands on arc AB. So it is half of the angle at the centre.",
      line: "∠APB = ½∠AOB (___)",
      blank: fill(label("r6"), ["base ∠s, isos. △", "given"], {
        "base ∠s, isos. △":
          "We are comparing an angle at the circumference with the angle at the centre.",
        given: "It follows from a reason you learnt in Station 3.",
      }),
      focus: ["angP", "angO"],
    },
    {
      say: "∠AQB stands on the same arc AB. So it is half of the same angle.",
      line: "∠AQB = ½ ___ (∠ at centre twice ∠ at ⊙ce)",
      blank: fill("∠AOB", ["∠APB", "∠OAB"], {
        "∠APB": "The reason compares it with the angle at the centre.",
        "∠OAB": "The angle at the centre has its corner at O.",
      }),
      focus: ["angQ", "angO"],
    },
    {
      say: "Both are half of the same angle. So they are equal.",
      line: "∴ ∠APB = ___",
      blank: fill("∠AQB", ["∠AOB", "2∠AQB"], {
        "∠AOB": "Each of them is half of ∠AOB.",
        "2∠AQB":
          "They are both half of the same angle, so neither is double the other.",
      }),
      show: tone(["angP", "angQ"], "get"),
      focus: ["angP", "angQ"],
    },
  ],
  moral:
    "Every angle at the circumference on arc AB is half of the same angle at the centre. So all of them are equal.",
};

/* ---------- The bow-tie: two chords that cross ---------- */

const bA = on(200),
  bB = on(340),
  bC = on(50),
  bD = on(130),
  bE = cross(bA, bC, bB, bD);
function bow(
  marks: { d?: string; c?: string; b?: string; e?: string },
  tones: Tones = {},
): Figure {
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "arcAB", t: "arc", from: 200, to: 340 },
      { id: "AD", t: "seg", a: bA, b: bD },
      { id: "BC", t: "seg", a: bB, b: bC },
      { id: "AC", t: "seg", a: bA, b: bC },
      { id: "BD", t: "seg", a: bB, b: bD },
      { id: "AB", t: "seg", a: bA, b: bB },
      {
        id: "angD",
        t: "ang",
        a: bA,
        v: bD,
        b: bB,
        r: 34,
        label: marks.d,
        lr: 56,
      },
      {
        id: "angC",
        t: "ang",
        a: bA,
        v: bC,
        b: bB,
        r: 34,
        label: marks.c,
        lr: 56,
      },
      {
        id: "angB",
        t: "ang",
        a: bD,
        v: bB,
        b: bC,
        r: 38,
        label: marks.b,
        lr: 62,
      },
      { id: "angA", t: "ang", a: bC, v: bA, b: bB, r: 38 },
      {
        id: "angE",
        t: "ang",
        a: bA,
        v: bE,
        b: bB,
        r: 20,
        label: marks.e,
        lr: 40,
      },
      ...point("A", bA),
      ...point("B", bB),
      ...point("C", bC),
      ...point("D", bD),
      ...point("E", bE, 0, -22),
    ],
    tones: {
      ...tone(
        ["circle", "AD", "BC", "AC", "BD", "AB", ...pts("A", "B", "C", "D")],
        "base",
      ),
      ...tones,
    },
    alt: "Four points A, B, C and D on a circle. Chords AC and BD cross inside the circle.",
  };
}

const worked: Script = {
  kind: "worked",
  title: "Example: find the twin angle",
  reasonId: "r7",
  know: "A, B, C and D are on a circle. ∠ADB = 35°.",
  want: "x = ∠ACB",
  figure: bow(
    { d: "35°", c: "x" },
    { ...tone(["angD"], "given"), ...tone(["angC"], "base") },
  ),
  steps: [
    {
      say: "Follow the arms of the 35° angle from D. They end at A and B. So it stands on arc AB.",
      line: "∠ADB stands on arc ___.",
      blank: fill("AB", ["CD", "AD"], {
        CD: "Follow the two arms from D to their far ends.",
        AD: "D is the corner. The arc is between the far ends of the two arms.",
      }),
      show: tone(["arcAB"], "given"),
      focus: ["angD", "arcAB"],
    },
    {
      say: "Now follow the arms of x from C. They also end at A and B, on the same side of AB.",
      line: "x = ∠ADB (___)",
      blank: fill(label("r7"), [label("r6"), "alt. ∠s"], {
        [label("r6")]:
          "Neither angle is at the centre. Both corners are on the circle.",
        "alt. ∠s": "Alternate angles need parallel lines. There are none here.",
      }),
      focus: ["angC", "angD"],
    },
    {
      say: "Angles in the same segment are equal.",
      line: "x = ___",
      blank: fill("35°", ["70°", "17.5°"], {
        "70°":
          "Doubling is for an angle at the centre. Both of these are on the circle.",
        "17.5°":
          "Halving is for an angle at the centre. Both of these are on the circle.",
      }),
      show: tone(["angC"], "get"),
    },
  ],
  moral:
    "Put a finger on each end of the arc. Two angles whose arms end at the same two points, on the same side, are twins.",
};

/* ---------- Numbers ---------- */

/** One step: spot the equal angle. */
function rawTwin(seed: number): NumberQuestion {
  const a = whole(rng(seed), 24, 68);
  return {
    given: `A, B, C and D are on a circle. ∠ADB = ${a}°.`,
    prompt: "∠ACB = x°. Find x.",
    figure: bow(
      { d: `${a}°`, c: "x°" },
      { ...tone(["angD"], "given"), ...tone(["angC"], "base") },
    ),
    answer: a,
    unit: "°",
    hints: [
      "Follow the arms of each angle. Where do they end?",
      "Both angles stand on arc AB, on the same side of AB.",
    ],
    solution: [`x = ${a} (∠s in the same segment)`],
    slips: [
      {
        value: 2 * a,
        why: "Doubling is for an angle at the centre. Both corners are on the circle.",
      },
      {
        value: a / 2,
        why: "Halving is for an angle at the centre. Both corners are on the circle.",
      },
      {
        value: 180 - a,
        why: "The two angles are on the same side of AB, so they are equal.",
      },
    ],
  };
}

/** Two steps: the equal angle, then the exterior angle of a triangle. */
function rawTwinThenTriangle(seed: number): NumberQuestion {
  const r = rng(seed);
  const a = whole(r, 28, 52),
    b = whole(r, 18, 40);
  return {
    given: `A, B, C and D are on a circle. AC and BD cross at E. ∠ADB = ${a}° and ∠DBC = ${b}°.`,
    prompt: "∠AEB = x°. Find x.",
    figure: bow(
      { d: `${a}°`, b: `${b}°`, e: "x°" },
      {
        ...tone(["angD", "angB"], "given"),
        ...tone(["angE", ...pts("E")], "base"),
      },
    ),
    answer: a + b,
    unit: "°",
    hints: [
      `Which angle at C equals ∠ADB? Both stand on arc AB: ∠ACB = ${a}°.`,
      "Now look at triangle EBC. ∠AEB is its outside angle at E.",
      `x = ${b} + ${a}.`,
    ],
    solution: [
      `∠ACB = ∠ADB = ${a}° (∠s in the same segment)`,
      `x = ${b} + ${a} = ${a + b} (ext. ∠ of △)`,
    ],
    slips: [
      {
        value: 180 - a - b,
        why: "That is ∠BEC, inside triangle EBC. ∠AEB is the outside angle.",
      },
      { value: a, why: `That is ∠ACB. Now use triangle EBC to find ∠AEB.` },
    ],
  };
}

export const twin = (seed: number) => sound(rawTwin(seed));
export const twinThenTriangle = (seed: number) =>
  sound(rawTwinThenTriangle(seed));

/* ---------- Wonder and Discover figures ---------- */

const gA = on(240),
  gB = on(300),
  players = [on(155), on(92), on(35)];
const pitch: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "goal", t: "seg", a: gA, b: gB },
    ...players.flatMap((p, i): El[] => [
      { id: `a${i}`, t: "seg", a: p, b: gA },
      { id: `b${i}`, t: "seg", a: p, b: gB },
      { id: `ang${i}`, t: "ang", a: gA, v: p, b: gB, r: 36 },
    ]),
    ...point("A", gA),
    ...point("B", gB),
    ...point("P", players[0]),
    ...point("Q", players[1]),
    ...point("T", players[2]),
  ],
  tones: {
    ...tone(
      [
        "circle",
        "a0",
        "b0",
        "a1",
        "b1",
        "a2",
        "b2",
        "ang0",
        "ang1",
        "ang2",
        ...pts("A", "B", "P", "Q", "T"),
      ],
      "base",
    ),
    ...tone(["goal"], "given"),
  },
  alt: "A goal AB and three players P, Q and T, all on one circle. Each player looks at both goalposts.",
};

const oQ = on(270);
const otherSide = (tones: Tones = {}): Figure => ({
  els: [
    { id: "circle", t: "circle" },
    { id: "AB", t: "seg", a: A, b: B },
    { id: "PA", t: "seg", a: P, b: A },
    { id: "PB", t: "seg", a: P, b: B },
    { id: "QA", t: "seg", a: oQ, b: A },
    { id: "QB", t: "seg", a: oQ, b: B },
    { id: "angP", t: "ang", a: A, v: P, b: B, r: 34 },
    { id: "angQ", t: "ang", a: A, v: oQ, b: B, r: 26 },
    ...point("A", A),
    ...point("B", B),
    ...point("P", P),
    ...point("Q", oQ),
  ],
  tones: {
    ...tone(
      [
        "circle",
        "AB",
        "PA",
        "PB",
        "QA",
        "QB",
        "angP",
        "angQ",
        ...pts("A", "B", "P", "Q"),
      ],
      "base",
    ),
    ...tones,
  },
  alt: "P is above chord AB and Q is below it. The angles at P and Q stand on different arcs.",
});

/* ---------- Check ---------- */

function check(seed: number): Question[] {
  const r = rng(seed);
  return [
    {
      id: "s4-reason",
      kind: "choice",
      reasonIds: ["r7"],
      skill: "sameSegment",
      given: "P and Q are on the circle, on the same side of chord AB.",
      prompt:
        "You want to write: ∠APB = ∠AQB. Which reason do you put in the brackets?",
      figure: two(
        tone(["angP", "angQ"], "base"),
        "Angles APB and AQB on the same side of AB.",
      ),
      options: reasonOptions(
        r,
        "r7",
        ["r6", "r8"],
        "Both corners are on the circle, on the same arc and the same side.",
      ),
    },
    {
      id: "s4-spot",
      kind: "choice",
      reasonIds: ["r7"],
      skill: "sameSegment",
      given: "A, B, C and D are on a circle.",
      prompt: "Which angle must equal ∠ADB?",
      figure: bow({}, tone(["angD"], "given")),
      options: shuffle(r, [
        {
          text: "∠ACB",
          good: true,
          why: "Both stand on arc AB, on the same side.",
        },
        { text: "∠CAB", why: "∠CAB stands on arc CB, not on arc AB." },
        { text: "∠DBA", why: "∠DBA stands on arc DA, not on arc AB." },
      ]),
    },
    asQuestion("s4-twin", ["r7"], "sameSegment", twin(whole(r, 1, 1e6))),
    {
      id: "s4-trap",
      kind: "choice",
      reasonIds: ["r7"],
      skill: "sameSegment",
      given: "P and Q are on the circle, on opposite sides of chord AB.",
      prompt: "Can you write ∠APB = ∠AQB (∠s in the same segment)?",
      figure: otherSide(),
      options: shuffle(r, [
        {
          text: "No. They are in different segments.",
          good: true,
          why: "The two angles stand on different arcs, so the reason does not apply.",
        },
        {
          text: "Yes. Both stand on chord AB.",
          why: "Same chord is not enough. They must be on the same side of it.",
        },
        {
          text: "Yes. Both corners are on the circle.",
          why: "They must also stand on the same arc.",
        },
      ]),
    },
    asQuestion(
      "s4-chase",
      ["r7"],
      "angleChase",
      twinThenTriangle(whole(r, 1, 1e6)),
    ),
  ];
}

/* ---------- The station ---------- */

const picture = two(
  { ...tone(["arcAB", "angP"], "given"), ...tone(["angQ"], "get") },
  "16.7: two angles on the same arc AB, on the same side, are equal.",
);

export const s4: Station = {
  id: "segment",
  n: 4,
  title: "Angles in the same segment",
  family: "double",
  reasonIds: ["r7"],
  idea: "Same arc, same side: equal angles.",
  pictures: { r7: picture },
  steps: {
    wonder: [
      {
        id: "pitch",
        kind: "story",
        title: "Who has the best shot?",
        text: [
          "AB is a goal. Three players, P, Q and T, stand on a circle that passes through both goalposts.",
          "Each player looks at the two posts. The angle between the two lines of sight is the player's shooting angle.",
        ],
        figure: pitch,
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "Who has the widest shooting angle?",
        figure: pitch,
        options: [
          { text: "Q, straight in front of the goal.", why: "" },
          { text: "P or T, from the side.", why: "" },
          { text: "All three have the same angle.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "trace",
        kind: "hands",
        title: "Slide an angle round the circle",
        need: ["a paper circle", "thin paper to trace on", "a pencil"],
        todo: [
          "Mark A and B on the edge of the circle.",
          "Mark P and Q on the big arc. Join PA, PB, QA and QB.",
          "Trace the angle at P on thin paper.",
          "Slide the tracing along the circle until its corner is at Q.",
        ],
        look: "Does the traced angle fit the angle at Q?",
      },
      {
        id: "drag",
        kind: "explore",
        recall: "guess",
        reasonId: "r7",
        title: "Two points on the same side",
        todo: "Drag P and Q along the circle. They stay on the same side of AB.",
        watch: "Watch ∠APB and ∠AQB under the circle.",
        options: [
          {
            text: "The angle nearer to A is larger.",
            why: "Read the two numbers after each drag.",
          },
          {
            text: "The two angles add up to 180°.",
            why: "Read the two numbers and add them.",
          },
          {
            text: "The two angles are always equal.",
            good: true,
            why: "Same arc AB, same side of AB: equal angles.",
          },
        ],
        after:
          "Angles on the same arc, on the same side of the chord, are equal. This will be reason 16.7. The part of the circle on one side of a chord is called a segment.",
      },
      {
        id: "twin",
        kind: "pick",
        prompt:
          "The blue angle at D stands on arc AB. Tap the angle that must equal it.",
        figure: bow(
          {},
          {
            ...tone(["angD", "arcAB"], "given"),
            ...tone(["angC", "angA", "angB"], "base"),
          },
        ),
        spots: [
          { id: "c", p: inside(bC, bA, bB, 44), label: "1" },
          { id: "a", p: inside(bA, bC, bB, 62), label: "2" },
          { id: "b", p: inside(bB, bD, bC, 40), label: "3" },
        ],
        answer: "c",
        why: {
          c: "Its arms also end at A and B, and it is on the same side of AB.",
          a: "This angle stands on arc CB. Follow its two arms to their ends.",
          b: "This angle stands on arc DC. Follow its two arms to their ends.",
        },
        after:
          "To find a twin angle, follow the two arms to their ends. Twins end at the same two points.",
      },
      {
        id: "other-side",
        kind: "choice",
        prompt:
          "Now Q is on the other side of AB. Is ∠AQB still equal to ∠APB?",
        figure: otherSide(),
        options: [
          {
            text: "No. The two angles are in different segments.",
            good: true,
            why: "Q's angle stands on the big arc and P's on the small arc.",
          },
          {
            text: "Yes. Both stand on chord AB.",
            why: "Look at the picture: the angle at Q is clearly bigger.",
          },
        ],
        after:
          "Same chord is not enough. The two corners must be on the same side of it.",
      },
    ],
    prove: [{ id: "p167", kind: "script", script: proof167 }],
    remember: [
      {
        id: "card",
        kind: "card",
        title: "Same arc, same side",
        reasonIds: ["r7"],
        body: [
          "Two angles on the circle whose arms end at the same two points, on the same side, are equal.",
          "No doubling here: doubling is only for an angle at the centre.",
        ],
        figure: picture,
      },
      {
        id: "build",
        kind: "tiles",
        reasonId: "r7",
        prompt: "Build the reason for this picture.",
        figure: picture,
        tiles: ["∠s in", "the same", "segment"],
        extras: ["semi-circle", "at centre"],
        hint: "It names where the two angles are: ∠s in the same segment.",
      },
      {
        id: "which",
        kind: "choice",
        prompt:
          "Both corners are on the circle and stand on the same arc. Which reason?",
        figure: picture,
        options: [
          { text: label("r6"), why: "That one needs an angle at the centre." },
          {
            text: label("r7"),
            good: true,
            why: "Both angles are at the circumference, in the same segment.",
          },
          { text: label("r8"), why: "That one needs a diameter." },
        ],
      },
      {
        id: "pen",
        kind: "story",
        title: "Pen and paper",
        text: [
          "Cover the screen and say the reason.",
          "Write it in your exercise book without looking.",
          "Check it, then tap Next.",
        ],
      },
    ],
    use: [
      { id: "w1", kind: "script", script: worked },
      { id: "n1", kind: "number", make: twin },
      { id: "n2", kind: "number", make: twinThenTriangle },
    ],
  },
  check,
  more: [
    "Put P and Q on opposite sides of AB. What do the two angles add up to? Try it in Explore with 'Angles in the same segment'.",
    "On a football pitch, where would you stand to get a wider shooting angle than P, Q and T?",
  ],
};
