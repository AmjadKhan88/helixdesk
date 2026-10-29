export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-fg">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-fg-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ComingSoon({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="text-sm font-medium text-fg">{children}</p>
      <p className="mt-1 text-sm text-fg-subtle">
        This page is built in step {step}.
      </p>
    </div>
  );
}
