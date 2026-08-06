import { NextRequest } from "next/server";

import {
  getSiteSettings,
  updateSiteSettings,
} from "@/features/settings/settings.service";
import { requireAdminApiSession } from "@/features/auth/auth-session";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApiSession();

    const settings = await getSiteSettings();

    return successResponse({
      settings,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const body = await readJson(request);

    const settings = await updateSiteSettings(body);

    return successResponse({
      settings,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
