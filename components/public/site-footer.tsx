import Link from "next/link";

import styles from "@/components/public/game-store.module.css";
import type { SiteSettings } from "@/features/settings/settings.types";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type SiteFooterProps = {
  settings: SiteSettings;
};

function createInitials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "GS"
  );
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const whatsappUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Halo Admin, saya ingin bertanya mengenai produk yang tersedia.",
  );

  const socialLinks = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "TikTok", href: settings.tiktokUrl },
    { label: "Facebook", href: settings.facebookUrl },
    { label: "YouTube", href: settings.youtubeUrl },
  ].filter(
    (item): item is { label: string; href: string } => Boolean(item.href),
  );

  return (
    <footer id="kontak" className={`${styles.shell} bg-[#06080d] px-4 pb-4 text-white sm:px-6 sm:pb-6 lg:px-8 lg:pb-8`}>
      <div className="mx-auto w-full max-w-[1480px] overflow-hidden border border-white/10 bg-[#0d1119]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12 xl:p-14">
            <div className={`${styles.blueprint} pointer-events-none absolute inset-0 opacity-45`} />
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-[#356df3]/20 blur-[100px]" />

            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-3.5">
                <span className={`${styles.cutPanel} relative flex size-12 items-center justify-center bg-[#356df3] text-sm font-black text-white`}>
                  {createInitials(settings.businessName)}
                  <span className="absolute bottom-1 right-1 size-1.5 bg-white/80" />
                </span>
                <span>
                  <span className="block text-base font-black tracking-[-0.025em]">
                    {settings.businessName}
                  </span>
                  <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.21em] text-white/30">
                    Digital game market
                  </span>
                </span>
              </Link>

              <h2 className="mt-12 max-w-3xl text-4xl font-black leading-[0.9] tracking-[-0.065em] sm:text-5xl lg:text-6xl">
                Your digital loadout starts here.
              </h2>

              <p className="mt-7 max-w-2xl text-sm leading-7 text-white/43 sm:text-base sm:leading-8">
                {settings.businessDescription || settings.businessTagline}
              </p>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex h-[52px] min-w-52 items-center justify-between bg-white px-5 text-xs font-black uppercase tracking-[0.09em] text-[#06080d] transition hover:bg-[#9eb8ff]"
                >
                  Start conversation
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b border-white/10 p-6 sm:border-r sm:p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.21em] text-[#9eb8ff]">
                Navigation / 01
              </p>
              <div className="mt-7 grid gap-4">
                <Link href="/#kategori" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Kategori
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/#produk" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Katalog Produk
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/#cara-pesan" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Cara Pemesanan
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/about" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Tentang Kami
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <div className="border-b border-white/10 p-6 sm:p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.21em] text-[#9eb8ff]">
                Information / 02
              </p>
              <div className="mt-7 grid gap-4">
                <Link href="/terms" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Syarat & Ketentuan
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/privacy" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  Kebijakan Privasi
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/#faq" className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white">
                  FAQ
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <div className="p-6 sm:border-r sm:p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.21em] text-[#9eb8ff]">
                Contact / 03
              </p>
              <div className="mt-7 space-y-4">
                {settings.email ? (
                  <a href={`mailto:${settings.email}`} className="block break-all text-sm font-bold leading-6 text-white/52 transition hover:text-white">
                    {settings.email}
                  </a>
                ) : null}
                {settings.address ? (
                  <p className="text-sm leading-7 text-white/38">{settings.address}</p>
                ) : null}
                {settings.operatingHours ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-white/38">
                    {settings.operatingHours}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.21em] text-[#9eb8ff]">
                Social / 04
              </p>
              {socialLinks.length > 0 ? (
                <div className="mt-7 grid gap-4">
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-sm font-bold text-white/48 transition hover:text-white"
                    >
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-7 text-sm leading-7 text-white/32">
                  Media sosial belum ditambahkan.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 text-[9px] font-black uppercase tracking-[0.16em] text-white/23 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {new Date().getFullYear()} {settings.businessName}</p>
          <p>Manual order system / Admin assisted</p>
        </div>
      </div>
    </footer>
  );
}
