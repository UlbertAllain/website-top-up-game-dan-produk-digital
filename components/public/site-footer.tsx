import Link from "next/link";

import styles from "@/components/public/game-commerce.module.css";
import type { SiteSettings } from "@/features/settings/settings.types";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type SiteFooterProps = {
  settings: SiteSettings;
};

function createInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DP";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
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
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer id="kontak" className="bg-[#070b14] px-4 pb-10 sm:px-6 lg:px-8">
      <div className={`${styles.panel} ${styles.cut} mx-auto w-full max-w-[1440px] rounded-[30px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10`}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.95fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#0f1730] text-sm font-black text-white">
                {createInitials(settings.businessName)}
              </span>
              <span>
                <span className="block text-base font-black uppercase tracking-[0.04em] text-white">{settings.businessName}</span>
                <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea7ff]">
                  Digital Product Store
                </span>
              </span>
            </Link>

            <h2 className="mt-8 max-w-sm text-[2.1rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[2.8rem]">
              Your digital loadout starts here.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
              {settings.businessDescription || "Katalog produk digital yang menyediakan top up game, akun game, aplikasi premium, dan nomor kosong."}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Navigasi</p>
            <div className="mt-5 grid gap-3">
              <Link href="/#kategori" className="text-sm text-white/68 transition hover:text-white">Kategori</Link>
              <Link href="/#produk" className="text-sm text-white/68 transition hover:text-white">Katalog Produk</Link>
              <Link href="/about" className="text-sm text-white/68 transition hover:text-white">Cara Pemesanan</Link>
              <Link href="/#faq" className="text-sm text-white/68 transition hover:text-white">Tentang Kami</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Informasi</p>
            <div className="mt-5 grid gap-3">
              <Link href="/about" className="text-sm text-white/68 transition hover:text-white">Tentang Kami</Link>
              <Link href="/privacy" className="text-sm text-white/68 transition hover:text-white">Kebijakan Privasi</Link>
              <Link href="/terms" className="text-sm text-white/68 transition hover:text-white">FAQ</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">Kontak</p>
            <div className="mt-5 space-y-3 text-sm text-white/68">
              {settings.email ? <a href={`mailto:${settings.email}`} className="block transition hover:text-white">{settings.email}</a> : null}
              {settings.address ? <p>{settings.address}</p> : null}
              {settings.operatingHours ? <p className="whitespace-pre-line">{settings.operatingHours}</p> : null}
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-[#3b6fff] px-4 text-sm font-black text-white">
                  Chat Admin
                </a>
              ) : null}
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <p>Pemesanan diproses secara manual melalui admin.</p>
        </div>
      </div>
    </footer>
  );
}
