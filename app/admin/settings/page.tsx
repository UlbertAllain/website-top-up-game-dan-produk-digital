import { PageHeader } from "@/components/admin/page-header";
import { SettingsManager } from "@/components/admin/settings/settings-manager";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { getSiteSettings } from "@/features/settings/settings.service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminPageSession();

  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader
        eyebrow="Sistem"
        title="Pengaturan Website"
        description="Kelola identitas bisnis, kontak WhatsApp, jam operasional, media sosial, serta informasi SEO website."
      />

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
