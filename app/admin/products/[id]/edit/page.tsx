import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listCategories } from "@/features/categories/category.service";
import { getProduct } from "@/features/products/product.service";
import { AppError } from "@/lib/app-error";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdminPageSession();

  const { id } = await params;

  try {
    const [product, categories] = await Promise.all([
      getProduct(id),
      listCategories(),
    ]);

    return (
      <div>
        <PageHeader
          eyebrow="Katalog"
          title="Edit Produk"
          description={`Perbarui informasi, harga, ketersediaan, dan media untuk ${product.name}.`}
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

        <ProductForm mode="edit" product={product} categories={categories} />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
