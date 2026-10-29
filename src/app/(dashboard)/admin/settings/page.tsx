import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { getSettings } from "@/lib/queries/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Workspace-wide targets." />
      <SettingsForm initialMinutes={settings.firstResponseTargetMinutes} />
    </>
  );
}
