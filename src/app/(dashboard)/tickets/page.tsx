import { ComingSoon, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <>
      <PageHeader
        title="Tickets"
        description="Every conversation your team is handling."
      />
      <ComingSoon step={6}>
        The ticket list and conversation view will appear here.
      </ComingSoon>
    </>
  );
}
