import "server-only";

import { randomUUID } from "node:crypto";

import {
  contentFilterSchema,
  contentIdSchema,
  contentKindSchema,
  contentPageSlugSchema,
  parseCreateContentItem,
  parseUpdateContentItem,
  updateContentPageSchema,
} from "@/features/content/content.schema";
import {
  createContentItemRecord,
  deleteContentItemRecord,
  findContentItemById,
  findContentItems,
  findContentPageBySlug,
  findContentPages,
  saveContentPageRecord,
  setContentItemMediaRecord,
  updateContentItemRecord,
} from "@/features/content/content.repository";
import {
  CONTENT_PAGE_SLUGS,
  DEFAULT_CONTENT_PAGES,
  type BannerContentData,
  type ContentItem,
  type ContentItemData,
  type ContentMedia,
  type ContentPage,
  type ContentPageSlug,
  type TestimonialContentData,
  type UpdateContentItemRecord,
} from "@/features/content/content.types";
import {
  deleteContentImage,
  uploadContentImage,
} from "@/features/media/media.service";
import { AppError } from "@/lib/app-error";

type ContentMediaField = "image" | "avatar";

type ContentMediaLocation = "banner" | "testimonial";

type ContentMediaConfiguration = {
  field: ContentMediaField;
  location: ContentMediaLocation;
  currentMedia: ContentMedia | null;
  fallbackAlt: string;
};

function getOptionalMediaConfiguration(
  item: ContentItem,
): ContentMediaConfiguration | null {
  switch (item.kind) {
    case "banner": {
      const data = item.data as BannerContentData;

      return {
        field: "image",
        location: "banner",
        currentMedia: data.image,
        fallbackAlt: `Banner ${data.title}`,
      };
    }

    case "testimonial": {
      const data = item.data as TestimonialContentData;

      return {
        field: "avatar",
        location: "testimonial",
        currentMedia: data.avatar,
        fallbackAlt: `Foto ${data.customerName}`,
      };
    }

    case "faq":
      return null;
  }
}

function getRequiredMediaConfiguration(
  item: ContentItem,
): ContentMediaConfiguration {
  const configuration = getOptionalMediaConfiguration(item);

  if (!configuration) {
    throw new AppError(
      "Jenis konten ini tidak mendukung gambar.",
      "CONTENT_MEDIA_NOT_SUPPORTED",
      422,
    );
  }

  return configuration;
}

export async function listContentItems(
  kindInput: string,
  filtersInput: unknown = {},
): Promise<ContentItem[]> {
  const kind = contentKindSchema.parse(kindInput);

  const filters = contentFilterSchema.parse(filtersInput);

  return findContentItems(kind, filters);
}

export async function listPublishedContentItems(
  kindInput: string,
): Promise<ContentItem[]> {
  const kind = contentKindSchema.parse(kindInput);

  return findContentItems(kind, {
    status: "published",
  });
}

export async function getContentItem(
  kindInput: string,
  idInput: string,
): Promise<ContentItem> {
  const kind = contentKindSchema.parse(kindInput);

  const id = contentIdSchema.parse(idInput);

  const item = await findContentItemById(id);

  if (!item || item.kind !== kind) {
    throw new AppError("Konten tidak ditemukan.", "CONTENT_NOT_FOUND", 404);
  }

  return item;
}

export async function createContentItem(
  kindInput: string,
  input: unknown,
): Promise<ContentItem> {
  const kind = contentKindSchema.parse(kindInput);

  const parsedInput = parseCreateContentItem(kind, input);

  return createContentItemRecord({
    id: randomUUID(),
    kind,

    status: parsedInput.status,

    order: parsedInput.order,

    data: parsedInput.data,
  });
}

