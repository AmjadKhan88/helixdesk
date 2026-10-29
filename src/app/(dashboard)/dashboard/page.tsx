import { ComingSoon, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How the queue is doing right now."
      />
      <ComingSoon step={7}>Live stats will appear here.</ComingSoon>
    </>
  );
}
