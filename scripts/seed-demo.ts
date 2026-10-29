import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Message } from "@/models/Message";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";

const HOUR = 3_600_000;
const MIN = 60_000;
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]) => a[rand(a.length)];

const SUBJECTS = [
  "Cannot access billing portal", "Export to CSV is empty", "Add a second admin to the workspace",
  "Webhook retries failing silently", "Password reset email not arriving", "Invoice shows the wrong tax rate",
  "SSO login loops back to the sign-in page", "API returns 429 on low traffic", "Cannot change the workspace name",
  "Dashboard charts will not load", "Need a refund for a duplicate charge", "How do I delete my account?",
];
const CUSTOMERS: [string, string][] = [
  ["Sara Lindqvist", "sara@northwind.co"], ["Omar Haddad", "omar@bluepine.io"], ["Ines Duarte", "ines@lumen.app"],
  ["Kenji Mori", "kenji@harborlabs.jp"], ["Priya Nair", "priya@fieldnote.co"],
];

async function main() {
  await connectDB();
  const staff = await User.find({ role: { $in: ["admin", "agent"] }, isActive: true }).select("_id").lean();
  if (!staff.length) throw new Error("No staff found. Run `npm run seed` first.");
  const categories = await Category.find().select("_id").lean();

  const customers = [];
  for (const [name, email] of CUSTOMERS) {
    const c = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name, role: "customer", isActive: true } },
      { upsert: true, returnDocument: "after" }
    );
    customers.push(c!._id);
  }

  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    const hoursAgo = Math.max(0.2, Math.pow(Math.random(), 0.8) * 14 * 24); // a bit heavier on recent days
    const createdAt = new Date(now - hoursAgo * HOUR);
    const requester = pick(customers);
    const responded = hoursAgo > 2 && Math.random() < 0.85;
    const firstResponseAt = responded ? new Date(Math.min(now, +createdAt + (10 + rand(300)) * MIN)) : undefined;
    const resolved = responded && Math.random() < (hoursAgo > 72 ? 0.85 : 0.4);
    const resolvedAt = resolved ? new Date(Math.min(now, +firstResponseAt! + (1 + rand(30)) * HOUR)) : undefined;
    const r = Math.random();
    const subject = pick(SUBJECTS);
    const body = `Hi, we are having trouble with this: ${subject.toLowerCase()}. Could you take a look?`;

    const ticket = await Ticket.create({
      subject,
      status: resolved ? "resolved" : responded ? "in_progress" : "open",
      priority: r < 0.12 ? "urgent" : r < 0.42 ? "high" : "low",
      requester,
      assignee: responded || Math.random() < 0.3 ? pick(staff)._id : null,
      category: categories.length ? pick(categories)._id : null,
      messageCount: responded ? 2 : 1,
      lastMessageAt: firstResponseAt ?? createdAt,
      lastMessagePreview: body.slice(0, 120),
      firstResponseAt,
      resolvedAt,
      createdAt,
    });

    await Message.create({ ticket: ticket._id, author: requester, body, createdAt });
    if (firstResponseAt) {
      await Message.create({ ticket: ticket._id, author: pick(staff)._id, body: "Thanks for the details. Looking into it now.", createdAt: firstResponseAt });
    }
  }

  console.log("Added 60 demo tickets.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });