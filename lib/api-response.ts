import { ZodError } from "zod";

import { AppError } from "@/lib/app-error";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",

  Pragma: "no-cache",

  Expires: "0",
};

export function successResponse<T>(data: T, status = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        success: false,

        error: {
          code: "VALIDATION_ERROR",

          message: "Data yang dikirim tidak valid.",

          fields: error.flatten().fieldErrors,
        },
      },
      {
        status: 422,

        headers: NO_STORE_HEADERS,
      },
    );
  }

  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,

        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.statusCode,

        headers: NO_STORE_HEADERS,
      },
    );
  }

  console.error("[UNHANDLED_SERVER_ERROR]", error);

  return Response.json(
    {
      success: false,

      error: {
        code: "INTERNAL_SERVER_ERROR",

        message: "Terjadi kesalahan pada server.",
      },
    },
    {
      status: 500,

      headers: NO_STORE_HEADERS,
    },
  );
}
