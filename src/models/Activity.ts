import mongoose, { Schema, Types, type Model } from "mongoose";

export const ACTIVITY_TYPES = [
  "created",
  "status",
  "priority",
  "assignee",
  "category",
  "subject",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface IActivity {
  ticket: Types.ObjectId;
  actor: Types.ObjectId | null; // null = unknown (backfilled history)
  type: ActivityType;
  from: string | null;
  to: string | null;
  fromLabel: string | null; // names as they were at the time, so history survives renames and deletes
  toLabel: string | null;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
    fromLabel: { type: String, default: null },
    toLabel: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ ticket: 1, createdAt: 1 }); // the timeline
activitySchema.index({ type: 1, to: 1, createdAt: -1 }); // dashboard: "resolved" events

export const Activity =
  (mongoose.models.Activity as Model<IActivity>) ||
  mongoose.model<IActivity>("Activity", activitySchema);
