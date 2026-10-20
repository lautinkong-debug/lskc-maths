import { expect, test, type Page } from "@playwright/test";
import { copy } from "../../src/lib/copy";
import {
  lessonRound,
  lessonSetup,
  mixedRounds,
  type Mission,
  type Round,
} from "../../src/apps/similarity/games/model";
import { edgeCrossesLabel } from "../../src/apps/similarity/vertexLabels";

const c = copy.similarityGames;
const game = (page: Page) => page.getByTestId("similarity-games");
async function selectProof(page: Page, round: Round) {
  for (const id of round.required)
    await game(page).getByTestId(`evidence-${id}`).click();
  await game(page)
    .getByRole("button", {
      name:
        round.criterion === "insufficient"
          ? c.insufficient
          : c.missions[round.criterion].rule,
      exact: true,
    })
    .click();
  await game(page).getByRole("button", { name: c.check, exact: true }).click();
  await expect(game(page).getByRole("status")).toContainText(c.success);
}
async function explain(page: Page, round: Round) {
  const proof = game(page).getByTestId("game-proof"),
    board = game(page).getByTestId("game-board");
  await expect(proof.locator("tbody tr")).toHaveCount(0);
  await expect(board.locator("[data-game-mark]")).toHaveCount(0);
  for (let i = 0; i < round.proof.length; i++) {
    await proof.getByRole("button", { name: c.nextStep, exact: true }).click();
    await expect(proof.locator("tbody tr")).toHaveCount(i + 1);
    await expect(
      proof.locator("tbody tr").last().locator("td").last(),
    ).toHaveText(c.reasons[round.proof[i].reasonKey as keyof typeof c.reasons]);
    const marks = await board
      .locator("[data-game-mark]")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("data-game-mark")).sort(),
      );
    expect(marks).toEqual(
      round.proof[i].evidence
        .flatMap((id) => (round.proof[i].members ?? [0, 1]).map(() => id))
        .sort(),
    );
    if (round.proof[i].members) {
      const other = 1 - round.proof[i].members![0];
      await expect(
        board.getByTestId(`game-triangle-${other}`).locator("[data-game-mark]"),
      ).toHaveCount(0);
    }
  }
  await expect(
    proof.getByRole("button", { name: c.nextStep, exact: true }),
  ).toBeDisabled();
}

test("games integrate with textbook practice and keep its question", async ({
  page,
}) => {
  await page.goto("/apps/similarity#ex8c-19");
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Similarity Detective", exact: true }),
  ).toBeVisible();
  for (const name of [
    "Angle Match",
    "Ratio Repair",
    "Find the Hinge",
    "Mixed challenge",
  ])
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Textbook practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Exercise 8C · Q19", exact: true }),
  ).toBeVisible();
});

for (const mission of ["aaa", "sides", "included"] as Mission[]) {
  test(`${mission}: all three missions, one-line proofs and saved completion`, async ({
    page,
  }) => {
    await page.goto("/apps/similarity#games");
    await game(page)
      .getByRole("button", { name: c.missions[mission].title, exact: true })
      .click();
    for (let level = 0; level < 3; level++) {
      const setup = lessonSetup(mission, level);
      const labels = {
        angleA: c.angleD,
        angleB: c.angleE,
        thirdSide: c.thirdSide,
        hinge: c.hinge,
      };
      for (const [key, value] of Object.entries(setup.goal))
        await game(page)
          .getByRole("spinbutton", {
            name: labels[key as keyof typeof labels],
            exact: true,
          })
          .fill(String(value));
      const round = lessonRound(mission, level, setup.goal);
      if (mission === "aaa") {
        await expect(game(page).getByTestId("evidence-angle-2")).toHaveCount(0);
        await game(page)
          .getByRole("spinbutton", { name: c.thirdAngle, exact: true })
          .fill(String(round.triangles[1].angles[2]));
      }
      await selectProof(page, round);
      await explain(page, round);
      if (mission === "sides")
        expect(
          await game(page).getByTestId("game-proof").locator(".mfrac").count(),
        ).toBeGreaterThan(3);
      await game(page)
        .getByRole("button", {
          name: level === 2 ? c.finish : c.next,
          exact: true,
        })
        .click();
    }
    await expect(
      game(page).getByRole("heading", { name: c.resultTitle }),
    ).toBeVisible();
    await page.reload();
    await expect(
      game(page).getByRole("button", {
        name: c.missions[mission].title,
        exact: true,
      }),
    ).toContainText("3 / 3");
  });
}

