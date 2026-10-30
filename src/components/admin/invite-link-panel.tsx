"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteLinkPanel({
  info,
  onClose,
  description,
}: {
  info: { name: string; url: string };
  onClose: () => void;
  description?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the link and copy it manually.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {description ?? (
          <>
            Send this link to{" "}
            <span className="font-medium text-fg">{info.name}</span>. It works
            once and expires in 7 days. Emails are not sent automatically yet.
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={info.url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Invite link"
          className="text-[13px]"
        />
        <Button variant="secondary" onClick={copy} className="shrink-0">
          {copied ? (
            <Check className="size-4 text-ok" />
          ) : (
            <Copy className="size-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
