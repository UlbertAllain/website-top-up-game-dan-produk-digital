import Image from "next/image";
import Link from "next/link";

import styles from "@/components/public/game-store.module.css";
import { ProductCard } from "@/components/public/product-card";
import type {
  BannerContentData,
  FaqContentData,
  TestimonialContentData,
} from "@/features/content/content.types";
import type { ProductType } from "@/features/products/product.types";
import type { PublicHomeData } from "@/features/public/public.service";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type HomePageProps = {
  data: PublicHomeData;
};

const categoryTypeLabels: Record<ProductType, string> = {
  top_up: "Top Up Game",
  game_account: "Akun Game",
  subscription: "Subscription",
  phone_number: "Nomor Digital",
};

const categoryDescriptions: Record<ProductType, string> = {
  top_up: "Diamond, voucher, credit, dan kebutuhan berbagai game populer.",
  game_account: "Pilihan akun berdasarkan rank, level, region, dan koleksi.",
  subscription: "Akses aplikasi premium serta layanan berlangganan digital.",
  phone_number: "Pilihan nomor berdasarkan negara, provider, dan kebutuhan.",
};

function getBannerData(data: PublicHomeData): BannerContentData | null {
  return data.heroBanner ? (data.heroBanner.data as BannerContentData) : null;
}

function getTestimonialData(
  item: PublicHomeData["testimonials"][number],
): TestimonialContentData {
  return item.data as TestimonialContentData;
}

function getFaqData(item: PublicHomeData["faqs"][number]): FaqContentData {
  return item.data as FaqContentData;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function createInitials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "P"
  );
}

function HeroAction({ href, label }: { href: string; label: string }) {
  const className = `${styles.cutPanel} inline-flex h-[52px] min-w-48 items-center justify-between gap-8 bg-[#356df3] px-5 text-xs font-black uppercase tracking-[0.09em] text-white transition hover:bg-white hover:text-[#06080d]`;

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-[#9eb8ff]" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill={index < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

function CategoryGlyph({ type }: { type: ProductType }) {
  const props = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: "size-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "top_up":
      return (
        <svg {...props}>
          <path d="M6 8h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-1l-2-2H9l-2 2H6a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" />
          <path d="M8 12v4M6 14h4" />
          <path d="M16 13h.01M18 15h.01" />
        </svg>
      );
    case "game_account":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
          <path d="m17 4 1 1" />
        </svg>
      );
    case "subscription":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );
    case "phone_number":
      return (
        <svg {...props}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M10 5h4M11 18h2" />
        </svg>
      );
  }
}

