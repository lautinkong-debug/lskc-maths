import { describe, expect, it } from "vitest";
import { safeReturnPath, canReturnTo } from "../../src/lib/returnPath";

describe("school sign-in return navigation", () => {
  it("keeps legitimate room, chapter and lesson context", () => {
    for (const path of [
      "/",
      "/manage/upload?level=F5&topic=f5-circles",
      "/join/ABC123",
      "/apps/linear-equations#lesson-2",
    ]) {
      expect(safeReturnPath(path)).toBe(path);
    }
  });
  it("rejects external, ambiguous, recursive and non-page destinations", () => {
    for (const path of [
      null,
      ["//outside.invalid"],
      "https://outside.invalid",
      "javascript:alert(1)",
      "//outside.invalid",
      "/.//outside.invalid",
      "/\\outside.invalid",
      "/%2foutside.invalid",
      "/login?next=/login",
      "/api/test",
      "/_next/static/file",
    ]) {
      expect(safeReturnPath(path)).toBe(null);
    }
  });
  it("returns school pupils to learning routes and only admitted staff to restricted routes", () => {
    expect(canReturnTo("/forms/f5", "viewer")).toBe(true);
    expect(canReturnTo("/boards", "viewer")).toBe(true);
    expect(canReturnTo("/manage/upload?level=F5", "viewer")).toBe(false);
    expect(canReturnTo("/challenges/new", "viewer")).toBe(false);
    expect(canReturnTo("/challenges/new", "teacher")).toBe(true);
    expect(canReturnTo("/admin/teachers", "teacher")).toBe(false);
    expect(canReturnTo("/admin/teachers", "admin")).toBe(true);
  });
});
