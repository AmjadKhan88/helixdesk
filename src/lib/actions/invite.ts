"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { homeFor } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { hashToken } from "@/lib/invite";
import { User } from "@/models/User";

export async function acceptInviteAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 72) return "Use 72 characters or fewer.";
  if (password !== confirm) return "The two passwords do not match.";

  await connectDB();
  const user = await User.findOne({
    inviteTokenHash: hashToken(token),
    inviteExpiresAt: { $gt: new Date() },
    isActive: true,
  }).select("+inviteTokenHash +password");
  if (!user) return "This invite link is invalid or has expired.";

  user.password = password;
  user.inviteTokenHash = undefined; // the link works exactly once
  user.inviteExpiresAt = undefined;
  await user.save();

  try {
    await signIn("credentials", {
      email: user.email,
      password,
      redirectTo: homeFor(user.role),
    });
  } catch (error) {
    if (error instanceof AuthError) return "Password saved. Please sign in.";
    throw error; // the success redirect is thrown
  }
}
