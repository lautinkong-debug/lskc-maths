import { copy } from "@/lib/copy";

export type Skill = "terms" | "mixed" | "indices";
export type Collection = "exercise" | "quick" | "revision";
export type QuestionSource = {
  collection: Collection;
  page: string;
  answerPage: string;
  level: 1 | 2;
};
export type Rule = keyof typeof copy.algebraSimplification.rules;
export type Feedback = keyof typeof copy.algebraSimplification.feedback;
export type Expression = { tex: string; exact: string };
export type Step = Expression & { rule: Rule };
export type Choice = Expression & { id: string; feedback?: Feedback };
export type Question = QuestionSource & {
  id: string;
  ref: string;
  skill: Skill;
  original: Expression;
  answer: Expression;
  steps: Step[];
  choices: Choice[];
};

type Pair = [tex: string, exact: string];
type Working = [tex: string, exact: string, rule: Rule];
type Wrong = [tex: string, exact: string, feedback: Feedback];
function question(
  ref: string,
  skill: Skill,
  original: Pair,
  answer: Pair,
  working: Working[],
  wrong: Wrong[],
  source: QuestionSource = {
    collection: "exercise",
    page: "3.14",
    answerPage: "3.52",
    level: 1,
  },
): Question {
  const expr = ([tex, exact]: Pair): Expression => ({ tex, exact });
  const steps = working.map(([tex, exact, rule]) => ({ tex, exact, rule }));
  return {
    ...source,
    id: `${{ exercise: "3A", quick: "QP", revision: "R3" }[source.collection]}-${ref}`,
    ref,
    skill,
    original: expr(original),
    answer: expr(answer),
    steps: [...steps, { ...expr(answer), rule: "finish" }],
    choices: [
      { ...expr(answer), id: "correct" },
      ...wrong.map(([tex, exact, feedback], i) => ({
        tex,
        exact,
        feedback,
        id: `wrong-${i}`,
      })),
      { ...steps[0], id: "unfinished", feedback: "unfinished" },
    ],
  };
}

const quick11: QuestionSource = {
  collection: "quick",
  page: "3.11",
  answerPage: "3.52",
  level: 1,
};
const quick12: QuestionSource = { ...quick11, page: "3.12" };
const revision40: QuestionSource = {
  collection: "revision",
  page: "3.40",
  answerPage: "3.54",
  level: 1,
};
const revision42: QuestionSource = { ...revision40, page: "3.42", level: 2 };

