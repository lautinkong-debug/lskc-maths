import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/base-values";
mkdirSync(output, { recursive: true });
const perimeterToggle = (lesson: Locator) =>
  lesson.getByRole("checkbox", { name: "Show base perimeter", exact: true });
const areaToggle = (lesson: Locator) =>
  lesson.getByRole("checkbox", { name: "Show base area", exact: true });
const perimeter = (svg: Locator) =>
  svg.locator('[data-base-value="perimeter"]');
const area = (svg: Locator) => svg.locator('[data-base-value="area"]');

async function expectValueLayout(svg: Locator) {
  const issues = await svg.evaluate((node) => {
    const frame = node.getBoundingClientRect();
    const values = [...node.querySelectorAll("[data-base-values] text")];
    const others = [...node.querySelectorAll("text")];
    return values.flatMap((value) => {
      const a = value.getBoundingClientRect();
      const defects: string[] = [];
      if (
        a.left < frame.left - 1 ||
        a.right > frame.right + 1 ||
        a.top < frame.top - 1 ||
        a.bottom > frame.bottom + 1
      )
        defects.push(`Clipped: ${value.textContent}`);
      for (const other of others) {
        if (other === value) continue;
        const b = other.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          defects.push(`${value.textContent} / ${other.textContent}`);
      }
      return defects;
    });
  });
  expect(issues).toEqual([]);
}

test("base perimeter and area reveal separately without working or other unknowns", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, p, b, answer] of [
      ["example-9-11", "22", "26", "338"],
      ["ex9b-35", "56", "192", "612"],
      ["revision-31", "80", "375", "999"],
      ["mc-11", "64", "240", "192"],
      ["revision-26", "36", "54", "396"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      const pToggle = perimeterToggle(lesson),
        bToggle = areaToggle(lesson);
      await expect(pToggle).not.toBeChecked();
      await expect(bToggle).not.toBeChecked();
      const viewBox = await svg.getAttribute("viewBox");
      const next = lesson.getByRole("button", {
        name: "Next step",
        exact: true,
      });
      await next.scrollIntoViewIfNeeded();
      const before = await next.boundingBox();
      await pToggle.check();
      await expect(perimeter(svg)).toContainText(`P = ${p} cm`);
      await expect(area(svg)).toHaveCount(0);
      await pToggle.uncheck();
      await bToggle.check();
      await expect(perimeter(svg)).toHaveCount(0);
      await expect(area(svg)).toContainText(`B = ${b} cm²`);
      await pToggle.check();
      await expect(svg).toHaveAttribute("viewBox", viewBox!);
      expect(await next.boundingBox()).toEqual(before);
      const water = svg.locator("[data-depth-value]");
      if (await water.count())
        await expect(water).toHaveText(id === "mc-11" ? "Δd" : "d");
      if (id === "revision-26")
        await expect(svg.locator("[data-dimension-label] text")).toHaveText(
          Array(6).fill("3 cm"),
        );
      for (const stage of [0, 1, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        await expect(perimeter(svg)).toContainText(`P = ${p} cm`);
        await expect(area(svg)).toContainText(`B = ${b} cm²`);
        await expect(svg).not.toHaveAttribute("data-solved", "true");
        await expect(svg).not.toContainText(`${answer} cm²`);
        await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
        await expectValueLayout(svg);
      }
      if (id === "mc-11") await expect(area(svg)).toContainText("not added");
      await svg.screenshot({ path: `${output}/${id}-${width}.png` });
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      const clean = page.getByRole("dialog").getByTestId("surface-diagram");
      await expect(area(clean)).toContainText(`B = ${b} cm²`);
      await expect(clean.locator("[data-export-working]")).toHaveCount(0);
      await expectValueLayout(clean);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(pToggle).not.toBeChecked();
      await expect(bToggle).not.toBeChecked();
      await expect(svg.locator("[data-base-value]")).toHaveCount(0);
      await pToggle.check();
      await bToggle.check();
    }
  }
  await page.goto("/apps/surface-area#revision-33");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "revision-33",
  );
  await expect(page.getByRole("checkbox", { name: /Show base/ })).toHaveCount(
    0,
  );
});

