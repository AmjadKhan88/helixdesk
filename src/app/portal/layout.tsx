import { Wordmark } from "@/components/brand/logo";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Wordmark />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
