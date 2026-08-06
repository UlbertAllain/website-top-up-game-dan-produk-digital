import { PageHeader } from "@/components/admin/page-header";
import { TestimonialManager } from "@/components/admin/content/testimonial-manager";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listContentItems } from "@/features/content/content.service";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  await requireAdminPageSession();

  const testimonials = await listContentItems("testimonial");

  return (
    <div>
      <PageHeader
        eyebrow="Konten Website"
        title="Testimoni"
        description="Kelola pengalaman pelanggan, rating, avatar, serta testimoni yang akan ditampilkan pada website."
      />

      <TestimonialManager initialTestimonials={testimonials} />
    </div>
  );
}
