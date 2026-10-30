"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Loader2, Lock, Send } from "lucide-react";
import {
  AttachButton,
  AttachmentChips,
} from "@/components/ui/attachment-picker";
import { Button } from "@/components/ui/button";
import { useAddMessage } from "@/hooks/use-tickets";
import { useAttachments } from "@/hooks/use-attachments";
import { cn } from "@/lib/utils";

export function Composer({ number }: { number: number }) {
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const add = useAddMessage(number);
  const files = useAttachments();
  const note = mode === "note";
  const canSend =
    (text.trim().length > 0 || files.ids.length > 0) &&
    !files.busy &&
    !add.isPending;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  function submit() {
    if (!canSend) return;
    add.mutate(
      { body: text.trim(), isInternal: note, attachments: files.ids },
      {
        onSuccess: () => {
          setText("");
          files.reset();
          ref.current?.focus();
        },
      },
    );
  }

  return (
    <div className="shrink-0 border-t border-line bg-surface p-3 sm:p-4">
      <div
        className={cn(
          "rounded-xl border transition-colors focus-within:ring-2",
          note
            ? "border-warn/40 bg-warn-soft focus-within:ring-warn/25"
            : "border-line-strong bg-surface focus-within:border-brand focus-within:ring-brand/25",
        )}
      >
        <div
          role="group"
          aria-label="Message type"
          className="flex gap-1 px-2 pt-2"
        >
          {(
            [
              ["reply", "Reply to customer"],
              ["note", "Internal note"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                mode === value
                  ? value === "note"
                    ? "bg-warn/15 text-warn-ink"
                    : "bg-brand-soft text-brand-ink"
                  : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
              )}
            >
              {value === "note" && <Lock className="size-3" />}
              {label}
            </button>
          ))}
        </div>

        <AttachmentChips controller={files} />

        <textarea
          ref={ref}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          aria-label={note ? "Internal note" : "Reply"}
          placeholder={
            note ? "Write a note only your team can see…" : "Write a reply…"
          }
          className="block w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />

        <div className="flex items-center justify-between gap-3 px-2 pb-2">
          <div className="flex items-center gap-1">
            <AttachButton controller={files} />
            <p className="hidden text-xs text-fg-subtle sm:block">
              {note ? "Not visible to the customer." : "Sent to the customer."}
            </p>
          </div>
          <Button size="sm" onClick={submit} disabled={!canSend}>
            {add.isPending || files.busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            {note ? "Add note" : "Send reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
