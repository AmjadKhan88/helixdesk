import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { auth } from "@/auth";
import { getStats } from "@/lib/queries/dashboard";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { getSettings } from "@/lib/queries/settings";

const link = "underline-offset-2 hover:text-fg hover:underline";

function Trend({
  up,
  tone,
  children,
}: {
  up: boolean;
  tone: "good" | "bad";
  children: React.ReactNode;
}) {
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        tone === "good" ? "text-ok-ink" : "text-danger-ink",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

function StatCard({
  label,
  hint,
  value,
  children,
}: {
  label: string;
  hint?: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-[13px] font-medium text-fg-muted">
        {label}
        {hint && (
          <span className="ml-1.5 font-normal text-fg-subtle">{hint}</span>
        )}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-fg">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-muted">
        {children}
      </div>
    </div>
  );
}

export async function StatCards() {
  const session = await auth();
  if (!session) return null;
  const s = await getStats(session.user.id);
  const targetMs = (await getSettings()).firstResponseTargetMinutes * 60_000;
  const { currentMs, previousMs } = s.response;

  // Resolved today vs yesterday
  const resolvedDiff = s.resolvedToday - s.resolvedYesterday;

  // First response: lower is better
  let responseNote: React.ReactNode;
  if (currentMs == null) {
    responseNote = <span className="text-fg-subtle">No replies sent yet</span>;
  } else if (previousMs == null) {
    responseNote = (
      <span className="text-fg-subtle">No data from the week before</span>
    );
  } else {
    const change = (currentMs - previousMs) / previousMs;
    const pct = Math.round(Math.abs(change) * 100);
    responseNote =
      pct < 1 ? (
        <span>Same as the week before</span>
      ) : (
        <Trend up={change > 0} tone={change < 0 ? "good" : "bad"}>
          {pct}% {change < 0 ? "faster" : "slower"} than the week before
        </Trend>
      );
  }

  return (
    <section
      aria-label="Queue statistics"
      className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
    >
      <StatCard label="Open" value={s.open}>
        <Link href="/tickets?view=unassigned" className={link}>
          {s.unassigned} unassigned
        </Link>
        <span>{s.newToday} new today</span>
      </StatCard>

      <StatCard label="In progress" value={s.inProgress}>
        <Link href="/tickets?view=mine" className={link}>
          {s.mine} assigned to you
        </Link>
      </StatCard>

      <StatCard label="Resolved today" value={s.resolvedToday}>
        {resolvedDiff > 0 ? (
          <Trend up tone="good">
            {resolvedDiff} more than yesterday
          </Trend>
        ) : (
          <Link href="/tickets?view=resolved" className={link}>
            {s.resolvedYesterday === 0
              ? "None yesterday"
              : `${s.resolvedYesterday} yesterday`}
          </Link>
        )}
      </StatCard>

      <StatCard
        label="First response"
        hint="7-day average"
        value={currentMs == null ? "–" : formatDuration(currentMs)}
      >
        {responseNote}
        {currentMs != null && (
          <span
            className={
              currentMs <= targetMs ? "text-ok-ink" : "text-danger-ink"
            }
          >
            {currentMs <= targetMs ? "Within" : "Over"}{" "}
            {formatDuration(targetMs)} target
          </span>
        )}
      </StatCard>
    </section>
  );
}
