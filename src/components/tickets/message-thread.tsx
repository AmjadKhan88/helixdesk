"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Lock } from "lucide-react";
import { AttachmentList } from "@/components/ui/attachment-list";
import { Avatar } from "@/components/ui/avatar";
import { describeActivity } from "@/lib/activity";
import { formatDateTime, timeAgoLong } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { ActivityItem, MessageItem } from "@/types";

type Entry =
  | { kind: "message"; at: string; message: MessageItem }
  | { kind: "activity"; at: string; activity: ActivityItem };

export function MessageThread({
  messages,
  activity = [],
}: {
  messages: MessageItem[];
  activity?: ActivityItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  // One chronological stream: what was said, and what changed
  const entries = useMemo<Entry[]>(
    () =>
      [
        ...messages.map(
          (message): Entry => ({
            kind: "message",
            at: message.createdAt,
            message,
          }),
        ),
        ...activity.map(
          (a): Entry => ({ kind: "activity", at: a.createdAt, activity: a }),
        ),
      ].sort((x, y) => +new Date(x.at) - +new Date(y.at)),
    [messages, activity],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <div
      ref={ref}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-canvas/50 px-4 py-5 sm:px-5"
    >
      {entries.map((e) =>
        e.kind === "activity" ? (
          <ActivityRow key={`a-${e.activity.id}`} a={e.activity} />
        ) : e.message.isInternal ? (
          <InternalNote key={e.message.id} m={e.message} />
        ) : (
          <Message key={e.message.id} m={e.message} />
        ),
      )}
    </div>
  );
}

function Time({ iso }: { iso: string }) {
  return (
    <time
      dateTime={iso}
      title={formatDateTime(iso)}
      className="text-xs text-fg-subtle"
    >
      {timeAgoLong(iso)}
    </time>
  );
}

function ActivityRow({ a }: { a: ActivityItem }) {
  return (
    <div className="flex items-center gap-2.5 py-0.5 pl-1.5 text-[13px] text-fg-muted">
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-line-strong"
      />
      <p className="min-w-0">
        <span className="font-medium text-fg">
          {a.actor?.name ?? "Someone"}
        </span>{" "}
        {describeActivity(a)}
      </p>
      <span className="shrink-0">
        <Time iso={a.createdAt} />
      </span>
    </div>
  );
}

function Message({ m }: { m: MessageItem }) {
  const team = m.author.role !== "customer";
  return (
    <article className="flex gap-3">
      <Avatar name={m.author.name} />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-fg">{m.author.name}</span>
          {team && (
            <span className="rounded bg-brand-soft px-1.5 text-xs font-medium text-brand-ink">
              Team
            </span>
          )}
          <Time iso={m.createdAt} />
        </header>
        <div
          className={cn(
            "mt-1.5 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed text-fg",
            team ? "bg-brand-soft/70" : "border border-line bg-surface",
          )}
        >
          {m.body && (
            <p className="whitespace-pre-wrap break-words">{m.body}</p>
          )}
          <AttachmentList items={m.attachments} />
        </div>
      </div>
    </article>
  );
}

function InternalNote({ m }: { m: MessageItem }) {
  return (
    <article className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3">
      <header className="flex flex-wrap items-center gap-x-2 text-warn-ink">
        <Lock className="size-3.5" />
        <span className="text-xs font-semibold">Internal note</span>
        <span className="text-xs">{m.author.name}</span>
        <Time iso={m.createdAt} />
      </header>
      {m.body && (
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
          {m.body}
        </p>
      )}
      <AttachmentList items={m.attachments} />
    </article>
  );
}
