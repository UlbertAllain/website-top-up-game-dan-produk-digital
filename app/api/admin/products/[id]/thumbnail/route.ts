import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import { getAltText, getImageFile } from "@/features/media/media.service";
import {
  removeProductThumbnail,
  setProductThumbnail,
} from "@/features/products/product.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readFormData } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ThumbnailRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: ThumbnailRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    const formData = await readFormData(request);

    const file = getImageFile(formData.get("file"));

    const alt = getAltText(formData.get("alt"));

    const product = await setProductThumbnail(id, file, alt);

    return successResponse({
      product,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: ThumbnailRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    const product = await removeProductThumbnail(id);

    return successResponse({
      product,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
