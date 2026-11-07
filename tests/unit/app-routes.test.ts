import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appTitles } from "@/apps/appRoutes";
import { appRegistry } from "@/apps/registry";

describe("the /apps/[slug] route", () => {
  it("lists exactly the apps in the registry, with the same titles", () => {
    expect(appTitles).toEqual(
      Object.fromEntries(appRegistry.map((app) => [app.slug, app.title])),
    );
  });

  it("stays clear of the registry, which would load every app on the page", () => {
    const route = readFileSync("src/app/apps/[slug]/page.tsx", "utf8");
    expect(route).not.toContain("@/apps/registry");
    expect(route).toContain("generateStaticParams");
  });
});
