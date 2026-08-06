import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/public/product-card";
import styles from "@/components/public/game-commerce.module.css";
import type { BannerContentData, FaqContentData, TestimonialContentData } from "@/features/content/content.types";
import type { PublicHomeData } from "@/features/public/public.service";
import type { Product, ProductType } from "@/features/products/product.types";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const typeLabels: Record<ProductType, string> = {
  top_up: "Top Up Game",
  game_account: "Akun Game",
  subscription: "Subscription",
  phone_number: "Nomor Kosong",
};

const fallbackCategoryImages: Record<ProductType, string> = {
  top_up: "/nexty-showcase/category-topup.png",
  game_account: "/nexty-showcase/category-account.png",
  subscription: "/nexty-showcase/category-subscription.png",
  phone_number: "/nexty-showcase/category-number.png",
};

const railFallbacks = [
  "/nexty-showcase/cover-featured.png",
  "/nexty-showcase/cover-assassin.png",
  "/nexty-showcase/cover-crystal-queen.png",
  "/nexty-showcase/category-topup.png",
  "/nexty-showcase/category-account.png",
  "/nexty-showcase/category-subscription.png",
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getBannerData(data: PublicHomeData): BannerContentData | null {
  if (!data.heroBanner) return null;
  return data.heroBanner.data as BannerContentData;
}

function getFaqData(item: PublicHomeData["faqs"][number]): FaqContentData {
  return item.data as FaqContentData;
}

function getTestimonialData(item: PublicHomeData["testimonials"][number]): TestimonialContentData {
  return item.data as TestimonialContentData;
}

function getCategoryPreview(data: PublicHomeData, categoryId: string, type: ProductType) {
  const matchingProduct = data.products.find((product) => product.categoryId === categoryId && product.thumbnail?.secureUrl);
  return matchingProduct?.thumbnail?.secureUrl || fallbackCategoryImages[type];
}

function getProductFallback(index: number) {
  return railFallbacks[index % railFallbacks.length];
}

function countProductsByCategory(products: Product[], categoryId: string) {
  return products.filter((product) => product.categoryId === categoryId).length;
}

function createHeroTitle(settingsTitle: string, bannerTitle?: string) {
  return bannerTitle || settingsTitle || "Semua Kebutuhan Digital Gaming Dalam Satu Tempat";
}

function createPreviewProduct(products: Product[]) {
  return products.find((item) => item.isFeatured) || products[0] || null;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-[#ffd451]" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill={index < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

export function HomePage({ data }: { data: PublicHomeData }) {
  const banner = getBannerData(data);
  const generalWhatsappUrl = createWhatsAppUrl(
    data.settings.whatsappNumber,
    data.settings.whatsappMessageTemplate || "Halo Admin, saya ingin bertanya mengenai produk yang tersedia.",
  );

  const featuredProduct = createPreviewProduct(data.products);
  const heroImage = banner?.image?.secureUrl || "/nexty-showcase/hero-banner.png";
  const heroAlt = banner?.image?.alt || banner?.title || data.settings.businessName;
  const productsForRail = data.products.slice(0, 6);

  return (
    <main className="bg-[#070b14] text-white">
      <section id="beranda" className="px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-12">
        <div className={`mx-auto w-full max-w-[1440px] ${styles.shell}`}>
          <div className={`${styles.panel} ${styles.heroMask} ${styles.gridOverlay} ${styles.noise} ${styles.topGlow} overflow-hidden rounded-[34px]`}>
            <div className="relative grid min-h-[720px] lg:grid-cols-[1.02fr_1.18fr]">
              <div className="relative z-[2] flex flex-col justify-between px-6 py-7 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ea7ff]">
                    <span className="rounded-full border border-[#3b6fff]/30 bg-[#3b6fff]/10 px-3 py-1">Top Up & Game Account</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Manual Order</span>
                  </div>

                  <h1 className={`${styles.heroTitle} mt-7 max-w-[680px] text-[2.8rem] font-black uppercase text-white sm:text-[4rem] lg:text-[4.8rem] xl:text-[5.4rem]`}>
                    {createHeroTitle(data.settings.businessTagline, banner?.title)}
                  </h1>

                  <p className="mt-5 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
                    {banner?.subtitle || data.settings.businessDescription || "Top up game, akun premium, subscription, dan nomor kosong terpercaya dengan proses cepat dan aman."}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href={banner?.ctaUrl || "/#produk"} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3b6fff] px-5 text-sm font-black uppercase tracking-[0.06em] text-white transition hover:bg-[#4c73ff]">
                      {banner?.ctaLabel || "Lihat Produk"}
                    </Link>
                    {generalWhatsappUrl ? (
                      <a
                        href={generalWhatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-5 text-sm font-bold uppercase tracking-[0.06em] text-white/90 transition hover:bg-white/[0.08]"
                      >
                        Cara Pesan
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { value: `${data.categories.length.toString().padStart(2, "0")}`, label: "Kategori Aktif" },
                    { value: `${Math.max(data.products.length, 1).toString().padStart(2, "0")}`, label: "Produk Pilihan" },
                    { value: "1:1", label: "Bantu oleh admin" },
                    { value: "24/7", label: "Tanya ketersediaan" },
                  ].map((item) => (
                    <div key={item.label} className={`${styles.glass} rounded-2xl px-4 py-4`}>
                      <p className="text-2xl font-black text-white">{item.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[460px] lg:min-h-full">
                <Image src={heroImage} alt={heroAlt} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover object-center" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,20,0.94)_0%,rgba(7,11,20,0.58)_24%,rgba(7,11,20,0.18)_44%,rgba(7,11,20,0.56)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,11,20,0)_0%,rgba(7,11,20,0)_24%,rgba(7,11,20,0.24)_62%,rgba(7,11,20,0.74)_100%)]" />
                <div className="absolute bottom-5 left-5 right-5 z-[2] lg:bottom-8 lg:left-auto lg:right-8 lg:w-[360px]">
                  <div className={`${styles.glass} rounded-[26px] p-4 sm:p-5`}>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8ea7ff]">Featured</p>
                    {featuredProduct ? (
                      <div className="mt-3 grid grid-cols-[1fr_84px] gap-4">
                        <div>
                          <h3 className="text-2xl font-black leading-tight text-white">{featuredProduct.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-white/55">Mulai dari</p>
                          <p className="mt-1 text-3xl font-black text-white">{formatRupiah(featuredProduct.discountPrice ?? featuredProduct.price)}</p>
                        </div>
                        <div className={`relative overflow-hidden rounded-2xl ${styles.thumbMask}`}>
                          <Image
                            src={featuredProduct.thumbnail?.secureUrl || "/nexty-showcase/cover-featured.png"}
                            alt={featuredProduct.thumbnail?.alt || featuredProduct.name}
                            fill
                            sizes="84px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-white/60">Produk unggulan akan tampil di sini setelah diisi melalui admin.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px border-t border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { title: "Trusted by", description: "10K+ gamers" },
                { title: "Proses cepat", description: "2-10 menit" },
                { title: "Aman & terpercaya", description: "100% garansi" },
                { title: "Support", description: "Admin siap bantu" },
                { title: "Pembayaran aman", description: "QRIS, transfer, e-wallet" },
              ].map((item) => (
                <div key={item.title} className="bg-[#080d17] px-5 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8ea7ff]">{item.title}</p>
                  <p className="mt-1 text-sm font-semibold text-white/78">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="kategori" className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className={`${styles.panel} ${styles.cut} rounded-[30px] p-5 sm:p-6`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Pilih kategori</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Pilih arena digitalmu.</h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {data.categories.slice(0, 4).map((category, index) => {
                const preview = getCategoryPreview(data, category.id, category.type);
                const count = countProductsByCategory(data.products, category.id);
                const isLarge = index === 0;
                return (
                  <a
                    key={category.id}
                    href="#produk"
                    className={`${styles.tileHover} ${styles.panel} ${styles.thumbMask} relative overflow-hidden rounded-[24px] ${isLarge ? "sm:col-span-2 sm:min-h-[280px]" : "min-h-[220px]"}`}
                  >
                    <Image src={preview} alt={category.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,16,0.14)_0%,rgba(5,8,16,0.28)_30%,rgba(5,8,16,0.84)_100%)]" />
                    <div className="absolute inset-0 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/85">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#8ea7ff]">
                          {count} produk
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8ea7ff]">{typeLabels[category.type]}</p>
                        <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-[1.8rem]">{category.name}</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-white/60">{category.description || "Klik untuk melihat produk di kategori ini."}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <a href="#produk" className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-black uppercase tracking-[0.08em] text-white/86 transition hover:bg-white/[0.07]">
              Lihat semua kategori
            </a>
          </div>

          <div className="grid gap-4">
            <div className={`${styles.panel} ${styles.cut} rounded-[30px] p-5 sm:p-6`}>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">
                <span>Produk pilihan</span>
              </div>
              {featuredProduct ? (
                <div className="mt-4 grid gap-4">
                  <div className={`relative min-h-[330px] overflow-hidden rounded-[26px] ${styles.thumbMask}`}>
                    <Image
                      src={featuredProduct.thumbnail?.secureUrl || "/nexty-showcase/cover-featured.png"}
                      alt={featuredProduct.thumbnail?.alt || featuredProduct.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 38vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,18,0.1),rgba(8,10,18,0.82)_82%)]" />
                    <div className="absolute inset-x-5 bottom-5">
                      <h3 className="max-w-[70%] text-3xl font-black leading-tight text-white">{featuredProduct.name}</h3>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-white/45">Mulai dari</p>
                          <p className="text-3xl font-black text-white">{formatRupiah(featuredProduct.discountPrice ?? featuredProduct.price)}</p>
                        </div>
                        {generalWhatsappUrl ? (
                          <a
                            href={createWhatsAppUrl(
                              data.settings.whatsappNumber,
                              featuredProduct.whatsappMessage || data.settings.whatsappMessageTemplate,
                              {
                                name: featuredProduct.name,
                                code: featuredProduct.code,
                                price: featuredProduct.discountPrice ?? featuredProduct.price,
                              },
                            ) || generalWhatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#3b6fff] px-4 text-sm font-black text-white"
                          >
                            Pesan Sekarang
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/60">Produk unggulan akan tampil otomatis dari data admin.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_0.88fr]">
              <div className={`${styles.panel} ${styles.cut} rounded-[28px] p-5`}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Kenapa pilih kami?</p>
                <div className="mt-4 space-y-4">
                  {[
                    ["Harga terbaik", "Harga bersaing dan transparan"],
                    ["Proses cepat", "Dibantu admin dengan alur jelas"],
                    ["Aman & terpercaya", "Detail pesanan dikonfirmasi sebelum proses"],
                    ["Support 24/7", "Siap menjawab saat kamu butuh bantuan"],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="font-black text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.panel} ${styles.cut} relative overflow-hidden rounded-[28px]`}>
                <Image src="/nexty-showcase/promo-banner.png" alt="Promo spesial" fill sizes="(max-width: 1024px) 100vw, 28vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,20,0.12),rgba(8,11,20,0.86)_100%)]" />
                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Promo spesial</p>
                  <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-white">20% OFF</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Gunakan area ini untuk banner promo dinamis dari admin atau penawaran pilihan.</p>
                  <a href="#produk" className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#3b6fff] px-4 text-sm font-black text-white">
                    Lihat Promo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="produk" className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className={`${styles.panel} ${styles.cut} mx-auto w-full max-w-[1440px] rounded-[30px] p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Produk populer</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Ready for your next play.</h2>
            </div>
            <a href="#kontak" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-black uppercase tracking-[0.06em] text-white/85">
              Tanya ketersediaan
            </a>
          </div>

          {productsForRail.length > 0 ? (
            <div className={`${styles.productRail} mt-6 flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]`}>
              {productsForRail.map((product, index) => {
                const categoryName = data.categories.find((item) => item.id === product.categoryId)?.name || typeLabels[product.type];
                const finalPrice = product.discountPrice ?? product.price;
                const whatsappUrl = createWhatsAppUrl(
                  data.settings.whatsappNumber,
                  product.whatsappMessage || data.settings.whatsappMessageTemplate,
                  { name: product.name, code: product.code, price: finalPrice },
                );
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryName}
                    whatsappUrl={whatsappUrl}
                    fallbackImage={getProductFallback(index)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-6 py-14 text-center text-white/60">
              Belum ada produk yang dipublikasikan. Setelah admin mengisi data, kartu produk akan tampil otomatis di section ini.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className={`${styles.panel} ${styles.cut} mx-auto grid w-full max-w-[1440px] gap-px overflow-hidden rounded-[30px] border border-white/8 bg-white/8 lg:grid-cols-4`}>
          {[
            ["100% legal", "Produk resmi & aman"],
            ["Proses terarah", "Top up instan atau manual"],
            ["Pembayaran aman", "QRIS, transfer, e-wallet"],
            ["Garansi", "Dibantu jika terjadi kendala"],
          ].map(([title, desc]) => (
            <div key={title} className="bg-[#080d17] px-5 py-5">
              <p className="text-sm font-black uppercase tracking-[0.06em] text-white">{title}</p>
              <p className="mt-1 text-sm text-white/58">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cara-pesan" className="bg-[#eef2f8] px-4 py-8 text-[#0c1424] sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <div className={`${styles.panelLight} ${styles.cut} rounded-[30px] p-6 sm:p-8`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6fff]">Quick protocol</p>
            <h2 className="mt-3 max-w-lg text-[2.35rem] font-black leading-[0.96] tracking-[-0.05em] text-[#0c1424] sm:text-[3.2rem]">
              Simple flow. Human support.
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-[#25314a]/72">
              Tidak ada transaksi yang membingungkan. Pilih produk, kirim detail via WhatsApp, lalu admin membantu proses berikutnya.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ["01", "Pilih produk", "Jelajahi katalog dan temukan produk yang sesuai kebutuhanmu."],
              ["02", "Periksa detail", "Baca informasi harga, ketersediaan, dan catatan produk."],
              ["03", "Kirim ke admin", "Tombol pemesanan otomatis membawa konteks produk ke WhatsApp."],
              ["04", "Konfirmasi proses", "Admin memproses pesanan dan memastikan detailnya sesuai."],
            ].map(([number, title, description]) => (
              <div key={number} className={`${styles.panelLight} ${styles.cut} rounded-[26px] p-5 sm:p-6`}>
                <div className="grid gap-3 sm:grid-cols-[84px_1fr_36px] sm:items-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6fff]">{number}</p>
                  <div>
                    <p className="text-2xl font-black text-[#0c1424]">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#25314a]/70">{description}</p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-[#0c1424]/10 text-[#3b6fff]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`${styles.panel} ${styles.cut} rounded-[30px] p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Testimoni</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Real feedback. No scripted hype.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(data.testimonials.length > 0 ? data.testimonials.slice(0, 2) : [null, null]).map((testimonial, index) => {
                if (!testimonial) {
                  return (
                    <div key={`empty-${index}`} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <RatingStars rating={5} />
                      <p className="mt-4 text-base leading-8 text-white/70">“Tampilan testimoni akan muncul otomatis setelah admin menambahkan data pelanggan.”</p>
                      <p className="mt-6 text-sm font-black text-white">Calon pelanggan</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-white/35">Placeholder</p>
                    </div>
                  );
                }

                const item = getTestimonialData(testimonial);
                return (
                  <div key={testimonial.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                    <RatingStars rating={item.rating} />
                    <p className="mt-4 text-base leading-8 text-white/70">“{item.quote}”</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-[#0f1730] text-sm font-black text-white">
                        {(item.customerName || "P").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-white">{item.customerName}</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/35">{item.customerRole || "Pelanggan"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="faq" className={`${styles.panel} ${styles.cut} rounded-[30px] p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">FAQ</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Need intel?</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                {(data.faqs.length > 0
                  ? data.faqs.slice(0, 4).map((faq) => getFaqData(faq))
                  : [
                      { question: "Bagaimana cara melakukan pemesanan?", answer: "Pilih produk lalu klik tombol pesan untuk diarahkan ke admin via WhatsApp." },
                      { question: "Apakah pembayaran dilakukan melalui website?", answer: "Tidak. Konfirmasi pembayaran dibantu langsung oleh admin." },
                      { question: "Berapa lama proses pemesanan?", answer: "Tergantung jenis produk dan ketersediaannya. Admin akan memberi estimasi proses." },
                      { question: "Apakah produk aman dan legal?", answer: "Setiap produk dapat dijelaskan lebih dulu oleh admin sebelum transaksi dilakukan." },
                    ]).map((faq, index) => (
                  <details key={`${faq.question}-${index}`} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4" open={index === 0}>
                    <summary className="cursor-pointer list-none text-sm font-black text-white">{faq.question}</summary>
                    <p className="pt-3 text-sm leading-7 text-white/58">{faq.answer}</p>
                  </details>
                ))}
              </div>

              <div className={`relative hidden overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1323] lg:block ${styles.thumbMask}`}>
                <Image src="/nexty-showcase/faq-core.png" alt="FAQ illustration" fill sizes="220px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,20,0.08),rgba(8,11,20,0.55)_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6">
        <div className={`${styles.panel} ${styles.cut} mx-auto overflow-hidden rounded-[30px]`}>
          <div className="mx-auto grid min-h-[290px] w-full max-w-[1440px] items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Final engagement</p>
              <h2 className="mt-3 max-w-3xl text-[2.4rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[3.4rem]">
                Sudah menemukan produk yang tepat?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                Kirim detail produk ke admin untuk mengecek ketersediaan dan melanjutkan proses transaksi.
              </p>
            </div>
            {generalWhatsappUrl ? (
              <a
                href={generalWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3b6fff] px-5 text-sm font-black uppercase tracking-[0.06em] text-white"
              >
                Lihat kontak
              </a>
            ) : (
              <a href="#kontak" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3b6fff] px-5 text-sm font-black uppercase tracking-[0.06em] text-white">
                Lihat kontak
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
