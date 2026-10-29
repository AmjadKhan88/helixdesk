import { NextResponse, type NextRequest } from "next/server";
import { readJson, route } from "@/lib/api";
import { getTicketDetail, listTickets } from "@/lib/queries/tickets";
import { createTicket } from "@/lib/services/tickets";
import { requireRole } from "@/lib/session";
import { createTicketSchema, listQuerySchema } from "@/lib/validations/ticket";

export const GET = route(async (req: NextRequest) => {
  const user = await requireRole();
  const query = listQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  return NextResponse.json(await listTickets(user, query));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireRole();
  const input = await readJson(req, createTicketSchema);
  const number = await createTicket(user, input);
  return NextResponse.json(await getTicketDetail(user, number), { status: 201 });
});