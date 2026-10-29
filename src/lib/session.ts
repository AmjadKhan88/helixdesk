import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import { homeFor, type Role } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** The signed-in user from the DB, or null if signed out, deleted, or deactivated. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDB();
  const u = await User.findById(session.user.id)
    .select("name email role isActive")
    .lean();
  if (!u || !u.isActive) return null;
  return { id: String(u._id), name: u.name, email: u.email, role: u.role };
});

/** For API routes: throws 401/403. No roles = any signed-in user. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Unauthorized");
  if (roles.length && !roles.includes(user.role))
    throw new ApiError(403, "Forbidden");
  return user;
}

/** For server components: redirects instead of throwing. */
export async function requirePageUser(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/account-disabled"); // clears the cookie, then goes to /login
  if (roles.length && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
