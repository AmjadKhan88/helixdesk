import { ComingSoon, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Every conversation your team is handling."
      />
      <ComingSoon step={11}>
        The ticket list and conversation view will appear here.
      </ComingSoon>
    </>
  );
}
