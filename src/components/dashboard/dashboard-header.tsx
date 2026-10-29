import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { APP_TZ } from "@/lib/tz";

export async function DashboardHeader() {
  const session = await auth();
  const first = session?.user.name?.split(" ")[0];
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: APP_TZ,
    }).format(new Date()),
  );
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <PageHeader
      title={first ? `${greeting}, ${first}` : "Dashboard"}
      description="Here is how the queue looks right now."
    />
  );
}
