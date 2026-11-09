import { expect, test, type Page } from "@playwright/test";
import {
  theoremLessons,
  type GuidedReasonId,
} from "../../src/apps/circle-properties/theoremLessonData";
import {
  getCaseFamily,
  getGuideCase,
  writtenReasonQuestion,
  type GuideCaseKey,
} from "../../src/apps/circle-properties/theoremCaseBank";

const topics: { name: string; ids: GuidedReasonId[] }[] = [
  { name: "Perpendiculars and chord mid-points", ids: ["r3"] },
  { name: "Equal chords and distances", ids: ["r4", "r5"] },
  { name: "Centre and circumference angles", ids: ["r6"] },
  { name: "Angles in the same segment", ids: ["r7"] },
  { name: "Angle in a semicircle", ids: ["r8", "r9"] },
  {
    name: "Angles, arcs and chords",
    ids: ["r10", "r11", "r12", "r13", "r14", "r15"],
  },
  { name: "Arc and angle ratios", ids: ["r16", "r17"] },
];

async function openTopic(page: Page, topic: string) {
  await page.goto("/");
  await expect(page.getByTestId("paper-circle")).toBeVisible();
  const menu = page.locator("button[aria-controls='circle-property-menu']");
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: topic, exact: true }).click();
}

for (const [screen, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["projector", { width: 1366, height: 768 }],
] as const) {
  test(`16.6 vocabulary highlights the angle at its own vertex on a ${screen}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openTopic(page, "Centre and circumference angles");
    const guide = page.getByTestId("theorem-lesson");
    const diagram = guide.getByTestId("reason-flow-r6");
    const next = guide.getByRole("button", { name: /Show the next tag/ });
    for (const [vertex, arms] of [
      ["P", ["PA", "PB"]],
      ["O", ["OA", "OB"]],
    ] as const) {
      const sector = diagram.locator(`[data-term-sector="angle-${vertex}"]`);
      await expect(sector).toBeVisible();
      await expect(
        diagram.locator(`[data-mark="point-${vertex}"]`),
      ).toHaveAttribute("data-term-part", "selected");
      for (const arm of arms) {
        const ray = diagram.locator(`[data-mark="${arm}"]`);
        await expect(ray).toHaveAttribute("data-term-part", "selected");
        const weight = await ray.evaluate((line) =>
          parseFloat(getComputedStyle(line).strokeWidth),
        );
        const context = await diagram
          .locator('[data-mark="circle"]')
          .evaluate((circle) =>
            parseFloat(getComputedStyle(circle).strokeWidth),
          );
        expect(weight).toBeGreaterThanOrEqual(context * 2);
      }
      await expect(diagram).not.toContainText("2θ");
      await next.click();
    }
    await expect(diagram.locator('[data-mark="same-arc-AB"]')).toHaveAttribute(
      "data-term-part",
      "selected",
    );
    await expect(diagram.locator("[data-term-sector]")).toHaveCount(0);
    await guide.getByRole("button", { name: "Predict", exact: true }).click();
    await expect(diagram.locator('[data-stage="result"]')).toHaveCount(0);
  });
}

for (const topic of topics) {
  for (const id of topic.ids) {
    test(
      "discover and apply 16." + id.slice(1) + " in " + topic.name,
      async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await openTopic(page, topic.name);
        if (id === "r3" || topic.ids.length > 1) {
          await page
            .getByRole("button", {
              name: new RegExp("^16\\." + id.slice(1) + " ·"),
            })
            .click();
        }
        const guide = page.getByTestId("theorem-lesson");
        const spec = theoremLessons[id];
        await expect(guide).toHaveAttribute("data-reason", id);
        const nav = guide.getByRole("navigation", {
          name: "Guided lesson steps",
        });
        const svg = guide.getByTestId("reason-flow-" + id);
        await nav.getByRole("button", { name: "Words", exact: true }).click();
        await expect(svg.locator('[data-stage="result"]')).toHaveCount(0);
        await guide.getByRole("button", { name: /Show the next tag/ }).click();
        await nav
          .getByRole("button", { name: "Investigate", exact: true })
          .click();
        const original = await svg.innerHTML();
        if (id === "r3")
          await guide
            .getByRole("button", { name: "Keep this bisector" })
            .click();
        await guide.getByRole("button", { name: "Try another shape" }).click();
        await expect.poll(() => svg.innerHTML()).not.toBe(original);
        if (id === "r3")
          await expect(svg.locator("[data-saved-bisector]")).toHaveCount(1);
        await nav.getByRole("button", { name: "Predict", exact: true }).click();
        const choose = (index: number) =>
          guide.locator('[data-choice="' + index + '"]').click();
        await choose((spec.prediction.answer + 1) % 3);
        await expect(guide.locator('[data-correct="false"]')).toBeVisible();
        await expect(svg.locator('[data-stage="result"]')).toHaveCount(0);
        await choose(spec.prediction.answer);
        await expect(
          svg.locator('[data-stage="result"]').first(),
        ).toBeVisible();
        if (id !== "r17") {
          await guide
            .getByRole("button", { name: "Hide conclusion marks" })
            .click();
          await expect(svg.locator('[data-stage="result"]')).toHaveCount(0);
          await guide
            .getByRole("button", { name: "Show conclusion marks" })
            .click();
          await expect(
            svg.locator('[data-stage="result"]').first(),
          ).toBeVisible();
          await guide
            .getByRole("button", { name: "See the conclusion on the diagram" })
            .click();
          await expect(
            guide.getByRole("region", { name: "Guided lesson board" }),
          ).toBeFocused();
        }
        if (["r3", "r4", "r5", "r6", "r7", "r8", "r9", "r17"].includes(id)) {
          await expect(svg.locator("[data-proof-guide]")).toHaveCount(0);
          await guide.getByRole("button", { name: "Show proof lines" }).click();
          await expect(svg.locator("[data-proof-guide]").first()).toBeVisible();
          await guide.getByRole("button", { name: "Hide proof lines" }).click();
          await expect(svg.locator("[data-proof-guide]")).toHaveCount(0);
        }

        await nav
          .getByRole("button", { name: "Which reason?", exact: true })
          .click();
        const cases = new Set<string>();
        for (let index = 0; index < getCaseFamily(id).length; index++) {
          const caseId = (await guide.getAttribute(
            "data-case-reason",
          )) as GuideCaseKey;
          const variant = Number(await guide.getAttribute("data-case-variant"));
          const question = getGuideCase(caseId, variant);
          expect(cases.has(caseId)).toBe(false);
          cases.add(caseId);
          await choose((question.answer + 1) % question.options.length);
          await expect(guide.locator('[data-correct="false"]')).toBeVisible();
          await choose(question.answer);
          await expect(guide.locator('[data-correct="true"]')).toBeVisible();
          await guide.getByRole("button", { name: "Next case" }).click();
        }
        expect(cases).toEqual(new Set(getCaseFamily(id)));

        await nav
          .getByRole("button", { name: "Write it", exact: true })
          .click();
        await guide
          .getByRole("textbox", { name: "Your working" })
          .fill("My proof for " + id);
        const conclusion = guide.getByRole("group", {
          name: "Which conclusion completes your proof?",
        });
        const writingReason = guide.getByRole("group", {
          name: "Which reason justifies your conclusion?",
        });
        await conclusion
          .locator('[data-choice="' + spec.write.answer + '"]')
          .click();
        await expect(
          guide.getByText("Model working", { exact: true }),
        ).toHaveCount(0);
        const reasonIndex = writtenReasonQuestion(id).answer;
        await writingReason
          .locator('[data-choice="' + ((reasonIndex + 1) % 3) + '"]')
          .click();
        await expect(
          writingReason.locator('[data-correct="false"]'),
        ).toBeVisible();
        await expect(
          guide.getByText("Model working", { exact: true }),
        ).toHaveCount(0);
        await writingReason
          .locator('[data-choice="' + reasonIndex + '"]')
          .click();
        await expect(
          guide.getByText("Model working", { exact: true }),
        ).toBeVisible();
        await page.reload();
        await expect(
          guide.getByRole("textbox", { name: "Your working" }),
        ).toHaveValue("My proof for " + id);
        await expect(
          guide.getByText("Model working", { exact: true }),
        ).toBeVisible();
        expect(errors).toEqual([]);
      },
    );
  }
}

test("retry a missed direction on a fresh case, then review the original after reload", async ({
  page,
}) => {
  await openTopic(page, "Equal chords and distances");
  const guide = page.getByTestId("theorem-lesson");
  await guide
    .getByRole("button", { name: "Which reason?", exact: true })
    .click();
  await expect(guide.getByRole("heading", { level: 3 })).not.toContainText(
    /16\.\d/,
  );
  const id = (await guide.getAttribute("data-case-reason")) as GuideCaseKey;
  const variant = Number(await guide.getAttribute("data-case-variant"));
  const first = getGuideCase(id, variant);
  const wrong = (first.answer + 1) % first.options.length;
  const pick = (n: number) =>
    guide.locator('[data-choice="' + n + '"]').click();
  await pick(wrong);
  await pick(first.answer);
  const previous = guide.getByRole("button", {
    name: "Previous case",
    exact: true,
  });
  await guide
    .getByRole("button", { name: "Try a similar case", exact: true })
    .click();
  await expect(guide).toHaveAttribute("data-case-reason", id);
  const nextVariant = Number(await guide.getAttribute("data-case-variant"));
  expect(nextVariant).not.toBe(variant);
  expect(getGuideCase(id, nextVariant).given).not.toBe(first.given);
  await expect(guide.locator("[data-choice]:disabled")).toHaveCount(0);
  await previous.click();
  await page.reload();
  await expect(guide).toHaveAttribute("data-case-variant", String(variant));
  await expect(
    guide.locator('[data-choice="' + first.answer + '"]'),
  ).toHaveAttribute("data-answer", "correct");
  await expect(
    guide.getByRole("button", { name: "Try a similar case", exact: true }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Next case", exact: true }).click();
  await expect(guide).toHaveAttribute("data-case-variant", String(nextVariant));
});

test("restart can be cancelled and confirmation clears only this theorem", async ({
  page,
}) => {
  await openTopic(page, "Equal chords and distances");
  const guide = page.getByTestId("theorem-lesson");
  const write = guide.getByRole("button", { name: "Write it", exact: true });
  const draft = guide.getByRole("textbox", { name: "Your working" });
  for (const id of [4, 5]) {
    await page
      .getByRole("button", { name: new RegExp("^16\\." + id + " ·") })
      .click();
    await write.click();
    await draft.fill("Saved proof " + id);
  }
  const restart = guide.getByRole("button", {
    name: "Restart this theorem",
    exact: true,
  });
  await restart.click();
  await guide.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(draft).toHaveValue("Saved proof 5");
  await restart.click();
  await guide
    .getByRole("button", { name: "Confirm restart", exact: true })
    .click();
  await expect(
    guide.getByRole("button", { name: "Words", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await write.click();
  await expect(draft).toHaveValue("");
  await page.getByRole("button", { name: /^16\.4 ·/ }).click();
  await expect(draft).toHaveValue("Saved proof 4");
});
