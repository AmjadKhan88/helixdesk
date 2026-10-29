"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";

const PRESETS = [30, 60, 120, 240, 480, 1440];

export function SettingsForm({ initialMinutes }: { initialMinutes: number }) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [pending, setPending] = useState(false);
  const dirty = minutes !== initialMinutes;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await apiFetch("/api/settings", {
        method: "PUT",
        body: { firstResponseTargetMinutes: minutes },
      });
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="max-w-xl rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="text-[15px] font-semibold text-fg">
        First response target
      </h2>
      <p className="mt-1 text-[13px] text-fg-muted">
        How quickly your team aims to send the first reply. The dashboard shows
        whether the 7-day average is within it.
      </p>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Presets"
      >
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={minutes === p}
            onClick={() => setMinutes(p)}
            className={cn(
              "h-8 rounded-lg border px-3 text-[13px] font-medium transition-colors",
              minutes === p
                ? "border-brand bg-brand-soft text-brand-ink"
                : "border-line-strong text-fg-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            {formatDuration(p * 60_000)}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="minutes" className="text-[13px] font-medium text-fg">
            Custom, in minutes
          </label>
          <Input
            id="minutes"
            type="number"
            min={5}
            max={10080}
            value={Number.isNaN(minutes) ? "" : minutes}
            onChange={(e) => setMinutes(e.target.valueAsNumber)}
            className="w-36"
          />
        </div>
        <Button
          type="submit"
          disabled={
            pending || !dirty || !Number.isInteger(minutes) || minutes < 5
          }
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
}
