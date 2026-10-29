import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid h-full place-items-center px-6 py-12 text-center">
      <div className="max-w-xs">
        <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-surface-2 text-fg-subtle">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium text-fg">{title}</p>
        {body && <p className="mt-1 text-sm text-fg-muted">{body}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
