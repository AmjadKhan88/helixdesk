import "server-only";
import { Types } from "mongoose";
import { Activity, type ActivityType } from "@/models/Activity";
import { Category } from "@/models/Category";
import { User } from "@/models/User";

export type ActivityInput = {
  ticket: Types.ObjectId;
  actor: string | Types.ObjectId | null;
  type: ActivityType;
  from?: string | null;
  to?: string | null;
  fromLabel?: string | null;
  toLabel?: string | null;
};

/** Recording history must never break the action it describes */
export async function logActivity(events: ActivityInput[]) {
  if (!events.length) return;
  try {
    await Activity.insertMany(
      events.map((e) => ({
        from: null,
        to: null,
        fromLabel: null,
        toLabel: null,
        ...e,
        actor: e.actor ? new Types.ObjectId(String(e.actor)) : null,
      })),
    );
  } catch (err) {
    console.error("[activity] could not record:", err);
  }
}

export async function userName(id: string | Types.ObjectId | null | undefined) {
  if (!id) return null;
  return (await User.findById(id).select("name").lean())?.name ?? null;
}

export async function categoryName(
  id: string | Types.ObjectId | null | undefined,
) {
  if (!id) return null;
  return (await Category.findById(id).select("name").lean())?.name ?? null;
}
