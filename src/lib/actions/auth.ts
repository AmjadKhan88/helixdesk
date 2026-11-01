"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { clientIp } from "@/lib/ip";
import { rateLimit } from "@/lib/rate-limit";

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const [byIp, byEmail] = await Promise.all([
    rateLimit("login-ip", await clientIp(), 30, 900),
    rateLimit("login-email", email || "-", 8, 900),
  ]);
  if (!byIp.ok || !byEmail.ok)
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Invalid email or password."
        : "Something went wrong. Please try again.";
    }
    throw error; // a successful sign-in redirect is thrown, so it must be re-thrown
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
