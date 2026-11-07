import { expect, test, type Page } from "@playwright/test";
import {
  chordComparisonChecks,
  theoremLessons,
  type GuidedReasonId,
} from "../../src/apps/circle-properties/theoremLessonData";
import {
  relatedCases,
  type CaseId,
} from "../../src/apps/circle-properties/theoremGuideSession";

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

for (const topic of topics) {
  test("discover and apply each theorem in " + topic.name, async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openTopic(page, topic.name);
    for (const id of topic.ids) {
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
        await guide.getByRole("button", { name: "Keep this bisector" }).click();
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
      await expect(svg.locator('[data-stage="result"]').first()).toBeVisible();
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
      for (let index = 0; index < relatedCases(id).length; index++) {
        const caseId = (await guide.getAttribute("data-case-reason")) as CaseId;
        const question =
          caseId === "r1" || caseId === "r2"
            ? chordComparisonChecks[caseId]
            : theoremLessons[caseId].check;
        expect(cases.has(caseId)).toBe(false);
        cases.add(caseId);
        await choose((question.answer + 1) % 3);
        await expect(guide.locator('[data-correct="false"]')).toBeVisible();
        await choose(question.answer);
        await expect(guide.locator('[data-correct="true"]')).toBeVisible();
        await guide.getByRole("button", { name: "Another case" }).click();
      }
      expect(cases).toEqual(new Set(relatedCases(id)));

      await nav.getByRole("button", { name: "Write it", exact: true }).click();
      await guide
        .getByRole("textbox", { name: "Your working" })
        .fill("My proof for " + id);
      await choose(spec.write.answer);
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
    }
    expect(errors).toEqual([]);
  });
}
