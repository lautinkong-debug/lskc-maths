import { polynomialSource, type Coefficients } from "./algebra";
import type { Question } from "./questions";

/** Stable for a question, but with a different correct letter across questions. */
export function answerChoices(question: Question): Coefficients[] {
  let seed = 2166136261;
  for (const character of question.id) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const random = () => {
    seed += 0x6d2b79f5;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffle = (values: Coefficients[]) => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  const options: Coefficients[] = [[...question.answer]];
  const seen = new Set([polynomialSource(question.answer)]);
  const add = (answer: Coefficients) => {
    const source = polynomialSource(answer);
    if (seen.has(source) || options.length === 4) return;
    seen.add(source);
    options.push([...answer]);
  };
  // Use the engine's modelled errors first so their specific feedback applies.
  question.mistakes.forEach((mistake) => add(mistake.answer));
  const candidates: Coefficients[] = [];
  const linear = [
    "collect-linear",
    "subtract-linear",
    "distribute-number",
  ].includes(question.template);
  for (let i = linear ? 1 : 0; i < 3; i++) {
    // Sign reversal, a missing term, and a nearby arithmetic error.
    for (const coefficient of [
      -question.answer[i],
      0,
      question.answer[i] + 1,
      question.answer[i] - 1,
    ]) {
      const candidate: Coefficients = [...question.answer];
      candidate[i] = coefficient;
      candidates.push(candidate);
    }
  }
  shuffle(candidates).forEach(add);
  return shuffle(options);
}
