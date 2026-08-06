"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "@/components/public/game-commerce.module.css";

type SiteHeaderProps = {
  businessName: string;
  whatsappUrl: string | null;
};

const navigationItems = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Kategori", href: "/#kategori" },
  { label: "Produk", href: "/#produk" },
  { label: "Cara Pesan", href: "/#cara-pesan" },
  { label: "Tentang Kami", href: "/about" },
  { label: "FAQ", href: "/#faq" },
];

function createInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DP";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

export function SiteHeader({ businessName, whatsappUrl }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060913]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className={`relative flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-[#0d1530] text-sm font-black text-white ${styles.softRing}`}>
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,111,255,0.45),transparent_55%)]" />
              <span className="relative z-[1]">{createInitials(businessName)}</span>
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-black uppercase tracking-[0.04em] text-white sm:text-base">
                {businessName}
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea7ff] sm:text-[11px]">
                Digital Product Store
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden h-11 items-center justify-center rounded-xl bg-[#3b6fff] px-4 text-sm font-bold text-white transition hover:bg-[#5077ff] sm:inline-flex"
              >
                Chat Admin
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMenuOpen ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="m6 6 12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-[#04070f]/84 backdrop-blur-md lg:hidden">
          <div className="mx-4 mt-24 rounded-[28px] border border-white/10 bg-[#0b101d] p-4 shadow-2xl shadow-black/40 sm:mx-6">
            <nav className="grid gap-2">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80"
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8ea7ff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </nav>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#3b6fff] px-4 text-sm font-bold text-white"
              >
                Hubungi Admin
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
