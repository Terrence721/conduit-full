import { expect, test } from "@playwright/test";

test("registers, creates an article, comments, and saves it", async ({
  page,
}) => {
  test.setTimeout(120000);
  const id = Date.now();
  const username = `e2e${id}`;
  const email = `${username}@example.com`;
  const password = "password123";

  await page.goto("/register");

  await page.getByPlaceholder("Your Name").fill(username);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  page.on("console", (msg) => console.log("BROWSER:", msg.text()));
  page.on("requestfailed", (req) =>
    console.log("FAILED:", req.method(), req.url(), req.failure()?.errorText),
  );
  page.on("request", (req) => console.log("REQUEST:", req.method(), req.url()));
  page.on("response", (res) =>
    console.log("RESPONSE:", res.status(), res.url()),
  );

  console.log(
    "VALUES:",
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map(
        (input) => (input as HTMLInputElement).value,
      ),
    ),
  );

  await page
    .locator("form")
    .evaluate((form) => (form as HTMLFormElement).requestSubmit());

  await page.waitForTimeout(60000);
  console.log("AFTER SIGNUP BODY:", await page.locator("body").innerText());

  await expect(page.getByText(/ideas worth/i)).toBeVisible();

  await page.goto("/editor");

  const title = `E2E story ${id}`;
  await page.getByPlaceholder("Article Title").fill(title);
  await page.getByPlaceholder("What's this article about?").fill("desc");
  await page.getByPlaceholder("Write your article (in markdown)").fill("body");
  await page.getByPlaceholder("Enter tags").fill("e2e");
  await page.getByRole("button", { name: "Publish Article" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible({ timeout: 30000 });

  await page.getByPlaceholder("Write a comment...").fill("great article");
  await page.getByRole("button", { name: /post comment/i }).click();

  await expect(page.getByText("great article")).toBeVisible({ timeout: 30000 });

  const saveButton = page.getByRole("button", { name: /save story/i });
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  await expect(page.getByRole("button", { name: /saved/i })).toBeVisible();
});
