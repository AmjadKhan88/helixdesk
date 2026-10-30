"use client";

import { useRef } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttachmentsController } from "@/hooks/use-attachments";
import { formatBytes } from "@/lib/time";
import { ACCEPT } from "@/lib/uploads";
import { cn } from "@/lib/utils";

export function AttachButton({
  controller,
  disabled,
}: {
  controller: AttachmentsController;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={ACCEPT}
        onChange={(e) => {
          controller.add(Array.from(e.target.files ?? []));
          e.target.value = ""; // lets the same file be picked again
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <Paperclip className="size-4" />
        Attach
      </Button>
    </>
  );
}

export function AttachmentChips({
  controller,
}: {
  controller: AttachmentsController;
}) {
  if (!controller.items.length) return null;
  return (
    <ul aria-label="Attachments" className="flex flex-wrap gap-2 px-3 pt-3">
      {controller.items.map((i) => (
        <li
          key={i.key}
          className="relative flex w-52 items-center gap-2 overflow-hidden rounded-lg border border-line bg-surface p-1.5 pr-7 text-xs"
        >
          {i.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={i.previewUrl}
              alt=""
              className="size-9 shrink-0 rounded object-cover"
            />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded bg-surface-2 text-fg-subtle">
              <FileText className="size-4" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-fg">{i.name}</span>
            <span
              className={cn(
                "block truncate",
                i.status === "error" ? "text-danger-ink" : "text-fg-subtle",
              )}
            >
              {i.status === "error"
                ? i.error
                : i.status === "uploading"
                  ? `Uploading ${i.progress}%`
                  : formatBytes(i.size)}
            </span>
          </span>
          {i.status === "uploading" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-surface-2">
              <span
                className="block h-full bg-brand transition-[width]"
                style={{ width: `${i.progress}%` }}
              />
            </span>
          )}
          <button
            type="button"
            onClick={() => controller.remove(i.key)}
            aria-label={`Remove ${i.name}`}
            className="absolute right-1 top-1 grid size-5 place-items-center rounded text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
