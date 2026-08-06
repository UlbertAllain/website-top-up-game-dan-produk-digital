"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/features/auth/logout-button";

type AdminShellProps = {
  children: ReactNode;
  adminEmail: string | null;
  businessName: string;
};

type IconName =
  | "dashboard"
  | "products"
  | "categories"
  | "banner"
  | "faq"
  | "testimonial"
  | "pages"
  | "settings";

type NavigationItem = {
  label: string;
  href: string;
  icon: IconName;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Utama",

    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "dashboard",
      },
    ],
  },

  {
    label: "Katalog",

    items: [
      {
        label: "Produk",
        href: "/admin/products",
        icon: "products",
      },

      {
        label: "Kategori",
        href: "/admin/categories",
        icon: "categories",
      },
    ],
  },

  {
    label: "Konten",

    items: [
      {
        label: "Banner",
        href: "/admin/content/banner",
        icon: "banner",
      },

      {
        label: "FAQ",
        href: "/admin/content/faq",
        icon: "faq",
      },

      {
        label: "Testimoni",
        href: "/admin/content/testimonials",
        icon: "testimonial",
      },

      {
        label: "Halaman Informasi",
        href: "/admin/pages",
        icon: "pages",
      },
    ],
  },

  {
    label: "Sistem",

    items: [
      {
        label: "Pengaturan",
        href: "/admin/settings",
        icon: "settings",
      },
    ],
  },
];

const pageDescriptions: Record<string, string> = {
  "/admin": "Ringkasan katalog dan konten website.",

  "/admin/products": "Kelola seluruh produk digital.",

  "/admin/categories": "Kelola kategori layanan.",

  "/admin/content/banner": "Kelola banner promosi website.",

  "/admin/content/faq": "Kelola pertanyaan yang sering diajukan.",

  "/admin/content/testimonials": "Kelola testimoni pelanggan.",

  "/admin/pages": "Kelola halaman informasi website.",

  "/admin/settings": "Kelola identitas bisnis dan WhatsApp.",
};

function AdminIcon({ name }: { name: IconName }) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: "size-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
      );

    case "products":
      return (
        <svg {...commonProps}>
          <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" />
          <path d="m4 12 8 4.5 8-4.5" />
          <path d="m4 16.5 8 4.5 8-4.5" />
        </svg>
      );

    case "categories":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <path d="M14 17.5h7" />
        </svg>
      );

    case "banner":
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m7 15 3-3 2.5 2.5L16 11l3 4" />
          <path d="M8 9h.01" />
        </svg>
      );

    case "faq":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 1.7-2.4 2-2.4 3.5" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "testimonial":
      return (
        <svg {...commonProps}>
          <path d="M7 8h10" />
          <path d="M7 12h6" />
          <path d="M6 19 3 21v-4a9 9 0 1 1 3 2Z" />
        </svg>
      );

    case "pages":
      return (
        <svg {...commonProps}>
          <path d="M6 3h9l3 3v15H6V3Z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );
  }
}

function isNavigationActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentNavigationItem(pathname: string) {
  const allItems = navigationGroups.flatMap((group) => group.items);

  return (
    allItems
      .filter((item) => isNavigationActive(pathname, item.href))
      .sort((first, second) => second.href.length - first.href.length)[0] ??
    allItems[0]
  );
}

function createBrandInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "DS";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function AdminShell({
  children,
  adminEmail,
  businessName,
}: AdminShellProps) {
  const pathname = usePathname();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const currentItem = getCurrentNavigationItem(pathname);

  const adminInitial = adminEmail?.charAt(0).toUpperCase() ?? "A";

  const brandInitials = createBrandInitials(businessName);

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  const sidebarContent = (
    <>
      <div
        className={[
          "flex h-20 items-center border-b border-neutral-200",
          isDesktopCollapsed ? "justify-center px-3" : "justify-between px-5",
        ].join(" ")}
      >
        <Link
          href="/admin"
          onClick={closeMobileSidebar}
          className="flex min-w-0 items-center gap-3"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white">
            {brandInitials}
          </span>

          {!isDesktopCollapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-neutral-950">
                {businessName}
              </span>

              <span className="mt-0.5 block text-xs text-neutral-500">
                Admin Panel
              </span>
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={closeMobileSidebar}
          className="flex size-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          aria-label="Tutup menu"
        >
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
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            {!isDesktopCollapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {group.label}
              </p>
            ) : null}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isNavigationActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    title={isDesktopCollapsed ? item.label : undefined}
                    className={[
                      "flex items-center rounded-xl text-sm font-medium transition",
                      isDesktopCollapsed
                        ? "justify-center px-3 py-3"
                        : "gap-3 px-3 py-2.5",

                      active
                        ? "bg-neutral-950 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <AdminIcon name={item.icon} />

                    {!isDesktopCollapsed ? (
                      <span className="truncate">{item.label}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        {!isDesktopCollapsed ? (
          <div className="mb-2 rounded-xl bg-neutral-50 px-3 py-3">
            <p className="truncate text-xs font-medium text-neutral-800">
              {adminEmail ?? "Administrator"}
            </p>

            <p className="mt-1 text-[11px] text-neutral-500">
              Akses administrator
            </p>
          </div>
        ) : null}

        <LogoutButton collapsed={isDesktopCollapsed} />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white transition-[width,transform] duration-200",
          "w-[280px]",

          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",

          "lg:translate-x-0",

          isDesktopCollapsed ? "lg:w-[84px]" : "lg:w-[260px]",
        ].join(" ")}
      >
        {sidebarContent}
      </aside>

      <div
        className={[
          "min-h-screen transition-[margin] duration-200",
          isDesktopCollapsed ? "lg:ml-[84px]" : "lg:ml-[260px]",
        ].join(" ")}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 lg:hidden"
              aria-label="Buka menu"
            >
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
            </button>

            <button
              type="button"
              onClick={() => setIsDesktopCollapsed((current) => !current)}
              className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 lg:flex"
              aria-label={
                isDesktopCollapsed ? "Perbesar sidebar" : "Ciutkan sidebar"
              }
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={[
                  "size-5 transition-transform",
                  isDesktopCollapsed ? "rotate-180" : "",
                ].join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-950">
                {currentItem.label}
              </p>

              <p className="mt-0.5 hidden truncate text-xs text-neutral-500 sm:block">
                {pageDescriptions[currentItem.href] ??
                  "Kelola website dan katalog."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 sm:flex"
            >
              Buka website
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 5h5v5" />
                <path d="m10 14 9-9" />
                <path d="M19 13v6H5V5h6" />
              </svg>
            </Link>

            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
              {adminInitial}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
