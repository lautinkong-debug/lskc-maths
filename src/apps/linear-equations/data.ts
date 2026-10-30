export type Skill = "basic" | "both" | "brackets" | "fractions";
export type Reason =
  | "subtract6"
  | "divideNegative4"
  | "subtract13"
  | "divide3"
  | "subtract5"
  | "divideNegative6"
  | "multiply11"
  | "add1"
  | "divideNegative3"
  | "subtract4"
  | "negate"
  | "addThird"
  | "multiply5"
  | "subtractPoint8"
  | "combine"
  | "subtract4a"
  | "divide2"
  | "subtract4m"
  | "add3"
  | "divide4"
  | "expand"
  | "subtractY"
  | "subtract12"
  | "subtract6a"
  | "subtract9"
  | "divideNegative9"
  | "subtract3q"
  | "divideNegative5"
  | "multiply2"
  | "subtractX"
  | "multiply3"
  | "add4y"
  | "divide10";
export interface Step {
  equation: string;
  reason: Reason;
}
export interface Question {
  id: string;
  exercise: "4A" | "4B";
  number: number;
  page: string;
  skill: Skill;
  variable: string;
  equation: string;
  answer: string;
  steps: Step[];
}
const s = (equation: string, reason: Reason): Step => ({ equation, reason });
// Transcribed visually from the supplied scan, pp. 4.11 and 4.20.
// Answers independently solved, then checked against the printed key, p. 4.40.
export const questions: readonly Question[] = [
  {
    id: "4a-1",
    exercise: "4A",
    number: 1,
    page: "4.11",
    skill: "basic",
    variable: "x",
    equation: "x+6=-11",
    answer: "-17",
    steps: [s("x=-11-6", "subtract6"), s("x=-17", "combine")],
  },
  {
    id: "4a-4",
    exercise: "4A",
    number: 4,
    page: "4.11",
    skill: "basic",
    variable: "b",
    equation: "-4*b=-28",
    answer: "7",
    steps: [s("b=(-28)/(-4)", "divideNegative4"), s("b=7", "combine")],
  },
  {
    id: "4a-10",
    exercise: "4A",
    number: 10,
    page: "4.11",
    skill: "basic",
    variable: "x",
    equation: "3*x+13=25",
    answer: "4",
    steps: [
      s("3*x=25-13", "subtract13"),
      s("3*x=12", "combine"),
      s("x=12/3", "divide3"),
      s("x=4", "combine"),
    ],
  },
  {
    id: "4a-17",
    exercise: "4A",
    number: 17,
    page: "4.11",
    skill: "basic",
    variable: "q",
    equation: "5-6*q=29",
    answer: "-4",
    steps: [
      s("-6*q=29-5", "subtract5"),
      s("-6*q=24", "combine"),
      s("q=24/(-6)", "divideNegative6"),
      s("q=-4", "combine"),
    ],
  },
  {
    id: "4a-19",
    exercise: "4A",
    number: 19,
    page: "4.11",
    skill: "fractions",
    variable: "x",
    equation: "(x-1)/11=2",
    answer: "23",
    steps: [
      s("x-1=22", "multiply11"),
      s("x=22+1", "add1"),
      s("x=23", "combine"),
    ],
  },
  {
    id: "4a-27",
    exercise: "4A",
    number: 27,
    page: "4.11",
    skill: "brackets",
    variable: "c",
    equation: "-3*(4-c)=27",
    answer: "13",
    steps: [
      s("4-c=-9", "divideNegative3"),
      s("-c=-13", "subtract4"),
      s("c=13", "negate"),
    ],
  },
  {
    id: "4a-34",
    exercise: "4A",
    number: 34,
    page: "4.11",
    skill: "fractions",
    variable: "a",
    equation: "a/5-1/3=2/3",
    answer: "5",
    steps: [
      s("a/5=2/3+1/3", "addThird"),
      s("a/5=1", "combine"),
      s("a=5", "multiply5"),
    ],
  },
  {
    id: "4a-38",
    exercise: "4A",
    number: 38,
    page: "4.11",
    skill: "basic",
    variable: "x",
    equation: "0.8+3*x=1.4",
    answer: "1/5",
    steps: [
      s("3*x=1.4-0.8", "subtractPoint8"),
      s("3*x=0.6", "combine"),
      s("x=0.2", "divide3"),
    ],
  },
  {
    id: "4b-1",
    exercise: "4B",
    number: 1,
    page: "4.20",
    skill: "basic",
    variable: "x",
    equation: "3*x+x=12",
    answer: "3",
    steps: [s("4*x=12", "combine"), s("x=3", "divide4")],
  },
  {
    id: "4b-3",
    exercise: "4B",
    number: 3,
    page: "4.20",
    skill: "both",
    variable: "a",
    equation: "6*a=4*a+8",
    answer: "4",
    steps: [
      s("6*a-4*a=8", "subtract4a"),
      s("2*a=8", "combine"),
      s("a=4", "divide2"),
    ],
  },
  {
    id: "4b-7",
    exercise: "4B",
    number: 7,
    page: "4.20",
    skill: "both",
    variable: "m",
    equation: "8*m-3=4*m-5",
    answer: "-1/2",
    steps: [
      s("4*m-3=-5", "subtract4m"),
      s("4*m=-5+3", "add3"),
      s("4*m=-2", "combine"),
      s("m=-1/2", "divide4"),
    ],
  },
  {
    id: "4b-11",
    exercise: "4B",
    number: 11,
    page: "4.20",
    skill: "brackets",
    variable: "y",
    equation: "3*(y+4)=y",
    answer: "-6",
    steps: [
      s("3*y+12=y", "expand"),
      s("2*y+12=0", "subtractY"),
      s("2*y=-12", "subtract12"),
      s("y=-6", "divide2"),
    ],
  },
  {
    id: "4b-13",
    exercise: "4B",
    number: 13,
    page: "4.20",
    skill: "brackets",
    variable: "a",
    equation: "-3*(a-3)=6*a",
    answer: "1",
    steps: [
      s("-3*a+9=6*a", "expand"),
      s("-9*a+9=0", "subtract6a"),
      s("-9*a=-9", "subtract9"),
      s("a=1", "divideNegative9"),
    ],
  },
  {
    id: "4b-18",
    exercise: "4B",
    number: 18,
    page: "4.20",
    skill: "brackets",
    variable: "q",
    equation: "-(2*q-5)=3*q+10",
    answer: "-1",
    steps: [
      s("-2*q+5=3*q+10", "expand"),
      s("-5*q+5=10", "subtract3q"),
      s("-5*q=5", "subtract5"),
      s("q=-1", "divideNegative5"),
    ],
  },
  {
    id: "4b-19",
    exercise: "4B",
    number: 19,
    page: "4.20",
    skill: "fractions",
    variable: "x",
    equation: "(x+3)/2=x",
    answer: "3",
    steps: [
      s("x+3=2*x", "multiply2"),
      s("3=x", "subtractX"),
      s("x=3", "combine"),
    ],
  },
  {
    id: "4b-20",
    exercise: "4B",
    number: 20,
    page: "4.20",
    skill: "fractions",
    variable: "y",
    equation: "(1-4*y)/3=2*y",
    answer: "1/10",
    steps: [
      s("1-4*y=6*y", "multiply3"),
      s("1=10*y", "add4y"),
      s("y=1/10", "divide10"),
    ],
  },
];
export const pilotId = "4b-18";

// A generated retry has its own clear source label and never claims a textbook reference.
export function similarQuestion(original: Question, variant: number): Question {
  const answer = (variant % 7) - 3;
  const a = (variant % 3) + 2;
  const b = (variant % 5) + 1;
  const variable = original.variable;
  let equation = `${a}*${variable}+${b}=${a * answer + b}`;
  // Construct a unique solution for every template, including bracket retries.
  if (original.skill === "brackets")
    equation = `-${a}*(${variable}-${b})=${-a * (answer - b)}`;
  if (original.skill === "both")
    equation = `${a + 1}*${variable}+${b}=${variable}+${a * answer + b}`;
  if (original.skill === "fractions")
    equation = `(${variable}+${b})/${a}=${answer + b}/${a}`;
  return {
    ...original,
    id: `${original.id}-retry-${variant}`,
    equation,
    answer: String(answer),
    steps: [],
  };
}
