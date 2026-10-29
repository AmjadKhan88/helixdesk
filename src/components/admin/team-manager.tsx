"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { Member, MemberState } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";

const STATE_BADGE: Record<
  MemberState,
  { label: string; className: string } | null
> = {
  active: null,
  invited: { label: "Invited", className: "bg-warn-soft text-warn-ink" },
  expired: {
    label: "Invite expired",
    className: "bg-danger-soft text-danger-ink",
  },
  deactivated: {
    label: "Deactivated",
    className: "bg-surface-2 text-fg-muted",
  },
};

type LinkInfo = { name: string; url: string };

export function TeamManager({
  members,
  meId,
}: {
  members: Member[];
  meId: string;
}) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [link, setLink] = useState<LinkInfo | null>(null);
  const [confirm, setConfirm] = useState<Member | null>(null);

  async function patch(
    m: Member,
    body: { role?: "admin" | "agent"; isActive?: boolean },
    message: string,
  ) {
    try {
      const res = await apiFetch<{ unassigned: number }>(`/api/team/${m.id}`, {
        method: "PATCH",
        body,
      });
      toast.success(
        res.unassigned
          ? `${message}. ${res.unassigned} active ${res.unassigned === 1 ? "ticket was" : "tickets were"} unassigned.`
          : message,
      );
      setConfirm(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  }

  async function resend(m: Member) {
    try {
      const { inviteUrl } = await apiFetch<{ inviteUrl: string }>(
        `/api/team/${m.id}/invite`,
        { method: "POST" },
      );
      setLink({ name: m.name, url: inviteUrl });
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Admins manage the workspace. Agents handle tickets."
        actions={
          <Button onClick={() => setInviting(true)}>
            <Plus className="size-4" />
            Invite member
          </Button>
        }
      />

      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {members.map((m) => {
          const badge = STATE_BADGE[m.state];
          const isMe = m.id === meId;
          return (
            <li
              key={m.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 sm:px-5",
                m.state === "deactivated" && "opacity-70",
              )}
            >
              <Avatar name={m.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {m.name}
                  {isMe && (
                    <span className="ml-2 rounded bg-surface-2 px-1.5 text-xs font-normal text-fg-muted">
                      You
                    </span>
                  )}
                </p>
                <p className="truncate text-[13px] text-fg-muted">{m.email}</p>
              </div>

              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                {badge && (
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium",
                    m.role === "admin"
                      ? "bg-brand-soft text-brand-ink"
                      : "bg-surface-2 text-fg-muted",
                  )}
                >
                  {m.role === "admin" ? "Admin" : "Agent"}
                </span>
                <span className="w-24 text-right text-[13px] tabular-nums text-fg-subtle">
                  {m.assigned} assigned
                </span>
              </div>

              <DropdownMenu>
                <DropdownTrigger
                  aria-label={`Actions for ${m.name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg data-[state=open]:bg-surface-2"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownTrigger>
                <DropdownContent align="end">
                  {m.isActive && (
                    <DropdownItem
                      onSelect={() =>
                        patch(
                          m,
                          { role: m.role === "admin" ? "agent" : "admin" },
                          `${m.name} is now ${m.role === "admin" ? "an agent" : "an admin"}`,
                        )
                      }
                    >
                      {m.role === "admin" ? "Make agent" : "Make admin"}
                    </DropdownItem>
                  )}
                  {(m.state === "invited" || m.state === "expired") && (
                    <DropdownItem onSelect={() => resend(m)}>
                      Get a new invite link
                    </DropdownItem>
                  )}
                  {m.isActive && !isMe && (
                    <>
                      <DropdownSeparator />
                      <DropdownItem
                        className="text-danger-ink data-[highlighted]:text-danger-ink"
                        onSelect={() => setConfirm(m)}
                      >
                        Deactivate
                      </DropdownItem>
                    </>
                  )}
                  {!m.isActive && (
                    <DropdownItem
                      onSelect={() =>
                        patch(
                          m,
                          { isActive: true },
                          `${m.name} was reactivated`,
                        )
                      }
                    >
                      Reactivate
                    </DropdownItem>
                  )}
                </DropdownContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>

      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent
          title="Invite a team member"
          description="They get a one-time link to choose a password."
          className="max-w-md"
        >
          {inviting && (
            <InviteForm
              onCancel={() => setInviting(false)}
              onCreated={(info) => {
                setInviting(false);
                setLink(info);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!link} onOpenChange={(o) => !o && setLink(null)}>
        <DialogContent title="Invite link ready" className="max-w-md">
          {link && <LinkPanel info={link} onClose={() => setLink(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent title="Deactivate member" className="max-w-md">
          {confirm && (
            <div className="space-y-4">
              <p className="text-sm text-fg-muted">
                <span className="font-medium text-fg">{confirm.name}</span> will
                be signed out and unable to sign in.
                {confirm.assigned > 0 && (
                  <>
                    {" "}
                    Their {confirm.assigned} active{" "}
                    {confirm.assigned === 1 ? "ticket" : "tickets"} will become
                    unassigned.
                  </>
                )}{" "}
                You can reactivate them at any time.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    patch(
                      confirm,
                      { isActive: false },
                      `${confirm.name} was deactivated`,
                    )
                  }
                >
                  Deactivate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InviteForm({
  onCreated,
  onCancel,
}: {
  onCreated: (i: LinkInfo) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const { inviteUrl } = await apiFetch<{ inviteUrl: string }>("/api/team", {
        method: "POST",
        body: { name, email, role },
      });
      onCreated({ name, url: inviteUrl });
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="inv-name" className="text-[13px] font-medium text-fg">
          Full name
        </label>
        <Input
          id="inv-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="inv-email" className="text-[13px] font-medium text-fg">
          Work email
        </label>
        <Input
          id="inv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="inv-role" className="text-[13px] font-medium text-fg">
          Role
        </label>
        <Select
          id="inv-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "agent" | "admin")}
        >
          <option value="agent">Agent: works on tickets</option>
          <option value="admin">
            Admin: also manages team, categories, and settings
          </option>
        </Select>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger-ink"
        >
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Create invite
        </Button>
      </div>
    </form>
  );
}

function LinkPanel({ info, onClose }: { info: LinkInfo; onClose: () => void }) {
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
        Send this link to{" "}
        <span className="font-medium text-fg">{info.name}</span>. It works once
        and expires in 7 days. Emails are not sent automatically yet.
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
