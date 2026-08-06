import { z } from "zod";

const optionalEmailSchema = z
  .string()
  .trim()
  .max(160, "Email maksimal 160 karakter.")
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    {
      message: "Format email tidak valid.",
    },
  );

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "URL maksimal 500 karakter.")
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message: "URL harus diawali http:// atau https://.",
    },
  );

export const siteSettingsSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(2, "Nama bisnis minimal 2 karakter.")
      .max(100, "Nama bisnis maksimal 100 karakter."),

    businessTagline: z
      .string()
      .trim()
      .max(160, "Tagline maksimal 160 karakter."),

    businessDescription: z
      .string()
      .trim()
      .max(2000, "Deskripsi bisnis maksimal 2000 karakter."),

    whatsappNumber: z
      .string()
      .trim()
      .max(25, "Nomor WhatsApp terlalu panjang.")
      .refine((value) => value === "" || /^[+\d\s\-()]+$/.test(value), {
        message: "Nomor WhatsApp hanya boleh berisi angka dan tanda telepon.",
      }),

    whatsappMessageTemplate: z
      .string()
      .trim()
      .max(1500, "Template WhatsApp maksimal 1500 karakter."),

    email: optionalEmailSchema,

    address: z.string().trim().max(1000, "Alamat maksimal 1000 karakter."),

    operatingHours: z
      .string()
      .trim()
      .max(500, "Jam operasional maksimal 500 karakter."),

    instagramUrl: optionalUrlSchema,

    tiktokUrl: optionalUrlSchema,

    facebookUrl: optionalUrlSchema,

    youtubeUrl: optionalUrlSchema,

    seoTitle: z
      .string()
      .trim()
      .min(3, "Judul SEO minimal 3 karakter.")
      .max(70, "Judul SEO maksimal 70 karakter."),

    seoDescription: z
      .string()
      .trim()
      .min(20, "Deskripsi SEO minimal 20 karakter.")
      .max(180, "Deskripsi SEO maksimal 180 karakter."),

    seoKeywords: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Keyword tidak boleh kosong.")
          .max(50, "Keyword maksimal 50 karakter."),
      )
      .max(20, "Keyword SEO maksimal 20."),
  })
  .superRefine((value, context) => {
    const normalizedWhatsapp = value.whatsappNumber.replace(/\D/g, "");

    if (
      normalizedWhatsapp &&
      (normalizedWhatsapp.length < 10 || normalizedWhatsapp.length > 16)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["whatsappNumber"],

        message: "Nomor WhatsApp harus terdiri dari 10 sampai 16 angka.",
      });
    }

    if (normalizedWhatsapp && value.whatsappMessageTemplate.length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["whatsappMessageTemplate"],

        message:
          "Template WhatsApp minimal 10 karakter apabila nomor WhatsApp diisi.",
      });
    }
  });

export type SiteSettingsSchemaInput = z.infer<typeof siteSettingsSchema>;
