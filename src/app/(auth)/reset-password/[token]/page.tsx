import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { findResetUser } from "@/lib/password-reset";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Choose a password" };

async function ResetLoader({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await findResetUser(token);

  if (!user) {
    return (
      <>
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          This link is no longer valid
        </h1>
        <p className="mb-5 mt-1 text-sm text-fg-muted">
          It may have expired or already been used. Request a new one and try
          again.
        </p>
        <Link
          href="/forgot-password"
          className={buttonStyles({ variant: "secondary" })}
        >
          Request a new link
        </Link>
      </>
    );
  }
  return <ResetForm token={token} email={user.email} />;
}

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        }
      >
        <ResetLoader params={params} />
      </Suspense>
    </AuthShell>
  );
}
