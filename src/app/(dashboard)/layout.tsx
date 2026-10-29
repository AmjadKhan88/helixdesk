import { Suspense } from "react";
import { ShellProvider } from "@/components/shell/shell-context";
import {
  SidebarLoader,
  SidebarSkeleton,
} from "@/components/shell/sidebar-loader";
import { Topbar } from "@/components/shell/topbar";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/query-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ShellProvider>
        <div className="flex min-h-dvh">
          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarLoader />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </ShellProvider>
      <Toaster />
    </QueryProvider>
  );
}
