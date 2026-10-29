import { Suspense } from "react";
import { NewTicketDialog } from "@/components/tickets/new-ticket-dialog";
import { TicketsSkeleton } from "@/components/tickets/skeletons";
import { TicketListPane } from "@/components/tickets/ticket-list";
import { TicketsShell } from "@/components/tickets/tickets-shell";

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<TicketsSkeleton />}>
      <TicketsShell list={<TicketListPane />}>{children}</TicketsShell>
      <NewTicketDialog />
    </Suspense>
  );
}
