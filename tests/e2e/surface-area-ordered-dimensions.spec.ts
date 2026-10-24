import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolvePreset } from "../../src/apps/surface-area/bank";
import { faces } from "../../src/apps/surface-area/geometry";

const output = "out/surface-area-release/ordered-dimensions";
mkdirSync(output, { recursive: true });

async function expectOrderedDimensions(
  svg: Locator,
  id: string,
  maxRows: number,
) {
  const { variant } = resolvePreset(id);
  const expected = faces(variant)
    .filter((face) => face.label)
    .map((face) => face.label);
  await expect(svg.locator('[data-unfold="1"]')).toHaveCount(1);
  const result = await svg.evaluate((node) => {
    const flat = node.querySelector('[data-unfold="1"]')!;
    const textBoxes = [...flat.querySelectorAll<SVGTextElement>("text")].map(
      (text) => text.getBBox(),
    );
    const labels = [
      ...flat.querySelectorAll<SVGGElement>("[data-dimension-label]"),
    ]
      .map((g) => {
        const text = g.querySelector<SVGTextElement>("text")!;
        const lines = [...g.querySelectorAll<SVGLineElement>("line")];
        const x = Number(text.getAttribute("x")),
          y = Number(text.getAttribute("y"));
        const face = Number(g.getAttribute("data-dimension-face"));
        const polygon = flat.querySelector<SVGPolygonElement>(
          `[data-face="${face}"] polygon`,
        )!;
        const centre = polygon
          ? (polygon.points.getItem(0).x + polygon.points.getItem(1).x) / 2
          : NaN;
        return {
          value: text.textContent,
          x,
          y,
          centre,
          diagonal: lines.some(
            (l) => Math.abs(l.x1.baseVal.value - l.x2.baseVal.value) > 0.1,
          ),
          offset: lines.some((l) => Math.abs(l.x1.baseVal.value - x) > 0.1),
          crossesText: lines.some((line) =>
            textBoxes.some((box) => {
              const x = line.x1.baseVal.value,
                y1 = line.y1.baseVal.value,
                y2 = line.y2.baseVal.value;
              return (
                x > box.x - 2 &&
                x < box.x + box.width + 2 &&
                Math.min(y1, y2) < box.y + box.height + 2 &&
                Math.max(y1, y2) > box.y - 2
              );
            }),
          ),
        };
      })
      .sort((a, b) => a.x - b.x);
    return {
      labels,
      rows: [...new Set(labels.map((l) => l.y.toFixed(1)))].length,
    };
  });
  expect(result.labels.map((label) => label.value)).toEqual(expected);
  expect(result.rows).toBeLessThanOrEqual(maxRows);
  for (const label of result.labels) {
    expect(
      label.diagonal,
      `${id} ${label.value}: leader must be vertical`,
    ).toBe(false);
    expect(
      label.offset,
      `${id} ${label.value}: leader must align with its label`,
    ).toBe(false);
    expect(
      label.crossesText,
      `${id} ${label.value}: no leader through another label`,
    ).toBe(false);
    expect(
      Math.abs(label.x - label.centre),
      `${id} ${label.value}: centred on its own panel`,
    ).toBeLessThan(0.1);
  }
}

test("flat widths follow panel order in straight aligned lanes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const id of [
      "ex9b-24",
      "revision-26",
      "revision-29",
      "revision-27",
      "example-9-11",
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      for (const stage of [2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        const svg = lesson.getByTestId("surface-diagram").first();
        await expectOrderedDimensions(svg, id, width === 390 ? 4 : 3);
        if (stage === 2)
          await svg.screenshot({ path: `${output}/${id}-${width}.png` });
      }
    }
  }
});

test("ordered dimension lanes survive standalone teaching exports", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/apps/surface-area#ex9b-24");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toHaveAttribute("data-preset", "ex9b-24");
  await lesson.getByRole("navigation").getByRole("button").nth(2).click();
  await lesson.locator("#surface-unfold").fill("100");
  for (const layout of ["current", "comparison"]) {
    await lesson.getByLabel("Image layout").selectOption(layout);
    const pending = page.waitForEvent("download");
    await lesson
      .getByRole("button", { name: "Download SVG", exact: true })
      .click();
    const download = await pending;
    const contents = readFileSync((await download.path())!, "utf8");
    writeFileSync(`${output}/ex9b24-${layout}.svg`, contents);
    const reopened = await page.context().newPage();
    await reopened.setContent(contents);
    await expectOrderedDimensions(reopened.locator("svg"), "ex9b-24", 3);
    await reopened
      .locator("svg")
      .screenshot({ path: `${output}/ex9b24-${layout}.png` });
    await reopened.close();
  }
});
