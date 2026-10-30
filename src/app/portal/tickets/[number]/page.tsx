import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { PortalComposer } from "@/components/portal/portal-composer";
import { PortalThread } from "@/components/portal/portal-thread";
import { ScrollToEnd } from "@/components/portal/scroll-to-end";
import { StatusBadge } from "@/components/ui/badges";
import { getTicketDetail } from "@/lib/queries/tickets";
import { requirePageUser } from "@/lib/session";
import { formatDateTime, timeAgoLong, toIso } from "@/lib/time";

export const metadata = { title: "Request" };

const STATUS_NOTE = {
  open: "We have your request and will reply here.",
  in_progress: "Our team is working on this.",
  resolved: "Marked as resolved. Reply below if you still need help.",
} as const;

export default async function PortalTicketPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const user = await requirePageUser("customer");
  const { number } = await params;
  if (!/^\d{1,9}$/.test(number)) notFound();

  const detail = await getTicketDetail(user, Number(number)); // customers only ever get their own, without internal notes
  if (!detail) notFound();

  const { ticket: t, messages } = detail;
  const opened = toIso(t.createdAt);

  return (
    <>
      <Link
        href="/portal"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        All requests
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-fg-subtle">
          <span className="tabular-nums">{t.code}</span>
          <StatusBadge status={t.status} />
        </div>
        <h1 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight text-fg">
          {t.subject}
        </h1>
        <p className="mt-1.5 text-[13px] text-fg-muted">
          {STATUS_NOTE[t.status]}
        </p>
        <p className="mt-1 text-[13px] text-fg-subtle">
          Opened{" "}
          <time dateTime={opened} title={formatDateTime(opened)}>
            {timeAgoLong(opened)}
          </time>
          {t.assignee ? `, handled by ${t.assignee.name}` : ""}
        </p>
      </header>

      <PortalThread
        meId={user.id}
        messages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: toIso(m.createdAt),
          attachments: m.attachments,
          author: m.author,
        }))}
      />
      <ScrollToEnd count={messages.length} />
      <PortalComposer number={t.number} resolved={t.status === "resolved"} />
      <AutoRefresh seconds={30} />
    </>
  );
}
