import "server-only";
import { Types } from "mongoose";
import type { Filter } from "@/lib/api";
import type { TicketPriority } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { recentDayStarts, startOfNextDay, weekdayShort } from "@/lib/tz";
import { Ticket } from "@/models/Ticket";
import { requirePageUser } from "../session";
import { APP_TZ } from "@/lib/tz"; // add APP_TZ to your existing tz import
import { Activity } from "@/models/Activity";

const ACTIVE: Filter = { $in: ["open", "in_progress"] };

// ---------- cards ----------

async function resolvedTickets(range: Filter) {
  return (
    await Activity.distinct("ticket", {
      type: "status",
      to: "resolved",
      createdAt: range,
    })
  ).length;
}

export async function getStats(userId: string) {
  await requirePageUser("admin", "agent");
  await connectDB();

  const days = recentDayStarts(14);
  const prevWeekStart = days[0];
  const weekStart = days[7];
  const yesterdayStart = days[12];
  const todayStart = days[13];
  const tomorrowStart = startOfNextDay(todayStart);

  const [
    open,
    inProgress,
    unassigned,
    mine,
    newToday,
    resolvedToday,
    resolvedYesterday,
    response,
  ] = await Promise.all([
    Ticket.countDocuments({ status: "open" }),
    Ticket.countDocuments({ status: "in_progress" }),
    Ticket.countDocuments({ status: ACTIVE, assignee: null }),
    Ticket.countDocuments({
      status: ACTIVE,
      assignee: new Types.ObjectId(userId),
    }),
    Ticket.countDocuments({ createdAt: { $gte: todayStart } }),
    resolvedTickets({ $gte: todayStart }),
    resolvedTickets({ $gte: yesterdayStart, $lt: todayStart }),
    Ticket.aggregate<{ _id: "current" | "previous"; avgMs: number }>([
      {
        $match: {
          createdAt: { $gte: prevWeekStart, $lt: tomorrowStart },
          firstResponseAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $gte: ["$createdAt", weekStart] }, "current", "previous"],
          },
          avgMs: { $avg: { $subtract: ["$firstResponseAt", "$createdAt"] } },
        },
      },
    ]),
  ]);

  const avg = (key: "current" | "previous") =>
    response.find((r) => r._id === key)?.avgMs ?? null;

  return {
    open,
    inProgress,
    unassigned,
    mine,
    newToday,
    resolvedToday,
    resolvedYesterday,
    response: { currentMs: avg("current"), previousMs: avg("previous") },
  };
}

// ---------- 7-day chart ----------

export async function getWeekActivity() {
  await requirePageUser("admin", "agent");
  await connectDB();

  const starts = recentDayStarts(7);
  const end = startOfNextDay(starts[6]);
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: APP_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  const [created, resolved] = await Promise.all([
    // New tickets per day, by the team's calendar day
    Ticket.aggregate<{ _id: Date | "other"; n: number }>([
      { $match: { createdAt: { $gte: starts[0], $lt: end } } },
      {
        $bucket: {
          groupBy: "$createdAt",
          boundaries: [...starts, end],
          default: "other",
          output: { n: { $sum: 1 } },
        },
      },
    ]),
    // Resolutions per day from history: one per ticket per day, even if the ticket was reopened later
    Activity.aggregate<{ _id: string; n: number }>([
      {
        $match: {
          type: "status",
          to: "resolved",
          createdAt: { $gte: starts[0], $lt: end },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: APP_TZ,
              },
            },
            ticket: "$ticket",
          },
        },
      },
      { $group: { _id: "$_id.day", n: { $sum: 1 } } },
    ]),
  ]);

  const createdByDay = new Map(
    created
      .filter((r) => r._id instanceof Date)
      .map((r) => [(r._id as Date).getTime(), r.n]),
  );
  const resolvedByDay = new Map(resolved.map((r) => [r._id, r.n]));

  return starts.map((s, i) => ({
    key: s.toISOString(),
    label: i === 6 ? "Today" : weekdayShort(s),
    created: createdByDay.get(s.getTime()) ?? 0,
    resolved: resolvedByDay.get(dayKey(s)) ?? 0,
  }));
}

// ---------- needs attention ----------

type AttentionLean = {
  _id: Types.ObjectId;
  number: number;
  subject: string;
  priority: TicketPriority;
  createdAt: Date;
  requester: { name: string } | null;
  assignee: { name: string } | null;
};

export async function getNeedsAttention(limit = 6) {
  await requirePageUser("admin", "agent");
  await connectDB();

  const query = (extra: Filter) =>
    Ticket.find({ status: ACTIVE, ...extra })
      .sort({ createdAt: 1 })
      .limit(limit)
      .select("number subject priority createdAt requester assignee")
      .populate("requester", "name")
      .populate("assignee", "name")
      .lean();

  // Two targeted queries, so a pile of old low-priority tickets can't hide a newer urgent one
  const [urgent, unassigned] = await Promise.all([
    query({ priority: "urgent" }),
    query({ assignee: null }),
  ]);

  const merged = new Map<string, AttentionLean>();
  for (const t of [...urgent, ...unassigned] as unknown as AttentionLean[])
    merged.set(String(t._id), t);

  return [...merged.values()]
    .map((t) => ({
      t,
      score: (t.priority === "urgent" ? 2 : 0) + (t.assignee ? 0 : 1),
    }))
    .sort((a, b) => b.score - a.score || +a.t.createdAt - +b.t.createdAt) // worst first, then oldest
    .slice(0, limit)
    .map(({ t }) => ({
      id: String(t._id),
      number: t.number,
      subject: t.subject,
      priority: t.priority,
      requesterName: t.requester?.name ?? "Deleted user",
      unassigned: !t.assignee,
      createdAt: t.createdAt.toISOString(),
    }));
}
