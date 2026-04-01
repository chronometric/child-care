import { test, expect } from "@playwright/test";

test.describe("room flow", () => {
  test("create room button opens onboarding", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD");

    await page.goto("/auth/sign-in");
    await page.getByTestId("login-email").fill(email!);
    await page.getByTestId("login-password").fill(password!);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 30_000 });

    await page.goto("/room/create");
    await page.getByTestId("create-room-start").click();
    await expect(page).toHaveURL(/\/room\/create\/onboarding/, { timeout: 15_000 });
  });

  test("room detail shows chat composer", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("username", "e2e-doctor");
    });
    await page.goto("/room/e2e-smoke-room?message=patient&user=creator");
    await expect(page.getByTestId("room-chat-input")).toBeVisible({ timeout: 25_000 });
    await expect(page.getByTestId("room-chat-send")).toBeVisible();
  });

  test("user can type and send a chat line (local echo)", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("username", "e2e-doctor");
    });
    await page.goto("/room/e2e-smoke-room?message=patient&user=creator");
    const input = page.getByTestId("room-chat-input");
    await input.waitFor({ state: "visible", timeout: 25_000 });
    await input.fill("e2e hello");
    await page.getByTestId("room-chat-send").click();
    await expect(page.getByText("e2e hello", { exact: false })).toBeVisible({ timeout: 10_000 });
  });
});
