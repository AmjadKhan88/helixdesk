import Link from "next/link";
import { MessageSquare, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { TicketItem } from "@/types";

export function TicketRow({
  ticket,
  href,
  active,
}: {
  ticket: TicketItem;
  href: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative block border-b border-line px-4 py-3 transition-colors",
          active ? "bg-surface-2" : "hover:bg-surface-2/60",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] bg-brand"
          />
        )}
        <div className="flex items-start gap-3">
          <Avatar name={ticket.requester.name} className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="truncate text-sm font-medium text-fg">
                {ticket.subject}
              </p>
              <time
                dateTime={ticket.lastMessageAt}
                className="ml-auto shrink-0 text-xs tabular-nums text-fg-subtle"
              >
                {timeAgo(ticket.lastMessageAt)}
              </time>
            </div>
            <p className="mt-0.5 truncate text-[13px]">
              <span className="font-medium text-fg-muted">
                {ticket.requester.name}
              </span>{" "}
              <span className="text-fg-subtle">{ticket.preview}</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              {ticket.priority !== "low" && (
                <PriorityBadge priority={ticket.priority} />
              )}
              {ticket.status !== "open" && (
                <StatusBadge status={ticket.status} />
              )}
              {ticket.category && (
                <span className="inline-flex h-5 items-center rounded-md border border-line px-1.5 text-xs text-fg-muted">
                  {ticket.category.name}
                </span>
              )}
              <span className="ml-auto flex items-center gap-2 text-xs text-fg-subtle">
                {ticket.messageCount > 1 && (
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <MessageSquare className="size-3.5" />
                    {ticket.messageCount}
                    <span className="sr-only">messages</span>
                  </span>
                )}
                {ticket.assignee ? (
                  <span title={`Assigned to ${ticket.assignee.name}`}>
                    <Avatar name={ticket.assignee.name} size="sm" />
                    <span className="sr-only">
                      Assigned to {ticket.assignee.name}
                    </span>
                  </span>
                ) : (
                  <span
                    title="Unassigned"
                    className="grid size-6 place-items-center rounded-full border border-dashed border-line-strong"
                  >
                    <UserRound className="size-3" />
                    <span className="sr-only">Unassigned</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
