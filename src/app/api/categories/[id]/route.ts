import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { deleteCategory, updateCategory } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";
import { categorySchema } from "@/lib/validations/admin";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin");
  await updateCategory(
    objectId.parse((await params).id),
    await readJson(req, categorySchema),
  );
  return NextResponse.json({ ok: true });
});

export const DELETE = route(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin");
  const reassignTo = req.nextUrl.searchParams.get("reassignTo") ?? undefined;
  if (reassignTo && reassignTo !== "none") objectId.parse(reassignTo);
  return NextResponse.json(
    await deleteCategory(objectId.parse((await params).id), reassignTo),
  );
});
