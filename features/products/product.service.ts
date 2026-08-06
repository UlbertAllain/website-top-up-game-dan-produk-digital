import "server-only";

import { randomUUID } from "node:crypto";

import { getCategory } from "@/features/categories/category.service";
import {
  deleteProductImage,
  deleteProductImages,
  uploadProductImage,
} from "@/features/media/media.service";
import {
  createProductSchema,
  parseProductSpecifications,
  productFilterSchema,
  productIdSchema,
  updateProductSchema,
} from "@/features/products/product.schema";
import {
  addProductGalleryRecord,
  createProductRecord,
  deleteProductRecord,
  findProductById,
  findProducts,
  removeProductGalleryRecord,
  setProductThumbnailRecord,
  updateProductRecord,
} from "@/features/products/product.repository";
import type {
  Product,
  ProductFilters,
  ProductType,
  UpdateProductRecord,
} from "@/features/products/product.types";
import { AppError } from "@/lib/app-error";
import { createSlug } from "@/lib/slug";

const MAX_GALLERY_IMAGES = 8;

const PRODUCT_CODE_PREFIX: Record<ProductType, string> = {
  top_up: "TOP",
  game_account: "ACC",
  subscription: "SUB",
  phone_number: "NUM",
};

function createProductCode(type: ProductType, productId: string): string {
  const uniquePart = productId.replace(/-/g, "").slice(0, 8).toUpperCase();

  return `${PRODUCT_CODE_PREFIX[type]}-${uniquePart}`;
}

function assertValidPricing(price: number, discountPrice: number | null): void {
  if (discountPrice !== null && discountPrice >= price) {
    throw new AppError(
      "Harga promo harus lebih kecil dari harga normal.",
      "INVALID_DISCOUNT_PRICE",
      422,
    );
  }
}

function parseFeaturedFilter(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  throw new AppError(
    "Filter produk unggulan tidak valid.",
    "INVALID_FEATURED_FILTER",
    422,
  );
}

export async function listProducts(input: unknown = {}): Promise<Product[]> {
  const rawFilters =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const validatedFilters = productFilterSchema.parse({
    ...rawFilters,

    isFeatured: parseFeaturedFilter(rawFilters.isFeatured),
  });

  return findProducts(validatedFilters as ProductFilters);
}

export async function getProduct(id: string): Promise<Product> {
  const validatedId = productIdSchema.parse(id);

  const product = await findProductById(validatedId);

  if (!product) {
    throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
  }

  return product;
}

