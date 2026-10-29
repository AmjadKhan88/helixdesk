import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { findInvite } from "@/lib/invite";
import { InviteForm } from "./invite-form";

export const metadata = { title: "Join HelixDesk" };

async function InviteLoader({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findInvite(token);

  if (!invite) {
    return (
      <>
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          This invite is no longer valid
        </h1>
        <p className="mb-5 mt-1 text-sm text-fg-muted">
          The link may have expired or already been used. Ask an admin to send
          you a new one.
        </p>
        <Link href="/login" className={buttonStyles({ variant: "secondary" })}>
          Go to sign in
        </Link>
      </>
    );
  }
  return <InviteForm token={token} name={invite.name} email={invite.email} />;
}

export default function InvitePage({
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
        <InviteLoader params={params} />
      </Suspense>
    </AuthShell>
  );
}
