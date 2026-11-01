"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import type { FormState } from "@/lib/form-state";
import { homeFor } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { clientIp } from "@/lib/ip";
import { hashToken } from "@/lib/invite";
import { emailPasswordLink } from "@/lib/notifications";
import { issueResetToken, resetUrl } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { User } from "@/models/User";

const emailSchema = z.string().trim().toLowerCase().email();
const nameSchema = z.string().trim().min(2).max(100);

// Identical wording whether or not an account exists, so nobody can probe which emails are registered
const SENT: FormState = {
  status: "sent",
  message:
    "If that address can receive email, a link is on its way. It can take a minute to arrive.",
};
const TOO_MANY: FormState = {
  status: "error",
  message: "Too many requests. Please try again in an hour.",
};

async function throttled(name: string, email: string) {
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`${name}-ip`, await clientIp(), 10, 3600),
    rateLimit(`${name}-email`, email, 3, 3600),
  ]);
  return !byIp.ok || !byEmail.ok;
}

export async function requestResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success)
    return { status: "error", message: "Enter a valid email address." };
  if (await throttled("reset", email.data)) return TOO_MANY;

  await connectDB();
  const user = await User.findOne({ email: email.data, isActive: true }).select(
    "name email",
  );
  if (user) {
    emailPasswordLink({
      to: user.email,
      name: user.name,
      url: resetUrl(await issueResetToken(user._id, 1)),
      kind: "reset",
      hours: 1,
    });
  }
  return SENT;
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (process.env.ALLOW_SIGNUP === "false") {
    return {
      status: "error",
      message: "Sign-up is turned off. Ask a team member for an invite.",
    };
  }
  const name = nameSchema.safeParse(formData.get("name"));
  const email = emailSchema.safeParse(formData.get("email"));
  if (!name.success) return { status: "error", message: "Enter your name." };
  if (!email.success)
    return { status: "error", message: "Enter a valid email address." };
  if (await throttled("signup", email.data)) return TOO_MANY;

  await connectDB();
  // Creates a password-less customer at most. It cannot be used until the email owner sets a password
  // from the emailed link, and an existing account keeps its role and name.
  const user = await User.findOneAndUpdate(
    { email: email.data },
    { $setOnInsert: { name: name.data, role: "customer", isActive: true } },
    { upsert: true, returnDocument: "after" },
  ).select("name email isActive");

  if (user?.isActive) {
    emailPasswordLink({
      to: user.email,
      name: user.name,
      url: resetUrl(await issueResetToken(user._id, 24)),
      kind: "signup",
      hours: 24,
    });
  }
  return SENT;
}

export async function resetPasswordAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 72) return "Use 72 characters or fewer."; // bcrypt ignores everything past 72 bytes
  if (password !== confirm) return "The two passwords do not match.";
  if (!(await rateLimit("reset-submit", await clientIp(), 20, 3600)).ok)
    return "Too many attempts. Please try again later.";

  await connectDB();
  const user = await User.findOne({
    resetTokenHash: hashToken(token),
    resetExpiresAt: { $gt: new Date() },
    isActive: true,
  });
  if (!user) return "This link is invalid or has expired. Request a new one.";

  user.password = password; // hashed by the model's pre-save hook
  user.resetTokenHash = undefined; // one use only
  user.resetExpiresAt = undefined;
  user.inviteTokenHash = undefined; // choosing a password also completes any pending invite
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
