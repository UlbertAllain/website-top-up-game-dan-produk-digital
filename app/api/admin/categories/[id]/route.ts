import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/features/categories/category.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

type CategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: CategoryRouteContext,
) {
  try {
    await requireAdminApiSession();

    const { id } = await context.params;

    const category = await getCategory(id);

    return successResponse({
      category,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: CategoryRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;
    const body = await readJson(request);

    const category = await updateCategory(id, body);

    return successResponse({
      category,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: CategoryRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    await deleteCategory(id);

    return successResponse({
      deleted: true,
      categoryId: id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