test("base values fit every prism and distinguish holes and omitted faces", async ({
  page,
}) => {
  test.setTimeout(180_000);
  let views = 0;
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const question of questions)
      for (const variant of question.variants) {
        if (variant.geometry.kind !== "prism") continue;
        await page.goto(`/apps/surface-area#${question.id}/${variant.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-preset", question.id);
        await expect(lesson).toHaveAttribute("data-variant", variant.id);
        await perimeterToggle(lesson).check();
        await areaToggle(lesson).check();
        const svg = lesson.getByTestId("surface-diagram").first();
        await expect(svg.locator("[data-base-value]")).toHaveCount(2);
        if (question.id === "revision-27") {
          await expect(perimeter(svg)).toContainText(
            "Outer + inner perimeterP = 64 cm",
          );
          await expect(area(svg)).toContainText("B = 64 cm²");
        }
        if (question.id === "ex9b-27") {
          await expect(perimeter(svg)).toContainText("P ≈ 74.08319 cm");
          await expect(svg.locator("[data-retained-widths]")).toHaveText(
            "Retained widths = 50 cm (opening excluded)",
          );
        }
        for (const stage of [0, 2, 4]) {
          await lesson
            .getByRole("navigation")
            .getByRole("button")
            .nth(stage)
            .click();
          if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
          await expectValueLayout(svg);
          views++;
        }
        if (["revision-27", "ex9b-27"].includes(question.id))
          await svg.screenshot({
            path: `${output}/${question.id}-${width}.png`,
          });
      }
  }
  writeFileSync(
    `${output}/layout-audit.json`,
    JSON.stringify({ views, findings: [] }, null, 2),
  );
});

test("base-value image exports keep the three reveals independent of answers", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [id, p, b] of [
    ["ex9b-35", "56", "192"],
    ["revision-27", "64", "64"],
    ["ex9b-27", "74.08319", "288"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await perimeterToggle(lesson).check();
    await areaToggle(lesson).check();
    if (id === "ex9b-35")
      await lesson
        .getByRole("checkbox", { name: "Show water depth", exact: true })
        .check();
    for (const layout of ["current", "comparison"]) {
      if (layout === "comparison") {
        await lesson.getByRole("navigation").getByRole("button").nth(2).click();
        await lesson.locator("#surface-unfold").fill("100");
      }
      await lesson.getByLabel("Image layout").selectOption(layout);
      for (const format of ["SVG", "PNG"]) {
        const pending = page.waitForEvent("download");
        await lesson
          .getByRole("button", { name: `Download ${format}`, exact: true })
          .click();
        const download = await pending;
        expect(await download.failure()).toBeNull();
        const data = readFileSync((await download.path())!);
        writeFileSync(
          `${output}/${id}-${layout}.${format.toLowerCase()}`,
          data,
        );
        if (format === "SVG") {
          const reopened = await page.context().newPage();
          await reopened.setContent(data.toString());
          const svg = reopened.locator("svg");
          await expect(perimeter(svg)).toContainText(
            `P ${id === "ex9b-27" ? "≈" : "="} ${p} cm`,
          );
          await expect(area(svg)).toContainText(`B = ${b} cm²`);
          if (id === "ex9b-35") await expect(svg).toContainText("d = 7.5 cm");
          await expect(svg.locator("[data-export-working]")).toHaveCount(0);
          await expect(svg).not.toHaveAttribute("data-solved", "true");
          await expect(svg).not.toContainText(
            id === "ex9b-35"
              ? "612 cm²"
              : id === "revision-27"
                ? "256 cm²"
                : "976 cm²",
          );
          await expectValueLayout(svg);
          await svg.screenshot({
            path: `${output}/${id}-${layout}-reopened.png`,
          });
          await reopened.close();
        } else
          expect(data.subarray(0, 8)).toEqual(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
          );
      }
    }
  }
});
