import "server-only";

import { randomUUID } from "node:crypto";

import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import { AppError } from "@/lib/app-error";
import { cloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const MANAGED_MEDIA_ROOT = "digital-catalog";
const PRODUCT_MEDIA_ROOT = `${MANAGED_MEDIA_ROOT}/products`;
const CONTENT_MEDIA_ROOT = `${MANAGED_MEDIA_ROOT}/content`;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

export type UploadedImage = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  alt: string;
};

type ProductImageLocation = "thumbnail" | "gallery";

type ContentImageLocation = "banner" | "testimonial";

type UploadProductImageOptions = {
  productId: string;
  location: ProductImageLocation;
  alt: string;
};

type UploadContentImageOptions = {
  contentId: string;
  location: ContentImageLocation;
  alt: string;
};

type UploadImageOptions = {
  folder: string;
  alt: string;
};

function normalizeAltText(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length > 160) {
    throw new AppError(
      "Teks alternatif gambar maksimal 160 karakter.",
      "IMAGE_ALT_TOO_LONG",
      422,
    );
  }

  return normalized;
}

function startsWithBytes(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) {
    return false;
  }

  return bytes.every((byte, index) => buffer[index] === byte);
}

function assertValidImageSignature(buffer: Buffer, mimeType: string): void {
  let isValid = false;

  if (mimeType === "image/jpeg") {
    isValid = startsWithBytes(buffer, [0xff, 0xd8, 0xff]);
  }

  if (mimeType === "image/png") {
    isValid = startsWithBytes(
      buffer,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    );
  }

  if (mimeType === "image/webp") {
    const hasRiffSignature =
      buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "RIFF";

    const hasWebpSignature =
      buffer.length >= 12 &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";

    isValid = hasRiffSignature && hasWebpSignature;
  }

  if (!isValid) {
    throw new AppError(
      "Isi file tidak sesuai dengan format gambar.",
      "INVALID_IMAGE_SIGNATURE",
      422,
    );
  }
}

function assertManagedPublicId(publicId: string, managedRoot: string): void {
  if (!publicId.startsWith(`${managedRoot}/`)) {
    throw new AppError(
      "Aset media tidak dikelola oleh sistem.",
      "UNMANAGED_MEDIA_ASSET",
      403,
    );
  }
}

async function uploadImage(
  file: File,
  options: UploadImageOptions,
): Promise<UploadedImage> {
  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  assertValidImageSignature(buffer, file.type);

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: randomUUID(),
          resource_type: "image",
          type: "upload",

          allowed_formats: ALLOWED_IMAGE_FORMATS,

          overwrite: false,
          unique_filename: false,
        },
        (
          error: UploadApiErrorResponse | undefined,

          uploadResult: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult) {
            reject(new Error("Cloudinary tidak memberikan hasil upload."));

            return;
          }

          resolve(uploadResult);
        },
      );

      uploadStream.end(buffer);
    });

    if (!result.public_id || !result.secure_url) {
      throw new Error("Respons upload Cloudinary tidak lengkap.");
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: Number(result.width ?? 0),
      height: Number(result.height ?? 0),
      format: String(result.format ?? ""),
      alt: normalizeAltText(options.alt),
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("[CLOUDINARY_UPLOAD_ERROR]", error);

    throw new AppError(
      "Gambar gagal diunggah. Silakan coba kembali.",
      "IMAGE_UPLOAD_FAILED",
      502,
    );
  }
}

async function deleteManagedImage(
  publicId: string,
  managedRoot: string,
): Promise<void> {
  assertManagedPublicId(publicId, managedRoot);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary destroy result: ${result.result}`);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("[CLOUDINARY_DELETE_ERROR]", {
      publicId,
      error,
    });

    throw new AppError(
      "Gambar gagal dihapus dari penyimpanan.",
      "IMAGE_DELETE_FAILED",
      502,
    );
  }
}

export function getImageFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new AppError(
      "File gambar wajib dipilih.",
      "IMAGE_FILE_REQUIRED",
      422,
    );
  }

  if (value.size === 0) {
    throw new AppError("File gambar kosong.", "EMPTY_IMAGE_FILE", 422);
  }

  if (value.size > MAX_IMAGE_SIZE) {
    throw new AppError(
      "Ukuran gambar maksimal 5 MB.",
      "IMAGE_FILE_TOO_LARGE",
      413,
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new AppError(
      "Format gambar harus JPG, PNG, atau WebP.",
      "INVALID_IMAGE_TYPE",
      422,
    );
  }

  return value;
}

export function getAltText(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return normalizeAltText(value);
}

export async function uploadProductImage(
  file: File,
  options: UploadProductImageOptions,
): Promise<UploadedImage> {
  const folder = [PRODUCT_MEDIA_ROOT, options.productId, options.location].join(
    "/",
  );

  return uploadImage(file, {
    folder,
    alt: options.alt,
  });
}

export async function uploadContentImage(
  file: File,
  options: UploadContentImageOptions,
): Promise<UploadedImage> {
  const folder = [CONTENT_MEDIA_ROOT, options.location, options.contentId].join(
    "/",
  );

  return uploadImage(file, {
    folder,
    alt: options.alt,
  });
}

export async function deleteProductImage(publicId: string): Promise<void> {
  return deleteManagedImage(publicId, PRODUCT_MEDIA_ROOT);
}

export async function deleteContentImage(publicId: string): Promise<void> {
  return deleteManagedImage(publicId, CONTENT_MEDIA_ROOT);
}

export async function deleteProductImages(publicIds: string[]): Promise<void> {
  const uniquePublicIds = [...new Set(publicIds)];

  if (uniquePublicIds.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    uniquePublicIds.map((publicId) => deleteProductImage(publicId)),
  );

  const failedResults = results.filter(
    (result) => result.status === "rejected",
  );

  if (failedResults.length > 0) {
    throw new AppError(
      "Sebagian gambar gagal dihapus dari penyimpanan.",
      "IMAGE_BATCH_DELETE_FAILED",
      502,
    );
  }
}
