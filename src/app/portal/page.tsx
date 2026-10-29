import { auth } from "@/auth";
import { ComingSoon, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Your tickets" };

export default async function PortalPage() {
  const session = await auth();
  return (
    <>
      <PageHeader
        title="Your tickets"
        description={`Signed in as ${session?.user.email}`}
      />
      <ComingSoon step={9}>
        Your requests and replies will appear here.
      </ComingSoon>
    </>
  );
}
