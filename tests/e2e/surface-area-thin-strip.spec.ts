import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "out/surface-area-release";
mkdirSync(output, { recursive: true });

async function checkFlatStrip(svg: Locator) {
  const captions = svg.locator('[data-unfold="1"] [data-boundary-caption]');
  await expect(captions).toHaveCount(2);
  await expect(captions.nth(0)).toContainText("Outer");
  await expect(captions.nth(1)).toContainText("Inner");
  const defects = await svg.evaluate((node) => {
    const flat = node.querySelector('[data-unfold="1"]')!;
    const labels = [
      ...flat.querySelectorAll<SVGTextElement>("[data-boundary-caption] text"),
    ];
    const overlaps = labels.flatMap((label, i) => {
      const a = label.getBBox();
      return labels
        .slice(i + 1)
        .filter((other) => {
          const b = other.getBBox();
          return (
            Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 &&
            Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1
          );
        })
        .map((other) => `${label.textContent}/${other.textContent}`);
    });
    const overflowingNumbers = [
      ...flat.querySelectorAll("[data-face]"),
    ].flatMap((face) => {
      const polygon = face.querySelector<SVGPolygonElement>("polygon")!;
      const label = face.querySelector<SVGTextElement>("text");
      if (!label) return [];
      const a = polygon.getBBox(),
        b = label.getBBox();
      return b.y < a.y - 1 || b.y + b.height > a.y + a.height + 1
        ? [label.textContent]
        : [];
    });
    return { overlaps, overflowingNumbers };
  });
  expect(defects).toEqual({ overlaps: [], overflowingNumbers: [] });
}

test("thin hollow-prism strips keep captions and face selection readable on phones and exports", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/apps/surface-area#revision-27");
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", "revision-27");
    const svg = lesson.getByTestId("surface-diagram").first();
    for (const stage of [3, 4]) {
      await lesson
        .getByRole("navigation")
        .getByRole("button")
        .nth(stage)
        .click();
      await checkFlatStrip(svg);
      await expect(svg.getByText("H = 2 cm", { exact: true })).toBeVisible();
    }
    const choices = lesson.locator(
      '[aria-label="Choose a matching face"] button',
    );
    await expect(choices).toHaveCount(8);
    await choices.nth(4).click();
    await expect(choices.nth(4)).toHaveAttribute("aria-pressed", "true");
    await expect(svg.locator('[data-face="4"] polygon')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(svg.locator('[data-face="4"] polygon')).toHaveCSS(
      "fill",
      "rgb(241, 213, 74)",
    );
    await svg.screenshot({ path: `${output}/thin-selected-${width}.png` });
    if (width !== 390) continue;
    for (const layout of ["current", "comparison"]) {
      await lesson.getByLabel("Image layout").selectOption(layout);
      const download = page.waitForEvent("download");
      await lesson
        .getByRole("button", { name: "Download SVG", exact: true })
        .click();
      const file = await download;
      expect(await file.failure()).toBeNull();
      const contents = readFileSync((await file.path())!, "utf8");
      writeFileSync(`${output}/thin-${layout}.svg`, contents);
      const reopened = await page.context().newPage();
      await reopened.setContent(contents);
      await checkFlatStrip(reopened.locator("svg"));
      await reopened
        .locator("svg")
        .screenshot({ path: `${output}/thin-${layout}-export.png` });
      await reopened.close();
    }
  }
  await page.goto("/apps/surface-area#example-9-11");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toHaveAttribute("data-preset", "example-9-11");
  await lesson.getByRole("navigation").getByRole("button").nth(3).click();
  await expect(
    lesson.getByTestId("surface-diagram").first().locator("[data-face] text"),
  ).toHaveCount(4);
});
