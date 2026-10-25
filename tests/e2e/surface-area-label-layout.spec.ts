import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/label-layout";
mkdirSync(output, { recursive: true });

test("staircase givens label the solid and strip without colliding with base operators", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto("/apps/surface-area#revision-26");
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", "revision-26");
    const diagram = lesson.getByTestId("surface-diagram").first();
    for (const stage of [0, 1, 2, 3, 4]) {
      await lesson
        .getByRole("navigation")
        .getByRole("button")
        .nth(stage)
        .click();
      for (const progress of stage === 2 ? [0, 50, 100] : [null]) {
        if (progress !== null)
          await lesson.locator("#surface-unfold").fill(String(progress));
        const givens = diagram.locator("[data-dimension-label] text");
        await expect(givens).toHaveCount(6);
        expect(await givens.allTextContents()).toEqual(Array(6).fill("3 cm"));
        await expect(diagram.getByText("9 cm", { exact: true })).toHaveCount(0);
        const collisions = await diagram.evaluate((svg) => {
          const givens = [
            ...svg.querySelectorAll<SVGTextElement>(
              "[data-dimension-label] text",
            ),
          ];
          const other = [
            ...svg.querySelectorAll<SVGTextElement>("text"),
          ].filter((n) => !n.closest("[data-dimension-label]"));
          const overlap = (a: SVGTextElement, b: SVGTextElement) => {
            const x = a.getBBox(),
              y = b.getBBox();
            return (
              Math.min(x.x + x.width, y.x + y.width) - Math.max(x.x, y.x) > 1 &&
              Math.min(x.y + x.height, y.y + y.height) - Math.max(x.y, y.y) > 1
            );
          };
          return givens.flatMap((label, i) =>
            [...givens.slice(i + 1), ...other]
              .filter((o) => overlap(label, o))
              .map((o) => `${label.textContent}/${o.textContent}`),
          );
        });
        expect(
          collisions,
          `${width}px stage${stage} unfold${progress}`,
        ).toEqual([]);
        if (stage === 2 || stage === 4) {
          await expect(diagram.locator("[data-base-caption]")).toHaveCount(2);
          await expect(diagram.locator("[data-base-operator]")).toHaveCount(
            stage === 2 ? 1 : 2,
          );
          const operators = await diagram.evaluate((svg) => {
            const bases = [
              ...svg.querySelectorAll<SVGTextElement>(
                "[data-base-caption] text",
              ),
            ];
            const operators = [
              ...svg.querySelectorAll<SVGTextElement>("[data-base-operator]"),
            ];
            return bases.flatMap((b) =>
              operators
                .filter((o) => {
                  const x = b.getBBox(),
                    y = o.getBBox();
                  return (
                    Math.min(x.x + x.width, y.x + y.width) >
                      Math.max(x.x, y.x) &&
                    Math.min(x.y + x.height, y.y + y.height) + 8 >
                      Math.max(x.y, y.y)
                  );
                })
                .map(() => "base/operator gap below 8px"),
            );
          });
          expect(operators).toEqual([]);
          await diagram.screenshot({
            path: `${output}/revision26-${width}-stage${stage}-${progress ?? 100}.png`,
          });
          if (stage === 4) {
            await lesson
              .getByRole("checkbox", { name: "Show final answer", exact: true })
              .check();
            await lesson
              .getByRole("button", { name: "Show working", exact: true })
              .click();
            await expect(
              diagram.locator("[data-dimension-label] text"),
            ).toHaveCount(8);
            await expect(
              diagram
                .locator("[data-dimension-label]")
                .getByText("9 cm", { exact: true }),
            ).toHaveCount(2);
            await lesson
              .getByRole("button", { name: "Hide working", exact: true })
              .click();
            await expect(
              diagram.locator("[data-dimension-label] text"),
            ).toHaveCount(6);
          }
        }
      }
    }
  }
});

