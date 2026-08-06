import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  createContentItem,
  listContentItems,
} from "@/features/content/content.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContentRouteContext = {
  params: Promise<{
    kind: string;
  }>;
};

export async function GET(request: NextRequest, context: ContentRouteContext) {
  try {
    await requireAdminApiSession();

    const { kind } = await context.params;

    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const items = await listContentItems(kind, {
      status,
    });

    return successResponse({
      items,
      total: items.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, context: ContentRouteContext) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { kind } = await context.params;

    const body = await readJson(request);

    const item = await createContentItem(kind, body);

    return successResponse(
      {
        item,
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
