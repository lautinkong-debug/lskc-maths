import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-bank-preview";
mkdirSync(output, { recursive: true });

test("source givens stay visible and a newly wetted band has no caps", async ({
  page,
}) => {
  for (const [id, given] of [
    ["ex9b-16", "Given base area B = 3.9 cm²"],
    ["ex9b-31", "15 cm by 8 cm by 3 cm"],
    ["ex9b-17", "perpendicular altitude 2 cm"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
    await expect(lesson.getByTestId("surface-annotations")).toBeVisible();
    await expect(lesson.getByTestId("surface-annotations")).toContainText(
      given,
    );
  }
  await page.goto("/apps/surface-area#mc-11");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "mc-11",
  );
  await expect(
    page
      .getByTestId("surface-diagram")
      .first()
      .locator('path[fill-rule="evenodd"]'),
  ).toHaveCount(0);
});

test("all 69 textbook variants unfold and reveal their checked answer", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const q of questions)
    for (const v of q.variants) {
      await page.goto(`/apps/surface-area#${q.id}/${v.id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", q.id);
      await expect(lesson).toHaveAttribute("data-variant", v.id);
      await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
      const steps = lesson.getByRole("navigation").getByRole("button");
      await steps.nth(2).click();
      const slider = lesson.locator("#surface-unfold");
      await slider.fill("50");
      await expect(slider).toHaveValue("50");
      const markup = await lesson
        .getByTestId("surface-diagram")
        .first()
        .innerHTML();
      expect(markup, `${q.id}/${v.id}`).not.toMatch(/(?:NaN|Infinity)/);
      await slider.fill("100");
      await steps.nth(4).click();
      await lesson
        .getByRole("button", { name: "Show working", exact: true })
        .click();
      await lesson
        .getByRole("checkbox", { name: "Show final answer", exact: true })
        .check();
      await expect(lesson.getByTestId("surface-working")).toContainText(
        v.answer,
      );
    }
  expect(errors).toEqual([]);
});

test("bank filters, selection, variants and invalid-link fallback", async ({
  page,
}) => {
  await page.goto("/apps/surface-area");
  await page
    .getByText("Textbook presets · Example 9.11", { exact: false })
    .click();
  await page.getByLabel("Type of solid").selectOption("Hollow prism");
  await expect(page.locator("#surface-question option")).toHaveCount(1);
  await page.getByLabel("Choose a question").selectOption("revision-27");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "revision-27",
  );
  await page
    .getByText("Textbook presets · Revision Exercise 9 · Q27", { exact: false })
    .click();
  await page.getByLabel("Search textbook presets").fill("Q18");
  await page.getByLabel("Choose a question").selectOption("ex9b-18");
  await expect(
    page.getByLabel("Solid or arrangement").locator("option"),
  ).toHaveCount(9);
  await page.getByLabel("Solid or arrangement").selectOption("arrangement-9");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-variant",
    "arrangement-9",
  );
  await page.goto("/apps/surface-area#not-a-question/not-a-solid");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "example-9-11",
  );
});

for (const id of [
  "ex9b-24",
  "ex9b-27",
  "revision-27",
  "revision-31",
  "revision-33",
  "mc-11",
  "example-9-12",
]) {
  test(`real PNG and SVG exports: ${id}`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await lesson.getByRole("navigation").getByRole("button").nth(4).click();
    await page.getByLabel("Image layout").selectOption("comparison");
    const save = async (format: "SVG" | "PNG", suffix: string) => {
      const pending = page.waitForEvent("download");
      await page
        .getByRole("button", { name: `Download ${format}`, exact: true })
        .click();
      const file = await pending;
      expect(await file.failure()).toBeNull();
      const bytes = readFileSync((await file.path())!);
      expect(bytes.byteLength).toBeGreaterThan(100);
      writeFileSync(`${output}/${id}-${suffix}.${format.toLowerCase()}`, bytes);
      return bytes;
    };
    const hidden = (await save("SVG", "hidden")).toString();
    expect(hidden).not.toContain("data-export-working");
    expect(hidden).not.toContain("var(--color");
    await page
      .getByRole("button", { name: "Show working", exact: true })
      .click();
    await page
      .getByRole("checkbox", { name: "Show final answer", exact: true })
      .check();
    const svg = await save("SVG", "shown");
    expect(svg.toString()).toContain("data-export-working");
    const png = await save("PNG", "shown");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(2400);
    const preview = await page.context().newPage();
    await preview.setContent(
      `<img alt="Exported diagram" style="width:800px" src="data:image/png;base64,${png.toString("base64")}">`,
    );
    await expect(preview.getByRole("img")).toHaveJSProperty(
      "naturalWidth",
      2400,
    );
    await preview.screenshot({
      path: `${output}/${id}-export.png`,
      fullPage: true,
    });
    await preview.close();
    await page.screenshot({
      path: `${output}/${id}-desktop.png`,
      fullPage: true,
    });
  });
}

test("complex presets fit phone and projection layouts", async ({ page }) => {
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 768 });
    for (const id of ["ex9b-24", "revision-27", "revision-33", "mc-11"]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await lesson.getByRole("navigation").getByRole("button").nth(4).click();
      await lesson
        .getByRole("button", { name: "Show working", exact: true })
        .click();
      await lesson
        .getByRole("checkbox", { name: "Show final answer", exact: true })
        .check();
      if (width > 1000)
        await page
          .getByRole("button", { name: "Projection mode", exact: true })
          .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${output}/${id}-${width}.png`,
        fullPage: true,
      });
      if (width > 1000)
        await page
          .getByRole("button", { name: "Leave projection mode", exact: false })
          .click();
    }
  }
});
