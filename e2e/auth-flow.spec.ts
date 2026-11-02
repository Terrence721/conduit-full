import { expect, test } from "@playwright/test";

// Flaky in this environment (backend/Postgres port and proxy instability);
// keep as a scaffold until the local stack is reliably runnable.
test.skip("registers, creates an article, comments, and saves it", async ({
  page,
  request,
}) => {
  const id = Date.now();
  const username = `e2e${id}`;
  const email = `${username}@example.com`;
  const password = "password123";
  const title = `E2E story ${id}`;

  const response = await request.post("http://localhost:3007/api/users", {
    data: { user: { email, password, username } },
  });
  const parsed = (await response.json()) as { user?: { token: string } };
  const user = parsed?.user;
  if (!user) throw new Error("no user returned");

  await page.goto("/");
  await page.evaluate(
    ({ token, username }) => {
      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          headers: { Authorization: `Token ${token}` },
          isAuth: true,
          loggedUser: { username, token },
        }),
      );
    },
    { token: user.token, username },
  );

  await page.goto("/editor");
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
  await saveButton.click();
  await expect(page.getByRole("button", { name: /saved/i })).toBeVisible();
});
