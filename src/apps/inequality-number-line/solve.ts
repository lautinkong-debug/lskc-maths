export type Relation = "<" | "<=" | ">" | ">=";

export interface Endpoint {
  value: number;
  tex: string;
  included: boolean;
}

export interface WorkingStep {
  kind: "move" | "divide" | "compound";
  tex: string;
}

export interface InequalitySolution {
  kind: "interval" | "point" | "empty";
  tex: string;
  lower: Endpoint | null;
  upper: Endpoint | null;
  steps: WorkingStep[];
  reversed: boolean;
}

const SIMPLE =
  /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)x([+-](?:\d+(?:\.\d+)?|\.\d+))?(<=|>=|<|>)([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/;
const COMPOUND =
  /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(<=|<)x(<=|<)([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/;
const EPS = 1e-9;

export function formatNumber(value: number): string {
  const rounded = Number(value.toFixed(6));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function relationTex(relation: Relation): string {
  return relation === "<=" ? "\\leq " : relation === ">=" ? "\\geq " : relation;
}

function flip(relation: Relation): Relation {
  return ({ "<": ">", "<=": ">=", ">": "<", ">=": "<=" } as const)[relation];
}

function coefficientTex(value: number): string {
  return value === 1 ? "x" : value === -1 ? "-x" : `${formatNumber(value)}x`;
}

function quotientTex(numerator: number, denominator: number): string {
  const quotient = numerator / denominator;
  if (Math.abs(quotient - Math.round(quotient)) < EPS)
    return formatNumber(Math.round(quotient));
  const positiveDenominator = denominator < 0 ? -denominator : denominator;
  const signedNumerator = denominator < 0 ? -numerator : numerator;
  return `\\frac{${formatNumber(signedNumerator)}}{${formatNumber(positiveDenominator)}}`;
}

/** Parse a deliberately small, predictable grammar. Never evaluate entered code. */
export function solveInequality(input: string): InequalitySolution | null {
  const normalised = input
    .replace(/[≤]/g, "<=")
    .replace(/[≥]/g, ">=")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
  const compound = normalised.match(COMPOUND);
  if (compound) {
    const lowerValue = Number(compound[1]);
    const upperValue = Number(compound[4]);
    const lower: Endpoint = {
      value: lowerValue,
      tex: formatNumber(lowerValue),
      included: compound[2] === "<=",
    };
    const upper: Endpoint = {
      value: upperValue,
      tex: formatNumber(upperValue),
      included: compound[3] === "<=",
    };
    const tex = `${lower.tex}${relationTex(compound[2] as Relation)}x${relationTex(compound[3] as Relation)}${upper.tex}`;
    const equal = Math.abs(lowerValue - upperValue) < EPS;
    const kind =
      lowerValue > upperValue || (equal && (!lower.included || !upper.included))
        ? "empty"
        : equal
          ? "point"
          : "interval";
    return {
      kind,
      tex:
        kind === "empty"
          ? "\\varnothing"
          : kind === "point"
            ? `x=${lower.tex}`
            : tex,
      lower,
      upper,
      steps: [{ kind: "compound", tex }],
      reversed: false,
    };
  }

  const simple = normalised.match(SIMPLE);
  if (!simple) return null;
  const a =
    simple[1] === "" || simple[1] === "+"
      ? 1
      : simple[1] === "-"
        ? -1
        : Number(simple[1]);
  if (Math.abs(a) < EPS) return null;
  const b = simple[2] ? Number(simple[2]) : 0;
  const rhs = Number(simple[4]);
  const moved = rhs - b;
  const reversed = a < 0;
  const relation = reversed
    ? flip(simple[3] as Relation)
    : (simple[3] as Relation);
  const boundary: Endpoint = {
    value: moved / a,
    tex: quotientTex(moved, a),
    included: relation === "<=" || relation === ">=",
  };
  const lower = relation === ">" || relation === ">=" ? boundary : null;
  const upper = lower ? null : boundary;
  const tex = `x${relationTex(relation)}${boundary.tex}`;
  return {
    kind: "interval",
    tex,
    lower,
    upper,
    steps: [
      {
        kind: "move",
        tex: `${coefficientTex(a)}${relationTex(simple[3] as Relation)}${formatNumber(moved)}`,
      },
      { kind: "divide", tex },
    ],
    reversed,
  };
}
