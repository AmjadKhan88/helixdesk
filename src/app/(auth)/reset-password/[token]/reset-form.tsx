"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordAction } from "@/lib/actions/password";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [error, formAction, pending] = useActionState(
    resetPasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          Choose a password
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          For <span className="font-medium text-fg">{email}</span>.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-fg">
          New password
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
        Save password and sign in
      </Button>
    </form>
  );
}
