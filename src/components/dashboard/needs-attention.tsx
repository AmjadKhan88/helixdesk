import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { getNeedsAttention } from "@/lib/queries/dashboard";
import { timeAgoLong } from "@/lib/time";

export async function NeedsAttention() {
  const items = await getNeedsAttention();

  return (
    <section className="flex flex-col rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-4 sm:px-5">
        <h2 className="text-[15px] font-semibold text-fg">Needs attention</h2>
        <p className="mt-0.5 text-[13px] text-fg-muted">
          Urgent or unassigned, worst and oldest first.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-10">
          <EmptyState
            icon={CircleCheck}
            title="All caught up"
            body="Nothing is urgent or waiting for an owner."
          />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tickets/${t.number}?view=${t.priority === "urgent" ? "urgent" : "unassigned"}`}
                className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60 sm:px-5"
              >
                <Avatar name={t.requesterName} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {t.subject}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-fg-muted">
                    {t.requesterName}{" "}
                    <span className="text-fg-subtle">
                      opened {timeAgoLong(t.createdAt)}
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.priority === "urgent" && (
                      <PriorityBadge priority="urgent" />
                    )}
                    {t.unassigned && (
                      <span className="inline-flex h-5 items-center rounded-md border border-dashed border-line-strong px-1.5 text-xs text-fg-muted">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-4 border-t border-line px-4 py-3 text-[13px] sm:px-5">
        <Link
          href="/tickets?view=urgent"
          className="font-medium text-brand-ink hover:underline"
        >
          All urgent
        </Link>
        <Link
          href="/tickets?view=unassigned"
          className="font-medium text-brand-ink hover:underline"
        >
          All unassigned
        </Link>
      </div>
    </section>
  );
}
