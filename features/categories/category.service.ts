import "server-only";

import {
  createCategorySchema,
  categoryFilterSchema,
  categoryIdSchema,
  updateCategorySchema,
} from "@/features/categories/category.schema";
import {
  categoryHasProducts,
  createCategoryRecord,
  deleteCategoryRecord,
  findCategories,
  findCategoryById,
  updateCategoryRecord,
} from "@/features/categories/category.repository";
import type {
  Category,
  CategoryFilters,
} from "@/features/categories/category.types";
import { AppError } from "@/lib/app-error";
import { createSlug } from "@/lib/slug";

export async function listCategories(
  filters: CategoryFilters = {},
): Promise<Category[]> {
  const validatedFilters = categoryFilterSchema.parse(filters);

  return findCategories(validatedFilters);
}

export async function listPublicCategories(): Promise<Category[]> {
  return findCategories({
    status: "active",
  });
}

export async function getCategory(id: string): Promise<Category> {
  const validatedId = categoryIdSchema.parse(id);

  const category = await findCategoryById(validatedId);

  if (!category) {
    throw new AppError("Kategori tidak ditemukan.", "CATEGORY_NOT_FOUND", 404);
  }

  return category;
}

export async function createCategory(input: unknown): Promise<Category> {
  const data = createCategorySchema.parse(input);

  const slug = createSlug(data.name);

  if (!slug) {
    throw new AppError(
      "Nama kategori tidak dapat digunakan.",
      "INVALID_CATEGORY_NAME",
      422,
    );
  }

  return createCategoryRecord({
    ...data,
    slug,
  });
}

export async function updateCategory(
  id: string,
  input: unknown,
): Promise<Category> {
  const validatedId = categoryIdSchema.parse(id);

  const changes = updateCategorySchema.parse(input);

  await getCategory(validatedId);

  return updateCategoryRecord(validatedId, changes);
}

export async function deleteCategory(id: string): Promise<void> {
  const validatedId = categoryIdSchema.parse(id);

  await getCategory(validatedId);

  const hasProducts = await categoryHasProducts(validatedId);

  if (hasProducts) {
    throw new AppError(
      "Kategori masih digunakan oleh produk. Nonaktifkan kategori atau pindahkan produknya terlebih dahulu.",
      "CATEGORY_STILL_IN_USE",
      409,
    );
  }

  await deleteCategoryRecord(validatedId);
}
