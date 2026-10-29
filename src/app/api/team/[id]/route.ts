import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { updateMember } from "@/lib/services/admin";
import { requireRole } from "@/lib/session";
import { memberPatchSchema } from "@/lib/validations/admin";
import { objectId } from "@/lib/validations/ticket";

export const PATCH = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole("admin");
    const result = await updateMember(
      actor.id,
      objectId.parse((await params).id),
      await readJson(req, memberPatchSchema),
    );
    return NextResponse.json(result);
  },
);
