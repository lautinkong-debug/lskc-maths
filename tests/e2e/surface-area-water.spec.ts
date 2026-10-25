import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "out/surface-area-release/water";
mkdirSync(output, { recursive: true });

test("water depth can be shown independently of working throughout the lesson", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, value, area] of [
      ["ex9b-35", "7.5", "612"],
      ["revision-31", "7.8", "999"],
      ["mc-11", "3", "192"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const diagram = lesson.getByTestId("surface-diagram").first();
      const toggle = lesson.getByRole("checkbox", {
        name: id === "mc-11" ? "Show water-level rise" : "Show water depth",
        exact: true,
      });
      await expect(toggle).not.toBeChecked();
      const next = lesson.getByRole("button", {
        name: "Next step",
        exact: true,
      });
      await next.scrollIntoViewIfNeeded();
      const before = await next.boundingBox();
      await toggle.check();
      expect(await next.boundingBox()).toEqual(before);
      await expect(diagram.locator("[data-depth-value]")).toHaveText(
        `${id === "mc-11" ? "Δd" : "d"} = ${value} cm`,
      );
      await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
      await expect(diagram).not.toHaveAttribute("data-solved", "true");
      const outside = await diagram.evaluate((svg) => {
        const frame = svg.getBoundingClientRect();
        return [...svg.querySelectorAll("[data-water-annotations] text")]
          .filter((t) => {
            const b = t.getBoundingClientRect();
            return (
              b.left < frame.left - 1 ||
              b.right > frame.right + 1 ||
              b.top < frame.top - 1 ||
              b.bottom > frame.bottom + 1
            );
          })
          .map((t) => t.textContent);
      });
      expect(outside).toEqual([]);
      await diagram.screenshot({
        path: `${output}/depth-only-${id}-${width}.png`,
      });
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      await expect(
        page.getByRole("dialog").locator("[data-depth-value]"),
      ).toContainText(`${value} cm`);
      await expect(page.getByRole("dialog")).not.toContainText(`${area} cm²`);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      for (const stage of [1, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        await expect(toggle).toBeChecked();
        await expect(diagram).toContainText(
          stage === 1 ? `d = ${value} cm` : `H = ${value} cm`,
        );
        await expect(lesson.getByTestId("surface-working")).toHaveCount(0);
        await expect(diagram).not.toContainText(`${area} cm²`);
        await expect(diagram).not.toHaveAttribute("data-solved", "true");
      }
      await lesson
        .getByRole("button", { name: "Show working", exact: true })
        .click();
      await lesson
        .getByRole("checkbox", { name: "Show final answer", exact: true })
        .check();
      await expect(lesson.getByTestId("surface-working")).toContainText(
        `${area} cm²`,
      );
      await lesson
        .getByRole("button", { name: "Hide working", exact: true })
        .click();
      await expect(diagram).toContainText(`H = ${value} cm`);
      await toggle.uncheck();
      await expect(diagram).toContainText(id === "mc-11" ? "H = Δd" : "H = d");
      await toggle.check();
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(toggle).not.toBeChecked();
      await expect(diagram.locator("[data-depth-value]")).toHaveText(
        id === "mc-11" ? "Δd" : "d",
      );
      await toggle.check(); // A different preset must not inherit the revealed value.
    }
  }
  await page.goto("/apps/surface-area#revision-29");
  await expect(page.getByTestId("surface-area-lesson")).toHaveAttribute(
    "data-preset",
    "revision-29",
  );
  await expect(page.getByRole("checkbox", { name: /Show water/ })).toHaveCount(
    0,
  );
});

test("depth-only image exports include the value but no area working or answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1366, height: 1080 });
  for (const [id, value, area] of [
    ["ex9b-35", "7.5", "612"],
    ["revision-31", "7.8", "999"],
    ["mc-11", "3", "192"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await lesson.getByRole("checkbox", { name: /Show water/ }).check();
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
          `${output}/depth-only-${id}-${layout}.${format.toLowerCase()}`,
          data,
        );
        if (format === "SVG") {
          const reopened = await page.context().newPage();
          await reopened.setContent(data.toString());
          const svg = reopened.locator("svg");
          await expect(svg).toContainText(`d = ${value} cm`);
          if (layout === "comparison")
            await expect(svg).toContainText(`H = ${value} cm`);
          await expect(svg).not.toContainText(`${area} cm²`);
          await expect(svg).not.toContainText("Working");
          await expect(svg).not.toHaveAttribute("data-solved", "true");
          await svg.screenshot({
            path: `${output}/depth-only-${id}-${layout}-reopened.png`,
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
    await lesson
      .getByRole("checkbox", { name: "Show final answer", exact: true })
      .check();
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
