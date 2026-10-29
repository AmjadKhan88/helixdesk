import "server-only";
import { Types } from "mongoose";
import { ApiError, type Filter } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getMessage, type Viewer } from "@/lib/queries/tickets";
import type { CreateMessageInput, CreateTicketInput, UpdateTicketInput } from "@/lib/validations/ticket";
import { Category } from "@/models/Category";
import { Message } from "@/models/Message";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";

const previewOf = (body: string) => body.replace(/\s+/g, " ").trim().slice(0, 120);

async function assertCategory(id: string) {
  const cat = await Category.findById(id).select("_id").lean();
  if (!cat) throw new ApiError(400, "Category not found");
  return cat._id;
}

async function assertAssignable(id: string) {
  const user = await User.findOne({ _id: id, isActive: true, role: { $in: ["admin", "agent"] } })
    .select("_id")
    .lean();
  if (!user) throw new ApiError(400, "Assignee must be an active admin or agent");
  return user._id;
}

// Staff filing a ticket for someone: find the contact by email, or create a passwordless customer
async function findOrCreateCustomer(input: { email: string; name?: string }) {
  const email = input.email.toLowerCase();
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name: input.name ?? email.split("@")[0], role: "customer", isActive: true } },
    { upsert: true, returnDocument: "after" }
  ).select("_id isActive");
  if (!user) throw new ApiError(500, "Could not resolve requester");
  if (!user.isActive) throw new ApiError(400, "This contact is deactivated");
  return user._id;
}

export async function createTicket(viewer: Viewer, input: CreateTicketInput) {
  await connectDB();
  const staff = viewer.role !== "customer";

  let requester = new Types.ObjectId(viewer.id);
  if (staff) {
    if (!input.requester) throw new ApiError(400, "requester.email is required when creating a ticket as staff");
    requester = await findOrCreateCustomer(input.requester);
  }

  const category = input.categoryId ? await assertCategory(input.categoryId) : null;
  const assignee = staff && input.assigneeId ? await assertAssignable(input.assigneeId) : null;
  const now = new Date();

  const ticket = await Ticket.create({
    subject: input.subject,
    priority: staff ? input.priority : "low", // customers can't self-prioritise
    requester,
    assignee,
    category,
    messageCount: 1,
    lastMessageAt: now,
    lastMessagePreview: previewOf(input.body),
  });

  try {
    // The opening message belongs to the requester, even when staff logged it for them
    await Message.create({ ticket: ticket._id, author: requester, body: input.body, attachments: input.attachments });
  } catch (err) {
    await Ticket.deleteOne({ _id: ticket._id }); // no orphan ticket without a conversation
    throw err;
  }
  return ticket.number;
}

export async function updateTicket(number: number, patch: UpdateTicketInput) {
  await connectDB();
  const ticket = await Ticket.findOne({ number });
  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (patch.subject !== undefined) ticket.subject = patch.subject;
  if (patch.status !== undefined) ticket.status = patch.status;
  if (patch.priority !== undefined) ticket.priority = patch.priority;
  if (patch.assigneeId !== undefined) ticket.assignee = patch.assigneeId ? await assertAssignable(patch.assigneeId) : null;
  if (patch.categoryId !== undefined) ticket.category = patch.categoryId ? await assertCategory(patch.categoryId) : null;

  await ticket.save(); // save() runs the hook that keeps resolvedAt in sync with status
}

export async function addMessage(viewer: Viewer, number: number, input: CreateMessageInput) {
  await connectDB();
  const staff = viewer.role !== "customer";

  const filter: Filter = { number };
  if (!staff) filter.requester = new Types.ObjectId(viewer.id);
  const ticket = await Ticket.findOne(filter).select("status assignee firstResponseAt");
  if (!ticket) throw new ApiError(404, "Ticket not found");

  const isInternal = staff && input.isInternal; // customers can never write internal notes
  const message = await Message.create({
    ticket: ticket._id,
    author: new Types.ObjectId(viewer.id),
    body: input.body,
    isInternal,
    attachments: input.attachments,
  });

  // Internal notes don't touch the public counters or preview
  if (!isInternal) {
    const set: Filter = { lastMessageAt: message.createdAt, lastMessagePreview: previewOf(input.body) };
    const update: Filter = { $inc: { messageCount: 1 }, $set: set };

    if (!staff && ticket.status === "resolved") {
      set.status = "open"; // a customer reply reopens the ticket
      update.$unset = { resolvedAt: "" };
    }
    if (staff) {
      if (!ticket.firstResponseAt) set.firstResponseAt = message.createdAt;
      if (ticket.status === "open") set.status = "in_progress";
      if (!ticket.assignee) set.assignee = new Types.ObjectId(viewer.id);
    }
    await Ticket.updateOne({ _id: ticket._id }, update);
  }

  return getMessage(message._id);
}