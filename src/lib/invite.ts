import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const INVITE_DAYS = 7;

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** The raw token goes in the link. Only its hash is stored. */
export function createInvite() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    hash: hashToken(token),
    expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
  };
}

export async function findInvite(token: string) {
  await connection();
  await connectDB();
  return User.findOne({
    inviteTokenHash: hashToken(token),
    inviteExpiresAt: { $gt: new Date() },
    isActive: true,
  })
    .select("name email role")
    .lean();
}
