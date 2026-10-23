import { expect, test } from "@playwright/test";
import { questions } from "../../src/apps/similarity/data";
import { textbookSolutions } from "../../src/apps/similarity/textbook";
import { copy } from "../../src/lib/copy";

test("textbook classroom keeps large geometry and the current proof line in one viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/apps/similarity#ex8c-19");
  const classroom = page.getByTestId("practice-classroom");
  await expect(classroom).toHaveAttribute("data-classroom", "true");
  const board = page.getByTestId("original-board");
  const proof = page.getByTestId("diagram-reasons");
  const next = proof.getByRole("button", { name: "Next step", exact: true });
  const graph = await board.boundingBox();
  const panel = await proof.boundingBox();
  expect(graph!.height).toBeGreaterThan(480);
  expect(Math.abs(graph!.width - 1366 / 2)).toBeLessThan(2);
  expect(panel!.x).toBeGreaterThanOrEqual(graph!.x + graph!.width);
  expect(graph!.y + graph!.height).toBeLessThanOrEqual(768);
  for (let i = 0; i < 7; i++) {
    await next.click();
    const rows = proof.locator("tbody tr:visible");
    await expect(rows).toHaveCount(1);
    const row = await rows.boundingBox();
    const control = await next.boundingBox();
    expect(row!.y).toBeGreaterThan(0);
    expect(row!.y + row!.height).toBeLessThan(768);
    expect(control!.y + control!.height).toBeLessThan(768);
  }
  await page.screenshot({
    path: "out/similarity-preview/textbook-classroom-laptop.png",
  });
  await classroom
    .getByRole("button", { name: "Back to studio", exact: true })
    .click();
  await expect(classroom).toHaveAttribute("data-classroom", "false");
  await page
    .getByRole("button", { name: "Classroom view", exact: true })
    .click();
  await expect(proof.locator('tr[data-active="true"]')).toHaveAttribute(
    "data-step-index",
    "6",
  );
});

