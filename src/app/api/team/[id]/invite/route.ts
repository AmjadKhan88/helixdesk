import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/lib/api";
import { reissueInvite } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";

export const POST = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireRole("admin");
    const token = await reissueInvite(objectId.parse((await params).id));
    const origin = process.env.APP_URL ?? req.nextUrl.origin;
    return NextResponse.json({ inviteUrl: `${origin}/invite/${token}` });
  },
);
