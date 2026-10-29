"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[13px] font-medium text-fg">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
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
          minLength={6}
          autoComplete="current-password"
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
        Sign in
      </Button>
    </form>
  );
}
