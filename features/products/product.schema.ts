import { z } from "zod";

import { categoryIdSchema } from "@/features/categories/category.schema";
import type {
  ProductSpecifications,
  ProductType,
} from "@/features/products/product.types";
import {
  PRODUCT_PUBLICATION_STATUSES,
  PRODUCT_STOCK_STATUSES,
} from "@/features/products/product.types";

const requiredShortText = (fieldName: string, maximumLength = 120) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} wajib diisi.`)
    .max(maximumLength, `${fieldName} maksimal ${maximumLength} karakter.`);

const optionalShortText = (maximumLength = 120) =>
  z
    .string()
    .trim()
    .max(maximumLength, `Teks maksimal ${maximumLength} karakter.`)
    .default("");

const productNameSchema = z
  .string()
  .trim()
  .min(3, "Nama produk minimal 3 karakter.")
  .max(120, "Nama produk maksimal 120 karakter.");

const priceSchema = z
  .number({
    message: "Harga harus berupa angka.",
  })
  .int("Harga harus berupa bilangan bulat.")
  .min(0, "Harga tidak boleh negatif.")
  .max(1_000_000_000, "Harga produk terlalu besar.");

const nullableDiscountPriceSchema = z.union([priceSchema, z.null()]);

const productOrderSchema = z
  .number({
    message: "Urutan harus berupa angka.",
  })
  .int("Urutan harus berupa bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(9999, "Urutan maksimal 9999.");

export const productIdSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "ID produk tidak valid.",
  );

export const topUpSpecificationsSchema = z.strictObject({
  gameName: requiredShortText("Nama game", 100),

  nominal: requiredShortText("Nominal top up", 100),

  gameCurrency: optionalShortText(60),

  estimatedProcess: optionalShortText(100),
});

export const gameAccountSpecificationsSchema = z.strictObject({
  gameName: requiredShortText("Nama game", 100),

  rank: optionalShortText(100),

  level: optionalShortText(60),

  region: optionalShortText(80),

  skinCount: optionalShortText(100),

  loginMethod: optionalShortText(100),

  warranty: optionalShortText(160),
});

export const subscriptionSpecificationsSchema = z.strictObject({
  applicationName: requiredShortText("Nama aplikasi", 100),

  planName: requiredShortText("Nama paket", 100),

  duration: requiredShortText("Durasi", 80),

  accessType: optionalShortText(100),

  activationMethod: optionalShortText(160),

  warranty: optionalShortText(160),
});

export const phoneNumberSpecificationsSchema = z.strictObject({
  country: requiredShortText("Negara", 100),

  provider: optionalShortText(100),

  numberType: requiredShortText("Jenis nomor", 100),

  activePeriod: optionalShortText(100),

  estimatedProcess: optionalShortText(100),
});

export const createProductSchema = z.strictObject({
  name: productNameSchema,

  categoryId: categoryIdSchema,

  shortDescription: z
    .string()
    .trim()
    .max(240, "Deskripsi singkat maksimal 240 karakter.")
    .default(""),

  description: z
    .string()
    .trim()
    .max(5000, "Deskripsi maksimal 5000 karakter.")
    .default(""),

  price: priceSchema.default(0),

  discountPrice: nullableDiscountPriceSchema.default(null),

  publicationStatus: z
    .enum(PRODUCT_PUBLICATION_STATUSES, {
      message: "Status publikasi produk tidak valid.",
    })
    .default("draft"),

  stockStatus: z
    .enum(PRODUCT_STOCK_STATUSES, {
      message: "Status ketersediaan produk tidak valid.",
    })
    .default("available"),

  isFeatured: z.boolean().default(false),

  order: productOrderSchema.default(0),

  whatsappMessage: z
    .string()
    .trim()
    .max(1000, "Pesan WhatsApp maksimal 1000 karakter.")
    .default(""),

  specifications: z.unknown(),
});

export const updateProductSchema = z
  .strictObject({
    name: productNameSchema.optional(),

    shortDescription: z
      .string()
      .trim()
      .max(240, "Deskripsi singkat maksimal 240 karakter.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, "Deskripsi maksimal 5000 karakter.")
      .optional(),

    price: priceSchema.optional(),

    discountPrice: nullableDiscountPriceSchema.optional(),

    publicationStatus: z
      .enum(PRODUCT_PUBLICATION_STATUSES, {
        message: "Status publikasi produk tidak valid.",
      })
      .optional(),

    stockStatus: z
      .enum(PRODUCT_STOCK_STATUSES, {
        message: "Status ketersediaan produk tidak valid.",
      })
      .optional(),

    isFeatured: z.boolean().optional(),

    order: productOrderSchema.optional(),

    whatsappMessage: z
      .string()
      .trim()
      .max(1000, "Pesan WhatsApp maksimal 1000 karakter.")
      .optional(),

    specifications: z.unknown().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Tidak ada perubahan produk yang dikirim.",
  });

export const productFilterSchema = z.strictObject({
  categoryId: categoryIdSchema.optional(),

  type: z
    .enum(["top_up", "game_account", "subscription", "phone_number"])
    .optional(),

  publicationStatus: z.enum(PRODUCT_PUBLICATION_STATUSES).optional(),

  stockStatus: z.enum(PRODUCT_STOCK_STATUSES).optional(),

  isFeatured: z.boolean().optional(),

  search: z
    .string()
    .trim()
    .max(100, "Kata pencarian maksimal 100 karakter.")
    .optional(),
});

export function parseProductSpecifications(
  type: ProductType,
  input: unknown,
): ProductSpecifications {
  switch (type) {
    case "top_up":
      return topUpSpecificationsSchema.parse(input);

    case "game_account":
      return gameAccountSpecificationsSchema.parse(input);

    case "subscription":
      return subscriptionSpecificationsSchema.parse(input);

    case "phone_number":
      return phoneNumberSpecificationsSchema.parse(input);
  }
}