test("all twelve mixed rounds include three insufficient-information cases", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/apps/similarity#games");
  await game(page).getByRole("button", { name: c.mixed, exact: true }).click();
  for (let i = 0; i < mixedRounds.length; i++) {
    const round = mixedRounds[i];
    await selectProof(page, round);
    await explain(page, round);
    await expect(game(page)).toContainText(
      c.explanations[round.explanationKey as keyof typeof c.explanations],
    );
    await game(page)
      .getByRole("button", {
        name: i === 11 ? c.finish : c.nextRound,
        exact: true,
      })
      .click();
  }
  await expect(
    game(page).getByRole("heading", { name: c.resultTitle }),
  ).toBeVisible();
  await page.reload();
  await expect(
    game(page).getByRole("button", { name: c.mixed, exact: true }),
  ).toContainText("12 / 12");
});

test("a non-included equal angle gives specific feedback and cannot pass", async ({
  page,
}) => {
  await page.goto("/apps/similarity#games");
  await game(page).getByRole("button", { name: c.mixed, exact: true }).click();
  await game(page)
    .getByRole("button", { name: "Round 9", exact: true })
    .click();
  for (const id of mixedRounds[8].required)
    await game(page).getByTestId(`evidence-${id}`).click();
  await game(page)
    .getByRole("button", { name: c.missions.included.rule, exact: true })
    .click();
  await game(page).getByRole("button", { name: c.check, exact: true }).click();
  await expect(game(page).getByRole("status")).toHaveText(c.feedback.included);
  await expect(game(page).getByTestId("game-proof")).toHaveCount(0);
});

test("wrong construction and third-angle answers cannot pass", async ({
  page,
}) => {
  await page.goto("/apps/similarity#games");
  await game(page)
    .getByRole("button", { name: c.missions.aaa.title, exact: true })
    .click();
  await game(page)
    .getByRole("button", { name: c.missions.aaa.rule, exact: true })
    .click();
  await game(page)
    .getByRole("spinbutton", { name: c.thirdAngle, exact: true })
    .fill("60");
  await game(page).getByRole("button", { name: c.check, exact: true }).click();
  await expect(game(page).getByRole("status")).toHaveText(c.feedback.third);
  await game(page)
    .getByRole("spinbutton", { name: c.thirdAngle, exact: true })
    .fill("70");
  for (const id of ["angle-0", "angle-1", "angle-2"])
    await game(page).getByTestId(`evidence-${id}`).click();
  await game(page).getByRole("button", { name: c.check, exact: true }).click();
  await expect(game(page).getByRole("status")).toHaveText(c.feedback.repair);
  await expect(game(page).getByTestId("game-proof")).toHaveCount(0);
});

test("students can type multi-digit values and equality marks wait for equal angles", async ({
  page,
}) => {
  await page.goto("/apps/similarity#games");
  await game(page)
    .getByRole("button", { name: c.missions.aaa.title, exact: true })
    .click();
  await expect(game(page).getByTestId("equality-angle-mark")).toHaveCount(0);
  for (const [name, value] of [
    [c.angleD, "60"],
    [c.angleE, "50"],
  ]) {
    const input = game(page).getByRole("spinbutton", { name, exact: true });
    await input.fill("");
    await input.pressSequentially(value);
    await expect(input).toHaveValue(value);
    await input.press("Tab");
  }
  await expect(game(page).getByTestId("equality-angle-mark")).toHaveCount(4);
  await game(page)
    .getByRole("button", { name: `← ${c.back}`, exact: true })
    .click();
  await game(page)
    .getByRole("button", { name: c.missions.sides.title, exact: true })
    .click();
  const side = game(page).getByRole("spinbutton", {
    name: c.thirdSide,
    exact: true,
  });
  await side.fill("");
  await side.pressSequentially("14");
  await expect(side).toHaveValue("14");
  await side.press("Enter");
  await selectProof(page, lessonRound("sides", 0, { thirdSide: 14 }));
});

