import "server-only";

import {
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import type {
  Category,
  CategoryFilters,
  NewCategoryRecord,
  UpdateCategoryRecord,
} from "@/features/categories/category.types";
import { AppError } from "@/lib/app-error";
import { adminDb } from "@/lib/firebase/admin";

const categoryCollection = adminDb.collection(COLLECTIONS.CATEGORIES);

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return new Date(0).toISOString();
}

function mapCategoryDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): Category {
  const data = snapshot.data();

  if (!data) {
    throw new AppError(
      "Data kategori tidak ditemukan.",
      "CATEGORY_DATA_NOT_FOUND",
      404,
    );
  }

  return {
    id: snapshot.id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? snapshot.id),
    type: data.type,
    description: String(data.description ?? ""),
    status: data.status,
    order: Number(data.order ?? 0),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export async function findCategories(
  filters: CategoryFilters = {},
): Promise<Category[]> {
  const snapshot = await categoryCollection.get();

  return snapshot.docs
    .map(mapCategoryDocument)
    .filter((category) => {
      if (filters.type && category.type !== filters.type) {
        return false;
      }

      if (filters.status && category.status !== filters.status) {
        return false;
      }

      return true;
    })
    .sort((firstCategory, secondCategory) => {
      const orderDifference = firstCategory.order - secondCategory.order;

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return firstCategory.name.localeCompare(secondCategory.name, "id");
    });
}

export async function findCategoryById(id: string): Promise<Category | null> {
  const snapshot = await categoryCollection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapCategoryDocument(snapshot);
}

export async function createCategoryRecord(
  data: NewCategoryRecord,
): Promise<Category> {
  const documentReference = categoryCollection.doc(data.slug);

  const timestamp = Timestamp.now();

  const documentData = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await adminDb.runTransaction(async (transaction) => {
    const existingDocument = await transaction.get(documentReference);

    if (existingDocument.exists) {
      throw new AppError(
        "Kategori dengan nama tersebut sudah tersedia.",
        "CATEGORY_ALREADY_EXISTS",
        409,
      );
    }

    transaction.set(documentReference, documentData);
  });

  const createdDocument = await documentReference.get();

  return mapCategoryDocument(createdDocument);
}

export async function updateCategoryRecord(
  id: string,
  changes: UpdateCategoryRecord,
): Promise<Category> {
  const documentReference = categoryCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError(
        "Kategori tidak ditemukan.",
        "CATEGORY_NOT_FOUND",
        404,
      );
    }

    transaction.update(documentReference, {
      ...changes,
      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapCategoryDocument(updatedDocument);
}

export async function deleteCategoryRecord(id: string): Promise<void> {
  const documentReference = categoryCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError(
        "Kategori tidak ditemukan.",
        "CATEGORY_NOT_FOUND",
        404,
      );
    }

    transaction.delete(documentReference);
  });
}

export async function categoryHasProducts(
  categoryId: string,
): Promise<boolean> {
  const snapshot = await adminDb
    .collection(COLLECTIONS.PRODUCTS)
    .where("categoryId", "==", categoryId)
    .limit(1)
    .get();

  return !snapshot.empty;
}
