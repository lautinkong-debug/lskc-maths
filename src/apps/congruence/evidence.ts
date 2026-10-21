import type { Point } from "../similarity/types";
import type { TextbookStep } from "../similarity/textbook-types";
import type { CongruenceQuestion } from "./types";

export type EvidenceMember = { name: string; value?: string; degrees?: number };
export type EvidenceRow = {
  key: string;
  kind: "angle" | "side";
  members: EvidenceMember[];
  /** Stable order of first appearance, separately for angles and sides. */
  marker: number;
  stepIndices: number[];
};
export type EvidenceMode = "current" | "all";
export type EvidenceMark = EvidenceMember & {
  key: string;
  memberKey: string;
  kind: EvidenceRow["kind"];
  marker: number;
  points: Point[];
};

const names = (name: string) => name.match(/[A-Z]\d*/g) ?? [];
const canonical = (kind: EvidenceRow["kind"], name: string) => {
  const ns = names(name);
  return kind === "side"
    ? ns.sort().join(",")
    : `${ns[1]}:${[ns[0], ns[2]].sort().join(",")}`;
};
const memberKey = (kind: EvidenceRow["kind"], name: string) =>
  `${kind}:${canonical(kind, name)}`;
const normalise = (math: string) =>
  math
    .replace(/\\(?:because|therefore|quad|qquad|,|;|!| )/g, "")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\angle\s*/g, "∠")
    .replace(/\^\{?\\circ\}?/g, "°")
    .replace(/^\s*(?:i\.e\.|and)\s*/, "")
    .replace(/\s+/g, "")
    .trim();

/** Recognise literal values only. A source drawing is never a measuring tool. */
function literalValue(
  raw: string,
): { value: string; degrees?: number } | undefined {
  const match = raw.match(/^(\d+(?:\.\d+)?)(°|mm|cm|km|m)?$/);
  if (!match) return;
  return match[2] === "°"
    ? { value: `${match[1]}°`, degrees: Number(match[1]) }
    : { value: `${match[1]}${match[2] ? ` ${match[2]}` : ""}` };
}

function reference(
  raw: string,
  highlights: TextbookStep["highlights"],
): { kind: EvidenceRow["kind"]; name: string } | undefined {
  if (/^[A-Z]{2}$/.test(raw)) return { kind: "side", name: raw };
  const angle = raw.match(/^∠([A-Z]{1,3})$/)?.[1];
  if (!angle) return;
  if (angle.length === 3) return { kind: "angle", name: angle };
  const candidates = (highlights.angles ?? []).filter(
    (name) => names(name)[1] === angle,
  );
  const unique = [
    ...new Map(
      candidates.map((name) => [canonical("angle", name), name]),
    ).values(),
  ];
  return unique.length === 1 ? { kind: "angle", name: unique[0] } : undefined;
}

