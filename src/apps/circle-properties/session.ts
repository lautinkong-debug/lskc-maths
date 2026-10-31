import { defaults, getControls, normalise, type Parameters } from "./geometry";
import { labs, type LabId } from "./content";
import { evaluateMission, missions } from "./missions";

export const sessionPrefix = "lskc-circle-workspace-v3:";
export type WorkspaceState = {
  mode: "explore" | "relay" | "check";
  labId: LabId;
  focusLab: LabId | null;
  focusToken: number;
  appearance: "playful" | "calm";
  welcomeDismissed: boolean;
};
export const initialWorkspace: WorkspaceState = {
  mode: "explore",
  labId: "bisector",
  focusLab: null,
  focusToken: 0,
  appearance: "playful",
  welcomeDismissed: false,
};
const labIds = labs.map((lab) => lab.id);
export function parseWorkspace(raw: unknown): WorkspaceState | undefined {
  if (!raw || typeof raw !== "object") return;
  const value = raw as Partial<WorkspaceState>;
  return {
    mode: ["explore", "relay", "check"].includes(value.mode ?? "")
      ? value.mode!
      : "explore",
    labId: labIds.includes(value.labId!) ? value.labId! : "bisector",
    focusLab: labIds.includes(value.focusLab!) ? value.focusLab! : null,
    focusToken:
      Number.isSafeInteger(value.focusToken) && value.focusToken! >= 0
        ? value.focusToken!
        : 0,
    appearance: value.appearance === "calm" ? "calm" : "playful",
    welcomeDismissed: value.welcomeDismissed === true,
  };
}
export type PlaygroundState = {
  parameters: Parameters;
  recordedShapes: Partial<Record<string, Parameters>>;
  missionIndex: number;
  free: boolean;
  showReasons: boolean;
  showMeasurements: boolean;
  autoSnap: boolean;
  focus: boolean;
};
export const initialPlayground = (lab: LabId): PlaygroundState => ({
  parameters: { ...defaults[lab] },
  recordedShapes: {},
  missionIndex: 0,
  free: false,
  showReasons: false,
  showMeasurements: true,
  autoSnap: true,
  focus: false,
});

const shapeNumbers = [
  "primary",
  "secondary",
  "rotation",
  "rotation2",
  "tertiary",
] as const;
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Captures always store the full construction. A partial/corrupt saved capture cannot stand in for the student's original. */
function recordedParameters(raw: unknown): Required<Parameters> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const p = raw as Required<Parameters>;
  if (
    typeof p.alternate !== "boolean" ||
    !shapeNumbers.every((key) => finite(p[key]))
  )
    return;
  const { primary, secondary, alternate, rotation, rotation2, tertiary } = p;
  return { primary, secondary, alternate, rotation, rotation2, tertiary };
}

export function storeMissionShape(
  lab: LabId,
  state: PlaygroundState,
  missionId: string,
): PlaygroundState {
  const mission = missions[lab].find((item) => item.id === missionId);
  if (!mission || state.recordedShapes[missionId]) return state;
  const p = state.parameters;
  const fields = recordedParameters({
    ...p,
    rotation: p.rotation === undefined ? defaults[lab].rotation : p.rotation,
    rotation2:
      p.rotation2 === undefined ? defaults[lab].rotation2 : p.rotation2,
    tertiary: p.tertiary === undefined ? defaults[lab].tertiary : p.tertiary,
  });
  if (!fields) return state;
  // Save the same normalized geometry the diagram renders after a control/side change.
  const shape = normalise(lab, fields);
  if (!evaluateMission(mission, shape).complete) return state;
  return {
    ...state,
    recordedShapes: { ...state.recordedShapes, [missionId]: shape },
  };
}

/** Compare the controls that actually set this lab's geometry, including equivalent full turns. */
export function samePlaygroundShape(
  lab: LabId,
  a: Parameters,
  b: Parameters,
): boolean {
  const first = normalise(lab, a),
    second = normalise(lab, b);
  if (
    ["centre", "segment", "semicircle", "ratios"].includes(lab) &&
    first.alternate !== second.alternate
  )
    return false;
  return getControls(lab).every(({ key }) => {
    const difference = Math.abs(first[key] - second[key]);
    return (
      difference < 1e-8 ||
      ((key === "rotation" || key === "rotation2") &&
        Math.abs(360 - difference) < 1e-8)
    );
  });
}

export function parsePlayground(
  lab: LabId,
  raw: unknown,
): PlaygroundState | undefined {
  if (!raw || typeof raw !== "object") return;
  const value = raw as Partial<PlaygroundState>;
  const fallback = initialPlayground(lab);
  const p = value.parameters;
  const parameters =
    p &&
    typeof p === "object" &&
    [p.primary, p.secondary].every(
      (v) => typeof v === "number" && Number.isFinite(v),
    )
      ? normalise(lab, {
          primary: p.primary,
          secondary: p.secondary,
          alternate: p.alternate === true,
          rotation:
            typeof p.rotation === "number" && Number.isFinite(p.rotation)
              ? p.rotation
              : defaults[lab].rotation,
          rotation2:
            typeof p.rotation2 === "number" && Number.isFinite(p.rotation2)
              ? p.rotation2
              : defaults[lab].rotation2,
          tertiary:
            typeof p.tertiary === "number" && Number.isFinite(p.tertiary)
              ? p.tertiary
              : defaults[lab].tertiary,
        })
      : fallback.parameters;
  const recordedShapes: PlaygroundState["recordedShapes"] = {};
  const source = value.recordedShapes;
  if (source && typeof source === "object" && !Array.isArray(source)) {
    for (const mission of missions[lab]) {
      if (!Object.hasOwn(source, mission.id)) continue;
      const shape = recordedParameters(source[mission.id]);
      if (!shape) continue;
      const normalized = normalise(lab, shape);
      // A saved capture was normalized at recording. Never repair corrupt geometry into a new example.
      if (
        shapeNumbers.every((key) => normalized[key] === shape[key]) &&
        evaluateMission(mission, shape).complete
      )
        recordedShapes[mission.id] = shape;
    }
  }
  return {
    parameters,
    recordedShapes,
    missionIndex:
      Number.isInteger(value.missionIndex) &&
      value.missionIndex! >= 0 &&
      value.missionIndex! < 3
        ? value.missionIndex!
        : 0,
    free: value.free === true,
    showReasons: value.showReasons === true,
    showMeasurements: value.showMeasurements !== false,
    autoSnap: value.autoSnap !== false,
    focus: value.focus === true,
  };
}
