import { FileText } from "lucide-react";
import { formatBytes } from "@/lib/time";

export type AttachmentView = {
  name: string;
  url: string;
  size: number;
  mimeType?: string;
};

export function AttachmentList({ items }: { items: AttachmentView[] }) {
  if (!items.length) return null;
  const images = items.filter((a) => a.mimeType?.startsWith("image/"));
  const files = items.filter((a) => !a.mimeType?.startsWith("image/"));

  return (
    <div className="mt-2.5 space-y-2">
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((a) => (
            <li key={a.url}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${a.name} (${formatBytes(a.size)})`}
                className="group block size-28 overflow-hidden rounded-lg border border-line bg-surface-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((a) => (
            <li key={a.url}>
              <a
                href={a.url}
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate font-medium">{a.name}</span>
                <span className="shrink-0 tabular-nums text-fg-subtle">
                  {formatBytes(a.size)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
