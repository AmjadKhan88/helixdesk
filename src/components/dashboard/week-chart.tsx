import { getWeekActivity } from "@/lib/queries/dashboard";
import { cn } from "@/lib/utils";

const niceMax = (n: number) =>
  n <= 4 ? 4 : n <= 10 ? Math.ceil(n / 2) * 2 : Math.ceil(n / 5) * 5;

function Bar({
  n,
  pct,
  className,
}: {
  n: number;
  pct: number;
  className: string;
}) {
  if (n === 0) return <div className="w-3 sm:w-4" />; // keeps the pair aligned
  return (
    <div className="relative flex h-full w-3 items-end sm:w-4">
      <div
        className={cn("min-h-[3px] w-full rounded-t-[3px]", className)}
        style={{ height: `${pct}%` }}
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 text-[11px] font-medium tabular-nums text-fg-muted"
        style={{ bottom: `calc(${pct}% + 3px)` }}
      >
        {n}
      </span>
    </div>
  );
}

export async function WeekChart() {
  const days = await getWeekActivity();
  const max = niceMax(
    Math.max(...days.flatMap((d) => [d.created, d.resolved])),
  );
  const totalCreated = days.reduce((sum, d) => sum + d.created, 0);
  const totalResolved = days.reduce((sum, d) => sum + d.resolved, 0);
  const pct = (n: number) => (n / max) * 100;

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div>
          <h2 className="text-[15px] font-semibold text-fg">Last 7 days</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">
            Tickets created and resolved each day.
          </p>
        </div>
        <ul className="flex gap-4 text-[13px] text-fg-muted">
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-fg-subtle" />
            Created{" "}
            <span className="font-semibold tabular-nums text-fg">
              {totalCreated}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-brand" />
            Resolved{" "}
            <span className="font-semibold tabular-nums text-fg">
              {totalResolved}
            </span>
          </li>
        </ul>
      </div>

      {/* Visual chart. The table below carries the same data for screen readers */}
      <div aria-hidden className="mt-8">
        <div className="relative ml-8 h-44">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[max, max / 2, 0].map((v) => (
              <div key={v} className="relative border-t border-line">
                <span className="absolute -left-8 -top-2 w-6 text-right text-[11px] tabular-nums text-fg-subtle">
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex gap-2 sm:gap-4">
            {days.map((d) => (
              <div
                key={d.key}
                title={`${d.label}: ${d.created} created, ${d.resolved} resolved`}
                className="flex h-full flex-1 items-end justify-center gap-1.5"
              >
                <Bar
                  n={d.created}
                  pct={pct(d.created)}
                  className="bg-fg-subtle"
                />
                <Bar
                  n={d.resolved}
                  pct={pct(d.resolved)}
                  className="bg-brand"
                />
              </div>
            ))}
          </div>

          {totalCreated + totalResolved === 0 && (
            <p className="absolute inset-0 grid place-items-center text-sm text-fg-subtle">
              No ticket activity in the last 7 days.
            </p>
          )}
        </div>

        <div className="ml-8 mt-2 flex gap-2 sm:gap-4">
          {days.map((d) => (
            <span
              key={d.key}
              className={cn(
                "flex-1 text-center text-xs",
                d.label === "Today"
                  ? "font-semibold text-fg"
                  : "text-fg-subtle",
              )}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Tickets created and resolved per day, last 7 days</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Created</th>
            <th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}>
              <td>{d.label}</td>
              <td>{d.created}</td>
              <td>{d.resolved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
