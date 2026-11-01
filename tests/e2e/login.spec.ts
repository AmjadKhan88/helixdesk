import { expect, test } from "@playwright/test";
import { USERS, authFile } from "./constants";

test.describe("signing in", () => {
  test("a wrong password is rejected", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(USERS.agent.email);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toHaveText(
      "Invalid email or password.",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("an agent signs in and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(USERS.agent.email);
    await page.getByLabel("Password").fill(USERS.agent.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Good (morning|afternoon|evening), Leo/,
      }),
    ).toBeVisible();
  });

  test("signed-out visitors are sent to the login page", async ({ page }) => {
    await page.goto("/tickets");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });
});

test.describe("role walls", () => {
  test.describe("as an agent", () => {
    test.use({ storageState: authFile("agent") });

    test("cannot open the admin area", async ({ page }) => {
      await page.goto("/admin/team");
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("the team API refuses an agent", async ({ page }) => {
      const res = await page.request.post("/api/team", {
        data: { name: "X Y", email: "x@y.test", role: "agent" },
      });
      expect(res.status()).toBe(403);
    });
  });

  test.describe("as a customer", () => {
    test.use({ storageState: authFile("customer") });

    test("is kept out of staff pages", async ({ page }) => {
      for (const path of ["/dashboard", "/tickets", "/admin/team"]) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/portal/);
      }
    });
  });
});
