export type Point = { x: number; y: number; label: string };
export type Shape = { name: string; vertices: string[] };
/** Coordinates and crop [left, top, right, bottom] use fractions of the full textbook page (top-left origin).
 * Source outlines are traced, not measured; similarity is established by givens.
 */
export type SourceQuestion = {
  id: string;
  group:
    | "Quick Practice"
    | "Exercise 8A"
    | "Exercise 8B"
    | "Exercise 8C"
    | "Exercise 8D"
    | "Revision Exercise 8";
  number: string;
  page: number;
  crop: [number, number, number, number];
  points: Point[];
  shapes: Shape[];
  prompt: string;
  proof: string[];
  result: string;
  /** A teaching diagram constructed from the givens where the book prints no figure. */
  constructed?: boolean;
  /** false for counterexamples or problems that do not assert similarity. */
  similar?: boolean;
};
