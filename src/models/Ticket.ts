import mongoose, { Schema, Types, type Model } from "mongoose";
import {
  TICKET_PRIORITIES, TICKET_STATUSES,
  type TicketPriority, type TicketStatus,
} from "@/lib/constants";
import { Counter } from "./Counter";

export interface ITicket {
  number: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester: Types.ObjectId;
  assignee?: Types.ObjectId | null;
  category?: Types.ObjectId | null;
  messageCount: number;
  lastMessageAt: Date;
  lastMessagePreview?: string;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    number: { type: Number, unique: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: TICKET_STATUSES, default: "open" },
    priority: { type: String, enum: TICKET_PRIORITIES, default: "low" },
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, maxlength: 160 },
    firstResponseAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Auto-increment ticket number (first ticket = 1001)
ticketSchema.pre("validate", async function () {
  if (!this.isNew || this.number) return;
  const counter = await Counter.findOneAndUpdate(
    { _id: "ticket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.number = 1000 + counter.seq;
});

// Keep resolvedAt in sync with status
ticketSchema.pre("save", function () {
  if (this.isNew || !this.isModified("status")) return;
  this.resolvedAt = this.status === "resolved" ? new Date() : undefined;
});

ticketSchema.virtual("code").get(function () {
  return `TCK-${this.number}`;
});

ticketSchema.set("toJSON", { virtuals: true });
ticketSchema.set("toObject", { virtuals: true });

// Query patterns: list filters, "Mine" tab, sorting by activity
ticketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });
ticketSchema.index({ assignee: 1, status: 1 });
ticketSchema.index({ requester: 1, createdAt: -1 });
ticketSchema.index({ subject: "text" });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ resolvedAt: -1 }, { sparse: true });

export const Ticket =
  (mongoose.models.Ticket as Model<ITicket>) ||
  mongoose.model<ITicket>("Ticket", ticketSchema);