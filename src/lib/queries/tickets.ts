import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import type { Filter } from "@/lib/api";
import type { Role } from "@/lib/constants";
import { escapeRegex } from "@/lib/utils";
import type { ListQuery } from "@/lib/validations/ticket";
import { Category } from "@/models/Category";
import { Message, type IMessage } from "@/models/Message";
import { Ticket, type ITicket } from "@/models/Ticket";
import { User } from "@/models/User";

export type Viewer = { id: string; role: Role };

type PersonRef = { _id: Types.ObjectId; name: string; email?: string };
type CategoryRef = { _id: Types.ObjectId; name: string; slug: string };
type TicketLean = Omit<ITicket, "requester" | "assignee" | "category"> & {
  _id: Types.ObjectId;
  requester: PersonRef | null;
  assignee: PersonRef | null;
  category: CategoryRef | null;
};
type MessageLean = Omit<IMessage, "author"> & {
  _id: Types.ObjectId;
  author: { _id: Types.ObjectId; name: string; role: Role } | null;
};

const ACTIVE = { $in: ["open", "in_progress"] };

export const populateTicket = [
  { path: "requester", select: "name email" },
  { path: "assignee", select: "name email" },
  { path: "category", select: "name slug" },
];

// ---------- serializers (the shape the UI receives) ----------

function person(p: PersonRef | null, withEmail: boolean) {
  if (!p) return null;
  return { id: String(p._id), name: p.name, email: withEmail ? (p.email ?? null) : null };
}

export function serializeTicket(t: TicketLean, viewerIsStaff: boolean) {
  return {
    id: String(t._id),
    number: t.number,
    code: `TCK-${t.number}`,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    preview: t.lastMessagePreview ?? "",
    messageCount: t.messageCount,
    lastMessageAt: t.lastMessageAt,
    createdAt: t.createdAt,
    firstResponseAt: t.firstResponseAt ?? null,
    resolvedAt: t.resolvedAt ?? null,
    requester: person(t.requester, true) ?? { id: "", name: "Deleted user", email: null },
    assignee: person(t.assignee, viewerIsStaff), // customers don't see agent emails
    category: t.category ? { id: String(t.category._id), name: t.category.name, slug: t.category.slug } : null,
  };
}

export function serializeMessage(m: MessageLean) {
  return {
    id: String(m._id),
    body: m.body,
    isInternal: m.isInternal,
    attachments: m.attachments,
    createdAt: m.createdAt,
    author: m.author
      ? { id: String(m.author._id), name: m.author.name, role: m.author.role }
      : { id: "", name: "Deleted user", role: "customer" as Role },
  };
}

// ---------- list ----------

export async function listTickets(viewer: Viewer, query: ListQuery) {
  await connectDB();
  const staff = viewer.role !== "customer";
  const me = new Types.ObjectId(viewer.id);
  const filter: Filter = {};

  if (!staff) {
    filter.requester = me; // customers: only their own tickets, views don't apply
  } else {
    switch (query.view) {
      case "inbox": filter.status = ACTIVE; break;
      case "mine": filter.status = ACTIVE; filter.assignee = me; break;
      case "unassigned": filter.status = ACTIVE; filter.assignee = null; break;
      case "urgent": filter.status = ACTIVE; filter.priority = "urgent"; break;
      case "resolved": filter.status = "resolved"; break;
      case "all": break;
    }
  }

  // Explicit filters win over the view's defaults
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  if (query.category) {
    const cat = await Category.findOne({ slug: query.category }).select("_id").lean();
    if (!cat) return emptyPage(query);
    filter.category = cat._id;
  }

  if (query.q) {
    const re = new RegExp(escapeRegex(query.q), "i");
    const or: Filter[] = [{ subject: re }];
    const num = /^(?:tck-?)?(\d{3,})$/i.exec(query.q);
    if (num) or.push({ number: Number(num[1]) });
    const people = await User.find({ $or: [{ name: re }, { email: re }] }).select("_id").limit(50).lean();
    if (people.length) or.push({ requester: { $in: people.map((p) => p._id) } });
    filter.$or = or;
  }

  const sort =
    query.sort === "newest" ? { createdAt: -1 as const }
    : query.sort === "oldest" ? { createdAt: 1 as const }
    : { lastMessageAt: -1 as const, _id: -1 as const };

  const [docs, total] = await Promise.all([
    Ticket.find(filter)
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate(populateTicket)
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  return {
    items: (docs as unknown as TicketLean[]).map((t) => serializeTicket(t, staff)),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

function emptyPage(query: ListQuery) {
  return { items: [], page: query.page, limit: query.limit, total: 0, totalPages: 1 };
}

// ---------- detail ----------

export async function getTicketDetail(viewer: Viewer, number: number) {
  await connectDB();
  const staff = viewer.role !== "customer";
  const filter: Filter = { number };
  if (!staff) filter.requester = new Types.ObjectId(viewer.id); // not yours = 404, existence isn't leaked

  const ticket = (await Ticket.findOne(filter).populate(populateTicket).lean()) as unknown as TicketLean | null;
  if (!ticket) return null;

  const messages = (await Message.find({ ticket: ticket._id, ...(staff ? {} : { isInternal: false }) })
    .sort({ createdAt: 1 })
    .limit(500)
    .populate("author", "name role")
    .lean()) as unknown as MessageLean[];

  return { ticket: serializeTicket(ticket, staff), messages: messages.map(serializeMessage) };
}

export async function getMessage(id: Types.ObjectId) {
  const m = (await Message.findById(id).populate("author", "name role").lean()) as unknown as MessageLean | null;
  return m ? serializeMessage(m) : null;
}