import { expect, test, type Page } from "@playwright/test";

test.use({ actionTimeout: 10_000 });

const stepper = (page: Page) =>
  page.getByRole("navigation", { name: "Steps in this station" });
const blank = (page: Page) =>
  page.getByRole("group", { name: "Choose the words for the blank" });

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function openStationOne(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Learn the 17 circle reasons" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start here →" }).click();
  await expect(
    page.getByRole("heading", { name: "A line from the centre to a chord" }),
  ).toBeVisible();
}

test("a new student lands on the Learn path, with all seven stations and the three CPA stages", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Learn the 17 circle reasons" }),
  ).toBeVisible();
  const legend = page.getByRole("list", {
    name: "Concrete, Pictorial, Abstract",
  });
  await expect(legend.getByRole("listitem")).toHaveText([
    /Concrete/,
    /Pictorial/,
    /Abstract/,
  ]);
  for (const title of [
    "A line from the centre to a chord",
    "Equal chords, equal distances",
    "Angle at the centre",
    "Angles in the same segment",
    "Angle in a semi-circle",
    "Equal angles, arcs and chords",
    "Arcs in proportion",
  ])
    await expect(page.getByRole("button", { name: title })).toBeVisible();
  // The older activities are one tap away and unchanged.
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.getByTestId("paper-circle")).toBeVisible();
  expect(errors).toEqual([]);
});

