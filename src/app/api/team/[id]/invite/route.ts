import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/lib/api";
import { emailTeamInvite } from "@/lib/notifications";
import { enforceLimit } from "@/lib/rate-limit";
import { reissueInvite } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";

export const POST = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireRole("admin");
    await enforceLimit(
      "invite",
      admin.id,
      20,
      3600,
      "You have sent many invites. Try again later.",
    );

    const { token, email, name, role } = await reissueInvite(
      objectId.parse((await params).id),
    );
    const url = `${process.env.APP_URL ?? req.nextUrl.origin}/invite/${token}`;
    emailTeamInvite({ to: email, name, role, url });
    return NextResponse.json({ inviteUrl: url });
  },
);
