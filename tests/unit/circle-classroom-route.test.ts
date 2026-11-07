import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, revalidate } from "@/app/apps/circle-properties/classroom/route";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
const name =
  "projects/demo-school/databases/(default)/documents/appSettings/circle-properties";
const html = "<!doctype html><title>Circle Lab</title>";
const read = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_ACCESS_MODE", "public");
  vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "true");
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "demo-school");
  vi.stubGlobal("fetch", read);
  vi.mocked(readFile).mockResolvedValue(html);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Circle Lab classroom access", () => {
  it("is cached, so a class does not cost the server one request per student", () => {
    expect(revalidate).toBeGreaterThan(0);
    expect(revalidate).toBeLessThanOrEqual(60);
  });

  it.each([
    [
      "an expressly visible listing",
      { found: { name, fields: { visible: { booleanValue: true } } } },
    ],
    ["a confirmed missing listing", { missing: name }],
  ])("serves the lesson for %s", async (_, record) => {
    read.mockResolvedValue(Response.json([record]));
    const result = await GET();
    expect(result.status).toBe(200);
    expect(result.headers.get("Content-Type")).toContain("text/html");
    expect(await result.text()).toBe(html);
    const [url, options] = read.mock.calls[0];
    expect(url).toBe(
      "http://127.0.0.1:8080/v1/projects/demo-school/databases/(default)/documents:batchGet",
    );
    expect(JSON.parse(String(options?.body)).documents).toEqual([name]);
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("does not open a hidden app", async () => {
    read.mockResolvedValue(
      Response.json([
        { found: { name, fields: { visible: { booleanValue: false } } } },
      ]),
    );
    expect((await GET()).status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });

  it.each(["school", ""])(
    "redirects to the normal gated route when mode is %j",
    async (mode) => {
      vi.stubEnv("NEXT_PUBLIC_ACCESS_MODE", mode);
      const result = await GET();
      expect(result.status).toBe(307);
      expect(result.headers.get("Location")).toBe("/apps/circle-properties");
      expect(read).not.toHaveBeenCalled();
      expect(readFile).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["permission denied", 403, {}],
    ["missing database", 404, {}],
    ["wrong document", 200, [{ found: { name: name + "-other" } }]],
    ["malformed visibility", 200, [{ found: { name } }]],
    ["invalid payload", 200, {}],
  ])("still opens the lesson on %s", async (_, status, body) => {
    read.mockResolvedValue(Response.json(body, { status: Number(status) }));
    const result = await GET();
    expect(result.status).toBe(200);
    expect(await result.text()).toBe(html);
  });

  it("still opens the lesson if Firestore cannot be reached", async () => {
    read.mockRejectedValue(new Error("timeout"));
    const result = await GET();
    expect(result.status).toBe(200);
    expect(await result.text()).toBe(html);
  });

  it("reports a build that is missing the lesson file", async () => {
    read.mockResolvedValue(Response.json([{ missing: name }]));
    vi.mocked(readFile).mockRejectedValue(new Error("not found"));
    expect((await GET()).status).toBe(503);
  });
});
