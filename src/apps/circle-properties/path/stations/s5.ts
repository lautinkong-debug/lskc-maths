/**
 * Station 5: the angle in a semi-circle and its converse (16.8, 16.9).
 * Proofs follow Book 5A pp. 16.21–16.22: a diameter makes 180° at the centre,
 * and half of 180° is 90°.
 */
import {
  CENTRE as O,
  RADIUS,
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

const A = on(180),
  B = on(0),
  C = on(65);

function semi(tones: Tones, alt: string, extra: El[] = []): Figure {
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "arcAB", t: "arc", from: 180, to: 360 },
      { id: "tri", t: "tri", pts: [A, B, C] },
      { id: "AB", t: "seg", a: A, b: B },
      { id: "CA", t: "seg", a: C, b: A },
      { id: "CB", t: "seg", a: C, b: B },
      { id: "sqC", t: "sq", a: A, v: C, b: B },
      { id: "angO", t: "ang", a: B, v: O, b: A, r: 24, label: "180°", lr: 44 },
      ...point("O", O, 0, -18),
      ...point("A", A),
      ...point("B", B),
      ...point("C", C),
      ...extra,
    ],
    tones: {
      ...tone(["circle", "AB", "CA", "CB", ...pts("A", "B", "C")], "base"),
      ...tones,
    },
    alt,
  };
}
const diameterGiven = tone(["AB", ...pts("O")], "given");

/* ---------- Proofs ---------- */

const proof168: Script = {
  kind: "proof",
  title: "Why is 16.8 always true?",
  reasonId: "r8",
  know: "AB is a diameter. C is on the circle.",
  want: "∠ACB = 90°",
  figure: semi(
    diameterGiven,
    "AB is a diameter of the circle and C is a point on the circle.",
  ),
  steps: [
    {
      say: "A diameter passes through the centre. So A, O and B lie on one straight line.",
      line: "∠AOB = ___ (AOB is a st. line)",
      blank: fill("180°", ["90°", "360°"], {
        "90°": "A straight line makes a half turn.",
        "360°": "360° is a full turn. A straight line is half of that.",
      }),
      show: { ...tone(["angO"], "given"), ...tone(["arcAB"], "base") },
      focus: ["angO"],
    },
    {
      say: "∠ACB stands on the bottom arc AB. The angle at the centre on that arc is this 180°.",
      line: "∠ACB = ½ × ∠AOB (___)",
      blank: fill(label("r6"), [label("r7"), "∠ sum of △"], {
        [label("r7")]:
          "That reason compares two angles on the circle. Here one is at the centre.",
        "∠ sum of △":
          "We are comparing an angle at the circumference with the angle at the centre.",
      }),
      focus: ["angO", "CA", "CB"],
    },
    {
      say: "Half of a straight angle.",
      line: "∠ACB = ½ × 180° = ___",
      blank: fill("90°", ["180°", "45°"], {
        "180°": "Halve it.",
        "45°": "Half of 180°, not half of 90°.",
      }),
      show: tone(["sqC"], "get"),
      focus: ["sqC"],
    },
  ],
  moral:
    "A diameter makes a straight angle of 180° at the centre. Half of 180° is 90°. So every angle in a semi-circle is a right angle.",
};

