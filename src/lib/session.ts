import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/lib/constants";

export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  if (roles.length && !roles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }
  return { user: session.user } as const;
}