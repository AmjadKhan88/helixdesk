import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading tickets"
      className="divide-y divide-line"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading ticket"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="space-y-3 border-b border-line p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-2/3" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-5 p-5">
        <Skeleton className="h-20 w-4/5" />
        <Skeleton className="ml-auto h-16 w-3/5" />
      </div>
    </div>
  );
}

export function TicketsSkeleton() {
  return (
    <div className="grid h-[calc(100dvh-6.5rem)] gap-4 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <ListSkeleton />
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface lg:block">
        <DetailSkeleton />
      </div>
    </div>
  );
}
