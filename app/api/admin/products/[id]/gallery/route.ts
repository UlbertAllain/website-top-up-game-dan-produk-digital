import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import { getAltText, getImageFile } from "@/features/media/media.service";
import {
  addProductGalleryImage,
  removeProductGalleryImage,
} from "@/features/products/product.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readFormData, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const removeGalleryImageSchema = z.strictObject({
  publicId: z
    .string()
    .trim()
    .min(1, "Public ID gambar wajib tersedia.")
    .max(500, "Public ID gambar terlalu panjang."),
});

type GalleryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: GalleryRouteContext) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    const formData = await readFormData(request);

    const file = getImageFile(formData.get("file"));

    const alt = getAltText(formData.get("alt"));

    const product = await addProductGalleryImage(id, file, alt);

    return successResponse(
      {
        product,
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: GalleryRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    const body = await readJson(request);

    const { publicId } = removeGalleryImageSchema.parse(body);

    const product = await removeProductGalleryImage(id, publicId);

    return successResponse({
      product,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
