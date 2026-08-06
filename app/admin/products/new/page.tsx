import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listCategories } from "@/features/categories/category.service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdminPageSession();

  const categories = await listCategories();

  const activeCategories = categories.filter(
    (category) => category.status === "active",
  );

  return (
    <div>
      <PageHeader
        eyebrow="Katalog"
        title="Tambah Produk"
        description="Masukkan informasi produk, harga, spesifikasi, serta gambar yang akan ditampilkan pada katalog."
        action={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <span aria-hidden="true">←</span>
            Daftar Produk
          </Link>
        }
      />

      {activeCategories.length === 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Belum ada kategori aktif. Aktifkan setidaknya satu kategori sebelum
          membuat produk baru.
        </div>
      ) : null}

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
