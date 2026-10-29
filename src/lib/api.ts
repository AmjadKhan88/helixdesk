import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type z } from "zod";

// Loosely typed on purpose: Mongoose filter types differ between versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Filter = Record<string, any>;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wraps a route handler so every error becomes a clean JSON response. */
export function route<C = unknown>(handler: (req: NextRequest, ctx: C) => Promise<Response>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
          { status: 400 }
        );
      }
      const e = err as { code?: number; name?: string };
      if (e?.code === 11000) return NextResponse.json({ error: "Already exists" }, { status: 409 });
      if (e?.name === "CastError") return NextResponse.json({ error: "Invalid id" }, { status: 400 });

      console.error("[api]", err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError(415, "Content-Type must be application/json");
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
  return schema.parse(raw);
}

/** "1001" or "TCK-1001" → 1001 */
export function parseTicketRef(ref: string) {
  const m = /^(?:tck-)?(\d{1,9})$/i.exec(ref);
  if (!m) throw new ApiError(404, "Ticket not found");
  return Number(m[1]);
}