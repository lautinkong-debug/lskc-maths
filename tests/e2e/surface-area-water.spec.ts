import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "out/surface-area-release/water";
mkdirSync(output, { recursive: true });

test("water is visible inside the full tank and only the required tank material is counted", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, height, depth] of [
      ["ex9b-35", "20", "7.5"],
      ["revision-31", "10", "7.8"],
      ["mc-11", "schematic", "9"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const diagram = lesson.getByTestId("surface-diagram").first();
      const tank = diagram.locator("[data-water-tank]");
      await expect(tank).toHaveAttribute("data-tank-height", height);
      await expect(tank).toHaveAttribute("data-water-depth", depth);
      await expect(
        tank.locator('[data-wet-wall][data-counted="true"]'),
      ).toHaveCount(4);
      await expect(tank.locator("[data-free-water-surface]")).toHaveAttribute(
        "data-counted",
        "false",
      );
      await expect(tank.locator("[data-tank-bottom]")).toHaveAttribute(
        "data-counted",
        id === "mc-11" ? "false" : "true",
      );
      await expect(tank.locator("[data-depth-value]")).toHaveText(
        id === "mc-11" ? "Δd" : "d",
      );
      // Depth measures the floor-to-waterline distance, or only the rise for MC11.
      const geometry = await tank.evaluate((node) => {
        const plane = node.querySelector<SVGPolygonElement>(
          "[data-free-water-surface]",
        )!;
        const bottom =
          node.querySelector<SVGPolygonElement>("[data-tank-bottom]")!;
        const wall = node.querySelector<SVGPolygonElement>(
          '[data-wet-wall="0"]',
        )!;
        const bracket = node
          .querySelector<SVGPathElement>("[data-depth-bracket]")!
          .getBBox();
        return {
          waterY: plane.points.getItem(1).y,
          floorY: bottom.points.getItem(1).y,
          wetTop: wall.points.getItem(2).y,
          wetBottom: wall.points.getItem(1).y,
          bracketTop: bracket.y,
          bracketBottom: bracket.y + bracket.height,
        };
      });
      expect(geometry.waterY).toBeLessThan(geometry.floorY);
      expect(geometry.bracketTop).toBeCloseTo(geometry.waterY, 4);
      expect(geometry.bracketBottom).toBeCloseTo(geometry.wetBottom, 4);
      if (id === "mc-11") {
        expect(geometry.wetBottom).toBeLessThan(geometry.floorY);
        await expect(
          tank.locator('[data-submerged-objects="balls"] circle'),
        ).toHaveCount(2);
        await expect(tank).toContainText("schematic");
      } else expect(geometry.wetBottom).toBeCloseTo(geometry.floorY, 4);
      if (id === "revision-31") {
        await expect(tank).toContainText("40% full");
        await expect(
          tank.locator('[data-submerged-objects="stones"] path'),
        ).toHaveCount(3);
      }
      if (id === "ex9b-35")
        await expect(tank).toHaveAttribute("data-closed-tank", "true");
      const textDefects = await diagram.evaluate((svg) => {
        const frame = svg.getBoundingClientRect();
        const labels = [
          ...svg.querySelectorAll<SVGTextElement>(
            "[data-water-annotations] text",
          ),
        ];
        return labels.flatMap((a, index) => {
          const x = a.getBoundingClientRect();
          const issues =
            x.left < frame.left - 1 ||
            x.top < frame.top - 1 ||
            x.right > frame.right + 1 ||
            x.bottom > frame.bottom + 1
              ? [`outside: ${a.textContent}`]
              : [];
          for (const b of labels.slice(index + 1)) {
            const y = b.getBoundingClientRect();
            if (
              Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 &&
              Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1
            )
              issues.push(`${a.textContent} / ${b.textContent}`);
          }
          return issues;
        });
      });
      await diagram.screenshot({ path: `${output}/${id}-${width}.png` });
      expect(textDefects, `${id} ${width}px`).toEqual([]);
      await lesson.getByRole("navigation").getByRole("button").nth(2).click();
      await lesson.locator("#surface-unfold").fill("100");
      await expect(diagram.locator("[data-water-tank]")).toHaveCount(0);
      await expect(diagram.locator("[data-base-caption]")).toHaveCount(
        id === "mc-11" ? 0 : 1,
      );
    }
  }
});

test("tank and strip exports preserve the water context without revealing hidden depths", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1366, height: 1080 });
  for (const id of ["ex9b-35", "revision-31", "mc-11"]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    for (const format of ["SVG", "PNG"]) {
      const downloadEvent = page.waitForEvent("download");
      await lesson
        .getByRole("button", { name: `Download ${format}`, exact: true })
        .click();
      const download = await downloadEvent;
      expect(await download.failure()).toBeNull();
      const data = readFileSync((await download.path())!);
      writeFileSync(`${output}/${id}.${format.toLowerCase()}`, data);
      if (format === "SVG") {
        const source = data.toString();
        expect(source).toContain("data-free-water-surface");
        expect(source).toContain("Water surface: not counted");
        expect(source).not.toMatch(/d = (7\.5|7\.8|3) cm/);
      } else
        expect(data.subarray(0, 8)).toEqual(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        );
    }
    await lesson.getByRole("navigation").getByRole("button").nth(4).click();
    await lesson
      .getByRole("button", { name: "Show working", exact: true })
      .click();
    await lesson.getByLabel("Image layout").selectOption("comparison");
    const downloadEvent = page.waitForEvent("download");
    await lesson
      .getByRole("button", { name: "Download SVG", exact: true })
      .click();
    const download = await downloadEvent;
    const data = readFileSync((await download.path())!);
    writeFileSync(`${output}/${id}-comparison.svg`, data);
    expect(data.toString()).toContain(
      id === "mc-11"
        ? "Δd = 3 cm"
        : id === "ex9b-35"
          ? "d = 7.5 cm"
          : "d = 7.8 cm",
    );
  }
});
