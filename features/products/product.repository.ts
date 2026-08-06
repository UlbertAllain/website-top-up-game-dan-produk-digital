import "server-only";

import {
  FieldValue,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import type {
  NewProductRecord,
  Product,
  ProductFilters,
  ProductMedia,
  ProductSpecifications,
  ProductType,
  UpdateProductRecord,
} from "@/features/products/product.types";
import { AppError } from "@/lib/app-error";
import { adminDb } from "@/lib/firebase/admin";

const productCollection = adminDb.collection(COLLECTIONS.PRODUCTS);

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return new Date(0).toISOString();
}

function mapProductMedia(value: unknown): ProductMedia | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as Partial<ProductMedia>;

  if (
    typeof media.publicId !== "string" ||
    typeof media.secureUrl !== "string"
  ) {
    return null;
  }

  return {
    publicId: media.publicId,
    secureUrl: media.secureUrl,
    width: Number(media.width ?? 0),
    height: Number(media.height ?? 0),
    format: String(media.format ?? ""),
    alt: String(media.alt ?? ""),
  };
}

function mapProductGallery(value: unknown): ProductMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapProductMedia)
    .filter((media): media is ProductMedia => media !== null);
}

function mapProductDocument(snapshot: DocumentSnapshot<DocumentData>): Product {
  const data = snapshot.data();

  if (!data) {
    throw new AppError(
      "Data produk tidak ditemukan.",
      "PRODUCT_DATA_NOT_FOUND",
      404,
    );
  }

  return {
    id: snapshot.id,
    code: String(data.code ?? ""),
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    categoryId: String(data.categoryId ?? ""),
    type: data.type as ProductType,

    shortDescription: String(data.shortDescription ?? ""),

    description: String(data.description ?? ""),

    price: Number(data.price ?? 0),

    discountPrice:
      typeof data.discountPrice === "number" ? data.discountPrice : null,

    publicationStatus: data.publicationStatus,

    stockStatus: data.stockStatus,

    isFeatured: data.isFeatured === true,

    order: Number(data.order ?? 0),

    thumbnail: mapProductMedia(data.thumbnail),

    gallery: mapProductGallery(data.gallery),

    whatsappMessage: String(data.whatsappMessage ?? ""),

    specifications: data.specifications as ProductSpecifications,

    createdAt: timestampToIso(data.createdAt),

    updatedAt: timestampToIso(data.updatedAt),
  };
}

export async function findProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const snapshot = await productCollection.get();

  const normalizedSearch = filters.search?.trim().toLocaleLowerCase("id-ID");

  return snapshot.docs
    .map(mapProductDocument)
    .filter((product) => {
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.type && product.type !== filters.type) {
        return false;
      }

      if (
        filters.publicationStatus &&
        product.publicationStatus !== filters.publicationStatus
      ) {
        return false;
      }

      if (filters.stockStatus && product.stockStatus !== filters.stockStatus) {
        return false;
      }

      if (
        filters.isFeatured !== undefined &&
        product.isFeatured !== filters.isFeatured
      ) {
        return false;
      }

      if (normalizedSearch) {
        const searchableContent = [
          product.name,
          product.code,
          product.shortDescription,
        ]
          .join(" ")
          .toLocaleLowerCase("id-ID");

        if (!searchableContent.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    })
    .sort((firstProduct, secondProduct) => {
      const orderDifference = firstProduct.order - secondProduct.order;

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return firstProduct.name.localeCompare(secondProduct.name, "id");
    });
}

export async function findProductById(id: string): Promise<Product | null> {
  const snapshot = await productCollection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapProductDocument(snapshot);
}

export async function createProductRecord(
  product: NewProductRecord,
): Promise<Product> {
  const { id: documentId, ...documentData } = product;

  const documentReference = productCollection.doc(documentId);

  const existingDocument = await documentReference.get();

  if (existingDocument.exists) {
    throw new AppError(
      "ID produk sudah digunakan.",
      "PRODUCT_ALREADY_EXISTS",
      409,
    );
  }

  const timestamp = Timestamp.now();

  await documentReference.set({
    ...documentData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const createdDocument = await documentReference.get();

  return mapProductDocument(createdDocument);
}

export async function updateProductRecord(
  id: string,
  changes: UpdateProductRecord,
): Promise<Product> {
  const documentReference = productCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
    }

    transaction.update(documentReference, {
      ...changes,
      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapProductDocument(updatedDocument);
}

export async function deleteProductRecord(id: string): Promise<void> {
  const documentReference = productCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
    }

    transaction.delete(documentReference);
  });
}

export async function setProductThumbnailRecord(
  id: string,
  thumbnail: ProductMedia | null,
): Promise<Product> {
  const documentReference = productCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
    }

    transaction.update(documentReference, {
      thumbnail,
      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapProductDocument(updatedDocument);
}

export async function addProductGalleryRecord(
  id: string,
  image: ProductMedia,
  maximumImages: number,
): Promise<Product> {
  const documentReference = productCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
    }

    const currentData = currentDocument.data();

    const currentGallery = Array.isArray(currentData?.gallery)
      ? currentData.gallery
      : [];

    if (currentGallery.length >= maximumImages) {
      throw new AppError(
        `Galeri produk maksimal ${maximumImages} gambar.`,
        "PRODUCT_GALLERY_LIMIT_REACHED",
        409,
      );
    }

    transaction.update(documentReference, {
      gallery: FieldValue.arrayUnion(image),

      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapProductDocument(updatedDocument);
}

export async function removeProductGalleryRecord(
  id: string,
  image: ProductMedia,
): Promise<Product> {
  const documentReference = productCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Produk tidak ditemukan.", "PRODUCT_NOT_FOUND", 404);
    }

    transaction.update(documentReference, {
      gallery: FieldValue.arrayRemove(image),

      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapProductDocument(updatedDocument);
}
