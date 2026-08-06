import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProductList } from "@/components/admin/products/product-list";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listCategories } from "@/features/categories/category.service";
import { listProducts } from "@/features/products/product.service";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireAdminPageSession();

  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Katalog"
        title="Produk"
        description="Kelola seluruh produk digital, harga, ketersediaan, publikasi, serta media produk."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <span className="text-lg leading-none">+</span>
            Tambah Produk
          </Link>
        }
      />

      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}
