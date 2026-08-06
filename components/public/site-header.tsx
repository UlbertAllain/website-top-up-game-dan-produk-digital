"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "@/components/public/game-store.module.css";

type SiteHeaderProps = {
  businessName: string;
  whatsappUrl: string | null;
};

const navigationItems = [
  { label: "Home", href: "/#beranda" },
  { label: "Kategori", href: "/#kategori" },
  { label: "Katalog", href: "/#produk" },
  { label: "Cara Pesan", href: "/#cara-pesan" },
  { label: "Tentang", href: "/about" },
  { label: "FAQ", href: "/#faq" },
];

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

export function SiteHeader({ businessName, whatsappUrl }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`${styles.shell} fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-white/10 bg-[#06080d]/95 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            : "border-white/[0.07] bg-[#06080d]/72 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[78px] w-full max-w-[1480px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3.5 pr-5">
            <span className={`${styles.cutPanel} relative flex size-11 shrink-0 items-center justify-center overflow-hidden bg-[#356df3] text-sm font-black tracking-[-0.05em] text-white`}>
              {createInitials(businessName)}
              <span className="absolute bottom-1 right-1 size-1.5 bg-white/80" />
            </span>

            <span className="min-w-0">
              <span className="block max-w-48 truncate text-sm font-black tracking-[-0.025em] text-white sm:max-w-64">
                {businessName}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span className="size-1.5 rounded-full bg-[#9eb8ff]" />
                Digital Game Market
              </span>
            </span>
          </Link>

          <div className="hidden h-8 w-px bg-white/10 xl:block" />

          <nav className="ml-5 hidden flex-1 items-center gap-0.5 xl:flex">
            {navigationItems.map((item) => {
              const isActive =
                item.href.startsWith("/about") && pathname.startsWith("/about");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-3.5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] transition ${
                    isActive ? "text-white" : "text-white/48 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3.5 bottom-1 h-px bg-[#356df3] transition-transform ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden items-center gap-2 border-r border-white/10 pr-4 lg:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9eb8ff] opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-[#9eb8ff]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Catalog online
              </span>
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={`${styles.cutPanel} hidden h-11 items-center gap-4 bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[#06080d] transition hover:bg-[#9eb8ff] sm:inline-flex`}
              >
                Hubungi Admin
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}

            <button
              type="button"
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current: boolean) => !current)}
              className="flex size-11 items-center justify-center border border-white/12 bg-white/[0.045] text-white transition hover:border-[#356df3]/60 hover:bg-[#356df3]/15 xl:hidden"
            >
              {isMenuOpen ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
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
        <div className="fixed inset-0 z-40 bg-[#06080d]/96 px-4 pb-5 pt-[94px] backdrop-blur-xl xl:hidden">
          <div className={`${styles.blueprint} pointer-events-none absolute inset-0 opacity-60`} />

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0"
          />

          <div className="relative mx-auto grid h-full max-h-[760px] w-full max-w-[1480px] overflow-hidden border border-white/10 bg-[#0d1119] md:grid-cols-[1fr_330px]">
            <nav className="grid content-start divide-y divide-white/10 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="divide-y divide-white/10">
                {navigationItems.slice(0, 3).map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex min-h-28 items-end justify-between p-5 transition hover:bg-[#356df3] sm:p-7"
                  >
                    <span className="text-xl font-black tracking-[-0.035em] text-white">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-black tracking-[0.18em] text-white/25 group-hover:text-white/60">
                      0{index + 1}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="divide-y divide-white/10 border-t border-white/10 md:border-t-0">
                {navigationItems.slice(3).map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex min-h-28 items-end justify-between p-5 transition hover:bg-[#356df3] sm:p-7"
                  >
                    <span className="text-xl font-black tracking-[-0.035em] text-white">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-black tracking-[0.18em] text-white/25 group-hover:text-white/60">
                      0{index + 4}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>

            <aside className="relative overflow-hidden border-t border-white/10 bg-[#111827] p-6 md:border-l md:border-t-0 sm:p-8">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#356df3]/30 blur-[80px]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9eb8ff]">
                    Support channel
                  </p>
                  <h2 className="mt-5 text-3xl font-black leading-[0.95] tracking-[-0.055em] text-white">
                    Temukan produk. Konfirmasi. Main.
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-white/45">
                    Admin membantu memeriksa stok, harga, dan detail pesanan secara langsung.
                  </p>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 flex h-12 items-center justify-between bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[#06080d]"
                  >
                    Buka WhatsApp
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </>
  );
}
