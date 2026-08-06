import { FaqManager } from "@/components/admin/content/faq-manager";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listContentItems } from "@/features/content/content.service";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  await requireAdminPageSession();

  const faqs = await listContentItems("faq");

  return (
    <div>
      <PageHeader
        eyebrow="Konten Website"
        title="FAQ"
        description="Kelola pertanyaan dan jawaban yang membantu pelanggan memahami produk, pemesanan, pembayaran, dan proses layanan."
      />

      <FaqManager initialFaqs={faqs} />
    </div>
  );
}
