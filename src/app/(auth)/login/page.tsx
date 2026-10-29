import { Suspense } from "react";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

async function LoginFormLoader({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; notice?: string }>;
}) {
  const { callbackUrl, notice } = await searchParams;
  return (
    <>
      {notice === "deactivated" && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-warn-soft px-3 py-2 text-[13px] font-medium text-warn-ink"
        >
          Your account is no longer active. Ask an admin if you think this is a
          mistake.
        </p>
      )}
      <LoginForm callbackUrl={callbackUrl} />
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-black/5">
          <h1 className="text-lg font-semibold tracking-tight text-fg">
            Sign in
          </h1>
          <p className="mb-5 mt-1 text-sm text-fg-muted">
            Use the email your team invited you with.
          </p>
          <Suspense
            fallback={
              <div className="space-y-4" aria-hidden>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            }
          >
            <LoginFormLoader searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