const proof169: Script = {
  kind: "proof",
  title: "Why is 16.9 always true?",
  reasonId: "r9",
  know: "A, B and C are on the circle. ∠ACB = 90°.",
  want: "AB is a diameter.",
  figure: semi(
    tone(["sqC"], "given"),
    "A, B and C are on a circle, and angle ACB is a right angle.",
  ),
  steps: [
    {
      say: "∠ACB stands on arc AB. Think about the angle at the centre O on the same arc.",
      line: "∠AOB = 2 × ∠ACB (___)",
      blank: fill(label("r6"), [label("r8"), label("r7")], {
        [label("r8")]:
          "That reason starts with a diameter. A diameter is what we want to prove.",
        [label("r7")]:
          "That reason compares two angles on the circle. Here one is at the centre.",
      }),
      show: tone([...pts("O"), "arcAB"], "base"),
      focus: ["sqC", "pt-O"],
    },
    {
      say: "Double the right angle.",
      line: "∠AOB = 2 × 90° = ___",
      blank: fill("180°", ["90°", "45°"], {
        "90°": "Double it.",
        "45°": "Double, do not halve.",
      }),
      show: tone(["angO"], "get"),
      focus: ["angO"],
    },
    {
      say: "An angle of 180° is a straight line. So A, O and B are in one line: AB passes through the centre.",
      line: "AOB is a straight line, so AB is a ___.",
      blank: fill("diameter", ["radius", "chord that misses O"], {
        radius: "A radius stops at the centre. AB goes right across.",
        "chord that misses O": "We have just shown that O is on AB.",
      }),
      show: tone(["AB"], "get"),
      focus: ["AB"],
    },
  ],
  moral:
    "A right angle at the circumference needs 180° at the centre. So its chord passes through the centre: it is a diameter.",
};

/* ---------- Worked examples ---------- */

const workedAngle: Script = {
  kind: "worked",
  title: "Example 1: a diameter is given",
  reasonId: "r8",
  know: "AB is a diameter. ∠ABC = 27°.",
  want: "x = ∠BAC",
  figure: semi(
    { ...diameterGiven, ...tone(["angB"], "given"), ...tone(["angA"], "base") },
    "AB is a diameter. Angle ABC is 27 degrees.",
    [
      { id: "angB", t: "ang", a: A, v: B, b: C, r: 40, label: "27°", lr: 62 },
      { id: "angA", t: "ang", a: B, v: A, b: C, r: 34, label: "x", lr: 52 },
    ],
  ),
  steps: [
    {
      say: "A diameter is given. What does it give at C?",
      line: "∠ACB = 90° (___)",
      blank: fill(label("r8"), [label("r9"), label("r7")], {
        [label("r9")]:
          "The converse starts with a right angle. Here the diameter is given.",
        [label("r7")]: "That reason compares two angles on the same arc.",
      }),
      show: tone(["sqC"], "get"),
      focus: ["AB", "sqC"],
    },
    {
      say: "Now the three angles of triangle ABC add up to 180°.",
      line: "x = 180° − 90° − 27° = ___ (∠ sum of △)",
      blank: fill("63°", ["153°", "27°"], {
        "153°": "Take away the right angle at C as well.",
        "27°": "x and 27° together make 90°.",
      }),
      show: tone(["angA"], "get"),
      tool: "sum",
    },
  ],
  moral:
    "See a diameter: mark the right angle on the circle at once. Then the triangle is easy.",
};

const workedConverse: Script = {
  kind: "worked",
  title: "Example 2: a right angle is given",
  reasonId: "r9",
  know: "A, B and C are on the circle. ∠ACB = 90°, AC = 8 cm and BC = 6 cm.",
  want: "The radius of the circle",
  figure: semi(
    { ...tone(["sqC", "lenAC", "lenBC"], "given") },
    "Angle ACB is a right angle. AC is 8 cm and BC is 6 cm.",
    [note("lenAC", 140, 104, "8 cm"), note("lenBC", 318, 104, "6 cm")],
  ),
  steps: [
    {
      say: "A right angle on the circle is given. What does it tell us about AB?",
      line: "∵ ∠ACB = 90° (given) ∴ AB is a diameter (___)",
      blank: fill(label("r9"), [label("r8"), label("r3")], {
        [label("r8")]:
          "That reason starts with a diameter. Here we start with the right angle.",
        [label("r3")]:
          "That reason is about a chord and its perpendicular bisector.",
      }),
      show: { ...tone(["AB"], "get"), ...tone(pts("O"), "base") },
      focus: ["AB"],
    },
    {
      say: "AB is the longest side of the right-angled triangle ABC.",
      line: "AB = √(8² + 6²) = ___ cm (Pyth. theorem)",
      blank: fill("10", ["14", "100"], {
        "14": "Square, add, then take the square root.",
        "100": "Take the square root: √100.",
      }),
      tool: "pyth",
    },
    {
      say: "The radius is half of the diameter.",
      line: "radius = 10 ÷ 2 = ___ cm",
      blank: fill("5", ["10", "20"], {
        "10": "10 cm is the diameter.",
        "20": "Half, not double.",
      }),
    },
  ],
  moral:
    "A right angle on the circle tells you its chord is a diameter. That is the converse: right angle first, diameter second.",
};

