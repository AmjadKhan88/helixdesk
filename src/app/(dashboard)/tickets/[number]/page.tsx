import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { DetailSkeleton } from "@/components/tickets/skeletons";

async function DetailLoader({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  if (!/^\d{1,9}$/.test(number)) notFound();
  return <TicketDetail number={Number(number)} />;
}

export default function TicketPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailLoader params={params} />
    </Suspense>
  );
}
