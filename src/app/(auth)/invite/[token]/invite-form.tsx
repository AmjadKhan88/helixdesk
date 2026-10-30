"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptInviteAction } from "@/lib/actions/invite";

export function InviteForm({
  token,
  name,
  email,
  role,
}: {
  token: string;
  name: string;
  email: string;
  role: string;
}) {
  const [error, formAction, pending] = useActionState(
    acceptInviteAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          Welcome, {name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Choose a password for{" "}
          <span className="font-medium text-fg">{email}</span>{" "}
          {role === "customer"
            ? "to follow your support requests."
            : "to join the team."}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-fg">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
        <p className="text-xs text-fg-subtle">At least 8 characters.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-[13px] font-medium text-fg">
          Confirm password
        </label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger-ink"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create account and sign in
      </Button>
    </form>
  );
}
