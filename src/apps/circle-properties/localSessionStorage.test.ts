import { describe, expect, it } from "vitest";
import { createSessionStorage } from "./localSessionStorage";

function fixture() {
  const values = new Map<string, string>();
  let failWrites = false;
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) {
      if (failWrites) throw new Error("QuotaExceededError");
      values.set(key, value);
    },
  };
  return {
    values,
    cache: createSessionStorage(() => storage),
    fail: (value: boolean) => {
      failWrites = value;
    },
  };
}

describe("browser session fallback", () => {
  it("keeps newer unsaved work when remounting over an older stored value", () => {
    const f = fixture();
    expect(f.cache.write("ink", ["A"])).toBe(true);
    f.fail(true);
    expect(f.cache.write("ink", ["A", "B"])).toBe(false);
    expect(f.values.get("ink")).toBe('["A"]');
    expect(f.cache.read("ink")).toEqual({ raw: ["A", "B"], failed: true });
    expect(f.cache.write("shape", { rotation: 45 })).toBe(false);
    expect(f.cache.read("ink").raw).toEqual(["A", "B"]);
  });
  it("retries the latest value after storage recovers", () => {
    const f = fixture();
    f.fail(true);
    f.cache.write("cases", [1, 2]);
    f.fail(false);
    expect(f.cache.write("cases", f.cache.read("cases").raw)).toBe(true);
    expect(f.cache.read("cases")).toEqual({ raw: [1, 2], failed: false });
    expect(f.values.get("cases")).toBe("[1,2]");
  });
  it("still reads external stored updates after successful writes", () => {
    const f = fixture();
    f.cache.write("shape", { rotation: 10 });
    f.values.set("shape", '{"rotation":20}');
    expect(f.cache.read("shape").raw).toEqual({ rotation: 20 });
  });
  it("handles an unavailable storage accessor and malformed saved JSON", () => {
    const inaccessible = createSessionStorage(() => {
      throw new Error("SecurityError");
    });
    inaccessible.write("shape", 7);
    expect(inaccessible.read("shape")).toEqual({ raw: 7, failed: true });
    const f = fixture();
    f.cache.write("shape", 9);
    f.values.set("shape", "broken json");
    expect(f.cache.read("shape")).toEqual({ raw: 9, failed: true });
  });
  it("clears failed-write fallback when local progress is reset", () => {
    const f = fixture();
    f.fail(true);
    f.cache.write("ink", ["A"]);
    f.cache.clearMemory();
    expect(f.cache.read("ink")).toEqual({ raw: undefined, failed: false });
  });
});