export async function updateContentItem(
  kindInput: string,
  idInput: string,
  input: unknown,
): Promise<ContentItem> {
  const kind = contentKindSchema.parse(kindInput);

  const id = contentIdSchema.parse(idInput);

  const currentItem = await getContentItem(kind, id);

  const parsedChanges = parseUpdateContentItem(kind, input);

  const updateData: UpdateContentItemRecord = {};

  if (parsedChanges.status !== undefined) {
    updateData.status = parsedChanges.status;
  }

  if (parsedChanges.order !== undefined) {
    updateData.order = parsedChanges.order;
  }

  if (parsedChanges.data) {
    updateData.data = {
      ...currentItem.data,
      ...parsedChanges.data,
    } as ContentItemData;
  }

  return updateContentItemRecord(kind, id, updateData);
}

export async function setContentItemMedia(
  kindInput: string,
  idInput: string,
  file: File,
  alt: string,
): Promise<ContentItem> {
  const item = await getContentItem(kindInput, idInput);

  const configuration = getRequiredMediaConfiguration(item);

  const finalAlt = alt.trim() || configuration.fallbackAlt;

  const uploadedImage = await uploadContentImage(file, {
    contentId: item.id,
    location: configuration.location,
    alt: finalAlt,
  });

  try {
    const updatedItem = await setContentItemMediaRecord(
      item.kind,
      item.id,
      configuration.field,
      uploadedImage,
    );

    if (
      configuration.currentMedia &&
      configuration.currentMedia.publicId !== uploadedImage.publicId
    ) {
      try {
        await deleteContentImage(configuration.currentMedia.publicId);
      } catch (cleanupError) {
        console.error("[OLD_CONTENT_MEDIA_CLEANUP_ERROR]", cleanupError);
      }
    }

    return updatedItem;
  } catch (error) {
    try {
      await deleteContentImage(uploadedImage.publicId);
    } catch (cleanupError) {
      console.error("[NEW_CONTENT_MEDIA_ROLLBACK_ERROR]", cleanupError);
    }

    throw error;
  }
}

export async function removeContentItemMedia(
  kindInput: string,
  idInput: string,
): Promise<ContentItem> {
  const item = await getContentItem(kindInput, idInput);

  const configuration = getRequiredMediaConfiguration(item);

  if (!configuration.currentMedia) {
    return item;
  }

  const previousMedia = configuration.currentMedia;

  const updatedItem = await setContentItemMediaRecord(
    item.kind,
    item.id,
    configuration.field,
    null,
  );

  try {
    await deleteContentImage(previousMedia.publicId);
  } catch (cleanupError) {
    console.error("[CONTENT_MEDIA_CLEANUP_ERROR]", cleanupError);
  }

  return updatedItem;
}

export async function deleteContentItem(
  kindInput: string,
  idInput: string,
): Promise<void> {
  const item = await getContentItem(kindInput, idInput);

  const mediaConfiguration = getOptionalMediaConfiguration(item);

  const currentMedia = mediaConfiguration?.currentMedia ?? null;

  await deleteContentItemRecord(item.kind, item.id);

  if (!currentMedia) {
    return;
  }

  try {
    await deleteContentImage(currentMedia.publicId);
  } catch (cleanupError) {
    console.error("[DELETED_CONTENT_MEDIA_CLEANUP_ERROR]", {
      contentId: item.id,
      publicId: currentMedia.publicId,
      error: cleanupError,
    });
  }
}

export async function listContentPages(): Promise<ContentPage[]> {
  const storedPages = await findContentPages();

  const storedPageMap = new Map<ContentPageSlug, ContentPage>(
    storedPages.map((page) => [page.slug, page]),
  );

  return CONTENT_PAGE_SLUGS.map(
    (slug) =>
      storedPageMap.get(slug) ?? {
        ...DEFAULT_CONTENT_PAGES[slug],
      },
  );
}

export async function getContentPage(slugInput: string): Promise<ContentPage> {
  const slug = contentPageSlugSchema.parse(slugInput);

  const storedPage = await findContentPageBySlug(slug);

  if (storedPage) {
    return storedPage;
  }

  return {
    ...DEFAULT_CONTENT_PAGES[slug],
  };
}

export async function updateContentPage(
  slugInput: string,
  input: unknown,
): Promise<ContentPage> {
  const slug = contentPageSlugSchema.parse(slugInput);

  const data = updateContentPageSchema.parse(input);

  return saveContentPageRecord(slug, data);
}
