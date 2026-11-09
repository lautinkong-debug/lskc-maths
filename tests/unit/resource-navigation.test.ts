import { describe, expect, it } from "vitest";
import {
  matchesResourceSearch,
  readResourceFilters,
  resourceHref,
  resourceReturn,
} from "../../src/lib/resourceNavigation";

describe("curriculum resource navigation", () => {
  it("keeps a filtered library link through a detail page and refresh", () => {
    const filters = readResourceFilters(
      new URLSearchParams("level=f5&topic=circles&q=arc+%26+angle"),
    );
    const detail = resourceHref("/apps/circle-properties", filters);
    expect(detail).toBe(
      "/apps/circle-properties?level=F5&topic=circles&q=arc+%26+angle",
    );
    expect(
      resourceReturn(
        "/apps",
        new URL(detail, "https://example.test").searchParams,
      ).href,
    ).toBe("/apps?level=F5&topic=circles&q=arc+%26+angle");
  });
  it("returns form-hub resources to that form using a local allowlisted route", () => {
    expect(
      resourceReturn(
        "/mistakes-book",
        new URLSearchParams("level=F6&from=form"),
      ),
    ).toEqual({ href: "/forms/f6", form: "F6" });
    expect(
      resourceReturn("/apps", new URLSearchParams("level=/other&from=form")),
    ).toEqual({ href: "/apps", form: null });
    expect(
      resourceReturn(
        "/apps",
        new URLSearchParams("level=F2&from=https://example.org"),
      ).href,
    ).toBe("/apps?level=F2");
  });
  it("finds an app by form, code and chapter words in any order", () => {
    expect(
      matchesResourceSearch("chapter 16   Form 5 circle", [
        "Basic Properties of Circles",
        "F5",
        "Ch16",
      ]),
    ).toBe(true);
    expect(matchesResourceSearch("F.2 Circle", ["Circle Lab", "F5"])).toBe(
      false,
    );
    expect(matchesResourceSearch("", ["Geometry"])).toBe(true);
  });
});