/* ---------- Numbers ---------- */

function rawAngleInSemi(seed: number): NumberQuestion {
  const a = whole(rng(seed), 21, 68);
  return {
    given: `AB is a diameter. ∠ABC = ${a}°.`,
    prompt: "∠BAC = x°. Find x.",
    figure: semi(
      {
        ...diameterGiven,
        ...tone(["angB"], "given"),
        ...tone(["angA"], "base"),
      },
      "AB is a diameter. Angle ABC is marked.",
      [
        {
          id: "angB",
          t: "ang",
          a: A,
          v: B,
          b: C,
          r: 40,
          label: `${a}°`,
          lr: 62,
        },
        { id: "angA", t: "ang", a: B, v: A, b: C, r: 34, label: "x°", lr: 54 },
      ],
    ),
    answer: 90 - a,
    unit: "°",
    hints: [
      "A diameter is given. Which angle is 90°?",
      "∠ACB = 90° (∠ in semi-circle).",
      `The angles of △ABC add up to 180°: x + 90 + ${a} = 180.`,
    ],
    solution: [
      "∠ACB = 90° (∠ in semi-circle)",
      `x = 180 − 90 − ${a} = ${90 - a} (∠ sum of △)`,
    ],
    slips: [
      {
        value: 180 - a,
        why: "You forgot the right angle at C. A diameter gives ∠ACB = 90°.",
      },
      {
        value: a,
        why: "∠BAC and ∠ABC are different angles. Together they make 90°.",
      },
    ],
  };
}

function rawSemiPythagoras(seed: number): NumberQuestion {
  const [p, q, c] = pick(rng(seed), triples);
  return {
    given: `AB is a diameter. AB = ${c} cm and AC = ${p} cm.`,
    prompt: "BC = x cm. Find x.",
    figure: semi(
      {
        ...diameterGiven,
        ...tone(["lenAB", "lenAC"], "given"),
        ...tone(["lenBC"], "base"),
      },
      "AB is a diameter. The lengths AB and AC are given.",
      [
        note("lenAB", 200, 206, `${c} cm`),
        note("lenAC", 136, 104, `${p} cm`),
        note("lenBC", 318, 104, "x cm"),
      ],
    ),
    answer: q,
    unit: "cm",
    hints: [
      "A diameter is given. Which angle is 90°?",
      "∠ACB = 90°, so AB is the longest side of △ABC.",
      `x² + ${p}² = ${c}².`,
    ],
    solution: [
      "∠ACB = 90° (∠ in semi-circle)",
      `x = √(${c}² − ${p}²) = ${q} (Pyth. theorem)`,
    ],
    slips: [
      {
        value: Math.sqrt(c * c + p * p),
        why: "AB is the longest side, opposite the right angle at C. Subtract.",
      },
      { value: c - p, why: "Use Pythagoras: square the lengths first." },
    ],
  };
}

function rawConverseRadius(seed: number): NumberQuestion {
  const [p, q, c] = pick(
    rng(seed),
    triples.filter(([, , third]) => third % 2 === 0),
  );
  return {
    given: `A, B and C are on a circle. ∠ACB = 90°, AC = ${p} cm and BC = ${q} cm.`,
    prompt: "The radius is x cm. Find x.",
    figure: semi(
      tone(["sqC", "lenAC", "lenBC"], "given"),
      "Angle ACB is a right angle. The lengths AC and BC are given.",
      [note("lenAC", 136, 104, `${p} cm`), note("lenBC", 318, 104, `${q} cm`)],
    ),
    answer: c / 2,
    unit: "cm",
    hints: [
      "A right angle on the circle is given. What is AB?",
      `AB is a diameter. AB = √(${p}² + ${q}²).`,
      `AB = ${c} cm. The radius is half of it.`,
    ],
    solution: [
      "∵ ∠ACB = 90° (given)",
      "∴ AB is a diameter (converse of ∠ in semi-circle)",
      `AB = √(${p}² + ${q}²) = ${c} cm (Pyth. theorem)`,
      `x = ${c} ÷ 2 = ${tidy(c / 2)}`,
    ],
    slips: [
      { value: c, why: "That is the diameter AB. The radius is half of it." },
    ],
  };
}

