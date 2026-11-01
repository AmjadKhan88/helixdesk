import { expect, test } from "@playwright/test";
import { USERS, authFile } from "./constants";

test.use({ storageState: authFile("agent") });

test("a ticket that was resolved and then reopened still counts as resolved work", async ({
  page,
}) => {
  const resolvedToday = () =>
    page
      .getByText("Resolved today", { exact: true })
      .locator("xpath=following-sibling::p[1]");

  await page.goto("/dashboard");
  await expect(resolvedToday()).toHaveText(/^\d+$/);
  const before = Number(await resolvedToday().innerText());

  // Create a ticket, resolve it, then reopen it
  const created = await page.request.post("/api/tickets", {
    data: {
      subject: `E2E reopened ${Date.now()}`,
      body: "Resolve then reopen.",
      requester: { email: USERS.customer.email },
    },
  });
  expect(created.status()).toBe(201);
  const { ticket } = await created.json();

  expect(
    (
      await page.request.patch(`/api/tickets/${ticket.number}`, {
        data: { status: "resolved" },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await page.request.patch(`/api/tickets/${ticket.number}`, {
        data: { status: "open" },
      })
    ).ok(),
  ).toBeTruthy();

  // It is open again, yet today's resolved count went up by exactly one
  await page.reload();
  await expect(resolvedToday()).toHaveText(String(before + 1));
});
