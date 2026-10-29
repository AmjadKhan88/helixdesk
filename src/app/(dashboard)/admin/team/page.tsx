import { TeamManager } from "@/components/admin/team-manager";
import { listTeam } from "@/lib/queries/admin";
import { requirePageUser } from "@/lib/session";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const me = await requirePageUser("admin");
  return <TeamManager members={await listTeam()} meId={me.id} />;
}
