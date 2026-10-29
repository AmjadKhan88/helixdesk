import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { requirePageUser } from "@/lib/session";

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requirePageUser("admin"); // checks the live role in the DB, not the cookie
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div aria-busy className="space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="!mt-8 h-72 w-full rounded-xl" />
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
