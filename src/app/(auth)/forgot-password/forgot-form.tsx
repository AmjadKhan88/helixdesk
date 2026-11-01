"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestResetAction } from "@/lib/actions/password";
import type { FormState } from "@/lib/form-state";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestResetAction, {
    status: "idle",
  } as FormState);

  return (
    <form action={formAction} className="space-y-4">
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

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg px-3 py-2 text-[13px] font-medium ${state.status === "error" ? "bg-danger-soft text-danger-ink" : "bg-ok-soft text-ok-ink"}`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="h-10 w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