/** Questions retain printed notation; each source and answer page is recorded. */
export const questions: Question[] = [
  question(
    "7(a)",
    "terms",
    ["4a+3a", "4*a+3*a"],
    ["7a", "7*a"],
    [["(4+3)a", "(4+3)*a", "coefficients"]],
    [
      ["7a^2", "7*a^2", "additionPower"],
      ["12a", "12*a", "addNotMultiply"],
    ],
  ),
  question(
    "7(b)",
    "terms",
    ["5b-9b", "5*b-9*b"],
    ["-4b", "-4*b"],
    [["(5-9)b", "(5-9)*b", "coefficients"]],
    [
      ["4b", "4*b", "sign"],
      ["-14b", "-14*b", "sign"],
    ],
  ),
  question(
    "7(c)",
    "terms",
    ["3z+z-2z", "3*z+z-2*z"],
    ["2z", "2*z"],
    [["(3+1-2)z", "(3+1-2)*z", "impliedOne"]],
    [
      ["z", "z", "coefficientOne"],
      ["2z^3", "2*z^3", "additionPower"],
    ],
  ),
  question(
    "7(d)",
    "terms",
    ["5y-3y+y", "5*y-3*y+y"],
    ["3y", "3*y"],
    [["(5-3+1)y", "(5-3+1)*y", "impliedOne"]],
    [
      ["y", "y", "sign"],
      ["2y", "2*y", "coefficientOne"],
    ],
  ),
  question(
    "7(e)",
    "terms",
    ["2p+p-4p", "2*p+p-4*p"],
    ["-p", "-p"],
    [
      ["(2+1-4)p", "(2+1-4)*p", "impliedOne"],
      ["-1p", "-1*p", "calculate"],
    ],
    [
      ["p", "p", "sign"],
      ["-2p", "-2*p", "coefficientOne"],
    ],
  ),
  question(
    "7(f)",
    "terms",
    ["2q-6q-q", "2*q-6*q-q"],
    ["-5q", "-5*q"],
    [["(2-6-1)q", "(2-6-1)*q", "impliedOne"]],
    [
      ["-3q", "-3*q", "sign"],
      ["-4q", "-4*q", "coefficientOne"],
    ],
  ),
  question(
    "8(a)",
    "terms",
    ["4x-x+5", "4*x-x+5"],
    ["3x+5", "3*x+5"],
    [["(4-1)x+5", "(4-1)*x+5", "constants"]],
    [
      ["8x", "8*x", "constant"],
      ["5x+5", "5*x+5", "sign"],
    ],
  ),
  question(
    "8(b)",
    "terms",
    ["2s+3s+2-4", "2*s+3*s+2-4"],
    ["5s-2", "5*s-2"],
    [["(2+3)s+(2-4)", "(2+3)*s+(2-4)", "constants"]],
    [
      ["3s", "3*s", "constant"],
      ["5s+2", "5*s+2", "sign"],
    ],
  ),
  question(
    "8(c)",
    "terms",
    ["a+a+a-b", "a+a+a-b"],
    ["3a-b", "3*a-b"],
    [["(1+1+1)a-b", "(1+1+1)*a-b", "unlike"]],
    [
      ["2ab", "2*a*b", "unlike"],
      ["a^3-b", "a^3-b", "additionPower"],
    ],
  ),
  question(
    "8(d)",
    "terms",
    ["p-p+q+q", "p-p+q+q"],
    ["2q", "2*q"],
    [
      ["(1-1)p+(1+1)q", "(1-1)*p+(1+1)*q", "group"],
      ["0p+2q", "0*p+2*q", "cancel"],
    ],
    [
      ["2p+2q", "2*p+2*q", "sign"],
      ["q^2", "q^2", "additionPower"],
    ],
  ),
  question(
    "9(a)",
    "mixed",
    ["2\\times6y\\div3", "2*6*y/3"],
    ["4y", "4*y"],
    [["12y\\div3", "12*y/3", "leftToRight"]],
    [
      ["12y", "12*y", "order"],
      ["36y", "36*y", "order"],
    ],
  ),
  question(
    "9(b)",
    "mixed",
    ["15m\\div5\\times2n", "15*m/5*2*n"],
    ["6mn", "6*m*n"],
    [
      ["3m\\times2n", "3*m*2*n", "leftToRight"],
      ["(3\\times2)mn", "(3*2)*m*n", "numbersLetters"],
    ],
    [
      ["\\frac{3m}{2n}", "3*m/(2*n)", "order"],
      ["6m", "6*m", "product"],
    ],
  ),
  question(
    "9(c)",
    "mixed",
    ["4\\times3x+2x", "4*3*x+2*x"],
    ["14x", "14*x"],
    [
      ["12x+2x", "12*x+2*x", "order"],
      ["(12+2)x", "(12+2)*x", "coefficients"],
    ],
    [
      ["20x", "20*x", "order"],
      ["14x^2", "14*x^2", "additionPower"],
    ],
  ),
  question(
    "9(d)",
    "mixed",
    ["7k-2k\\times3", "7*k-2*k*3"],
    ["k", "k"],
    [
      ["7k-6k", "7*k-6*k", "order"],
      ["(7-6)k", "(7-6)*k", "coefficients"],
    ],
    [
      ["15k", "15*k", "order"],
      ["-k", "-k", "sign"],
    ],
  ),
  question(
    "10(a)",
    "indices",
    ["4\\times2a\\times a", "4*2*a*a"],
    ["8a^2", "8*a^2"],
    [
      ["(4\\times2)\\times a\\times a", "(4*2)*a*a", "numbersLetters"],
      ["8\\times a^2", "8*a^2", "powers"],
    ],
    [
      ["8a", "8*a", "powers"],
      ["6a^2", "6*a^2", "product"],
    ],
  ),
  question(
    "10(b)",
    "indices",
    ["m\\times m\\times(-n)\\times n", "m*m*(-n)*n"],
    ["-m^2n^2", "-m^2*n^2"],
    [
      ["-(m\\times m)\\times(n\\times n)", "-(m*m)*(n*n)", "negative"],
      ["-m^2\\times n^2", "-m^2*n^2", "powers"],
    ],
    [
      ["m^2n^2", "m^2*n^2", "sign"],
      ["-2mn", "-2*m*n", "powers"],
    ],
  ),
  question(
    "10(c)",
    "indices",
    ["2\\times3b\\times5b", "2*3*b*5*b"],
    ["30b^2", "30*b^2"],
    [
      [
        "(2\\times3\\times5)\\times b\\times b",
        "(2*3*5)*b*b",
        "numbersLetters",
      ],
      ["30\\times b^2", "30*b^2", "powers"],
    ],
    [
      ["30b", "30*b", "powers"],
      ["10b^2", "10*b^2", "product"],
    ],
  ),
  question(
    "10(d)",
    "indices",
    ["z\\times2z\\times6z", "z*2*z*6*z"],
    ["12z^3", "12*z^3"],
    [
      [
        "(1\\times2\\times6)\\times z\\times z\\times z",
        "(1*2*6)*z*z*z",
        "numbersLetters",
      ],
      ["12\\times z^3", "12*z^3", "powers"],
    ],
    [
      ["12z^2", "12*z^2", "powers"],
      ["9z^3", "9*z^3", "product"],
    ],
  ),
];

