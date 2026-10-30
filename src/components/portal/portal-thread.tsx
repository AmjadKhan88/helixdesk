import { formatDateTime, timeAgoLong } from "@/lib/time";
import { cn } from "@/lib/utils";
import { AttachmentList } from "@/components/ui/attachment-list";

export type ThreadMessage = {
  id: string;
  body: string;
  createdAt: string; // ISO
  attachments: { name: string; url: string; size: number; mimeType: string }[];
  author: { id: string; name: string; role: string };
};

export function PortalThread({
  messages,
  meId,
}: {
  messages: ThreadMessage[];
  meId: string;
}) {
  return (
    <ol aria-label="Conversation" className="space-y-5">
      {messages.map((m) => {
        const mine = m.author.id === meId;
        const team = m.author.role !== "customer";
        return (
          <li key={m.id} className={cn("flex", mine && "justify-end")}>
            <article className="max-w-[92%] sm:max-w-[85%]">
              <header
                className={cn(
                  "mb-1.5 flex flex-wrap items-baseline gap-x-2",
                  mine && "justify-end",
                )}
              >
                <span className="text-sm font-medium text-fg">
                  {mine ? "You" : m.author.name}
                </span>
                {team && (
                  <span className="rounded bg-brand-soft px-1.5 text-xs font-medium text-brand-ink">
                    Support team
                  </span>
                )}
                <time
                  dateTime={m.createdAt}
                  title={formatDateTime(m.createdAt)}
                  className="text-xs text-fg-subtle"
                >
                  {timeAgoLong(m.createdAt)}
                </time>
              </header>
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed text-fg",
                  mine
                    ? "rounded-tr-sm border border-line bg-surface"
                    : "rounded-tl-sm bg-brand-soft/70",
                )}
              >
                {m.body && (
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                )}
                <AttachmentList items={m.attachments} />
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
