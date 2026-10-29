import { NextResponse, type NextRequest } from "next/server";
import { ApiError, parseTicketRef, readJson, route } from "@/lib/api";
import { getTicketDetail } from "@/lib/queries/tickets";
import { updateTicket } from "@/lib/services/tickets";
import { requireRole } from "@/lib/session";
import { updateTicketSchema } from "@/lib/validations/ticket";

type Ctx = { params: Promise<{ number: string }> };

export const GET = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireRole();
  const detail = await getTicketDetail(user, parseTicketRef((await params).number));
  if (!detail) throw new ApiError(404, "Ticket not found");
  return NextResponse.json(detail);
});

export const PATCH = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole("admin", "agent");
  const number = parseTicketRef((await params).number);
  await updateTicket(number, await readJson(req, updateTicketSchema));
  const detail = await getTicketDetail(user, number);
  return NextResponse.json({ ticket: detail?.ticket });
});