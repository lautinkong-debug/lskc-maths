/** Literal transcription of the owner's supplied solution PDF, in printed reading order. */
export type TextbookStep = {
  /** Part marker or introductory sentence, in the textbook's wording. */
  heading?: string;
  /** One or more printed mathematical lines. Each entry is KaTeX, without $ delimiters. */
  math?: string[];
  /** Printed prose where the step is not an equation. */
  text?: string;
  /** Printed reason only. An absent reason stays blank; never generate one. */
  reason?: string;
  /** Geometry referred to by this step, using source point names. */
  highlights: {
    angles?: string[];
    sides?: string[];
    figures?: string[];
    points?: string[];
  };
  /** Similarity conclusion (allows the default reveal to stop before subsequent calculations). */
  conclusion?: boolean;
};
export type TextbookSolution = {
  /** A confirmed issue in the printed source, kept separate from its literal solution. */
  sourceNote?: string;
  /** 1-based PDF page numbers, including continuations. */
  pages: number[];
  /** Number of steps initially shown. Subsequent steps are teacher-controlled reveals. */
  initialVisible: number;
  steps: TextbookStep[];
};
