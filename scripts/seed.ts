import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Category } from "@/models/Category";
import { Ticket } from "@/models/Ticket";
import { Message } from "@/models/Message";
import { Counter } from "@/models/Counter";

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}),
    Ticket.deleteMany({}), Message.deleteMany({}), Counter.deleteMany({}),
  ]);

  const [amara, jonas] = await User.create([
    { name: "Amara Reed", email: "amara@helixdesk.dev", password: "admin1234", role: "admin" },
    { name: "Jonas Meyer", email: "jonas@acme.io", password: "customer1234", role: "customer" },
  ]);

  const [billing] = await Category.create(
    ["Billing", "Bug", "Account", "API"].map((name) => ({ name }))
  );

  const ticket = await Ticket.create({
    subject: "Cannot access billing portal",
    priority: "urgent",
    requester: jonas._id,
    assignee: amara._id,
    category: billing._id,
  });

  const t0 = new Date();
  const [m1] = await Message.create([
    { ticket: ticket._id, author: jonas._id, createdAt: t0,
      body: 'Hi team — I\'m getting a 403 error every time I click "Manage plan" in settings.',
      attachments: [{ name: "error-403.png", url: "/uploads/error-403.png", size: 248000, mimeType: "image/png" }] },
    { ticket: ticket._id, author: amara._id, createdAt: new Date(+t0 + 9 * 60_000),
      body: "Thanks Jonas — I can reproduce this. Clearing the permissions cache now." },
    { ticket: ticket._id, author: amara._id, isInternal: true, createdAt: new Date(+t0 + 10 * 60_000),
      body: "Checked Redis — perm cache key was stale. Flushing." },
  ]);

  await Ticket.updateOne({ _id: ticket._id }, {
    messageCount: 3,
    lastMessageAt: new Date(+t0 + 10 * 60_000),
    lastMessagePreview: m1.body.slice(0, 120),
    firstResponseAt: new Date(+t0 + 9 * 60_000),
  });

  const saved = await Ticket.findById(ticket._id).populate("requester assignee category");
  console.log("Seeded:", saved?.toJSON());
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });