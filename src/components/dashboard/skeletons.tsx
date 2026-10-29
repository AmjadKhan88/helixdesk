import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-line bg-surface p-4 sm:p-5"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-3 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ height = "h-72" }: { height?: string }) {
  return (
    <div
      aria-busy
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-4 w-52" />
      <Skeleton className={`mt-6 w-full ${height}`} />
    </div>
  );
}
