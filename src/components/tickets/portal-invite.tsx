"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InviteLinkPanel } from "@/components/admin/invite-link-panel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiFetch, errorMessage } from "@/lib/api-client";

export function PortalInvite({
  contact,
}: {
  contact: { id: string; name: string; portal: "invited" | "none" };
}) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ name: string; url: string } | null>(null);

  async function create() {
    setBusy(true);
    try {
      const { inviteUrl } = await apiFetch<{ inviteUrl: string }>(
        `/api/contacts/${contact.id}/invite`,
        { method: "POST" },
      );
      setLink({ name: contact.name, url: inviteUrl });
      qc.invalidateQueries({ queryKey: ["tickets"] }); // flips the button to "New portal link"
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={create}
        disabled={busy}
        className="inline-flex h-6 items-center gap-1.5 rounded-md border border-line-strong px-2 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <KeyRound className="size-3" />
        )}
        {contact.portal === "invited" ? "New portal link" : "Invite to portal"}
      </button>

      <Dialog open={!!link} onOpenChange={(o) => !o && setLink(null)}>
        <DialogContent title="Portal invite ready" className="max-w-md">
          {link && (
            <InviteLinkPanel
              info={link}
              onClose={() => setLink(null)}
              description={
                <>
                  Send this link to{" "}
                  <span className="font-medium text-fg">{link.name}</span>. They
                  choose a password and can then follow their requests in the
                  portal. It works once and expires in 7 days.
                </>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
