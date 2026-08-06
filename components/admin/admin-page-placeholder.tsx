import { PageHeader } from "@/components/admin/page-header";

type AdminPagePlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPagePlaceholder({
  title,
  description,
}: AdminPagePlaceholderProps) {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard Admin"
        title={title}
        description={description}
      />

      <section className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-neutral-900">
          Halaman sedang disiapkan
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-500">
          Layout admin sudah aktif. Fitur pengelolaan halaman ini akan dibangun
          pada tahap berikutnya dan langsung dihubungkan dengan backend.
        </p>
      </section>
    </div>
  );
}
