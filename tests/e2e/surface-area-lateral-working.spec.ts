import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/lateral-working";
mkdirSync(output, { recursive: true });
const toggle = (root: Locator) =>
  root.getByRole("checkbox", {
    name: "Show lateral surface area working",
    exact: true,
  });
const working = (svg: Locator) => svg.locator("[data-lateral-working]");
async function fits(svg: Locator) {
  const issues = await svg.evaluate((node) => {
    const frame = node.getBoundingClientRect(),
      all = [...node.querySelectorAll("text")];
    return [
      ...node.querySelectorAll(
        "[data-lateral-working] text, [data-base-working] text, [data-base-values] text",
      ),
    ].flatMap((text) => {
      const a = text.getBoundingClientRect(),
        issues: string[] = [];
      if (
        a.left < frame.left - 1 ||
        a.right > frame.right + 1 ||
        a.top < frame.top - 1 ||
        a.bottom > frame.bottom + 1
      )
        issues.push(`Clipped ${text.textContent}`);
      for (const other of all) {
        if (other === text) continue;
        const b = other.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          issues.push(`${text.textContent} / ${other.textContent}`);
      }
      return issues;
    });
  });
  expect(issues).toEqual([]);
}

test("lateral working is independent of the base calculations and total answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, expected, hidden] of [
      ["example-9-11", "286 cm²", "338 cm²"],
      ["ex9b-35", "56 × d", "612 cm²"],
      ["revision-29", "(2x + 26) × 4", "167 cm²"],
      ["ex9b-27", "400 cm²", "976 cm²"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      await expect(toggle(lesson)).not.toBeChecked();
      const viewBox = await svg.getAttribute("viewBox");
      const next = lesson.getByRole("button", {
        name: "Next step",
        exact: true,
      });
      await next.scrollIntoViewIfNeeded();
      const before = await next.boundingBox();
      await toggle(lesson).check();
      expect(await next.boundingBox()).toEqual(before);
      await expect(svg).toHaveAttribute("viewBox", viewBox!);
      for (const stage of [0, 1, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        await expect(working(svg)).toContainText(expected);
        await expect(svg).not.toContainText(hidden);
        await expect(svg).not.toHaveAttribute("data-solved", "true");
        await expect(
          svg.locator("[data-base-working], [data-base-value]"),
        ).toHaveCount(0);
        await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
        await fits(svg);
      }
      if (id === "revision-29") {
        await lesson
          .getByRole("checkbox", { name: "Show base perimeter", exact: true })
          .check();
        await expect(working(svg)).toContainText("31 × 4 = 124 cm²");
        await expect(svg).not.toContainText("x = 2.5");
        await expect(svg).toHaveAttribute("viewBox", viewBox!);
      }
      if (id === "ex9b-35") {
        await lesson
          .getByRole("checkbox", { name: "Show water depth", exact: true })
          .check();
        await expect(working(svg)).toContainText("56 × 7.5 = 420 cm²");
        await expect(svg).not.toContainText(hidden);
        await expect(svg).toHaveAttribute("viewBox", viewBox!);
      }
      await svg.screenshot({ path: `${output}/${id}-${width}.png` });
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      const clean = page.getByRole("dialog").getByTestId("surface-diagram");
      await expect(working(clean)).toHaveCount(1);
      await expect(clean.locator("[data-export-working]")).toHaveCount(0);
      await expect(clean).not.toContainText(hidden);
      await fits(clean);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      await lesson
        .getByRole("checkbox", { name: "Dimensions", exact: true })
        .uncheck();
      await expect(toggle(lesson)).toBeDisabled();
      await expect(working(svg)).toHaveCount(0);
      await lesson
        .getByRole("checkbox", { name: "Dimensions", exact: true })
        .check();
      await toggle(lesson).uncheck();
      await expect(working(svg)).toHaveCount(0);
      await toggle(lesson).check();
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(toggle(lesson)).not.toBeChecked();
      await expect(working(svg)).toHaveCount(0);
      await toggle(lesson).check();
    }
  }
  await page.goto("/apps/surface-area#revision-33");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "revision-33",
  );
  await expect(toggle(page.getByTestId("surface-area-lesson"))).toHaveCount(0);
});

test("lateral and base workings fit together across the textbook bank", async ({
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
        for (const name of [
          "Show base perimeter",
          "Show base area",
          "Show perimeter working",
          "Show base-area working",
          "Show lateral surface area working",
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
          await expect(working(svg)).toHaveCount(1);
          await fits(svg);
          views++;
        }
        if (["ex9b-24", "revision-27"].includes(q.id))
          await svg.screenshot({ path: `${output}/${q.id}-${width}-all.png` });
      }
  }
  writeFileSync(
    `${output}/layout-audit.json`,
    JSON.stringify({ views, findings: [] }, null, 2),
  );
});

test("lateral-only PNG SVG exports keep the total answer hidden", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [id, result, total] of [
    ["example-9-11", "286 cm²", "338 cm²"],
    ["ex9b-35", "420 cm²", "612 cm²"],
    ["revision-29", "(2x + 26) × 4", "167 cm²"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await toggle(lesson).check();
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
          await expect(working(svg)).toContainText(result);
          await expect(svg).not.toContainText(total);
          await expect(
            svg.locator("[data-base-working], [data-export-working]"),
          ).toHaveCount(0);
          await expect(svg).not.toHaveAttribute("data-solved", "true");
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
