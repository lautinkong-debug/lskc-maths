import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

const output = "out/surface-area-release/total-working";
mkdirSync(output, { recursive: true });
const totalToggle = (root: Locator, id: string) =>
  root.getByRole("checkbox", {
    name:
      id === "ex9b-35" || id === "revision-31"
        ? "Show wetted surface area working"
        : id === "mc-11"
          ? "Show wetted-area increase working"
          : id === "ex9b-8" || id === "revision-30"
            ? "Show lateral area formula"
            : "Show total surface area working",
    exact: true,
  });
const finalToggle = (root: Locator) =>
  root.getByRole("checkbox", { name: "Show final answer", exact: true });
async function revealAllTotal(root: Locator) {
  const next = root.getByRole("button", {
    name: "Next working line",
    exact: true,
  });
  while (await next.isEnabled()) await next.click();
}

test("total working reveals one line at a time with stationary controls and a separate answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const evidence = "out/surface-area-release/total-lines";
  mkdirSync(evidence, { recursive: true });
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, substitution, contribution, answer] of [
      ["example-9-11", "22 × 13 + 2 × 26", "286 + 52", "338 cm²"],
      ["revision-33", "6 × (5² + 4² + 3²)", "300 − 50", "250 cm²"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      const controls = lesson.getByTestId("total-line-controls");
      const next = controls.getByRole("button", {
        name: "Next working line",
        exact: true,
      });
      const previous = controls.getByRole("button", {
        name: "Previous working line",
        exact: true,
      });
      await expect(next).toBeDisabled();
      await totalToggle(lesson, id).check();
      await expect(controls).toContainText("1 / 3 lines shown");
      await expect(previous).toBeDisabled();
      await expect(svg).not.toContainText(substitution);
      const viewBox = await svg.getAttribute("viewBox");
      await next.scrollIntoViewIfNeeded();
      const position = await next.boundingBox();
      for (const [line, text] of [
        [2, substitution],
        [3, contribution],
      ] as const) {
        await next.click();
        await expect(controls).toContainText(`${line} / 3 lines shown`);
        await expect(svg).toContainText(text);
        await expect(svg).not.toContainText(answer);
        await expect(finalToggle(lesson)).not.toBeChecked();
        expect(await next.boundingBox()).toEqual(position);
        await expect(svg).toHaveAttribute("viewBox", viewBox!);
      }
      await expect(next).toBeDisabled();
      await finalToggle(lesson).check();
      await expect(svg.locator("[data-final-answer]")).toContainText(answer);
      await finalToggle(lesson).uncheck();
      await previous.click();
      await expect(svg).not.toContainText(contribution);
      await totalToggle(lesson, id).uncheck();
      await expect(next).toBeDisabled();
      await totalToggle(lesson, id).check();
      await expect(controls).toContainText("2 / 3 lines shown");
      for (const stage of [0, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        await expect(svg).toContainText(substitution);
        await expect(svg).not.toContainText(contribution);
      }
      // Full-working and clean/export paths must not bypass the chosen line.
      await lesson
        .getByRole("button", { name: "Show working", exact: true })
        .click();
      await expect(lesson.getByTestId("surface-working")).not.toContainText(
        contribution,
      );
      await expect(lesson.getByTestId("surface-working")).not.toContainText(
        answer,
      );
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      const clean = page.getByRole("dialog").getByTestId("surface-diagram");
      await expect(clean).toContainText(substitution);
      await expect(clean).not.toContainText(contribution);
      await expect(clean).not.toContainText(answer);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      await controls.screenshot({
        path: `${evidence}/${id}-${width}-controls.png`,
      });
      await svg.screenshot({
        path: `${evidence}/${id}-${width}-two-lines.png`,
      });
      await previous.click();
      await expect(svg).not.toContainText(substitution);
      await expect(lesson.getByTestId("surface-working")).not.toContainText(
        substitution,
      );
      await lesson
        .getByRole("checkbox", { name: "Dimensions", exact: true })
        .uncheck();
      await lesson
        .getByRole("button", { name: "Hide working", exact: true })
        .click();
      await expect(next).toBeDisabled();
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await totalToggle(lesson, id).check();
      await expect(controls).toContainText("1 / 3 lines shown");
      await next.click(); // Preset changes must clear progress.
    }
  }
});

test("water values update the current total working line without revealing later lines", async ({
  page,
}) => {
  await page.goto("/apps/surface-area#ex9b-35");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toHaveAttribute("data-preset", "ex9b-35");
  await totalToggle(lesson, "ex9b-35").check();
  const next = lesson.getByRole("button", {
    name: "Next working line",
    exact: true,
  });
  const svg = lesson.getByTestId("surface-diagram").first();
  await next.click();
  await expect(svg).toContainText("56 × d + 192");
  await expect(next).toBeDisabled();
  await lesson
    .getByRole("checkbox", { name: "Show water depth", exact: true })
    .check();
  await expect(svg).toContainText("56 × 7.5 + 192");
  await expect(svg).not.toContainText("420 + 192");
  await expect(next).toBeEnabled();
  await next.click();
  await expect(svg).toContainText("420 + 192");
  await expect(svg).not.toContainText("612 cm²");
  await expect(finalToggle(lesson)).not.toBeChecked();
});

