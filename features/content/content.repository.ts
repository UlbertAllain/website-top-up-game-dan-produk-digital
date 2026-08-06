import "server-only";

import {
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import type {
  BannerContentData,
  ContentItem,
  ContentItemData,
  ContentItemFilters,
  ContentKind,
  ContentMedia,
  ContentPage,
  ContentPageInput,
  ContentPageSlug,
  ContentStatus,
  FaqContentData,
  NewContentItemRecord,
  TestimonialContentData,
  UpdateContentItemRecord,
} from "@/features/content/content.types";
import { AppError } from "@/lib/app-error";
import { adminDb } from "@/lib/firebase/admin";

type ContentMediaField = "image" | "avatar";

const contentCollection = adminDb.collection(COLLECTIONS.CONTENT_ITEMS);

const pagesCollection = adminDb.collection(COLLECTIONS.PAGES);

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return null;
}

function mapContentMedia(value: unknown): ContentMedia | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as Record<string, unknown>;

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

function mapContentData(kind: ContentKind, value: unknown): ContentItemData {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  switch (kind) {
    case "banner": {
      const banner: BannerContentData = {
        title: String(data.title ?? ""),

        subtitle: String(data.subtitle ?? ""),

        ctaLabel: String(data.ctaLabel ?? ""),

        ctaUrl: String(data.ctaUrl ?? ""),

        image: mapContentMedia(data.image),
      };

      return banner;
    }

    case "faq": {
      const faq: FaqContentData = {
        question: String(data.question ?? ""),

        answer: String(data.answer ?? ""),
      };

      return faq;
    }

    case "testimonial": {
      const testimonial: TestimonialContentData = {
        customerName: String(data.customerName ?? ""),

        customerRole: String(data.customerRole ?? ""),

        quote: String(data.quote ?? ""),

        rating: Number(data.rating ?? 5),

        avatar: mapContentMedia(data.avatar),
      };

      return testimonial;
    }
  }
}

function mapContentDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): ContentItem {
  const data = snapshot.data();

  if (!data) {
    throw new AppError(
      "Data konten tidak ditemukan.",
      "CONTENT_DATA_NOT_FOUND",
      404,
    );
  }

  const kind = data.kind as ContentKind;

  return {
    id: snapshot.id,
    kind,

    status: data.status as ContentStatus,

    order: Number(data.order ?? 0),

    data: mapContentData(kind, data.data),

    createdAt: timestampToIso(data.createdAt) ?? new Date(0).toISOString(),

    updatedAt: timestampToIso(data.updatedAt) ?? new Date(0).toISOString(),
  };
}

function mapPageDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): ContentPage | null {
  const data = snapshot.data();

  if (!snapshot.exists || !data) {
    return null;
  }

  const slug = snapshot.id as ContentPageSlug;

  return {
    id: slug,
    slug,

    title: String(data.title ?? ""),

    excerpt: String(data.excerpt ?? ""),

    content: String(data.content ?? ""),

    status: data.status as ContentStatus,

    updatedAt: timestampToIso(data.updatedAt),
  };
}

function assertValidMediaField(
  kind: ContentKind,
  field: ContentMediaField,
): void {
  const isBannerImage = kind === "banner" && field === "image";

  const isTestimonialAvatar = kind === "testimonial" && field === "avatar";

  if (!isBannerImage && !isTestimonialAvatar) {
    throw new AppError(
      "Jenis media tidak sesuai dengan konten.",
      "INVALID_CONTENT_MEDIA_FIELD",
      422,
    );
  }
}

export async function findContentItems(
  kind: ContentKind,
  filters: ContentItemFilters = {},
): Promise<ContentItem[]> {
  const snapshot = await contentCollection.where("kind", "==", kind).get();

  return snapshot.docs
    .map(mapContentDocument)
    .filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      return true;
    })
    .sort((firstItem, secondItem) => {
      const orderDifference = firstItem.order - secondItem.order;

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return firstItem.createdAt.localeCompare(secondItem.createdAt);
    });
}

export async function findContentItemById(
  id: string,
): Promise<ContentItem | null> {
  const snapshot = await contentCollection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapContentDocument(snapshot);
}

export async function createContentItemRecord(
  item: NewContentItemRecord,
): Promise<ContentItem> {
  const documentReference = contentCollection.doc(item.id);

  const timestamp = Timestamp.now();

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (currentDocument.exists) {
      throw new AppError(
        "ID konten sudah digunakan.",
        "CONTENT_ALREADY_EXISTS",
        409,
      );
    }

    transaction.set(documentReference, {
      kind: item.kind,
      status: item.status,
      order: item.order,
      data: item.data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  const createdDocument = await documentReference.get();

  return mapContentDocument(createdDocument);
}

export async function updateContentItemRecord(
  kind: ContentKind,
  id: string,
  changes: UpdateContentItemRecord,
): Promise<ContentItem> {
  const documentReference = contentCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    const currentData = currentDocument.data();

    if (currentData?.kind !== kind) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    transaction.update(documentReference, {
      ...changes,
      updatedAt: Timestamp.now(),
    });
  });

  const updatedDocument = await documentReference.get();

  return mapContentDocument(updatedDocument);
}

export async function setContentItemMediaRecord(
  kind: ContentKind,
  id: string,
  field: ContentMediaField,
  media: ContentMedia | null,
): Promise<ContentItem> {
  assertValidMediaField(kind, field);

  const documentReference = contentCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    const currentData = currentDocument.data();

    if (currentData?.kind !== kind) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    transaction.update(
      documentReference,
      `data.${field}`,
      media,
      "updatedAt",
      Timestamp.now(),
    );
  });

  const updatedDocument = await documentReference.get();

  return mapContentDocument(updatedDocument);
}

export async function deleteContentItemRecord(
  kind: ContentKind,
  id: string,
): Promise<void> {
  const documentReference = contentCollection.doc(id);

  await adminDb.runTransaction(async (transaction) => {
    const currentDocument = await transaction.get(documentReference);

    if (!currentDocument.exists) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    const currentData = currentDocument.data();

    if (currentData?.kind !== kind) {
      throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
    }

    transaction.delete(documentReference);
  });
}

export async function findContentPages(): Promise<ContentPage[]> {
  const snapshot = await pagesCollection.get();

  return snapshot.docs
    .map(mapPageDocument)
    .filter((page): page is ContentPage => page !== null);
}

export async function findContentPageBySlug(
  slug: ContentPageSlug,
): Promise<ContentPage | null> {
  const snapshot = await pagesCollection.doc(slug).get();

  return mapPageDocument(snapshot);
}

export async function saveContentPageRecord(
  slug: ContentPageSlug,
  data: ContentPageInput,
): Promise<ContentPage> {
  const documentReference = pagesCollection.doc(slug);

  await documentReference.set({
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    status: data.status,
    updatedAt: Timestamp.now(),
  });

  const updatedDocument = await documentReference.get();

  const page = mapPageDocument(updatedDocument);

  if (!page) {
    throw new Error("Halaman gagal dibaca setelah disimpan.");
  }

  return page;
}
