import { mkdirSync, writeFileSync } from "node:fs";
import { AUTH_DIR, TEST_DB, USERS } from "./constants";

export default async function globalSetup() {
  // Safety net: only ever wipe a database that is clearly meant for tests
  if (!/e2e/i.test(new URL(TEST_DB).pathname)) {
    throw new Error(
      `Refusing to reset "${TEST_DB}". The test database name must contain "e2e".`,
    );
  }
  process.env.MONGODB_URI = TEST_DB; // must be set before the app's db module is imported

  const mongoose = (await import("mongoose")).default;
  const { connectDB } = await import("@/lib/db");
  const { Activity } = await import("@/models/Activity");
  const { Category } = await import("@/models/Category");
  const { Counter } = await import("@/models/Counter");
  const { Message } = await import("@/models/Message");
  const { RateLimit } = await import("@/models/RateLimit");
  const { Settings } = await import("@/models/Settings");
  const { Ticket } = await import("@/models/Ticket");
  const { Upload } = await import("@/models/Upload");
  const { User } = await import("@/models/User");

  await connectDB();
  // deleteMany keeps indexes, unlike dropping the database
  await Promise.all(
    [
      Activity,
      Category,
      Counter,
      Message,
      RateLimit,
      Settings,
      Ticket,
      Upload,
      User,
    ].map((m) => m.deleteMany({})),
  );

  await User.create(Object.values(USERS).map((u) => ({ ...u }))); // passwords are hashed by the model
  await Category.create([{ name: "Billing" }, { name: "Bug" }]);

  // Another customer's ticket, to prove customers cannot see each other's requests
  const other = await User.findOne({ email: USERS.other.email });
  const ticket = await Ticket.create({
    subject: "Other customer's private request",
    requester: other!._id,
    messageCount: 1,
    lastMessageAt: new Date(),
    lastMessagePreview: "Private details",
  });
  await Message.create({
    ticket: ticket._id,
    author: other!._id,
    body: "Private details only this customer should see.",
  });

  mkdirSync(AUTH_DIR, { recursive: true });
  writeFileSync(
    `${AUTH_DIR}/data.json`,
    JSON.stringify({ otherTicketNumber: ticket.number }),
  );

  await mongoose.disconnect();
}
