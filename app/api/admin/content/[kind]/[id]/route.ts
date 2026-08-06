import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  deleteContentItem,
  getContentItem,
  updateContentItem,
} from "@/features/content/content.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContentDetailRouteContext = {
  params: Promise<{
    kind: string;
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: ContentDetailRouteContext,
) {
  try {
    await requireAdminApiSession();

    const { kind, id } = await context.params;

    const item = await getContentItem(kind, id);

    return successResponse({
      item,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: ContentDetailRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { kind, id } = await context.params;

    const body = await readJson(request);

    const item = await updateContentItem(kind, id, body);

    return successResponse({
      item,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: ContentDetailRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { kind, id } = await context.params;

    await deleteContentItem(kind, id);

    return successResponse({
      deleted: true,
      contentId: id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
