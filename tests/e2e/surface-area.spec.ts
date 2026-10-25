import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "out/surface-area-preview";
mkdirSync(output, { recursive: true });

test("teacher can unfold, reveal and reset Example 9.11", async ({ page }) => {
  await page.goto("/apps/surface-area");
  await expect(
    page.getByRole("heading", { name: "Surface Area Studio", exact: true }),
  ).toBeVisible();
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
  const next = lesson.getByRole("button", { name: "Next step", exact: true });
  await next.click();
  await next.click();
  await expect(
    lesson.getByRole("slider", { name: "Unfold the lateral faces" }),
  ).toBeVisible();
  await next.click();
  await lesson
    .getByRole("button", { name: "Show working", exact: true })
    .click();
  await expect(lesson.getByTestId("surface-working")).toContainText("286");
  await expect(lesson.getByTestId("surface-working")).not.toContainText("338");
  await next.click();
  await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
  await lesson
    .getByRole("button", { name: "Show working", exact: true })
    .click();
  await expect(lesson.getByTestId("surface-working")).not.toContainText("338");
  await lesson
    .getByRole("checkbox", { name: "Show final answer", exact: true })
    .check();
  await expect(lesson.getByTestId("surface-working")).toContainText("338");
  await lesson
    .getByRole("button", { name: "Reset lesson", exact: true })
    .click();
  await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
  await expect(next).toBeEnabled();
});

test("exports real PNG and SVG files without leaking hidden working", async ({
  page,
}) => {
  await page.goto("/apps/surface-area");
  await page.getByRole("button", { name: /Add the two bases/ }).click();
  const download = async (format: "PNG" | "SVG", name: string) => {
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", { name: `Download ${format}`, exact: true })
      .click();
    const file = await pending;
    expect(await file.failure()).toBeNull();
    const path = await file.path();
    if (!path) throw new Error("Downloaded file unavailable");
    const contents = readFileSync(path);
    expect(contents.byteLength).toBeGreaterThan(100);
    writeFileSync(`${output}/${name}`, contents);
    await expect(page.getByRole("status")).toContainText("Download requested");
    return readFileSync(`${output}/${name}`);
  };
  const hidden = (await download("SVG", "hidden-working.svg")).toString();
  expect(hidden).not.toContain("338 cm²");
  expect(hidden).not.toContain("286 cm²");
  expect(hidden).not.toContain("data-export-working");
  expect(hidden).not.toContain("var(--color");
  await page.getByRole("button", { name: "Show working", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Show final answer", exact: true })
    .check();
  const shown = (await download("SVG", "example-9-11.svg")).toString();
  expect(shown).toContain("338 cm²");
  expect(shown).toContain("286 cm²");
  const preview = await page.context().newPage();
  await preview.setContent(
    `<img alt="Reopened SVG" src="data:image/svg+xml;base64,${Buffer.from(shown).toString("base64")}">`,
  );
  await expect(preview.getByRole("img")).toHaveJSProperty("naturalWidth", 800);
  await preview.screenshot({
    path: `${output}/reopened-svg.png`,
    fullPage: true,
  });
  const png = await download("PNG", "example-9-11.png");
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.readUInt32BE(16)).toBe(2400);
  await preview.setContent(
    `<img alt="Reopened PNG" style="width:800px" src="data:image/png;base64,${png.toString("base64")}">`,
  );
  await expect(preview.getByRole("img")).toHaveJSProperty("naturalWidth", 2400);
  await preview.screenshot({
    path: `${output}/reopened-png.png`,
    fullPage: true,
  });
  await preview.close();
  await page.getByLabel("Image layout").selectOption("comparison");
  await page.getByRole("button", { name: "Hide working", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Show final answer", exact: true })
    .uncheck();
  const comparison = (
    await download("SVG", "comparison-hidden.svg")
  ).toString();
  expect(comparison).toContain("Original prism");
  expect(comparison).not.toContain("338 cm²");
  expect(comparison).not.toContain("286 cm²");
  expect(comparison).not.toContain("data-export-working");
  await page.getByRole("button", { name: "Show working", exact: true }).click();
  await download("PNG", "comparison.png");
  await page.getByLabel("Dimensions", { exact: true }).uncheck();
  await page.getByLabel("Face labels", { exact: true }).uncheck();
  await download("PNG", "no-dimensions.png");
});

test("selected faces stay linked to the original prism while unfolding", async ({
  page,
}) => {
  await page.goto("/apps/surface-area");
  const reference = page.getByTestId("surface-reference");
  for (const stage of [
    /Cut and unfold/,
    /Make one rectangle/,
    /Add the two bases/,
  ]) {
    await page.getByRole("button", { name: stage }).click();
    await expect(reference).toBeVisible();
    await page
      .getByRole("button", { name: "2 AB = 4 cm", exact: true })
      .click();
    await expect(reference.locator('[data-face="1"] polygon')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page
        .getByTestId("surface-diagram")
        .first()
        .locator('[data-face="1"] polygon'),
    ).toHaveAttribute("aria-pressed", "true");
  }
});

for (const width of [360, 390, 1366, 1920]) {
  test(`diagram and controls fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({
      width,
      height: width < 600 ? 844 : width === 1366 ? 768 : 1080,
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/apps/surface-area");
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toBeVisible();
    await page.screenshot({
      path: `${output}/folded-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: /Cut and unfold/ }).click();
    const slider = page.getByRole("slider", {
      name: "Unfold the lateral faces",
    });
    await slider.fill("50");
    await expect(slider).toHaveValue("50");
    await page.screenshot({
      path: `${output}/unfolding-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: /Add the two bases/ }).click();
    await page
      .getByRole("button", { name: "Show working", exact: true })
      .click();
    await page.screenshot({
      path: `${output}/bases-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("slider", { name: "Diagram zoom" }).fill("180");
    await page.getByRole("button", { name: "Fit", exact: true }).click();
    await expect(
      page.getByRole("slider", { name: "Diagram zoom" }),
    ).toHaveValue("100");
    await page
      .getByRole("button", { name: "Clean diagram", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Clean diagram", exact: true }),
    ).toBeFocused();
    if (width > 1000) {
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
      await page.screenshot({
        path: `${output}/presentation-${width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("keyboard, touch and reduced motion retain face correspondence", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/apps/surface-area");
  await page.getByRole("button", { name: /Trace the perimeter/ }).tap();
  const face = page.getByRole("button", { name: "2 AB = 4 cm", exact: true });
  await face.tap();
  await expect(face).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Cut and unfold/ }).tap();
  const slider = page.getByRole("slider", { name: "Unfold the lateral faces" });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-presenting",
    "true",
  );
  await page.screenshot({
    path: `${output}/presentation-phone.png`,
    fullPage: true,
  });
  await context.close();
});
