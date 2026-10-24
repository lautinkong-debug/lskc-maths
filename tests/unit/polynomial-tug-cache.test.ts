import { describe, expect, it, vi } from "vitest";
import { createReadCache } from "../../src/lib/server/tugReadCache";
describe("short classroom read cache", () => {
  it("coalesces simultaneous readers, refreshes expired values and invalidates writes", async () => {
    let time = 10;
    const cache = createReadCache(() => time),
      fetch = vi.fn(async () => ({ revision: time }));
    const [a, b] = await Promise.all([
      cache.get("room:group", 100, fetch),
      cache.get("room:group", 100, fetch),
    ]);
    expect(a).toBe(b);
    expect(fetch).toHaveBeenCalledTimes(1);
    time = 111;
    expect((await cache.get("room:group", 100, fetch)).revision).toBe(111);
    cache.drop("room:group");
    await cache.get("room:group", 100, fetch);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("never caches a rejected read or shares different room/member keys", async () => {
    const cache = createReadCache();
    const failing = vi.fn(async () => {
      throw new Error("quota");
    });
    await expect(cache.get("a:uid1", 100, failing)).rejects.toThrow("quota");
    await expect(cache.get("a:uid1", 100, failing)).rejects.toThrow("quota");
    expect(failing).toHaveBeenCalledTimes(2);
    expect(await cache.get("a:uid1", 100, async () => "one")).toBe("one");
    expect(await cache.get("a:uid2", 100, async () => "two")).toBe("two");
  });
});

it("does not retain missing memberships when a pupil joins through another server instance", async () => {
  const cache = createReadCache();
  const read = vi
    .fn<() => Promise<{ seat: number } | undefined>>()
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce({ seat: 1 });
  expect(await cache.get("room:member:uid", 60000, read)).toBeUndefined();
  expect(await cache.get("room:member:uid", 60000, read)).toEqual({ seat: 1 });
  expect(read).toHaveBeenCalledTimes(2);
});
