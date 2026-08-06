import { PageManager } from "@/components/admin/content/page-manager";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listContentPages } from "@/features/content/content.service";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  await requireAdminPageSession();

  const pages = await listContentPages();

  return (
    <div>
      <PageHeader
        eyebrow="Konten Website"
        title="Halaman Informasi"
        description="Kelola profil bisnis, panduan pemesanan, syarat dan ketentuan, serta kebijakan privasi website."
      />

      <PageManager initialPages={pages} />
    </div>
  );
}