for (const width of [1366, 1920]) {
  test(`complete Q19 equations fit one row in equal classroom halves at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto("/apps/similarity#ex8c-19");
    const board = page.getByTestId("original-board");
    const proof = page.getByTestId("diagram-reasons");
    expect(
      Math.abs((await board.boundingBox())!.width - width / 2),
    ).toBeLessThan(2);
    const next = proof.getByRole("button", { name: "Next step", exact: true });
    let checkedAngleSum = false;
    for (const [index, step] of textbookSolutions["ex8c-19"].steps.entries()) {
      await next.click();
      const current = proof.getByTestId(`solution-step-${index}`);
      for (const math of await current.getByRole("math").all()) {
        const tex = await math.getAttribute("aria-label");
        expect(tex).not.toContain("\\phantom");
        const size = await math.evaluate((el) => {
          const wrapper = el.parentElement!;
          const typeset = el.querySelector(".katex-html")!;
          return {
            available: wrapper.clientWidth,
            actual: typeset.getBoundingClientRect().width,
          };
        });
        expect(size.actual, tex!).toBeLessThanOrEqual(size.available + 1);
        if (tex?.includes("\\angle AEF=180")) {
          expect(tex).toContain("-\\angle AFE -\\angle EAF");
          checkedAngleSum = true;
          await page.screenshot({
            path: `out/similarity-proof-layout/complete-angle-sum-${width}.png`,
          });
        }
      }
      if (step.reason)
        await expect(
          current.locator("xpath=ancestor::tr").getByTestId("proof-reason"),
        ).toHaveText(step.reason);
    }
    expect(checkedAngleSum).toBe(true);
    await proof
      .getByRole("button", { name: "Show earlier steps", exact: true })
      .click();
    await page.screenshot({
      path: `out/similarity-proof-layout/history-${width}.png`,
    });
  });
}

test("phone pins the textbook diagram above a step panel and keeps Next visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/apps/similarity#qp8-8");
  const board = page.getByTestId("original-board");
  const proof = page.getByTestId("diagram-reasons");
  const before = await board.boundingBox();
  for (let i = 0; i < 4; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  const after = await board.boundingBox();
  expect(after).toEqual(before);
  expect(after!.height).toBeGreaterThan(250);
  const next = await proof
    .getByRole("button", { name: "Next step", exact: true })
    .boundingBox();
  expect(next!.y + next!.height).toBeLessThan(844);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/similarity-preview/textbook-classroom-phone.png",
  });
});

test("all 72 question choices open a large board and preserve the first printed statement and reason", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/apps/similarity#ex8c-19");
  const picker = page.getByRole("combobox", {
    name: "Choose a question",
    exact: true,
  });
  const proof = page.getByTestId("diagram-reasons");
  const board = page.getByTestId("original-board");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const question of questions) {
    await picker.selectOption(question.id);
    await expect(proof.locator("tbody tr")).toHaveCount(0);
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
    const row = proof.locator("tbody tr:visible");
    await expect(row).toHaveCount(1);
    await expect(row.locator("td").nth(1)).toHaveText(
      textbookSolutions[question.id].steps[0].reason ?? "",
    );
    const box = await board.boundingBox();
    expect(box!.height, question.id).toBeGreaterThan(480);
    expect(box!.y + box!.height, question.id).toBeLessThanOrEqual(768);
    const step = await row.boundingBox();
    expect(step!.y + step!.height, question.id).toBeLessThan(768);
  }
  expect(errors).toEqual([]);
});

test("classroom controls, question and game switches keep the selected question and triangle poses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/apps/similarity#ex8c-19");
  const dialog = page.getByTestId("practice-classroom");
  await dialog
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const shape = page.getByTestId("shape-0");
  await shape.focus();
  await shape.press("ArrowRight");
  const x = await shape.getAttribute("data-x");
  await dialog
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  const angle = dialog.getByRole("slider", { name: "Rotation", exact: true });
  await angle.focus();
  await angle.press("ArrowRight");
  await dialog.getByRole("button", { name: "Question", exact: true }).click();
  await expect(dialog.getByTestId("classroom-question")).toBeVisible();
  await dialog.getByRole("button", { name: "Solution", exact: true }).click();
  await dialog.getByRole("button", { name: "Next step", exact: true }).click();
  await dialog.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Similarity Detective", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Textbook practice", exact: true })
    .click();
  await expect(dialog).toHaveAttribute("data-classroom", "true");
  await expect(shape).toHaveAttribute("data-x", x!);
  await expect(shape).toHaveAttribute("data-angle", "1");
  await expect(dialog.getByTestId("solution-step-0")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Classroom view", exact: true }),
  ).toBeFocused();
});

test("landscape phones retain a visible current line and Next step beside the graph", async ({
  page,
}) => {
  for (const [width, height] of [
    [667, 375],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/apps/similarity#qp8-8");
    const proof = page.getByTestId("diagram-reasons");
    const reset = proof.getByRole("button", {
      name: "Reset solution",
      exact: true,
    });
    if (await reset.isEnabled()) await reset.click();
    for (let i = 0; i < 3; i++)
      await proof
        .getByRole("button", { name: "Next step", exact: true })
        .click();
    const row = await proof.locator("tbody tr:visible").boundingBox();
    const next = await proof
      .getByRole("button", { name: "Next step", exact: true })
      .boundingBox();
    const graph = await page.getByTestId("original-board").boundingBox();
    expect(row!.y + row!.height).toBeLessThanOrEqual(height);
    expect(next!.y + next!.height).toBeLessThanOrEqual(height);
    expect(row!.x).toBeGreaterThanOrEqual(graph!.x + graph!.width);
    await page.screenshot({
      path: `out/similarity-preview/textbook-landscape-${width}.png`,
    });
  }
});

test("Previous and Reset return a scrolled solution panel to the current line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/apps/similarity#ex8c-19");
  const proof = page.getByTestId("diagram-reasons");
  const calculation = textbookSolutions["ex8c-19"].steps.findIndex((step) =>
    step.math?.some((line) => line.includes("AE=CD")),
  );
  for (let i = 0; i <= calculation; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await proof.locator("summary").click();
  const body = proof.locator("table").locator("..");
  await body.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await proof
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBe(0);
  const viewport = await body.boundingBox();
  const row = await proof.locator("tbody tr:visible").boundingBox();
  expect(row!.y).toBeGreaterThanOrEqual(viewport!.y);
  expect(row!.y + row!.height).toBeLessThanOrEqual(
    viewport!.y + viewport!.height,
  );
  await body.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await proof
    .getByRole("button", { name: "Reset solution", exact: true })
    .click();
  await expect.poll(() => body.evaluate((e) => e.scrollTop)).toBe(0);
  await expect(
    proof.getByText("Start with the diagram.", { exact: true }),
  ).toBeVisible();
});

test("a direct question link closes a running game and opens an interactive textbook classroom", async ({
  page,
}) => {
  await page.goto("/apps/similarity#games");
  await page
    .getByRole("button", {
      name: copy.similarityGames.missions.aaa.title,
      exact: true,
    })
    .click();
  await expect(page.getByTestId("game-classroom")).toBeVisible();
  await page.evaluate(() => {
    location.hash = "#ex8c-19";
  });
  await expect(page.getByTestId("game-classroom")).toHaveCount(0);
  await expect(page.getByTestId("practice-classroom")).toHaveAttribute(
    "data-classroom",
    "true",
  );
  await page
    .getByTestId("diagram-reasons")
    .getByRole("button", { name: "Next step", exact: true })
    .click();
  await expect(page.getByTestId("solution-step-0")).toBeVisible();
});
