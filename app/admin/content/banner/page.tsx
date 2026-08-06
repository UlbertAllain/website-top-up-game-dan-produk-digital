import { PageHeader } from "@/components/admin/page-header";
import { BannerManager } from "@/components/admin/content/banner-manager";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listContentItems } from "@/features/content/content.service";

export const dynamic = "force-dynamic";

export default async function BannerPage() {
  await requireAdminPageSession();

  const banners = await listContentItems("banner");

  return (
    <div>
      <PageHeader
        eyebrow="Konten Website"
        title="Banner"
        description="Kelola banner utama dan promosi yang akan ditampilkan pada website publik."
      />

      <BannerManager initialBanners={banners} />
    </div>
  );
}
