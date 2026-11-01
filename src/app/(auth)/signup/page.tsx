import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  const open = process.env.ALLOW_SIGNUP !== "false";
  return (
    <AuthShell>
      <h1 className="text-lg font-semibold tracking-tight text-fg">
        Create an account
      </h1>
      {open ? (
        <>
          <p className="mb-5 mt-1 text-sm text-fg-muted">
            Follow your support requests and reply to us in one place. We email
            you a link to confirm your address and choose a password.
          </p>
          <SignupForm />
        </>
      ) : (
        <p className="mb-2 mt-1 text-sm text-fg-muted">
          Sign-up is turned off. Ask a team member to invite you.
        </p>
      )}
      <p className="mt-5 text-center text-[13px] text-fg-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-ink hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
