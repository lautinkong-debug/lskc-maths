import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readAppListing } from "@/lib/server/appListing";

const name =
  "projects/demo-school/databases/(default)/documents/appSettings/circle-properties";
const read = vi.fn<typeof fetch>();
const found = (fields: object) =>
  read.mockResolvedValue(Response.json([{ found: { name, fields } }]));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "true");
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "demo-school");
  vi.stubGlobal("fetch", read);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("reading a teacher's app listing for a cached page", () => {
  it("reads the title and visibility, as a visitor", async () => {
    found({
      title: { stringValue: "  Circles  " },
      visible: { booleanValue: false },
    });
    expect(await readAppListing("circle-properties")).toEqual({
      title: "Circles",
      visible: false,
    });
    const [url, options] = read.mock.calls[0];
    expect(url).toBe(
      "http://127.0.0.1:8080/v1/projects/demo-school/databases/(default)/documents:batchGet",
    );
    expect(JSON.parse(String(options?.body))).toEqual({
      documents: [name],
      mask: { fieldPaths: ["title", "visible"] },
    });
  });

  it("uses the real project outside the emulators", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_EMULATORS", "false");
    found({});
    await readAppListing("circle-properties");
    expect(String(read.mock.calls[0][0])).toMatch(
      /^https:\/\/firestore\.googleapis\.com\//,
    );
  });

  it("treats a listing with no visibility as visible", async () => {
    found({});
    expect(await readAppListing("circle-properties")).toEqual({
      title: "",
      visible: true,
    });
  });

  it("gives up quickly rather than hold up a page", async () => {
    found({});
    await readAppListing("circle-properties");
    expect(read.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    ["no listing saved", 200, [{ missing: name }]],
    ["another document", 200, [{ found: { name: `${name}-other` } }]],
    ["a refused read", 403, {}],
    ["an invalid answer", 200, {}],
  ])("returns nothing for %s", async (_, status, body) => {
    read.mockResolvedValue(Response.json(body, { status: Number(status) }));
    expect(await readAppListing("circle-properties")).toBeNull();
  });

  it("returns nothing if Firestore cannot be reached", async () => {
    read.mockRejectedValue(new Error("timeout"));
    expect(await readAppListing("circle-properties")).toBeNull();
  });
});