type Event = Omit<EvidenceRow, "key" | "marker" | "stepIndices">;
function stepEvents(step: TextbookStep): Event[] {
  return (step.math ?? []).flatMap((math) => {
    const parts = normalise(math).split("=");
    if (parts.length < 2) return [];
    const refs = parts.map((part) => reference(part, step.highlights));
    const finalValue = literalValue(parts.at(-1)!);
    // Every operand must itself name a side/angle. AB-AC=BD never means that
    // AB, AC and BD are equal, however many source highlights the step carries.
    if (
      refs.every(Boolean) &&
      refs.every((ref) => ref!.kind === refs[0]!.kind)
    ) {
      return [
        {
          kind: refs[0]!.kind,
          members: refs.map((ref) => ({ name: ref!.name })),
        },
      ];
    }
    if (finalValue) {
      const earlierRefs = refs.slice(0, -1);
      const namedRefs = earlierRefs.filter(
        (r): r is NonNullable<typeof r> => !!r,
      );
      if (
        namedRefs.length &&
        earlierRefs.every((ref, i) => ref || /^[a-z]$/.test(parts[i])) &&
        namedRefs.every((r) => r.kind === namedRefs[0].kind)
      ) {
        const kind = namedRefs[0].kind;
        if ((kind === "angle") === (finalValue.degrees !== undefined))
          return [
            {
              kind,
              members: namedRefs.map((ref) => ({
                name: ref.name,
                ...finalValue,
              })),
            },
          ];
      }
      if (
        earlierRefs.length &&
        earlierRefs.every(Boolean) &&
        earlierRefs.every((r) => r!.kind === earlierRefs[0]!.kind)
      ) {
        const kind = earlierRefs[0]!.kind;
        if ((kind === "angle") !== (finalValue.degrees !== undefined))
          return [];
        return [
          {
            kind,
            members: earlierRefs.map((ref) => ({
              name: ref!.name,
              ...finalValue,
            })),
          },
        ];
      }
      // A complete evaluated calculation, e.g. AB=(4+4)cm=8cm, states
      // the length of AB only; its highlighted summands remain separate.
      if (
        refs[0] &&
        parts.length > 2 &&
        (refs[0].kind === "angle") === (finalValue.degrees !== undefined)
      ) {
        return [
          {
            kind: refs[0].kind,
            members: [{ name: refs[0].name, ...finalValue }],
          },
        ];
      }
      if (parts.length === 2 && (parts[0] === "" || /^[a-z]$/.test(parts[0]))) {
        const kind = finalValue.degrees === undefined ? "side" : "angle";
        const highlighted =
          step.highlights[kind === "angle" ? "angles" : "sides"] ?? [];
        // Continuations have explicit target highlights in the transcription.
        // A bare variable is safe only when it identifies one target.
        if (highlighted.length && (parts[0] === "" || highlighted.length === 1))
          return [
            {
              kind,
              members: highlighted.map((name) => ({ name, ...finalValue })),
            },
          ];
      }
    }
    // The transcription explicitly maps symbolic labels and continuation
    // targets, e.g. angle ABE=x, =y, =angle CBD. These simple equality lines
    // can use those two targets; arithmetic expressions still cannot.
    if (
      parts.length === 2 &&
      parts.every((part) => /^(?:∠[A-Z]{1,3}|[A-Z]{2}|[a-z])?$/.test(part))
    ) {
      for (const kind of ["angle", "side"] as const) {
        const highlighted =
          step.highlights[kind === "angle" ? "angles" : "sides"] ?? [];
        const other =
          step.highlights[kind === "angle" ? "sides" : "angles"] ?? [];
        if (highlighted.length !== 2 || other.length) continue;
        if (
          refs.some(
            (ref) =>
              ref &&
              (ref.kind !== kind ||
                !highlighted.some(
                  (name) => canonical(kind, name) === canonical(kind, ref.name),
                )),
          )
        )
          continue;
        return [{ kind, members: highlighted.map((name) => ({ name })) }];
      }
    }
    return [];
  });
}

/** Explicitly named prompt givens enrich matching revealed rows; they do not
 * create evidence rows or reveal later answers. Single-letter angles in prose
 * are intentionally omitted because shared vertices can name several angles. */
function promptValues(question: CongruenceQuestion) {
  const values = new Map<string, { value: string; degrees?: number }>();
  const pattern =
    /(?:∠[A-Z]{3}|\b[A-Z]{2})(?:\s*=\s*(?:∠[A-Z]{3}|[A-Z]{2}))*\s*=\s*\d+(?:\.\d+)?\s*(?:°|mm\b|cm\b|km\b|m\b)/g;
  for (const match of question.prompt.matchAll(pattern)) {
    const parts = normalise(match[0]).split("=");
    const value = literalValue(parts.at(-1)!);
    if (!value) continue;
    for (const part of parts.slice(0, -1)) {
      const ref = reference(part, {});
      if (ref && (ref.kind === "angle") === (value.degrees !== undefined))
        values.set(memberKey(ref.kind, ref.name), value);
    }
  }
  for (const name of question.rightAngles ?? [])
    values.set(memberKey("angle", name), { value: "90°", degrees: 90 });
  return values;
}

