/** Original extension questions. Answers were calculated separately by hand.
 * Small bases and cancellable factors keep the focus on order and signs.
 */
export type ChallengeQuestion = {
  id: string;
  exercise: "challenge";
  question: number;
  part: "";
  level: 1 | 2;
  expression: string;
  answer: string;
};

const questions: [expression: string, answer: string][] = [
  ["(-3/4)^2+5/8÷(-5/2)", "5/16"],
  ["(-2/3)^3×(-3)^3÷6+1/6", "3/2"],
  ["3/5-(-1/2)^4×8", "1/10"],
  ["(-1/3)^3×3^4-(-1/2)^5×16", "-5/2"],
  ["-2^4×3/8+(-3/2)^2", "-15/4"],
  ["[(-3/2)^2-5/4]÷(-2/3)", "-3/2"],
  ["(-3)^3÷9×[3/4-(-1/2)^2]+1/3", "-7/6"],
  ["[1/2-(-1/2)^3]÷5/8-(-1/3)^2", "8/9"],
  ["(-3)^4×(-2/3)^2÷(-12)+(-1/2)^3", "-25/8"],
  ["[(-1/2)^4-3/16]×(-2)^5", "4"],
  ["[(-3/4)^2-1/16]/[1/2-(-1/4)]", "2/3"],
  ["[(-3)^3+3^3×5/6]/[(-1/2)^2-3/4]", "9"],
  ["(-1 1/2)^2-[2/3-(-1/3)^3]×9/2", "-11/12"],
  ["[(-1/2)^5+3/32]÷[(-3/4)^2-1/16]", "1/8"],
  ["-(2/3)^2+[(-1/2)^3+5/8]÷(-3/2)", "-7/9"],
  ["[(-3)^3×(2/3)^3+1]/[(-1/2)^4+1/16]", "-56"],
  ["[3/4-(-1/2)^2]^3÷(-1/8)+2/3", "-1/3"],
  ["[(-3)^4×2/9-5/2]/[(-1/2)^3-3/8]", "-31"],
  ["[(-1/2)^5÷(-1/4)^2+2/3]×(-3)^5÷27", "-3/2"],
  ["[(-3/2)^2-(-1/2)^3]/[(-1/2)^4+1/8]-(-2)^5÷3", "70/3"],
];

export const challengeQuestions: ChallengeQuestion[] = questions.map(
  ([expression, answer], index) => ({
    id: `C-${index + 1}`,
    exercise: "challenge",
    question: index + 1,
    part: "",
    level: index < 10 ? 1 : 2,
    expression,
    answer,
  }),
);
