import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteSettings } from "@/features/settings/settings.service";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type PublicLayoutProps = {
  children: ReactNode;
};

function getMetadataBase(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Gunakan fallback.
    }
  }

  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: getMetadataBase(),

    title: {
      default: settings.seoTitle,

      template: `%s | ${settings.businessName}`,
    },

    description: settings.seoDescription,

    keywords: settings.seoKeywords,

    openGraph: {
      type: "website",
      locale: "id_ID",

      siteName: settings.businessName,

      title: settings.seoTitle,

      description: settings.seoDescription,
    },

    twitter: {
      card: "summary_large_image",

      title: settings.seoTitle,

      description: settings.seoDescription,
    },
  };
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const settings = await getSiteSettings();

  const whatsappUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Halo Admin, saya ingin bertanya mengenai produk yang tersedia.",
  );

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <SiteHeader
        businessName={settings.businessName}
        whatsappUrl={whatsappUrl}
      />

      {children}

      <SiteFooter settings={settings} />
    </div>
  );
}
