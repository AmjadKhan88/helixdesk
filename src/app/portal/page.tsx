import Link from "next/link";
import { Inbox } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listTickets } from "@/lib/queries/tickets";
import { requirePageUser } from "@/lib/session";
import { timeAgoLong, toIso } from "@/lib/time";
import { cn } from "@/lib/utils";
import { listQuerySchema } from "@/lib/validations/ticket";

export const metadata = { title: "Your requests" };

const TABS = [
  { value: "inbox", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
] as const;

const EMPTY = {
  inbox: {
    title: "No active requests",
    body: "When you send a request, you can follow it here.",
  },
  resolved: {
    title: "Nothing resolved yet",
    body: "Resolved requests will be listed here.",
  },
  all: {
    title: "No requests yet",
    body: "Send your first request and we will reply here.",
  },
};

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const user = await requirePageUser("customer");
  const sp = await searchParams;
  const view = sp.view === "resolved" || sp.view === "all" ? sp.view : "inbox";
  const page = Math.max(1, Number(sp.page) || 1);

  const data = await listTickets(
    user,
    listQuerySchema.parse({ view, page, limit: 10 }),
  );
  const href = (v: string, p = 1) =>
    `/portal?${new URLSearchParams({ ...(v !== "inbox" && { view: v }), ...(p > 1 && { page: String(p) }) })}`.replace(
      /\?$/,
      "",
    );

  return (
    <>
      <PageHeader
        title="Your requests"
        description={`Signed in as ${user.email}`}
      />

      <nav aria-label="Filter requests" className="mb-5 flex gap-1">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={href(t.value)}
            aria-current={t.value === view ? "page" : undefined}
            className={cn(
              "h-8 rounded-lg px-3.5 text-[13px] font-medium leading-8 transition-colors",
              t.value === view
                ? "bg-brand-soft text-brand-ink"
                : "text-fg-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface py-6">
          <EmptyState
            icon={Inbox}
            title={EMPTY[view].title}
            body={EMPTY[view].body}
            action={
              <Link href="/portal/new" className={buttonStyles()}>
                New request
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {data.items.map((t) => {
            const replies = Math.max(0, t.messageCount - 1);
            return (
              <li key={t.id}>
                <Link
                  href={`/portal/tickets/${t.number}`}
                  className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2/40 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[15px] font-medium leading-snug text-fg">
                      {t.subject}
                    </h2>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.preview && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">
                      {t.preview}
                    </p>
                  )}
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-fg-subtle">
                    <span className="tabular-nums">{t.code}</span>
                    <span>Updated {timeAgoLong(toIso(t.lastMessageAt))}</span>
                    {replies > 0 && (
                      <span>
                        {replies} {replies === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {data.totalPages > 1 && (
        <nav
          aria-label="Pages"
          className="mt-6 flex items-center justify-between text-[13px]"
        >
          {page > 1 ? (
            <Link
              href={href(view, page - 1)}
              className="font-medium text-brand-ink hover:underline"
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="tabular-nums text-fg-subtle">
            Page {page} of {data.totalPages}
          </span>
          {page < data.totalPages ? (
            <Link
              href={href(view, page + 1)}
              className="font-medium text-brand-ink hover:underline"
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
