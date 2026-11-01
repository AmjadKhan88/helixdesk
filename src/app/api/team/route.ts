import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { emailTeamInvite } from "@/lib/notifications";
import { enforceLimit } from "@/lib/rate-limit";
import { inviteMember } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { inviteSchema } from "@/lib/validations/admin";

export const POST = route(async (req: NextRequest) => {
  const admin = await requireRole("admin");
  await enforceLimit(
    "invite",
    admin.id,
    20,
    3600,
    "You have sent many invites. Try again later.",
  );

  const input = await readJson(req, inviteSchema);
  const { id, token } = await inviteMember(input);
  const url = `${process.env.APP_URL ?? req.nextUrl.origin}/invite/${token}`;
  emailTeamInvite({ to: input.email, name: input.name, role: input.role, url });
  return NextResponse.json({ id, inviteUrl: url }, { status: 201 });
});
