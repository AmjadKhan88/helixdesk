import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { AUTH_DIR, authFile } from "./constants";

test.use({ storageState: authFile("customer") });

test("a customer opens a request, staff answer it, and a reply reopens it", async ({
  page,
  browser,
}) => {
  const subject = `E2E portal request ${Date.now()}`;

  // 1) The customer sends a request
  await page.goto("/portal/new");
  await page.getByLabel("Subject").fill(subject);
  await page
    .getByLabel("Details")
    .fill("I cannot download my invoice from the billing page.");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page).toHaveURL(/\/portal\/tickets\/\d+/);
  await expect(
    page.getByRole("heading", { level: 1, name: subject }),
  ).toBeVisible();
  const number = new URL(page.url()).pathname.split("/").pop()!;

  // 2) Staff reply publicly, leave an internal note, and resolve it
  const staff = await browser.newContext({ storageState: authFile("agent") });
  const staffPage = await staff.newPage();
  await staffPage.goto(`/tickets/${number}`);
  const conversation = staffPage.getByRole("region", { name: "Conversation" });

  await conversation
    .getByRole("textbox", { name: "Reply", exact: true })
    .fill("Thanks Cora, we are checking your invoice access.");
  await conversation.getByRole("button", { name: "Send reply" }).click();
  await expect(
    conversation.getByText("we are checking your invoice access"),
  ).toBeVisible();

  await conversation.getByRole("button", { name: "Internal note" }).click();
  await conversation
    .getByRole("textbox", { name: "Internal note" })
    .fill("SECRET-INTERNAL-NOTE do not share");
  await conversation.getByRole("button", { name: "Add note" }).click();
  await expect(conversation.getByText("SECRET-INTERNAL-NOTE")).toBeVisible();

  await conversation
    .getByRole("button", { name: "Resolve", exact: true })
    .click();
  await expect(
    conversation.getByRole("button", { name: "Reopen" }),
  ).toBeVisible();
  await staff.close();

  // 3) The customer sees the reply and the resolved state, but never the internal note
  await page.reload();
  await expect(
    page.getByText("we are checking your invoice access"),
  ).toBeVisible();
  await expect(page.getByText("SECRET-INTERNAL-NOTE")).toHaveCount(0);
  await expect(page.getByText("Marked as resolved.")).toBeVisible();
  await expect(page.getByText("Sending a reply will reopen it.")).toBeVisible();

  // The customer API never returns the note either
  const api = await page.request.get(`/api/tickets/${number}`);
  expect(JSON.stringify(await api.json())).not.toContain(
    "SECRET-INTERNAL-NOTE",
  );

  // 4) Replying reopens the request
  await page
    .getByRole("textbox", { name: "Your reply" })
    .fill("It works now, thank you. One more question though.");
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(
    page.getByText("We have your request and will reply here."),
  ).toBeVisible();
});

test("a customer cannot see another customer's request", async ({ page }) => {
  const { otherTicketNumber } = JSON.parse(
    readFileSync(`${AUTH_DIR}/data.json`, "utf8"),
  );

  await page.goto("/portal?view=all");
  await expect(page.getByText("Other customer's private request")).toHaveCount(
    0,
  );

  await page.goto(`/portal/tickets/${otherTicketNumber}`);
  await expect(page.getByText("Request not found")).toBeVisible();

  const res = await page.request.get(`/api/tickets/${otherTicketNumber}`);
  expect(res.status()).toBe(404);
});

test("a customer cannot change a ticket's status", async ({ page }) => {
  const res = await page.request.patch("/api/tickets/1001", {
    data: { status: "resolved" },
  });
  expect(res.status()).toBe(403);
});
