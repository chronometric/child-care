import { test, expect } from "@playwright/test";

test.describe("login", () => {
  test("sign-in page shows email and password fields", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("doctor login succeeds when E2E credentials are set", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD for this test");

    await page.goto("/auth/sign-in");
    await page.getByTestId("login-email").fill(email!);
    await page.getByTestId("login-password").fill(password!);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 30_000 });
  });
});
