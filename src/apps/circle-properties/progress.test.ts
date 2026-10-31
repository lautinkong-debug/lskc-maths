import { describe, expect, it } from "vitest";
import {
  emptyProgress,
  legacyStorageKey,
  parseLegacy,
  parseProgress,
  storageKey,
} from "./progress";
import { allMissions } from "./missions";
import { reasons } from "./content";

describe("Circle Lab v2 progress", () => {
  it.each([
    null,
    "",
    "broken{",
    "null",
    "[]",
    '{"version":1}',
    '{"version":3}',
  ])(
    "opens safely with absent, corrupt or incompatible progress: %s",
    (raw) => {
      expect(parseProgress(raw)).toEqual(emptyProgress());
    },
  );

  it("restores only valid distinct mission and reason identifiers", () => {
    expect(
      parseProgress(
        JSON.stringify({
          version: 2,
          missions: ["centre-1", "centre-1", "fake", 2, null],
          reasons: ["r6", "r6", "r99", false],
        }),
      ),
    ).toEqual({ version: 2, missions: ["centre-1"], reasons: ["r6"] });
  });

  it("ignores malformed collections and obsolete notebook fields", () => {
    expect(
      parseProgress(
        JSON.stringify({
          version: 2,
          missions: { "centre-1": true },
          reasons: "r6",
          investigations: { centre: { complete: true } },
          traps: ["t1"],
        }),
      ),
    ).toEqual(emptyProgress());
  });

  it("bounds output to the actual 21 tasks and 17 reasons", () => {
    const progress = parseProgress(
      JSON.stringify({
        version: 2,
        missions: Array(100)
          .fill(allMissions.map((item) => item.id))
          .flat(),
        reasons: Array(100)
          .fill(reasons.map((item) => item.id))
          .flat(),
      }),
    );
    expect(progress.missions).toEqual(allMissions.map((item) => item.id));
    expect(progress.reasons).toEqual(reasons.map((item) => item.id));
    expect(progress.missions).toHaveLength(21);
    expect(progress.reasons).toHaveLength(17);
  });

  it("migrates valid reasons from v1 only when there is no v2 record", () => {
    const legacy = JSON.stringify({
      version: 1,
      reasons: ["r7", "r6", "r7", "bad"],
      traps: ["t1"],
      investigations: { centre: { complete: true } },
    });
    expect(parseLegacy(legacy)).toEqual({
      version: 2,
      missions: [],
      reasons: ["r6", "r7"],
    });
    expect(parseProgress(null, legacy)).toEqual(parseLegacy(legacy));
    expect(parseProgress(JSON.stringify(emptyProgress()), legacy)).toEqual(
      emptyProgress(),
    );
    expect(parseProgress("broken{", legacy)).toEqual(emptyProgress());
  });

  it.each([null, "broken{", "null", '{"version":2,"reasons":["r6"]}'])(
    "rejects unsupported legacy data: %s",
    (raw) => {
      expect(parseLegacy(raw)).toEqual(emptyProgress());
    },
  );

  it("uses a separate storage key and returns independent fresh objects", () => {
    expect(storageKey).not.toBe(legacyStorageKey);
    const first = emptyProgress();
    first.missions.push("centre-1");
    first.reasons.push("r6");
    expect(emptyProgress()).toEqual({ version: 2, missions: [], reasons: [] });
  });
});
