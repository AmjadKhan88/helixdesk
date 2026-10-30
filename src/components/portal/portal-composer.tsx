"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch, errorMessage } from "@/lib/api-client";

export function PortalComposer({
  number,
  resolved,
}: {
  number: number;
  resolved: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const busy = sending || refreshing;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text]);

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setSending(true);
    try {
      await apiFetch(`/api/tickets/${number}/messages`, {
        method: "POST",
        body: { body, isInternal: false },
      });
      setText("");
      startTransition(() => router.refresh()); // stays "busy" until the new message is on screen
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8">
      {resolved && (
        <p className="mb-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] text-fg-muted">
          This request is resolved. Sending a reply will reopen it.
        </p>
      )}
      <div className="rounded-xl border border-line-strong bg-surface transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
        <textarea
          ref={ref}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          aria-label="Your reply"
          placeholder="Write a reply…"
          className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <p className="text-xs text-fg-subtle">Ctrl or ⌘ + Enter to send</p>
          <Button size="sm" onClick={send} disabled={!text.trim() || busy}>
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Send reply
          </Button>
        </div>
      </div>
    </div>
  );
}
