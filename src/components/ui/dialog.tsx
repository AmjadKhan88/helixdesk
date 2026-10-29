"use client";

import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;

export function DialogContent({
  title,
  description,
  className,
  children,
  ...props
}: React.ComponentProps<typeof D.Content> & {
  title: string;
  description?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-40 animate-[fade-in_0.15s_ease-out] bg-black/50" />
      <D.Content
        aria-describedby={description ? undefined : undefined}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
          "animate-[pop-in_0.15s_ease-out] rounded-2xl border border-line bg-surface p-5 shadow-2xl sm:p-6",
          className,
        )}
        {...props}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <D.Title className="text-lg font-semibold tracking-tight text-fg">
              {title}
            </D.Title>
            {description ? (
              <D.Description className="mt-1 text-sm text-fg-muted">
                {description}
              </D.Description>
            ) : null}
          </div>
          <D.Close
            aria-label="Close"
            className="-mr-1.5 -mt-1 grid size-8 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
