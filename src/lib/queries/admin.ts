import "server-only";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requirePageUser } from "@/lib/session";
import { Category } from "@/models/Category";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";

const ACTIVE = { $in: ["open", "in_progress"] };

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  total: number;
  active: number;
};
export type MemberState = "active" | "invited" | "expired" | "deactivated";
export type Member = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  isActive: boolean;
  state: MemberState;
  assigned: number;
};

export async function listCategoriesWithCounts(): Promise<CategoryRow[]> {
  await requirePageUser("admin");
  await connectDB();

  const [cats, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Ticket.aggregate<{ _id: Types.ObjectId; total: number; active: number }>([
      { $match: { category: { $ne: null } } },
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ["$status", ["open", "in_progress"]] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const byId = new Map(counts.map((c) => [String(c._id), c]));
  return cats.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    total: byId.get(String(c._id))?.total ?? 0,
    active: byId.get(String(c._id))?.active ?? 0,
  }));
}

export async function listTeam(): Promise<Member[]> {
  await requirePageUser("admin");
  await connectDB();
  const now = Date.now();

  const [users, loads] = await Promise.all([
    User.find({ role: { $in: ["admin", "agent"] } })
      .sort({ isActive: -1, name: 1 })
      .select("name email role isActive inviteExpiresAt")
      .lean(),
    Ticket.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { assignee: { $ne: null }, status: ACTIVE } },
      { $group: { _id: "$assignee", n: { $sum: 1 } } },
    ]),
  ]);

  const load = new Map(loads.map((l) => [String(l._id), l.n]));
  return users.map(
    (u): Member => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role as "admin" | "agent",
      isActive: u.isActive,
      state: !u.isActive
        ? "deactivated"
        : u.inviteExpiresAt
          ? +u.inviteExpiresAt > now
            ? "invited"
            : "expired"
          : "active",
      assigned: load.get(String(u._id)) ?? 0,
    }),
  );
}
