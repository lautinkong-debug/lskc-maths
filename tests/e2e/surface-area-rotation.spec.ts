import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "out/surface-area-release/rotation";
mkdirSync(output, { recursive: true });

async function checkLabels(svg: Locator) {
  const issues = await svg.evaluate((node) => {
    const frame = node.getBoundingClientRect();
    const labels = [
      ...node.querySelectorAll(
        "[data-cube-dimension] text, [data-water-annotations] text",
      ),
    ];
    const all = [...node.querySelectorAll("text")];
    return labels.flatMap((label) => {
      const a = label.getBoundingClientRect(),
        result: string[] = [];
      if (
        a.left < frame.left - 1 ||
        a.right > frame.right + 1 ||
        a.top < frame.top - 1 ||
        a.bottom > frame.bottom + 1
      )
        result.push(`Clipped ${label.textContent}`);
      for (const other of all) {
        if (other === label) continue;
        const b = other.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
        )
          result.push(`${label.textContent} / ${other.textContent}`);
      }
      return result;
    });
  });
  expect(issues).toEqual([]);
}

test("rotated solids preserve measurements, fixed controls and the chosen unfolded view", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const id of [
      "example-9-11",
      "revision-26",
      "revision-27",
      "ex9b-35",
      "revision-33",
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      const yaw = lesson.getByRole("slider", {
        name: "View rotation",
        exact: true,
      });
      const tilt = lesson.getByRole("slider", {
        name: "View tilt",
        exact: true,
      });
      const polygons = () =>
        svg
          .locator("[data-rotation-surface] polygon")
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute("points")).join("|"),
          );
      const original = await polygons();
      const viewBox = await svg.getAttribute("viewBox");
      await yaw.scrollIntoViewIfNeeded();
      const position = await yaw.boundingBox();
      for (const angle of [90, -180, -90]) {
        await yaw.fill(String(angle));
        await tilt.fill("30");
        expect(await polygons()).not.toBe(original);
        await expect(svg).toHaveAttribute("viewBox", viewBox!);
        await expect(svg).toHaveAttribute("data-view-yaw", String(angle));
        expect(await yaw.boundingBox()).toEqual(position);
        expect(
          await svg
            .locator("polygon, path")
            .evaluateAll((nodes) =>
              nodes.some((n) =>
                /NaN|Infinity/.test(
                  n.getAttribute("points") ?? n.getAttribute("d") ?? "",
                ),
              ),
            ),
        ).toBe(false);
        await expect(svg.locator("[data-final-answer]")).toHaveCount(0);
        await checkLabels(svg);
      }
      await svg.screenshot({ path: `${output}/${id}-${width}-rotated.png` });
      await lesson
        .getByRole("button", { name: "Reset view", exact: true })
        .click();
      expect(await polygons()).toBe(original);
      await yaw.fill("90");
      await tilt.fill("55");
      await checkLabels(svg);
      await svg.screenshot({ path: `${output}/${id}-${width}-above.png` });
      await lesson.getByRole("navigation").getByRole("button").nth(2).click();
      await lesson.locator("#surface-unfold").fill("50");
      await svg.screenshot({ path: `${output}/${id}-${width}-opening.png` });
      await lesson
        .getByRole("button", { name: "Flat strip", exact: true })
        .click();
      await expect(yaw).toBeEnabled();
      await expect(svg).toHaveAttribute("data-view-yaw", "90");
      const flat = await polygons();
      await lesson
        .getByRole("button", { name: "Reset view", exact: true })
        .click();
      expect(await polygons()).not.toBe(flat);
      await lesson.getByRole("button", { name: "Folded", exact: true }).click();
      await expect(yaw).toBeEnabled();
      await yaw.focus();
      await yaw.press("ArrowRight");
      await expect(svg).toHaveAttribute("data-view-yaw", "1");
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(svg).toHaveAttribute("data-view-yaw", "0");
      await expect(svg).toHaveAttribute("data-view-tilt", "0");
    }
  }
});

test("dragging rotates without selecting a face, while clicks still select", async ({
  page,
}) => {
  await page.goto("/apps/surface-area#example-9-11");
  const lesson = page.getByTestId("surface-area-lesson");
  const svg = lesson.getByTestId("surface-diagram").first();
  const target = svg.locator("rect[data-rotation-surface]");
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 150, box.y + 10, { steps: 8 });
  await page.mouse.up();
  await expect(svg).not.toHaveAttribute("data-view-yaw", "0");
  await expect(svg.locator('[aria-pressed="true"]')).toHaveCount(0);
  await lesson.getByRole("button", { name: "Reset view", exact: true }).click();
  const face = svg.locator('[data-face="2"] polygon');
  await face.click();
  await expect(face).toHaveAttribute("aria-pressed", "true");
  const before = await face.getAttribute("points");
  await lesson
    .getByRole("slider", { name: "View rotation", exact: true })
    .fill("150");
  await expect(face).toHaveAttribute("aria-pressed", "true");
  expect(await face.getAttribute("points")).not.toBe(before);
});

test("touch drag rotates the solid on a phone", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(
    `${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"}/apps/surface-area#example-9-11`,
  );
  const svg = page.getByTestId("surface-diagram").first();
  const target = svg.locator("rect[data-rotation-surface]");
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const client = await context.newCDPSession(page);
  const x = box.x + 40,
    y = box.y + 50;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 80, y: y - 20 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(svg).not.toHaveAttribute("data-view-yaw", "0");
  await expect(svg.locator('[aria-pressed="true"]')).toHaveCount(0);
  await context.close();
});

test("rotation and partial working survive clean view and real PNG SVG exports", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const id of ["example-9-11", "ex9b-35", "revision-33"]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await lesson
      .getByRole("slider", { name: "View rotation", exact: true })
      .fill("110");
    await lesson
      .getByRole("slider", { name: "View tilt", exact: true })
      .fill("25");
    await lesson
      .getByRole("checkbox", {
        name:
          id === "ex9b-35"
            ? "Show wetted surface area working"
            : "Show total surface area working",
        exact: true,
      })
      .check();
    await lesson
      .getByRole("button", { name: "Next working line", exact: true })
      .click();
    await lesson
      .getByRole("button", { name: "Clean diagram", exact: true })
      .click();
    await expect(
      page.getByRole("dialog").getByTestId("surface-diagram"),
    ).toHaveAttribute("data-view-yaw", "110");
    await page
      .getByRole("button", { name: "Back to controls", exact: true })
      .click();
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
        const name = `${output}/${id}-${layout}`;
        writeFileSync(`${name}.${format.toLowerCase()}`, data);
        if (format === "SVG") {
          const reopened = await page.context().newPage();
          await reopened.setContent(data.toString());
          const svg = reopened.locator("svg");
          await expect(svg).toHaveAttribute("data-view-yaw", "110");
          await expect(svg.locator("[data-total-working]")).toHaveCount(1);
          await expect(svg.locator("[data-final-answer]")).toHaveCount(0);
          await checkLabels(svg);
          await svg.screenshot({ path: `${name}-reopened.png` });
          await reopened.close();
        } else
          expect(data.subarray(0, 8)).toEqual(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
          );
      }
    }
  }
});
