import Image from "next/image";

import type { Product } from "@/features/products/product.types";
import styles from "@/components/public/game-commerce.module.css";

type ProductCardProps = {
  product: Product;
  categoryName: string;
  whatsappUrl: string | null;
  fallbackImage: string;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product, categoryName, whatsappUrl, fallbackImage }: ProductCardProps) {
  const finalPrice = product.discountPrice ?? product.price;
  const imageSrc = product.thumbnail?.secureUrl || fallbackImage;
  const imageAlt = product.thumbnail?.alt || product.name;

  return (
    <article className={`${styles.panel} ${styles.cut} ${styles.tileHover} group flex h-full min-w-[240px] max-w-[300px] flex-col rounded-[24px] bg-[#0a0e18]`}>
      <div className={`relative aspect-[4/5] overflow-hidden ${styles.thumbMask}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 74vw, (max-width: 1024px) 33vw, 260px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,16,0.12),rgba(5,8,16,0.28)_45%,rgba(5,8,16,0.88)_100%)]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88 backdrop-blur-md">
            {categoryName}
          </span>
          {product.isFeatured ? (
            <span className="rounded-full border border-[#7fa0ff]/30 bg-[#3b6fff]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#dce5ff]">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ea7ff]">{product.code}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-white">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{product.shortDescription}</p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Mulai dari</p>
              <p className="mt-1 text-xl font-black text-white">{formatRupiah(finalPrice)}</p>
              {product.discountPrice !== null ? (
                <p className="mt-1 text-xs text-white/30 line-through">{formatRupiah(product.price)}</p>
              ) : null}
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/72">
              {product.stockStatus === "limited" ? "Terbatas" : "Tersedia"}
            </span>
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#3b6fff] px-4 text-sm font-bold text-white transition hover:bg-[#4e74ff]"
            >
              Pesan Sekarang
            </a>
          ) : (
            <a
              href="#kontak"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-bold text-white/78"
            >
              Lihat Kontak
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