export const angleInSemi = (seed: number) => sound(rawAngleInSemi(seed));
export const semiPythagoras = (seed: number) => sound(rawSemiPythagoras(seed));
export const converseRadius = (seed: number) => sound(rawConverseRadius(seed));

/* ---------- Wonder and Discover figures ---------- */

const seats = [on(140), on(88), on(40)];
const theatre: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "AB", t: "seg", a: A, b: B },
    ...seats.flatMap((p, i): El[] => [
      { id: `a${i}`, t: "seg", a: p, b: A },
      { id: `b${i}`, t: "seg", a: p, b: B },
      { id: `ang${i}`, t: "ang", a: A, v: p, b: B, r: 22, label: "?", lr: 40 },
    ]),
    ...point("O", O, 0, 22),
    ...point("A", A),
    ...point("B", B),
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
        ...pts("A", "B"),
      ],
      "base",
    ),
    ...tone(["AB", ...pts("O")], "given"),
  },
  alt: "A round hall. The stage AB is a diameter. Three seats on the wall each look at both ends of the stage.",
};

const CM = RADIUS / 10;
function slidingChord(d: number): Figure {
  const y = O.y + d * CM,
    half = Math.sqrt(100 - d * d) * CM;
  const P = { x: O.x - half, y },
    Q = { x: O.x + half, y },
    top = on(100);
  const right = d < 0.01;
  return {
    els: [
      { id: "circle", t: "circle" },
      { id: "AB", t: "seg", a: P, b: Q },
      { id: "CA", t: "seg", a: top, b: P },
      { id: "CB", t: "seg", a: top, b: Q },
      { id: "angC", t: "ang", a: P, v: top, b: Q, r: 30 },
      { id: "sqC", t: "sq", a: P, v: top, b: Q },
      ...point("O", O, 0, -18),
      ...point("A", P),
      ...point("B", Q),
      ...point("C", top),
    ],
    tones: {
      ...tone(["circle", "CA", "CB", ...pts("O", "A", "B", "C")], "base"),
      ...tone(["AB"], "given"),
      ...(right ? tone(["sqC"], "get") : tone(["angC"], "base")),
    },
    alt: `Chord AB is ${d} cm from the centre. C is a point on the circle above it.`,
  };
}

const kA = on(205),
  kB = on(335);
const notDiameter: Figure = {
  els: [
    { id: "circle", t: "circle" },
    { id: "AB", t: "seg", a: kA, b: kB },
    { id: "CA", t: "seg", a: C, b: kA },
    { id: "CB", t: "seg", a: C, b: kB },
    { id: "angC", t: "ang", a: kA, v: C, b: kB, r: 30, label: "?", lr: 48 },
    ...point("O", O, 0, -18),
    ...point("A", kA),
    ...point("B", kB),
    ...point("C", C),
  ],
  tones: tone(
    ["circle", "AB", "CA", "CB", "angC", ...pts("O", "A", "B", "C")],
    "base",
  ),
  alt: "Chord AB does not pass through the centre O. C is a point on the circle.",
};

/* ---------- Check ---------- */

const directionItems = [
  {
    id: "r8",
    other: "r9",
    given: "AB is a diameter. C is on the circle.",
    want: "∠ACB = 90°",
    figure: semi(diameterGiven, "AB is a diameter and C is on the circle."),
    why: "The diameter is given. The right angle is what you get.",
  },
  {
    id: "r9",
    other: "r8",
    given: "A, B and C are on the circle. ∠ACB = 90°.",
    want: "AB is a diameter.",
    figure: semi(tone(["sqC"], "given"), "Angle ACB is a right angle."),
    why: "The right angle is given. The diameter is what you get: use the converse.",
  },
];

