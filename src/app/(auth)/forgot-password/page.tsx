import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <h1 className="text-lg font-semibold tracking-tight text-fg">
        Reset your password
      </h1>
      <p className="mb-5 mt-1 text-sm text-fg-muted">
        Enter your email and we will send you a link to choose a new one.
      </p>
      <ForgotForm />
      <p className="mt-5 text-center text-[13px]">
        <Link
          href="/login"
          className="font-medium text-brand-ink hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
