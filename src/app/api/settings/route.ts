import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { getSettings } from "@/lib/queries/settings";
import { updateSettings } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { settingsSchema } from "@/lib/validations/admin";

export const GET = route(async () => {
  await requireRole("admin");
  return NextResponse.json(await getSettings());
});

export const PUT = route(async (req: NextRequest) => {
  await requireRole("admin");
  const { firstResponseTargetMinutes } = await readJson(req, settingsSchema);
  await updateSettings(firstResponseTargetMinutes);
  return NextResponse.json({ firstResponseTargetMinutes });
});
