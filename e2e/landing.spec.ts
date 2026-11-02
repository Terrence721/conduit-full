import { expect, test } from "@playwright/test";

test("loads the editorial landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/ideas worth/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /start reading/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Stories for curious people" }),
  ).toBeVisible();
});

test("filters stories by search", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search stories").fill("Elena");

  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 3,
    }),
  ).toBeVisible();
});

test("shows the empty state for a no-match search", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search stories").fill("zzzz-not-a-story");

  await expect(page.getByText("Try another idea.")).toBeVisible();
});

test("clears filters from the empty state", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search stories").fill("zzzz-not-a-story");
  await expect(page.getByText("Try another idea.")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();

  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 3,
    }),
  ).toBeVisible();
});

test("filters stories by topic", async ({ page }) => {
  await page.goto("/");

  const topicButton = page
    .locator(".topic-strip button", { hasText: "Design" })
    .first();

  await topicButton.click();

  await expect(page.locator(".active-filter")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 3,
    }),
  ).toBeVisible();

  await page.locator(".active-filter").click();

  await expect(page.locator(".active-filter")).not.toBeVisible();
});

test("switches feed tabs", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Following" }).click();

  await expect(page.getByRole("tab", { name: "Following" })).toHaveClass(
    /active/,
  );
  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 3,
    }),
  ).not.toBeVisible();
});

test("opens and closes the article reader for the featured story", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /read featured story/i }).click();

  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Speed is not the same as progress"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Back to stories" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back to stories" }).click();

  await expect(
    page.getByRole("heading", { name: "Stories for curious people" }),
  ).toBeVisible();
});

test("toggles saving a story", async ({ page }) => {
  await page.goto("/");

  const saveButton = page.locator(".article-stats button").first();

  await expect(saveButton).toBeVisible();
  await saveButton.click();
  await expect(saveButton).toHaveClass(/saved/);
  await expect(saveButton).toHaveAttribute(
    "aria-label",
    "Remove The case for designing slower from saved stories",
  );
});

test("opens an article from the story list", async ({ page }) => {
  await page.goto("/");

  await page.locator(".article-title-link").first().click();

  await expect(
    page.getByRole("heading", {
      name: "The case for designing slower",
      level: 1,
    }),
  ).toBeVisible();
});

test("joins the community form is present", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByPlaceholder("Your email address")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /join the community/i }),
  ).toBeVisible();
});