test("detached base captions and addition signs keep their reserved gap for every prism", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const q of questions)
      for (const v of q.variants) {
        if (v.geometry.kind !== "prism" || !v.geometry.baseCount) continue;
        await page.goto(`/apps/surface-area#${q.id}/${v.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-preset", q.id);
        const svg = lesson.getByTestId("surface-diagram").first();
        for (const stage of [2, 4]) {
          await lesson
            .getByRole("navigation")
            .getByRole("button")
            .nth(stage)
            .click();
          await expect(svg.locator("[data-base-caption]")).toHaveCount(
            v.geometry.baseCount,
          );
          await expect(svg.locator("[data-base-operator]")).toHaveCount(
            stage === 4 ? v.geometry.baseCount : v.geometry.baseCount - 1,
          );
          const crowded = await svg.evaluate((svg) => {
            const bases = [
              ...svg.querySelectorAll<SVGTextElement>(
                "[data-base-caption] text",
              ),
            ];
            const operators = [
              ...svg.querySelectorAll<SVGTextElement>("[data-base-operator]"),
            ];
            return bases.some((b) =>
              operators.some((o) => {
                const a = b.getBBox(),
                  z = o.getBBox();
                return (
                  Math.min(a.x + a.width, z.x + z.width) > Math.max(a.x, z.x) &&
                  Math.min(a.y + a.height, z.y + z.height) + 8 >
                    Math.max(a.y, z.y)
                );
              }),
            );
          });
          expect(crowded, `${q.id}/${v.id},${width}px,stage${stage}`).toBe(
            false,
          );
        }
      }
  }
});

test("given perimeter lengths survive current and comparison image export", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 900 });
  for (const id of ["revision-26", "ex9b-24", "revision-27"]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    for (const stage of [2, 4]) {
      await lesson
        .getByRole("navigation")
        .getByRole("button")
        .nth(stage)
        .click();
      if (stage === 2) await lesson.locator("#surface-unfold").fill("50");
      await lesson
        .getByTestId("surface-diagram")
        .first()
        .screenshot({ path: `${output}/${id}-phone-stage${stage}.png` });
    }
    if (id !== "revision-26") continue;
    await lesson.getByRole("navigation").getByRole("button").nth(2).click();
    await lesson.locator("#surface-unfold").fill("50");
    for (const layout of ["current", "comparison"]) {
      await lesson.getByLabel("Image layout").selectOption(layout);
      const pending = page.waitForEvent("download");
      await lesson
        .getByRole("button", { name: "Download SVG", exact: true })
        .click();
      const download = await pending;
      expect(await download.failure()).toBeNull();
      const content = readFileSync((await download.path())!, "utf8");
      writeFileSync(`${output}/staircase-stage2-${layout}.svg`, content);
      const reopened = await page.context().newPage();
      await reopened.setContent(content);
      const svg = reopened.locator("svg");
      await expect(svg.locator("[data-dimension-label] text")).toHaveCount(
        layout === "comparison" ? 12 : 6,
      );
      await expect(svg.getByText("9 cm", { exact: true })).toHaveCount(0);
      await expect(svg.locator("[data-base-caption] text")).toHaveCount(2);
      const clippedBases = await svg.evaluate((node) => {
        const bounds = (node as SVGSVGElement).viewBox.baseVal;
        return [
          ...node.querySelectorAll<SVGTextElement>("[data-base-caption] text"),
        ]
          .filter((label) => {
            const rect = label.getBBox();
            return (
              rect.x < bounds.x ||
              rect.y < bounds.y ||
              rect.x + rect.width > bounds.x + bounds.width ||
              rect.y + rect.height + 8 > bounds.y + bounds.height
            );
          })
          .map((label) => label.textContent);
      });
      expect(
        clippedBases,
        `${layout}: both detached bases and their captions must fit the export`,
      ).toEqual([]);
      await svg.screenshot({
        path: `${output}/staircase-stage2-${layout}-export.png`,
      });
      await reopened.close();
      const pngPending = page.waitForEvent("download");
      await lesson
        .getByRole("button", { name: "Download PNG", exact: true })
        .click();
      const pngDownload = await pngPending;
      const png = readFileSync((await pngDownload.path())!);
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(2400);
      writeFileSync(`${output}/staircase-stage2-${layout}.png`, png);
    }
  }
});
