import { ComingSoon, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Every conversation your team is handling."
      />
      <ComingSoon step={8}>
        The ticket list and conversation view will appear here.
      </ComingSoon>
    </>
  );
}
