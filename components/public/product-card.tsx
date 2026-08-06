import Image from "next/image";

import styles from "@/components/public/game-store.module.css";
import type { Product } from "@/features/products/product.types";

type ProductCardProps = {
  product: Product;
  categoryName: string;
  whatsappUrl: string | null;
  featured?: boolean;
  priority?: boolean;
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({
  product,
  categoryName,
  whatsappUrl,
  featured = false,
  priority = false,
}: ProductCardProps) {
  const discountPrice =
    typeof product.discountPrice === "number" ? product.discountPrice : null;
  const hasDiscount = discountPrice !== null;
  const finalPrice = discountPrice ?? product.price;

  return (
    <article
      className={`${styles.productCut} ${styles.spotlightCard} group relative isolate flex overflow-hidden border border-white/10 bg-[#0d1119] ${
        featured
          ? "min-h-[560px] sm:min-h-[640px] xl:col-span-2 xl:row-span-2"
          : "min-h-[430px] sm:min-h-[470px]"
      }`}
    >
      {product.thumbnail ? (
        <Image
          src={product.thumbnail.secureUrl}
          alt={product.thumbnail.alt || product.name}
          fill
          priority={priority}
          sizes={
            featured
              ? "(max-width: 1280px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          }
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.055]"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(53,109,243,0.32),transparent_24%),linear-gradient(145deg,#172033,#080b12_70%)]">
          <span className="absolute bottom-20 right-4 text-[9rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:text-[12rem]">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,13,0.08)_0%,rgba(6,8,13,0.18)_35%,rgba(6,8,13,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,13,0.62)_0%,transparent_58%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex w-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="border border-white/15 bg-black/35 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
              {categoryName}
            </span>
            {product.isFeatured ? (
              <span className="bg-[#356df3] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                Featured
              </span>
            ) : null}
          </div>

          <span className="flex size-9 items-center justify-center border border-white/15 bg-black/30 text-sm text-white/75 backdrop-blur-md transition duration-300 group-hover:border-[#356df3] group-hover:bg-[#356df3] group-hover:text-white">
            ↗
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/42">
            <span className="h-px w-7 bg-[#356df3]" />
            {product.code}
            <span aria-hidden="true">/</span>
            {product.stockStatus === "limited" ? "Stok terbatas" : "Ready order"}
          </div>

          <div className={featured ? "mt-5 max-w-2xl" : "mt-4"}>
            <h3
              className={`font-black leading-[0.98] tracking-[-0.055em] text-white ${
                featured ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {product.name}
            </h3>

            <p
              className={`mt-4 text-sm leading-7 text-white/52 ${
                featured ? "max-w-xl" : "line-clamp-2"
              }`}
            >
              {product.shortDescription}
            </p>
          </div>

          <div
            className={`mt-6 flex gap-4 border-t border-white/12 pt-5 ${
              featured
                ? "flex-col sm:flex-row sm:items-end sm:justify-between"
                : "flex-col"
            }`}
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-white/35">
                Mulai dari
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                <p className={featured ? "text-3xl font-black text-white" : "text-2xl font-black text-white"}>
                  {formatRupiah(finalPrice)}
                </p>
                {hasDiscount ? (
                  <p className="text-xs font-bold text-white/30 line-through">
                    {formatRupiah(product.price)}
                  </p>
                ) : null}
              </div>
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-12 items-center justify-between gap-8 bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[#06080d] transition hover:bg-[#9eb8ff] ${
                  featured ? "sm:min-w-52" : "w-full"
                }`}
              >
                Pesan sekarang
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <a
                href="#kontak"
                className="inline-flex h-12 w-full items-center justify-between border border-white/15 px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:border-[#356df3] hover:bg-[#356df3]"
              >
                Hubungi admin
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