// Quick Practice 3.4-3.6, pp. 3.11-3.12; printed answers p. 3.52.
questions.push(
  question(
    "3.4(a)",
    "terms",
    ["2+4p-p-p", "2+4*p-p-p"],
    ["2+2p", "2+2*p"],
    [["2+(4-1-1)p", "2+(4-1-1)*p", "impliedOne"]],
    [
      ["2+4p", "2+4*p", "sign"],
      ["4p", "4*p", "constant"],
    ],
    quick11,
  ),
  question(
    "3.4(b)",
    "terms",
    ["3p+2q-2p-q", "3*p+2*q-2*p-q"],
    ["p+q", "p+q"],
    [
      ["(3-2)p+(2-1)q", "(3-2)*p+(2-1)*q", "group"],
      ["1p+1q", "1*p+1*q", "calculate"],
    ],
    [
      ["2pq", "2*p*q", "unlike"],
      ["p+3q", "p+3*q", "sign"],
    ],
    quick11,
  ),
  question(
    "3.5(a)",
    "mixed",
    ["12x\\div4-x", "12*x/4-x"],
    ["2x", "2*x"],
    [
      ["3x-x", "3*x-x", "order"],
      ["(3-1)x", "(3-1)*x", "impliedOne"],
    ],
    [
      ["3x", "3*x", "coefficientOne"],
      ["\\frac{11x}{4}", "11*x/4", "order"],
    ],
    quick11,
  ),
  question(
    "3.5(b)",
    "mixed",
    ["6p+2p\\div2\\times3", "6*p+2*p/2*3"],
    ["9p", "9*p"],
    [
      ["6p+p\\times3", "6*p+p*3", "leftToRight"],
      ["6p+3p", "6*p+3*p", "order"],
    ],
    [
      ["12p", "12*p", "order"],
      ["\\frac{19p}{3}", "19*p/3", "leftToRight"],
    ],
    quick11,
  ),
  question(
    "3.6(a)",
    "indices",
    ["4\\times d\\times2d\\times d", "4*d*2*d*d"],
    ["8d^3", "8*d^3"],
    [
      [
        "(4\\times2)\\times d\\times d\\times d",
        "(4*2)*d*d*d",
        "numbersLetters",
      ],
      ["8\\times d^3", "8*d^3", "powers"],
    ],
    [
      ["8d^2", "8*d^2", "powers"],
      ["6d^3", "6*d^3", "product"],
    ],
    quick12,
  ),
  question(
    "3.6(b)",
    "indices",
    ["y\\times y\\times(-y)\\times(-y)\\times z", "y*y*(-y)*(-y)*z"],
    ["y^4z", "y^4*z"],
    [
      [
        "(y\\times y)\\times(y\\times y)\\times z",
        "(y*y)*(y*y)*z",
        "twoNegatives",
      ],
      ["y^4\\times z", "y^4*z", "powers"],
    ],
    [
      ["-y^4z", "-y^4*z", "negativeProduct"],
      ["y^2z", "y^2*z", "powers"],
    ],
    quick12,
  ),

  // Revision Exercise 3 Q3-6, p. 3.40; printed answers p. 3.54.
  question(
    "3(a)",
    "terms",
    ["2a+a-2", "2*a+a-2"],
    ["3a-2", "3*a-2"],
    [["(2+1)a-2", "(2+1)*a-2", "impliedOne"]],
    [
      ["a", "a", "constant"],
      ["2a-2", "2*a-2", "coefficientOne"],
    ],
    revision40,
  ),
  question(
    "3(b)",
    "terms",
    ["y-2y+3y", "y-2*y+3*y"],
    ["2y", "2*y"],
    [["(1-2+3)y", "(1-2+3)*y", "impliedOne"]],
    [
      ["6y", "6*y", "sign"],
      ["y", "y", "coefficientOne"],
    ],
    revision40,
  ),
  question(
    "3(c)",
    "terms",
    ["10-c+2c+8c", "10-c+2*c+8*c"],
    ["10+9c", "10+9*c"],
    [["10+(-1+2+8)c", "10+(-1+2+8)*c", "constants"]],
    [
      ["10+11c", "10+11*c", "sign"],
      ["19c", "19*c", "constant"],
    ],
    revision40,
  ),
  question(
    "4(a)",
    "terms",
    ["2x+1-5x+3", "2*x+1-5*x+3"],
    ["-3x+4", "-3*x+4"],
    [["(2-5)x+(1+3)", "(2-5)*x+(1+3)", "constants"]],
    [
      ["3x+4", "3*x+4", "sign"],
      ["x", "x", "constant"],
    ],
    revision40,
  ),
  question(
    "4(b)",
    "terms",
    ["-4b-4a+7b+a", "-4*b-4*a+7*b+a"],
    ["3b-3a", "3*b-3*a"],
    [["(-4+7)b+(-4+1)a", "(-4+7)*b+(-4+1)*a", "group"]],
    [
      ["3b-5a", "3*b-5*a", "sign"],
      ["0", "0", "unlike"],
    ],
    revision40,
  ),
  question(
    "4(c)",
    "terms",
    ["6b+1-(3b-b)", "6*b+1-(3*b-b)"],
    ["4b+1", "4*b+1"],
    [
      ["6b+1-(3-1)b", "6*b+1-(3-1)*b", "brackets"],
      ["6b+1-2b", "6*b+1-2*b", "brackets"],
      ["(6-2)b+1", "(6-2)*b+1", "group"],
    ],
    [
      ["2b+1", "2*b+1", "bracketSign"],
      ["8b+1", "8*b+1", "sign"],
    ],
    revision40,
  ),
  question(
    "5(a)",
    "mixed",
    ["-3+3\\times a+8", "-3+3*a+8"],
    ["3a+5", "3*a+5"],
    [
      ["-3+3a+8", "-3+3*a+8", "order"],
      ["3a+(-3+8)", "3*a+(-3+8)", "constants"],
    ],
    [
      ["3a+11", "3*a+11", "sign"],
      ["8a", "8*a", "constant"],
    ],
    revision40,
  ),
  question(
    "5(b)",
    "mixed",
    ["3b\\times2-2\\times4b", "3*b*2-2*4*b"],
    ["-2b", "-2*b"],
    [
      ["6b-8b", "6*b-8*b", "order"],
      ["(6-8)b", "(6-8)*b", "coefficients"],
    ],
    [
      ["2b", "2*b", "sign"],
      ["14b", "14*b", "sign"],
    ],
    revision40,
  ),
  question(
    "5(c)",
    "mixed",
    ["5+2\\times12q\\div6", "5+2*12*q/6"],
    ["5+4q", "5+4*q"],
    [["5+24q\\div6", "5+24*q/6", "leftToRight"]],
    [
      ["14q", "14*q", "order"],
      ["9q", "9*q", "constant"],
    ],
    revision40,
  ),
  question(
    "6(a)",
    "indices",
    ["(-a)\\times(-2a)", "(-a)*(-2*a)"],
    ["2a^2", "2*a^2"],
    [
      ["2\\times a\\times a", "2*a*a", "twoNegatives"],
      ["2\\times a^2", "2*a^2", "powers"],
    ],
    [
      ["-2a^2", "-2*a^2", "negativeProduct"],
      ["2a", "2*a", "powers"],
    ],
    revision40,
  ),
  question(
    "6(b)",
    "indices",
    ["k\\times3k\\times4k\\times2", "k*3*k*4*k*2"],
    ["24k^3", "24*k^3"],
    [
      [
        "(3\\times4\\times2)\\times k\\times k\\times k",
        "(3*4*2)*k*k*k",
        "numbersLetters",
      ],
      ["24\\times k^3", "24*k^3", "powers"],
    ],
    [
      ["24k^4", "24*k^4", "powers"],
      ["9k^3", "9*k^3", "product"],
    ],
    revision40,
  ),
  question(
    "6(c)",
    "indices",
    ["2y\\times y\\times z\\div4\\times y", "2*y*y*z/4*y"],
    ["\\frac{y^3z}{2}", "y^3*z/2"],
    [
      ["\\frac{2y^2z}{4}\\times y", "(2*y^2*z)/4*y", "leftToRight"],
      ["\\frac{y^2z}{2}\\times y", "(y^2*z)/2*y", "reduceFraction"],
      ["\\frac{y^2\\times y\\times z}{2}", "y^2*y*z/2", "powers"],
    ],
    [
      ["\\frac{yz}{2}", "y*z/2", "leftToRight"],
      ["\\frac{y^2z}{2}", "y^2*z/2", "powers"],
    ],
    revision40,
  ),

  // Revision Exercise 3 Q28-29, p. 3.42 (Level 2); answers p. 3.54.
  question(
    "28(a)",
    "indices",
    ["(a+a)(a+a+a)", "(a+a)*(a+a+a)"],
    ["6a^2", "6*a^2"],
    [
      ["2a\\times3a", "2*a*3*a", "brackets"],
      ["(2\\times3)\\times a\\times a", "(2*3)*a*a", "numbersLetters"],
    ],
    [
      ["5a", "5*a", "bracketProduct"],
      ["6a", "6*a", "powers"],
    ],
    revision42,
  ),
  question(
    "28(b)",
    "mixed",
    ["(2w-4w)\\div2+5w", "(2*w-4*w)/2+5*w"],
    ["4w", "4*w"],
    [
      ["(-2w)\\div2+5w", "(-2*w)/2+5*w", "brackets"],
      ["-w+5w", "-w+5*w", "order"],
      ["(-1+5)w", "(-1+5)*w", "coefficients"],
    ],
    [
      ["6w", "6*w", "sign"],
      ["\\frac{3w}{2}", "3*w/2", "order"],
    ],
    revision42,
  ),
  question(
    "28(c)",
    "mixed",
    ["6x\\div3-3x\\times(-2)", "6*x/3-3*x*(-2)"],
    ["8x", "8*x"],
    [
      ["2x-(-6x)", "2*x-(-6*x)", "order"],
      ["2x+6x", "2*x+6*x", "subtractNegative"],
      ["(2+6)x", "(2+6)*x", "coefficients"],
    ],
    [
      ["-4x", "-4*x", "subtractNegative"],
      ["-2x", "-2*x", "order"],
    ],
    revision42,
  ),
  question(
    "29(a)",
    "mixed",
    ["14+3a\\div3-a-8", "14+3*a/3-a-8"],
    ["6", "6"],
    [
      ["14+a-a-8", "14+a-a-8", "order"],
      ["14+(1-1)a-8", "14+(1-1)*a-8", "cancel"],
      ["14-8", "14-8", "cancel"],
    ],
    [
      ["6a", "6*a", "constant"],
      ["2a+3", "2*a+3", "divisionSymbol"],
    ],
    revision42,
  ),
  question(
    "29(b)",
    "mixed",
    ["y-2y\\times2+6y-3", "y-2*y*2+6*y-3"],
    ["3y-3", "3*y-3"],
    [
      ["y-4y+6y-3", "y-4*y+6*y-3", "order"],
      ["(1-4+6)y-3", "(1-4+6)*y-3", "coefficients"],
    ],
    [
      ["5y-3", "5*y-3", "order"],
      ["11y-3", "11*y-3", "sign"],
    ],
    revision42,
  ),
  question(
    "29(c)",
    "mixed",
    ["5a-2b-2a\\times4+3b", "5*a-2*b-2*a*4+3*b"],
    ["-3a+b", "-3*a+b"],
    [
      ["5a-2b-8a+3b", "5*a-2*b-8*a+3*b", "order"],
      ["(5-8)a+(-2+3)b", "(5-8)*a+(-2+3)*b", "group"],
    ],
    [
      ["-3a+5b", "-3*a+5*b", "sign"],
      ["12a+b", "12*a+b", "order"],
    ],
    revision42,
  ),
);

