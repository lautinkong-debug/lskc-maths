import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/unfolded-view";
mkdirSync(output, { recursive: true });
async function diagramIssues(svg: Locator) {
  return svg.evaluate((node) => {
    const frame = node.getBoundingClientRect(),
      all = [...node.querySelectorAll("text")];
    const labels = [
      ...node.querySelectorAll(
        "[data-dimension-label] text, [data-boundary-caption] text, [data-detached-base] text",
      ),
    ];
    const issues: string[] = [];
    if (/NaN|Infinity/.test(node.innerHTML)) issues.push("Invalid geometry");
    for (const label of labels) {
      const a = label.getBoundingClientRect();
      if (
        a.left < frame.left - 1 ||
        a.right > frame.right + 1 ||
        a.top < frame.top - 1 ||
        a.bottom > frame.bottom + 1
      )
        issues.push(`Clipped ${label.textContent}`);
      for (const other of all) {
        if (other === label) continue;
        const b = other.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
        )
          issues.push(`${label.textContent} / ${other.textContent}`);
      }
    }
    return issues;
  });
}
const geometry = (svg: Locator) =>
  svg
    .locator(
      "[data-face] polygon, [data-detached-base] > path, [data-contact-patch]",
    )
    .evaluateAll((nodes) =>
      nodes
        .map((node) => node.getAttribute("points") ?? node.getAttribute("d"))
        .join("|"),
    );

test("all textbook flat diagrams rotate with readable dimensions", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const findings: {
    preset: string;
    width: number;
    yaw: number;
    issues: string[];
  }[] = [];
  let views = 0;
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const q of questions)
      for (const v of q.variants) {
        await page.goto(`/apps/surface-area#${q.id}/${v.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-variant", v.id);
        await lesson.getByRole("navigation").getByRole("button").nth(4).click();
        const svg = lesson.getByTestId("surface-diagram").first();
        const original = await geometry(svg);
        const yaw = lesson.getByRole("slider", {
          name: "View rotation",
          exact: true,
        });
        const tilt = lesson.getByRole("slider", {
          name: "View tilt",
          exact: true,
        });
        await expect(yaw).toBeEnabled();
        for (const angle of [35, -90]) {
          await yaw.fill(String(angle));
          await tilt.fill("25");
          expect(await geometry(svg)).not.toBe(original);
          const issues = await diagramIssues(svg);
          if (issues.length)
            findings.push({
              preset: `${q.id}/${v.id}`,
              width,
              yaw: angle,
              issues,
            });
          await expect(svg.locator("[data-final-answer]")).toHaveCount(0);
          views++;
        }
        if (
          ["example-9-11", "ex9b-24", "revision-27", "revision-33"].includes(
            q.id,
          )
        )
          await svg.screenshot({ path: `${output}/${q.id}-${width}-flat.png` });
      }
  }
  writeFileSync(
    `${output}/layout-audit.json`,
    JSON.stringify({ views, findings }, null, 2),
  );
  expect(findings.slice(0, 15)).toEqual([]);
});

test("unfolded mouse and touch rotation keep the chosen view without revealing answers", async ({
  page,
  browser,
}) => {
  await page.goto("/apps/surface-area#example-9-11");
  const lesson = page.getByTestId("surface-area-lesson");
  await lesson.getByRole("navigation").getByRole("button").nth(2).click();
  const yaw = lesson.getByRole("slider", {
    name: "View rotation",
    exact: true,
  });
  const tilt = lesson.getByRole("slider", { name: "View tilt", exact: true });
  await yaw.fill("35");
  await tilt.fill("25");
  const svg = lesson.getByTestId("surface-diagram").first();
  for (const progress of [20, 50, 100]) {
    await lesson.locator("#surface-unfold").fill(String(progress));
    await expect(svg).toHaveAttribute("data-view-yaw", "35");
    await expect(svg).toHaveAttribute("data-view-tilt", "25");
    await expect(yaw).toBeEnabled();
  }
  const before = await geometry(svg);
  const target = svg.locator("rect[data-rotation-surface]");
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 25);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + 5, { steps: 8 });
  await page.mouse.up();
  expect(await geometry(svg)).not.toBe(before);
  await expect(svg.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(
    lesson.getByRole("checkbox", { name: "Show final answer", exact: true }),
  ).not.toBeChecked();
  await yaw.fill("61");
  expect(await diagramIssues(svg)).toEqual([]);
  await expect(svg).toContainText("Edge-on view");
  await lesson.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(svg).toHaveAttribute("data-view-yaw", "0");
  await expect(svg).not.toContainText("Edge-on view");
  await expect(lesson.locator("#surface-unfold")).toHaveValue("100");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const phone = await context.newPage();
  await phone.goto(
    `${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"}/apps/surface-area#example-9-11`,
  );
  const phoneLesson = phone.getByTestId("surface-area-lesson");
  await phoneLesson.getByRole("navigation").getByRole("button").nth(3).click();
  const phoneSvg = phoneLesson.getByTestId("surface-diagram").first();
  const touchTarget = phoneSvg.locator("rect[data-rotation-surface]");
  await touchTarget.scrollIntoViewIfNeeded();
  const touchBox = (await touchTarget.boundingBox())!;
  const client = await context.newCDPSession(phone);
  const x = touchBox.x + 35,
    y = touchBox.y + 40;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 90, y: y - 20 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(phoneSvg).not.toHaveAttribute("data-view-yaw", "0");
  await expect(phoneSvg.locator('[aria-pressed="true"]')).toHaveCount(0);
  await context.close();
});

test("unfolded PNG SVG exports retain the actual rotated geometry and partial working", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const id of ["example-9-11", "revision-27", "revision-33", "ex9b-35"]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await lesson.getByRole("navigation").getByRole("button").nth(4).click();
    const diagrams = lesson.getByTestId("surface-diagram");
    const yaw = lesson.getByRole("slider", {
      name: "View rotation",
      exact: true,
    });
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
    for (const layout of ["current", "comparison"]) {
      await lesson.getByLabel("Image layout").selectOption(layout);
      await yaw.fill("0");
      const faceOn = await geometry(diagrams.last());
      await yaw.fill("-90");
      const chosen = await geometry(diagrams.last());
      expect(chosen).not.toBe(faceOn);
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
          expect(await geometry(svg)).toBe(chosen);
          expect(await diagramIssues(svg)).toEqual([]);
          await expect(svg.locator("[data-total-working]")).toHaveCount(1);
          await expect(svg.locator("[data-final-answer]")).toHaveCount(0);
          await svg.screenshot({ path: `${name}-reopened.png` });
          await reopened.close();
        } else
          expect(data.subarray(0, 8)).toEqual(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
          );
      }
    }
    await lesson
      .getByRole("button", { name: "Clean diagram", exact: true })
      .click();
    const clean = page.getByRole("dialog").getByTestId("surface-diagram");
    await expect(clean).toHaveAttribute("data-view-yaw", "-90");
    expect(await diagramIssues(clean)).toEqual([]);
    await page
      .getByRole("button", { name: "Back to controls", exact: true })
      .click();
  }
});