function check(seed: number): Question[] {
  const r = rng(seed);
  const [first, second] = shuffle(r, directionItems);
  const direction = (
    item: (typeof directionItems)[number],
    n: number,
  ): Question => ({
    id: `s5-direction-${n}`,
    kind: "choice",
    reasonIds: [item.id],
    skill: "direction",
    given: item.given,
    prompt: `You want to write: ${item.want} Which reason do you put in the brackets?`,
    figure: item.figure,
    options: reasonOptions(r, item.id, [item.other, "r7"], item.why),
  });
  return [
    direction(first, 1),
    direction(second, 2),
    asQuestion("s5-angle", ["r8"], "angleChase", angleInSemi(whole(r, 1, 1e6))),
    {
      id: "s5-trap",
      kind: "choice",
      reasonIds: ["r8"],
      skill: "diameter",
      given:
        "AB is a chord that does not pass through the centre O. C is on the circle.",
      prompt: "Can you write ∠ACB = 90° (∠ in semi-circle)?",
      figure: notDiameter,
      options: shuffle(r, [
        {
          text: "No. AB is not a diameter.",
          good: true,
          why: "The reason needs a diameter: a chord through O.",
        },
        {
          text: "Yes. C is on the circle.",
          why: "C on the circle is not enough. AB must pass through O.",
        },
        {
          text: "Yes. Every angle at the circumference is 90°.",
          why: "Only an angle standing on a diameter is 90°.",
        },
      ]),
    },
    r() < 0.5
      ? asQuestion(
          "s5-length",
          ["r8"],
          "pythagoras",
          semiPythagoras(whole(r, 1, 1e6)),
        )
      : asQuestion(
          "s5-length",
          ["r9"],
          "diameter",
          converseRadius(whole(r, 1, 1e6)),
        ),
  ];
}

/* ---------- The station ---------- */

const picture168 = semi(
  { ...diameterGiven, ...tone(["sqC"], "get") },
  "16.8: the diameter is given, and the right angle follows.",
);
const picture169 = semi(
  { ...tone(["sqC"], "given"), ...tone(["AB", ...pts("O")], "get") },
  "16.9: the right angle is given, and AB is a diameter.",
);

