import { z } from "zod";

import {
  CONTENT_KINDS,
  CONTENT_PAGE_SLUGS,
  CONTENT_STATUSES,
  type ContentItemData,
  type ContentKind,
  type ContentStatus,
} from "@/features/content/content.types";

const contentOrderSchema = z
  .number({
    message: "Urutan harus berupa angka.",
  })
  .int("Urutan harus berupa bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(9999, "Urutan maksimal 9999.");

const contentStatusSchema = z.enum(CONTENT_STATUSES, {
  message: "Status konten tidak valid.",
});

function isValidContentUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const contentUrlSchema = z
  .string()
  .trim()
  .max(500, "Alamat tujuan maksimal 500 karakter.")
  .refine(
    isValidContentUrl,
    "Alamat tujuan harus berupa path internal atau URL yang valid.",
  );

export const contentKindSchema = z.enum(CONTENT_KINDS, {
  message: "Jenis konten tidak valid.",
});

export const contentIdSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "ID konten tidak valid.",
  );

export const contentPageSlugSchema = z.enum(CONTENT_PAGE_SLUGS, {
  message: "Halaman CMS tidak valid.",
});

export const contentFilterSchema = z.strictObject({
  status: contentStatusSchema.optional(),
});

const createBannerSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(3, "Judul banner minimal 3 karakter.")
    .max(120, "Judul banner maksimal 120 karakter."),

  subtitle: z
    .string()
    .trim()
    .max(300, "Subjudul banner maksimal 300 karakter.")
    .default(""),

  ctaLabel: z
    .string()
    .trim()
    .max(60, "Teks tombol maksimal 60 karakter.")
    .default(""),

  ctaUrl: contentUrlSchema.default(""),

  status: contentStatusSchema.default("draft"),

  order: contentOrderSchema.default(0),
});

const updateBannerSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(3, "Judul banner minimal 3 karakter.")
      .max(120, "Judul banner maksimal 120 karakter.")
      .optional(),

    subtitle: z
      .string()
      .trim()
      .max(300, "Subjudul banner maksimal 300 karakter.")
      .optional(),

    ctaLabel: z
      .string()
      .trim()
      .max(60, "Teks tombol maksimal 60 karakter.")
      .optional(),

    ctaUrl: contentUrlSchema.optional(),

    status: contentStatusSchema.optional(),

    order: contentOrderSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada perubahan banner yang dikirim.",
  });

const createFaqSchema = z.strictObject({
  question: z
    .string()
    .trim()
    .min(5, "Pertanyaan minimal 5 karakter.")
    .max(200, "Pertanyaan maksimal 200 karakter."),

  answer: z
    .string()
    .trim()
    .min(10, "Jawaban minimal 10 karakter.")
    .max(3000, "Jawaban maksimal 3000 karakter."),

  status: contentStatusSchema.default("draft"),

  order: contentOrderSchema.default(0),
});

const updateFaqSchema = z
  .strictObject({
    question: z
      .string()
      .trim()
      .min(5, "Pertanyaan minimal 5 karakter.")
      .max(200, "Pertanyaan maksimal 200 karakter.")
      .optional(),

    answer: z
      .string()
      .trim()
      .min(10, "Jawaban minimal 10 karakter.")
      .max(3000, "Jawaban maksimal 3000 karakter.")
      .optional(),

    status: contentStatusSchema.optional(),

    order: contentOrderSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada perubahan FAQ yang dikirim.",
  });

const createTestimonialSchema = z.strictObject({
  customerName: z
    .string()
    .trim()
    .min(2, "Nama pelanggan minimal 2 karakter.")
    .max(100, "Nama pelanggan maksimal 100 karakter."),

  customerRole: z
    .string()
    .trim()
    .max(120, "Keterangan pelanggan maksimal 120 karakter.")
    .default(""),

  quote: z
    .string()
    .trim()
    .min(10, "Isi testimoni minimal 10 karakter.")
    .max(1200, "Isi testimoni maksimal 1200 karakter."),

  rating: z
    .number({
      message: "Rating harus berupa angka.",
    })
    .int("Rating harus berupa bilangan bulat.")
    .min(1, "Rating minimal 1.")
    .max(5, "Rating maksimal 5.")
    .default(5),

  status: contentStatusSchema.default("draft"),

  order: contentOrderSchema.default(0),
});

