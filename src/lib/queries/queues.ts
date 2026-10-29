import { connectDB } from "@/lib/db";
import { Ticket } from "@/models/Ticket";

export type QueueCounts = {
  inbox: number;
  mine: number;
  unassigned: number;
  urgent: number;
  mix: { urgent: number; high: number; low: number };
};

export async function getQueueCounts(userId: string): Promise<QueueCounts> {
  await connectDB();
  const active = { status: { $in: ["open", "in_progress"] } };

  const [inbox, mine, unassigned, urgent, groups] = await Promise.all([
    Ticket.countDocuments(active),
    Ticket.countDocuments({ ...active, assignee: userId }),
    Ticket.countDocuments({ ...active, assignee: null }),
    Ticket.countDocuments({ ...active, priority: "urgent" }),
    Ticket.aggregate<{ _id: string; n: number }>([
      { $match: active },
      { $group: { _id: "$priority", n: { $sum: 1 } } },
    ]),
  ]);

  const n = (p: string) => groups.find((g) => g._id === p)?.n ?? 0;
  return { inbox, mine, unassigned, urgent, mix: { urgent: n("urgent"), high: n("high"), low: n("low") } };
}