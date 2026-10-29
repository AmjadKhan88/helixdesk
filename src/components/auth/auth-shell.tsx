import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
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
          {children}
        </div>
      </div>
    </main>
  );
}
