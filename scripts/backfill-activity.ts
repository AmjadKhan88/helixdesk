import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { Ticket } from "@/models/Ticket";

async function main() {
  await connectDB();
  const tickets = await Ticket.find()
    .select("requester assignee createdAt resolvedAt")
    .lean();
  const hasCreated = new Set(
    (await Activity.distinct("ticket", { type: "created" })).map(String),
  );
  const hasResolved = new Set(
    (await Activity.distinct("ticket", { type: "status", to: "resolved" })).map(
      String,
    ),
  );

  const docs = [];
  for (const t of tickets) {
    if (!hasCreated.has(String(t._id))) {
      docs.push({
        ticket: t._id,
        actor: t.requester,
        type: "created",
        createdAt: t.createdAt,
      });
    }
    if (t.resolvedAt && !hasResolved.has(String(t._id))) {
      docs.push({
        ticket: t._id,
        actor: t.assignee ?? null,
        type: "status",
        from: "in_progress",
        to: "resolved",
        createdAt: t.resolvedAt,
      });
    }
  }

  if (docs.length) await Activity.insertMany(docs);
  console.log(
    `Added ${docs.length} history event(s) for ${tickets.length} ticket(s).`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