export async function createProduct(input: unknown): Promise<Product> {
  const data = createProductSchema.parse(input);

  const category = await getCategory(data.categoryId);

  if (data.publicationStatus === "published" && category.status !== "active") {
    throw new AppError(
      "Produk tidak dapat dipublikasikan karena kategorinya sedang tidak aktif.",
      "INACTIVE_PRODUCT_CATEGORY",
      409,
    );
  }

  const specifications = parseProductSpecifications(
    category.type,
    data.specifications,
  );

  assertValidPricing(data.price, data.discountPrice);

  const id = randomUUID();
  const slug = createSlug(data.name);

  if (!slug) {
    throw new AppError(
      "Nama produk tidak dapat digunakan.",
      "INVALID_PRODUCT_NAME",
      422,
    );
  }

  return createProductRecord({
    id,

    code: createProductCode(category.type, id),

    name: data.name,
    slug,

    categoryId: category.id,
    type: category.type,

    shortDescription: data.shortDescription,

    description: data.description,

    price: data.price,

    discountPrice: data.discountPrice,

    publicationStatus: data.publicationStatus,

    stockStatus: data.stockStatus,

    isFeatured: data.isFeatured,

    order: data.order,

    thumbnail: null,
    gallery: [],

    whatsappMessage: data.whatsappMessage,

    specifications,
  });
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<Product> {
  const validatedId = productIdSchema.parse(id);

  const currentProduct = await getProduct(validatedId);

  const changes = updateProductSchema.parse(input);

  const finalPrice = changes.price ?? currentProduct.price;

  const finalDiscountPrice =
    changes.discountPrice !== undefined
      ? changes.discountPrice
      : currentProduct.discountPrice;

  assertValidPricing(finalPrice, finalDiscountPrice);

  if (changes.publicationStatus === "published") {
    const category = await getCategory(currentProduct.categoryId);

    if (category.status !== "active") {
      throw new AppError(
        "Produk tidak dapat dipublikasikan karena kategorinya sedang tidak aktif.",
        "INACTIVE_PRODUCT_CATEGORY",
        409,
      );
    }
  }

  const {
    specifications: rawSpecifications,

    ...commonChanges
  } = changes;

  const updateData: UpdateProductRecord = {
    ...commonChanges,
  };

  if (rawSpecifications !== undefined) {
    updateData.specifications = parseProductSpecifications(
      currentProduct.type,
      rawSpecifications,
    );
  }

  return updateProductRecord(validatedId, updateData);
}

export async function setProductThumbnail(
  id: string,
  file: File,
  alt: string,
): Promise<Product> {
  const product = await getProduct(id);

  const finalAlt = alt.trim() || `Gambar ${product.name}`;

  const uploadedImage = await uploadProductImage(file, {
    productId: product.id,
    location: "thumbnail",
    alt: finalAlt,
  });

  try {
    const updatedProduct = await setProductThumbnailRecord(
      product.id,
      uploadedImage,
    );

    if (
      product.thumbnail &&
      product.thumbnail.publicId !== uploadedImage.publicId
    ) {
      try {
        await deleteProductImage(product.thumbnail.publicId);
      } catch (cleanupError) {
        console.error("[OLD_THUMBNAIL_CLEANUP_ERROR]", cleanupError);
      }
    }

    return updatedProduct;
  } catch (error) {
    try {
      await deleteProductImage(uploadedImage.publicId);
    } catch (cleanupError) {
      console.error("[NEW_THUMBNAIL_ROLLBACK_ERROR]", cleanupError);
    }

    throw error;
  }
}

export async function removeProductThumbnail(id: string): Promise<Product> {
  const product = await getProduct(id);

  if (!product.thumbnail) {
    return product;
  }

  const previousThumbnail = product.thumbnail;

  const updatedProduct = await setProductThumbnailRecord(product.id, null);

  try {
    await deleteProductImage(previousThumbnail.publicId);
  } catch (cleanupError) {
    console.error("[THUMBNAIL_CLEANUP_ERROR]", cleanupError);
  }

  return updatedProduct;
}

export async function addProductGalleryImage(
  id: string,
  file: File,
  alt: string,
): Promise<Product> {
  const product = await getProduct(id);

  if (product.gallery.length >= MAX_GALLERY_IMAGES) {
    throw new AppError(
      `Galeri produk maksimal ${MAX_GALLERY_IMAGES} gambar.`,
      "PRODUCT_GALLERY_LIMIT_REACHED",
      409,
    );
  }

  const finalAlt = alt.trim() || `Galeri ${product.name}`;

  const uploadedImage = await uploadProductImage(file, {
    productId: product.id,
    location: "gallery",
    alt: finalAlt,
  });

  try {
    return await addProductGalleryRecord(
      product.id,
      uploadedImage,
      MAX_GALLERY_IMAGES,
    );
  } catch (error) {
    try {
      await deleteProductImage(uploadedImage.publicId);
    } catch (cleanupError) {
      console.error("[NEW_GALLERY_IMAGE_ROLLBACK_ERROR]", cleanupError);
    }

    throw error;
  }
}

export async function removeProductGalleryImage(
  id: string,
  publicId: string,
): Promise<Product> {
  const product = await getProduct(id);

  const targetImage = product.gallery.find(
    (image) => image.publicId === publicId,
  );

  if (!targetImage) {
    throw new AppError(
      "Gambar tidak ditemukan di galeri produk.",
      "PRODUCT_GALLERY_IMAGE_NOT_FOUND",
      404,
    );
  }

  const updatedProduct = await removeProductGalleryRecord(
    product.id,
    targetImage,
  );

  try {
    await deleteProductImage(targetImage.publicId);
  } catch (cleanupError) {
    console.error("[GALLERY_IMAGE_CLEANUP_ERROR]", cleanupError);
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  const validatedId = productIdSchema.parse(id);

  const product = await getProduct(validatedId);

  const publicIds = [
    product.thumbnail?.publicId,

    ...product.gallery.map((image) => image.publicId),
  ].filter((publicId): publicId is string => Boolean(publicId));

  await deleteProductRecord(validatedId);

  if (publicIds.length === 0) {
    return;
  }

  try {
    await deleteProductImages(publicIds);
  } catch (cleanupError) {
    console.error("[PRODUCT_MEDIA_CLEANUP_ERROR]", {
      productId: validatedId,
      publicIds,
      error: cleanupError,
    });
  }
}
