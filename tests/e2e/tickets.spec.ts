import { expect, test } from "@playwright/test";
import { USERS, authFile } from "./constants";

test.use({ storageState: authFile("agent") });

test("create a ticket, reply, add an internal note, and resolve it", async ({
  page,
}) => {
  const subject = `E2E export fails ${Date.now()}`;

  // Create
  await page.goto("/tickets");
  await page.getByRole("link", { name: "New ticket" }).click();
  const dialog = page.getByRole("dialog", { name: "New ticket" });
  await dialog.getByLabel("Customer email").fill(USERS.customer.email);
  await dialog.getByLabel("Subject").fill(subject);
  await dialog
    .getByLabel("Description")
    .fill("The CSV export is empty after the last release.");
  await dialog.getByLabel("Priority").selectOption("high");
  await dialog.getByRole("button", { name: "Create ticket" }).click();

  await expect(page).toHaveURL(/\/tickets\/\d+/);
  const conversation = page.getByRole("region", { name: "Conversation" });
  await expect(
    conversation.getByRole("heading", { level: 2, name: subject }),
  ).toBeVisible();
  await expect(conversation.getByText("opened this ticket")).toBeVisible();

  // Reply: moves the ticket to In progress and assigns it to the replier
  await conversation
    .getByRole("textbox", { name: "Reply", exact: true })
    .fill("Thanks, we are looking into the export now.");
  await conversation.getByRole("button", { name: "Send reply" }).click();
  await expect(
    conversation.getByText("Thanks, we are looking into the export now."),
  ).toBeVisible();
  await expect(
    conversation.getByRole("button", { name: /^Status: In progress/ }),
  ).toBeVisible();
  await expect(
    conversation.getByRole("button", { name: /^Assignee: Leo Agent/ }),
  ).toBeVisible();
  await expect(
    conversation.getByText("assigned this ticket to themselves"),
  ).toBeVisible();

  // Internal note
  await conversation.getByRole("button", { name: "Internal note" }).click();
  await conversation
    .getByRole("textbox", { name: "Internal note" })
    .fill("Reproduced locally, rows are dropped after page two.");
  await conversation.getByRole("button", { name: "Add note" }).click();
  await expect(
    conversation.getByText(
      "Reproduced locally, rows are dropped after page two.",
    ),
  ).toBeVisible();

  // Resolve
  await conversation
    .getByRole("button", { name: "Resolve", exact: true })
    .click();
  await expect(
    conversation.getByRole("button", { name: /^Status: Resolved/ }),
  ).toBeVisible();
  await expect(
    conversation.getByRole("button", { name: "Reopen" }),
  ).toBeVisible();
  await expect(
    conversation.getByText("marked this ticket as resolved"),
  ).toBeVisible();

  // The change of priority is recorded as history too
  await conversation.getByRole("button", { name: /^Priority: High/ }).click();
  await page.getByRole("menuitem", { name: "Urgent" }).click();
  await expect(
    conversation.getByText("changed priority from High to Urgent"),
  ).toBeVisible();
});
