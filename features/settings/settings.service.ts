import "server-only";

import {
  getSiteSettingsDocument,
  saveSiteSettingsDocument,
} from "@/features/settings/settings.repository";
import { siteSettingsSchema } from "@/features/settings/settings.schema";
import {
  SITE_SETTINGS_DOCUMENT_ID,
  type SiteSettings,
  type SiteSettingsInput,
} from "@/features/settings/settings.types";

const DEFAULT_SETTINGS: SiteSettingsInput = {
  businessName: "Digital Product Store",

  businessTagline: "Kebutuhan digital lebih mudah ditemukan.",

  businessDescription:
    "Katalog produk digital yang menyediakan top up game, akun game, aplikasi premium, dan nomor kosong.",

  whatsappNumber: "",

  whatsappMessageTemplate:
    "Halo Admin, saya tertarik dengan {productName} dengan kode {productCode}. Apakah produknya masih tersedia?",

  email: "",
  address: "",

  operatingHours: "Senin–Minggu, 09.00–22.00 WIB",

  instagramUrl: "",
  tiktokUrl: "",
  facebookUrl: "",
  youtubeUrl: "",

  seoTitle: "Digital Product Store",

  seoDescription:
    "Temukan top up game, akun game, aplikasi premium, dan berbagai kebutuhan digital dengan proses pemesanan yang mudah.",

  seoKeywords: [
    "produk digital",
    "top up game",
    "akun game",
    "aplikasi premium",
  ],
};

function normalizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

function normalizeKeywords(keywords: string[]): string[] {
  const uniqueKeywords = new Map<string, string>();

  for (const keyword of keywords) {
    const normalized = keyword.trim().replace(/\s+/g, " ");

    if (!normalized) {
      continue;
    }

    uniqueKeywords.set(normalized.toLocaleLowerCase("id-ID"), normalized);
  }

  return Array.from(uniqueKeywords.values()).slice(0, 20);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapSiteSettings(
  document: Awaited<ReturnType<typeof getSiteSettingsDocument>>,
): SiteSettings {
  const now = new Date().toISOString();

  return {
    id: SITE_SETTINGS_DOCUMENT_ID,

    businessName: readString(
      document?.businessName,
      DEFAULT_SETTINGS.businessName,
    ),

    businessTagline: readString(
      document?.businessTagline,
      DEFAULT_SETTINGS.businessTagline,
    ),

    businessDescription: readString(
      document?.businessDescription,
      DEFAULT_SETTINGS.businessDescription,
    ),

    whatsappNumber: readString(
      document?.whatsappNumber,
      DEFAULT_SETTINGS.whatsappNumber,
    ),

    whatsappMessageTemplate: readString(
      document?.whatsappMessageTemplate,
      DEFAULT_SETTINGS.whatsappMessageTemplate,
    ),

    email: readString(document?.email, DEFAULT_SETTINGS.email),

    address: readString(document?.address, DEFAULT_SETTINGS.address),

    operatingHours: readString(
      document?.operatingHours,
      DEFAULT_SETTINGS.operatingHours,
    ),

    instagramUrl: readString(
      document?.instagramUrl,
      DEFAULT_SETTINGS.instagramUrl,
    ),

    tiktokUrl: readString(document?.tiktokUrl, DEFAULT_SETTINGS.tiktokUrl),

    facebookUrl: readString(
      document?.facebookUrl,
      DEFAULT_SETTINGS.facebookUrl,
    ),

    youtubeUrl: readString(document?.youtubeUrl, DEFAULT_SETTINGS.youtubeUrl),

    seoTitle: readString(document?.seoTitle, DEFAULT_SETTINGS.seoTitle),

    seoDescription: readString(
      document?.seoDescription,
      DEFAULT_SETTINGS.seoDescription,
    ),

    seoKeywords: normalizeKeywords(
      readStringArray(document?.seoKeywords, DEFAULT_SETTINGS.seoKeywords),
    ),

    createdAt: readString(document?.createdAt, now),

    updatedAt: readString(document?.updatedAt, now),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const document = await getSiteSettingsDocument();

  return mapSiteSettings(document);
}

export async function updateSiteSettings(
  input: unknown,
): Promise<SiteSettings> {
  const parsed = siteSettingsSchema.parse(input);

  const normalizedSettings: SiteSettingsInput = {
    ...parsed,

    whatsappNumber: normalizeWhatsappNumber(parsed.whatsappNumber),

    seoKeywords: normalizeKeywords(parsed.seoKeywords),
  };

  const saved = await saveSiteSettingsDocument(normalizedSettings);

  return {
    id: SITE_SETTINGS_DOCUMENT_ID,
    ...normalizedSettings,
    createdAt: saved.createdAt,
    updatedAt: saved.updatedAt,
  };
}