export function HomePage({ data }: HomePageProps) {
  const banner = getBannerData(data);
  const fallbackHeroProduct = data.products.find((product) => product.thumbnail);
  const heroImage = banner?.image ?? fallbackHeroProduct?.thumbnail ?? null;
  const heroProducts = data.products.slice(0, 3);

  const generalWhatsappUrl = createWhatsAppUrl(
    data.settings.whatsappNumber,
    "Halo Admin, saya ingin bertanya mengenai produk yang tersedia.",
  );

  const categoryProductCounts = data.categories.reduce<Record<string, number>>(
    (counts, category) => {
      counts[category.id] = data.products.filter(
        (product) => product.categoryId === category.id,
      ).length;
      return counts;
    },
    {},
  );

  const tickerItems = [
    "TOP UP GAME",
    "GAME ACCOUNT",
    "DIGITAL SUBSCRIPTION",
    "NOMOR DIGITAL",
    "MANUAL SUPPORT",
  ];

  return (
    <main className={`${styles.shell} overflow-hidden bg-[#06080d]`}>
      <section
        id="beranda"
        className={`${styles.heroBackdrop} ${styles.noise} relative min-h-screen overflow-hidden px-4 pb-8 pt-[102px] text-white sm:px-6 lg:px-8 lg:pb-12 lg:pt-[118px]`}
      >
        <div className={`${styles.blueprint} pointer-events-none absolute inset-0`} />

        <div className="relative mx-auto grid min-h-[760px] w-full max-w-[1480px] overflow-hidden border border-white/10 bg-[#0d1119] lg:grid-cols-[0.96fr_1.04fr]">
          <div className="relative z-20 flex flex-col justify-between p-6 sm:p-9 lg:p-11 xl:p-14">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-white/12 bg-white/[0.035] px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/58">
                  <span className="size-1.5 rounded-full bg-[#9eb8ff]" />
                  Live digital catalog
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                  Edition / 2026
                </span>
              </div>

              <h1 className="mt-10 max-w-4xl text-[clamp(3.5rem,7vw,7.6rem)] font-black leading-[0.86] tracking-[-0.075em] text-white">
                {banner?.title || data.settings.businessTagline}
              </h1>

              <div className="mt-8 grid gap-7 border-t border-white/12 pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
                <p className="max-w-xl text-sm leading-7 text-white/48 sm:text-base sm:leading-8">
                  {banner?.subtitle || data.settings.businessDescription}
                </p>

                <HeroAction
                  href={banner?.ctaUrl || "/#produk"}
                  label={banner?.ctaLabel || "Explore catalog"}
                />
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10">
              <div className="py-5 pr-4">
                <p className="text-3xl font-black tracking-[-0.06em]">
                  {data.categories.length.toString().padStart(2, "0")}
                </p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/28">
                  Kategori aktif
                </p>
              </div>
              <div className="px-4 py-5">
                <p className="text-3xl font-black tracking-[-0.06em]">
                  {data.products.length.toString().padStart(2, "0")}
                </p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/28">
                  Produk pilihan
                </p>
              </div>
              <div className="py-5 pl-4">
                <p className="text-3xl font-black tracking-[-0.06em]">1:1</p>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/28">
                  Admin support
                </p>
              </div>
            </div>
          </div>

          <div className={`${styles.heroMedia} relative min-h-[560px] overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0`}>
            {heroImage ? (
              <Image
                src={heroImage.secureUrl}
                alt={heroImage.alt || banner?.title || data.settings.businessName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(53,109,243,0.42),transparent_24%),linear-gradient(145deg,#1a2438,#080b11_70%)]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d1119_0%,rgba(13,17,25,0.15)_42%,rgba(6,8,13,0.08)_100%)] lg:bg-[linear-gradient(90deg,#0d1119_0%,rgba(13,17,25,0.08)_35%,rgba(6,8,13,0.05)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-transparent" />

            <div className="absolute right-0 top-0 hidden h-full w-14 items-center justify-center border-l border-white/10 bg-black/20 xl:flex">
              <span className={`${styles.verticalLabel} text-[9px] font-black uppercase tracking-[0.28em] text-white/35`}>
                Selected drop / featured visual
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-5 grid gap-2 sm:inset-x-7 sm:bottom-7 sm:grid-cols-3 xl:right-20">
              {heroProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative min-h-28 overflow-hidden border border-white/12 bg-[#06080d]/76 p-3 backdrop-blur-xl"
                >
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail.secureUrl}
                      alt={product.thumbnail.alt || product.name}
                      fill
                      sizes="240px"
                      className="object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06080d] via-[#06080d]/75 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <p className="text-[9px] font-black tracking-[0.18em] text-[#9eb8ff]">
                      0{index + 1}
                    </p>
                    <div>
                      <p className="line-clamp-1 text-sm font-black text-white">{product.name}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                        {product.code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.marquee} relative mx-auto mt-4 w-full max-w-[1480px] border-y border-white/10 py-3`}>
          <div className={styles.marqueeTrack}>
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center">
                <span className="px-8 text-[10px] font-black uppercase tracking-[0.23em] text-white/38">
                  {item}
                </span>
                <span className="size-1.5 rotate-45 bg-[#356df3]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kategori" className="bg-[#06080d] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="grid gap-8 border-t border-white/10 pt-7 lg:grid-cols-[230px_1fr] lg:gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9eb8ff]">
                01 / Game launcher
              </p>
              <p className="mt-5 text-sm leading-7 text-white/40">
                Masuk melalui kategori yang paling sesuai dengan kebutuhanmu.
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl font-black leading-[0.92] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                Pilih arena digitalmu.
              </h2>
            </div>
          </div>

          <div className="mt-12 grid auto-rows-[250px] gap-3 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[270px]">
            {data.categories.slice(0, 4).map((category, index) => {
              const categoryProduct = data.products.find(
                (product) => product.categoryId === category.id && product.thumbnail,
              );

              return (
                <a
                  key={category.id}
                  href="#produk"
                  className={`${styles.categoryCard} group overflow-hidden border border-white/10 bg-[#0d1119] ${
                    index === 0 ? "md:row-span-2 lg:col-span-2" : ""
                  }`}
                >
                  {categoryProduct?.thumbnail ? (
                    <Image
                      src={categoryProduct.thumbnail.secureUrl}
                      alt={categoryProduct.thumbnail.alt || category.name}
                      fill
                      sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "25vw"}
                      className="object-cover opacity-55 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-68"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(53,109,243,0.26),transparent_25%),linear-gradient(145deg,#172033,#0d1119_70%)]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,13,0.05),rgba(6,8,13,0.92))]" />

                  <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center border border-white/14 bg-black/25 text-white/80 backdrop-blur-md">
                        <CategoryGlyph type={category.type} />
                      </span>
                      <span className="text-[10px] font-black tracking-[0.2em] text-white/35">
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.19em] text-[#9eb8ff]">
                        {categoryTypeLabels[category.type]}
                      </p>
                      <h3 className={`mt-3 font-black leading-[0.95] tracking-[-0.05em] text-white ${index === 0 ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
                        {category.name}
                      </h3>
                      <p className={`mt-4 text-sm leading-7 text-white/45 ${index === 0 ? "max-w-xl" : "line-clamp-2"}`}>
                        {category.description || categoryDescriptions[category.type]}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/12 pt-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                          {categoryProductCounts[category.id] ?? 0} produk pilihan
                        </span>
                        <span className="text-lg text-white/65 transition group-hover:translate-x-1 group-hover:text-white">→</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="produk" className="bg-[#0a0d13] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="grid gap-8 border-t border-white/10 pt-7 lg:grid-cols-[230px_1fr_auto] lg:items-end lg:gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9eb8ff]">
                02 / Featured inventory
              </p>
              <p className="mt-5 text-sm leading-7 text-white/40">
                Produk dipilih dari katalog aktif dan siap dikonfirmasi melalui admin.
              </p>
            </div>

            <h2 className="max-w-4xl text-4xl font-black leading-[0.92] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
              Ready for your next play.
            </h2>

            <div className="hidden pb-2 text-right xl:block">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Inventory status</p>
              <p className="mt-2 text-sm font-black text-white">Updated by admin</p>
            </div>
          </div>

          {data.products.length > 0 ? (
            <div className="mt-12 grid auto-rows-auto gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.products.map((product, index) => {
                const category = data.categories.find(
                  (currentCategory) => currentCategory.id === product.categoryId,
                );
                const discountPrice =
                  typeof product.discountPrice === "number"
                    ? product.discountPrice
                    : null;
                const finalPrice = discountPrice ?? product.price;
                const productWhatsappUrl = createWhatsAppUrl(
                  data.settings.whatsappNumber,
                  product.whatsappMessage || data.settings.whatsappMessageTemplate,
                  { name: product.name, code: product.code, price: finalPrice },
                );

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={category?.name || categoryTypeLabels[product.type]}
                    whatsappUrl={productWhatsappUrl}
                    featured={index === 0}
                    priority={index < 2}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-12 border border-dashed border-white/15 bg-[#0d1119] px-6 py-20 text-center">
              <p className="text-xl font-black text-white">Inventory sedang disiapkan.</p>
              <p className="mt-3 text-sm text-white/40">Hubungi admin untuk menanyakan produk yang sedang tersedia.</p>
            </div>
          )}
        </div>
      </section>

      <section id="cara-pesan" className="bg-[#eef1f6] px-4 py-20 text-[#06080d] sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#356df3]">
                03 / Order protocol
              </p>
              <h2 className="mt-6 max-w-2xl text-4xl font-black leading-[0.9] tracking-[-0.065em] sm:text-5xl lg:text-7xl">
                Simple flow. Human support.
              </h2>
              <p className="mt-7 max-w-lg text-sm leading-7 text-black/48 sm:text-base sm:leading-8">
                Tidak ada alur transaksi yang membingungkan. Pilih produk, kirim detail ke WhatsApp, lalu admin membantu proses berikutnya.
              </p>

              {generalWhatsappUrl ? (
                <a
                  href={generalWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex h-[52px] min-w-52 items-center justify-between bg-[#06080d] px-5 text-xs font-black uppercase tracking-[0.09em] text-white transition hover:bg-[#356df3]"
                >
                  Tanya admin
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>

            <div className="border-t border-black/12">
              {[
                ["01", "Pilih produk", "Jelajahi katalog dan tentukan produk yang sesuai kebutuhanmu."],
                ["02", "Periksa detail", "Baca informasi harga, ketersediaan, dan catatan produk."],
                ["03", "Kirim ke admin", "Tombol pemesanan otomatis membawa identitas produk ke WhatsApp."],
                ["04", "Konfirmasi proses", "Admin memeriksa stok lalu memberikan arahan transaksi berikutnya."],
              ].map(([number, title, description]) => (
                <article
                  key={number}
                  className="group grid gap-5 border-b border-black/12 py-7 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:py-9"
                >
                  <span className="text-sm font-black tracking-[0.16em] text-[#356df3]">{number}</span>
                  <div>
                    <h3 className="text-2xl font-black tracking-[-0.035em]">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-black/48">{description}</p>
                  </div>
                  <span className="hidden size-11 items-center justify-center border border-black/12 text-lg transition group-hover:border-[#356df3] group-hover:bg-[#356df3] group-hover:text-white sm:flex">
                    →
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {data.testimonials.length > 0 ? (
        <section id="testimoni" className="bg-[#06080d] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto w-full max-w-[1480px]">
            <div className="grid gap-8 border-t border-white/10 pt-7 lg:grid-cols-[230px_1fr] lg:gap-16">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9eb8ff]">
                  04 / Player feedback
                </p>
              </div>
              <h2 className="max-w-5xl text-4xl font-black leading-[0.92] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                Real feedback. No scripted hype.
              </h2>
            </div>

            <div className="mt-12 grid border-l border-t border-white/10 md:grid-cols-2 xl:grid-cols-3">
              {data.testimonials.map((testimonial, index) => {
                const testimonialData = getTestimonialData(testimonial);

                return (
                  <article
                    key={testimonial.id}
                    className={`${styles.spotlightCard} flex min-h-[330px] flex-col border-b border-r border-white/10 bg-[#0d1119] p-6 sm:p-8`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <RatingStars rating={testimonialData.rating} />
                      <span className="text-[10px] font-black tracking-[0.18em] text-white/20">
                        0{index + 1}
                      </span>
                    </div>

                    <blockquote className="mt-8 flex-1">
                      <p className="text-xl font-bold leading-8 tracking-[-0.02em] text-white/72">
                        “{testimonialData.quote}”
                      </p>
                    </blockquote>

                    <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden border border-white/12 bg-[#141a25]">
                        {testimonialData.avatar ? (
                          <Image
                            src={testimonialData.avatar.secureUrl}
                            alt={testimonialData.avatar.alt || testimonialData.customerName}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-white/55">
                            {createInitials(testimonialData.customerName)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{testimonialData.customerName}</p>
                        <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
                          {testimonialData.customerRole || "Pelanggan"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {data.faqs.length > 0 ? (
        <section id="faq" className="bg-[#eef1f6] px-4 py-20 text-[#06080d] sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid w-full max-w-[1480px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#356df3]">
                05 / Support database
              </p>
              <h2 className="mt-6 text-4xl font-black leading-[0.9] tracking-[-0.065em] sm:text-5xl lg:text-7xl">
                Need intel?
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-black/48">
                Temukan jawaban umum sebelum menghubungi admin. Pertanyaan yang lebih spesifik tetap dapat dikonsultasikan langsung.
              </p>
            </div>

            <div className="border-t border-black/12">
              {data.faqs.map((faq, index) => {
                const faqData = getFaqData(faq);

                return (
                  <details key={faq.id} className={`${styles.faqRow} group border-b border-black/12`} open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-start gap-5 py-6 sm:items-center sm:py-8">
                      <span className="mt-1 shrink-0 text-[10px] font-black tracking-[0.18em] text-[#356df3] sm:mt-0">
                        0{index + 1}
                      </span>
                      <span className="flex-1 text-lg font-black leading-7 tracking-[-0.025em] sm:text-xl">
                        {faqData.question}
                      </span>
                      <span className="flex size-9 shrink-0 items-center justify-center border border-black/12 text-lg transition group-open:rotate-45 group-open:border-[#356df3] group-open:bg-[#356df3] group-open:text-white">
                        +
                      </span>
                    </summary>
                    <div className="pb-7 pl-0 sm:pl-10 sm:pr-16">
                      <p className="whitespace-pre-line text-sm leading-8 text-black/50">{faqData.answer}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-[#06080d] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
        <div className="relative mx-auto min-h-[520px] w-full max-w-[1480px] overflow-hidden border border-white/10">
          {heroImage ? (
            <Image
              src={heroImage.secureUrl}
              alt={heroImage.alt || data.settings.businessName}
              fill
              sizes="100vw"
              className="object-cover opacity-45"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#06080d_0%,rgba(6,8,13,0.86)_45%,rgba(6,8,13,0.35)_100%)]" />
          <div className={`${styles.blueprint} absolute inset-0 opacity-35`} />

          <div className="relative flex min-h-[520px] flex-col justify-between p-6 sm:p-10 lg:p-14">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9eb8ff]">
                Final checkpoint
              </p>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                WhatsApp support
              </span>
            </div>

            <div className="max-w-4xl">
              <h2 className="text-4xl font-black leading-[0.9] tracking-[-0.065em] sm:text-5xl lg:text-7xl">
                Sudah menemukan produk yang tepat?
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/48 sm:text-base sm:leading-8">
                Kirim detail produk ke admin untuk memeriksa ketersediaan dan melanjutkan proses transaksi.
              </p>

              {generalWhatsappUrl ? (
                <a
                  href={generalWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex h-[52px] min-w-52 items-center justify-between bg-white px-5 text-xs font-black uppercase tracking-[0.09em] text-[#06080d] transition hover:bg-[#9eb8ff]"
                >
                  Open WhatsApp
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <a
                  href="#kontak"
                  className="mt-8 inline-flex h-[52px] min-w-52 items-center justify-between border border-white/15 px-5 text-xs font-black uppercase tracking-[0.09em] text-white"
                >
                  Lihat kontak
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
