import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  createCategory,
  listCategories,
} from "@/features/categories/category.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export async function GET(request: NextRequest) {
  try {
    await requireAdminApiSession();

    const searchParams = request.nextUrl.searchParams;

    const type = searchParams.get("type") ?? undefined;

    const status = searchParams.get("status") ?? undefined;

    const categories = await listCategories({
      type: type as
        | "top_up"
        | "game_account"
        | "subscription"
        | "phone_number"
        | undefined,

      status: status as "active" | "inactive" | undefined,
    });

    return successResponse({
      categories,
      total: categories.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const body = await readJson(request);

    const category = await createCategory(body);

    return successResponse(
      {
        category,
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
