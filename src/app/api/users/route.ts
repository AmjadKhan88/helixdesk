
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { route, type Filter } from "@/lib/api";
import { ROLES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { escapeRegex } from "@/lib/utils";
import { User } from "@/models/User";

// 1. allow role=staff
const querySchema = z.object({
  role: z.enum([...ROLES, "staff"] as const).optional(),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = route(async (req: NextRequest) => {
  const me = await requireRole("admin", "agent");           // ← keep the user
  const { role, q, limit } = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  await connectDB();

  const filter: Filter = { isActive: true };
  if (role === "staff") filter.role = { $in: ["admin", "agent"] };   // ← new
  else if (role) filter.role = role;
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: re }, { email: re }];
  }

  const users = await User.find(filter).sort({ name: 1 }).limit(limit).select("name email role").lean();
  return NextResponse.json({
    items: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role })),
    meId: me.id,                                                      // ← new
  });
});