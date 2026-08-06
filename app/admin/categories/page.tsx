import { CategoryManager } from "@/components/admin/categories/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { listCategories } from "@/features/categories/category.service";
import { listProducts } from "@/features/products/product.service";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdminPageSession();

  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts(),
  ]);

  const productCounts = products.reduce<Record<string, number>>(
    (counts, product) => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;

      return counts;
    },
    {},
  );

  return (
    <div>
      <PageHeader
        eyebrow="Katalog"
        title="Kategori"
        description="Kelola kelompok produk, status penggunaan, dan urutan kategori yang ditampilkan pada website."
      />

      <CategoryManager
        initialCategories={categories}
        productCounts={productCounts}
      />
    </div>
  );
}
