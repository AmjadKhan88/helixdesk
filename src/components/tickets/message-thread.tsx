"use client";

import { useLayoutEffect, useRef } from "react";
import { Lock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime, timeAgoLong } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { MessageItem } from "@/types";
import { AttachmentList } from "../ui/attachment-list";

export function MessageThread({ messages }: { messages: MessageItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // Jump to the newest message when the thread loads or grows
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div
      ref={ref}
      className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-canvas/50 px-4 py-5 sm:px-5"
    >
      {messages.map((m) =>
        m.isInternal ? (
          <InternalNote key={m.id} m={m} />
        ) : (
          <Message key={m.id} m={m} />
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
