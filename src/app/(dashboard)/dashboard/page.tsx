import { Suspense } from "react";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import {
  PanelSkeleton,
  StatCardsSkeleton,
} from "@/components/dashboard/skeletons";
import { StatCards } from "@/components/dashboard/stat-cards";
import { WeekChart } from "@/components/dashboard/week-chart";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Dashboard" };

// Each section streams in on its own, so a slow query never blocks the rest
export default function DashboardPage() {
  return (
    <>
      <Suspense
        fallback={
          <PageHeader
            title="Dashboard"
            description="Here is how the queue looks right now."
          />
        }
      >
        <DashboardHeader />
      </Suspense>

      <div className="space-y-4 sm:space-y-5">
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Suspense fallback={<PanelSkeleton />}>
              <WeekChart />
            </Suspense>
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<PanelSkeleton />}>
              <NeedsAttention />
            </Suspense>
          </div>
        </div>
      </div>

      <AutoRefresh />
    </>
  );
}
