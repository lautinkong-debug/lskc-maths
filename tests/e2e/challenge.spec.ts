import { expect,test } from "@playwright/test";

test("teacher creates a room and sees an anonymous student's server-marked score",async({page,browser})=>{
  await page.goto("/login");
  await page.getByRole("button",{name:/^Teacher:/}).click();
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
  await page.goto("/challenges/new?app=directed-numbers");
  await page.getByLabel("Challenge title").fill("F1 two-window check");
  await page.getByRole("button",{name:"Create challenge"}).click();
  await expect(page).toHaveURL(/\/challenges\/[A-Za-z0-9]+$/);
  const code=(await page.locator('section[aria-label="Join code"] p.font-display').innerText()).replace(/\s/g,"");
  expect(code).toMatch(/^[A-Z2-9]{6}$/);

  const studentContext=await browser.newContext();
  try{
    const student=await studentContext.newPage();
    await student.goto(`/join/${code}`);
    await expect(student.getByRole("heading",{name:"Choose your game identity"})).toBeVisible();
    await student.getByRole("button",{name:"Join challenge"}).click();
    await expect(student.getByText("Get ready! Your teacher will start soon.")).toBeVisible({timeout:20000});
    await expect(page.getByText("1 player")).toBeVisible();
    await page.getByRole("button",{name:"Start",exact:true}).click();
    await expect(student.getByRole("button",{name:"Start my questions"})).toBeVisible();
    await student.getByRole("button",{name:"Start my questions"}).click();
    await expect(student.getByRole("button",{name:"Skip"})).toBeVisible({timeout:15000});
    await student.getByRole("button",{name:"Skip"}).click();
    await student.getByRole("button",{name:"Next question"}).click();
    await expect(student.getByText("Question 2 of 5")).toBeVisible();
    await student.reload();
    await expect(student.getByText("Question 2 of 5")).toBeVisible({timeout:15000});
    for(let index=1;index<5;index++){
      await student.getByRole("button",{name:"Skip"}).click();
      await student.getByRole("button",{name:"Next question"}).click();
    }
    await expect(student.getByRole("heading",{name:"Your result"})).toBeVisible({timeout:15000});
    await student.reload();
    await expect(student.getByRole("heading",{name:"Your result"})).toBeVisible({timeout:15000});
    await expect(student.getByText("Score as directed numbers")).toBeVisible();
    await expect(student.getByText("You are at the top!")).toBeVisible();
    await expect(student.getByText(/1st of 1/)).toHaveCount(0);
    await expect(page.getByRole("heading",{name:"Live board"})).toBeVisible();
    await expect(page.getByText("Swift Fox")).toBeVisible();
    await expect(page.getByText("0",{exact:true}).first()).toBeVisible();
    await page.getByRole("button",{name:"End now"}).click();
    await expect(page.getByRole("heading",{name:"Podium"})).toBeVisible();
    await expect(page.getByRole("meter")).toHaveCount(5);
    await page.getByRole("button",{name:"Reveal next podium place"}).click();
    await expect(page.getByText("Swift Fox")).toBeVisible();
    await expect(page.getByRole("button",{name:"Reveal next podium place"})).toHaveCount(0);
  }finally{await studentContext.close();}
});
