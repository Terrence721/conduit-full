import { expect, test } from "@playwright/test";

test("shows the home route", async ({ page }) => {
  await page.goto("/home");

  await expect(
    page.getByRole("heading", { name: "Stories for curious people" }),
  ).toBeVisible();
});

test("shows the login route", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByText("Sign in")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Need an account?" }),
  ).toBeVisible();
});

test("shows the sign-up route", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in to your account" }),
  ).toBeVisible();
});

test("shows the not-found route", async ({ page }) => {
  await page.goto("/does-not-exist");

  await expect(page.getByText("404 Not Found")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to home page" }),
  ).toBeVisible();
});

test("redirects settings to home when logged out", async ({ page }) => {
  await page.goto("/settings");

  await expect(
    page
      .getByText("A place to share your knowledge.")
      .or(page.getByText("Stories for curious people")),
  ).toBeVisible();
});
