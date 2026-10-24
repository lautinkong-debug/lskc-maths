import {
  collect,
  groupedSource,
  polynomialSource,
  polynomialTerms,
  sameAnswer,
  termSource,
  termsSource,
  type Coefficients,
  type Term,
} from "./algebra";

export type Stage = 0 | 1 | 2 | 3;
export type Reason =
  | "group"
  | "collect"
  | "signs"
  | "distribute"
  | "products"
  | "square"
  | "expand";
export type Hint = "like" | "subtract" | "expand" | "mixed";
export type Misconception = "partial-sign" | "missing-middle";
export type Grid = { left: string[]; right: string[]; products: string[][] };
export type Question = {
  id: string;
  source: string;
  answer: Coefficients;
  template: string;
  hint: Hint;
  steps: { source: string; reason: Reason }[];
  grid?: Grid;
  mistakes: { answer: Coefficients; kind: Misconception }[];
};

function random(seed: number) {
  let n = seed >>> 0;
  return () => {
    n += 0x6d2b79f5;
    let t = Math.imul(n ^ (n >>> 15), 1 | n);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(stage: Stage, round: number, seed: number): Question {
  const rng = random((seed + round * 7919 + stage * 65537) >>> 0);
  const n = (max = 9) => (rng() < 0.5 ? -1 : 1) * (1 + Math.floor(rng() * max));
  const q: Question = {
    id: `${stage}-${round}-${seed >>> 0}`,
    source: "",
    answer: [0, 0, 0],
    template: "",
    hint: ["like", "subtract", "expand", "mixed"][stage] as Hint,
    steps: [],
    mistakes: [],
  };
  const finish = (terms: Term[]) => {
    q.answer = collect(terms);
    q.steps.push(
      { source: groupedSource(terms), reason: "group" },
      { source: polynomialSource(q.answer), reason: "collect" },
    );
    q.mistakes = q.mistakes.filter((m) => !sameAnswer(m.answer, q.answer));
    return q;
  };
  if (stage === 0) {
    const a = n(),
      b = n(),
      c = n(),
      d = n(),
      e = n(),
      f = n();
    const terms: Term[] =
      round < 2
        ? [
            [a, 1],
            [b, 0],
            [c, 1],
            [d, 0],
          ]
        : [
            [a, 2],
            [b, 1],
            [c, 0],
            [round >= 4 ? -a : d, 2],
            [e, 1],
            [round === 5 ? -c : f, 0],
          ];
    q.template =
      round < 2
        ? "collect-linear"
        : round < 4
          ? "collect-quadratic"
          : "cancellation";
    q.source = termsSource(terms);
    return finish(terms);
  }
  if (stage === 1) {
    const left: Coefficients = [round < 2 ? 0 : n(), n(), n()];
    const right: Coefficients = [round < 2 ? 0 : n(), -Math.abs(n()), n()];
    q.template = round < 2 ? "subtract-linear" : "subtract-quadratic";
    q.source = `(${polynomialSource(left)})-(${polynomialSource(right)})`;
    const signs = polynomialTerms(right).map(([c, p]) => [-c, p] as Term);
    const terms = [...polynomialTerms(left), ...signs];
    q.steps.push({ source: termsSource(terms), reason: "signs" });
    const first = right.findIndex((v) => v !== 0);
    q.mistakes.push({
      kind: "partial-sign",
      answer: left.map(
        (v, i) => v + (i === first ? -right[i] : right[i]),
      ) as Coefficients,
    });
    return finish(terms);
  }
  const a = n(5),
    b = n(5),
    c = n(5),
    d = n(5);
  let left: Term[] = [
      [a, 1],
      [b, 0],
    ],
    right: Term[] = [
      [c, 1],
      [d, 0],
    ];
  let prefix: Term[] = [],
    subtract: Term[] = [];
  let square = false;
  if (stage === 2) {
    q.template = [
      "distribute-number",
      "distribute-x",
      "product",
      "product",
      "square",
      "square",
    ][round];
    if (round < 2) left = [[round === 0 && a === 1 ? 2 : a, round]];
    if (round >= 4) {
      right = left.map((t) => [...t] as Term);
      square = true;
    }
  } else {
    q.template =
      round < 2 ? "product-subtract" : round < 4 ? "outside-square" : "mixed";
    if (round < 2)
      subtract = [
        [n(), 1],
        [n(), 0],
      ];
    else if (round < 4) {
      prefix = [[n(), 2]];
      right = left.map((t) => [...t] as Term);
      square = true;
    } else {
      prefix = [
        [n(), 2],
        [n(), 1],
      ];
      left = [[a === 1 ? 2 : a, 0]];
    }
  }
  const negativeProduct = q.template === "outside-square";
  const rawProducts = left.flatMap(([lc, lp]) =>
    right.map(([rc, rp]) => [lc * rc, lp + rp] as Term),
  );
  const productExpression = `(${termsSource(left)})*(${termsSource(right)})`;
  const displayedProduct = square
    ? `(${termsSource(left)})^2`
    : productExpression;
  const surround = (inner: string) =>
    `${prefix.length ? termsSource(prefix) + (negativeProduct ? "-" : "+") : ""}(${inner})${subtract.length ? `-(${termsSource(subtract)})` : ""}`;
  q.source = surround(displayedProduct);
  if (square)
    q.steps.push({ source: surround(productExpression), reason: "square" });
  q.grid = {
    left: left.map(termSource),
    right: right.map(termSource),
    products: left.map(([lc, lp]) =>
      right.map(([rc, rp]) => termSource([lc * rc, lp + rp])),
    ),
  };
  q.steps.push({
    source: surround(termsSource(rawProducts)),
    reason: "products",
  });
  const terms: Term[] = [
    ...prefix,
    ...rawProducts.map(([v, p]) => [negativeProduct ? -v : v, p] as Term),
    ...subtract.map(([v, p]) => [-v, p] as Term),
  ];
  if (negativeProduct || subtract.length)
    q.steps.push({ source: termsSource(terms), reason: "signs" });
  const answer = collect(terms);
  if (square)
    q.mistakes.push({
      kind: "missing-middle",
      answer: [answer[0], collect(prefix)[1], answer[2]],
    });
  return finish(terms);
}

export function generateQuestion(
  stage: Stage,
  round: number,
  seed: number,
  previousSource?: string,
): Question {
  if (
    !Number.isInteger(stage) ||
    stage < 0 ||
    stage > 3 ||
    !Number.isInteger(round) ||
    round < 0 ||
    round > 5
  )
    throw new Error("Invalid quest stage/round");
  for (let attempt = 0; attempt < 1024; attempt++) {
    const q = make(stage, round, (seed + attempt) >>> 0);
    if (q.source !== previousSource && q.answer.every((v) => Math.abs(v) <= 99))
      return q;
  }
  throw new Error("Question generation exhausted");
}
