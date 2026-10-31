import { expect, test, type Page } from "@playwright/test";
import { getReasonChallenge } from "../../src/apps/circle-properties/reasonChallenge";

test.use({ actionTimeout: 10_000 });

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("circle-diagram")).toBeVisible();
}

test("reason game keeps four-step drafts and checked answers when returning to question one", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Reason game", exact: true }).click();
  await page.getByRole("button", { name: "Start level", exact: true }).click();
  const game = page.getByRole("region", {
    name: "Reason challenge",
    exact: true,
  });
  const questionId = (await game
    .locator("[data-question-id]")
    .getAttribute("data-question-id"))!;
  const [reasonId, variant] = questionId.split("-");
  const challenge = getReasonChallenge(reasonId, Number(variant));
  const answer = game.locator("#reason-challenge-value");
  const wrongReason = challenge.reasonChoices.find((id) => id !== reasonId)!;
  async function choose(group: string, choice: string) {
    const buttons = game
      .getByRole("group", { name: group, exact: true })
      .getByRole("button");
    for (let i = 0; i < (await buttons.count()); i++) {
      if ((await buttons.nth(i).getAttribute("data-choice")) === choice) {
        await buttons.nth(i).click();
        return;
      }
    }
    throw new Error("Missing challenge choice " + choice);
  }
  await expect(
    game.getByRole("img", { name: /Question diagram/ }),
  ).toBeVisible();
  const legends = await game.locator("fieldset legend").allTextContents();
  expect(legends).toHaveLength(4);
  expect(legends[0]).toContain("Find the value");
  expect(legends[1]).toContain("Check the condition");
  expect(legends[2]).toContain("Identify the target");
  expect(legends[3]).toContain("Choose the reason");
  await answer.fill(String(challenge.q.answer));
  await choose("Condition choices", challenge.q.condition);
  await choose("Target choices", challenge.target);
  await choose("Reason choices", wrongReason);

  await game
    .getByRole("button", { name: "Go to question 2", exact: true })
    .click();
  await expect(answer).toHaveValue("");
  await game
    .getByRole("button", { name: "Go to question 1", exact: true })
    .click();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await expect(
    game
      .getByRole("group", { name: "Reason choices", exact: true })
      .locator('button[aria-pressed="true"]'),
  ).toHaveAttribute("data-choice", wrongReason);

  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: "Reason game", exact: true }).click();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await game
    .getByRole("button", { name: "Check all four steps", exact: true })
    .click();
  await expect(
    game.getByRole("heading", { name: "Repair your argument", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByText("70/100 for this answer", { exact: false }),
  ).toBeVisible();
  await game
    .getByRole("button", { name: "Go to question 2", exact: true })
    .click();
  await game
    .getByRole("button", { name: "Go to question 1", exact: true })
    .click();
  await expect(answer).toBeDisabled();
  await page.reload();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await expect(answer).toBeDisabled();
  await expect(
    game.getByRole("heading", { name: "Repair your argument", exact: true }),
  ).toBeVisible();
  await game
    .getByRole("button", { name: "Try the steps again", exact: true })
    .click();
  await choose("Reason choices", reasonId);
  await game
    .getByRole("button", { name: "Check all four steps", exact: true })
    .click();
  await expect(
    game.getByRole("heading", { name: "Argument complete!", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByText("100/100 for this answer", { exact: false }),
  ).toBeVisible();
});
