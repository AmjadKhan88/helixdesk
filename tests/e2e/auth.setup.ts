import { expect, test as setup } from "@playwright/test";
import { USERS, authFile } from "./constants";

for (const role of ["admin", "agent", "customer"] as const) {
  setup(`sign in as ${role}`, async ({ page }) => {
    const user = USERS[role];
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(
      role === "customer" ? /\/portal/ : /\/dashboard/,
    );
    await page.context().storageState({ path: authFile(role) });
  });
}
