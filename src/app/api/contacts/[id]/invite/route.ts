import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/lib/api";
import { emailPortalInvite } from "@/lib/notifications";
import { enforceLimit } from "@/lib/rate-limit";
import { inviteContact } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";

export const POST = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("admin", "agent");
    await enforceLimit(
      "invite",
      user.id,
      30,
      3600,
      "You have sent many invites. Try again later.",
    );

    const { token, email, name } = await inviteContact(
      objectId.parse((await params).id),
    );
    const url = `${process.env.APP_URL ?? req.nextUrl.origin}/invite/${token}`;
    emailPortalInvite({ to: email, name, url });
    return NextResponse.json({ inviteUrl: url });
  },
);
