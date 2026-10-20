import type { Point, Shape } from "../similarity/types";
import type { TextbookStep } from "../similarity/textbook-types";

export type CongruenceGroup =
  | "Quick Practice"
  | "Exercise 5A"
  | "Exercise 5B"
  | "Exercise 5C"
  | "Revision Exercise 5";

/** Source coordinates are pixels on a 1225 × 1617 rendering of the supplied PDF.
 * Tracings preserve the source illustration; they are not measurements or proof.
 */
export type CongruenceQuestion = {
  id: string;
  group: CongruenceGroup;
  number: string;
  page: number;
  crop: [number, number, number, number];
  points: Point[];
  shapes: Shape[];
  prompt: string;
  solutionPages: number[];
  steps: TextbookStep[];
  rightAngles?: string[];
  constructed?: boolean;
  sourceNote?: string;
};
