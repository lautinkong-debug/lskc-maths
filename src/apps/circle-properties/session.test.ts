import { describe, expect, it } from "vitest";
import {
  initialPlayground,
  parsePlayground,
  parseWorkspace,
  samePlaygroundShape,
  storeMissionShape,
} from "./session";
import { labs, type LabId } from "./content";
import { defaults, getScene, type Parameters } from "./geometry";

describe("circle workspace restoration", () => {
  it("enables snapping for old saves and preserves an explicit opt-out", () => {
    expect(parsePlayground("bisector", {})?.autoSnap).toBe(true);
    expect(parsePlayground("bisector", { autoSnap: false })?.autoSnap).toBe(
      false,
    );
  });
  it("restores the selected activity and its contextual practice", () => {
    expect(
      parseWorkspace({
        mode: "relay",
        labId: "centre",
        focusLab: "centre",
        focusToken: 4,
        appearance: "calm",
        welcomeDismissed: true,
      }),
    ).toMatchObject({
      mode: "relay",
      labId: "centre",
      focusLab: "centre",
      focusToken: 4,
      appearance: "calm",
    });
  });
  it("rejects unknown routes and malicious counters", () => {
    expect(
      parseWorkspace({ mode: "admin", labId: "x", focusToken: -1 }),
    ).toMatchObject({ mode: "explore", labId: "bisector", focusToken: 0 });
    expect(parseWorkspace(null)).toBeUndefined();
  });
  it.each(labs.map((lab) => [lab.id] as const))(
    "restores the actual geometry and learner controls for %s",
    (lab) => {
      const saved = {
        ...initialPlayground(lab),
        parameters: { ...initialPlayground(lab).parameters, rotation: 67 },
        missionIndex: 2,
        free: true,
        showMeasurements: false,
      };
      expect(parsePlayground(lab, saved)).toMatchObject({
        missionIndex: 2,
        free: true,
        showMeasurements: false,
        parameters: { rotation: 67 },
      });
    },
  );
  it("falls back from non-finite or missing geometry without breaking a lesson", () => {
    expect(
      parsePlayground("bisector", {
        parameters: { primary: NaN, secondary: 12 },
        missionIndex: 100,
      }),
    ).toEqual(initialPlayground("bisector"));
  });
});