const updateTestimonialSchema = z
  .strictObject({
    customerName: z
      .string()
      .trim()
      .min(2, "Nama pelanggan minimal 2 karakter.")
      .max(100, "Nama pelanggan maksimal 100 karakter.")
      .optional(),

    customerRole: z
      .string()
      .trim()
      .max(120, "Keterangan pelanggan maksimal 120 karakter.")
      .optional(),

    quote: z
      .string()
      .trim()
      .min(10, "Isi testimoni minimal 10 karakter.")
      .max(1200, "Isi testimoni maksimal 1200 karakter.")
      .optional(),

    rating: z
      .number({
        message: "Rating harus berupa angka.",
      })
      .int("Rating harus berupa bilangan bulat.")
      .min(1, "Rating minimal 1.")
      .max(5, "Rating maksimal 5.")
      .optional(),

    status: contentStatusSchema.optional(),

    order: contentOrderSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada perubahan testimoni yang dikirim.",
  });

export const updateContentPageSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(3, "Judul halaman minimal 3 karakter.")
    .max(120, "Judul halaman maksimal 120 karakter."),

  excerpt: z
    .string()
    .trim()
    .max(300, "Ringkasan halaman maksimal 300 karakter."),

  content: z
    .string()
    .trim()
    .min(20, "Isi halaman minimal 20 karakter.")
    .max(30000, "Isi halaman maksimal 30000 karakter."),

  status: contentStatusSchema,
});

export type ParsedCreateContentItem = {
  status: ContentStatus;
  order: number;
  data: ContentItemData;
};

export type ParsedUpdateContentItem = {
  status?: ContentStatus;
  order?: number;
  data?: Record<string, unknown>;
};

export function parseCreateContentItem(
  kind: ContentKind,
  input: unknown,
): ParsedCreateContentItem {
  switch (kind) {
    case "banner": {
      const data = createBannerSchema.parse(input);

      return {
        status: data.status,
        order: data.order,

        data: {
          title: data.title,
          subtitle: data.subtitle,
          ctaLabel: data.ctaLabel,
          ctaUrl: data.ctaUrl,
          image: null,
        },
      };
    }

    case "faq": {
      const data = createFaqSchema.parse(input);

      return {
        status: data.status,
        order: data.order,

        data: {
          question: data.question,
          answer: data.answer,
        },
      };
    }

    case "testimonial": {
      const data = createTestimonialSchema.parse(input);

      return {
        status: data.status,
        order: data.order,

        data: {
          customerName: data.customerName,

          customerRole: data.customerRole,

          quote: data.quote,
          rating: data.rating,
          avatar: null,
        },
      };
    }
  }
}

export function parseUpdateContentItem(
  kind: ContentKind,
  input: unknown,
): ParsedUpdateContentItem {
  switch (kind) {
    case "banner": {
      const data = updateBannerSchema.parse(input);

      const { status, order, ...contentData } = data;

      return {
        status,
        order,

        data: Object.keys(contentData).length > 0 ? contentData : undefined,
      };
    }

    case "faq": {
      const data = updateFaqSchema.parse(input);

      const { status, order, ...contentData } = data;

      return {
        status,
        order,

        data: Object.keys(contentData).length > 0 ? contentData : undefined,
      };
    }

    case "testimonial": {
      const data = updateTestimonialSchema.parse(input);

      const { status, order, ...contentData } = data;

      return {
        status,
        order,

        data: Object.keys(contentData).length > 0 ? contentData : undefined,
      };
    }
  }
}
