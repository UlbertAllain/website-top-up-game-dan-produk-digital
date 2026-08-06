"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Category } from "@/features/categories/category.types";
import type {
  Product,
  ProductPublicationStatus,
  ProductStockStatus,
} from "@/features/products/product.types";

type ProductListProps = {
  initialProducts: Product[];
  categories: Category[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;

  error?: {
    code?: string;
    message?: string;
  };
};

const publicationLabels: Record<ProductPublicationStatus, string> = {
  draft: "Draft",
  published: "Dipublikasikan",
  hidden: "Disembunyikan",
};

const publicationClasses: Record<ProductPublicationStatus, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-600/10",

  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

  hidden: "bg-neutral-100 text-neutral-600 ring-neutral-500/10",
};

const stockLabels: Record<ProductStockStatus, string> = {
  available: "Tersedia",
  limited: "Terbatas",
  unavailable: "Tidak tersedia",
};

const stockClasses: Record<ProductStockStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",

  limited: "bg-amber-50 text-amber-700",

  unavailable: "bg-red-50 text-red-700",
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductList({ initialProducts, categories }: ProductListProps) {
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [selectedPublication, setSelectedPublication] = useState("");

  const [selectedStock, setSelectedStock] = useState("");

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");

    return products.filter((product) => {
      if (selectedCategory && product.categoryId !== selectedCategory) {
        return false;
      }

      if (
        selectedPublication &&
        product.publicationStatus !== selectedPublication
      ) {
        return false;
      }

      if (selectedStock && product.stockStatus !== selectedStock) {
        return false;
      }

      if (normalizedSearch) {
        const searchableText = [
          product.name,
          product.code,
          product.shortDescription,
        ]
          .join(" ")
          .toLocaleLowerCase("id-ID");

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [products, search, selectedCategory, selectedPublication, selectedStock]);

  const hasActiveFilters = Boolean(
    search || selectedCategory || selectedPublication || selectedStock,
  );

  function resetFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedPublication("");
    setSelectedStock("");
  }

  async function handleDelete() {
    if (!productToDelete || isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productToDelete.id}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse<{
        deleted: boolean;
      }>;

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Produk gagal dihapus.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productToDelete.id),
      );

      setProductToDelete(null);

      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Produk gagal dihapus.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.02]">
        <div className="border-b border-neutral-200 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(160px,auto))]">
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau kode produk..."
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Semua kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPublication}
              onChange={(event) => setSelectedPublication(event.target.value)}
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Semua publikasi</option>

              <option value="published">Dipublikasikan</option>

              <option value="draft">Draft</option>

              <option value="hidden">Disembunyikan</option>
            </select>

            <select
              value={selectedStock}
              onChange={(event) => setSelectedStock(event.target.value)}
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Semua stok</option>

              <option value="available">Tersedia</option>

              <option value="limited">Terbatas</option>

              <option value="unavailable">Tidak tersedia</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Menampilkan{" "}
              <strong className="font-semibold text-neutral-800">
                {filteredProducts.length}
              </strong>{" "}
              dari{" "}
              <strong className="font-semibold text-neutral-800">
                {products.length}
              </strong>{" "}
              produk
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Reset filter
              </button>
            ) : null}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
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
                <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" />
                <path d="m4 12 8 4.5 8-4.5" />
                <path d="m4 16.5 8 4.5 8-4.5" />
              </svg>
            </div>

            <h2 className="mt-5 font-semibold text-neutral-900">
              Produk tidak ditemukan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Ubah kata pencarian atau filter yang digunakan.
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Tampilkan semua produk
              </button>
            ) : (
              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Tambah produk pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1020px] text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Produk
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Kategori
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Harga
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Stok
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Publikasi
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const finalPrice = product.discountPrice ?? product.price;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-100 transition last:border-b-0 hover:bg-neutral-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                              {product.thumbnail ? (
                                <Image
                                  src={product.thumbnail.secureUrl}
                                  alt={product.thumbnail.alt || product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-neutral-500">
                                  {product.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate text-sm font-semibold text-neutral-900">
                                {product.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs text-neutral-500">
                                  {product.code}
                                </span>

                                {product.isFeatured ? (
                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                    Unggulan
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {categoryMap.get(product.categoryId) ??
                            product.categoryId}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-neutral-900">
                            {formatRupiah(finalPrice)}
                          </p>

                          {product.discountPrice !== null ? (
                            <p className="mt-1 text-xs text-neutral-400 line-through">
                              {formatRupiah(product.price)}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                              stockClasses[product.stockStatus],
                            ].join(" ")}
                          >
                            {stockLabels[product.stockStatus]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                              publicationClasses[product.publicationStatus],
                            ].join(" ")}
                          >
                            {publicationLabels[product.publicationStatus]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError("");

                                setProductToDelete(product);
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-neutral-100 lg:hidden">
              {filteredProducts.map((product) => {
                const finalPrice = product.discountPrice ?? product.price;

                return (
                  <article key={product.id} className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail.secureUrl}
                            alt={product.thumbnail.alt || product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-neutral-500">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-neutral-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {product.code}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-neutral-900">
                          {formatRupiah(finalPrice)}
                        </p>
                      </div>

                      {product.isFeatured ? (
                        <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                          Unggulan
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] text-neutral-500">Kategori</p>

                        <p className="mt-1 truncate text-xs font-semibold text-neutral-800">
                          {categoryMap.get(product.categoryId) ??
                            product.categoryId}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] text-neutral-500">
                          Ketersediaan
                        </p>

                        <p className="mt-1 text-xs font-semibold text-neutral-800">
                          {stockLabels[product.stockStatus]}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                          publicationClasses[product.publicationStatus],
                        ].join(" ")}
                      >
                        {publicationLabels[product.publicationStatus]}
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");

                            setProductToDelete(product);
                          }}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {productToDelete ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProductToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </div>

            <h2
              id="delete-product-title"
              className="mt-5 text-lg font-semibold text-neutral-950"
            >
              Hapus produk?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Produk{" "}
              <strong className="font-semibold text-neutral-900">
                {productToDelete.name}
              </strong>{" "}
              akan dihapus permanen. Thumbnail dan gambar galerinya juga akan
              dibersihkan.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Menghapus..." : "Hapus permanen"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
