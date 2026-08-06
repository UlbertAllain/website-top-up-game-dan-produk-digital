import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  getContentPage,
  updateContentPage,
} from "@/features/content/content.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, context: PageRouteContext) {
  try {
    await requireAdminApiSession();

    const { slug } = await context.params;

    const page = await getContentPage(slug);

    return successResponse({
      page,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: PageRouteContext) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { slug } = await context.params;

    const body = await readJson(request);

    const page = await updateContentPage(slug, body);

    return successResponse({
      page,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
