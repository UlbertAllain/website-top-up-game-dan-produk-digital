import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  removeContentItemMedia,
  setContentItemMedia,
} from "@/features/content/content.service";
import { getAltText, getImageFile } from "@/features/media/media.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readFormData } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContentMediaRouteContext = {
  params: Promise<{
    kind: string;
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: ContentMediaRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { kind, id } = await context.params;

    const formData = await readFormData(request);

    const file = getImageFile(formData.get("file"));

    const alt = getAltText(formData.get("alt"));

    const item = await setContentItemMedia(kind, id, file, alt);

    return successResponse({
      item,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: ContentMediaRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { kind, id } = await context.params;

    const item = await removeContentItemMedia(kind, id);

    return successResponse({
      item,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
