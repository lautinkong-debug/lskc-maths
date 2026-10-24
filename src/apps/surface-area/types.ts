export type Point = { x: number; y: number };
export type Boundary = {
  points: Point[];
  /** Original vertex letters, when printed. Otherwise leave absent. */
  vertexNames?: string[];
  /** Original unknowns, e.g. "x cm". Numeric givens can be left automatic. */
  edgeLabels?: (string | null)[];
  measurements?: { a: Point; b: Point; label: string }[];
};
export type PrismGeometry = {
  kind: "prism";
  outer: Boundary;
  holes?: Boundary[];
  height: number;
  heightLabel?: string;
  heightName?: string;
  /** Full tank context; height above remains the wet depth (or new wet band). */
  water?: {
    tankHeight?: number;
    initialDepth?: number;
    initialLabel?: string;
    contents?: "stones" | "balls";
    closed?: boolean;
    afterRotation?: boolean;
  };
  /** Use when only P is supplied. Individual edge dimensions are not implied. */
  perimeterGiven?: number;
  schematic?: boolean;
  baseArea: number;
  /** Source-supplied rounded area can intentionally differ from exact geometry. */
  areaIsGiven?: boolean;
  baseCount: 0 | 1 | 2;
  /** Zero-based indices in outer edges followed by hole edges. */
  omittedEdges?: number[];
};
export type CubeGeometry = {
  kind: "cubes";
  cubes: { side: number; origin: [number, number, number] }[];
  contacts: { cubes: [number, number]; area: number }[];
};
export type SurfaceVariant = {
  id: string;
  label: string;
  unit: "cm" | "mm" | "m";
  target: "total" | "lateral" | "wetted" | "increase" | "composite";
  geometry: PrismGeometry | CubeGeometry;
  /** Additional source givens, safe to show before revealing any working. */
  givens?: string[];
  /** Source context and any choice of prism axis/opening. */
  note?: string;
  baseWorking?: string;
  /** Independently authored intermediate working, checked against the key. */
  working: string[];
  answer: string;
  expected: { perimeter?: number; lateralArea?: number; surfaceArea: number };
};
export type SurfaceQuestion = {
  id: string;
  section: string;
  label: string;
  page: number;
  prompt: string;
  variants: SurfaceVariant[];
};