export const s5: Station = {
  id: "semicircle",
  n: 5,
  title: "Angle in a semi-circle",
  family: "double",
  reasonIds: ["r8", "r9"],
  idea: "Diameter ⇄ right angle.",
  pictures: { r8: picture168, r9: picture169 },
  steps: {
    wonder: [
      {
        id: "theatre",
        kind: "story",
        title: "The best seat in the house",
        text: [
          "A round hall has a stage AB right across the middle: AB is a diameter.",
          "You sit anywhere on the curved wall and look at the two ends of the stage.",
        ],
        figure: theatre,
      },
      {
        id: "guess",
        kind: "choice",
        guess: true,
        prompt: "What is the angle between your two lines of sight?",
        figure: theatre,
        options: [
          { text: "It depends on the seat.", why: "" },
          { text: "Always 60°.", why: "" },
          { text: "Always 90°.", why: "" },
          { text: "Always 180°.", why: "" },
        ],
      },
    ],
    discover: [
      {
        id: "corner",
        kind: "hands",
        title: "The corner of a sheet of paper",
        need: ["a paper circle", "a sheet of A4 paper", "a pencil"],
        todo: [
          "Fold the circle in half and open it. The fold AB is a diameter.",
          "The corner of the A4 sheet is a right angle. Put the corner on the edge of the circle.",
          "Turn the sheet until one of its edges passes through A.",
          "Look at where the other edge of the sheet goes.",
          "Move the corner to another point on the edge and try again.",
        ],
        look: "Where does the second edge of the sheet always pass?",
      },
      {
        id: "drag",
        kind: "explore",
        recall: "guess",
        reasonId: "r8",
        title: "Start with a diameter",
        todo: "AB is a diameter: it passes through O. Drag C round the circle.",
        watch: "Watch ∠ACB under the circle.",
        options: [
          {
            text: "It is 90° only at the top.",
            why: "Drag C near A and read the angle again.",
          },
          {
            text: "It gets bigger as C moves towards A.",
            why: "Read the angle after each drag.",
          },
          {
            text: "It is always 90°.",
            good: true,
            why: "A diameter always makes a right angle at the circumference.",
          },
        ],
        after:
          "A diameter makes a right angle at every point of the circle. This will be reason 16.8: ∠ in semi-circle.",
      },
      {
        id: "slide",
        kind: "slide",
        title: "What if AB is not a diameter?",
        todo: "The radius is 10 cm. Slide chord AB away from the centre, then back to it.",
        label: "Distance of AB from O",
        min: 0,
        max: 6,
        start: 4,
        step: 0.5,
        figure: slidingChord,
        readout: (d) => [
          { label: "Distance", value: `${tidy(d)} cm` },
          {
            label: "∠ACB",
            value: `${((Math.acos(d / 10) * 180) / Math.PI).toFixed(1)}°`,
          },
        ],
        options: [
          {
            text: "∠ACB is always 90°.",
            why: "Slide AB away from O and read the angle.",
          },
          {
            text: "∠ACB is 90° only when AB passes through O.",
            good: true,
            why: "No diameter, no right angle.",
          },
          { text: "∠ACB is never 90°.", why: "Slide the distance to 0 cm." },
        ],
        after:
          "Before you write '∠ in semi-circle', check that the chord is a diameter. It also works backwards: a right angle on the circle tells you its chord is a diameter.",
      },
    ],
    prove: [
      { id: "p168", kind: "script", script: proof168 },
      { id: "p169", kind: "script", script: proof169 },
    ],
    remember: [
      {
        id: "pair",
        kind: "card",
        title: "One picture, two directions",
        reasonIds: ["r8", "r9"],
        body: [
          "A diameter and a right angle on the circle always come together.",
          "Have the diameter, get 90°: ∠ in semi-circle. Have 90°, get the diameter: the converse.",
        ],
      },
      {
        id: "build-168",
        kind: "tiles",
        reasonId: "r8",
        prompt: "The diameter is given. Build the reason.",
        figure: picture168,
        tiles: ["∠ in", "semi-circle"],
        extras: ["converse of", "the same segment"],
        hint: "The diameter cuts the circle into two semi-circles. The angle is in one of them.",
      },
      {
        id: "build-169",
        kind: "tiles",
        reasonId: "r9",
        prompt: "Now the right angle is given. Build the reason.",
        figure: picture169,
        tiles: ["converse of", "∠ in", "semi-circle"],
        extras: ["the same segment", "at centre"],
        hint: "It is the same reason backwards. Start with the words 'converse of'.",
      },
      {
        id: "which",
        kind: "choice",
        prompt:
          "A question says: '∠ACB = 90°'. You want to write 'AB is a diameter'. Which reason?",
        figure: semi(tone(["sqC"], "given"), "Angle ACB is a right angle."),
        options: [
          {
            text: label("r8"),
            why: "That one starts with the diameter. Here the diameter is what you want.",
          },
          {
            text: label("r9"),
            good: true,
            why: "You have the right angle. You get the diameter.",
          },
          {
            text: label("r7"),
            why: "That one compares two angles on the same arc.",
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
      { id: "w1", kind: "script", script: workedAngle },
      { id: "n1", kind: "number", make: angleInSemi },
      { id: "n2", kind: "number", make: semiPythagoras },
      { id: "w2", kind: "script", script: workedConverse },
      { id: "n3", kind: "number", make: converseRadius },
    ],
  },
  check,
  more: [
    "Lay the corner of a set square on the edge of a plate. Where do its two sides cross the edge? Use this to find the centre of the plate.",
    "Where must C be for triangle ABC to have the biggest area? Try it in Explore with 'Angle in a semicircle'.",
  ],
};