describe("recorded mission shapes", () => {
  const examples: [LabId, string, Partial<Parameters>][] = [
    ["bisector", "bisector-3", { primary: -5, secondary: 0, rotation: 63 }],
    [
      "chords",
      "chords-3",
      { primary: 4, secondary: -4, rotation: 12, rotation2: 71 },
    ],
    [
      "centre",
      "centre-2",
      { primary: 120, alternate: true, secondary: 40, rotation: 57 },
    ],
    [
      "segment",
      "segment-2",
      {
        primary: 120,
        alternate: true,
        secondary: 51,
        tertiary: 26,
        rotation: 48,
      },
    ],
    [
      "semicircle",
      "semicircle-2",
      { primary: 180, secondary: 32, rotation: 67 },
    ],
    [
      "equal-arcs",
      "equal-arcs-3",
      { primary: 240, secondary: 240, rotation: 33, rotation2: 58 },
    ],
    [
      "ratios",
      "ratios-2",
      {
        primary: 170,
        secondary: 85,
        alternate: true,
        rotation: 43,
        rotation2: 92,
      },
    ],
  ];
  it.each(examples)(
    "restores the captured labelled construction for %s",
    (lab, mission, changes) => {
      const original = { ...defaults[lab], ...changes };
      const saved = storeMissionShape(
        lab,
        { ...initialPlayground(lab), parameters: original },
        mission,
      );
      const revisited = parsePlayground(
        lab,
        JSON.parse(JSON.stringify({ ...saved, parameters: defaults[lab] })),
      )!;
      const captured = revisited.recordedShapes[mission];
      expect(captured).toEqual(original);
      expect(captured).not.toBe(original);
      expect(getScene(lab, captured!)).toEqual(getScene(lab, original));
      expect(revisited.parameters).toEqual(defaults[lab]);
      expect(Object.keys(revisited.recordedShapes)).toEqual([mission]);
    },
  );
  it("preserves first captures independently when the current shape changes", () => {
    const state = {
      ...initialPlayground("chords"),
      parameters: { ...defaults.chords, primary: 4, secondary: 4 },
    };
    const first = storeMissionShape("chords", state, "chords-1");
    expect(state.recordedShapes).toEqual({});
    expect(first.recordedShapes["chords-1"]).not.toBe(state.parameters);
    const changed = {
      ...first,
      parameters: {
        ...defaults.chords,
        primary: 3,
        secondary: 9,
        rotation: 19,
      },
    };
    const second = storeMissionShape("chords", changed, "chords-2");
    expect(second.recordedShapes["chords-1"]).toEqual(state.parameters);
    expect(second.recordedShapes["chords-2"]).toEqual(changed.parameters);
    const differentMatch = {
      ...second,
      parameters: { ...defaults.chords, primary: -7, secondary: 7 },
    };
    expect(storeMissionShape("chords", differentMatch, "chords-1")).toBe(
      differentMatch,
    );
    expect(first.recordedShapes["chords-2"]).toBeUndefined();
  });
  it("captures the displayed geometry when an arc-side change clamps a vertex position", () => {
    const current = {
      ...initialPlayground("centre"),
      parameters: { primary: 120, secondary: 5, alternate: true },
    };
    const capture = storeMissionShape("centre", current, "centre-2")
      .recordedShapes["centre-2"];
    expect(capture?.secondary).toBeCloseTo(800 / 120);
    expect(getScene("centre", capture!)).toEqual(
      getScene("centre", current.parameters),
    );
  });
  it("does not create a capture for incomplete, unsupported or foreign missions", () => {
    const state = initialPlayground("bisector");
    for (const mission of ["bisector-1", "chords-1", "__proto__", "missing"])
      expect(storeMissionShape("bisector", state, mission)).toBe(state);
  });
  it("keeps old earned stars separate from proof of an actual shape capture", () => {
    const old = {
      parameters: { ...defaults.bisector, secondary: 0 },
      missions: ["bisector-1", "bisector-3"],
      missionIndex: 0,
    };
    expect(parsePlayground("bisector", old)?.recordedShapes).toEqual({});
  });
  it("drops incomplete, mistyped, foreign, out-of-range and non-achieving stored entries", () => {
    const match = { ...defaults.bisector, secondary: 0 };
    for (const bad of [
      null,
      [],
      true,
      {},
      { ...match, alternate: "false" },
      { ...match, primary: Infinity },
      { ...match, rotation: -20 },
      { ...match, rotation2: null },
      { ...match, tertiary: undefined },
      { ...match, secondary: 60 },
    ]) {
      expect(
        parsePlayground("bisector", { recordedShapes: { "bisector-1": bad } })
          ?.recordedShapes,
      ).toEqual({});
    }
    expect(
      parsePlayground("bisector", {
        recordedShapes: {
          "bisector-1": { ...match, extra: 99 },
          "chords-1": match,
          other: match,
        },
      })?.recordedShapes,
    ).toEqual({ "bisector-1": match });
  });
  it("compares normalized geometry, including arc selection and both independent rotations", () => {
    const compact = { primary: 4, secondary: 4, alternate: false };
    const full = {
      ...defaults.chords,
      ...compact,
      rotation: 360,
      rotation2: 360,
    };
    expect(samePlaygroundShape("chords", compact, full)).toBe(true);
    expect(
      samePlaygroundShape("chords", compact, { ...full, rotation2: 38 }),
    ).toBe(false);
    expect(
      samePlaygroundShape("chords", compact, { ...full, primary: -4 }),
    ).toBe(false);
    expect(
      samePlaygroundShape("segment", defaults.segment, {
        ...defaults.segment,
        tertiary: 64,
      }),
    ).toBe(false);
    expect(
      samePlaygroundShape("segment", defaults.segment, {
        ...defaults.segment,
        alternate: true,
      }),
    ).toBe(false);
    expect(
      samePlaygroundShape("bisector", defaults.bisector, {
        ...defaults.bisector,
        rotation2: 130,
        tertiary: 50,
      }),
    ).toBe(true);
  });
});

describe("independent measurement visibility", () => {
  it("keeps both measurement types hidden when reading a legacy hidden-measurements save", () => {
    const state = parsePlayground("bisector", { showMeasurements: false });
    expect(state?.showMeasurements).toBe(false);
    expect(state?.showAngles).toBe(false);
  });
  it("restores each visibility setting independently", () => {
    for (const showMeasurements of [true, false]) {
      for (const showAngles of [true, false]) {
        const state = parsePlayground("bisector", { showMeasurements, showAngles });
        expect(state?.showMeasurements).toBe(showMeasurements);
        expect(state?.showAngles).toBe(showAngles);
      }
    }
  });
});