test("partial total working survives actual PNG SVG exports without later lines or the answer", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const evidence = "out/surface-area-release/total-lines";
  mkdirSync(evidence, { recursive: true });
  await page.goto("/apps/surface-area#example-9-11");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toHaveAttribute("data-preset", "example-9-11");
  await lesson.getByRole("navigation").getByRole("button").nth(4).click();
  await totalToggle(lesson, "example-9-11").check();
  await lesson
    .getByRole("button", { name: "Show working", exact: true })
    .click();
  for (const count of [1, 2, 3]) {
    if (count > 1)
      await lesson
        .getByRole("button", { name: "Next working line", exact: true })
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
        const name = `${evidence}/${layout}-${count}-lines`;
        writeFileSync(`${name}.${format.toLowerCase()}`, data);
        if (format === "SVG") {
          const reopened = await page.context().newPage();
          await reopened.setContent(data.toString());
          const svg = reopened.locator("svg");
          await expect(svg).toContainText("Total surface area = PH + 2B");
          for (const [line, text] of [
            [2, "22 × 13 + 2 × 26"],
            [3, "286 + 52"],
          ] as const) {
            if (count >= line) await expect(svg).toContainText(text);
            else await expect(svg).not.toContainText(text);
          }
          await expect(svg).not.toContainText("338 cm²");
          await fits(svg);
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
async function fits(svg: Locator) {
  const issues = await svg.evaluate((node) => {
    const frame = node.getBoundingClientRect(),
      all = [...node.querySelectorAll("text")];
    return [
      ...node.querySelectorAll(
        "[data-total-working] text, [data-final-answer] text, [data-lateral-working] text, [data-base-working] text",
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
      for (const other of all) {
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

test("total substitution and final answer reveal separately, including the legacy working button", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const [id, result] of [
      ["example-9-11", "338"],
      ["ex9b-35", "612"],
      ["revision-29", "167"],
      ["revision-33", "250"],
      ["ex9b-31", "960"],
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const svg = lesson.getByTestId("surface-diagram").first();
      await expect(totalToggle(lesson, id)).not.toBeChecked();
      await expect(finalToggle(lesson)).not.toBeChecked();
      const viewBox = await svg.getAttribute("viewBox");
      const next = lesson.getByRole("button", {
        name: "Next step",
        exact: true,
      });
      await next.scrollIntoViewIfNeeded();
      const before = await next.boundingBox();
      await totalToggle(lesson, id).check();
      expect(await next.boundingBox()).toEqual(before);
      await revealAllTotal(lesson);
      await expect(svg.locator("[data-total-working]")).toHaveCount(1);
      await expect(
        svg.locator("[data-base-working], [data-lateral-working]"),
      ).toHaveCount(0);
      for (const stage of [0, 1, 2, 3, 4]) {
        await lesson
          .getByRole("navigation")
          .getByRole("button")
          .nth(stage)
          .click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
        await expect(svg).not.toContainText(`${result} cm²`);
        await expect(svg.locator("[data-final-answer]")).toHaveCount(0);
        await expect(svg).not.toHaveAttribute("data-solved", "true");
        await fits(svg);
      }
      if (id === "example-9-11")
        await expect(svg).toContainText("286 + 52 cm²");
      if (id === "revision-29")
        await expect(svg).toContainText("2 × (3x + 14)");
      if (id === "ex9b-31")
        await expect(svg).toContainText("20 × (12 × H + 2 × 6)");
      await lesson
        .getByRole("button", { name: "Show working", exact: true })
        .click();
      await expect(lesson.getByTestId("surface-working")).not.toContainText(
        `${result} cm²`,
      );
      await expect(svg).not.toHaveAttribute("data-solved", "true");
      await finalToggle(lesson).check();
      await expect(svg.locator("[data-final-answer]")).toContainText(
        `A = ${result} cm²`,
      );
      await expect(svg).toHaveAttribute("viewBox", viewBox!);
      await fits(svg);
      await finalToggle(lesson).uncheck();
      await expect(svg).not.toContainText(`${result} cm²`);
      await expect(lesson.getByTestId("surface-working")).not.toContainText(
        `${result} cm²`,
      );
      await expect(svg).not.toHaveAttribute("data-solved", "true");
      await svg.screenshot({ path: `${output}/${id}-${width}-hidden.png` });
      await lesson
        .getByRole("button", { name: "Clean diagram", exact: true })
        .click();
      const clean = page.getByRole("dialog").getByTestId("surface-diagram");
      await expect(clean.locator("[data-total-working]")).toHaveCount(1);
      await expect(clean).not.toContainText(`${result} cm²`);
      await fits(clean);
      await page
        .getByRole("button", { name: "Back to controls", exact: true })
        .click();
      await lesson
        .getByRole("button", { name: "Hide working", exact: true })
        .click();
      await totalToggle(lesson, id).uncheck();
      await finalToggle(lesson).check();
      await expect(svg.locator("[data-total-working]")).toHaveCount(0);
      await expect(svg.locator("[data-final-answer]")).toContainText(
        `A = ${result} cm²`,
      );
      await lesson
        .getByRole("button", { name: "Reset lesson", exact: true })
        .click();
      await expect(finalToggle(lesson)).not.toBeChecked();
      await expect(totalToggle(lesson, id)).not.toBeChecked();
      await finalToggle(lesson).check(); // A new preset must clear this.
      await totalToggle(lesson, id).check();
    }
  }
});

test("all textbook total calculations fit with every independent reveal", async ({
  page,
}) => {
  test.setTimeout(240_000);
  let views = 0;
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const q of questions)
      for (const v of q.variants) {
        await page.goto(`/apps/surface-area#${q.id}/${v.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-variant", v.id);
        await totalToggle(lesson, q.id).check();
        await finalToggle(lesson).check();
        if (v.geometry.kind === "prism")
          for (const name of [
            "Show base perimeter",
            "Show base area",
            "Show perimeter working",
            "Show base-area working",
            "Show lateral surface area working",
          ])
            await lesson.getByRole("checkbox", { name, exact: true }).check();
        const water = lesson.getByRole("checkbox", { name: /Show water/ });
        if (await water.count()) await water.check();
        await revealAllTotal(lesson);
        const svg = lesson.getByTestId("surface-diagram").first();
        for (const stage of [0, 2, 4]) {
          await lesson
            .getByRole("navigation")
            .getByRole("button")
            .nth(stage)
            .click();
          if (stage === 2) await lesson.locator("#surface-unfold").fill("100");
          await expect(svg.locator("[data-total-working]")).toHaveCount(1);
          await expect(svg.locator("[data-final-answer]")).toHaveCount(1);
          await fits(svg);
          views++;
        }
        if (["ex9b-24", "ex9b-31", "revision-27", "revision-33"].includes(q.id))
          await svg.screenshot({ path: `${output}/${q.id}-${width}-all.png` });
      }
  }
  writeFileSync(
    `${output}/layout-audit.json`,
    JSON.stringify({ views, findings: [] }, null, 2),
  );
});

test("total-area PNG SVG exports show the substitution and reveal only the chosen final answer", async ({
  page,
}) => {
  test.setTimeout(300_000);
  for (const [id, result] of [
    ["example-9-11", "338"],
    ["ex9b-35", "612"],
    ["revision-33", "250"],
    ["ex9b-31", "960"],
  ]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    await lesson.getByRole("navigation").getByRole("button").nth(4).click();
    await totalToggle(lesson, id).check();
    await revealAllTotal(lesson);
    await lesson
      .getByRole("button", { name: "Show working", exact: true })
      .click();
    for (const layout of ["current", "comparison"]) {
      await lesson.getByLabel("Image layout").selectOption(layout);
      for (const reveal of [false, true, false]) {
        await finalToggle(lesson).setChecked(reveal);
        for (const format of ["SVG", "PNG"]) {
          const pending = page.waitForEvent("download");
          await lesson
            .getByRole("button", { name: `Download ${format}`, exact: true })
            .click();
          const download = await pending;
          expect(await download.failure()).toBeNull();
          const data = readFileSync((await download.path())!);
          writeFileSync(
            `${output}/${id}-${layout}-${reveal ? "answer" : "hidden"}.${format.toLowerCase()}`,
            data,
          );
          if (format === "SVG") {
            const reopened = await page.context().newPage();
            await reopened.setContent(data.toString());
            const svg = reopened.locator("svg");
            await expect(svg.locator("[data-total-working]")).toHaveCount(1);
            await expect(svg.locator("[data-final-answer]")).toHaveCount(
              reveal ? 1 : 0,
            );
            if (reveal) await expect(svg).toContainText(`${result} cm²`);
            else {
              await expect(svg).not.toContainText(`${result} cm²`);
              await expect(svg).not.toHaveAttribute("data-solved", "true");
            }
            await fits(svg);
            await svg.screenshot({
              path: `${output}/${id}-${layout}-${reveal ? "answer" : "hidden"}-reopened.png`,
            });
            await reopened.close();
          } else
            expect(data.subarray(0, 8)).toEqual(
              Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
            );
        }
      }
    }
  }
});
