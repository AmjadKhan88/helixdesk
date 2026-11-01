import "server-only";
import { randomBytes } from "node:crypto";
import { connection } from "next/server";
import type { Types } from "mongoose";
import { appUrl } from "@/lib/app-url";
import { connectDB } from "@/lib/db";
import { hashToken } from "@/lib/invite";
import { User } from "@/models/User";

/** Stores only the hash. The raw token exists only in the emailed link. */
export async function issueResetToken(
  userId: Types.ObjectId | string,
  hours: number,
) {
  await connectDB();
  const token = randomBytes(32).toString("base64url");
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        resetTokenHash: hashToken(token),
        resetExpiresAt: new Date(Date.now() + hours * 3_600_000),
      },
    },
  );
  return token;
}

export const resetUrl = (token: string) =>
  `${appUrl()}/reset-password/${token}`;

export async function findResetUser(token: string) {
  await connection();
  await connectDB();
  return User.findOne({
    resetTokenHash: hashToken(token),
    resetExpiresAt: { $gt: new Date() },
    isActive: true,
  })
    .select("name email")
    .lean();
}
