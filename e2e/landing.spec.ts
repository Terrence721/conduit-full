import { expect, test } from "@playwright/test";

test("loads the editorial landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/ideas worth/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /start reading/i }),
  ).toBeVisible();
});

test("filters stories by search", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search stories").fill("Maya");

  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "The quiet craft of designing for trust",
    }),
  ).toBeVisible();
});

test("shows the empty state for a no-match search", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Search stories").fill("zzzz-not-a-story");

  await expect(page.getByText("Try another idea.")).toBeVisible();
});
