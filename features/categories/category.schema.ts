import { z } from "zod";

import {
  CATEGORY_STATUSES,
  CATEGORY_TYPES,
} from "@/features/categories/category.types";

const categoryNameSchema = z
  .string()
  .trim()
  .min(3, "Nama kategori minimal 3 karakter.")
  .max(80, "Nama kategori maksimal 80 karakter.");

const categoryDescriptionSchema = z
  .string()
  .trim()
  .max(240, "Deskripsi maksimal 240 karakter.");

const categoryOrderSchema = z.coerce
  .number()
  .int("Urutan harus berupa bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(999, "Urutan maksimal 999.");

export const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "ID kategori wajib tersedia.")
  .max(100, "ID kategori terlalu panjang.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Format ID kategori tidak valid.");

export const createCategorySchema = z.object({
  name: categoryNameSchema,

  type: z.enum(CATEGORY_TYPES, {
    message: "Jenis kategori tidak valid.",
  }),

  description: categoryDescriptionSchema.default(""),

  status: z
    .enum(CATEGORY_STATUSES, {
      message: "Status kategori tidak valid.",
    })
    .default("active"),

  order: categoryOrderSchema.default(0),
});

export const updateCategorySchema = z
  .object({
    name: categoryNameSchema.optional(),

    description: categoryDescriptionSchema.optional(),

    status: z
      .enum(CATEGORY_STATUSES, {
        message: "Status kategori tidak valid.",
      })
      .optional(),

    order: categoryOrderSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Tidak ada perubahan kategori yang dikirim.",
  });

export const categoryFilterSchema = z.object({
  type: z.enum(CATEGORY_TYPES).optional(),
  status: z.enum(CATEGORY_STATUSES).optional(),
});