test("a link can open Explore for a teacher-led lesson, or Learn for self-study", async ({
  page,
}) => {
  await page.goto("/#explore");
  await expect(page.getByTestId("paper-circle")).toBeVisible();
  // The link is used once: the address is clean, and a reload keeps the student's place.
  await expect(page).toHaveURL(/\/$/);
  await page
    .getByRole("button", { name: "Reasons Relay", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Reasons Relay", exact: true }),
  ).toBeVisible();
  // A link followed while the page is open switches at once.
  await page.evaluate(() => {
    window.location.hash = "learn";
  });
  await expect(
    page.getByRole("heading", { name: "Learn the 17 circle reasons" }),
  ).toBeVisible();
});

test("a station goes from a guess, to real objects, to a proof told on the diagram", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openStationOne(page);

  // Wonder: any guess is accepted, and it is kept.
  await expect(
    page.getByRole("heading", { name: "Mei's broken plate" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await page.getByRole("button", { name: /Only roughly/ }).click();
  await expect(page.getByText("Guess saved.")).toBeVisible();
  await page.getByRole("button", { name: "Next step: Discover →" }).click();

  // Discover starts with real objects: the concrete stage.
  await expect(page.getByText("Hands on", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fold a paper circle" }),
  ).toBeVisible();

  // Prove: a wrong choice explains itself and a right one fills the blank.
  await stepper(page).getByRole("button", { name: /Prove/ }).click();
  await expect(
    page.getByRole("heading", { name: "Why is 16.1 always true?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next line →" }).click();
  await expect(
    page.getByRole("button", { name: "Next line →" }),
  ).toBeDisabled();
  await blank(page).getByRole("button", { name: "radii", exact: true }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
  await blank(page).getByRole("button", { name: "given", exact: true }).click();
  await expect(page.getByText("Yes.", { exact: true })).toBeVisible();
  for (const answer of ["radii", "common side", "RHS", "corr. sides, ≅ △s"]) {
    await page.getByRole("button", { name: "Next line →" }).click();
    await blank(page)
      .getByRole("button", { name: answer, exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(page.getByText("Proof complete.")).toBeVisible();
  await expect(
    stepper(page).getByRole("button", { name: /Prove/ }),
  ).toContainText("1/3");

  // The finished proof and the guess are still there after a reload.
  await page.reload();
  await expect(
    stepper(page).getByRole("button", { name: /Prove/ }),
  ).toContainText("1/3");
  await expect(
    stepper(page).getByRole("button", { name: /Wonder/ }),
  ).toContainText("2/2");
  expect(errors).toEqual([]);
});

test("the exact wording of a reason is built from word tiles", async ({
  page,
}) => {
  await openStationOne(page);
  await stepper(page)
    .getByRole("button", { name: /Remember/ })
    .click();
  await page.getByRole("button", { name: "Next →" }).click();
  const tiles = page.getByRole("group", { name: "Word tiles" });
  // Wrong order first: the hint says to start with what is given.
  await tiles.getByRole("button", { name: "bisects chord" }).click();
  await tiles.getByRole("button", { name: "line from centre" }).click();
  await tiles.getByRole("button", { name: "⊥ chord" }).click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  for (const tile of ["line from centre", "⊥ chord", "bisects chord"])
    await tiles.getByRole("button", { name: tile, exact: true }).click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("That is the exact wording.")).toBeVisible();
});

test("a station Check marks five questions and can be tried again with new numbers", async ({
  page,
}) => {
  await openStationOne(page);
  await stepper(page).getByRole("button", { name: /Check/ }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  for (let question = 1; question <= 5; question++) {
    await expect(page.getByText(`Question ${question} of 5`)).toBeVisible();
    const options = page.getByRole("radio");
    if (await options.count()) await options.first().click();
    else await page.getByRole("textbox").fill("7");
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page
      .getByRole("button", {
        name: question < 5 ? "Next question →" : "See my result →",
      })
      .click();
  }
  await expect(page.getByText("/ 5")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again with new numbers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Keep exploring" }),
  ).toBeVisible();
});

test("the chapter test gives a report and remembers the paper", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Chapter test/ }).click();
  await page.getByRole("button", { name: "Start the test" }).click();
  await expect(page.getByText("Question 1 of 12")).toBeVisible();
  // Nothing is marked until the paper is handed in, and an answer can be changed.
  await page.getByRole("button", { name: "Go to question 12" }).click();
  await expect(page.getByText("Question 12 of 12")).toBeVisible();
  await page
    .getByRole("button", { name: "Hand in (0 of 12 answered)" })
    .click();
  await expect(page.getByText("/ 12")).toBeVisible();
  await expect(page.getByRole("heading", { name: "By section" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What to fix" }),
  ).toBeVisible();
  await expect(page.locator("pre")).toContainText("Mark: 0/12");
  await page
    .getByRole("button", { name: /All stations/ })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: /Chapter test/ }),
  ).toContainText("Last mark: 0 of 12");
});

for (const [name, viewport] of [
  ["a phone", { width: 375, height: 812 }],
  ["a small phone", { width: 360, height: 740 }],
  ["an iPad upright", { width: 820, height: 1180 }],
  ["an iPad on its side", { width: 1180, height: 820 }],
] as const)
  test.describe(`on ${name}`, () => {
    test.use({ viewport, hasTouch: true });

    test("nothing runs off the side of the screen", async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Learn the 17 circle reasons" }),
      ).toBeVisible();
      await noSidewaysScroll(page);
      await page.getByRole("button", { name: "Start here →" }).tap();
      await noSidewaysScroll(page);
      for (const step of ["Discover", "Prove", "Remember", "Use", "Check"]) {
        await stepper(page)
          .getByRole("button", { name: new RegExp(step) })
          .tap();
        await noSidewaysScroll(page);
      }
      await page
        .getByRole("button", { name: /All stations/ })
        .first()
        .tap();
      await page.getByRole("button", { name: /My reason map/ }).tap();
      await expect(
        page.getByRole("heading", { name: "My reason map" }),
      ).toBeVisible();
      await expect(page.getByText("not tested yet")).toHaveCount(17);
      await noSidewaysScroll(page);
    });

    test("the picture stays in view while a proof is read", async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Start here →" }).tap();
      await stepper(page).getByRole("button", { name: /Prove/ }).tap();
      await page.getByRole("button", { name: "Next line →" }).tap();
      await blank(page)
        .getByRole("button", { name: "given", exact: true })
        .tap();
      await page.getByRole("button", { name: "Next line →" }).tap();
      const chips = blank(page).getByRole("button", { name: "radii" });
      await expect(chips).toBeInViewport();
      await expect(
        page.getByRole("img", { name: /ON meets chord AB/ }),
      ).toBeInViewport();
    });
  });
