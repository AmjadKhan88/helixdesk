import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { inviteMember } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { inviteSchema } from "@/lib/validations/admin";

export const POST = route(async (req: NextRequest) => {
  await requireRole("admin");
  const { id, token } = await inviteMember(await readJson(req, inviteSchema));
  const origin = process.env.APP_URL ?? req.nextUrl.origin;
  return NextResponse.json(
    { id, inviteUrl: `${origin}/invite/${token}` },
    { status: 201 },
  );
});
