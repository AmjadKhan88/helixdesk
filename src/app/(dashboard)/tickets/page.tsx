import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <EmptyState
      icon={MessagesSquare}
      title="Select a ticket"
      body="Pick one from the list to read the conversation and reply."
    />
  );
}
