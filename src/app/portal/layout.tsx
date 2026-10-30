import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { NewRequestButton, PortalNav } from "@/components/portal/portal-nav";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Toaster } from "@/components/ui/toaster";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link href="/portal" aria-label="HelixDesk home">
            <Wordmark />
          </Link>
          <PortalNav />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <NewRequestButton />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
