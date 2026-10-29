import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { createCategory } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { categorySchema } from "@/lib/validations/admin";
import { Category } from "@/models/Category";

export const GET = route(async () => {
  await requireRole();
  await connectDB();
  const items = await Category.find()
    .sort({ name: 1 })
    .select("name slug description")
    .lean();
  return NextResponse.json({
    items: items.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
    })),
  });
});

export const POST = route(async (req: NextRequest) => {
  await requireRole("admin");
  const id = await createCategory(await readJson(req, categorySchema));
  return NextResponse.json({ id }, { status: 201 });
});