/** Textbook-driven equality and value marks. No congruence criterion, heading,
 * highlight list or traced distance creates a mathematical fact on its own. */
export function extractEvidence(
  question: CongruenceQuestion,
  stepIndex: number,
  mode: EvidenceMode = "current",
): EvidenceRow[] {
  if (stepIndex < 0) return [];
  const values = promptValues(question);
  const rows: EvidenceRow[] = [];
  const current = new Set<string>();
  const counters = { angle: 0, side: 0 };
  for (
    let index = 0;
    index <= Math.min(stepIndex, question.steps.length - 1);
    index++
  ) {
    for (const event of stepEvents(question.steps[index])) {
      const members = [
        ...new Map(
          event.members.map((m) => [canonical(event.kind, m.name), m]),
        ).values(),
      ];
      if (
        members.some((m) =>
          names(m.name).some(
            (n) => !question.points.some((p) => p.label === n),
          ),
        )
      )
        continue;
      let key = `${event.kind}:${members
        .map((m) => canonical(event.kind, m.name))
        .sort()
        .join("=")}`;
      let row = rows.find((r) => r.key === key);
      // A numeric continuation updates its already established pair. Its key
      // therefore stays stable when the teacher hides/reveals that pair.
      if (!row && members.length === 1 && members[0].value !== undefined) {
        row = rows.findLast(
          (r) =>
            r.kind === event.kind &&
            r.members.length > 1 &&
            r.members.some(
              (m) =>
                canonical(event.kind, m.name) ===
                canonical(event.kind, members[0].name),
            ),
        );
        if (row) key = row.key;
      }
      if (!row) {
        row = {
          key,
          kind: event.kind,
          members,
          marker: ++counters[event.kind],
          stepIndices: [index],
        };
        rows.push(row);
      } else if (!row.stepIndices.includes(index)) row.stepIndices.push(index);
      if (index === stepIndex) current.add(key);
      for (const member of members)
        if (member.value !== undefined)
          values.set(memberKey(event.kind, member.name), {
            value: member.value,
            ...(member.degrees !== undefined
              ? { degrees: member.degrees }
              : {}),
          });
    }
  }
  // Values may travel through equalities that have already been revealed.
  // Repeat to support a chain of explicit equalities; contradictory values
  // are never silently overwritten or manufactured from the drawing.
  for (let pass = 0; pass < rows.length; pass++) {
    let changed = false;
    for (const row of rows) {
      const known = row.members.flatMap((member) => {
        const value = values.get(memberKey(row.kind, member.name));
        return value ? [value] : [];
      });
      if (!known.length || known.some((v) => v.value !== known[0].value))
        continue;
      for (const member of row.members) {
        const key = memberKey(row.kind, member.name);
        if (!values.has(key)) {
          values.set(key, known[0]);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return rows
    .filter((row) => mode === "all" || current.has(row.key))
    .map((row) => ({
      ...row,
      members: row.members.map((member) => ({
        ...member,
        ...values.get(memberKey(row.kind, member.name)),
      })),
    }));
}

/** Pixel rounding can displace a traced point by a few pixels. Require a
 * positive ray and a small perpendicular displacement, not just a shared
 * vertex: the opposite ray at an intersection represents another angle. */
function sameRay(vertex: Point, a: Point, b: Point) {
  const ux = a.x - vertex.x,
    uy = a.y - vertex.y;
  const vx = b.x - vertex.x,
    vy = b.y - vertex.y;
  const lu = Math.hypot(ux, uy),
    lv = Math.hypot(vx, vy);
  return (
    lu > 0 &&
    lv > 0 &&
    (ux * vx + uy * vy) / (lu * lv) > 0.99 &&
    Math.abs(ux * vy - uy * vx) / Math.max(lu, lv) <= 2.5
  );
}

/** Resolve references against one displayed figure, using its placed vertices
 * after translation, rotation/reflection. No coordinate-derived values. */
export function evidenceGeometry(
  rows: readonly EvidenceRow[],
  source: readonly Point[],
  placed: readonly Point[],
): EvidenceMark[] {
  const originals = new Map(source.map((p) => [p.label, p]));
  const actual = new Map(placed.map((p) => [p.label, p]));
  const marks: EvidenceMark[] = [];
  const seen = new Set<string>();
  for (const row of rows)
    for (const member of row.members) {
      const ns = names(member.name);
      let points: Point[] | undefined;
      if (row.kind === "side") {
        if (!ns[0] || !ns[1]) continue;
        const a = actual.get(ns[0]),
          b = actual.get(ns[1]);
        if (a && b) points = [a, b];
      } else {
        const [a, v, b] = ns.map((name) => originals.get(name));
        if (!a || !v || !b || !actual.has(v.label)) continue;
        const resolve = (ray: Point) =>
          actual.get(ray.label) ??
          placed.find((p) => {
            const original = originals.get(p.label);
            return original && sameRay(v, ray, original);
          });
        const first = resolve(a),
          last = resolve(b);
        if (first && last && first.label !== last.label)
          points = [first, actual.get(v.label)!, last];
      }
      if (!points) continue;
      const positionKey = `${row.key}:${canonical(row.kind, points.map((p) => p.label).join(""))}`;
      if (seen.has(positionKey)) continue;
      seen.add(positionKey);
      marks.push({
        ...member,
        key: row.key,
        memberKey: `${row.key}:${member.name}`,
        kind: row.kind,
        marker: row.marker,
        points,
      });
    }
  return marks;
}

export const evidenceSymbol = (row: Pick<EvidenceRow, "marker">) =>
  ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ"][
    row.marker - 1
  ] ?? `α${row.marker}`;

function matchingReference(
  kind: EvidenceRow["kind"],
  a: string,
  b: string,
  source: readonly Point[],
) {
  if (canonical(kind, a) === canonical(kind, b)) return true;
  if (kind === "side") return false;
  const [p, v, q] = names(a).map((name) =>
    source.find((point) => point.label === name),
  );
  const [r, w, s] = names(b).map((name) =>
    source.find((point) => point.label === name),
  );
  return !!(
    p &&
    v &&
    q &&
    r &&
    w &&
    s &&
    v.label === w.label &&
    ((sameRay(v, p, r) && sameRay(v, q, s)) ||
      (sameRay(v, p, s) && sameRay(v, q, r)))
  );
}

/** Remove a hidden pair's focus highlights as well as its persistent marks. */
export function filterStepEvidence(
  step: TextbookStep | undefined,
  rows: readonly EvidenceRow[],
  hiddenKeys: ReadonlySet<string>,
  showAngles = true,
  showSides = true,
  source: readonly Point[] = [],
): TextbookStep | undefined {
  if (!step) return step;
  const keep = (kind: EvidenceRow["kind"], name: string) =>
    !rows.some(
      (row) =>
        row.kind === kind &&
        hiddenKeys.has(row.key) &&
        row.members.some((member) =>
          matchingReference(kind, name, member.name, source),
        ),
    );
  return {
    ...step,
    highlights: {
      ...step.highlights,
      angles: showAngles
        ? step.highlights.angles?.filter((name) => keep("angle", name))
        : [],
      sides: showSides
        ? step.highlights.sides?.filter((name) => keep("side", name))
        : [],
    },
  };
}

/** EvidenceMarks already draws these references. Preserve unrelated arithmetic
 * operands, points and figures in the separate StepHighlights overlay. */
export function withoutEvidenceHighlights(
  step: TextbookStep | undefined,
  rows: readonly EvidenceRow[],
  source: readonly Point[] = [],
): TextbookStep | undefined {
  return filterStepEvidence(
    step,
    rows,
    new Set(rows.map((row) => row.key)),
    true,
    true,
    source,
  );
}
