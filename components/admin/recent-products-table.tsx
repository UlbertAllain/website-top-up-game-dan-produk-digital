import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/features/products/product.types";

type RecentProductsTableProps = {
  products: Product[];
};

const publicationLabels = {
  draft: "Draft",
  published: "Dipublikasikan",
  hidden: "Disembunyikan",
} as const;

const publicationClasses = {
  draft: "bg-amber-50 text-amber-700 ring-amber-600/10",

  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

  hidden: "bg-neutral-100 text-neutral-600 ring-neutral-500/10",
} as const;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function RecentProductsTable({ products }: RecentProductsTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/[0.02]">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-neutral-950">Produk terbaru</h2>

          <p className="mt-1 text-sm text-neutral-500">
            Produk yang terakhir ditambahkan ke katalog.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Lihat semua
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="font-medium text-neutral-800">Belum ada produk</p>

          <p className="mt-1 text-sm text-neutral-500">
            Tambahkan produk pertama melalui halaman produk.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Produk
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Harga
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Dibuat
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const finalPrice = product.discountPrice ?? product.price;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                            {product.thumbnail ? (
                              <Image
                                src={product.thumbnail.secureUrl}
                                alt={product.thumbnail.alt || product.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-neutral-500">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {product.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-neutral-800">
                        {formatRupiah(finalPrice)}
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

                      <td className="px-5 py-4 text-sm text-neutral-500">
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-neutral-100 md:hidden">
            {products.map((product) => {
              const finalPrice = product.discountPrice ?? product.price;

              return (
                <article key={product.id} className="p-5">
                  <div className="flex items-start gap-3">
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
                    </div>

                    <span
                      className={[
                        "inline-flex shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset",
                        publicationClasses[product.publicationStatus],
                      ].join(" ")}
                    >
                      {publicationLabels[product.publicationStatus]}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                      {formatRupiah(finalPrice)}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {formatDate(product.createdAt)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
