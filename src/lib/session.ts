import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/constants";

/** Returns the signed-in user, or throws 401 / 403. No roles = any signed-in user. */
export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Unauthorized");
  if (roles.length && !roles.includes(session.user.role)) throw new ApiError(403, "Forbidden");
  return session.user;
}