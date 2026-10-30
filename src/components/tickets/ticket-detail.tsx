"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Circle,
  CircleCheck,
  CircleDot,
  RotateCcw,
  SearchX,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/constants";
import { ApiRequestError } from "@/lib/api-client";
import { PRIORITY_META, STATUS_META } from "@/lib/ticket-meta";
import { listQs, parseListParams } from "@/lib/ticket-params";
import { formatDateTime, timeAgoLong } from "@/lib/time";
import { cn } from "@/lib/utils";
import {
  useCategories,
  useStaff,
  useTicket,
  useUpdateTicket,
} from "@/hooks/use-tickets";
import type { TicketItem } from "@/types";
import { Composer } from "./composer";
import { MessageThread } from "./message-thread";
import { PropertyMenu, type MenuOption } from "./property-menu";
import { DetailSkeleton } from "./skeletons";
import { PortalInvite } from "./portal-invite";

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  open: <Circle className="size-4 text-brand" />,
  in_progress: <CircleDot className="size-4 text-brand" />,
  resolved: <CircleCheck className="size-4 text-ok" />,
};

export function TicketDetail({ number }: { number: number }) {
  const backHref = `/tickets${listQs(parseListParams(useSearchParams()))}`;
  const { data, isPending, error, refetch } = useTicket(number);

  if (isPending) return <DetailSkeleton />;

  if (error) {
    const missing = error instanceof ApiRequestError && error.status === 404;
    return (
      <EmptyState
        icon={missing ? SearchX : AlertCircle}
        title={missing ? "Ticket not found" : "Could not load this ticket"}
        body={
          missing
            ? "It may have been removed, or the link is wrong."
            : "Check your connection and try again."
        }
        action={
          missing ? (
            <Link
              href={backHref}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Back to tickets
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          )
        }
      />
    );
  }

  return (
    <TicketView
      key={number}
      ticket={data.ticket}
      messages={data.messages}
      backHref={backHref}
    />
  );
}

function TicketView({
  ticket: t,
  messages,
  backHref,
}: {
  ticket: TicketItem;
  messages: React.ComponentProps<typeof MessageThread>["messages"];
  backHref: string;
}) {
  const update = useUpdateTicket(t.number);
  const staff = useStaff();
  const categories = useCategories();
  const meId = staff.data?.meId;

  const setStatus = (status: TicketStatus) => {
    if (status === t.status) return;
    update.mutate({
      patch: { status },
      optimistic: {
        status,
        resolvedAt: status === "resolved" ? new Date().toISOString() : null,
      },
    });
  };

  const resolve = () => {
    const previous = t.status;
    setStatus("resolved");
    toast.success(`${t.code} resolved`, {
      action: {
        label: "Undo",
        onClick: () =>
          update.mutate({
            patch: { status: previous },
            optimistic: { status: previous, resolvedAt: null },
          }),
      },
    });
  };

  const setPriority = (priority: TicketPriority) => {
    if (priority !== t.priority)
      update.mutate({ patch: { priority }, optimistic: { priority } });
  };

  const setAssignee = (id: string) => {
    if (id === (t.assignee?.id ?? "")) return;
    const s = staff.data?.items.find((x) => x.id === id);
    update.mutate({
      patch: { assigneeId: id || null },
      optimistic: {
        assignee: s ? { id: s.id, name: s.name, email: s.email } : null,
      },
    });
  };

  const setCategory = (id: string) => {
    if (id === (t.category?.id ?? "")) return;
    const c = categories.data?.find((x) => x.id === id);
    update.mutate({
      patch: { categoryId: id || null },
      optimistic: {
        category: c ? { id: c.id, name: c.name, slug: c.slug } : null,
      },
    });
  };

  // ---- picker options ----
  const statusOptions: MenuOption[] = TICKET_STATUSES.map((s) => ({
    value: s,
    label: STATUS_META[s].label,
    leading: STATUS_ICON[s],
  }));
  const priorityOptions: MenuOption[] = TICKET_PRIORITIES.map((p) => ({
    value: p,
    label: PRIORITY_META[p].label,
    leading: (
      <span className={cn("size-2 rounded-full", PRIORITY_META[p].dot)} />
    ),
  }));

  const people = [...(staff.data?.items ?? [])].sort((a, b) =>
    a.id === meId ? -1 : b.id === meId ? 1 : 0,
  );
  const unassigned: MenuOption = {
    value: "",
    label: "Unassigned",
    leading: <UserRound className="size-4 text-fg-subtle" />,
  };
  const assigneeOptions: MenuOption[] = [
    unassigned,
    ...people.map((p) => ({
      value: p.id,
      label: p.id === meId ? `${p.name} (you)` : p.name,
      leading: <Avatar name={p.name} size="sm" />,
    })),
  ];
  const assigneeCurrent =
    assigneeOptions.find((o) => o.value === (t.assignee?.id ?? "")) ??
    (t.assignee
      ? {
          value: t.assignee.id,
          label: t.assignee.name,
          leading: <Avatar name={t.assignee.name} size="sm" />,
        }
      : unassigned);

  const noCategory: MenuOption = { value: "", label: "No category" };
  const categoryOptions: MenuOption[] = [
    noCategory,
    ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];
  const categoryCurrent = t.category
    ? { value: t.category.id, label: t.category.name }
    : noCategory;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-line px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Link
            href={backHref}
            aria-label="Back to tickets"
            className={cn(
              buttonStyles({ variant: "ghost", size: "icon" }),
              "-ml-2 size-8 lg:hidden",
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-sm font-medium tabular-nums text-fg-subtle">
            {t.code}
          </span>
          <div className="ml-auto">
            {t.status === "resolved" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatus("open")}
              >
                <RotateCcw className="size-3.5" />
                Reopen
              </Button>
            ) : (
              <Button size="sm" onClick={resolve}>
                <Check className="size-3.5" />
                Resolve
              </Button>
            )}
          </div>
        </div>

        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-fg">
          {t.subject}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-fg-muted">
          <Avatar name={t.requester.name} size="sm" />
          <span className="font-medium text-fg">{t.requester.name}</span>
          {t.requester.email && (
            <a
              href={`mailto:${t.requester.email}`}
              className="text-fg-subtle hover:text-fg hover:underline"
            >
              {t.requester.email}
            </a>
          )}
          {t.requester.id && t.requester.portal !== "active" && (
            <PortalInvite
              contact={{
                id: t.requester.id,
                name: t.requester.name,
                portal: t.requester.portal,
              }}
            />
          )}
          <time
            dateTime={t.createdAt}
            title={formatDateTime(t.createdAt)}
            className="text-fg-subtle"
          >
            Opened {timeAgoLong(t.createdAt)}
          </time>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <PropertyMenu
            label="Status"
            current={statusOptions.find((o) => o.value === t.status)!}
            options={statusOptions}
            onChange={(v) => setStatus(v as TicketStatus)}
          />
          <PropertyMenu
            label="Priority"
            current={priorityOptions.find((o) => o.value === t.priority)!}
            options={priorityOptions}
            onChange={(v) => setPriority(v as TicketPriority)}
          />
          <PropertyMenu
            label="Assignee"
            current={assigneeCurrent}
            options={assigneeOptions}
            onChange={setAssignee}
          />
          <PropertyMenu
            label="Category"
            current={categoryCurrent}
            options={categoryOptions}
            onChange={setCategory}
          />
        </div>
      </header>

      <MessageThread messages={messages} />
      <Composer number={t.number} />
    </div>
  );
}
