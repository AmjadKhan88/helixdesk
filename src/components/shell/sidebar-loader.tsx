import { getQueueCounts } from "@/lib/queries/queues";
import { requirePageUser } from "@/lib/session";
import { Sidebar } from "./sidebar";

export async function SidebarLoader() {
  const user = await requirePageUser();
  const counts = await getQueueCounts(user.id);
  return (
    <Sidebar
      user={{ name: user.name, email: user.email, role: user.role }}
      counts={counts}
    />
  );
}

export function SidebarSkeleton() {
  return (
    <aside
      className="hidden h-dvh w-64 shrink-0 border-r border-line bg-canvas p-4 lg:block"
      aria-hidden
    >
      <div className="h-8 w-36 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-5 h-16 animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-2" />
        ))}
      </div>
    </aside>
  );
}
