import { NextResponse, type NextRequest } from "next/server";
import { parseTicketRef, readJson, route } from "@/lib/api";
import { addMessage } from "@/lib/services/tickets";
import { requireRole } from "@/lib/session";
import { createMessageSchema } from "@/lib/validations/ticket";

type Ctx = { params: Promise<{ number: string }> };

export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole();
  const number = parseTicketRef((await params).number);
  const message = await addMessage(user, number, await readJson(req, createMessageSchema));
  return NextResponse.json({ message }, { status: 201 });
});