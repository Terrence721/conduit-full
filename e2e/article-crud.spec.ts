import { expect, test } from "@playwright/test";

test("creates, edits, comments on, and deletes an article", async ({
  page,
  request,
}) => {
  const id = Date.now();
  const username = `crud${id}`;
  const email = `${username}@example.com`;
  const password = "password123";
  const title = `CRUD story ${id}`;
  const updatedTitle = `${title} (edited)`;

  const response = await request.post("http://localhost:3001/api/users", {
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

  // Create
  await page.goto("/editor");
  await page.getByPlaceholder("Article Title").fill(title);
  await page.getByPlaceholder("What's this article about?").fill("desc");
  await page.getByPlaceholder("Write your article (in markdown)").fill("body");
  await page.getByRole("button", { name: "Publish Article" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible({
    timeout: 30000,
  });

  const slug = new URL(page.url()).pathname.split("/article/")[1];

  // Comment
  await page.getByPlaceholder("Write a comment...").fill("great article");
  await page.getByRole("button", { name: /post comment/i }).click();
  await expect(page.getByText("great article")).toBeVisible({ timeout: 30000 });

  // Edit via API (mirrors the editor's PUT; the editor UI is covered
  // separately by the component tests)
  const updateResponse = await request.put(
    `http://localhost:3001/api/articles/${slug}`,
    {
      data: {
        article: {
          body: "body",
          description: "desc",
          title: updatedTitle,
        },
      },
      headers: { Authorization: `Token ${user.token}` },
    },
  );
  expect(updateResponse.ok()).toBeTruthy();

  await page.goto(`/article/${slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: updatedTitle }),
  ).toBeVisible({ timeout: 30000 });

  // Delete via API (no in-page delete control today)
  const deleteResponse = await request.delete(
    `http://localhost:3001/api/articles/${slug}`,
    { headers: { Authorization: `Token ${user.token}` } },
  );
  expect(deleteResponse.ok()).toBeTruthy();

  await page.goto("/");
  await expect(page.getByText(updatedTitle)).not.toBeVisible();
});
