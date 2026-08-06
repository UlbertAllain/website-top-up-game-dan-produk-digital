import { NextRequest } from "next/server";

import { AppError } from "@/lib/app-error";

const DEFAULT_MAX_JSON_SIZE = 100 * 1024;

const DEFAULT_MAX_FORM_SIZE = 6 * 1024 * 1024;

function assertContentLength(request: Request, maximumSize: number): void {
  const contentLengthHeader = request.headers.get("content-length");

  if (!contentLengthHeader) {
    return;
  }

  const contentLength = Number(contentLengthHeader);

  if (Number.isFinite(contentLength) && contentLength > maximumSize) {
    throw new AppError(
      "Ukuran data yang dikirim terlalu besar.",
      "REQUEST_BODY_TOO_LARGE",
      413,
    );
  }
}

export function assertSameOrigin(request: NextRequest): void {
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new AppError(
      "Permintaan lintas situs tidak diizinkan.",
      "CROSS_SITE_REQUEST_BLOCKED",
      403,
    );
  }

  const origin = request.headers.get("origin");

  const forwardedHost = request.headers.get("x-forwarded-host");

  const host =
    forwardedHost?.split(",")[0]?.trim() ?? request.headers.get("host");

  if (!origin || !host) {
    throw new AppError(
      "Sumber permintaan tidak dapat diverifikasi.",
      "INVALID_REQUEST_ORIGIN",
      403,
    );
  }

  let originHost: string;

  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError(
      "Origin permintaan tidak valid.",
      "INVALID_REQUEST_ORIGIN",
      403,
    );
  }

  if (originHost !== host) {
    throw new AppError(
      "Permintaan berasal dari sumber yang tidak diizinkan.",
      "INVALID_REQUEST_ORIGIN",
      403,
    );
  }
}

export async function readJson(
  request: Request,
  maximumSize = DEFAULT_MAX_JSON_SIZE,
): Promise<unknown> {
  assertContentLength(request, maximumSize);

  const contentType = request.headers.get("content-type");

  if (!contentType?.toLowerCase().includes("application/json")) {
    throw new AppError(
      "Content-Type harus application/json.",
      "INVALID_CONTENT_TYPE",
      415,
    );
  }

  try {
    return await request.json();
  } catch {
    throw new AppError(
      "Format body harus berupa JSON yang valid.",
      "INVALID_JSON_BODY",
      400,
    );
  }
}

export async function readFormData(
  request: Request,
  maximumSize = DEFAULT_MAX_FORM_SIZE,
): Promise<FormData> {
  assertContentLength(request, maximumSize);

  const contentType = request.headers.get("content-type");

  if (!contentType?.toLowerCase().startsWith("multipart/form-data")) {
    throw new AppError(
      "Content-Type harus multipart/form-data.",
      "INVALID_CONTENT_TYPE",
      415,
    );
  }

  try {
    return await request.formData();
  } catch {
    throw new AppError(
      "Form data tidak dapat diproses.",
      "INVALID_FORM_DATA",
      400,
    );
  }
}
