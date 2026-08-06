export const CONTENT_KINDS = ["banner", "faq", "testimonial"] as const;

export const CONTENT_STATUSES = ["draft", "published", "hidden"] as const;

export const CONTENT_PAGE_SLUGS = [
  "about",
  "how-to-order",
  "terms",
  "privacy",
] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export type ContentMedia = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  alt: string;
};

export type BannerContentData = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  image: ContentMedia | null;
};

export type FaqContentData = {
  question: string;
  answer: string;
};

export type TestimonialContentData = {
  customerName: string;
  customerRole: string;
  quote: string;
  rating: number;
  avatar: ContentMedia | null;
};

export type ContentItemData =
  | BannerContentData
  | FaqContentData
  | TestimonialContentData;

export type ContentItem = {
  id: string;
  kind: ContentKind;
  status: ContentStatus;
  order: number;
  data: ContentItemData;
  createdAt: string;
  updatedAt: string;
};

export type NewContentItemRecord = {
  id: string;
  kind: ContentKind;
  status: ContentStatus;
  order: number;
  data: ContentItemData;
};

export type UpdateContentItemRecord = {
  status?: ContentStatus;
  order?: number;
  data?: ContentItemData;
};

export type ContentItemFilters = {
  status?: ContentStatus;
};

export type ContentPageInput = {
  title: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
};

export type ContentPage = ContentPageInput & {
  id: ContentPageSlug;
  slug: ContentPageSlug;
  updatedAt: string | null;
};

export const DEFAULT_CONTENT_PAGES: Record<ContentPageSlug, ContentPage> = {
  about: {
    id: "about",
    slug: "about",
    title: "Tentang Kami",
    excerpt: "Kenali lebih dekat bisnis dan layanan yang kami sediakan.",
    content:
      "Kami menyediakan berbagai produk dan layanan digital yang dapat dipesan dengan mudah melalui WhatsApp. Setiap pertanyaan dan proses pemesanan akan dilayani langsung oleh admin.",
    status: "draft",
    updatedAt: null,
  },

  "how-to-order": {
    id: "how-to-order",
    slug: "how-to-order",
    title: "Cara Pemesanan",
    excerpt: "Panduan singkat untuk melakukan pemesanan produk.",
    content: [
      "1. Pilih produk yang diinginkan.",
      "2. Baca detail, harga, dan ketentuan produk.",
      "3. Tekan tombol pesan melalui WhatsApp.",
      "4. Konfirmasikan ketersediaan produk kepada admin.",
      "5. Ikuti petunjuk pembayaran dan proses yang diberikan admin.",
    ].join("\n"),
    status: "draft",
    updatedAt: null,
  },

  terms: {
    id: "terms",
    slug: "terms",
    title: "Syarat dan Ketentuan",
    excerpt: "Ketentuan penggunaan layanan dan pemesanan produk.",
    content:
      "Pelanggan wajib membaca detail produk sebelum melakukan pembayaran. Proses, estimasi waktu, garansi, dan ketentuan lainnya dapat berbeda pada setiap produk dan akan dikonfirmasi oleh admin.",
    status: "draft",
    updatedAt: null,
  },

  privacy: {
    id: "privacy",
    slug: "privacy",
    title: "Kebijakan Privasi",
    excerpt: "Informasi mengenai penggunaan data pelanggan.",
    content:
      "Data yang diberikan pelanggan hanya digunakan untuk membantu proses komunikasi dan pemesanan. Kami tidak menjual atau membagikan data pelanggan kepada pihak lain tanpa alasan yang sah.",
    status: "draft",
    updatedAt: null,
  },
};
