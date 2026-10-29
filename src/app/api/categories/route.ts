import { NextResponse } from "next/server";
import { route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Category } from "@/models/Category";

export const GET = route(async () => {
  await requireRole();
  await connectDB();
  const items = await Category.find().sort({ name: 1 }).select("name slug description").lean();
  return NextResponse.json({
    items: items.map((c) => ({ id: String(c._id), name: c.name, slug: c.slug, description: c.description ?? null })),
  });
});