test("mouse and keyboard transforms preserve the given lengths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/similarity#games");
  await game(page)
    .getByRole("button", { name: c.missions.sides.title, exact: true })
    .click();
  const triangle = game(page).getByTestId("game-triangle-0");
  const values = await triangle.locator("text").allTextContents();
  const shape = triangle.getByRole("button", {
    name: "Move triangle ABC",
    exact: true,
  });
  await shape.focus();
  await shape.press("ArrowRight");
  await shape.press("r");
  await shape.press("h");
  await expect(triangle).toHaveAttribute("data-x", "8");
  await expect(triangle).toHaveAttribute("data-angle", "3");
  const box = await shape.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 + 30,
    box!.y + box!.height / 2 + 20,
    { steps: 6 },
  );
  await page.mouse.up();
  expect(Number(await triangle.getAttribute("data-x"))).toBeGreaterThan(8);
  const handle = triangle.getByRole("button", {
    name: "Turn or resize at A",
    exact: true,
  });
  await handle.focus();
  await handle.press("ArrowUp");
  await handle.press("ArrowRight");
  await expect(triangle).toHaveAttribute("data-scale", "1.05");
  expect(await triangle.locator("text").allTextContents()).toEqual(values);
  await game(page)
    .getByRole("button", { name: c.resetView, exact: true })
    .click();
  await expect(triangle).toHaveAttribute("data-x", "0");
  await expect(triangle).toHaveAttribute("data-scale", "1");
});

test("phone touch drag, labels, proof columns and projection remain readable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto("/apps/similarity#games");
  await game(page)
    .getByRole("button", { name: c.missions.aaa.title, exact: true })
    .click();
  await game(page)
    .getByRole("spinbutton", { name: c.angleD, exact: true })
    .fill("60");
  await game(page)
    .getByRole("spinbutton", { name: c.angleE, exact: true })
    .fill("50");
  await game(page)
    .getByRole("spinbutton", { name: c.thirdAngle, exact: true })
    .fill("70");
  const board = game(page).getByTestId("game-board"),
    triangle = game(page).getByTestId("game-triangle-0");
  const inspect = async () => {
    const data = await board.evaluate((svg) => ({
      labels: [...svg.querySelectorAll<SVGTextElement>("text")].map((el) => {
        const b = el.getBBox();
        return {
          text: el.textContent,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
        };
      }),
      polygons: [...svg.querySelectorAll<SVGPolygonElement>("polygon")].map(
        (el) => [...el.points].map((p) => ({ x: p.x, y: p.y, label: "" })),
      ),
    }));
    for (let i = 0; i < data.labels.length; i++) {
      const a = data.labels[i];
      for (const b of data.labels.slice(i + 1))
        expect(
          a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y,
          `${a.text} overlaps ${b.text}`,
        ).toBe(false);
      for (const polygon of data.polygons)
        for (let j = 0; j < 3; j++)
          expect(
            edgeCrossesLabel(polygon[j], polygon[(j + 1) % 3], a),
            `${a.text} touches edge`,
          ).toBe(false);
    }
  };
  await inspect();
  const handle = triangle.getByRole("button", {
    name: "Turn or resize at A",
    exact: true,
  });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox(),
    x = box!.x + box!.width / 2,
    y = box!.y + box!.height / 2;
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x - 15, y: y - 25 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(Number(await triangle.getAttribute("data-angle"))).not.toBe(-12);
  expect(Number(await triangle.getAttribute("data-scale"))).not.toBe(1);
  await inspect();
  const round = lessonRound("aaa", 0, lessonSetup("aaa", 0).goal);
  await selectProof(page, round);
  await explain(page, round);
  const proof = game(page).getByTestId("game-proof");
  await expect(proof.locator(".katex-error")).toHaveCount(0);
  for (const row of await proof.locator("tbody tr").all()) {
    const a = await row.locator("td").first().boundingBox(),
      b = await row.locator("td").last().boundingBox();
    expect(b!.x).toBeGreaterThanOrEqual(a!.x + a!.width - 1);
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await proof.screenshot({
    path: "out/similarity-preview/games-proof-phone.png",
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(game(page)).toHaveAttribute("data-projecting", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await game(page).screenshot({
    path: "out/similarity-preview/games-proof-desktop.png",
  });
  await context.close();
});

test("an incorrect reason and partial evidence cannot complete a repaired game", async ({
  page,
}) => {
  await page.goto("/apps/similarity#games");
  await page.getByRole("button", { name: "Ratio Repair", exact: true }).click();
  await page.getByLabel("Third side FD", { exact: true }).fill("14");
  await page.getByRole("button", { name: "Check proof", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Choose");
  await page
    .getByRole("button", { name: "3 sides prop.", exact: true })
    .click();
  await page.getByTestId("evidence-side-0").click();
  await page.getByRole("button", { name: "Check proof", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("evidence");
  await expect(
    page.getByRole("button", { name: "Next step", exact: true }),
  ).toHaveCount(0);
});