export function selectQuestions(
  collection: Collection | "all",
  skill: Skill | "all",
): Question[] {
  return questions.filter(
    (q) =>
      (collection === "all" || q.collection === collection) &&
      (skill === "all" || q.skill === skill),
  );
}

/** Repeatable per-session shuffle; classroom scores are outside this local app. */
export function choicesFor(question: Question, seed: number): Choice[] {
  let state = seed >>> 0;
  for (const char of question.id)
    state = (Math.imul(state, 31) + char.charCodeAt(0)) >>> 0;
  const choices = [...question.choices];
  for (let i = choices.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

export type RecordEntry = {
  attempts: number;
  helped: boolean;
  solved: boolean;
  firstTry: boolean;
};
export type Progress = Record<string, RecordEntry>;
export function recordHelp(progress: Progress, id: string): Progress {
  const entry = progress[id] ?? {
    attempts: 0,
    helped: false,
    solved: false,
    firstTry: false,
  };
  return entry.solved
    ? progress
    : { ...progress, [id]: { ...entry, helped: true } };
}
export function recordAnswer(
  progress: Progress,
  id: string,
  correct: boolean,
): Progress {
  const entry = progress[id] ?? {
    attempts: 0,
    helped: false,
    solved: false,
    firstTry: false,
  };
  if (entry.solved) return progress;
  return {
    ...progress,
    [id]: {
      ...entry,
      attempts: entry.attempts + 1,
      solved: correct,
      firstTry: correct && entry.attempts === 0 && !entry.helped,
    },
  };
}
