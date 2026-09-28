import { decodeSetCode, encodeSetCode, type SetSettings } from "../lib/setCode";
import { generateQuestions, gradeQuestion, type Question } from "../lib/generate";

export const directedNumbersDefinition = {
  slug: "directed-numbers" as const,
  encode: encodeSetCode,
  decode: decodeSetCode,
  generate(code: string): Question[] {
    const settings = decodeSetCode(code);
    if (!settings) throw new Error("That set code is not valid.");
    return generateQuestions(settings);
  },
  grade: gradeQuestion,
};
export type DirectedNumbersSettings = SetSettings;
