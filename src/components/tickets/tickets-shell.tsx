"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

const pane =
  "min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-surface";

export function TicketsShell({
  list,
  children,
}: {
  list: React.ReactNode;
  children: React.ReactNode;
}) {
  const selected = useSelectedLayoutSegment();
  return (
    <div className="grid h-[calc(100dvh-6.5rem)] gap-4 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
      <section
        aria-label="Tickets"
        className={cn(pane, selected ? "hidden lg:flex" : "flex")}
      >
        {list}
      </section>
      <section
        aria-label="Conversation"
        className={cn(pane, selected ? "flex" : "hidden lg:flex")}
      >
        {children}
      </section>
    </div>
  );
}
