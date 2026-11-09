export const circleBisectorsDiagramCopy = {
  title: "Perpendicular bisectors of two chords",
  centreLabel: "Centre O",
  bisectorOf: (chord: string) => `Bisector of ${chord}`,
  traceAction: "Trace the bisectors",
  traceSummary: "Follow the bisector of AB from N to O, then the bisector of CD from M to the same O.",
  given:
    "N is the mid-point of AB and M is the mid-point of CD. Each line is perpendicular to its chord.",
  result: "The two perpendicular bisectors intersect at the centre O.",
  move: "Drag N or M to move its chord. Use the sliders to turn the chords.",
  savedTurn: "CD has been turned so you can see both bisectors.",
  keys: "Left and right turn the chord. Up and down change its length.",
  rotate: (chord: string) => `Turn chord ${chord}`,
  handle: (point: string) => `Move mid-point ${point}`,
};
