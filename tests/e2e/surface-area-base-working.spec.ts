import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/base-working";
mkdirSync(output, { recursive: true });
const pToggle = (root: Locator) =>
  root.getByRole("checkbox", { name: "Show perimeter working", exact: true });
const bToggle = (root: Locator) =>
  root.getByRole("checkbox", { name: "Show base-area working", exact: true });
const pWork = (svg: Locator) => svg.locator('[data-base-working="perimeter"]');
const bWork = (svg: Locator) => svg.locator('[data-base-working="area"]');

async function fits(svg: Locator) {
  const issues = await svg.evaluate((node) => {
    const frame = node.getBoundingClientRect();
    const texts = [...node.querySelectorAll("text")];
    return [
      ...node.querySelectorAll(
        "[data-base-working] text, [data-base-values] text",
      ),
    ].flatMap((text) => {
      const a = text.getBoundingClientRect(),
        result: string[] = [];
      if (
        a.left < frame.left - 1 ||
        a.right > frame.right + 1 ||
        a.top < frame.top - 1 ||
        a.bottom > frame.bottom + 1
      )
        result.push(`Clipped ${text.textContent}`);
      for (const other of texts) {
        if (other === text) continue;
        const b = other.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          result.push(`${text.textContent} / ${other.textContent}`);
      }
      return result;
    });
  });
  expect(issues).toEqual([]);
}

test("base working reveals independently, preserves unknowns and never enables the final answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const id of ["example-9-11", "ex9b-35", "revision-29"]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      const box = await svg.getAttribute("viewBox");
      const next = lesson.getByRole("button", {
        name: "Next step",
        exact: true,
      });
      await next.scrollIntoViewIfNeeded();
      const position = await next.boundingBox();
      await pToggle(lesson).check();
      await expect(pWork(svg)).toHaveCount(1);
      await expect(bWork(svg)).toHaveCount(0);
      await expect(svg.locator("[data-base-value]")).toHaveCount(0);
      await pToggle(lesson).uncheck();
      await bToggle(lesson).check();
      await expect(pWork(svg)).toHaveCount(0);
      await expect(bWork(svg)).toHaveCount(1);
      await pToggle(lesson).check();
      expect(await next.boundingBox()).toEqual(position);
      await expect(svg).toHaveAttribute("viewBox", box!);
      for (const stage of [0, 1, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        await expect(pWork(svg)).toHaveCount(1);
        await expect(bWork(svg)).toHaveCount(1);
        await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
        await expect(svg).not.toHaveAttribute("data-solved", "true");
        await expect(svg).not.toContainText(
          id === "example-9-11"
            ? "338 cm²"
            : id === "ex9b-35"
              ? "612 cm²"
              : "167 cm²",
        );
        if (id === "revision-29") {
          await expect(pWork(svg)).toContainText("2x + 26 cm");
          await expect(bWork(svg)).toContainText("3x + 14 cm²");
          await expect(svg).not.toContainText("x = 2.5");
        }
        if (id === "ex9b-35" && stage < 2)
          await expect(svg.locator("[data-depth-value]")).toHaveText("d");
        if (id === "ex9b-35") await expect(svg).not.toContainText("7.5 cm");
        await fits(svg);
      }
      await svg.screenshot({ path: `${output}/${id}-${width}.png` });
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      const clean = page.getByRole("dialog").getByTestId("surface-diagram");
      await expect(pWork(clean)).toHaveCount(1);
      await expect(bWork(clean)).toHaveCount(1);
      await expect(clean.locator("[data-export-working]")).toHaveCount(0);
      await fits(clean);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      await lesson
        .getByRole("checkbox", { name: "Dimensions", exact: true })
        .uncheck();
      await expect(pToggle(lesson)).toBeDisabled();
      await expect(svg.locator("[data-base-working]")).toHaveCount(0);
      await lesson
        .getByRole("checkbox", { name: "Dimensions", exact: true })
        .check();
      await expect(svg.locator("[data-base-working]")).toHaveCount(2);
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(pToggle(lesson)).not.toBeChecked();
      await expect(bToggle(lesson)).not.toBeChecked();
      await expect(svg.locator("[data-base-working]")).toHaveCount(0);
      await pToggle(lesson).check();
    }
  }
});

test("base calculations fit every textbook prism on phones and projectors", async ({
  page,
}) => {
  test.setTimeout(240_000);
  let views = 0;
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const q of questions)
      for (const v of q.variants) {
        if (v.geometry.kind !== "prism") continue;
        await page.goto(`/apps/surface-area#${q.id}/${v.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-variant", v.id);
        await expect(pToggle(lesson)).not.toBeChecked();
        await expect(bToggle(lesson)).not.toBeChecked();
        for (const name of [
          "Show base perimeter",
          "Show base area",
          "Show perimeter working",
          "Show base-area working",
        ])
          await lesson.getByRole("checkbox", { name, exact: true }).check();
        const svg = lesson.getByTestId("surface-diagram").first();
        for (const stage of [0, 2, 4]) {
          await lesson
            .getByRole("navigation")
            .getByRole("button")
            .nth(stage)
            .click();
          if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
          await expect(svg.locator("[data-base-working]")).toHaveCount(2);
          await fits(svg);
          views++;
        }
        if (["ex9b-24", "ex9b-27", "revision-27", "ex9b-8"].includes(q.id))
          await svg.screenshot({ path: `${output}/${q.id}-${width}.png` });
      }
  }
  writeFileSync(
    `${output}/layout-audit.json`,
    JSON.stringify({ views, findings: [] }, null, 2),
  );
});

test("separate base working survives clean current and comparison PNG SVG exports", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [id, kind, forbidden] of [
    ["ex9b-35", "perimeter", "612 cm²"],
    ["revision-29", "area", "167 cm²"],
    ["revision-27", "both", "256 cm²"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    if (kind !== "area") await pToggle(lesson).check();
    if (kind !== "perimeter") await bToggle(lesson).check();
    if (id === "ex9b-35")
      await lesson
        .getByRole("checkbox", { name: "Show water depth", exact: true })
        .check();
    for (const layout of ["current", "comparison"]) {
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
          await expect(pWork(svg)).toHaveCount(kind === "area" ? 0 : 1);
          await expect(bWork(svg)).toHaveCount(kind === "perimeter" ? 0 : 1);
          await expect(svg.locator("[data-export-working]")).toHaveCount(0);
          await expect(svg).not.toHaveAttribute("data-solved", "true");
          await expect(svg).not.toContainText(forbidden);
          if (id === "ex9b-35") await expect(svg).toContainText("d = 7.5 cm");
          if (id === "revision-29")
            await expect(bWork(svg)).toContainText("3x + 14 cm²");
          await fits(svg);
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
